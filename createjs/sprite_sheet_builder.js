/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 DeNA Co., Ltd.
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
/// <reference path="event_dispatcher.js"/>
/// <reference path="canvas_renderer.js"/>
/// <reference path="movie_clip.js"/>
/// <reference path="sprite_sheet.js"/>

/**
 * A class that creates a sprite sheet at run time. This class creates a sprite
 * sheet from a movie clip with the following steps:
 * 1. Draw the frames of the movie clip to <canvas> elements, and;
 * 2. Create a sprite sheet with the <canvas> elements.
 * This class is a simplified subset of the original createjs.SpriteSheetBuilder
 * class and it can create a sprite sheet only from one movie clip generated by
 * Flash CC.
 *
 *   var builder = new createjs.SpriteSheetBuilder();
 *   var clip = new lib['flash_animation']();
 *   builder.addMovieClip(clip);
 *   var spriteSheet = builder.build();
 *   (lib['flash_animation'] = function() {
 *      this.initialize();
 *      this.instance = new createjs.Sprite(spriteSheet, 0);
 *      this.instance.play();
 *      this.addChild(this.instance);
 *  }).prototype = _p = new createjs.Container();
 *
 * This class uses the 'nominalBounds' property of an input movie clip (which is
 * generated by Flash CC) to automatically calculate the size of a sprite frame
 * and the ones of output <canvas> elements. (This class automatically resizes
 * each sprite frame with the 'nominalBounds' property so it fits into a 256x256
 * rectangle.)
 *
 * @extends {createjs.EventDispatcher}
 * @constructor
 */
createjs.SpriteSheetBuilder = function() {
  createjs.EventDispatcher.call(this);
  this.initializeBuilder_();
};
createjs.inherits('SpriteSheetBuilder',
                  createjs.SpriteSheetBuilder,
                  createjs.EventDispatcher);

/**
 * The inner class that implements the createjs.Renderer interface with the
 * Canvas 2D API and renders CreateJS-Lite objects into a sprite sheet.
 * @param {number} width
 * @param {number} height
 * @extends {createjs.Renderer}
 * @constructor
 */
createjs.SpriteSheetBuilder.Renderer = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  var canvas = createjs.createCanvas();
  canvas.width = width;
  canvas.height = height;
  createjs.Renderer.call(this, canvas, width, height);

  /**
   * The x offset.
   * @type {number}
   * @private
   */
  this.x_ = 0;

  /**
   * The y offset.
   * @type {number}
   * @private
   */
  this.y_ = 0;

  /**
   * The 2D rendering context attached to the output <canvas> element.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  this.context_ = createjs.getRenderingContext2D(canvas);
};
createjs.inherits('SpriteRenderer',
                  createjs.SpriteSheetBuilder.Renderer,
                  createjs.Renderer);

/** @override @const */
createjs.SpriteSheetBuilder.Renderer.prototype.beginSprite =
    function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  // Create a rectangle clip to prevent this renderer from drawing its outside.
  var context = this.context_;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  this.x_ = x;
  this.y_ = y;
};

/** @override @const */
createjs.SpriteSheetBuilder.Renderer.prototype.endSprite = function() {
  // Deletes the rectangle clip added by the 'beginSprite()' method.
  this.context_.restore();
};

/** @override @const */
createjs.SpriteSheetBuilder.Renderer.prototype.setProperties = function(m) {
  /// <param type="Float32Array" name="m"/>
  this.context_.setTransform(
      m[0], m[1], m[2], m[3], m[4] + this.x_, m[5] + this.y_);
  this.context_.globalAlpha = m[6];
  this.context_.globalCompositeOperation =
      createjs.Renderer.getCompositionName(m[7]);
};

/** @override @const */
createjs.SpriteSheetBuilder.Renderer.prototype.drawPartial =
    function(image, values) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="Float32Array" name="valuess"/>
  this.context_.drawImage(image, values[0], values[1], values[2], values[3],
      values[4], values[5], values[6], values[7]);
};

/** @override @const */
createjs.SpriteSheetBuilder.Renderer.prototype.addObject = function(object) {
  /// <param type="createjs.Renderer.RenderObject" name="object"/>
  object.beginPaintObject(this);
  object.paintObject(this);
};

