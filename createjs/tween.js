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
/// <reference path="tween_object.js"/>
/// <reference path="tick_listener.js"/>
/// <reference path="tick_event.js"/>
/// <reference path="ticker.js"/>
/// <reference path="tween_target.js"/>
/// <reference path="uid.js"/>
/// <reference path="ease.js"/>
/// <reference path="counter.js"/>

/**
 * A class that implements a tween.
 * @param {createjs.TweenTarget} target
 * @extends {createjs.EventDispatcher}
 * @implements {createjs.TweenObject}
 * @implements {createjs.TickListener}
 * @implements {createjs.TweenTarget.Property.Listener}
 * @constructor
 */
createjs.Tween = function(target) {
  createjs.EventDispatcher.call(this);

  if (createjs.DEBUG) {
    /**
     * An ID for this tween.
     * @type {number}
     */
    this.id = createjs.Tween.id_++;
  }

  /**
   * The target object of this tween.
   * @type {createjs.TweenTarget}
   * @private
   */
  this.target_ = target;

  if (createjs.DEBUG) {
    ++createjs.Counter.totalTweens;
  }
};
createjs.inherits('Tween', createjs.Tween, createjs.EventDispatcher);

if (createjs.DEBUG) {
  /**
   * IDs assigned to tweens.
   * @type {number}
   */
  createjs.Tween.id_ = 0;
}

/**
 * Whether the tween loops when it reaches the end.
 * @type {boolean}
 */
createjs.Tween.prototype.loop_ = false;

/**
 * Whether this tween is paused now.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.ended_ = false;

/**
 * The total duration of this tween in milliseconds (or ticks).
 * @type {number}
 * @private
 */
createjs.Tween.prototype.duration_ = 0;

/**
 * The current normalized position of the tween.
 * @type {number}
 * @private
 */
createjs.Tween.prototype.position_ = 0;

/**
 * The previous position of the tween. This property is used for running
 * actions.
 * @type {number}
 * @private
 */
createjs.Tween.prototype.previous_ = -1;

/**
 * Whether this tween is changing its position.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.seek_ = false;

/**
 * The index to the current step.
 * @type {number}
 * @private
 */
createjs.Tween.prototype.step_ = 1;

/**
 * The index to the current action.
 * @type {number}
 * @private
 */
createjs.Tween.prototype.action_ = 0;

/**
 * Whether this tween is paused now.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.paused_ = false;

/**
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.useTicks_ = false;

/**
 * The list of steps added by an application.
 * @type {Array.<createjs.Tween.Step>}
 * @private
 */
createjs.Tween.prototype.steps_ = null;

/**
 * The list of actions added by an application.
 * @type {Array.<createjs.Tween.Action>}
 * @private
 */
createjs.Tween.prototype.actions_ = null;

/**
 * A list of tween commands to be compiled.
 * @type {Array.<createjs.Tween.Command>}
 * @private
 */
createjs.Tween.prototype.commands_ = null;

/**
 * The target object of this tween.
 * @type {createjs.TweenTarget}
 * @private
 */
createjs.Tween.prototype.proxy_ = null;

/**
 * A list of targets to be added by a state tween.
 * @type {Array.<createjs.TweenTarget>}
 * @private
 */
createjs.Tween.prototype.targets_ = null;

/**
 * The last time when this tween has been updated in milliseconds. (0 represents
 * this tween is being updated for the first time.)
 * @type {number}
 * @private
 */
createjs.Tween.prototype.lastTime_ = 0;

/**
 * Whether this tween is updating its state.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.updating_ = false;

/**
 * Whether this tween is in the single-frame mode.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.single_ = false;

/**
 * Whether this tween is registered to its target object or the global ticker.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.registered_ = false;

/**
 * The total time of compiled commands.
 * @type {number}
 * @private
 */
createjs.Tween.prototype.time_ = 0;

/**
 * An inner class that represents an animation step of a tween.
 * @param {number} time
 * @param {number} duration
 * @param {Array.<createjs.TweenTarget.Property>} properties
 * @param {createjs.Ease.Delegate} ease
 * @param {boolean} hasNumber
 * @constructor
 */
createjs.Tween.Step = function(time, duration, properties, ease, hasNumber) {
  /**
   * The start time of this step.
   * @type {number}
   * @private
   */
  this.time_ = time;

  /**
   * The multiplier that converts a step position [0,duration) to an
   * interpolation ratio [0,1).
   * @const {number}
   * @private
   */
  this.scale_ = 1 / duration;

  /**
   * A list of properties changed by this step.
   * @const {Array.<createjs.TweenTarget.Property>}
   */
  this.properties_ = properties;

  /**
   * An interpolation function.
   * @const {createjs.Ease.Delegate}
   * @private
   */
  this.ease_ = ease;

  /**
   * Whether this step has number properties.
   * @const {boolean}
   * @private
   */
  this.hasNumber_ = hasNumber;
};

/**
 * An inner class that represents an action of a tween, a JavaScript function
 * called when a tween reached to the time specified by an application.
 * @param {number} time
 * @param {Function} fn
 * @param {Array} parameters
 * @param {Object} scope
 * @constructor
 */
