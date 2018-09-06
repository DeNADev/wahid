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
/// <reference path="bounding_box.js"/>
/// <reference path="display_object.js"/>
/// <reference path="sprite_sheet.js"/>
/// <reference path="tick_event.js"/>

/**
 * A class that displays a frame or sequence of frames (i.e. an animation) in a
 * createjs.SpriteSheet object.
 * @param {createjs.SpriteSheet} spriteSheet
 * @param {(string|number)=} opt_frameOrAnimation
 * @extends {createjs.DisplayObject}
 * @constructor
 */
createjs.Sprite = function(spriteSheet, opt_frameOrAnimation) {
  /// <param type="createjs.SpriteSheet" optional="true" name="spriteSheet"/>
  /// <param type="string" optional="true" name="opt_frameOrAnimation"/>
  createjs.DisplayObject.call(this);
  if (spriteSheet != null) {
    this.initializeSprite_(spriteSheet);
    if (opt_frameOrAnimation != null) {
      this.gotoAndPlay(opt_frameOrAnimation);
    }
  }
};
createjs.inherits('Sprite', createjs.Sprite, createjs.DisplayObject);

/**
 * The SpriteSheet instance exported to applications.
 * @type {createjs.SpriteSheet}
 */
createjs.Sprite.prototype['spriteSheet'] = null;

/**
 * The SpriteSheet instance being played.
 * @type {createjs.SpriteSheet}
 * @private
 */
createjs.Sprite.prototype.spriteSheet_ = null;

/**
 * The number of frames to advance.
 * @type {number}
 * @private
 */
createjs.Sprite.prototype.framerate_ = 0;

/**
 * The name of the animation being played.
 * @type {string}
 * @private
 */
createjs.Sprite.prototype.currentAnimation = '';

/**
 * The frame index within the animation being played.
 * @type {number}
 * @private
 */
createjs.Sprite.prototype.currentAnimationFrame = 0;

/**
 * The last time when this sprite has been updated.
 * @type {number}
 * @private
 */
createjs.Sprite.prototype.lastTime_ = 0;

/**
 * @type {createjs.SpriteSheet.Animation}
 * @private
 */
createjs.Sprite.prototype.animation_ = null;

/**
 * Initializes this sprite.
 * @param {createjs.SpriteSheet} spriteSheet
 * @private
 */
createjs.Sprite.prototype.initializeSprite_ = function(spriteSheet) {
  /// <param type="createjs.SpriteSheet" name="spriteSheet"/>
  this['spriteSheet'] = spriteSheet;
  this.spriteSheet_ = spriteSheet;
  this.framerate_ = spriteSheet.framerate;
};

/**
 * Updates the bounding box of this sprite and sets its dirty flag when this
 * sprite has its frame updated.
 * @param {number} currentFrame
 * @private
 */
createjs.Sprite.prototype.updateShape_ = function(currentFrame) {
  /// <param type="number" name="currentFrame"/>
  if (currentFrame != this.getCurrentFrame()) {
    var frame = this.spriteSheet_.getFrame(this.getCurrentFrame());
    if (!frame) {
      return;
    }
    var minX = frame.values[4];         // -frame.regX;
    var minY = frame.values[5];         // -frame.regY;
    var maxX = minX + frame.values[6];  // frame.width;
    var maxY = minY + frame.values[7];  // frame.height;
    this.setBoundingBox(minX, minY, maxX, maxY);
    this.dirty |= createjs.DisplayObject.DIRTY_SHAPE;
  }
};

/**
 * Normalizes the current animation frame, advancing animations and dispatching
 * callbacks as appropriate.
 * @private
 */
createjs.Sprite.prototype.normalizeAnimation_ = function() {
  var TYPE = 'animationend';
  var hasListener = this.hasListener(TYPE);
  var animation = this.animation_;
  var frame = createjs.floor(this.currentAnimationFrame);
  var length = animation.getFrameLength();
  while (frame >= length) {
    var next = animation.getNext();
    if (hasListener) {
      var event = new createjs.AnimationEvent(
          TYPE, false, false, animation.getName(), next);
      this.dispatchRawEvent(event);
    }
    if (!next) {
      this.setIsPaused(true);
      frame = length - 1;
      break;
    }
    animation = this.spriteSheet_.getAnimation(next);
    frame -= length;
    length = animation.getFrameLength();
  }
  this.currentAnimationFrame = frame;
  this.setCurrentFrame(animation.getFrame(frame));
  this.animation_ = animation;
};

/**
 * Normalizes the current frame, advancing animations and dispatching callbacks
 * as appropriate.
 * @private
 */
createjs.Sprite.prototype.normalizeFrame_ = function() {
  var TYPE = 'animationend';
  var hasListener = this.hasListener(TYPE);
  var frame = createjs.floor(this.getCurrentFrame());
  var length = this.spriteSheet_.getFrameLength();
  while (frame >= length) {
    if (hasListener) {
      var event = new createjs.AnimationEvent(TYPE, false, false, '', '');
      this.dispatchRawEvent(event);
    }
    frame -= length;
  }
  this.setCurrentFrame(frame);
};

