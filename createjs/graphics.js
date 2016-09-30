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
/// <reference path="bounding_box.js"/>
/// <reference path="counter.js"/>
/// <reference path="base64.js"/>
/// <reference path="config.js"/>

/**
 * A class that exposes an easy-to-use API for generating vector drawing
 * commands. This class draws vector-drawing commands to a memory bitmap with
 * the Canvas 2D API so createjs.Renderer objects can use it.
 * @extends {createjs.Object}
 * @constructor
 */
createjs.Graphics = function() {
  createjs.Object.call(this);

  /**
   * The bounding box of this graphics.
   * @type {createjs.BoundingBox}
   */
  this.box = new createjs.BoundingBox();

  /**
   * A list of all paths.
   * @type {Array.<createjs.Graphics.Command>}
   * @private
   */
  this.path_ = [];

  /**
   * The current path.
   * @type {Array.<createjs.Graphics.Command>}
   * @private
   */
  this.active_ = [];
};
createjs.inherits('Graphics', createjs.Graphics, createjs.Object);

/**
 * The maximum width allowed for cache <canvas> elements.
 * @define {number}
 */
createjs.Graphics.MAX_WIDTH = 128;

/**
 * The maximum height allowed for cache <canvas> elements.
 * @define {number}
 */
createjs.Graphics.MAX_HEIGHT = 128;

/**
 * The renderer that renders its paths to a cache.
 * @type {createjs.Graphics.CanvasRenderer}
 * @private
 */
createjs.Graphics.prototype.renderer_ = null;

/**
 * An ID associated with the renderer object.
 * @type {string}
 * @private
 */
createjs.Graphics.prototype.key_ = '';

/**
 * Whether this graphics needs to update its cache.
 * @type {boolean}
 * @private
 */
createjs.Graphics.prototype.redraw_ = false;

/**
 * Whether this object needs to update its paths.
 * @type {boolean}
 * @private
 */
createjs.Graphics.prototype.dirty_ = false;

/**
 * A command that starts a stroke path.
 * @type {createjs.Graphics.Command}
 * @private
 */
createjs.Graphics.prototype.stroke_ = null;

/**
 * A style of a stroke path.
 * @type {createjs.Graphics.LineStyle}
 * @private
 */
createjs.Graphics.prototype.style_ = null;

/**
 * A command that starts a fill path.
 * @type {createjs.Graphics.Command}
 * @private
 */
createjs.Graphics.prototype.fill_ = null;

/**
 * A margin size added around this graphics to prevent it from being clipped.
 * @type {number}
 * @private
 */
createjs.Graphics.prototype.margin_ = 0;

/**
/**
 * An inner class that renders graphic commands with the Canvas 2D API.
 * @param {number} flag
 * @constructor
 */
createjs.Graphics.CanvasRenderer = function(flag) {
  /// <param type="number" name="flag"/>
  /**
   * The output <canvas> element.
   * @type {HTMLCanvasElement}
   * @private
   */
  this.canvas_ = createjs.createCanvas();

  /**
   * The 2D rendering context attached to the output <canvas> element.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  this.context_ = createjs.getRenderingContext2D(this.canvas_);

  // Set the id property of this HTMLCanvasElement object on debug builds to
  // identify leaked objects.
  if (createjs.DEBUG) {
    this.canvas_.id = 'graphics' + createjs.Graphics.CanvasRenderer.id_++;
  }

  if (flag & 2) {
    // Use a low-color texture for masks to save memory.
    this.canvas_.format_ = createjs.Renderer.Format.RGBA4444;
  }
};

if (createjs.DEBUG) {
  /**
   * An ID assigned to CanvasRenderer objects on debug builds.
   * @type {number}
   * @private
   */
  createjs.Graphics.CanvasRenderer.id_ = 0;
}

/**
 * The current width of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.width_ = 0;

/**
 * The current height of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.height_ = 0;

/**
 * The current horizontal scale.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.scaleX_ = 1;

/**
 * The current vertical scale.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.scaleY_ = 1;

/**
 * The reference count to this renderer.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.references_ = 1;

/**
 * The current line width of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.lineWidth_ = 1;

/**
 * The current line cap of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.lineCap_ = 0;

/**
 * The current corner type of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.lineJoin_ = 0;

/**
 * The current miter width of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.miterLimit_ = 10;

/**
 * The current color to fill the inside of a path.
 * @type {string}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.fillColor_ = '';

/**
 * The current color to stroke a path.
 * @type {string}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.strokeColor_ = '';

/**
 * The renderer that draws this object.
 * @type {createjs.Renderer}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.output_ = null;

/**
 * Deletes cached resources created by the output renderer.
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.uncache_ = function() {
  if (this.canvas_) {
    if (this.output_) {
      this.output_.uncache(this.canvas_);
      this.output_ = null;
    }
    this.canvas_.width = 0;
  }
  this.context_ = null;
  this.canvas_ = null;
};

/**
 * Increases the reference count to this renderer.
 * @return {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.addRef_ = function() {
  /// <returns type="number"/>
  return ++this.references_;
};

/**
 * Decreases the reference count to an object.
 * @return {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.release_ = function() {
  /// <returns type="number"/>
  var references = --this.references_;
  if (references <= 0) {
    this.uncache_();
  }
  return references;
};

/**
 * Attaches a createjs.Renderer object that draws this object.
 * @param {createjs.Renderer} renderer
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setOutput_ = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  this.output_ = renderer;
};

/**
 * Returns the HTMLCanvasElement object attached to this renderer.
 * @return {HTMLCanvasElement}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.getCanvas_ = function() {
  /// <returns type="HTMLCanvasElement"/>
  return this.canvas_;
};

/**
 * Sets the fill color.
 * @param {string} color
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setFillColor_ = function(color) {
  /// <param type="string" name="color"/>
  if (this.fillColor_ != color) {
    this.fillColor_ = color;
    this.context_.fillStyle = color;
  }
};

/**
 * Creates a linear gradient.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {CanvasGradient}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.createLinearGradient_ =
    function(colors, stops, x0, y0, x1, y1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="number"/>
  var gradient = this.context_.createLinearGradient(x0, y0, x1, y1);
  for (var i = 0; i < colors.length; ++i) {
    gradient.addColorStop(stops[i], colors[i]);
  }
  return gradient;
};

/**
 * Creates a radial gradient.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @return {CanvasGradient}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.createRadialGradient_ =
    function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="r0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="r1"/>
  /// <returns type="number"/>
  var gradient = this.context_.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (var i = 0; i < colors.length; ++i) {
    gradient.addColorStop(stops[i], colors[i]);
  }
  return gradient;
};

/**
 * Sets the fill gradient.
 * @param {CanvasGradient} gradient
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setFillGradient_ =
    function(gradient) {
  /// <param type="CanvasGradient" name="gradient"/>
  this.context_.fillStyle = gradient;
  this.fillColor_ = '';
};

/**
 * Sets the fill pattern.
 * @param {HTMLImageElement} image
 * @param {string} repeat
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setFillPattern_ =
    function(image, repeat) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="string" name="repeat"/>
  var pattern = this.context_.createPattern(image, repeat);
  this.context_.fillStyle = pattern;
  this.fillColor_ = '';
};

/**
 * Sets the all stroke styles.
 * @param {number} lineWidth
 * @param {number} lineCap
 * @param {number} lineJoin
 * @param {number} miterLimit
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setStrokeStyles_ =
    function(lineWidth, lineCap, lineJoin, miterLimit) {
  /// <param type="number" name="lineWidth"/>
  /// <param type="number" name="lineCap"/>
  /// <param type="number" name="lineJoin"/>
  /// <param type="number" name="miterLimit"/>
  if (this.lineWidth_ != lineWidth) {
    this.lineWidth_ = lineWidth;
    this.context_.lineWidth = lineWidth;
  }
  if (this.lineCap_ != lineCap) {
    this.lineCap_ = lineCap;
    var LINE_CAPS = ['butt', 'round', 'square'];
    this.context_.lineCap = LINE_CAPS[lineCap];
  }
  if (this.lineJoin_ != lineJoin) {
    this.lineJoin_ = lineJoin;
    var LINE_JOINS = ['miter', 'round', 'bevel'];
    this.context_.lineJoin = LINE_JOINS[lineJoin];
  }
  if (this.miterLimit_ != miterLimit) {
    this.miterLimit_ = miterLimit;
    this.context_.miterLimit = miterLimit;
  }
};

/**
 * Sets the stroke color.
 * @param {string} color
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setStrokeColor_ =
    function(color) {
  /// <param type="string" name="color"/>
  if (this.strokeColor_ != color) {
    this.strokeColor_ = color;
    this.context_.strokeStyle = color;
  }
};

/**
 * Sets the stroke gradient.
 * @param {CanvasGradient} gradient
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setStrokeGradient_ =
    function(gradient) {
  /// <param type="CanvasGradient" name="gradient"/>
  this.context_.strokeStyle = gradient;
  this.strokeColor_ = '';
};

/**
 * Sets the stroke pattern.
 * @param {HTMLImageElement} image
 * @param {string} repeat
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setStrokePattern_ =
    function(image, repeat) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="string" name="repeat"/>
  var pattern = this.context_.createPattern(image, repeat);
  this.context_.strokeStyle = pattern;
  this.strokeColor_ = '';
};

/**
 * Sets the bounding box of drawing paths.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.setBox_ =
    function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  // To prevent creating huge <canvas> elements, limit the width of the cache
  // and its height to 128 so the size of a cache <canvas> element is less than
  // 128 * 128 * 4 = 64 KB.
  this.scaleX_ = 1;
  if (width > createjs.Graphics.MAX_WIDTH) {
    this.scaleX_ = createjs.Graphics.MAX_WIDTH / width;
    x *= this.scaleX_;
    width = createjs.Graphics.MAX_WIDTH;
  }
  this.scaleY_ = 1;
  if (height > createjs.Graphics.MAX_HEIGHT) {
    this.scaleY_ = createjs.Graphics.MAX_HEIGHT / height;
    y *= this.scaleY_;
    height = createjs.Graphics.MAX_HEIGHT;
  }
  if (this.width_ != width) {
    this.width_ = width;
    this.canvas_.width = width;
  }
  if (this.height_ != height) {
    this.height_ = height;
    this.canvas_.height = height;
  }
  this.context_.setTransform(this.scaleX_, 0, 0, this.scaleY_, -x, -y);
  this.context_.clearRect(0, 0, width, height);
};

/**
 * Returns whether the specified point is opaque. This method currently
 * returns the alpha value at the specified point.
 * @param {number} x
 * @param {number} y
 * @return {number}
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.hitTestObject_ = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="number"/>
  var context = this.context_;
  if (context) {
    x *= this.scaleX_;
    y *= this.scaleY_;
    var pixels = context.getImageData(
        createjs.truncate(x), createjs.truncate(y), 1, 1);
    return pixels.data[3];
  }
  return 0;
};

/**
 * Creates a new drawing path.
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathBegin_ = function() {
  this.context_.beginPath();
};

/**
 * Moves the drawing point.
 * @param {number} x
 * @param {number} y
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathMoveTo_ = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  this.context_.moveTo(x, y);
};

/**
 * Draws a line.
 * @param {number} x
 * @param {number} y
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathLineTo_ = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  this.context_.lineTo(x, y);
};

/**
 * Draws an arc with the specified control points and radius.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} radius
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathArcTo_ =
    function(x1, y1, x2, y2, radius) {
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="x2"/>
  /// <param type="number" name="y2"/>
  /// <param type="number" name="radius"/>
  this.context_.arcTo(x1, y1, x2, y2, radius);
};

/**
 * Draws an arc.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {boolean} counterClockwise
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathArc_ =
    function(x, y, radius, startAngle, endAngle, counterClockwise) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="radius"/>
  /// <param type="number" name="startAngle"/>
  /// <param type="number" name="endAngle"/>
  /// <param type="boolean" name="counterClockwise"/>
  this.context_.arc(x, y, radius, startAngle, endAngle, counterClockwise);
};

/**
 * Draws a quadratic bezier curve.
 * @param {number} cpx
 * @param {number} cpy
 * @param {number} x
 * @param {number} y
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathQuadraticCurveTo_ =
    function(cpx, cpy, x, y) {
  /// <param type="number" name="cpx"/>
  /// <param type="number" name="cpy"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  this.context_.quadraticCurveTo(cpx, cpy, x, y);
};

/**
 * Draws a cubic bezier curve.
 * @param {number} cp1x
 * @param {number} cp1y
 * @param {number} cp2x
 * @param {number} cp2y
 * @param {number} x
 * @param {number} y
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathCubicCurveTo_ =
    function(cp1x, cp1y, cp2x, cp2y, x, y) {
  /// <param type="number" name="cp1x"/>
  /// <param type="number" name="cp1y"/>
  /// <param type="number" name="cp2x"/>
  /// <param type="number" name="cp2y"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  this.context_.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
};

/**
 * Draws a rectangle.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathRect_ =
    function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.context_.rect(x, y, width, height);
};

/**
 * Closes the current path.
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.pathClose_ = function() {
  this.context_.closePath();
};

/**
 * Draws the current path.
 * @param {boolean} fill
 * @param {boolean} stroke
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.drawPath_ = function(fill, stroke) {
  /// <param type="boolean" name="fill"/>
  /// <param type="boolean" name="stroke"/>
  if (fill) {
    this.context_.fill();
  }
  if (stroke) {
    this.context_.stroke();
  }
};

/**
 * Finishes drawing all paths.
 * @private
 */