createjs.Tween.Action = function(time, fn, parameters, scope) {
  /// <param type="number" name="time"/>
  /// <param type="Function" name="fn"/>
  /// <param type="Array" name="parameters"/>
  /// <param type="Object" name="scope"/>

  /**
   * @type {number}
   * @private
   */
  this.time_ = time;

  /**
   * @const {Function}
   * @private
   */
  this.fn_ = fn;

  /**
   * @const {*}
   * @private
   */
  this.param0_ = parameters[0];

  /**
   * @const {*}
   * @private
   */
  this.param1_ = parameters[1];

  /**
   * @const {*}
   * @private
   */
  this.param2_ = parameters[2];

  /**
   * @const {Object}
   * @private
   */
  this.scope_ = scope;
};

/**
 * Executes this action.
 * @private
 */
createjs.Tween.Action.prototype.execute_ = function() {
  this.fn_.call(this.scope_, this.param0_, this.param1_, this.param2_);
};

/**
 * An inner interface used by the createjs.Tween class to execute an animation
 * command.
 * @interface
 */
createjs.Tween.Command = function() {};

/**
 * Adds target objects changed by this command to the specified array.
 * @param {Object.<string,createjs.TweenTarget.Property>} properties
 * @param {Object.<string,createjs.TweenTarget.Setter>} setters
 */
createjs.Tween.Command.prototype.getProperties =
    function(properties, setters) {};

/**
 * Adds target objects changed by this command to the specified array.
 * @param {number} time
 * @param {Array.<createjs.TweenTarget>} targets
 * @return {number}
 */
createjs.Tween.Command.prototype.getTargets = function(time, targets) {};

/**
 * Compiles this command.
 * @param {number} time
 * @param {createjs.TweenTarget} target
 * @param {Array.<createjs.TweenTarget>} targets
 * @param {Object.<string,createjs.TweenTarget.Property>} current
 * @param {Array.<createjs.Tween.Step>} steps
 * @return {number}
 */
createjs.Tween.Command.prototype.compile =
    function(time, target, targets, current, steps) {};

/**
 * An inner class used by the createjs.Tween class to halt an animation.
 * @param {number} duration
 * @implements {createjs.Tween.Command}
 * @constructor
 */
createjs.Tween.Wait = function(duration) {
  /**
   * The duration of this command.
   * @const {number}
   * @private
   */
  this.duration_ = duration;
};

/** @override */
createjs.Tween.Wait.prototype.getProperties = function(properties, setters) {
};

/** @override */
createjs.Tween.Wait.prototype.getTargets = function(time, targets) {
  /// <param type="number" name="time"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <returns type="number"/>
  return this.duration_;
};

/** @override */
createjs.Tween.Wait.prototype.compile =
    function(time, target, targets, current, steps) {
  /// <param type="number" name="time"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="Object" name="current"/>
  /// <param type="Array" elementType="createjs.Tween.Step" name="steps"/>
  /// <returns type="number"/>
  var clone = [];
  for (var key in current) {
    // CRATLSPRT-47: this wait command increases the tween position by the
    // specified duration, i.e. its end value is (the current position) + (its
    // duration).
    var property;
    if (key == 'startPosition') {
      property = current[key].clone(target, targets, time + this.duration_);
    } else {
      property = current[key].clone(target, targets);
    }
    clone.push(property);
  }
  steps.push(new createjs.Tween.Step(
      time, this.duration_, clone, null, false));
  return this.duration_;
};

/**
 * An inner class used by the createjs.Tween class to move a display object
 * along the specified quadratic-Bezier paths.
 * @param {Array.<number>} path
 * @param {number} start
 * @param {number} end
 * @param {boolean} orientation
 * @param {Object} properties
 * @param {number} duration
 * @param {createjs.Ease.Delegate} ease
 * @implements {createjs.Tween.Command}
 * @constructor
 */
createjs.Tween.Guide =
    function(path, start, end, orientation, properties, duration, ease) {
  /**
   * An array of points.
   * @const {Array.<number>}
   * @private
   */
  this.path_ = path;

  /**
   * The start position.
   * @const {number}
   * @private
   */
  this.start_ = start || 0;

  /**
   * The end position.
   * @const {number}
   * @private
   */
  this.end_ = (end == null) ? 1 : end;

  /**
   * The orientation.
   * @const {number}
   * @private
   */
  this.orientation_ = createjs.Tween.Guide.getOrientation_(orientation);

  /**
   * The set of properties to be changed by this command.
   * @const {Object}
   * @private
   */
  this.properties_ = properties;

  /**
   * The duration of this command.
   * @const {number}
   * @private
   */
  this.duration_ = duration;

  /**
   * The current position in this command.
   * @type {number}
   * @private
   */
  this.position_ = 0;

  /**
   * The interpolation function.
   * @const {createjs.Ease.Delegate}
   * @private
   */
  this.ease_ = ease;
};

/**
 * Returns a number representing the orientation.
 * @param {string|boolean} orientation
 * @return {number}
 * @private
 */
createjs.Tween.Guide.getOrientation_ = function(orientation) {
  if (!orientation) {
    return createjs.TweenTarget.Orientation.NONE;
  } else if (orientation == 'auto') {
    return createjs.TweenTarget.Orientation.AUTO;
  } else if (orientation == 'cw') {
    return createjs.TweenTarget.Orientation.CLOCKWISE;
  } else if (orientation == 'ccw') {
    return createjs.TweenTarget.Orientation.COUNTERCLOCKWISE;
  } else {
    return createjs.TweenTarget.Orientation.FIXED;
  }
};

