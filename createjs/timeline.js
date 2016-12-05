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
/// <reference path="tick_listener.js"/>
/// <reference path="ticker.js"/>
/// <reference path="tween_object.js"/>

/**
 * A class that contains multiple createjs.Tween objects and updates them
 * synchronously.
 * @param {Array.<createjs.TweenObject>} tweens
 * @param {Object.<string,number>} labels
 * @param {Object.<string,boolean|number>=} opt_properties
 * @extends {createjs.EventDispatcher}
 * @implements {createjs.TickListener}
 * @constructor
 */
createjs.Timeline = function(tweens, labels, opt_properties) {
  createjs.EventDispatcher.call(this);

  /**
   * The tweens controlled by this timeline.
   * @type {Array.<createjs.TweenObject>}
   * @private
   */
  this.tweens_ = [];

  /**
   * A mapping table from a label name to its position.
   * @type {Object.<string,number>}
   * @private
   */
  this.labels_ = labels;

  if (opt_properties) {
    this.loop_ = !!opt_properties['loop'];
    this.paused_ = !!opt_properties['paused'];
    this.position_ = /** @type {number} */ (opt_properties['position']) || -1;
  }
  this.addTweens_(tweens, tweens.length);

  // Over-write the 'paused_' property to force the 'setPaused()' method to
  // start this tween if an application likes to start it now. The 'setPaused()'
  // method starts this timeline or stops it only when its state has been
  // changed from the current one.
  if (!this.paused_) {
    this.paused_ = true;
    this.setPaused(false);
  }
};
createjs.inherits('Timeline', createjs.Timeline, createjs.EventDispatcher);

/**
 * The total duration of this timeline in milliseconds (or ticks).
 * @type {number}
 */
createjs.Timeline.prototype['duration'] = 0;

/**
 * The tweens controlled by this timeline.
 * @type {Array.<createjs.TweenObject>}
 * @private
 */
createjs.Timeline.prototype.tweens_ = null;

/**
 * A mapping table from a label name to its position.
 * @type {Object.<string,number>}
 * @private
 */
createjs.Timeline.prototype.labels_ = null;

/**
 * Whether this timeline loops when it reaches its end.
 * @type {boolean}
 * @private
 */
createjs.Timeline.prototype.loop_ = false;

/**
 * Whether this timeline is playing its tweens.
 * @type {boolean}
 * @private
 */
createjs.Timeline.prototype.paused_ = false;

/**
 * Adds an array tweens to this timeline.
 * @param {Array.<createjs.TweenObject>} tweens
 * @param {number} length
 * @private
 */
createjs.Timeline.prototype.addTweens_ = function(tweens, length) {
  /// <param type="Array" elementType="createjs.TweenObject" name="tweens"/>
  /// <param type="number" name="length"/>
  var targets = [];
  for (var i = 0; i < length; ++i) {
    var tween = tweens[i];
    for (var j = 0; j < this.tweens_.length; ++j) {
      if (tween === this.tweens_[j]) {
        tween = null;
        break;
      }
    }
    if (tween) {
      var duration = tween.setProxy(null, targets, null, 0);
      if (this['duration'] < duration) {
        this['duration'] = duration;
      }
      tween.setProperties(this.loop_, this.position_, false);
      this.tweens_.push(tween);
    }
  }
};

/**
 * Adds one or more tweens to this timeline.
 * @param {...createjs.TweenObject} var_args
 * @return {createjs.TweenObject}
 * @const
 */
createjs.Timeline.prototype.addTween = function(var_args) {
  /// <param type="createjs.TweenObject" name="var_args"/>
  /// <returns type="createjs.TweenObject"/>
  var args = arguments;
  var length = args.length;
  createjs.assert(length > 0);
  this.addTweens_(
      /** @type {Array.<createjs.TweenObject>} */ (/** @type {*} */ (args)),
      length);
  return args[0];
};

/**
 * Removes one or more tweens from this timeline.
 * @param {...createjs.TweenObject} var_args
 * @return {boolean}
 * @const
 */
