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
/// <reference path="event_dispatcher.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="config.js"/>
/// <reference path="image_factory.js"/>

/**
 * A class that represents a sprite animation. This class reads a sprite sheet
 * defined in <http://createjs.com/docs/easeljs/classes/SpriteSheet.html> and
 * creates an animation timeline. (A sprite sheet cannot write a complicated
 * animation consisting of multiple CreateJS objects and games mostly use the
 * createjs.MovieClip class.)
 * @param {Object} data
 * @implements {EventListener}
 * @extends {createjs.EventDispatcher}
 * @constructor
 */
createjs.SpriteSheet = function(data) {
  /// <param type="Object" name="data"/>
  createjs.EventDispatcher.call(this);

  if (data) {
    this.parseData_(data);
  }
};
createjs.inherits('SpriteSheet',
                  createjs.SpriteSheet,
                  createjs.EventDispatcher);

/**
 * Indicates whether all images are finished loading, i.e. this sprite sheet
 * is ready to play.
 * @type {boolean}
 */
createjs.SpriteSheet.prototype['complete'] = true;

/**
 * The default frame-rate.
 * @type {number}
 */
createjs.SpriteSheet.prototype.framerate = 0;

/**
 * The list of animation names.
 * @type {Array.<string>}
 * @private
 */
createjs.SpriteSheet.prototype.animations_ = null;

/**
 * The list of animation frames (i.e. a pair of an <image> element and a source 
 * rectangle) generated from a 'frames' parameter.
 * @type {Array.<createjs.SpriteSheet.Frame>}
 * @private
 */
createjs.SpriteSheet.prototype.frames_ = null;

/**
 * The list of <image> elements used by this animation.
 * @type {Array.<HTMLImageElement>}
 * @private
 */
createjs.SpriteSheet.prototype.images_ = null;

/**
 * The mapping table from an animation name to an animation data.
 * @type {Object.<string,createjs.SpriteSheet.Animation>}
 * @private
 */
createjs.SpriteSheet.prototype.data_ = null;

/**
 * The number of <image> elements being loaded now.
 * @type {number}
 * @private
 */
createjs.SpriteSheet.prototype.loadCount_ = 0;

/**
 * The value of a 'frames' parameter.
 * @type {Object}
 * @private
 */
createjs.SpriteSheet.prototype.frameData_ = null;

/**
 * The number of animation frames.
 * @type {number}
 * @private
 */
createjs.SpriteSheet.prototype.numFrames_ = 0;

/**
 * A class representing a frame used by the createjs.SpriteSheet object.
 * @param {HTMLImageElement} image
 * @param {createjs.Rectangle} rectangle
 * @param {number} regX
 * @param {number} regY
 * @param {number} width
 * @param {number} height
 * @constructor
 */
createjs.SpriteSheet.Frame =
    function(image, rectangle, regX, regY, width, height) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="createjs.Rectangle" name="rectangle"/>
  /// <param type="number" name="regX"/>
  /// <param type="number" name="regY"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>

  /**
   * The source image of this frame.
   * @const {HTMLImageElement}
   */
  this.image = image;

  /**
   * The source rectangle of this frame.
   * @const {createjs.Rectangle}
   */
  this.rect = rectangle;

  /**
   * The x position of the destination of this frame.
   * @const {number}
   */
  this.regX = regX;

  /**
   * The y position of the destination of this frame.
   * @const {number}
   */
  this.regY = regY;
};

/**
 * Creates a createjs.SpriteSheet.Frame object.
 * @param {HTMLImageElement} image
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} regX
 * @param {number} regY
 * @return {createjs.SpriteSheet.Frame}
 * @private
 */
createjs.SpriteSheet.Frame.create_ =
    function(image, x, y, width, height, regX, regY) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" name="regX"/>
  /// <param type="number" name="regY"/>
  var rectangle = new createjs.Rectangle(x, y, width, height);
  return new createjs.SpriteSheet.Frame(
      image, rectangle, regX, regY, width, height);
};

/**
 * A class representing a frame used by the createjs.SpriteSheet object.
 * @param {string} name
 * @constructor
 */
createjs.SpriteSheet.Animation = function(name) {
  /// <param type="string" name="name"/>
  /**
   * @const {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {Array.<number>}
   * @private
   */
  this.frames_ = null;

  /**
   * @type {number}
   * @private
   */
  this.speed_ = 1;

  /**
   * @type {string}
   * @private
   */
  this.next_ = '';
};