/**
 * Adds an animation step.
 * @param {number} time
 * @param {createjs.TweenTarget.NumberProperty} x
 * @param {createjs.TweenTarget.NumberProperty} y
 * @param {createjs.TweenTarget.NumberProperty} rotation
 * @param {number} index
 * @param {number} t0
 * @param {number} t1
 * @param {number} unit
 * @param {number} offset
 * @param {Object.<string,createjs.TweenTarget.Property>} current
 * @param {Array.<createjs.Tween.Step>} steps
 * @return {number}
 * @private
 */
createjs.Tween.Guide.prototype.addStep_ = function(
    time, x, y, rotation, index, t0, t1, unit, offset, current, steps) {
  /// <param type="number" name="time"/>
  /// <param type="createjs.TweenTarget.NumberProperty" name="x"/>
  /// <param type="createjs.TweenTarget.NumberProperty" name="y"/>
  /// <param type="createjs.TweenTarget.NumberProperty" name="rotation"/>
  /// <param type="number" name="index"/>
  /// <param type="number" name="t0"/>
  /// <param type="number" name="t1"/>
  /// <param type="number" name="unit"/>
  /// <param type="number" name="offset"/>
  /// <param type="Object" name="current"/>
  /// <param type="Array" elementType="createjs.Tween.Step" name="steps"/>
  /// <returns type="number"/>
  var size = t1 - t0;
  var duration = unit * size;
  var clone = [];
  if (duration == 1) {
    // Games may use a path property to specify the position of a target object
    // frame by frame. In this case, this code adds NumberProperty objects
    // instead of adding a PathProperty object to use linear interpolation.
    clone.push(
        createjs.TweenTarget.NumberProperty.clone(x, this.path_[index + 4]),
        createjs.TweenTarget.NumberProperty.clone(y, this.path_[index + 5]));
  } else {
    clone.push(createjs.TweenTarget.PathProperty.get(
        x, y, this.path_, index, t0, size));
    if (this.orientation_) {
      clone.push(createjs.TweenTarget.RotationProperty.get(
          rotation, this.path_, index, t0, size, this.orientation_, offset));
    }
  }
  var r0 = this.position_ / this.duration_;
  this.position_ += duration;
  var r1 = this.position_ / this.duration_;
  for (var key in current) {
    if (key != 'x' && key != 'y') {
      if (this.orientation_ && key == 'rotation') {
        continue;
      }
      var start = current[key];
      var property = start.interpolate(this.properties_[key], r0, r1);
      clone.push(property);
    }
  }
  steps.push(new createjs.Tween.Step(time, duration, clone, this.ease_, true));
  return duration;
};

/**
 * Updates the current properties.
 * @param {Object.<string,createjs.TweenTarget.Property>} current
 * @param {createjs.TweenTarget.Property} x
 * @param {createjs.TweenTarget.Property} y
 * @param {number} index
 * @param {number} t
 * @param {createjs.TweenTarget} target
 * @private
 */
createjs.Tween.Guide.prototype.update_ =
    function(current, x, y, index, t, target) {
  /// <param type="Object" name="current"/>
  /// <param type="createjs.TweenTarget.Property name="x"/>
  /// <param type="createjs.TweenTarget.Property name="y"/>
  /// <param type="number name="index"/>
  /// <param type="number name="t"/>
  /// <param type="createjs.TweenTarget name="target"/>
  var path = this.path_;
  var endX = path[index + 4];
  var endY = path[index + 5];
  if (t < 1) {
    var t_ = 1 - t;
    var t0 = t_ * t_;
    var t1 = 2 * t_ * t;
    var t2 = t * t;
    endX = t0 * path[index] + t1 * path[index + 2] + t2 * endX;
    endY = t0 * path[index + 1] + t1 * path[index + 3] + t2 * endY;
  }
  current['x'] = x.clone(target, null, endX);
  current['y'] = y.clone(target, null, endY);
  for (var key in this.properties_) {
    if (key != 'guide') {
      current[key] = current[key].clone(target, null, this.properties_[key]);
    }
  }
};

/** @override */
createjs.Tween.Guide.prototype.getProperties = function(current, setters) {
  /// <param type="Object" name="properties"/>
  /// <param type="Object" name="setters"/>
  var KEYS = ['x', 'y', 'rotation'];
  var length = this.orientation_ ? 3 : 2;
  for (var i = 0; i < length; ++i) {
    var key = KEYS[i];
    if (!current[key]) {
      current[key] = createjs.TweenTarget.Property.get(setters[key]);
    }
  }
  for (var key in this.properties_) {
    if (key != 'guide') {
      var setter = setters[key];
      if (setter && !current[key]) {
        current[key] = createjs.TweenTarget.Property.get(setter);
      }
    }
  }
};

/** @override */
createjs.Tween.Guide.prototype.getTargets = function(time, targets) {
  /// <param type="number" name="time"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <returns type="number"/>
  return this.duration_;
};

