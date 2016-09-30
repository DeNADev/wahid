/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 DeNA Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// <reference path="base.js"/>
/// <reference path="object.js"/>
/// <reference path="shadow.js"/>
/// <reference path="bounding_box.js"/>
/// <reference path="color.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="transform.js"/>
/// <reference path="point.js"/>

/**
 * An abstract class that renders shapes and objects to an HTMLCanvasElement
 * object.
 * @param {HTMLCanvasElement} canvas
 * @param {number} width
 * @param {number} height
 * @constructor
 */
createjs.Renderer = function(canvas, width, height) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /**
   * The output <canvas> element.
   * @type {HTMLCanvasElement}
   * @private
   */
  this.canvas_ = canvas;

  /**
   * The current width of the output <canvas> element.
   * @type {number}
   * @private
   */
  this.width_ = width;

  /**
   * The current height of the output <canvas> element.
   * @type {number}
   * @private
   */
  this.height_ = height;
};

/**
 * Whether this renderer applies workarounds for Android browsers.
 * @type {number}
 * @private
 */
createjs.Renderer.prototype.useAndroidWorkarounds_ = -1;

/**
 * The ratio of a point in this renderer to one of CSS.
 * @type {createjs.Point}
 * @private
 */
createjs.Renderer.prototype.cssRatio_ = null;

/**
 * Composite operations.
 * @enum {number}
 */
createjs.Renderer.Composition = {
  SOURCE_OVER: 0,
  SOURCE_ATOP: 1,
  SOURCE_IN: 2,
  SOURCE_OUT: 3,
  DESTINATION_OVER: 4,
  DESTINATION_ATOP: 5,
  DESTINATION_IN: 6,
  DESTINATION_OUT: 7,
  LIGHTER: 8,
  COPY: 9,
  XOR: 10,
  DARKER: 11,
  MULTIPLY: 12,
  MASK: 15
};

/**
 * Mask methods.
 * @enum {number}
 */
createjs.Renderer.Mask = {
  SCISSOR: 1,
  COMPOSE: 2,
  SHOW: 3,
  HIDE: 4
};

/**
 * Color formats used by WebGLTextures.
 * @enum {number}
 */
createjs.Renderer.Format = {
  RGBA8888: 0,
  RGBA4444: 1
};

/**
 * Extensions.
 * @enum {number}
 */
createjs.Renderer.Extension = {
  VIDEO: 1 << 0
};

/**
 * Returns the composition ID associated with the specified name.
 * @param {string} name
 * @return {number}
 */
createjs.Renderer.getCompositionKey = function(name) {
  var KEYS = {
    'source-over': createjs.Renderer.Composition.SOURCE_OVER,
    'source-atop': createjs.Renderer.Composition.SOURCE_ATOP,
    'source-in': createjs.Renderer.Composition.SOURCE_IN,
    'source-out': createjs.Renderer.Composition.SOURCE_OUT,
    'destination-over': createjs.Renderer.Composition.DESTINATION_OVER,
    'destination-atop': createjs.Renderer.Composition.DESTINATION_ATOP,
    'destination-in': createjs.Renderer.Composition.DESTINATION_IN,
    'destination-out': createjs.Renderer.Composition.DESTINATION_OUT,
    'lighter': createjs.Renderer.Composition.LIGHTER,
    'copy': createjs.Renderer.Composition.COPY,
    'xor': createjs.Renderer.Composition.XOR,
    'darker': createjs.Renderer.Composition.DARKER
  };
  return KEYS[name] || createjs.Renderer.Composition.SOURCE_OVER;
};

/**
 * Returns the composition name from the specified ID.
 * @param {number} key
 * @return {string}
 */
createjs.Renderer.getCompositionName = function(key) {
  var NAMES = [
    'source-over',
    'source-atop',
    'source-in',
    'source-out',
    'destination-over',
    'destination-atop',
    'destination-in',
    'destination-out',
    'lighter',
    'copy',
    'xor',
    'darker',
    'multiply'
];
  return NAMES[key];
};

/**
 * An inner class used by createjs.Renderer objects to clip RenderObject
 * objects.
 * @param {createjs.Transform} transform
 * @param {createjs.BoundingBox} rectangle
 * @param {createjs.BoundingBox} box
 * @param {number} method
 * @param {number} composition
 * @param {createjs.Renderer.RenderObject} shape
 * @constructor
 */