createjs.Graphics.CanvasRenderer.prototype.endPath_ = function() {
};

/**
 * An inner class that represents a linear gradient used by the
 * createjs.Graphics.FillLinear class and the createjs.Graphics.StrokeLinear
 * class.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @constructor
 */
createjs.Graphics.LinearGradient = function(colors, stops, x0, y0, x1, y1) {
  /**
   * @const {Array.<string>}
   * @private
   */
  this.colors_ = colors;

  /**
   * @const {Array.<number>}
   * @private
   */
  this.stops_ = stops;

  /**
   * @const {number}
   * @private
   */
  this.x0_ = x0;

  /**
   * @const {number}
   * @private
   */
  this.y0_ = y0;

  /**
   * @const {number}
   * @private
   */
  this.x1_ = x1;

  /**
   * @const {number}
   * @private
   */
  this.y1_ = y1;
};

/**
 * Creates a createjs.Graphics.LinaerGradient object.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {createjs.Graphics.LinearGradient}
 */
createjs.Graphics.LinearGradient.get = function(colors, stops, x0, y0, x1, y1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="createjs.Graphics.LinearGradient"/>
  return new createjs.Graphics.LinearGradient(colors, stops, x0, y0, x1, y1);
};

/**
 * Returns the CanvasGradient object attached to this object.
 * @param {createjs.Graphics.CanvasRenderer} renderer
 * @return {CanvasGradient}
 */
createjs.Graphics.LinearGradient.prototype.getGradient = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  /// <returns type="CanvasGradient"/>
  return renderer.createLinearGradient_(
      this.colors_, this.stops_, this.x0_, this.y0_, this.x1_, this.y1_);
};

/**
 * Returns the string representation of this object.
 * @return {string}
 */
createjs.Graphics.LinearGradient.prototype.getText = function() {
  /// <returns type="string"/>
  return this.colors_.join() + ',' + this.stops_.join() + ',' +
      this.x0_ + ',' + this.y0_ + ',' + this.x1_ + ',' + this.y1_;
};

/**
 * An inner class that represents a radial gradient used by the
 * createjs.Graphics.FillRadial class and the createjs.Graphics.StrokeRadial
 * class.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @constructor
 */
createjs.Graphics.RadialGradient =
    function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /**
   * @const {Array.<string>}
   * @private
   */
  this.colors_ = colors;

  /**
   * @const {Array.<number>}
   * @private
   */
  this.stops_ = stops;

  /**
   * @const {number}
   * @private
   */
  this.x0_ = x0;

  /**
   * @const {number}
   * @private
   */
  this.y0_ = y0;

  /**
   * @const {number}
   * @private
   */
  this.r0_ = r0;

  /**
   * @const {number}
   * @private
   */
  this.x1_ = x1;

  /**
   * @const {number}
   * @private
   */
  this.y1_ = y1;

  /**
   * @const {number}
   * @private
   */
  this.r1_ = r1;
};

/**
 * Creates a createjs.Graphics.RadialGradient object.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @return {createjs.Graphics.RadialGradient}
 */
createjs.Graphics.RadialGradient.get =
    function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="createjs.Graphics.RadialGradient"/>
  return new createjs.Graphics.RadialGradient(
      colors, stops, x0, y0, r0, x1, y1, r1);
};

/**
 * Returns the CanvasGradient object attached to this object.
 * @param {createjs.Graphics.CanvasRenderer} renderer
 * @return {CanvasGradient}
 */
createjs.Graphics.RadialGradient.prototype.getGradient = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  /// <returns type="CanvasGradient"/>
  return renderer.createRadialGradient_(
      this.colors_, this.stops_,
      this.x0_, this.y0_, this.r0_, this.x1_, this.y1_, this.r1_);
};

/**
 * Returns the string representation of this object.
 * @return {string}
 */
createjs.Graphics.RadialGradient.prototype.getText = function() {
  /// <returns type="string"/>
  return this.colors_.join() + ',' + this.stops_.join() + ',' +
      this.x0_ + ',' + this.y0_ + ',' + this.r0_ + ',' +
      this.x1_ + ',' + this.y1_ + ',' + this.r1_;
};

/**
 * An inner interface used by the createjs.Graphics class to execute a drawing
 * command.
 * @interface
 */
createjs.Graphics.Command = function() {};

/**
 * Executes this drawing command, i.e. draws a shape to a cache <canvas>
 * element.
 * @param {createjs.Graphics.CanvasRenderer} renderer
 */
createjs.Graphics.Command.prototype.paint = function(renderer) {};

/**
 * Returns the string representation of this command. When this string is not
 * empty, the createjs.Graphics object adds its cache <canvas> element to a hash
 * table so createjs.Shape objects can share it. (A createjs.Shape object
 * generated by Flash creates a createjs.Graphics object in its constructor,
 * e.g. 100 createjs.Shape instances create 100 createjs.Graphics instances of
 * one shape. The createjs.Graphics object uses a hash table to shares such
 * createjs.Graphics instances.)
 * sharing Graphics objects generated by Flash.)
 * @return {string}
 */
createjs.Graphics.Command.prototype.getText = function() {};

/**
 * Returns this command does not have its string representation.
 * @return {string}
 */
createjs.Graphics.Command.getEmpty = function() {
  /// <returns type="string"/>
  return '';
};

/**
 * The known drawing-command names. (This object assigns non-empty strings only
 * for the drawing commands used by Flash.)
 * @enum {string}
 * @private
 */
createjs.Graphics.CommandName = {
  MOVE_TO: 'M',
  LINE_TO: '',
  ARC_TO: '',
  ARC: '',
  QUADRATIC_CURVE_TO: 'Q',
  CURVE_TO: '',
  RECT: '',
  BEGIN_PATH: '',
  CLOSE_PATH: 'C',
  FILL_COLOR: 'F',
  FILL_LINEAR: 'LF',
  FILL_RADIAL: 'RF',
  FILL_PATTERN: '',
  LINE_STYLE: 'L',
  STROKE_COLOR: 'S',
  STROKE_LINEAR: 'LS',
  STROKE_RADIAL: 'RS',
  STROKE_PATTERN: '',
  DRAW_PATH: 'P',
  DECODE_PATH: 'D'
};

/**
 * An inner class used by the createjs.Graphics class to move the current point.
 * @param {number} x
 * @param {number} y
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.MoveTo = function(x, y) {
  /**
   * The x coordinate of the move point.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of the move point.
   * @const {number}
   * @private
   */
  this.y_ = y;
};

/**
 * Creates a createjs.Graphics.MoveTo object.
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics.MoveTo}
 */
createjs.Graphics.MoveTo.get = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics.MoveTo"/>
  return new createjs.Graphics.MoveTo(x, y);
};

/** @override */
createjs.Graphics.MoveTo.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathMoveTo_(this.x_, this.y_);
};

