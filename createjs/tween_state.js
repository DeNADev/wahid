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
/// <reference path="tween_motion.js"/>

/**
 * A class that implements a state tween. This library treats a state tween as
 * an array of motion tweens that change the '_off' properties of their targets.
 * (This class does not own display objects so createjs.Tween objects can share
 * its instances.)
 * @param {number} size
 * @constructor
 */
createjs.TweenState = function(size) {
  // Adds empty motion tweens to the array. (They will be initialized by the
  // caller.)
  var values = [];
  for (var i = 0; i < size; ++i) {
    values[i] = new createjs.TweenMotion();
  }

  /**
   * An array of motion tweens.
   * @type {createjs.TweenMotion}
   * @private
   */
  this.values_ = values;

  /**
   * The number of motion tweens.
   * @type {number}
   * @private
   */
  this.size_ = size;
};

/**
 * An array of motion tweens.
 * @type {Array.<createjs.TweenMotion>}
 * @private
 */
createjs.TweenState.prototype.values_ = null;

/**
 * The number of motion tweens.
 * @type {number}
 * @private
 */
createjs.TweenState.prototype.size_ = 0;

/**
 * The start time of this state.
 * @type {number}
 * @private
 */
createjs.TweenState.prototype.start_ = 0;

/**
 * The end time of this state.
 * @type {number}
 * @private
 */
createjs.TweenState.prototype.end_ = 0;

/**
 * Initializes this state.
 * @param {number} time
 * @param {number} duration
 * @param {createjs.Ease.Delegate} ease
 * @const
 */
createjs.TweenState.prototype.initialize = function(time, duration, ease) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="duration"/>
  /// <param type="createjs.Ease.Delegate" name="ease"/>
  this.start_ = time;
  this.end_ = time + duration;
  for (var i = 0; i < this.size_; ++i) {
    var value = this.values_[i];
    value.initialize(time, duration, ease);
  }
};

/**
 * Returns whether this state contains the specified time.
 * @return {boolean}
 * @const
 */
createjs.TweenState.prototype.contain = function(time) {
  /// <returns type="boolean"/>
  return time < this.end_;
};

/**
 * Returns the specified value.
 * @param {number} i
 * @return {createjs.TweenMotion}
 * @const
 */
createjs.TweenState.prototype.get = function(i) {
  /// <param type="number" name="i"/>
  /// <returns type="createjs.TweenMotion"/>
  return this.values_[i];
};

/**
 * Returns a copy of the value arrays.
 * @return {Array.<createjs.TweenMotion>}
 * @const
 */
createjs.TweenState.prototype.copyValues = function() {
  /// <returns type="Array" elementType="createjs.TweenMotion"/>
  return this.values_.slice(0);
};

/**
 * Creates a clone of this step.
 * @param {createjs.TweenState} state
 * @const
 */
createjs.TweenState.prototype.copy = function(state) {
  /// <param type="createjs.TweenState" name="state"/>
  for (var i = 0; i < this.size_; ++i) {
    this.values_[i].copy(state.values_[i]);
  }
};

/**
 * Rewrites the `seek` value.
 * @param {boolean} seek
 * @param {number} position
 * @return {boolean}
 * @const
 */
createjs.TweenState.prototype.rewriteSeek = function(seek, position) {
  /// <return type="boolean"/>
  return seek || position == this.start_ || position == this.end_;
};

/**
 * Returns whether this value set needs to interpolate its values.
 * @param {boolean} seek
 * @param {number} step
 * @param {number} previous
 * @return {boolean}
 * @const
 */
createjs.TweenState.prototype.needInterpolate = function(seek, step, previous) {
  /// <param type="boolean" name="seek"/>
  /// <param type="number" name="step"/>
  /// <param type="number" name="previous"/>
  /// <returns type="boolean"/>
  if (step == previous) {
    if (!seek) {
      return false;
    }
  }
  return true;
};