createjs.Renderer.Clip =
    function(transform, rectangle, box, method, composition, shape) {
  /// <param type="createjs.Transform" name="transform"/>
  /// <param type="createjs.BoundingBox" name="rectangle"/>
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <param type="number" name="method"/>
  /// <param type="number" name="composition"/>
  /// <param type="createjs.Renderer.RenderObject" name="shape"/>
  /**
   * An affine transformation applied to a clipping rectangle.
   * @const {createjs.Transform}
   * @private
   */
  this.transform_ = transform;

  /**
   * A clipping rectangle in the local coordinate.
   * @const {createjs.Rectangle}
   * @private
   */
  this.rectangle_ = new createjs.Rectangle(rectangle.getLeft(),
                                           rectangle.getTop(),
                                           rectangle.getWidth(),
                                           rectangle.getHeight());

  /**
   * A clipping rectangle in the global coordinate.
   * @const {createjs.BoundingBox}
   * @private
   */
  this.box_ = createjs.Renderer.Clip.cloneBox(box);

  /**
   * A method used for applying this clip to a render object.
   * rectangle.
   * @const {number}
   * @private
   */
  this.method_ = method;

  /**
   * A composition operation used in rendering the clipped image.
   * @const {number}
   * @private
   */
  this.composition_ = composition;

  /**
   * A render object that renders this clip.
   * @const {createjs.Renderer.RenderObject}
   * @private
   */
  this.shape_ =
      (method > createjs.Renderer.Mask.SCISSOR) ? shape : null;
};

/**
 * Returns a clone of the specified box.
 * @param {createjs.BoundingBox} box
 * @return {createjs.BoundingBox}
 */
createjs.Renderer.Clip.cloneBox = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <returns type="createjs.BoundingBox"/>
  var clone = new createjs.BoundingBox();
  clone.minX = createjs.truncate(box.minX) + 1;
  clone.minY = createjs.truncate(box.minY);
  clone.maxX = createjs.truncate(box.maxX);
  clone.maxY = createjs.truncate(box.maxY);
  return clone;
};

/**
 * Returns the affine transformation.
 * @return {createjs.Transform}
 * @const
 */
createjs.Renderer.Clip.prototype.getTransform = function() {
  /// <returns type="createjs.Transform"/>
  return this.transform_;
};

/**
 * Returns the clipping rectangle.
 * @return {createjs.Rectangle}
 * @const
 */
createjs.Renderer.Clip.prototype.getRectangle = function() {
  /// <returns type="createjs.Rectangle"/>
  return this.rectangle_;
};

/**
 * Returns the bounding box.
 * @return {createjs.BoundingBox}
 * @const
 */
createjs.Renderer.Clip.prototype.getBox = function() {
  /// <returns type="createjs.BoundingBox"/>
  return this.box_;
};

/**
 * Returns the clipping method.
 * @return {number}
 * @const
 */
createjs.Renderer.Clip.prototype.getMethod = function() {
  /// <returns type="number"/>
  // Disable this clip when it is invisible to avoid a crash in rendering an
  // invisible shape. (A tween may set an empty shape to this mask.)
  if (this.shape_ && !this.shape_.isVisible()) {
    return 0;
  }
  return this.method_;
};

/**
 * Returns whether a renderer has to compose this clip to a render object.
 * @return {boolean}
 * @const
 */
createjs.Renderer.Clip.prototype.isCompose = function() {
  /// <returns type="boolean"/>
  return this.method_ == createjs.Renderer.Mask.COMPOSE;
};

/**
 * Returns whether a renderer should show a render object without applying this
 * clip.
 * @return {boolean}
 * @const
 */
createjs.Renderer.Clip.prototype.isShow = function() {
  /// <returns type="boolean"/>
  return this.method_ == createjs.Renderer.Mask.SHOW;
};

/**
 * Returns whether this clip can use its bounding box as a scissor box.
 * @return {number}
 * @const
 */
createjs.Renderer.Clip.prototype.getComposition = function() {
  /// <returns type="number"/>
  return this.composition_;
};