/**
 * The base-2 logarithm of the maximum number of columns. 
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.MAX_COLUMN_BITS_ = 3;

/**
 * The base-2 logarithm of the maximum number of rows. 
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.MAX_ROW_BITS_ = 3;

/**
 * The maximum number of columns in a <canvas> element generated by this
 * builder, i.e. the maximum number of sprite frames in one row. (This value
 * must be a power of two.)
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.MAX_COLUMNS_ =
    (1 << createjs.SpriteSheetBuilder.MAX_COLUMN_BITS_);

/**
 * The maximum number of rows in a <canvas> element generated by this builder,
 * i.e. the maximum number of sprite frames in one column. (This value must be a
 * power of 2.)
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.MAX_ROWS_ =
    (1 << createjs.SpriteSheetBuilder.MAX_ROW_BITS_);

/**
 * The base-2 logarithm of the width of a sprite frame.
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.FRAME_WIDTH_BITS_ = 8;

/**
 * The base-2 logarithm of the height of a sprite frame.
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.FRAME_HEIGHT_BITS_ = 8;

/**
 * The width of a sprite frame. (This value must be a power of two.)
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.FRAME_WIDTH_ =
    (1 << createjs.SpriteSheetBuilder.FRAME_WIDTH_BITS_);

/**
 * The height of a sprite frame. (This value must be a power of two.)
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.FRAME_HEIGHT_ =
    (1 << createjs.SpriteSheetBuilder.FRAME_HEIGHT_BITS_);

/**
 * The maximum width of a <canvas> element generated by this builder.
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.MAX_FRAME_WIDTH_ =
    createjs.SpriteSheetBuilder.MAX_COLUMNS_ *
    createjs.SpriteSheetBuilder.FRAME_WIDTH_;

/**
 * The maximum height of a <canvas> element generated by this builder.
 * @const {number}
 * @private
 */
createjs.SpriteSheetBuilder.MAX_FRAME_HEIGHT_ =
    createjs.SpriteSheetBuilder.MAX_ROWS_ *
    createjs.SpriteSheetBuilder.FRAME_HEIGHT_;

/**
 * The movie clip to be converted to a sprite sheet.
 * @type {createjs.MovieClip}
 * @private
 */
createjs.SpriteSheetBuilder.prototype.clip_ = null;

/**
 * The viewport rectangle of generated sprite frames. (The bounding box of a
 * movie clip is often too huge to create <canvas> elements to contain all of
 * it. This builder draws only the specified part of a movie clip to save
 * memory.)
 * @type {createjs.Rectangle}
 * @private
 */
createjs.SpriteSheetBuilder.prototype.rectangle_ = null;

/**
 * The scaling factor applied to sprite frames.
 * @type {number}
 * @private
 */
createjs.SpriteSheetBuilder.prototype.scale_ = 1;

/**
 * Initializes this builder.
 * @private
 */
createjs.SpriteSheetBuilder.prototype.initializeBuilder_ = function() {
};

/**
 * Creates a renderer that renders CreateJS-Lite objects to a sprite.
 * @param {number} width
 * @param {number} height
 * @return {createjs.Renderer}
 * @private
 */
createjs.SpriteSheetBuilder.prototype.createRenderer_ = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="createjs.Renderer"/>
  return new createjs.SpriteSheetBuilder.Renderer(width, height);
};

/**
 * Adds a frame to this builder.
 * @param {createjs.DisplayObject} source
 * @param {createjs.Rectangle=} opt_sourceRect
 * @param {number=} opt_scale
 * @return {number}
 * @const
 */
createjs.SpriteSheetBuilder.prototype.addFrame =
    function(source, opt_sourceRect, opt_scale) {
  /// <param type="createjs.DisplayObject" name="source"/>
  /// <param type="createjs.Rectangle" optional="true" name="opt_sourceRect"/>
  /// <param type="number" optional="true" name="opt_scale"/>
  /// <returns type="number"/>
  createjs.notImplemented();
  return -1;
};