/** @override */
createjs.Graphics.MoveTo.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.MOVE_TO + ',' + this.x_ + ',' + this.y_;
};

/**
 * An inner class used by the createjs.Graphics class to draw a line.
 * @param {number} x
 * @param {number} y
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.LineTo = function(x, y) {
  /**
   * The x coordinate of the end of this line.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of the end of this line.
   * @const {number}
   * @private
   */
  this.y_ = y;
};

/**
 * Creates a createjs.Graphics.LineTo object.
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics.LineTo}
 */
createjs.Graphics.LineTo.get = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics.LineTo"/>
  return new createjs.Graphics.LineTo(x, y);
};

/** @override */
createjs.Graphics.LineTo.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathLineTo_(this.x_, this.y_);
};

/** @override */
createjs.Graphics.LineTo.prototype.getText = createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to draw an arc between two
 * tangents.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} radius
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.ArcTo = function(x1, y1, x2, y2, radius) {
  /**
   * The x coordinate of the corner of this arc.
   * @const {number}
   * @private
   */
  this.x1_ = x1;

  /**
   * The x coordinate of the corner of this arc.
   * @const {number}
   * @private
   */
  this.y1_ = y1;

  /**
   * The x coordinate of the end of this arc.
   * @const {number}
   * @private
   */
  this.x2_ = x2;

  /**
   * The y coordinate of the end of this arc.
   * @const {number}
   * @private
   */
  this.y2_ = y2;

  /**
   * The radius of this arc.
   * @const {number}
   * @private
   */
  this.radius_ = radius;
};

/**
 * Creates a createjs.Graphics.ArcTo object.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} radius
 * @return {createjs.Graphics.ArcTo}
 */
createjs.Graphics.ArcTo.get = function(x1, y1, x2, y2, radius) {
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="x2"/>
  /// <param type="number" name="y2"/>
  /// <param type="number" name="radius"/>
  /// <returns type="createjs.Graphics.ArcTo"/>
  return new createjs.Graphics.ArcTo(x1, y1, x2, y2, radius);;
};

/** @override */
createjs.Graphics.ArcTo.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathArcTo_(this.x1_, this.y1_, this.x2_, this.y2_, this.radius_);
};

/** @override */
createjs.Graphics.ArcTo.prototype.getText = createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class that draws an arc.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {boolean} anticlockwise
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.Arc =
    function(x, y, radius, startAngle, endAngle, anticlockwise) {
  /**
   * The x coordinate of the center of this arc.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of the center of this arc.
   * @const {number}
   * @private
   */
  this.y_ = y;

  /**
   * The radius of this arc.
   * @const {number}
   * @private
   */
  this.radius_ = radius;

  /**
   * The start angle of this arc in radians.
   * @const {number}
   * @private
   */
  this.startAngle_ = startAngle;

  /**
   * The end angle of this arc in radians.
   * @const {number}
   * @private
   */
  this.endAngle_ = endAngle;

  /**
   * Whether the above angles represent counter-clockwise angles.
   * @const {boolean}
   * @private
   */
  this.anticlockwise_ = anticlockwise;
};

/**
 * Creates a createjs.Graphics.Arc object.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {boolean} anticlockwise
 * @return {createjs.Graphics.Arc}
 */
createjs.Graphics.Arc.get =
    function(x, y, radius, startAngle, endAngle, anticlockwise) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="radius"/>
  /// <param type="number" name="startAngle"/>
  /// <param type="number" name="endAngle"/>
  /// <param type="boolean" name="anticlockwise"/>
  /// <returns type="createjs.Graphics.Arc"/>
  return new createjs.Graphics.Arc(
      x, y, radius, startAngle, endAngle, anticlockwise);
};

/** @override */
createjs.Graphics.Arc.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathArc_(this.x_, this.y_, this.radius_,
                    this.startAngle_, this.endAngle_, this.anticlockwise_);
};

/** @override */
createjs.Graphics.Arc.prototype.getText = createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to draw a quadratic bezier
 * curve.
 * @param {number} cpx
 * @param {number} cpy
 * @param {number} x
 * @param {number} y
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.QuadraticCurveTo = function(cpx, cpy, x, y) {
  /**
   * The x coordinate of the control point of this curve.
   * @const {number}
   * @private
   */
  this.cpx_ = cpx;

  /**
   * The y coordinate of the control point of this curve.
   * @const {number}
   * @private
   */
  this.cpy_ = cpy;

  /**
   * The x coordinate of the end point of this curve.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of the end point of this curve.
   * @const {number}
   * @private
   */
  this.y_ = y;
};

/**
 * Creates a createjs.Graphics.QuadraticCurveTo object.
 * @param {number} cpx
 * @param {number} cpy
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics.QuadraticCurveTo}
 */
createjs.Graphics.QuadraticCurveTo.get = function(cpx, cpy, x, y) {
  /// <param type="number" name="cpx"/>
  /// <param type="number" name="cpy"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics.QuadraticCurveTo"/>
  return new createjs.Graphics.QuadraticCurveTo(cpx, cpy, x, y);
};

/** @override */
createjs.Graphics.QuadraticCurveTo.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathQuadraticCurveTo_(this.cpx_, this.cpy_, this.x_, this.y_);
};

/** @override */
createjs.Graphics.QuadraticCurveTo.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.QUADRATIC_CURVE_TO + ',' +
      this.cpx_ + ',' + this.cpy_ + ',' + this.x_ + ',' + this.y_;
};

/**
 * An inner class used by the createjs.Graphics class to draw a cubic bezier
 * curve.
 * @param {number} cp1x
 * @param {number} cp1y
 * @param {number} cp2x
 * @param {number} cp2y
 * @param {number} x
 * @param {number} y
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.CurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
  /**
   * The x coordinate of the first control point of this curve.
   * @const {number}
   * @private
   */
  this.cp1x_ = cp1x;

  /**
   * The y coordinate of the first control point of this curve.
   * @const {number}
   * @private
   */
  this.cp1y_ = cp1y;

  /**
   * The x coordinate of the second control point of this curve.
   * @const {number}
   * @private
   */
  this.cp2x_ = cp2x;

  /**
   * The y coordinate of the second control point of this curve.
   * @const {number}
   * @private
   */
  this.cp2y_ = cp2y;

  /**
   * The x coordinate of the end point of this curve.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of the end point of this curve.
   * @const {number}
   * @private
   */
  this.y_ = y;
};

/**
 * Creates a createjs.Graphics.CurveTo object.
 * @param {number} cp1x
 * @param {number} cp1y
 * @param {number} cp2x
 * @param {number} cp2y
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics.CurveTo}
 */
createjs.Graphics.CurveTo.get = function(cp1x, cp1y, cp2x, cp2y, x, y) {
  /// <param type="number" name="cp1x"/>
  /// <param type="number" name="cp1y"/>
  /// <param type="number" name="cp2x"/>
  /// <param type="number" name="cp2y"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics.CurveTo"/>
  return new createjs.Graphics.CurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
};

/** @override */
createjs.Graphics.CurveTo.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathCubicCurveTo_(
      this.cp1x_, this.cp1y_, this.cp2x_, this.cp2y_, this.x_, this.y_);
};

/** @override */
createjs.Graphics.CurveTo.prototype.getText =
    createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to draw a rectangle.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.Rect = function(x, y, width, height) {
  /**
   * The x coordinate of the top-left corner of this rectangle.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of the top-left corner of this rectangle.
   * @const {number}
   * @private
   */
  this.y_ = y;

  /**
   * The width of this rectangle.
   * @const {number}
   * @private
   */
  this.width_ = width;

  /**
   * The height of this rectangle.
   * @const {number}
   * @private
   */
  this.height_ = height;
};

/**
 * Creates a createjs.Graphics.Rect object.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {createjs.Graphics.Rect}
 */
createjs.Graphics.Rect.get = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="createjs.Graphics.Rect"/>
  return new createjs.Graphics.Rect(x, y, width, height);
};

/** @override */
createjs.Graphics.Rect.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathRect_(this.x_, this.y_, this.width_, this.height_);
};

/** @override */
createjs.Graphics.Rect.prototype.getText =
    createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to start a drawing path.
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.BeginPath = function() {
};

/**
 * The lazy instance of the createjs.Graphics.BeginPath object. (The
 * createjs.Graphics.BeginPath object does not have parameters, i.e. the
 * createjs.Graphics object can re-use one createjs.Graphics.BeginPath object.)
 * @type {createjs.Graphics.BeginPath}
 * @private
 */
createjs.Graphics.BeginPath.instance_ = null;

/**
 * Creates a createjs.Graphics.BeginPath object. This method actually returns
 * the lazy instance of the createjs.Graphics.BeginPath object.
 * @return {createjs.Graphics.BeginPath}
 */
createjs.Graphics.BeginPath.get = function() {
  if (!createjs.Graphics.BeginPath.instance_) {
    createjs.Graphics.BeginPath.instance_ = new createjs.Graphics.BeginPath();
  }
  return createjs.Graphics.BeginPath.instance_;
};

/** @override */
createjs.Graphics.BeginPath.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathBegin_();
};

/** @override */
createjs.Graphics.BeginPath.prototype.getText =
    createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to finish a drawing path.
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.ClosePath = function() {
};

/**
 * The lazy instance of the createjs.Graphics.ClosePath object.
 * @type {createjs.Graphics.ClosePath}
 * @private
 */
createjs.Graphics.ClosePath.instance_ = null;

/**
 * Creates a createjs.Graphics.ClosePath object. This method actually returns
 * the lazy instance of the createjs.Graphics.ClosePath object.
 * @return {createjs.Graphics.ClosePath}
 */
createjs.Graphics.ClosePath.get = function() {
  if (!createjs.Graphics.ClosePath.instance_) {
    createjs.Graphics.ClosePath.instance_ = new createjs.Graphics.ClosePath();
  }
  return createjs.Graphics.ClosePath.instance_;
};

/** @override */
createjs.Graphics.ClosePath.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.pathClose_();
};

/** @override */
createjs.Graphics.ClosePath.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.CLOSE_PATH;
};

