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
/// <reference path="container.js"/>
/// <reference path="tween_target.js"/>
/// <reference path="tween_object.js"/>

/**
 * A class that associates a createjs.Timeline object with a createjs.Container
 * object.
 * @param {string=} opt_mode
 * @param {number=} opt_position
 * @param {boolean=} opt_loop
 * @param {Object.<string,number>=} opt_labels
 * @extends {createjs.Container}
 * @constructor
 */
createjs.MovieClip = function(opt_mode, opt_position, opt_loop, opt_labels) {
  createjs.Container.call(this);

  /**
   * The first frame to play in this clip. (Its default value is used for
   * preventing an infinite loop and it must be 0 for now.)
   * @type {number}
   * @private
   */
  this.startPosition_ = opt_position || 0;

  /**
   * Whether this clip loops when it reaches its end.
   * @type {boolean}
   * @private
   */
  this.loop_ = (opt_loop == null) ? true : !!opt_loop;

  /**
   * The label set, i.e. a mapping table from a string to a frame number.
   * @type {Object.<string,number>}
   * @private
   */
  this.labels_ = opt_labels || {};

  /**
   * The timeline object for this clip.
   * @type {createjs.MovieClip.Timeline}
   * @private
   */
  this.timeline_ = new createjs.MovieClip.Timeline(this);

  // Initialize the play mode of the tweens to be added to this clip.
  this.setPlayMode(createjs.MovieClip.getMode_(opt_mode));
};
createjs.inherits('MovieClip', createjs.MovieClip, createjs.Container);

/**
 * An inner class used by the 'createjs.MovieClip.getLabels()' method.
 * @param {string} label
 * @param {number} position
 * @constructor
 */
createjs.MovieClip.Label = function(label, position) {
  /**
   * @const {string}
   * @private
   */
  this['label'] = label;

  /**
   * @const {number}
   * @private
   */
  this['position'] = position;
};

/**
 * Returns a sorted list of the labels defined on this timeline.
 * @param {createjs.MovieClip.Label} a
 * @param {createjs.MovieClip.Label} b
 * @return {number}
 * @private
 */
createjs.MovieClip.Label.sortFunction_ = function(a, b) {
  /// <param type="createjs.MovieClip.Label" name="a"/>
  /// <param type="createjs.MovieClip.Label" name="b"/>
  /// <returns type="number"/>
  return a['position'] - b['position'];
};

/**
 * An inner class that synchronizes multiple createjs.Tween objects and controls
 * them.
 * @param {createjs.MovieClip} clip
 * @constructor
 */
createjs.MovieClip.Timeline = function(clip) {
  /**
   * @type {createjs.MovieClip}
   * @private
   */
  this.clip_ = clip;
};

/**
 * Returns the duration of this timeline.
 * @return {number}
 */
createjs.MovieClip.Timeline.prototype.getDuration = function() {
  /// <returns type="number"/>
  return this.clip_.getDuration();
};

/**
 * Returns the current position of this timeline.
 * @return {number}
 */
createjs.MovieClip.Timeline.prototype.getPosition = function() {
  /// <returns type="number"/>
  return this.clip_.getPosition();
};

/**
 * Adds one or more tweens (or timelines) to this timeline.
 * @param {...createjs.TweenObject} var_args
 * @return {createjs.TweenObject}
 * @private
 */
createjs.MovieClip.Timeline.prototype.addTween = function(var_args) {
  /// <param type="createjs.TweenObject" name="var_args"/>
  /// <returns type="createjs.TweenObject"/>
  var args = arguments;
  var length = args.length;
  if (length == 0) {
    return null;
  }
  for (var i = 0; i < length; ++i) {
    this.clip_.addTween(args[i]);
  }
  return args[0];
};

/**
 * Removes one or more tweens from this timeline.
 * @param {...createjs.TweenObject} var_args
 * @return {boolean}
 * @private
 */