/**
 * Adds an animation to this builder.
 * @param {string} name
 * @param {Array.<number>} frames
 * @param {string=} opt_next
 * @param {number=} opt_frequency
 * @const
 */
createjs.SpriteSheetBuilder.prototype.addAnimation =
   function(name, frames, opt_next, opt_frequency) {
  createjs.notImplemented();
};

/**
 * Adds a movie clip to this builder.
 * @param {createjs.MovieClip} clip
 * @param {createjs.Rectangle=} opt_sourceRect
 * @param {number=} opt_scale
 * @const
 */
createjs.SpriteSheetBuilder.prototype.addMovieClip =
    function(clip, opt_sourceRect, opt_scale) {
  /// <param type="createjs.MovieClip" name="clip"/>
  /// <param type="createjs.Rectangle" optional="true" name="opt_sourceRect"/>
  /// <param type="number" optional="true" name="opt_scale"/>
  this.clip_ = clip;
  this.rectangle_ = opt_sourceRect ||
      /** @type {createjs.Rectangle} */ (clip['nominalBounds']);
  this.scale_ = opt_scale || 1;
};

/**
 * Builds a createjs.SpriteSheet instance with the movie clip attached to this
 * builder. This method draws the all frames of the movie clip (attached to this
 * builder) to <canvas> elements and creates a sprite sheet which encapsulates
 * them.
 * @return {createjs.SpriteSheet}
 * @const
 */