/**
 * An inner class used by the createjs.Graphics class to set a fill color.
 * @param {string} color
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.FillColor = function(color) {
  /**
   * The fill color.
   * @const {string}
   * @private
   */
  this.color_ = color;
};

/**
 * Creates a createjs.Graphics.FillColor object.
 * @param {string} color
 * @return {createjs.Graphics.FillColor}
 */
createjs.Graphics.FillColor.get = function(color) {
  /// <param type="string" name="color"/>
  /// <returns type="createjs.Graphics.FillColor"/>
  return new createjs.Graphics.FillColor(color);
};

/** @override */
createjs.Graphics.FillColor.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setFillColor_(this.color_);
};

/** @override */
createjs.Graphics.FillColor.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.FILL_COLOR + this.color_;
};

/**
 * An inner class used by the createjs.Graphics class to create a linear
 * gradient.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.FillLinear = function(colors, stops, x0, y0, x1, y1) {
  /**
   * The spooled linear-gradient object.
   * @const {createjs.Graphics.LinearGradient}
   * @private
   */
  this.gradient_ =
      createjs.Graphics.LinearGradient.get(colors, stops, x0, y0, x1, y1);
};

/**
 * Creates a createjs.Graphics.FillLinaer object.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {createjs.Graphics.FillLinear}
 */
createjs.Graphics.FillLinear.get = function(colors, stops, x0, y0, x1, y1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="createjs.Graphics.FillLinear"/>
  return new createjs.Graphics.FillLinear(colors, stops, x0, y0, x1, y1);
};

/** @override */
createjs.Graphics.FillLinear.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setFillGradient_(this.gradient_.getGradient(renderer));
};

/** @override */
createjs.Graphics.FillLinear.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.FILL_LINEAR + this.gradient_.getText();
};

/**
 * An inner class used by the createjs.Graphics class to create a radial
 * gradient.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.FillRadial = function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /**
   * The spooled radial-gradient object.
   * @type {createjs.Graphics.RadialGradient}
   * @private
   */
  this.gradient_ = createjs.Graphics.RadialGradient.get(
      colors, stops, x0, y0, r0, x1, y1, r1);
};

/**
 * Creates a createjs.Graphics.FillRadial object.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @return {createjs.Graphics.FillRadial}
 */
createjs.Graphics.FillRadial.get =
    function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="r0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="r1"/>
  /// <returns type="createjs.Graphics.FillRadial"/>
  return new createjs.Graphics.FillRadial(
      colors, stops, x0, y0, r0, x1, y1, r1);
};

/** @override */
createjs.Graphics.FillRadial.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setFillGradient_(this.gradient_.getGradient(renderer));
};

/** @override */
createjs.Graphics.FillRadial.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.FILL_RADIAL + this.gradient_.getText();
};

/**
 * An inner class used by the createjs.Graphics class to create a pattern fill.
 * @param {HTMLImageElement} image
 * @param {string} repetition
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.FillPattern = function(image, repetition) {
  /**
   * The HTMLImageElement object to be filled.
   * @const {HTMLImageElement}
   * @private
   */
  this.image_ = image;

  /**
   * The image-repetition option. This value is one of "repeat", "repeat-x",
   * "repeat-y", or "no-repeat".
   * @const {string}
   * @private
   */
  this.repetition_ = repetition;
};

/**
 * Creates a createjs.Graphics.FillPattern object.
 * @param {HTMLImageElement} image
 * @param {string} repetition
 * @return {createjs.Graphics.FillPattern}
 */
createjs.Graphics.FillPattern.get = function(image, repetition) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="string" name="repetition"/>
  /// <returns type="createjs.Graphics.FillPattern"/>
  return new createjs.Graphics.FillPattern(image, repetition);
};

/** @override */
createjs.Graphics.FillPattern.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setFillPattern_(this.image_, this.repetition_);
};

/** @override */
createjs.Graphics.FillPattern.prototype.getText =
    createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to set line styles.
 * @param {number} thickness
 * @param {number} caps
 * @param {number} joints
 * @param {number} limit
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.LineStyle = function(thickness, caps, joints, limit) {
  /**
   * The thickness of a line.
   * @const {number}
   * @private
   */
  this.thickness_ = thickness;

  /**
   * The end-cap ID of a line.
   *   +---------+-----------+
   *   | end-cap | lineCap   |
   *   +---------+-----------+
   *   | 0       | "butt"    |
   *   | 1       | "round"   |
   *   | 2       | "square"  |
   *   +---------+-----------+
   * @const {number}
   * @private
   */
  this.caps_ = caps;

  /**
   * The corner-type ID of a line.
   *   +-------------+----------+
   *   | corner-type | lineJoin |
   *   +-------------+----------+
   *   | 0           | "bevel"  |
   *   | 1           | "round"  |
   *   | 2           | "miter"  |
   *   +-------------+----------+
   * @const {number}
   * @private
   */
  this.joints_ = joints;

  /**
   * The maximum miter length of a line.
   * @const {number}
   * @private
   */
  this.limit_ = limit;
};

/**
 * Creates a createjs.Graphics.LineStyle object.
 * @param {number} thickness
 * @param {number} caps
 * @param {number} joints
 * @param {number} limit
 * @return {createjs.Graphics.LineStyle}
 */
createjs.Graphics.LineStyle.get = function(thickness, caps, joints, limit) {
  /// <param type="number" name="thickness"/>
  /// <param type="number" name="caps"/>
  /// <param type="number" name="joints"/>
  /// <param type="number" name="limit"/>
  /// <returns type="createjs.Graphics.LineStyle"/>
  return new createjs.Graphics.LineStyle(thickness, caps, joints, limit);
};

/** @override */
createjs.Graphics.LineStyle.prototype.paint = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  renderer.setStrokeStyles_(
      this.thickness_, this.caps_, this.joints_, this.limit_);
};

/** @override */
createjs.Graphics.LineStyle.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.LINE_STYLE + ',' + this.thickness_ +
      ',' + this.caps_ + ',' + this.joints_ + ',' + this.limit_;
};

/**
 * An inner class used by the createjs.Graphics class to set a stroke color.
 * @param {string} color
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.StrokeColor = function(color) {
  /**
   * The stroke color.
   * @const {string}
   * @private
   */
  this.color_ = color;
};

/**
 * Creates a createjs.Graphics.StrokeColor object.
 * @param {string} color
 * @return {createjs.Graphics.StrokeColor}
 */
createjs.Graphics.StrokeColor.get = function(color) {
  /// <param type="string" name="color"/>
  /// <returns type="createjs.Graphics.StrokeColor"/>
  return new createjs.Graphics.StrokeColor(color);
};

/** @override */
createjs.Graphics.StrokeColor.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setStrokeColor_(this.color_);
};

/** @override */
createjs.Graphics.StrokeColor.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.STROKE_COLOR + this.color_;
};

/**
 * An inner class used by the createjs.Graphics class to create a linear
 * gradient.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.StrokeLinear = function(colors, stops, x0, y0, x1, y1) {
  /**
   * The spooled linear-gradient object.
   * @const {createjs.Graphics.LinearGradient}
   * @private
   */
  this.gradient_ =
      createjs.Graphics.LinearGradient.get(colors, stops, x0, y0, x1, y1);
};

/**
 * Creates a createjs.Graphics.StrokeLinaer object.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {createjs.Graphics.StrokeLinear}
 */
createjs.Graphics.StrokeLinear.get = function(colors, stops, x0, y0, x1, y1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="createjs.Graphics.StrokeLinear"/>
  return new createjs.Graphics.StrokeLinear(colors, stops, x0, y0, x1, y1);
};

/** @override */
createjs.Graphics.StrokeLinear.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setStrokeGradient_(this.gradient_.getGradient(renderer));
};

/** @override */
createjs.Graphics.StrokeLinear.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.STROKE_LINEAR + this.gradient_.getText();
};

/**
 * An inner class used by the createjs.Graphics class to create a radial
 * gradient.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.StrokeRadial = 
    function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /**
   * The spooled radial-gradient object.
   * @type {createjs.Graphics.RadialGradient}
   * @private
   */
  this.gradient_ = createjs.Graphics.RadialGradient.get(
      colors, stops, x0, y0, r0, x1, y1, r1);
};

/**
 * Creates a createjs.Graphics.StrokeRadial object.
 * @param {Array.<string>} colors
 * @param {Array.<number>} stops
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @return {createjs.Graphics.StrokeRadial}
 */
createjs.Graphics.StrokeRadial.get =
    function(colors, stops, x0, y0, r0, x1, y1, r1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="number" name="stops"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="r0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="r1"/>
  /// <returns type="createjs.Graphics.StrokeRadial"/>
  return new createjs.Graphics.StrokeRadial(
      colors, stops, x0, y0, r0, x1, y1, r1);
};

/** @override */
createjs.Graphics.StrokeRadial.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setStrokeGradient_(this.gradient_.getGradient(renderer));
};

/** @override */
createjs.Graphics.StrokeRadial.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.STROKE_RADIAL + this.gradient_.getText();
};

/**
 * An inner class used by the createjs.Graphics class to create a bitmap
 * pattern used as a stroke style.
 * @param {HTMLImageElement} image
 * @param {string} repetition
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.StrokePattern = function(image, repetition) {
  /**
   * The HTMLImageElement object to be filled.
   * @const {HTMLImageElement}
   * @private
   */
  this.image_ = image;

  /**
   * The image-repetition option. This value is one of "repeat", "repeat-x",
   * "repeat-y", or "no-repeat".
   * @const {string}
   * @private
   */
  this.repetition_ = repetition;
};

/**
 * Creates a createjs.Graphics.StrokePattern object.
 * @param {HTMLImageElement} image
 * @param {string} repetition
 * @return {createjs.Graphics.StrokePattern}
 */
createjs.Graphics.StrokePattern.get = function(image, repetition) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="string" name="repetition"/>
  /// <returns type="createjs.Graphics.FillPattern"/>
  return new createjs.Graphics.StrokePattern(image, repetition);
};

/** @override */
createjs.Graphics.StrokePattern.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.setStrokePattern_(this.image_, this.repetition_);
};

/** @override */
createjs.Graphics.StrokePattern.prototype.getText =
    createjs.Graphics.Command.getEmpty;