/** @override */
createjs.Tween.Guide.prototype.compile =
    function(time, target, targets, current, steps) {
  /// <param type="number" name="time"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="Object" name="current"/>
  /// <param type="Array" elementType="createjs.Tween.Step" name="steps"/>
  /// <returns type="number"/>
  var length = this.path_.length;
  var segments = (length - 2) >> 2;
  var start = this.start_ * segments;
  var end = this.end_ * segments;
  var unit = this.duration_ / (end - start);
  var x = /** @type {createjs.TweenTarget.NumberProperty} */ (current['x']);
  var y = /** @type {createjs.TweenTarget.NumberProperty} */ (current['y']);
  var rotation =
      /** @type {createjs.TweenTarget.NumberProperty} */ (current['rotation']);
  createjs.assert(x instanceof createjs.TweenTarget.NumberProperty);
  createjs.assert(y instanceof createjs.TweenTarget.NumberProperty);

  // Split the path of this guide into multiple Bezier curves and create a step
  // for each curve, e.g. a guide property consisting of two Bezier curves is
  // split into two guide properties each of which consists of one Bezier curve
  // as listed below.
  //   'duration': 100, 'guide': { 'path': [0, 0, 50, 0, 50, 50, 0, 50, 0, 0] }
  //   -> 'duration': 50, 'guide': { 'path': [0, 0, 50, 0, 50, 50] },
  //      'duration': 50, 'guide': { 'path': [50, 50, 0, 50, 0, 0] },
  // This code also splits the duration value according to the length of each
  // curve.
  if (end >= start) {
    var offset = createjs.TweenTarget.RotationProperty.getOffset(this.path_, 0);
    for (var i = 6; i <= length && 0 <= end; i += 4, --start, --end) {
      if (1 <= start) {
        continue;
      }
      var t0 = createjs.max(0, start);
      var t1 = createjs.min(1, end);
      time += this.addStep_(
          time, x, y, rotation, i - 6, t0, t1, unit, offset, current, steps);
    }
    length -= 6;
    ++end;
  } else {
    var offset = createjs.TweenTarget.RotationProperty.getOffset(
        this.path_, length - 6);
    start -= segments;
    end -= segments;
    for (var i = length - 6; i >= 0 && end < 0; i -= 4) {
      ++start;
      ++end;
      if (start <= 0) {
        continue;
      }
      var t0 = createjs.min(1, start);
      var t1 = createjs.max(0, end);
      time += this.addStep_(
          time, x, y, rotation, i, t0, t1, unit, offset, current, steps);
    }
    length = 0;
  }
  // Calculate the last position of this tween and update the current property.
  this.update_(current, x, y, length, end, target);
  return this.duration_;
};

/**
 * An inner class used by the createjs.Tween class to move an animation.
 * @param {Object} properties
 * @param {number} duration
 * @param {createjs.Ease.Delegate} ease
 * @implements {createjs.Tween.Command}
 * @constructor
 */
createjs.Tween.To = function(properties, duration, ease) {
  /**
   * The set of properties to be changed by this command.
   * @const {Object}
   * @private
   */
  this.properties_ = properties;

  /**
   * The duration of this command.
   * @const {number}
   * @private
   */
  this.duration_ = duration;

  /**
   * The interpolation function.
   * @const {createjs.Ease.Delegate}
   * @private
   */
  this.ease_ = ease;
};

/** @override */
createjs.Tween.To.prototype.getProperties = function(current, setters) {
  /// <param type="Object" name="current"/>
  /// <param type="Object" name="setters"/>
  for (var key in this.properties_) {
    var setter = setters[key];
    if (setter && !current[key]) {
      var property = createjs.TweenTarget.Property.get(setter);
      if (property){
        current[key] = property;
      }
    }
  }
};

/** @override */
createjs.Tween.To.prototype.getTargets = function(time, targets) {
  /// <param type="number" name="time"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <returns type="number"/>
  return this.duration_;
};

/** @override */
createjs.Tween.To.prototype.compile =
    function(time, target, targets, current, steps) {
  /// <param type="number" name="time"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="Object" name="current"/>
  /// <param type="Array" elementType="createjs.Tween.Step" name="steps"/>
  /// <returns type="number"/>

  // Create a set of properties to be set in this step.
  var clone = [];
  var hasNumber = 0;
  for (var key in current) {
    var start = current[key];
    var property = start.clone(target, null, this.properties_[key]);
    clone.push(property);
    hasNumber |= property.isNumber();
    current[key] = property;
  }
  if (this.duration_) {
    steps.push(new createjs.Tween.Step(
        time, this.duration_, clone, this.ease_, !!hasNumber));
  }
  return this.duration_;
};

/**
 * An inner class used by the createjs.Tween class to add display objects or to
 * remove them.
 * @param {Array.<Object>} end
 * @param {number} duration
 * @implements {createjs.Tween.Command}
 * @constructor
 */
createjs.Tween.State = function(end, duration) {
  /**
   * The list of states to be changed by this command. Each state is an Object
   * consisting of two properties as listed in the following table.
   *   +-----+------------------------------------------------------+
   *   | key |                         value                        |
   *   +-----+----------------------------------------+-------------+
   *   |     | type                                   | description |
   *   +-----+----------------------------------------+-------------+
   *   | 't' | createjs.TweenTarget                   | target      |
   *   | 'p' | Object,<string,boolean|number|string>  | properties  |
   *   +-----+----------------------------------------+-------------+
   * @const {Array.<Object>}
   * @private
   */
  this.end_ = end;

  /**
   * The duration of this command.
   * @const {number}
   * @private
   */
  this.duration_ = duration;
};

