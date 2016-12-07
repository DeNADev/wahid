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
/// <reference path="counter.js"/>
/// <reference path="ease.js"/>
/// <reference path="event_dispatcher.js"/>
/// <reference path="tick_listener.js"/>
/// <reference path="tick_event.js"/>
/// <reference path="ticker.js"/>
/// <reference path="tween_motion.js"/>
/// <reference path="tween_object.js"/>
/// <reference path="tween_state.js"/>
/// <reference path="tween_target.js"/>

/**
 * A class that implements a tween.
 * @param {createjs.TweenTarget} target
 * @extends {createjs.EventDispatcher}
 * @implements {createjs.TweenObject}
 * @implements {createjs.TickListener}
 * @constructor
 */
createjs.Tween = function(target) {
  createjs.EventDispatcher.call(this);

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
createjs.Tween.prototype.step_ = 0;

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
 * Whether this tween uses a tick count instead of milliseconds as its
 * position.
 * @type {boolean}
 * @private
 */
createjs.Tween.prototype.useTicks_ = false;

/**
 * The target object of this tween.
 * @type {createjs.TweenTarget}
 * @private
 */
createjs.Tween.prototype.target_ = null;

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
 * The list of motions of this tween.
 * @type {Array.<createjs.TweenMotion>}
 * @private
 */
createjs.Tween.prototype.motions_ = null;

/**
 * The list of states of this tween.
 * @type {Array.<createjs.TweenState>}
 * @private
 */
createjs.Tween.prototype.states_ = null;

/**
 * A mapping table from a target ID to an index to the target list.
 * @type {Object.<number,number>}
 * @private
 */
createjs.Tween.prototype.targetIds_ = null;

/**
 * The bit-mask representing the properties changed by this tween. (This mask is
 * the logical disjunction of the masks of its motions.)
 * @type {number}
 * @private
 */
createjs.Tween.prototype.mask_ = 0;

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
   * The time to execute this action.
   * @type {number}
   * @private
   */
  this.time_ = time;

  /**
   * The function to be executed by this action.
   * @const {Function}
   * @private
   */
  this.fn_ = fn;

  /**
   * The first parameter to the function.
   * @const {*}
   * @private
   */
  this.param0_ = parameters[0];

  /**
   * The second parameter to the function.
   * @const {*}
   * @private
   */
  this.param1_ = parameters[1];

  /**
   * The third parameter to the function.
   * @const {*}
   * @private
   */
  this.param2_ = parameters[2];

  /**
   * The 'this' parameter to the function.
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
  // Use the Function.prototype.call() method to explicitly specify its scope
  // and parameters.
  this.fn_.call(this.scope_, this.param0_, this.param1_, this.param2_);
};

/**
 * An inner class that encapsulates a command added to a createjs.Tween object.
 * The createjs.Tween object compiles the commands added to it into internal
 * objects to calculate values frequently-used while it plays an animation in
 * advance.
 * @param {number} duration
 * @param {Object} properties
 * @param {createjs.Ease.Delegate} ease
 * @constructor
 */
createjs.Tween.Command = function(duration, properties, ease) {
  /// <param type="number" name="duration"/>
  /// <param type="Object" name="propertiess"/>
  /// <param type="createjs.Ease.Delegate" name="ease"/>
  /**
   * The duration of this command.
   * @const {number}
   * @private
   */
  this.duration_ = duration;

  /**
   * The set of properties to be changed by this command.
   * @const {Object}
   * @private
   */
  this.properties_ = properties;

  /**
   * The interpolation function.
   * @const {createjs.Ease.Delegate}
   * @private
   */
  this.ease_ = ease;
};

/**
 * Compiles this command and Writes its result to a createjs.TweenMotion object.
 * @param {number} time
 * @param {createjs.TweenTarget} target
 * @param {createjs.TweenMotion} motion
 * @return {number}
 * @const
 */
createjs.Tween.Command.prototype.setMotion = function(time, target, motion) {
  /// <param type="number" name="time"/>
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenMotion" name="motion"/>
  motion.initialize(time, this.duration_, this.ease_);
  if (this.properties_) {
    var graphics = motion.updateProperties(this.properties_);
    if (graphics) {
      target.addGraphics(graphics);
    }
  }
  return this.duration_;
};

/**
 * Compiles this command and writes its result to a createjs.TweenState object.
 * @param {number} time
 * @param {Object.<number,number>} ids
 * @param {createjs.TweenState} state
 * @return {number}
 * @const
 */
createjs.Tween.Command.prototype.setState = function(time, ids, state) {
  /// <param type="number" name="time"/>
  /// <param type="Object" elementType="number" name="ids"/>
  /// <param type="createjs.TweenState" name="state"/>
  state.initialize(time, this.duration_, null);
  if (this.properties_) {
    // Retrieve a copy of all targets changed by this tween and set false to the
    // '_off' properties of all targets in this state, i.e. attach all targets
    // in this state.
    var values = state.copyValues();

    // A 'state' property is an array of objects consisting of two properties as
    // listed below.
    //   +-----+------------------------------------------------------+
    //   | key |                         value                        |
    //   +-----+----------------------------------------+-------------+
    //   |     | type                                   | description |
    //   +-----+----------------------------------------+-------------+
    //   | 't' | createjs.TweenTarget                   | target      |
    //   | 'p' | Object,<string,boolean|number|string>  | properties  |
    //   +-----+----------------------------------------+-------------+
    var end_ = /** @type {Array.<Object>} */ (this.properties_['state']);
    var length = end_.length;
    for (var i = 0; i < length; ++i) {
      var end = end_[i];
      var t = /** @type {createjs.TweenTarget} */ (end['t']);
      var id = ids[t.getTargetId()];
      var value = values[id];
      value.updateOff(0);
      var p = /** @type {Object} */ (end['p']);
      if (p) {
        value.updateProperties(p);
      }
      values[id] = null;
    }
    // This values array now consists of targets not in this state. Set true to
    // their '_off' properties, i.e. detach all targets not in this state.
    if (length < values.length) {
      length = values.length;
      for (var i = 0; i < length; ++i) {
        var value = values[i];
        if (value) {
          value.updateOff(1);
        }
      }
    }
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
 * @param {Array.<createjs.TweenObject>} cache
 * @param {number} cacheId
 * @private
 */
createjs.Tween.prototype.compileCommands_ = function(cache, cacheId) {
  /// <param type="Array" elementType="createjs.TweenObject" name="cache"/>
  /// <param type="number" name="cacheId"/>
  if (!this.commands_) {
    return;
  }
  // Use the cached values and states, which do not depend either on tweens or
  // on target objects, when a proxy caches compiled tweens.
  var commands = this.commands_;
  this.commands_ = null;
  if (cache) {
    var tween = /** @type {createjs.Tween} */ (cache[cacheId]);
    if (tween) {
      this.motions_ = tween.motions_;
      this.states_ = tween.states_;
      this.mask_ = tween.mask_;
      return;
    }
    cache[cacheId] = this;
  }
  // Compile the commands added to this tween. This code roughly compiles a
  // command as listed below:
  // 1. Create a createjs.TweenMotion (createjs.TweenState) object;
  // 2. Retrieve the property values at the beginning of the command and write
  //    them to the object, and;
  // 3. Calculate the property values at the end of the command and write them
  //    to the object.
  if (this.target_) {
    // This tweens is a motion tween. Compile the first command of this motion
    // tween. The property values at its beginning are either:
    // * The property values of the target display object, or;
    // * The property values at the end of the last motion.
    var motion = new createjs.TweenMotion();
    if (!this.motions_) {
      this.motions_ = [];
      this.target_.getTweenMotion(motion);
    } else {
      this.motions_[this.motions_.length - 1].copy(motion);
    }
    var duration = commands[0].setMotion(this.time_, this.target_, motion);
    if (duration) {
      this.time_ += duration;
      this.motions_.push(motion);
    }
    // Compile every other command. The property values at its beginning is
    // always to the ones at the end of its predecessor.
    var length = commands.length;
    for (var i = 1; i < length; ++i) {
      var nextMotion = new createjs.TweenMotion();
      motion.copy(nextMotion);
      duration = commands[i].setMotion(this.time_, this.target_, nextMotion);
      if (duration) {
        this.time_ += duration;
        this.motions_.push(nextMotion);
      }
      motion = nextMotion;
    }
    // Copy the mask of the last motion, which represents all properties changed
    // by this tween. (This mask is used in moving its position backwards.)
    this.mask_ |= motion.getMask();
  } else {
    // This tween is a state tween. A game often uses state tweens just to
    // wait for ticks and run actions. Such state tweens do not add targets
    // and this method should initialize its target array.
    if (!this.targets_) {
      this.targets_ = [];
      this.targetIds_ = {};
    }
    // Compile the commands queued to this state tween. This compilation code is
    // same as the one for the state tween except this code needs to generate a
    // list of motions for each of its targets.
    var size = this.targets_.length;
    var state = new createjs.TweenState(size);
    if (!this.states_) {
      this.states_ = [];
      for (var i = 0; i < size; ++i) {
        this.targets_[i].getTweenMotion(state.get(i));
      }
    } else {
      this.states_[this.states_.length - 1].copy(state);
    }
    var duration = commands[0].setState(this.time_, this.targetIds_, state);
    if (duration) {
      this.time_ += duration;
      this.states_.push(state);
    }
    var length = commands.length;
    for (var i = 1; i < length; ++i) {
      var nextState = new createjs.TweenState(size);
      state.copy(nextState);
      duration = commands[i].setState(this.time_, this.targetIds_, nextState);
      if (duration) {
        this.time_ += duration;
        this.states_.push(nextState);
      }
      state = nextState;
    }
  }
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
  this.compileCommands_(null, 0);
  if (position >= this.duration_) {
    if (!this.loop_ || !this.duration_) {
      position = this.duration_;
      this.ended_ = true;
    } else {
      position %= this.duration_;
      this.step_ = 0;
    }
  }
  // Update the target (or targets) of this tween.
  if (this.target_) {
    if (this.motions_) {
      // Find a motion matching to the current position (or time) of this
      // tween and copy its values to the target of this tween.
      var length = this.motions_.length - 1;
      if (length >= 0) {
        for (var i = this.step_; i < length; ++i) {
          var motion = this.motions_[i];
          if (motion.contain(position)) {
            if (motion.needUpdate(position, seek, i, this.step_)) {
              var mask = motion.interpolate(position);
              if (mask & (1 << createjs.TweenMotion.ID.LOOP)) {
                this.loop_ = motion.getLoop();
              }
              this.target_.setTweenMotion(
                  motion, seek ? this.mask_ : mask, this.proxy_);
            }
            this.step_ = i;
            return position;
          }
        }
        // Copy the values of the last motion when its predecessors do not the
        // contain the current position.
        var motion = this.motions_[length];
        if (motion.needUpdate(position, seek, length, this.step_)) {
          var mask = motion.interpolate(position);
          if (mask & (1 << createjs.TweenMotion.ID.LOOP)) {
            this.loop_ = motion.getLoop();
          }
          this.target_.setTweenMotion(
              motion, seek ? this.mask_ : mask, this.proxy_);
        }
        this.step_ = length;
      }
    }
  } else {
    if (this.states_) {
      var length = this.states_.length - 1;
      if (length >= 0) {
        for (var i = this.step_; i < length; ++i) {
          var state = this.states_[i];
          if (state.contain(position)) {
            if (state.needUpdate(position, seek, i, this.step_)) {
              var targetLength = this.targets_.length;
              for (var j = 0; j < targetLength; ++j) {
                var value = state.get(j);
                var mask = value.interpolate(position);
                this.targets_[j].setTweenMotion(value, mask, this.proxy_);
              }
            }
            this.step_ = i;
            return position;
          }
        }
        var state = this.states_[length];
        if (state.needUpdate(position, seek, length, this.step_)) {
          var targetLength = this.targets_.length;
          for (var j = 0; j < targetLength; ++j) {
            var value = state.get(j);
            var mask = value.interpolate(position);
            this.targets_[j].setTweenMotion(value, mask, this.proxy_);
          }
        }
        this.step_ = length;
      }
    }
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
  this.commands_.push(new createjs.Tween.Command(duration, null, null));
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
  var ease = opt_ease || null;
  if (ease === createjs.Ease.linear) {
    ease = null;
  }
  this.commands_.push(new createjs.Tween.Command(duration, properties, ease));
  if (!this.target_) {
    // Scan the specified 'state' property to add targets when this tween is a
    // state tween.
    if (!this.targets_) {
      this.targets_ = [];
      this.targetIds_ = {};
    }
    var end = /** @type {Array.<Object>} */ (properties['state']);
    for (var i = 0; i < end.length; ++i) {
      var state = end[i];
      var t = /** @type {createjs.TweenTarget} */ (state['t']);
      var id = t.getTargetId();
      if (this.targetIds_[id] == null) {
        var index = this.targets_.length;
        this.targets_[index] = t;
        this.targetIds_[id] = index;
      }
    }
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
createjs.Tween.prototype.setProxy = function(proxy, targets, cache, cacheId) {
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="Array" elementType="createjs.TweenObject" name="cache"/>
  /// <param type="number" name="cacheId"/>
  /// <returns type="number"/>
  if (!proxy || this.target_ !== proxy) {
    createjs.assert(!this.proxy_);
    this.unregister_(this.target_);
    if (this.target_) {
      targets.unshift(this.target_);
    } else {
      if (!this.targets_) {
        this.targets_ = [];
        this.targetIds_ = {};
      } else {
        targets.unshift.apply(targets, this.targets_);
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
    this.compileCommands_(cache, cacheId);
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
  this.step_ = 0;
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