/**
 * An inner class used by the createjs.Graphics class to fill a drawing path
 * with the currently-selected color (or gradient) and to stroke a drawing path
 * with the currently-selected color (or gradient). This command assumes the
 * path has pushed a fill command when the fill property is true, and the path
 * has pushed a stroke command when the stroke property is true, respectively.
 * @param {boolean} fill
 * @param {boolean} stroke
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.DrawPath = function(fill, stroke) {
  /**
   * Whether a path needs to be filled.
   * @const {boolean}
   * @private
   */
  this.fill_ = fill;

  /**
   * Whether a path needs to have an outline.
   * @const {boolean}
   * @private
   */
  this.stroke_ = stroke;
};

/**
 * The lazy instances of createjs.Graphics.DrawPath objects.
 * @type {Array.<createjs.Graphics.DrawPath>}
 * @private
 */
createjs.Graphics.DrawPath.instances_ = [null, null, null, null];

/**
 * Creates a createjs.Graphics.DrawPath object.
 * @param {boolean} fill
 * @param {boolean} stroke
 * @return {createjs.Graphics.DrawPath}
 */
createjs.Graphics.DrawPath.get = function(fill, stroke) {
  /// <param type="boolean" name="fill"/>
  /// <param type="boolean" name="stroke"/>
  var id = (fill ? 2 : 0) | (stroke ? 1 : 0);
  if (!createjs.Graphics.DrawPath.instances_[id]) {
    createjs.Graphics.DrawPath.instances_[id] =
        new createjs.Graphics.DrawPath(fill, stroke);
  }
  return createjs.Graphics.DrawPath.instances_[id];
};

/** @override */
createjs.Graphics.DrawPath.prototype.paint = function(renderer) {
  /// <param type="createjs.Graphics.CanvasRenderer" name="renderer"/>
  renderer.drawPath_(this.fill_, this.stroke_);
};

/** @override */
createjs.Graphics.DrawPath.prototype.getText = function() {
  /// <returns type="string"/>
  var id = (this.fill_ ? 2 : 0) | (this.stroke_ ? 1 : 0);
  return createjs.Graphics.CommandName.DRAW_PATH + id;
};

/**
 * An inner class used by the createjs.Graphics class to draw a compact-encoded
 * path. This object uses an object spool to decode one compact-encoded path
 * only once. (A createjs.Shape object generated by Flash calls the drawPath()
 * method in its constructor, i.e. it decodes one compact-encoded path every
 * time when a game creates the instance of the createjs.Shape object. This
 * object uses an object spool to avoid it.)
 * @param {string} encoded
 * @implements {createjs.Graphics.Command}
 * @constructor
 */
createjs.Graphics.DecodePath = function(encoded) {
  /**
   * An ID assigned to this object.
   * @const {number}
   * @private
   */
  this.id_ = ++createjs.Graphics.DecodePath.id_;

  /**
   * The bounding box of this path.
   * @type {createjs.BoundingBox}
   * @private
   */
  this.box_ = new createjs.BoundingBox();

  /**
   * The drawing commands decoded from a compact-encoded path.
   * @type {Array.<createjs.Graphics.Command>}
   * @private
   */
  this.paths_ = createjs.Graphics.DecodePath.getPath_(encoded, this.box_);
};

/**
 * The path ID to be assigned to createjs.Graphics.DecodePath objects.
 * @type {number}
 * @private
 */
createjs.Graphics.DecodePath.id_ = 0;

/**
 * The spool of createjs.Graphics.DecodePath objects.
 * @type {Object.<string,createjs.Graphics.DecodePath>}
 * @private
 */
createjs.Graphics.DecodePath.instances_ = {};

/**
 * Creates a createjs.Graphics.DrawPath object. This method decodes a
 * compact-encoded path only when its object spool have not decoded it.
 * @param {string} encoded
 * @param {createjs.BoundingBox} box
 * @return {createjs.Graphics.DecodePath}
 */
createjs.Graphics.DecodePath.get = function(encoded, box) {
  /// <param type="string" name="fill"/>
  /// <returns type="createjs.Graphics.DecodePath"/>
  var instance = createjs.Graphics.DecodePath.instances_[encoded];
  if (!instance) {
    instance = new createjs.Graphics.DecodePath(encoded);
    createjs.Graphics.DecodePath.instances_[encoded] = instance;
  }
  box.update(instance.box_.minX, instance.box_.minY);
  box.update(instance.box_.maxX, instance.box_.maxY);
  return instance;
};

/**
 * Decodes a number in a compact-encoded path.
 * @param {string} path
 * @param {number} i
 * @param {number} count
 * @return {number}
 * @private
 */
createjs.Graphics.DecodePath.getValue_ = function(path, i, count) {
  /// <param type="string" name="path"/>
  /// <param type="number" name="i"/>
  /// <param type="number" name="count"/>
  /// <returns type="number"/>
  var BASE64 = createjs.Base64.DECODE_TABLE;
  var num = BASE64[path.charCodeAt(i)];
  var sign = (num >> 5) ? -0.1 : 0.1;
  num = ((num & 31) << 6) | BASE64[path.charCodeAt(i + 1)];
  if (count == 3) {
    num = (num << 6) | BASE64[path.charCodeAt(i + 2)];
  }
  return num * sign;
};

/**
 * Decodes a compact-encoded path generated by Flash CC. This method decodes a
 * compact-encoded path and generates a list of drawing commands used by the
 * createjs.Graphics object.
 *
 * A compact-encoded path is a base64-encoded text of compact-encoded commands.
 * Each compact-encoded command consists of a 1-character header and a
 * 2-character (or 3-character) positions. The following table describes the
 * header format.
 *  
 *   +-----+------+---------------------------------------+
 *   | Bit | Size | Description                           |
 *   +-----+------+---------------------------------------+
 *   | 1   | 3    | Command ID (see below)                |
 *   |     |      |   +-------+------------------+        |
 *   |     |      |   | value | command          |        |
 *   |     |      |   +-------+------------------+        |
 *   |     |      |   |   0   | moveTo           |        |
 *   |     |      |   |   1   | lineTo           |        |
 *   |     |      |   |   2   | quadraticCurveTo |        |
 *   |     |      |   |   3   | bezierCurveTo    |        |
 *   |     |      |   |   4   | closePath        |        |
 *   |     |      |   +-------+------------------+        |
 *   +-----+------+---------------------------------------+
 *   | 4   | 1    | The length of position values         |
 *   |     |      |   +-------+-------------------------+ |
 *   |     |      |   | value | length                  | |
 *   |     |      |   +-------+-------------------------+ |
 *   |     |      |   |   0   | 12 bits (2 characters)  | |
 *   |     |      |   |   1   | 18 bits (3 characters)  | |
 *   |     |      |   +-------+-------------------------+ |
 *   +-----+------+---------------------------------------+
 *   | 5   | 2    | Unused                                |
 *   +-----+------+---------------------------------------+
 *
 * See the createjs.Graphics.decodePath() method for more details:
 * <https://github.com/CreateJS/EaselJS/master/src/easeljs/display/Graphics.js>.
 *
 * @param {string} encoded
 * @param {createjs.BoundingBox} box
 * @return {Array.<createjs.Graphics.Command>}
 * @private
 */
createjs.Graphics.DecodePath.getPath_ = function(encoded, box) {
  var COMMAND = {
    MOVETO: 0,
    LINETO: 1,
    QUADRATICCURVETO: 2,
    BEZIERCURVETO: 3,
    CLOSEPATH: 4
  };
  /// <var type="Array" elementType="createjs.Graphics.Command" name="paths"/>
  var paths = [];
  var x = 0;
  var y = 0;
  var i = 0;
  var length = encoded.length;
  while (i < length) {
    var n = createjs.Base64.DECODE_TABLE[encoded.charCodeAt(i++)];
    var command = n >> 3;
    var charCount = ((n >> 2) & 1) + 2;
    if (command == COMMAND.CLOSEPATH) {
      paths.push(createjs.Graphics.ClosePath.get());
      continue;
    }
    if (command == COMMAND.MOVETO) {
      x = 0;
      y = 0;
    }
    x += createjs.Graphics.DecodePath.getValue_(encoded, i, charCount);
    i += charCount;
    y += createjs.Graphics.DecodePath.getValue_(encoded, i, charCount);
    i += charCount;
    box.update(x, y);
    if (command == COMMAND.MOVETO) {
      paths.push(createjs.Graphics.MoveTo.get(x, y));
      continue;
    }
    if (command == COMMAND.LINETO) {
      paths.push(createjs.Graphics.LineTo.get(x, y));
      continue;
    }
    var cp1x = x;
    var cp1y = y;
    x += createjs.Graphics.DecodePath.getValue_(encoded, i, charCount);
    i += charCount;
    y += createjs.Graphics.DecodePath.getValue_(encoded, i, charCount);
    i += charCount;
    box.update(x, y);
    if (command == COMMAND.QUADRATICCURVETO) {
      paths.push(createjs.Graphics.QuadraticCurveTo.get(cp1x, cp1y, x, y));
      continue;
    }
    var cp2x = x;
    var cp2y = y;
    x += createjs.Graphics.DecodePath.getValue_(encoded, i, charCount);
    i += charCount;
    y += createjs.Graphics.DecodePath.getValue_(encoded, i, charCount);
    i += charCount;
    box.update(x, y);
    paths.push(createjs.Graphics.CurveTo.get(cp1x, cp1y, cp2x, cp2y, x, y));
  }
  return paths;
};

/** @override */
createjs.Graphics.DecodePath.prototype.paint = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  var paths = this.paths_;
  var length = paths.length;
  for (var i = 0; i < length; ++i) {
    paths[i].paint(renderer);
  }
};

/** @override */
createjs.Graphics.DecodePath.prototype.getText = function() {
  /// <returns type="string"/>
  return createjs.Graphics.CommandName.DECODE_PATH + this.id_;
};

/**
 * The global cache for renderer objects.
 * @type {Object.<string,createjs.Graphics.CanvasRenderer>}
 * @private
 */
createjs.Graphics.renderers_ = {};

/**
 * Returns a property number from a string.
 * @param {Array.<string>} map
 * @param {string|number|undefined} value
 * @return {number}
 * @private
 */