/**
 * Returns the name of this animation.
 * @return {string}
 * @const
 */
createjs.SpriteSheet.Animation.prototype.getName = function() {
  /// <returns type="string"/>
  return this.name_;
};

/**
 * Returns the speed of this animation.
 * @return {number}
 * @const
 */
createjs.SpriteSheet.Animation.prototype.getSpeed = function() {
  /// <returns type="number"/>
  return this.speed_;
};

/**
 * Changes the speed of this animation.
 * @param {number} speed
 * @const
 */
createjs.SpriteSheet.Animation.prototype.setSpeed = function(speed) {
  /// <returns type="number"/>
  this.speed_ = speed;
};

/**
 * Returns the next animation.
 * @return {string}
 * @const
 */
createjs.SpriteSheet.Animation.prototype.getNext = function() {
  /// <returns type="string"/>
  return this.next_;
};

/**
 * Sets the next animation.
 * @param {string} next
 * @const
 */
createjs.SpriteSheet.Animation.prototype.setNext = function(next) {
  /// <returns type="string"/>
  this.next_ = next;
};

/**
 * Returns the frames of which this animation consists.
 * @return {number}
 * @const
 */
createjs.SpriteSheet.Animation.prototype.getFrameLength = function() {
  /// <returns type="number"/>
  return this.frames_.length;
};

/**
 * Returns the frames of which this animation consists.
 * @return {number}
 * @const
 */
createjs.SpriteSheet.Animation.prototype.getFrame = function(frame) {
  /// <returns type="number"/>
  return this.frames_[frame];
};

/**
 * Parses an 'animation' section of a SpriteSheet object.
 * @param {string} key
 * @param {*} value
 * @private
 * @const
 */
createjs.SpriteSheet.Animation.prototype.parse_ = function(key, value) {
  /// <signature>
  ///   <param type="string" name="key"/>
  ///   <param type="number" name="value"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="key"/>
  ///   <param type="Array" elementType="number" name="value"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="key"/>
  ///   <param type="Object" name="value"/>
  /// </signature>
  if (createjs.isNumber(value)) {
    // This animation is a single-frame animation, which consists only of a
    // frame number as listed below.
    //   'animations': {
    //     'stand': 7
    //   }
    this.frames_ = [createjs.getNumber(value)];
  } else if (createjs.isArray(value)) {
    // This animation is a simple animation, which is an array consisting of up
    // to four parameters (a start frame, an end frame, an animation name, and a
    // speed) as listed below.
    //   'animations': {
    //     'run': [0, 8],
    //     'jump': [9, 12, 'run', 2],
    //   }
    var parameters = createjs.getArray(value);
    if (parameters.length == 1) {
      this.frames_ = [createjs.getNumber(parameters[0])];
    } else {
      this.frames_ = [];
      var start = createjs.getNumber(parameters[0]);
      var end = createjs.getNumber(parameters[1]);
      for (var i = start; i <= end; ++i) {
        this.frames_.push(i);
      }
      if (parameters[2]) {
        this.next_ = key;
      }
      this.speed_ = createjs.castNumber(parameters[3]) || 1;
    }
  } else {
    // This animation is a complex animation, which is an Object consisting of
    // up to three parameters ('frame', 'next', and 'speed') as listed below.
    //   'animations': {
    //     'run': {
    //       'frames: [1, 2, 4, 4, 2, 1]
    //     },
    //     'jump': {
    //       'frames': [1, 4, 5, 6, 1],
    //       'next': 'run',
    //       'speed': 2
    //     },
    //     'stand': {
    //       'frames': [7],
    //     }
    //   }
    this.speed_ = createjs.castNumber(value['speed']) || 1;
    this.next_ = createjs.castString(value['next']) || '';
    var frames = value['frames'];
    if (createjs.isNumber(frames)) {
      this.frames_ = [createjs.getNumber(frames)];
    } else {
      var parameters = createjs.getArray(frames);
      this.frames_ = parameters.slice(0);
    }
  }
  if (this.frames_.length < 2 && this.next_ == key) {
    this.next_ = '';
  }
  if (!this.speed_) {
    this.speed_ = 1;
  }
};