createjs.MovieClip.Timeline.prototype.removeTween = function(var_args) {
  /// <param type="createjs.TweenObject" name="var_args"/>
  /// <returns type="boolean"/>
  var removed = false;
  var args = arguments;
  var length = args.length;
  for (var i = 0; i < length; ++i) {
    var tween = /** @type {createjs.TweenObject} */ (args[i]);
    if (this.clip_.removeTween(tween)) {
      removed = true;
    }
  }
  return removed;
};

/**
 * Adds a label that can be used with the gotoAndPlay() method.
 * @param {string} label
 * @param {number} position
 * @private
 */
createjs.MovieClip.Timeline.prototype.addLabel = function(label, position) {
  /// <param type="string" name="label"/>
  /// <param type="number" name="position"/>
  this.clip_.addLabel(label, position);
};

/**
 * Sets labels for this timeline.
 * @param {Object.<string,number>=} opt_labels
 * @private
 */
createjs.MovieClip.Timeline.prototype.setLabels = function(opt_labels) {
  /// <param type="Object" name="labels"/>
  this.clip_.setLabels(opt_labels || {});
};

/**
 * Returns the sorted list of the labels added to this timeline.
 * @return {Array.<createjs.MovieClip.Label>}
 * @private
 */
createjs.MovieClip.Timeline.prototype.getLabels = function() {
  /// <returns type="Array" elementType="createjs.MovieClip.Label"/>
  return this.clip_.getLabels();
};
  
/**
 * Returns the name of the label on or immediately before the current position.
 * @return {string}
 * @private
 */
createjs.MovieClip.Timeline.prototype.getCurrentLabel = function() {
  /// <returns type="string"/>
  return this.clip_.getCurrentLabel();
};

/**
 * Pauses or plays this timeline.
 * @param {boolean} value
 */
createjs.MovieClip.Timeline.prototype.setPaused = function(value) {
  /// <param type="boolean" name="value"/>
  this.clip_.setPaused(!!value);
};

/**
 * Starts playing this timeline from the specified position.
 * @param {string|number} value
 */
createjs.MovieClip.Timeline.prototype.gotoAndPlay = function(value) {
  /// <signature>
  ///   <param type="string" name="label"/>
  /// </signature>
  /// <signature>
  ///   <param type="number" name="frame"/>
  /// </signature>
  this.clip_.gotoAndPlay(value);
};

/**
 * Stops playing this timeline and jumps to the specified position.
 * @param {string|number} value
 */
createjs.MovieClip.Timeline.prototype.gotoAndStop = function(value) {
  /// <signature>
  ///   <param type="string" name="label"/>
  /// </signature>
  /// <signature>
  ///   <param type="number" name="frame"/>
  /// </signature>
  this.clip_.gotoAndStop(value);
};

// Add getters for applications that access internal variables.
Object.defineProperties(createjs.MovieClip.Timeline.prototype, {
  'duration': {
    get: createjs.MovieClip.Timeline.prototype.getDuration
  },
  'position': {
    get: createjs.MovieClip.Timeline.prototype.getPosition
  }
});

// Export the createjs.Timeline object to the global namespace.
createjs.exportObject('createjs.MovieClip.Timeline',
                      createjs.MovieClip.Timeline, {
  // createjs.Timeline methods.
  'addTween': createjs.MovieClip.Timeline.prototype.addTween,
  'removeTween': createjs.MovieClip.Timeline.prototype.removeTween,
  'addLabel': createjs.MovieClip.Timeline.prototype.addLabel,
  'setLabels': createjs.MovieClip.Timeline.prototype.setLabels,
  'getLabels': createjs.MovieClip.Timeline.prototype.getLabels,
  'getCurrentLabel': createjs.MovieClip.Timeline.prototype.getCurrentLabel,
  'setPaused': createjs.MovieClip.Timeline.prototype.setPaused,
  'gotoAndPlay': createjs.MovieClip.Timeline.prototype.gotoAndPlay,
  'gotoAndStop': createjs.MovieClip.Timeline.prototype.gotoAndStop
});

/**
 * Returns a mode ID for the specified mode name.
 * @param {string|undefined} mode
 * @return {number}
 * @private
 */