createjs.SpriteSheetBuilder.prototype.build = function() {
  /// <returns type="createjs.SpriteSheet"/>
  var images = [];
  var frames = [];

  // Initialize the clipping rectangle (specified by the game) and change the
  // scaling factors of the movie clip to apply it to its children.
  // (CreateJS-Lite does not ignore the properties of this movie clip, i.e. this
  // method does not have to translate its children as CreateJS does.)
  var clip = this.clip_;
  var kClipX = this.rectangle_.x;
  var kClipY = this.rectangle_.y;
  var kClipWidth = this.rectangle_.width;
  var kClipHeight = this.rectangle_.height;
  clip.setScaleX(this.scale_);
  clip.setScaleY(this.scale_);

  // Create a dummy container. (This container is not just avoiding a crash.)
  var container = new createjs.Container();

  // Draw non-final <canvas> elements. Each non-final <canvas> element consists
  // of 'kMaxColumns*kMaxRows' (a constant) frames.
  var kFrameWidth = createjs.SpriteSheetBuilder.FRAME_WIDTH_;
  var kFrameHeight = createjs.SpriteSheetBuilder.FRAME_HEIGHT_;
  var kMaxFrames = createjs.SpriteSheetBuilder.MAX_COLUMNS_ *
                   createjs.SpriteSheetBuilder.MAX_ROWS_;
  var time = -1;
  var duration = clip.getDuration();
  while (duration >= kMaxFrames) {
    var kCanvasWidth = createjs.SpriteSheetBuilder.MAX_FRAME_WIDTH_;
    var kCanvasHeight = createjs.SpriteSheetBuilder.MAX_FRAME_HEIGHT_;
    var renderer = this.createRenderer_(kCanvasWidth, kCanvasHeight);
    var image = createjs.castImage(renderer.getCanvas());
    images.push(image);
    for (var y = 0; y < kCanvasHeight; y += kFrameHeight) {
      for (var x = 0; x < kCanvasWidth; x += kFrameWidth) {
        renderer.beginSprite(x, y, kFrameWidth, kFrameHeight);
        clip.drawFrame(renderer, container, 0, ++time, 1);
        renderer.endSprite();
        var frame = new createjs.SpriteSheet.Frame(
            image, new createjs.Rectangle(x, y, kFrameWidth, kFrameHeight),
            0, 0, kFrameWidth, kFrameHeight);
        frames.push(frame);
      }
    }
    renderer.paint(0);
    duration -= kMaxFrames;
  }
  // Create the final <canvas> element and draw remaining frames to it. (The
  // last <canvas> element consists of 'duration' (non-constant number) frames.)
  if (duration) {
    // Creates a <canvas> element sufficient to contain 'duration' frames.
    var kMaxColumns = createjs.SpriteSheetBuilder.MAX_COLUMNS_;
    var kMaxColumnBits = createjs.SpriteSheetBuilder.MAX_COLUMN_BITS_;
    var kRows = (duration + kMaxColumns - 1) >> kMaxColumnBits;
    var kCanvasWidth = createjs.SpriteSheetBuilder.MAX_FRAME_WIDTH_;
    var kCanvasHeight = kRows << createjs.SpriteSheetBuilder.FRAME_HEIGHT_BITS_;
    var renderer = this.createRenderer_(kCanvasWidth, kCanvasHeight);
    var image = createjs.castImage(renderer.getCanvas());
    images.push(image);
    // Draw non-last rows, each of which consists of 'kMaxColumns' frames, to
    // the last <canvas> element.
    var kLastY = kCanvasHeight - kFrameHeight;
    for (var y = 0; y < kLastY; y += kFrameHeight) {
      for (var x = 0; x < kCanvasWidth; x += kFrameWidth) {
        renderer.beginSprite(x, y, kFrameWidth, kFrameHeight);
        clip.drawFrame(renderer, container, 0, ++time, 1);
        renderer.endSprite();
        var frame = new createjs.SpriteSheet.Frame(
            image, new createjs.Rectangle(x, y, kFrameWidth, kFrameHeight),
            0, 0, kFrameWidth, kFrameHeight);
        frames.push(frame);
      }
    }
    // Draw the last row, which consists of 'duration' rows.
    duration -= kMaxColumns * (kRows - 1);
    var kLastWidth = duration * kFrameWidth;
    for (var x = 0; x < kLastWidth; x += kFrameWidth) {
      renderer.beginSprite(x, kLastY, kFrameWidth, kFrameHeight);
      clip.drawFrame(renderer, container, 0, ++time, 1);
      renderer.endSprite();
      var frame = new createjs.SpriteSheet.Frame(
          image, new createjs.Rectangle(x, y, kFrameWidth, kFrameHeight),
          0, 0, kFrameWidth, kFrameHeight);
      frames.push(frame);
    }
    renderer.paint(0);
  }
  // All frames of this clip have been rendered to <canvas> elements. Create a
  // sprite sheet with the <canvas> elements and initializes the 'animations'
  // property of the sprite sheet from the labels of the clip.
  var sheet = new createjs.SpriteSheet(null);
  sheet.setFrames(images, frames);
  var animations = [];
  var data = {};
  var labels = clip.getLabels();
  var length = labels.length;
  if (length) {
    for (var i = 0; i < length; ++i) {
      var item = labels[i];
      var label = item['label'];
      var start = item['position'];
      var end = (i == length - 1) ? duration : labels[i + 1]['position'];
      var animationFrames = [];
      for (var j = start; j < end; ++j) {
        animationFrames.push(j);
      }
      var animation = new createjs.SpriteSheet.Animation(label);
      animation.setFrames(animationFrames);
      animations.push(label);
      data[label] = animation;
    }
  }
  sheet.setAnimations(animations, data);
  return sheet;
};

/**
 * Builds a cretejs.SpriteSheet instance asynchronously.
 * @param {number=} opt_timeSlice
 */
createjs.SpriteSheetBuilder.prototype.buildAsync = function(opt_timeSlice) {
  /// <param type="number" optional="true" name="opt_timeSlice"/>
  createjs.notImplemented();
};

/**
 * Stops the current asynchronous build.
 * @method stopAsync
 */
createjs.SpriteSheetBuilder.prototype.stopAsync = function() {
  createjs.notImplemented();
};

// Export the createjs.SpriteSheetBuilder object to the global namespace.
createjs.exportObject('createjs.SpriteSheetBuilder',
                      createjs.SpriteSheetBuilder, {
  // createjs.SpriteSheetBuilder methods
  'addFrame': createjs.notImplemented,
  'addAnimation': createjs.notImplemented,
  'addMovieClip': createjs.SpriteSheetBuilder.prototype.addMovieClip,
  'build': createjs.SpriteSheetBuilder.prototype.build,
  'buildAsync': createjs.notImplemented,
  'stopAsync': createjs.notImplemented

  // createjs.EventDispatcher methods
  // createjs.Object methods
});