createjs.Timeline.prototype.removeTween = function(var_args) {
  /// <param type="createjs.TweenObject" name="var_args"/>
  /// <returns type="boolean"/>
  createjs.notImplemented();
  return false;
};

/**
 * Adds a label that can be used with the gotoAndPlay() method.
 * @param {string} label
 * @param {number} position
 * @const
 */
createjs.Timeline.prototype.addLabel = function(label, position) {
  /// <param type="string" name="label"/>
  /// <param type="number" name="position"/>
  createjs.notImplemented();
  this.labels_[label] = position;
};

/**
 * Sets labels for this timeline.
 * @param {Object.<string,number>=} opt_labels
 * @const
 */
createjs.Timeline.prototype.setLabels = function(opt_labels) {
  /// <param type="Object" name="labels"/>
  createjs.notImplemented();
};

/**
 * Returns the sorted list of the labels added to this timeline.
 * @return {Array.<createjs.MovieClip.Label>}
 * @const
 */
createjs.Timeline.prototype.getLabels = function() {
  /// <returns type="Array" elementType="createjs.MovieClip.Label"/>
  createjs.notImplemented();
  return null;
};
  
/**
 * Returns the name of the label on or immediately before the current position.
 * @return {string}
 * @const
 */
createjs.Timeline.prototype.getCurrentLabel = function() {
  /// <returns type="string"/>
  createjs.notImplemented();
  return '';
};

/**
 * Pauses or plays this timeline.
 * @param {boolean} value
 * @const
 */
createjs.Timeline.prototype.setPaused = function(value) {
  /// <param type="boolean" name="value"/>
  var paused = !!value;
  if (this.paused_ == paused) {
    return;
  }
  this.paused_ = paused;
  var time = createjs.Ticker.getRunTime();
  if (paused) {
    for (var i = 0; i < this.tweens_.length; ++i) {
      this.tweens_[i].stopTween(time);
    }
    createjs.Ticker.removeListener('tick', this);
  } else {
    for (var i = 0; i < this.tweens_.length; ++i) {
      this.tweens_[i].playTween(time);
    }
    createjs.Ticker.addListener('tick', this);
  }
};

/**
 * Starts playing this timeline from the specified position.
 * @param {string|number} value
 */
createjs.Timeline.prototype.gotoAndPlay = function(value) {
  /// <param name="value"/>
  createjs.notImplemented();
};

/**
 * Stops playing this timeline and jumps to the specified position.
 * @param {string|number} value
 */
createjs.Timeline.prototype.gotoAndStop = function(value) {
  /// <param name="value"/>
  createjs.notImplemented();
};

/** @override */
createjs.Timeline.prototype.handleTick = function(time) {
  var playing = 0;
  for (var i = 0; i < this.tweens_.length; ++i) {
    var tween = this.tweens_[i];
    tween.updateTween(time, createjs.TweenTarget.PlayMode.INDEPENDENT, -1);
    playing |= tween.isEnded() ? 0 : 1;
  }
  if (!playing) {
    createjs.Ticker.removeListener('tick', this);
  }
};

// Export the createjs.Timeline object to the global namespace.
createjs.exportObject('createjs.Timeline',
                      createjs.Timeline, {
  // createjs.Timeline methods.
  'addTween': createjs.Timeline.prototype.addTween,
  'removeTween': createjs.Timeline.prototype.removeTween,
  'addLabel': createjs.Timeline.prototype.addLabel,
  'setLabels': createjs.Timeline.prototype.setLabels,
  'getLabels': createjs.Timeline.prototype.getLabels,
  'getCurrentLabel': createjs.Timeline.prototype.getCurrentLabel,
  'setPaused': createjs.Timeline.prototype.setPaused,
  'gotoAndPlay': createjs.Timeline.prototype.gotoAndPlay,
  'gotoAndStop': createjs.Timeline.prototype.gotoAndStop
});