/**
 * Moves the play offset to the specified frame number or the beginning of the
 * specified animation.
 * @param {boolean} paused
 * @param {string|number} frameOrAnimation
 * @private
 */
createjs.Sprite.prototype.goto_ = function(paused, frameOrAnimation) {
  this.setIsPaused(paused);
  var currentFrame = this.getCurrentFrame();
  if (createjs.isString(frameOrAnimation)) {
    var name = createjs.getString(frameOrAnimation);
    if (this.currentAnimation != name) {
      var animation = this.spriteSheet_.getAnimation(name);
      createjs.assert(!!animation);
      this.animation_ = animation;
      this.currentAnimation = name;
      this.setCurrentFrame(animation.getFrame(0));
    }
    this.currentAnimationFrame = 0;
  } else {
    var frame = createjs.getNumber(frameOrAnimation);
    this.currentAnimationFrame = 0;
    this.currentAnimation = '';
    this.animation_ = null;
    this.setCurrentFrame(frame);
    this.normalizeFrame_();
  }
  this.updateShape_(currentFrame);
};

/**
 * Starts playing (unpause) the current animation. The Sprite will be paused if
 * either the Sprite.stop() method or the Sprite.gotoAndStop() method is called.
 * Single frame animations will remain unchanged.
 * @const
 */
createjs.Sprite.prototype.play = function() {
  this.setIsPaused(false);
  this.dirty = createjs.DisplayObject.DIRTY_ALL;
};

/**
 * Stops playing a running animation. The Sprite will be playing if the
 * Sprite.gotoAndPlay() method is called. Note that calling the
 * Sprite.gotoAndPlay() method or the Sprite.play() method will resume playback.
 * @const
 */
createjs.Sprite.prototype.stop = function() {
  this.setIsPaused(true);
};

/**
 * Sets paused to false and plays the specified animation name, named frame, or
 * frame number.
 * @param {string|number} value
 * @const
 */
createjs.Sprite.prototype.gotoAndPlay = function(value) {
  this.goto_(false, value);
  this.dirty = createjs.DisplayObject.DIRTY_ALL;
};

/**
 * Sets paused to true and seeks to the specified animation name, named frame,
 * or frame number.
 * @param {string|number} value
 * @const
 */
createjs.Sprite.prototype.gotoAndStop = function(value) {
  this.goto_(true, value);
};

/**
 * Advances the play position. This occurs automatically each tick by default.
 * @param {number=} opt_time
 * @const
 */
createjs.Sprite.prototype.advance = function(opt_time) {
  var time = 1;
  if (opt_time && this.framerate_) {
    time = opt_time * this.framerate_ / 1000;
  }
  var currentFrame = this.getCurrentFrame();
  if (this.animation_) {
    this.currentAnimationFrame += time * this.animation_.getSpeed();
    this.normalizeAnimation_();
  } else {
    this.setCurrentFrame(currentFrame + time);
    this.normalizeFrame_();
  }
  this.updateShape_(currentFrame);
};
  
/** @override */
createjs.Sprite.prototype.isVisible = function() {
  if (!createjs.Sprite.superClass_.isVisible.call(this)) {
    return false;
  }
  return this.spriteSheet_.isComplete();
};

/** @override */
createjs.Sprite.prototype.removeAllChildren = function(opt_destroy) {
  this['spriteSheet'] = null;
  this.spriteSheet_ = null;
};

/** @override */
createjs.Sprite.prototype.layout =
    function(renderer, parent, dirty, time, draw) {
  /// <param type="createjs.Renderer" name="renderer"/>
  /// <param type="createjs.DisplayObject" name="parent"/>
  /// <param type="number" name="dirty"/>
  /// <param type="number" name="time"/>
  /// <param type="number" name="draw"/>
  if (!this.spriteSheet_.isComplete()) {
    return 0;
  }
  if (!this.isPaused()) {
    var delta = time - this.lastTime_;
    if (delta > 0) {
      this.advance(time);
    }
    this.lastTime_ = time;
  }
  return createjs.Sprite.superClass_.layout.call(
      this, renderer, parent, dirty, time, draw);
};

/** @override */
createjs.Sprite.prototype.paintObject = function(renderer) {
  var frame =
      this.spriteSheet_.getFrame(createjs.floor(this.getCurrentFrame()));
  createjs.assert(!!frame);
  renderer.drawPartial(frame.image, frame.values);
};

// Export the createjs.Sprite object to the global namespace.
createjs.exportObject('createjs.Sprite', createjs.Sprite, {
  // createjs.Sprite methods
  'play': createjs.Sprite.prototype.play,
  'stop': createjs.Sprite.prototype.stop,
  'gotoAndPlay': createjs.Sprite.prototype.gotoAndPlay,
  'gotoAndStop': createjs.Sprite.prototype.gotoAndStop,
  'advance': createjs.Sprite.prototype.advance

  // createjs.DisplayObject methods

  // createjs.EventDispatcher methods

  // createjs.Object methods.
});