/**
 * Adds the specified target to the specified array if the array does not have
 * the target.
 * @param {number} time
 * @param {Array.<createjs.TweenTarget>} targets
 * @param {createjs.TweenTarget} target
 * @private
 */
createjs.Tween.State.prototype.addTarget_ = function(time, targets, target) {
  /// <param type="number" name="time"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  for (var i = 0; i < targets.length; ++i) {
    if (targets[i] === target) {
      return;
    }
  }
  target.setOff(!!time);
  targets.push(target);
};

/** @override */
createjs.Tween.State.prototype.getProperties = function(properties, setters) {
  createjs.notReached();
};

/** @override */
createjs.Tween.State.prototype.getTargets = function(time, targets) {
  /// <param type="number" name="time"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <returns type="number"/>
  for (var i = 0; i < this.end_.length; ++i) {
    this.addTarget_(time, targets, this.end_[i]['t']);
  }
  return this.duration_;
};

/** @override */
createjs.Tween.State.prototype.compile =
    function(time, target, targets, current, steps) {
  /// <param type="number" name="time"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="Object" name="current"/>
  /// <param type="Array" elementType="createjs.Tween.Step" name="steps"/>
  /// <returns type="number"/>
  createjs.assert(!!targets);

  var key = 'state';
  var start = current[key];
  if (!start) {
    start = createjs.TweenTarget.StateProperty.get(targets);
  }
  var property = start.clone(null, targets, this.end_);
  current[key] = property;
  if (this.duration_) {
    steps.push(new createjs.Tween.Step(
        time, this.duration_, [property], null, false));
  }
  return this.duration_;
};

/**
 * Returns a new createjs.Tween instance. This is a factory method for
 * createjs.Tween objects.
 * @param {createjs.TweenTarget} target
 * @param {Object=} opt_properties
 * @param {Object=} opt_pluginData
 * @param {boolean=} opt_override
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.get =
    function(target, opt_properties, opt_pluginData, opt_override) {
  // Reset the target if it does not implement the createjs.TweenTarget
  // interface.
  if (target && !target.registerTween) {
    target = null;
  }
  if (!!opt_override) {
    if (target) {
      target.resetTweens();
    }
  }
  var tween = new createjs.Tween(target);
  if (opt_properties) {
    tween.loop_ = !!opt_properties['loop'];
    tween.paused_ = !!opt_properties['paused'];
    tween.useTicks_ = !!opt_properties['useTicks'];
  }
  if (!tween.paused_) {
    tween.register_(target);
  }
  return tween;
};

/**
 * Compiles tween commands and creates steps.
 * @private
 */
createjs.Tween.prototype.compileCommands_ = function() {
  if (!this.commands_) {
    return;
  }
  if (!this.steps_) {
    this.steps_ = [];
  }
  var current = {};
  var length = this.commands_.length;
  if (this.target_) {
    // Retrieve the values of all properties used by this tween.
    var setters = this.target_.getSetters();
    for (var i = 0; i < length; ++i) {
      this.commands_[i].getProperties(current, setters);
    }
  }
  for (var i = 0; i < length; ++i) {
    this.time_ += this.commands_[i].compile(
        this.time_, this.target_, this.targets_, current, this.steps_);
  }
  this.commands_ = null;
};

/**
 * Registers this tween to the target object.
 * @param {createjs.TweenTarget} target
 * @private
 */
createjs.Tween.prototype.register_ = function(target) {
  this.registered_ = true;
  // A time-based tween uses this registration time as its start time, i.e. the
  // first updateTween() call uses time elapsed since registration.
  this.lastTime_ = createjs.Ticker.getRunTime();
  if (target) {
    target.registerTween(this);
  } else {
    createjs.Ticker.addListener('tick', this);
  }
};

/**
 * Unregisters this tween from the target object.
 * @param {createjs.TweenTarget} target
 * @private
 */
createjs.Tween.prototype.unregister_ = function(target) {
  this.registered_ = false;
  this.lastTime_ = 0;
  if (target) {
    target.unregisterTween(this);
  } else {
    createjs.Ticker.removeListener('tick', this);
  }
};

/**
 * Sets properties of the specified DisplayObject object. This method is added
 * to an action queue when an applications calls the set() method.
 * @param {Object} properties
 * @param {createjs.TweenTarget} target
 * @private
 */
createjs.Tween.prototype.setProperties_ = function(properties, target) {
  /// <param type="Object" name="properties"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  var values = createjs.TweenTarget.ValueProperty.get(properties);
  for (var i = 0; i < values.length; ++i) {
    values[i].setValue(target);
  }
};

/**
 * Retrieves the animation step.
 * @param {number} position
 * @return {createjs.Tween.Step}
 * @private
 */
createjs.Tween.prototype.getStep_ = function(position) {
  /// <param type="number" name="position"/>
  /// <returns type="createjs.Tween.Step"/>
  var i = createjs.max(this.step_, 0);
  var length = this.steps_.length;
  for (; i < length; ++i) {
    if (this.steps_[i].time_ > position) {
      break;
    }
  }
  --i;
  this.step_ = i;
  return this.steps_[i];
};

/**
 * Updates the animation.
 * @param {number} position
 * @param {boolean} seek
 * @return {number}
 * @private
 */