createjs.Graphics.getProperty_ = function(map, value) {
  /// <param type="Array" elementType="string" name="map"/>
  /// <param type="string|number|undefined" name="value"/>
  /// <returns type="string"/>
  if (!value) {
    return 0;
  }
  if (createjs.isNumber(value)) {
    return createjs.getNumber(value);
  }
  var length = map.length;
  for (var i = 0; i < length; ++i) {
    if (map[i] == value) {
      return i;
    }
  }
  return 0;
};

/**
 * Returns a CSS-compatible color string either from a packed RGBA value,
 * from three RGB values, or from four RGBA values.
 * @param {number} color
 * @param {number=} opt_arg0
 * @param {number=} opt_arg1
 * @param {number=} opt_arg2
 * @return {string}
 * @const
 */
createjs.Graphics.getRGB = function(color, opt_arg0, opt_arg1, opt_arg2) {
  /// <param type="number" name="color"/>
  /// <param type="number" optional="true" name="opt_arg0"/>
  /// <param type="number" optional="true" name="opt_arg1"/>
  /// <param type="number" optional="true" name="opt_arg2"/>
  /// <returns type="string"/>
  var length = arguments.length;
  if (length <= 2) {
    var red = (color >> 16) & 0xff;
    var green = (color >> 8) & 0xff;
    var blue = color & 0xff;
    if (length == 1) {
      return 'rgb(' + red + ',' + green + ',' + blue + ')';
    }
    var alpha = createjs.getNumber(opt_arg0);
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  } else {
    var red = color;
    var green = createjs.getNumber(opt_arg0);
    var blue = createjs.getNumber(opt_arg1);
    if (length == 3) {
      return 'rgb(' + red + ',' + green + ',' + blue + ')';
    }
    var alpha = createjs.castNumber(opt_arg2);
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  }
};

/**
 * Returns a CSS-compatible color string from three HSL values or from four HSL
 * values.
 * @param {number} hue
 * @param {number} saturation
 * @param {number} lightness
 * @param {number=} opt_alpha
 * @return {string}
 * @const
 */
createjs.Graphics.getHSL = function(hue, saturation, lightness, opt_alpha) {
  /// <param type="number" name="hue"/>
  /// <param type="number" name="saturation"/>
  /// <param type="number" name="lightness"/>
  /// <param type="number" optional="true" name="opt_alpha"/>
  /// <returns type="string"/>
  hue %= 360;
  if (opt_alpha == null) {
    return 'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)';
  } else {
    var alpha = createjs.getNumber(opt_alpha);
    return 'hsla(' + hue + ',' + saturation + '%,' + lightness + '%,' +
        alpha + ')';
  }
};

/**
 * Resets the global variables used by this class and the inner classes in this
 * file.
 * @const
 */
createjs.Graphics.reset = function() {
  createjs.Graphics.DrawPath.instances_ = [null, null, null, null];
  createjs.Graphics.DecodePath.id_ = 0;
  createjs.Graphics.DecodePath.instances_ = {};
  var renderers = createjs.Graphics.renderers_;
  for (var key in renderers) {
    var renderer = renderers[key];
    if (renderer) {
      renderer.uncache_();
    }
  }
  createjs.Graphics.renderers_ = {};
  if (createjs.DEBUG) {
    createjs.Counter.cachedRenderers = 0;
    createjs.Counter.totalRenderers = 0;
  }
};

/**
 * Returns the renderer used for drawing paths.
 * @param {string} key
 * @param {number} flag
 * @return {createjs.Graphics.CanvasRenderer}
 * @private
 */
createjs.Graphics.prototype.getRenderer_ = function(key, flag) {
  /// <param type="string" name="text"/>
  /// <returns type="createjs.Graphics.CanvasRenderer"/>
  this.deleteCache_();
  this.renderer_ =
      new createjs.Graphics.CanvasRenderer(flag);
  this.key_ = key;
  return this.renderer_;
};

/**
 * Updates the cache. This method creates a HTMLCanvasElement object whose size
 * is equal to the one of the bounding box of this object and draws paths to the
 * HTMLCanvasElement object.
 * @param {number} flag
 * @private
 */
createjs.Graphics.prototype.updateCache_ = function(flag) {
  if (createjs.DEBUG) {
    ++createjs.Counter.totalRenderers;
  }
  this.redraw_ = false;
  // Calculate the size of an output HTMLCanvasElement object and execute the
  // path commands if the object is not an empty one. The HTML5 specification
  // prohibits calling the 'drawImage()' method with an empty HTMLCanvasElement
  // object. (In fact, Safari throws an exception.)
  this.box.addMargin(this.margin_);
  var width = this.box.getWidth();
  var height = this.box.getHeight();
  if (width < 1 || height < 1) {
    return;
  }
  var path = this.path_;
  var length = path.length;
  var key = '';
  // Concatenate the rendering commands in the path list and use it as a key
  // for the table of cached renderer objects. (The first command in a path
  // list is always a BeginPath command and this code skips it.)
  for (var i = 1; i < length; ++i) {
    var text = path[i].getText();
    if (!text) {
      key = '';
      break;
    }
    key += text;
  }
  // When there is a renderer object that has already rendered the same paths,
  // add its reference count and return it.
  if (key) {
    var renderer = createjs.Graphics.renderers_[key];
    if (renderer) {
      renderer.addRef_();
      this.renderer_ = renderer;
      this.key_ = key;
      return;
    }
  }
  var renderer = this.getRenderer_(key, flag);
  renderer.setBox_(this.box.minX, this.box.minY, width, height);
  for (var i = 0; i < length; ++i) {
    path[i].paint(renderer);
  }
  renderer.endPath_();
  if (key) {
    if (createjs.DEBUG) {
      ++createjs.Counter.cachedRenderers;
    }
    createjs.Graphics.renderers_[key] = renderer;
  }
};

/**
 * Adds the active paths to the path list.
 * @private
 */
createjs.Graphics.prototype.updatePath_ = function() {
  this.path_.push(createjs.Graphics.BeginPath.get());
  if (this.fill_) {
    this.path_.push(this.fill_);
  }
  if (this.stroke_) {
    this.path_.push(this.stroke_);
    if (this.style_) {
      this.path_.push(this.style_);
    }
  }
  if (this.active_.length != 0) {
    this.path_.push.apply(this.path_, this.active_);
  }
  this.path_.push(createjs.Graphics.DrawPath.get(!!this.fill_, !!this.stroke_));
  // Update the cache <canvas> element next time when this object is rendered.
  // (A game may add more paths to this object and it is not good to update its
  // cache now.)
  this.redraw_ = true;
};

/**
 * Starts a new path. This method closes the current path and creates a new one.
 * @param {boolean} fill
 * @private
 */
createjs.Graphics.prototype.newPath_ = function(fill) {
  /// <param type="boolean" name="fill"/>
  // This method should update paths only when there are drawable paths in the
  // active paths.
  if (this.active_.length) {
    if (this.dirty_) {
      this.updatePath_();
      this.dirty_ = false;
    }
    this.active_ = [];
  }
};

/**
 * Paints the paths of this graphics to its cache in the background.
 * @param {number} flag
 * @private
 */
createjs.Graphics.prototype.createCache_ = function(flag) {
  /// <param type="number" name="flag"/>
  // Update the path list of this object if an application draws this object
  // without closing a path.
  if (this.dirty_) {
    // Fill a mask path in solid black to prevent its cache from becoming an
    // empty bitmap. (A mask path generated by Flash does not have either a fill
    // command or a stroke command, i.e. a mask path needs a fill command.)
    if (flag & 2) {
      if (!this.fill_) {
        this.fill_ = createjs.Graphics.FillColor.get('#000');
      }
    }
    this.updatePath_();
    this.dirty_ = false;
    this.active_ = [];
  }
  if (this.redraw_) {
    this.updateCache_(flag);
  }
};

/**
 * Deletes the rendering cache attached to this object.
 * @private
 */
createjs.Graphics.prototype.deleteCache_ = function() {
  if (this.renderer_) {
    if (this.renderer_.release_() <= 0) {
      var key = this.key_;
      if (key) {
        if (createjs.DEBUG) {
          --createjs.Counter.cachedRenderers;
        }
        createjs.Graphics.renderers_[key] = null;
      }
    }
    if (createjs.DEBUG) {
      --createjs.Counter.totalRenderers;
    }
    this.renderer_ = null;
    this.redraw_ = true;
  }
};

/**
 * Returns whether this createjs.Graphics instance has drawing commands.
 * @return {boolean}
 * @const
 */
createjs.Graphics.prototype.isEmpty = function() {
  /// <returns type="boolean"/>
  return !this.path_.length && !this.active_.length;
};

/**
 * Returns true if this createjs.Graphics instance needs a redraw.
 * @return {boolean}
 * @const
 */
createjs.Graphics.prototype.isDirty = function() {
  /// <returns type="boolean"/>
  return this.dirty_ || this.redraw_;
};

/**
 * Returns whether the specified point is in this createjs.Graphics instance.
 * @param {createjs.Point} point
 * @return {number}
 * @const
 */
createjs.Graphics.prototype.hitTestObject = function(point) {
  /// <param type="createjs.Point" name="point"/>
  /// <returns type="number"/>
  if (this.renderer_) {
    return this.renderer_.hitTestObject_(point.x - this.box.minX,
                                         point.y - this.box.minY);
  }
  return 0;
};

/**
 * Paints this graphics with the given createjs.Renderer interface.
 * @param {createjs.Renderer} renderer
 * @const
 */
createjs.Graphics.prototype.paint = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  // Update the cache image and copy it only if this object is not updating it
  // in the background.
  this.createCache_(0);
  if (this.renderer_) {
    this.renderer_.setOutput_(renderer);
    var box = this.box;
    renderer.drawCanvas(
        this.renderer_.getCanvas_(),
        box.getLeft(), box.getTop(), box.getWidth(), box.getHeight());
  }
};

/**
 * Draws the display object into the specified context.
 * @param {CanvasRenderingContext2D} context
 * @const
 */
createjs.Graphics.prototype.draw = function(context) {
  /// <param type="CanvasRenderingContext2D" name="context"/>
  createjs.notReached();
};