/**
 * Returns a display object used as a mask.
 * @return {createjs.Renderer.RenderObject}
 * @const
 */
createjs.Renderer.Clip.prototype.getShape = function() {
  /// <returns type="createjs.Renderer.RenderObject"/>
  return this.shape_;
};

/**
 * An interface used by a renderer object to draw objects registered with the
 * paintObject() method.
 * @interface
 */
createjs.Renderer.RenderObject = function() {};

/**
 * Returns whether this object needs a redraw.
 * @param {createjs.BoundingBox} box
 * @return {boolean}
 */
createjs.Renderer.RenderObject.prototype.isDirtyObject = function(box) {
  /// <returns type="createjs.BoundingBox"/>
};

/**
 * Returns the bounding box of this object in the global coordinate system.
 * @return {createjs.BoundingBox}
 */
createjs.Renderer.RenderObject.prototype.getRenderBox = function() {
  /// <returns type="createjs.BoundingBox"/>
};

/**
 * Returns a createjs.Renderer.Clip object associated with this object.
 * @return {createjs.Renderer.Clip}
 */
createjs.Renderer.RenderObject.prototype.getClip = function() {
  /// <returns type="createjs.Renderer.Clip"/>
};

/**
 * Starts painting this object.
 * @param {createjs.Renderer} renderer
 */
createjs.Renderer.RenderObject.prototype.beginPaintObject =
    function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
};

/**
 * Paints an object.
 * @param {createjs.Renderer} renderer
 */
createjs.Renderer.RenderObject.prototype.paintObject = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
};

/**
 * Calculates the ratio of a point in this renderer to one of CSS. When this
 * renderer has its <canvas> element applied CSS transforms, this ratio does not
 * become (1, 1) to (1, 1). This method retrieves the computed rectangle from a
 * browser and calculates it.
 * @private
 */
createjs.Renderer.prototype.calculateRatio_ = function() {
  var canvas = this.getCanvas();
  var bounds = canvas.getBoundingClientRect();
  var zoom = window.getComputedStyle(canvas).zoom;
  this.cssRatio_ = new createjs.Point(
      bounds.width * zoom / this.width_, bounds.height * zoom / this.height_);
};

/**
 * Synchronizes the width property of this renderer with the specified one.
 * @param {number} width
 * @protected
 * @const
 */
createjs.Renderer.prototype.setWidth = function(width) {
  /// <param type="number" name="width"/>
  this.width_ = width;
};

/**
 * Synchronizes the height properties of this renderer with the specified one.
 * @param {number} height
 * @protected
 * @const
 */
createjs.Renderer.prototype.setHeight = function(height) {
  /// <param type="number" name="height"/>
  this.height_ = height;
};

/**
 * Resets the HTMLCanvasElement object attached to this renderer.
 * @protected
 * @const
 */
createjs.Renderer.prototype.resetCanvas = function() {
  if (this.canvas_) {
    this.canvas_.width = 0;
    this.canvas_ = null;
  }
};

/**
 * Updates the layout of the HTMLCanvasElement object attached to this renderer.
 * @param {string} context
 * @suppress {uselessCode}
 * @protected
 * @const
 */
createjs.Renderer.prototype.updateCanvas = function(context) {
  /// <param type="string" name="context"/>
  if (this.useAndroidWorkarounds_ < 0) {
    this.useAndroidWorkarounds_ =
        createjs.Config.useAndroidWorkarounds(context);
  }
  var canvas = this.getCanvas();
  if (this.useAndroidWorkarounds_ == 1) {
    var display = canvas.style.display;
    if (display != 'none') {
      canvas.style.display = 'none';
      canvas.offsetHeight;
      canvas.style.display = display;
    }
  } else if (this.useAndroidWorkarounds_) {
    canvas.width = canvas.width;
  }
};

/**
 * Destroys the resources attached to this renderer.
 */
createjs.Renderer.prototype.destroy = function() {
  createjs.notReached();
};

/**
 * Returns the HTMLCanvasElement object attached to this renderer.
 * @return {HTMLCanvasElement}
 * @const
 */
createjs.Renderer.prototype.getCanvas = function() {
  /// <returns type="HTMLCanvasElement"/>
  return this.canvas_;
};