createjs.Tween.prototype.updateAnimation_ = function(position, seek) {
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="seek"/>
  /// <returns type="number"/>
  if (createjs.DEBUG) {
    ++createjs.Counter.runningTweens;
  }
  this.compileCommands_();
  if (position >= this.duration_) {
    if (!this.loop_ || !this.duration_) {
      position = this.duration_;
      this.ended_ = true;
    } else {
      position %= this.duration_;
      this.step_ = 1;
    }
  }
  // This tween is playing now. Retrieve the animation being played now and
  // update the state of its target. (This code does not need to compare with
  // |step[1].time_| because it represents the beginning of this animation,
  // i.e. |step[0].time_| is always 0.)
  if (!this.steps_) {
    return position;
  }
  var index = this.step_;
  var step = this.getStep_(position);
  if (!step) {
    return position;
  }
  var stepPosition = position - step.time_;
  var stepRatio = stepPosition * step.scale_;
  var updated = seek || stepRatio == 0 || stepRatio == 1;
  if (!step.hasNumber_ && index == this.step_) {
    if (!updated) {
      return position;
    }
  }
  if (createjs.DEBUG) {
    ++createjs.Counter.updatedTweens;
  }
  var ratio = step.ease_ ? step.ease_.interpolate(stepRatio) : stepRatio;
  // It is slow for a tween to change the positions of movie clips. To avoid it,
  // a tween sets the position of movie clips only when it needs to, i.e.:
  // * when a game has changed the position of this tween,
  // * when this tween is at the beginning of a step, or;
  // * when this tween is at the end of a step.
  if (!updated) {
    stepRatio = -1;
  }
  for (var i = 0; i < step.properties_.length; ++i) {
    step.properties_[i].setValue(
        this.target_, this.proxy_, ratio, this, stepRatio, this.targets_);
  }
  return position;
};

/**
 * Run actions in the specified range.
 * @param {number} start
 * @param {number} end
 * @private
 */
createjs.Tween.prototype.runActions_ = function(start, end) {
  /// <param type="number" name="position"/>
  if (!this.actions_) {
    return;
  }
  var length = this.actions_.length;
  // This tween uses a monotonic timer, i.e. an end time is always greater
  // than a start time.
  createjs.assert(start <= end);
  // Run actions in the period (start, end].
  for (var i = this.action_; i < length; ++i) {
    var action = this.actions_[i];
    if (end < action.time_) {
      break;
    }
    if (start < action.time_ && action.time_ <= end) {
      this.action_ = i;
      action.execute_();
    }
  }
  // Run actions in the period [0, end % this.duration_] when this animation
  // has been rewound.
  if (this.loop_ && end > this.duration_) {
    this.action_ = 0;
    if (!this.useTicks_) {
      end %= this.duration_;
      for (var i = 0; i < length; ++i) {
        var action = this.actions_[i];
        if (end < action.time_) {
          break;
        }
        if (0 <= action.time_ && action.time_ <= end) {
          this.action_ = i;
          action.execute_();
        }
      }
    }
  }
};

/**
 * Removes all existing tweens from a target.
 * @param {createjs.TweenTarget} target
 * @const
 */
createjs.Tween.removeTweens = function(target) {
  target.resetTweens();
};

/**
 * Removes all existing Tweens.
 * @const
 */
createjs.Tween.removeAllTweens = function() {
  createjs.notImplemented();
};

/**
 * Returns whether there are any active Tweens attached to the specified target
 * or returns whether there are any registered Tweens.
 * @param {createjs.TweenTarget=} opt_target
 * @return {boolean}
 * @const
 */
createjs.Tween.hasActiveTweens = function(opt_target) {
  if (opt_target) {
    return opt_target.hasTweens();
  }
  createjs.notImplemented();
  return true;
};

/**
 * Installs a plug-in.
 * @param {Object} plugin
 * @param {Array} properties
 * @const
 */
createjs.Tween.installPlugin = function(plugin, properties) {
  createjs.notImplemented();
};

/**
 * Returns the target object of this tween.
 * @return {createjs.TweenTarget}
 * @const
 */
createjs.Tween.prototype.getTarget = function() {
  /// <returns type="createjs.TweenTarget"/>
  return this.target_;
};

/**
 * Returns the duration (or total play time) of this tween.
 * @return {number}
 * @const
 */
createjs.Tween.prototype.getDuration = function() {
  /// <returns type="number"/>
  return this.duration_;
};

/**
 * Retrieves the current play offset of this tween.
 * @return {number}
 * @const
 */
createjs.Tween.prototype.getPosition = function() {
  /// <returns type="number"/>
  return this.position_;
};

/**
 * Pauses or plays this tween.
 * @param {boolean} value
 * @return {createjs.TweenObject}
 * @const
 */
createjs.Tween.prototype.setPaused = function(value) {
  /// <param type="boolean" name="value"/>
  /// <returns type="createjs.TweenObject"/>
  var paused = !!value;
  var time = createjs.Ticker.getRunTime();
  if (paused) {
    this.stopTween(time);
  } else {
    this.playTween(time);
  }
  return this;
};