/**
 * Draws only the paths of this createjs.Graphics instance.
 * @param {CanvasRenderingContext2D} context
 * @const
 */
createjs.Graphics.prototype.drawAsPath = function(context) {
  /// <param type="CanvasRenderingContext2D" name="context"/>
  createjs.notReached();
};

/**
 * Draws queued graphics commands to the cache renderer of this object.
 * @param {number} flag
 * @const
 */
createjs.Graphics.prototype.cache = function(flag) {
  /// <param type="number" name="flag"/>
  this.createCache_(flag);
};

/**
 * Removes the cache renderer from this object.
 * @const
 */
createjs.Graphics.prototype.uncache = function() {
  this.deleteCache_();
};

/**
 * Moves the drawing point to the specified position. A tiny API method "mt"
 * also exists.
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.moveTo = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics"/>
  this.box.update(x, y);
  this.active_.push(createjs.Graphics.MoveTo.get(x, y));
  return this;
};

/**
 * Draws a line from the current drawing point to the specified position, which
 * become the new current drawing point. A tiny API method "lt" also exists.
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.lineTo = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(x, y);
  this.active_.push(createjs.Graphics.LineTo.get(x, y));
  return this;
};

/**
 * Draws an arc with the specified control points and radius. A tiny API method
 * "at" also exists.
 * @method arcTo
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} radius
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.arcTo = function(x1, y1, x2, y2, radius) {
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="x2"/>
  /// <param type="number" name="y2"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(x1, y1);
  this.box.update(x2, y2);
  this.active_.push(createjs.Graphics.ArcTo.get(x1, y1, x2, y2, radius));
  return this;
};

/**
 * Draws an arc defined by the radius, startAngle and endAngle arguments,
 * centered at the position (x, y). For example, to draw a full circle with a
 * radius of 20 centered at (100, 100):
 *
 *      arc(100, 100, 20, 0, Math.PI * 2);
 *
 * A tiny API method "a" also exists.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {boolean} anticlockwise
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.arc =
    function(x, y, radius, startAngle, endAngle, anticlockwise) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="radius"/>
  /// <param type="number" name="startAngle"/>
  /// <param type="number" name="endAngle"/>
  /// <param type="number" name="anticlockwise"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(x - radius, y - radius);
  this.box.update(x + radius, y + radius);
  this.active_.push(createjs.Graphics.Arc.get(
      x, y, radius, startAngle, endAngle, anticlockwise));
  return this;
};

/**
 * Draws a quadratic bezier curve from the current drawing point to (x, y)
 * using the control point (cpx, cpy). A tiny API method "qt" also exists.
 * @param {number} cpx
 * @param {number} cpy
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.quadraticCurveTo = function(cpx, cpy, x, y) {
  /// <param type="number" name="cpx"/>
  /// <param type="number" name="cpy"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(cpx, cpy);
  this.box.update(x, y);
  this.active_.push(createjs.Graphics.QuadraticCurveTo.get(cpx, cpy, x, y));
  return this;
};

/**
 * Draws a bezier curve from the current drawing point to (x, y) using the
 * control points (cp1x, cp1y) and (cp2x, cp2y). A tiny API method "bt" also
 * exists.
 * @param {number} cp1x
 * @param {number} cp1y
 * @param {number} cp2x
 * @param {number} cp2y
 * @param {number} x
 * @param {number} y
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.bezierCurveTo =
    function(cp1x, cp1y, cp2x, cp2y, x, y) {
  /// <param type="number" name="cp1x"/>
  /// <param type="number" name="cp1y"/>
  /// <param type="number" name="cp2x"/>
  /// <param type="number" name="cp2y"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(cp1x, cp1y);
  this.box.update(cp2x, cp2y);
  this.box.update(x, y);
  this.active_.push(
      createjs.Graphics.CurveTo.get(cp1x, cp1y, cp2x, cp2y, x, y));
  return this;
};

/**
 * Draws a rectangle at (x, y) with the specified width and height using the
 * current fill and/or stroke. A tiny API method "r" also exists.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.rect = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(x, y);
  this.box.update(x + width, y + height);
  this.active_.push(
      createjs.Graphics.Rect.get(x, y, width, height));
  return this;
};

/**
 * Closes the current path, effectively drawing a line from the current drawing
 * point to the first drawing point specified since the fill or stroke was last
 * set. A tiny API method "cp" also exists.
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.closePath = function() {
  /// <returns type="createjs.Graphics"/>
  if (this.active_.length > 0) {
    this.dirty_ = true;
    this.active_.push(createjs.Graphics.ClosePath.get());
  }
  return this;
};

/**
 * Clears all drawing instructions, effectively resetting this createjs.Graphics
 * instance. Any line and fill styles will need to be redefined to draw shapes
 * following a clear call. A tiny API method "c" also exists.
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.clear = function() {
  /// <returns type="createjs.Graphics"/>
  this.deleteCache_();
  this.box.reset();
  this.dirty_ = false;
  this.path_ = [];
  this.fill_ = null;
  this.stroke_ = null;
  this.active_ = [];
  return this;
};

/**
 * Begins a fill with the specified color. This ends the current sub-path. A
 * tiny API method "f" also exists.
 * @param {string=} opt_color
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginFill = function(opt_color) {
  /// <param type="string" optional="true" name="opt_color"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(true);
  if (opt_color) {
    var color = createjs.castString(opt_color);
    this.fill_ = createjs.Graphics.FillColor.get(color);
  }
  return this;
};

/**
 * Begins a linear gradient fill defined by the line (x0, y0) to (x1, y1). This
 * ends the current sub-path. For example, the following code defines a black to
 * white vertical gradient ranging from 20px to 120px, and draws a square to
 * display it:
 *
 *   createjs.Graphics.
 *       beginLinearGradientFill(["#000","#FFF"], [0, 1], 0, 20, 0, 120).
 *       drawRect(20, 20, 120, 120);
 *
 * A tiny API method "lf" also exists.
 * @param {Array} colors
 * @param {Array} ratios
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginLinearGradientFill =
    function(colors, ratios, x0, y0, x1, y1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="string" name="ratios"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(true);
  this.fill_ =
      createjs.Graphics.FillLinear.get(colors, ratios, x0, y0, x1, y1);
  return this;
};

/**
 * Begins a radial gradient fill. This ends the current sub-path. For example,
 * the following code defines a red to blue radial gradient centered at
 * (100, 100), with a radius of 50, and draws a circle to display it:
 *
 *   mycreatejs.Graphics.
 *       beginRadialGradientFill(["#F00", "#00F"],
 *                               [0, 1],
 *                               100, 100, 0, 100, 100, 50).
 *       drawCircle(100, 100, 50);
 *
 * A tiny API method "rf" also exists.
 * @param {Array} colors
 * @param {Array} ratios
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginRadialGradientFill =
    function(colors, ratios, x0, y0, r0, x1, y1, r1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="string" name="ratios"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="r0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="r1"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(true);
  this.fill_ =
      createjs.Graphics.FillRadial.get(colors, ratios, x0, y0, r0, x1, y1, r1);
  return this;
};

/**
 * Begins a pattern fill using the specified image. This ends the current
 * sub-path. A tiny API method "bf" also exists.
 * @param {HTMLImageElement} image
 * @param {string=} opt_repetition
 * @param {Object.<string,number>=} opt_matrix
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginBitmapFill =
    function(image, opt_repetition, opt_matrix) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="string" optional="true" name="opt_repetition"/>
  /// <param type="Object" optional="true" name="opt_matrix"/>
  /// <returns type="createjs.Graphics"/>
  // Disabled a pattern fill due to a crash on Chrome in rendering a texture
  // with its wrap mode REPEAT.
  createjs.notReached();
  return this;
};

/**
 * Ends the current sub-path, and begins a new one with no fill. Functionally
 * identical to <code>beginFill(null)</code>. A tiny API method "ef" also
 * exists.
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.endFill = function() {
  /// <returns type="createjs.Graphics"/>
  this.newPath_(true);
  return this;
};

/**
 * Sets the stroke style for the current sub-path. A tiny API method "ss" also
 * exists.
 * @param {number=} opt_thickness
 * @param {(string|number)=} opt_caps
 * @param {(string|number)=} opt_joints
 * @param {number=} opt_miterLimit
 * @param {boolean=} opt_ignoreScale
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.setStrokeStyle = function(opt_thickness,
                                                      opt_caps,
                                                      opt_joints,
                                                      opt_miterLimit,
                                                      opt_ignoreScale) {
  /// <param type="number" optional="true" name="opt_thickness"/>
  /// <param type="number" optional="true" name="opt_caps"/>
  /// <param type="number" optional="true" name="opt_joints"/>
  /// <param type="number" optional="true" name="opt_miterLimit"/>
  /// <param type="boolean" optional="true" name="opt_ignoreScale"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(false);
  var thickness = (opt_thickness == null) ? 1 : opt_thickness;
  var caps = createjs.Graphics.getProperty_(['butt', 'round', 'square'],
                                            opt_caps);
  var joints = createjs.Graphics.getProperty_(['miter', 'round', 'bevel'],
                                              opt_joints);
  var miterLimit = (opt_miterLimit == null) ? 10 : opt_miterLimit;
  this.style_ =
      createjs.Graphics.LineStyle.get(thickness, caps, joints, miterLimit);
  this.margin_ = createjs.max(thickness, this.margin_);
  return this;
};

/**
 * Begins a stroke with the specified color. This ends the current sub-path. A
 * tiny API method "s" also exists.
 * @param {string=} opt_color
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginStroke = function(opt_color) {
  /// <param type="string" optional="true" name="opt_color"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(false);
  if (opt_color) {
    var color = createjs.getString(opt_color);
    this.stroke_ = createjs.Graphics.StrokeColor.get(color);
  }
  return this;
};

/**
 * Begins a linear gradient stroke defined by the line (x0, y0) to (x1, y1). A
 * tiny API method "ls" also exists.
 * @param {Array} colors
 * @param {Array} ratios
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginLinearGradientStroke =
    function(colors, ratios, x0, y0, x1, y1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="string" name="ratios"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(false);
  this.stroke_ =
      createjs.Graphics.StrokeLinear.get(colors, ratios, x0, y0, x1, y1);
  return this;
};

/**
 * Begins a radial gradient stroke. A tiny API method "rs" also exists.
 * @param {Array} colors
 * @param {Array} ratios
 * @param {number} x0
 * @param {number} y0
 * @param {number} r0
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginRadialGradientStroke =
    function(colors, ratios, x0, y0, r0, x1, y1, r1) {
  /// <param type="Array" elementType="string" name="colors"/>
  /// <param type="Array" elementType="string" name="ratios"/>
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="r0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="r1"/>
  /// <returns type="createjs.Graphics"/>
  this.newPath_(false);
  this.stroke_ = createjs.Graphics.StrokeRadial.get(
      colors, ratios, x0, y0, r0, x1, y1, r1);
  return this;
};

/**
 * Begins a pattern stroke using the specified image. This ends the current
 * sub-path. Note that unlike bitmap fills, strokes do not currently support a
 * matrix parameter due to limitations in the canvas API. A tiny API method "bs"
 * also exists.
 * @param {HTMLImageElement} image
 * @param {string=} opt_repetition
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.beginBitmapStroke =
    function(image, opt_repetition) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="string" optional="true" name="opt_repetition"/>
  /// <returns type="createjs.Graphics"/>
  // Disabled a pattern stroke due to a crash on Chrome in rendering a texture
  // with its wrap mode REPEAT.
  createjs.notReached();
  return this;
};

/**
 * Ends the current sub-path, and begins a new one with no stroke. Functionally
 * identical to the Graphics.beginStroke(null) call. A tiny API method "es" also
 * exists.
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.endStroke = function() {
  /// <returns type="createjs.Graphics"/>
  this.newPath_(false);
  return this;
};

/**
 * Draws a rounded rectangle with all corners with the specified radius.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.drawRoundRect =
    function(x, y, width, height, radius) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="createjs.Graphics"/>
  createjs.notReached();
  return this;
};

/**
 * Draws a rounded rectangle with different corner radii. Supports positive and
 * negative corner radii. A tiny API method "rc" also exists.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radiusTL
 * @param {number} radiusTR
 * @param {number} radiusBR
 * @param {number} radiusBL
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.drawRoundRectComplex =
    function(x, y, width, height, radiusTL, radiusTR, radiusBR, radiusBL) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" name="radiusTL"/>
  /// <param type="number" name="radiusTR"/>
  /// <param type="number" name="radiusBR"/>
  /// <param type="number" name="radiusBL"/>
  /// <returns type="createjs.Graphics"/>
  createjs.notReached();
  return this;
};

/**
 * Draws a circle with the specified radius at (x, y).  A tiny API method "dc"
 * also exists.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.drawCircle = function(x, y, radius) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="radius"/>
  /// <returns type="createjs.Graphics"/>
  // Draw an arc from 0 rad to 7 rad (= Math.ceil(Math.PI * 2) = 6.28...) to
  // avoid using a double number. (Most arc() implementations use float numbers
  // and it is an overkill to use double numbers.)
  this.arc(x, y, radius, 0, 7, false);
  return this;
};

/**
 * Draws an ellipse (oval) with a specified width and height. Similar to
 * the Graphics.drawCircle() method except the width and height can be
 * different. A tiny API method "de" also exists.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.drawEllipse = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.box.update(x, y);
  this.box.update(x + width, y + height);
  var k = 0.5522848;
  var ox = (width * 0.5) * k;
  var oy = (height * 0.5) * k;
  var xe = x + width;
  var ye = y + height;
  var xm = x + width * 0.5;
  var ym = y + height * 0.5;
  this.active_.push(
      createjs.Graphics.MoveTo.get(x, ym),
      createjs.Graphics.CurveTo.get(x, ym - oy, xm - ox, y, xm, y),
      createjs.Graphics.CurveTo.get(xm + ox, y, xe, ym - oy, xe, ym),
      createjs.Graphics.CurveTo.get(xe, ym + oy, xm + ox, ye, xm, ye),
      createjs.Graphics.CurveTo.get(xm - ox, ye, x, ym + oy, x, ym));
  return this;
};

/**
 * Injects a method of the Canvas 2D API.
 * @param {Function} callback
 * @param {Object} data
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.inject = function(callback, data) {
  /// <param type="Function" name="callback"/>
  /// <param type="Object" name="data"/>
  /// <returns type="createjs.Graphics"/>
  createjs.notReached();
  return this;
};

/**
 * Draws a star or a convex. This method draws a start if pointSize is greater
 * than 0, or it draws a convex if pointSize is 0 with the specified number of
 * points. For example, the following code will draw a familiar 5 pointed star
 * shape centered at (100, 100) and with a radius of 50:
 *
 *   mycreatejs.Graphics.beginFill("#FF0").
 *       drawPolyStar(100, 100, 50, 5, 0.6, -90);
 *   // Note: -90 makes the first point vertical
 *
 * A tiny API method "dp" also exists.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} sides
 * @param {number=} opt_pointSize
 * @param {number=} opt_angle (in degrees)
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.drawPolyStar =
    function(x, y, radius, sides, opt_pointSize, opt_angle) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="radius"/>
  /// <param type="number" name="sides"/>
  /// <param type="number" optional="true" name="opt_pointSize"/>
  /// <param type="number" optional="true" name="opt_angle"/>
  createjs.notReached();
  return this;
};

/**
 * Decodes a compact-encoded-path string.
 * A tiny API method "p" also exists.
 *
 * @param {string} encoded
 * @return {createjs.Graphics}
 * @const
 */