// Adds getters and setters so games can access animation properties.
Object.defineProperties(createjs.SpriteSheet.Animation.prototype, {
  'name': {
    get: createjs.SpriteSheet.Animation.prototype.getName
  },
  'speed': {
    get: createjs.SpriteSheet.Animation.prototype.getSpeed,
    set: createjs.SpriteSheet.Animation.prototype.setSpeed
  },
  'next': {
    get: createjs.SpriteSheet.Animation.prototype.getNext,
    set: createjs.SpriteSheet.Animation.prototype.setNext
  }
});

/**
 * Retrieves an image or creates one. The input parameter for this method is
 * one of a string, an HTMLImageElement object, or an HTMLCanvasElement object.
 * If the parameter is a string, this method creates a new HTMLImageElement and
 * loads an image from the string. Otherwise, this method just changes its type
 * to HTMLImageElement to avoid a warning.
 * @param {*} image
 * @return {HTMLImageElement}
 * @private
 * @const
 */
createjs.SpriteSheet.prototype.getImage_ = function(image) {
  /// <signature>
  ///   <param type="string" name="path"/>
  ///   <returns type="HTMLImageElement"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  ///   <returns type="HTMLImageElement"/>
  /// </signature>
  if (createjs.isString(image)) {
    var path = createjs.getString(image);
    return createjs.ImageFactory.get(
        path, path, this, createjs.DEFAULT_TEXTURE);
  }
  return /** @type {HTMLImageElement} */ (image);
};

/**
 * Generates frames from images. This method divides each image of this object
 * into partial images (whose size is specified in the frameData_ property) and
 * adds these partial images to the frame_ property.
 * @private
 * @const
 */
createjs.SpriteSheet.prototype.calculateFrames_ = function() {
  if (this.frames_ || !this.frameData_) {
    return;
  }
  var data = this.frameData_;
  var width = data['width'] || 0;
  var height = data['height'] || 0;
  var regX = data['regX'] || 0;
  var regY = data['regY'] || 0;
  var count = data['count'] || 0;
  this.frameData_ = null;
  createjs.assert(width > 0 && height > 0);

  this.frames_ = [];
  var images = this.images_;
  var length = images.length;
  for (var i = 0; i < length; ++i) {
    var image = images[i];
    var cols = createjs.floor(image.width / width);
    var rows = createjs.floor(image.height / height);
    var frames = cols * rows;
    if (count > 0) {
      frames = createjs.min(count, frames);
      count -= frames;
    }
    for (var j = 0; j < frames; ++j) {
      var x = (j % cols) * width;
      var y = createjs.floor(j / cols) * height;
      this.frames_.push(createjs.SpriteSheet.Frame.create_(
          image, x, y, width, height, regX, regY));
    }
  }
};

/**
 * Parses the specified SpriteSheet object and initializes this object.
 * @param {Object} data
 * @private
 * @const
 */
createjs.SpriteSheet.prototype.parseData_ = function(data) {
  /// <param type="Object" name="data"/>
  this.framerate = data['framerate'] || 0;

  // Parse an 'images' parameter. An 'images' parameter is an array of either
  // <image> elements or URLs.
  if (data['images']) {
    this.images_ = [];
    var images = createjs.castArray(data['images']);
    var length = images.length;
    for (var i = 0; i < length; ++i) {
      var image = this.getImage_(images[i]);
      this.images_.push(image);
      if (!image.complete) {
        ++this.loadCount_;
        this['complete'] = false;
      }
    }
  }

  // Parse a 'frames' parameter. An 'frames' parameter is either an array of
  // frame rectangles or an object (representing consecutive frames).
  if (data['frames']) {
    if (createjs.isArray(data['frames'])) {
      this.frames_ = [];
      var frames = createjs.getArray(data['frames']);
      var length = frames.length;
      for (var i = 0; i < length; ++i) {
        var parameters = createjs.getArray(frames[i]);
        var x = parameters[0];
        var y = parameters[1];
        var width = parameters[2];
        var height = parameters[3];
        var image = this.images_[parameters[4] ? parameters[4] : 0];
        var regX = parameters[5] || 0;
        var regY = parameters[6] || 0;
        this.frames_.push(createjs.SpriteSheet.Frame.create_(
            image, x, y, width, height, regX, regY));
      }
    } else {
      // Save the 'frames' parameter and its count to parse this parameter when
      // the hosting browser finishes loading all images used by this sprite
      // sheet. (This parameter depends on the image sizes.)
      this.frameData_ = data['frames'];
      this.numFrames_ = this.frameData_['count'] || 0;
      if (!this.loadCount_) {
        this.calculateFrames_();
      }
    }
  }

  // Parse an 'animations' parameter. An 'animations' parameter is an object.
  // Each value is one of a number, an array, or an object, as described in the
  // parse_() method.
  this.animations_ = [];
  var animations = data['animations'];
  if (animations) {
    this.data_ = {};
    for (var key in animations) {
      var animation = new createjs.SpriteSheet.Animation(key);
      animation.parse_(key, animations[key]);
      this.animations_.push(key);
      this.data_[key] = animation;
    }
  }
};