/**
 * Queues a wait (essentially an empty tween).
 * @param {number} duration
 * @param {boolean=} opt_passive
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.prototype.wait = function(duration, opt_passive) {
  /// <param type="number" name="duration"/>
  /// <param type="boolean" optional="true" name="opt_passive"/>
  /// <returns type="createjs.Tween"/>
  if (duration == null || createjs.isNaN(duration) || duration <= 0) {
    return this;
  }
  if (!this.commands_) {
    this.commands_ = [];
  }
  this.commands_.push(new createjs.Tween.Wait(duration));
  this.duration_ += duration;
  return this;
};

/**
 * Queues a tween from the current values to the target properties.
 * @param {Object} properties
 * @param {number} duration
 * @param {createjs.Ease.Delegate=} opt_ease
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.prototype.to = function(properties, duration, opt_ease) {
  /// <param type="Object" name="properties"/>
  /// <param type="number" name="duration"/>
  /// <param type="createjs.Ease.Delegate" optional="true" name="opt_ease"/>
  /// <returns type="createjs.Tween"/>
  if (duration == null || createjs.isNaN(duration) || duration < 0) {
    duration = 0;
  }
  if (!this.commands_) {
    this.commands_ = [];
  }
  if (this.target_) {
    var guide = properties['guide'];
    var ease = opt_ease || null;
    if (ease === createjs.Ease.linear) {
      ease = null;
    }
    if (guide) {
      this.commands_.push(new createjs.Tween.Guide(guide['path'],
                                                   guide['start'],
                                                   guide['end'],
                                                   guide['orient'],
                                                   properties,
                                                   duration,
                                                   ease));
    } else {
      this.commands_.push(
          new createjs.Tween.To(properties, duration, ease));
    }
  } else {
    var end = /** @type {Array.<Object>} */ (properties['state']);
    this.commands_.push(new createjs.Tween.State(end, duration));
  }
  this.duration_ += duration;
  return this;
};

/**
 * Queues an action to call the specified function.
 * @param {Function} callback
 * @param {Array=} opt_params
 * @param {Object=} opt_scope
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.prototype.call = function(callback, opt_params, opt_scope) {
  /// <param type="Function" name="callback"/>
  /// <param type="Array" optional="true" name="opt_params"/>
  /// <param type="Object optional="true" name="opt_scope"/>
  /// <returns type="createjs.Tween"/>
  if (!this.actions_) {
    this.actions_ = [];
  }
  var scope = opt_scope || this.target_;
  var params = opt_params || [];
  this.actions_.push(
      new createjs.Tween.Action(this.duration_, callback, params, scope));
  return this;
};

/**
 * Queues an action to set the specified properties on the specified target.
 * @param {Object} properties
 * @param {createjs.TweenTarget=} opt_target
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.prototype.set = function(properties, opt_target) {
  /// <param type="Object" name="properties"/>
  /// <param type="createjs.TweenTarget" optional="true" name="opt_target"/>
  /// <returns type="createjs.Tween"/>
  return this;
};

/**
 * Queues an action to to play (unpause) the specified tween.
 * @param {createjs.Tween} tween
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.prototype.play = function(tween) {
  /// <param type="createjs.Tween" name="tween"/>
  /// <returns type="createjs.Tween"/>
  if (!tween) {
    tween = this;
  }
  return this.call(tween.setPaused, [false], tween);
};

/**
 * Queues an action to to pause the specified tween.
 * @param {createjs.Tween} tween
 * @return {createjs.Tween}
 * @const
 */
createjs.Tween.prototype.pause = function(tween) {
  /// <param type="createjs.Tween" name="tween"/>
  /// <returns type="createjs.Tween"/>
  if (!tween) {
    tween = this;
  }
  return this.call(tween.setPaused, [true], tween);
};

/** @override */
createjs.Tween.prototype.updateTween = function(time, flag, next) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="flag"/>
  /// <param type="number" name="next"/>
  /// <returns type="number"/>
  // Set the position of this tween when another tween has changed the
  // position of this tween. Update the target properties of this tween and
  // exit this method without advancing its position only when both tweens
  // belong to one movie clip. This tween updates the target properties and
  // advances its position otherwise.
  if (next >= 0) {
    this.action_ = 0;
    if (this.position_ != next) {
      var update = flag & createjs.TweenObject.Flag.UPDATE;
      this.setPosition(next, update);
      if (update) {
        return this.position_;
      }
    }
  }
  if (time == this.lastTime_ || this.paused_ || this.single_ || this.ended_) {
    if (!this.seek_) {
      this.lastTime_ = time;
      return this.position_;
    }
  }
  this.updating_ = true;
  var position = this.position_;
  var previous = this.updateAnimation_(position, this.seek_);
  this.seek_ = false;
  this.position_ = -1;
  flag &= createjs.TweenObject.Flag.PLAY_MODE;
  if (flag != createjs.TweenTarget.PlayMode.SYNCHED) {
    this.runActions_(this.previous_, position);
  }
  this.updating_ = false;
  if (this.position_ < 0) {
    // Calculates the next position.
    this.previous_ = previous;
    var delta =
        this.useTicks_ ? createjs.Ticker.getFrames() : time - this.lastTime_;
    this.position_ = previous + delta;
  }
  this.lastTime_ = time;
  return this.previous_;
};

/** @override */
createjs.Tween.prototype.playTween = function(time) {
  /// <param type="number" name="time"/>
  if (this.paused_) {
    if (!this.registered_) {
      this.register_(this.target_);
    }
    this.lastTime_ = time;
    this.paused_ = false;
  }
};