createjs.MovieClip.getMode_ = function(mode) {
  /// <param type="string" name="mode"/>
  /// <returns type="number"/>
  if (mode == 'single') {
    return createjs.TweenTarget.PlayMode.SINGLE;
  } else if (mode == 'synched') {
    return createjs.TweenTarget.PlayMode.SYNCHED;
  }
  return createjs.TweenTarget.PlayMode.INDEPENDENT;
};

/**
 * The total duration of this clip in milliseconds.
 * @type {number}
 * @private
 */
createjs.MovieClip.prototype.duration_ = 0;

/**
 * A list of labels used by the getLabels() method.
 * @type {Array.<createjs.MovieClip.Label>}
 * @private
 */
createjs.MovieClip.prototype.labelList_ = null;

/**
 * Target objects of the tweens added to this clip.
 * @type {Array.<createjs.TweenTarget>}
 * @private
 */
createjs.MovieClip.prototype.targets_ = null;

/**
 * Whether this clip needs to update properties of all its tweens.
 * @type {boolean}
 * @private
 */
createjs.MovieClip.prototype.updated_ = false;

/**
 * Sets the positions of all tweens attached to this clip.
 * @param {number} startPosition
 * @private
 */
createjs.MovieClip.prototype.setStartPosition_ = function(startPosition) {
  /// <param type="number" name="startPosition"/>
  // Flash somehow generates code that has 'startPosition' properties with their
  // values 'undefined' (i.e. '{ startPosition: undefined }'). CreateJS treats
  // these 'undefined' values as 0 and this code emulates it.
  startPosition = startPosition || 0;
  createjs.assert(createjs.isNumber(startPosition));
  // Truncate the frame position to an integral number for consistency with a
  // frame position used by tweens and change the positions of its tweens only
  // when the truncated position is not equal to the current position. (Changing
  // the position of a tween resets the parameters of its target and over-writes
  // the other parameters being changed by the tween.)
  startPosition = createjs.truncate(startPosition);
  if (this.startPosition_ != startPosition) {
    this.startPosition_ = startPosition;
    this.updated_ = true;
  }
};

/**
 * Sets whether to loop all tweens attached to this clip.
 * @param {boolean} loop
 * @private
 */
createjs.MovieClip.prototype.setLoop_ = function(loop) {
  /// <param type="boolean" name="loop"/>

  // Flash somehow generates code that has 'loop' properties with their values
  // 'undefined' (i.e. '{ loop: undefined }'). CreateJS it treats these
  // 'undefined' values as true and this code emulates it.
  if (loop == null) {
    loop = true;
  }
  createjs.assert(createjs.isBoolean(loop));
  if (this.loop_ != loop) {
    this.loop_ = loop;
    this.updated_ = true;
  }
};

/**
 * Sets the play mode of all tweens attached to this clip.
 * @param {string} value
 * @param {createjs.TweenTarget} proxy
 * @private
 */
createjs.MovieClip.prototype.setMode_ = function(value, proxy) {
  /// <param type="string" name="value"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  var mode = createjs.MovieClip.getMode_(value);
  if (this.getPlayMode() != mode) {
    this.setPlayMode(mode);
    if (proxy) {
      proxy.synchronize(this, mode == createjs.TweenTarget.PlayMode.SYNCHED);
    }
    this.updated_ = true;
  }
};

/**
 * Moves the play offset to the specified frame number or the beginning of the
 * specified animation.
 * @param {boolean} paused
 * @param {string|number} value
 * @private
 */
createjs.MovieClip.prototype.goto_ = function(paused, value) {
  /// <signature>
  ///   <param type="boolean" name="paused"/>
  ///   <param type="string" name="label"/>
  /// </signature>
  /// <signature>
  ///   <param type="boolean" name="paused"/>
  ///   <param type="number" name="frame"/>
  /// </signature>
  this.setPaused(paused);
  var position = createjs.parseFloat(value);
  if (createjs.isNaN(position)) {
    position = this.labels_[createjs.getString(value)];
    if (position == null) {
      return;
    }
  }
  // Changes the position of all tweens attached to this clip only when its
  // position is not equal to the current one.
  if (paused || position != this.getCurrentFrame()) {
    this.setTweenPosition(position);
  }
};