createjs.Graphics.prototype.decodePath = function(encoded) {
  /// <param type="string" name="encoded"/>
  /// <returns type="createjs.Graphics"/>
  this.dirty_ = true;
  this.active_.push(createjs.Graphics.DecodePath.get(encoded, this.box));
  return this;
};

/**
 * Returns whether the specified point is in this object.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 * @const
 */
createjs.Graphics.prototype.hitTest = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="boolean"/>
  return this.box.contain(x, y);
};

// Export the createjs.Graphics object to the global namespace.
createjs.exportObject('createjs.Graphics', createjs.Graphics, {
  // createjs.Graphics methods.
  'moveTo': createjs.Graphics.prototype.moveTo,
  'lineTo': createjs.Graphics.prototype.lineTo,
  'arcTo': createjs.Graphics.prototype.arcTo,
  'arc': createjs.Graphics.prototype.arc,
  'quadraticCurveTo': createjs.Graphics.prototype.quadraticCurveTo,
  'bezierCurveTo': createjs.Graphics.prototype.bezierCurveTo,
  'rect': createjs.Graphics.prototype.rect,
  'closePath': createjs.Graphics.prototype.closePath,
  'clear': createjs.Graphics.prototype.clear,
  'beginFill': createjs.Graphics.prototype.beginFill,
  'beginLinearGradientFill':
      createjs.Graphics.prototype.beginLinearGradientFill,
  'beginRadialGradientFill':
      createjs.Graphics.prototype.beginRadialGradientFill,
  'beginBitmapFill': createjs.Graphics.prototype.beginBitmapFill,
  'endFill': createjs.Graphics.prototype.endFill,
  'setStrokeStyle': createjs.Graphics.prototype.setStrokeStyle,
  'beginStroke': createjs.Graphics.prototype.beginStroke,
  'beginLinearGradientStroke':
      createjs.Graphics.prototype.beginLinearGradientStroke,
  'beginRadialGradientStroke':
      createjs.Graphics.prototype.beginRadialGradientStroke,
  'beginBitmapStroke': createjs.Graphics.prototype.beginBitmapStroke,
  'endStroke': createjs.Graphics.prototype.endStroke,
  'curveTo': createjs.Graphics.prototype.quadraticCurveTo,
  'drawRect': createjs.Graphics.prototype.rect,
  'drawRoundRect': createjs.Graphics.prototype.drawRoundRect,
  'drawRoundRectComplex': createjs.Graphics.prototype.drawRoundRectComplex,
  'drawCircle': createjs.Graphics.prototype.drawCircle,
  'drawEllipse': createjs.Graphics.prototype.drawEllipse,
  'inject': createjs.Graphics.prototype.inject,
  'drawPolyStar': createjs.Graphics.prototype.drawPolyStar,
  'decodePath': createjs.Graphics.prototype.decodePath,
  'mt': createjs.Graphics.prototype.moveTo,
  'lt': createjs.Graphics.prototype.lineTo,
  'at': createjs.Graphics.prototype.arcTo,
  'a': createjs.Graphics.prototype.arc,
  'qt': createjs.Graphics.prototype.quadraticCurveTo,
  'bt': createjs.Graphics.prototype.bezierCurveTo,
  'r': createjs.Graphics.prototype.rect,
  'cp': createjs.Graphics.prototype.closePath,
  'c': createjs.Graphics.prototype.clear,
  'f': createjs.Graphics.prototype.beginFill,
  'lf': createjs.Graphics.prototype.beginLinearGradientFill,
  'rf': createjs.Graphics.prototype.beginRadialGradientFill,
  'bf': createjs.Graphics.prototype.beginBitmapFill,
  'ef': createjs.Graphics.prototype.endFill,
  'ss': createjs.Graphics.prototype.setStrokeStyle,
  's': createjs.Graphics.prototype.beginStroke,
  'ls': createjs.Graphics.prototype.beginLinearGradientStroke,
  'rs': createjs.Graphics.prototype.beginRadialGradientStroke,
  'bs': createjs.Graphics.prototype.beginBitmapStroke,
  'es': createjs.Graphics.prototype.endStroke,
  'dr': createjs.Graphics.prototype.rect,
  'rr': createjs.Graphics.prototype.drawRoundRect,
  'rc': createjs.Graphics.prototype.drawRoundRectComplex,
  'dc': createjs.Graphics.prototype.drawCircle,
  'de': createjs.Graphics.prototype.drawEllipse,
  'dp': createjs.Graphics.prototype.drawPolyStar,
  'p': createjs.Graphics.prototype.decodePath
}, {
  'getRGB': createjs.Graphics.getRGB,
  'getHSL': createjs.Graphics.getHSL
});