/** @override */
createjs.Tween.prototype.stopTween = function(time) {
  /// <param type="number" name="time"/>
  if (!this.paused_) {
    var target = this.target_ || this.proxy_;
    this.lastTime_ = time;
    this.paused_ = true;
  }
};

/** @override */
createjs.Tween.prototype.setProxy = function(proxy, targets) {
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <returns type="number"/>
  if (!proxy || this.target_ !== proxy) {
    createjs.assert(!this.proxy_);
    this.unregister_(this.target_);
    if (this.target_) {
      targets.unshift(this.target_);
    } else {
      var time = 0;
      this.targets_ = [];
      if (this.commands_) {
        for (var i = 0; i < this.commands_.length; ++i) {
          time += this.commands_[i].getTargets(time, this.targets_);
        }
        if (this.targets_.length) {
          targets.unshift.apply(targets, this.targets_);
        }
      }
    }
    if (proxy) {
      this.register_(proxy);
      this.proxy_ = proxy;
      if (this.target_) {
        var target = this.target_;
        if (target.getPlayMode() == createjs.TweenTarget.PlayMode.SYNCHED) {
          proxy.synchronize(this.target_, true);
        }
      } else {
        for (var i = 0; i < this.targets_.length; ++i) {
          var target = this.targets_[i];
          if (target.getPlayMode() == createjs.TweenTarget.PlayMode.SYNCHED) {
            proxy.synchronize(target, true);
          }
        }
      }
    }
    this.compileCommands_();
    // When this tween has a proxy, the proxy runs the tween on behalf of its
    // target and this tween does not have to register itself to its target any
    // longer. This method marks this tween as registered to prevent this tween
    // from re-registering itself.
    this.registered_ = true;
  }
  this.useTicks_ = true;
  // Write the time-stamp of this tween to synchronize the time-stamps of all
  // tweens added to a movie clip. (When this tween may be created by an action,
  // it must be updated in this rendering cycle. To force updating this tween in
  // this rendering cycle, this tween should have a time-stamp less than the
  // current one.)
  this.lastTime_ = createjs.Ticker.getRunTime() - 1;
  return this.duration_;
};

/** @override */
createjs.Tween.prototype.setPosition = function(position, mode) {
  /// <param type="number" name="position"/>
  /// <param type="number" name="mode"/>
  // A MovieClip object calls this method with a negative position to reset this
  // tween.
  this.step_ = 1;
  this.action_ = 0;
  this.ended_ = false;
  if (mode) {
    if (!this.useTicks_) {
      return;
    }
    if (this.previous_ != position) {
      // Update the target properties only when this method is called from the
      // MovieClip.prototype.goto_() method.
      this.updateAnimation_(position, true);
    }
  }
  this.previous_ = position - 1;
  this.position_ = position;
  this.seek_ = true;
};

/** @override */
createjs.Tween.prototype.setProperties = function(loop, position, single) {
  /// <param type="boolean" name="loop"/>
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="single"/>
  this.loop_ = loop;
  this.single_ = single;
  if (single) {
    this.seek_ = true;
  }
};

/** @override */
createjs.Tween.prototype.isEnded = function() {
  return this.ended_;
};

/** @override */
createjs.Tween.prototype.handleTick = function(time) {
  createjs.assert(!this.target_);
  this.updateTween(time, createjs.TweenTarget.PlayMode.INDEPENDENT, -1);
  if (this.ended_) {
    createjs.Ticker.removeListener('tick', this, false);
  }
};

/** @override */
createjs.Tween.prototype.handleLoopChanged = function(value) {
  // This method is called when another tween is changing the 'loop' property of
  // the target object of this tween, which is a createjs.MovieClip object.
  // Synchronize the loop property of this tween with the one of the target.
  this.loop_ = value;
};

// Add getters for applications to access internal variables.
Object.defineProperties(createjs.Tween.prototype, {
  'target': {
    get: createjs.Tween.prototype.getTarget
  },
  'duration': {
    get: createjs.Tween.prototype.getDuration
  },
  'position': {
    get: createjs.Tween.prototype.getPosition
  }
});

// Export the createjs.Tween object to the global namespace.
createjs.exportObject('createjs.Tween', createjs.Tween, {
  // createjs.Tween methods.
  'setPaused': createjs.Tween.prototype.setPaused,
  'wait': createjs.Tween.prototype.wait,
  'to': createjs.Tween.prototype.to,
  'call': createjs.Tween.prototype.call,
  'set': createjs.Tween.prototype.set,
  'play': createjs.Tween.prototype.play,
  'pause': createjs.Tween.prototype.pause,
  'setPosition': createjs.Tween.prototype.setPosition,
  'w': createjs.Tween.prototype.wait,
  't': createjs.Tween.prototype.to,
  'c': createjs.Tween.prototype.call,
  's': createjs.Tween.prototype.set
}, {
  'get': createjs.Tween.get,
  'removeTweens': createjs.Tween.removeTweens,
  'removeAllTweens': createjs.Tween.removeAllTweens,
  'hasActiveTweens': createjs.Tween.hasActiveTweens,
  'installPlugin': createjs.Tween.installPlugin
});

// Export the createjs.Tween object to the global namespace.
createjs.MotionGuidePlugin =
    createjs.exportStatic('createjs.MotionGuidePlugin', {
  'install': function() {}
});