/**
 * Returns the createjs.Timeline object associated with this object.
 * @return {createjs.MovieClip.Timeline}
 * @const
 */
createjs.MovieClip.prototype.getTimeline = function() {
  /// <returns type="createjs.MovieClip.Timeline"/>
  return this.timeline_;
};

/**
 * Returns the duration of this clip.
 * @return {number}
 * @const
 */
createjs.MovieClip.prototype.getDuration = function() {
  /// <returns type="number"/>
  return this.duration_;
};

/**
 * Returns the current position of this clip.
 * @return {number}
 * @const
 */
createjs.MovieClip.prototype.getPosition = function() {
  /// <returns type="number"/>
  return this.getCurrentFrame();
};

/**
 * Pauses or plays this timeline.
 * @param {boolean} value
 * @const
 */
createjs.MovieClip.prototype.setPaused = function(value) {
  /// <param type="boolean" name="value"/>
  /// <returns type="createjs.TweenObject"/>
  var paused = !!value;
  var time = createjs.Ticker.getRunTime();
  if (paused) {
    this.stopTweens(time);
  } else {
    this.playTweens(time);
  }
};

/**
 * Starts playing this clip.
 * @const
 */
createjs.MovieClip.prototype.play = function() {
  this.setPaused(false);
};
  
/**
 * Stops playing this clip.
 * @const
 */
createjs.MovieClip.prototype.stop = function() {
  this.setPaused(true);
};
  
/**
 * Moves the play offset of this clip to the specified position or label and
 * starts playing it.
 * @param {string|number} value
 * @const
 */
createjs.MovieClip.prototype.gotoAndPlay = function(value) {
  /// <signature>
  ///   <param type="string" name="label"/>
  /// </signature>
  /// <signature>
  ///   <param type="number" name="frame"/>
  /// </signature>
  this.goto_(false, value);
};
  
/**
 * Moves the play offset of this clip to the specified position or label and
 * stops playing it.
 * @param {string|number} value
 * @const
 */
createjs.MovieClip.prototype.gotoAndStop = function(value) {
  /// <signature>
  ///   <param type="string" name="label"/>
  /// </signature>
  /// <signature>
  ///   <param type="number" name="frame"/>
  /// </signature>
  this.goto_(true, value);
};
  
/**
 * Adds a tween to this clip.
 * @param {createjs.TweenObject} tween
 */
createjs.MovieClip.prototype.addTween = function(tween) {
  /// <returns type="createjs.TweenObject" name="tween"/>
  if (!this.targets_) {
    this.targets_ = [];
  }
  var duration = tween.setProxy(this, this.targets_);
  if (this.duration_ < duration) {
    this.duration_ = duration;
  }
  var single = this.getPlayMode() == createjs.TweenTarget.PlayMode.SINGLE;
  tween.setProperties(this.loop_, this.startPosition_, single);
};

/**
 * Removes a tween from this clip.
 * @param {createjs.TweenObject} tween
 */
createjs.MovieClip.prototype.removeTween = function(tween) {
  /// <returns type="boolean"/>
  createjs.notImplemented();
};

/**
 * Adds a label that can be used with the gotoAndPlay() method.
 * @param {string} label
 * @param {number} position
 */
createjs.MovieClip.prototype.addLabel = function(label, position) {
  /// <param type="string" name="label"/>
  /// <param type="number" name="position"/>
  this.labels_[label] = position;
  this.labelList_ = null;
};

/**
 * Sets labels for this timeline.
 * @param {Object.<string,number>} labels
 */
createjs.MovieClip.prototype.setLabels = function(labels) {
  /// <param type="Object" name="labels"/>
  this.labels_ = labels;
  this.labelList_ = null;
};

/**
 * Returns the sorted list of the labels added to this timeline.
 * @return {Array.<createjs.MovieClip.Label>}
 */