/**
 * Returns whether this sprite sheet is ready to play.
 * @return {boolean}
 * @const
 */
createjs.SpriteSheet.prototype.isComplete = function() {
  /// <returns type="boolean"/>
  return this['complete'];
};

/**
 * Returns the total number of frames in this sprite sheet.
 * @return {number}
 * @const
 */
createjs.SpriteSheet.prototype.getFrameLength = function() {
  /// <returns type="number"/>
  return this.frames_ ? this.frames_.length : this.numFrames_;
};

/**
 * Returns the total number of frames in the specified animation, or in the
 * whole sprite sheet if the animation param is omitted.
 * @param {string} animation
 * @return {number}
 * @const
 */
createjs.SpriteSheet.prototype.getNumFrames = function(animation) {
  /// <param type="string" name="animation"/>
  /// <returns type="number"/>
  if (!animation) {
    return this.getFrameLength();
  }
  var data = this.data_[animation];
  if (!data) {
    return 0;
  }
  return data.getFrameLength();
};

/**
 * Returns all available animation names.
 * @return {Array.<string>}
 * @const
 */
createjs.SpriteSheet.prototype.getAnimations = function() {
  /// <returns type="Array" elementType="string"/>
  return this.animations_.slice(0);
};

/**
 * Returns an animation.
 * @param {string} name
 * @return {createjs.SpriteSheet.Animation}
 * @const
 */
createjs.SpriteSheet.prototype.getAnimation = function(name) {
  /// <param type="string" name="name"/>
  /// <returns type="createjs.SpriteSheet.Animation"/>
  return this.data_[name];
};

/**
 * Returns an animation frame.
 * @param {number} index
 * @return {createjs.SpriteSheet.Frame}
 * @const
 */
createjs.SpriteSheet.prototype.getFrame = function(index) {
  /// <param type="number" name="frameIndex"/>
  /// <returns type="createjs.SpriteSheet.Frame"/>
  return this.frames_ ? this.frames_[index] : null;
};

/**
 * Returns a bounding box of the specified frame.
 * @param {number} index
 * @param {createjs.Rectangle=} opt_rectangle
 * @return {createjs.Rectangle}
 * @const
 */
createjs.SpriteSheet.prototype.getFrameBounds = function(index, opt_rectangle) {
  /// <param type="number" name="index"/>
  /// <param type="createjs.Rectangle" optional="true" name="opt_rectangle"/>
  /// <returns type="createjs.Rectangle"/>
  var frame = this.getFrame(index);
  if (!frame) {
    return null;
  }
  var rectangle = opt_rectangle || new createjs.Rectangle(0, 0, 0, 0);
  return rectangle.initialize(
      -frame.regX, -frame.regY, frame.rect.width, frame.rect.height);
};

/** @override */
createjs.SpriteSheet.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  var type = event.type;
  var image = /** @type{HTMLImageElement} */ (event.target);
  createjs.ImageFactory.removeListeners(image, this);
  if (type == 'load') {
    if (--this.loadCount_ == 0) {
      this.calculateFrames_();
      this['complete'] = true;
      this.dispatchNotification('complete');
    }
  }
};

// Export the createjs.SpriteSheet object to the global namespace.
createjs.exportObject('createjs.SpriteSheet', createjs.SpriteSheet, {
  // createjs.SpriteSheet methods
  'getNumFrames': createjs.SpriteSheet.prototype.getNumFrames,
  'getAnimations': createjs.SpriteSheet.prototype.getAnimations,
  'getAnimation': createjs.SpriteSheet.prototype.getAnimation,
  'getFrame': createjs.SpriteSheet.prototype.getFrame,
  'getFrameBounds': createjs.SpriteSheet.prototype.getFrameBounds
});