/**
 * Returns the width.
 * @return {number}
 * @const
 */
createjs.Renderer.prototype.getWidth = function() {
  /// <returns type="number"/>
  return this.width_;
};

/**
 * Returns the height.
 * @return {number}
 * @const
 */
createjs.Renderer.prototype.getHeight = function() {
  /// <returns type="number"/>
  return this.height_;
};

/**
 * Returns the ratio of a point in this renderer to one of CSS.
 * @return {createjs.Point}
 * @const
 */
createjs.Renderer.prototype.getCSSRatio = function() {
  /// <returns type="createjs.Point"/>
  if (!this.cssRatio_) {
    this.calculateRatio_();
  }
  return this.cssRatio_;
};

/**
 * Sets an affine transformation.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} tx
 * @param {number} ty
 */
createjs.Renderer.prototype.setTransformation = function(a, b, c, d, tx, ty) {
  /// <param type="number" name="a"/>
  /// <param type="number" name="b"/>
  /// <param type="number" name="c"/>
  /// <param type="number" name="d"/>
  /// <param type="number" name="tx"/>
  /// <param type="number" name="ty"/>
  createjs.notReached();
};

/**
 * Sets the alpha value.
 * @param {number} alpha
 */
createjs.Renderer.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  createjs.notReached();
};

/**
 * Sets the color matrix.
 * @param {Array.<number>} matrix
 */
createjs.Renderer.prototype.setColorMatrix = function(matrix) {
  /// <param type="Array" elementType="number" name="matrix"/>
};

/**
 * Sets the color-composition operation.
 * @param {number} operation
 */
createjs.Renderer.prototype.setComposition = function(operation) {
  /// <param type="number" name="operation"/>
  createjs.notReached();
};

/**
 * Draws an HTMLCanvasElement object to the specified rectangle.
 * @param {HTMLCanvasElement} canvas
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
createjs.Renderer.prototype.drawCanvas = function(canvas, x, y, width, height) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  createjs.notReached();
};

/**
 * Returns a bit-mask representing the extensions supported by this renderer.
 * @return {number}
 */
createjs.Renderer.prototype.getExtensions = function() {
  /// <returns type="number"/>
  return createjs.Renderer.Extension.VIDEO;
};

/**
 * Draws an HTMLVideoElement object to the specified rectangle.
 * @param {HTMLVideoElement} video
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
createjs.Renderer.prototype.drawVideo = function(video, x, y, width, height) {
  /// <param type="HTMLVideoElement" name="video"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  createjs.notReached();
};

/**
 * Draws a part of an HTMLImageElement object to the specified rectangle.
 * @param {HTMLImageElement} image
 * @param {number} srcX
 * @param {number} srcY
 * @param {number} srcWidth
 * @param {number} srcHeight
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
createjs.Renderer.prototype.drawPartial =
    function(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="number" name="srcX"/>
  /// <param type="number" name="srcY"/>
  /// <param type="number" name="srcWidth"/>
  /// <param type="number" name="srcHeight"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  createjs.notReached();
};

/**
 * Adds an object to the rendering queue.
 * @param {createjs.Renderer.RenderObject} object
 */
createjs.Renderer.prototype.addObject = function(object) {
  /// <param type="createjs.Renderer.RenderObject" name="object"/>
  // This method is used for calculating clipping rectangles, i.e. this method
  // should not call createjs.notReached().
};

/**
 * Deletes the cache for the specified image.
 * @param {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} image
 */
createjs.Renderer.prototype.uncache = function(image) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLVideoElement" name="video"/>
  /// </signature>
};

/**
 * Starts paints objects.
 */
createjs.Renderer.prototype.begin = function() {
};

/**
 * Paints objects added to this renderer. This method returns true if this
 * renderer actually draws objects.
 * @param {number} time
 */
createjs.Renderer.prototype.paint = function(time) {
  /// <param type="number" name="time"/>
  createjs.notReached();
};

if (createjs.DEBUG) {
  /**
   * Adds a dirty object to another renderer.
   * @param {createjs.Renderer.RenderObject} object
   */
  createjs.Renderer.prototype.addDirtyObject = function(object) {
    /// <param type="createjs.Renderer.RenderObject" name="object"/>
  };
}