createjs.MovieClip.prototype.getLabels = function() {
  /// <returns type="Array" elementType="createjs.MovieClip.Label"/>
  if (!this.labelList_) {
    var list = [];
    for (var label in this.labels_) {
      var position = this.labels_[label];
      list.push(new createjs.MovieClip.Label(label, position));
    }
    list.sort(createjs.MovieClip.Label.sortFunction_);
    this.labelList_ = list;
  }
  return this.labelList_;
};

/**
 * Returns the name of the label on or immediately before the current position.
 * @return {string}
 */
createjs.MovieClip.prototype.getCurrentLabel = function() {
  /// <returns type="string"/>
  var labels = this.getLabels();
  var length = labels.length;
  var label = labels[0];
  var position = this.getCurrentFrame();
  if (length == 0 || position < label['position']) {
    return '';
  }
  for (var i = 1; i < length; ++i) {
    label = labels[i];
    if (position < label['position']) {
      break;
    }
  }
  return label['label'];
};

/** @override */
createjs.MovieClip.prototype.removeAllChildren = function(opt_destroy) {
  this.resetTweens();
  this.timeline_ = null;
  this.labels_ = null;
  this.labelList_ = null;
  createjs.MovieClip.superClass_.removeAllChildren.call(this, opt_destroy);
};

/** @override */
createjs.MovieClip.prototype.updateTweens = function(time) {
  /// <param type="number" name="time"/>
  // Update the tween properties before updating tweens when another tween
  // changes the properties of this clip to prevent updating each tween twice.
  if (this.updated_) {
    var single = this.getPlayMode() == createjs.TweenTarget.PlayMode.SINGLE;
    this.setTweenProperties(this.loop_, this.startPosition_, single);
    this.updated_ = false;
  }
  createjs.MovieClip.superClass_.updateTweens.call(this, time);
  if (this.targets_) {
    // Add the targets of the tweens (except masks) belonging to this clip. A
    // clip may have a tween that changes a mask. This clip does not have to
    // render masks and it filters them out. (Applications may override the
    // exported 'addChild()' method and this 'addChild()' call should use the
    // exported one.)
    var targets = this.targets_;
    for (var i = 0; i < targets.length; ++i) {
      if (!targets[i].getOwners()) {
        this['addChild'](targets[i]);
      }
    }
    this.targets_ = null;
  }
};

/** @override */
createjs.MovieClip.prototype.getSetters = function() {
  /// <return type="Object" elementType="createjs.TweenTarget.Setter"/>
  var MODES = ['independent', 'single', 'synched'];
  var setters = createjs.MovieClip.superClass_.getSetters.call(this);
  setters['startPosition'].setPosition(this.startPosition_);
  setters['loop'].setLoop(this.loop_);
  setters['mode'].setString(MODES[this.getPlayMode()]);
  return setters;
};

// Add setters to allow tweens to change this object.
createjs.TweenTarget.Property.addSetters({
  'startPosition': createjs.MovieClip.prototype.setStartPosition_,
  'loop': createjs.MovieClip.prototype.setLoop_,
  'mode': createjs.MovieClip.prototype.setMode_
});

// Add getters for applications to read internal variables.
Object.defineProperties(createjs.MovieClip.prototype, {
  'currentFrame': {
    get: createjs.MovieClip.prototype.getPosition
  },
  'timeline': {
    get: createjs.MovieClip.prototype.getTimeline
  }
});

// Export the createjs.MovieClip object to the global namespace.
createjs.exportObject('createjs.MovieClip', createjs.MovieClip, {
  // createjs.MovieClip methods.
  'play': createjs.MovieClip.prototype.play,
  'stop': createjs.MovieClip.prototype.stop,
  'gotoAndPlay': createjs.MovieClip.prototype.gotoAndPlay,
  'gotoAndStop': createjs.MovieClip.prototype.gotoAndStop,
  'getLabels': createjs.MovieClip.prototype.getLabels,
  'getCurrentLabel': createjs.MovieClip.prototype.getCurrentLabel
});
