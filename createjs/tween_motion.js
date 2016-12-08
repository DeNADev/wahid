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
/// <reference path="ease.js"/>
/// <reference path="graphics.js"/>
/// <reference path="tween_property.js"/>

/**
 * A class that encapsulates a motion of a tween. This class consists of an
 * array of properties changed by a tween and their current values. A tween
 * changes the values of this motion and transfers this motion to a display
 * object to change its properties.
 * @constructor
 */
createjs.TweenMotion = function() {
  /**
   * An array of properties changed by this motion.
   * @type {Array.<createjs.TweenProperty>}
   * @private
   */
  this.properties_ = [
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null
  ];

  /**
   * The current values of the number properties and the boolean ones.
   * @type {Array.<number>}
   * @private
   */
  this.values_ = [ 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1 ];
};

/**
 * Property IDs used as indices of the property array and the value array.
 * @enum {number}
 */
createjs.TweenMotion.ID = {
  // Number properties
  X: 0,
  Y: 1,
  SCALE_X: 2,
  SCALE_Y: 3,
  SKEW_X: 4,
  SKEW_Y: 5,
  REG_X: 6,
  REG_Y: 7,
  ROTATION: 8,
  ALPHA: 9,
  START_POSITION: 10,
  PLAY_MODE: 11,
  // Boolean properties
  OFF: 12,
  VISIBLE: 13,
  LOOP: 14,
  // String properties
  TEXT: 15,
  // Graphics property
  GRAPHICS: 16
};

/**
 * Orientation IDs.
 * @enum {number}
 */
createjs.TweenMotion.Orientation = {
  NONE: 0,
  FIXED: 1,
  AUTO: 2,
  CLOCKWISE: 3,
  COUNTERCLOCKWISE: 4
};

/**
 * An inner class that encapsulates the 'orient' property of the motion-guide
 * plug-in. (This class is instantiated by the reatejs.TweenMotion.Guide class
 * when a 'guide' property has an 'orient' property.)
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} delta
 * @constructor
 */
createjs.TweenMotion.Rotation = function(x0, y0, x1, y1, delta) {
  /// <param type="number" name="x0"/>
  /// <param type="number" name="y0"/>
  /// <param type="number" name="x1"/>
  /// <param type="number" name="y1"/>
  /// <param type="number" name="delta"/>
  /**
   * The x coordinate of the start point.
   * @const {number}
   * @private
   */
  this.x0_ = x0;

  /**
   * The y coordinate of the start point.
   * @const {number}
   * @private
   */
  this.y0_ = y0;

  /**
   * The x coordinate of the end point.
   * @const {number}
   * @private
   */
  this.x1_ = x1;

  /**
   * The y coordinate of the end point.
   * @const {number}
   * @private
   */
  this.y1_ = y1;

  /**
   * @const {number}
   * @private
   */
  this.delta_ = delta;

  /**
   * The current rotation angle.
   * @type {number}
   * @private
   */
  this.angle_ = 0;
};

/**
 * Returns the interpolated angle.
 * @param {number} t
 * @param {number} t_
 * @param {number} angle
 * @const
 */
createjs.TweenMotion.Rotation.prototype.interpolate = function(t, t_, angle) {
  var x = t_ * this.x0_ + t * this.x1_;
  var y = t_ * this.y0_ + t * this.y1_;
  return angle + createjs.atan2(y, x) + this.delta_ * t;
};

/**
 * Returns the last angle.
 * @param {number} angle
 * @const
 */
createjs.TweenMotion.Rotation.prototype.getLast = function(angle) {
  return angle + createjs.atan2(this.y1_, this.x1_) + this.delta_;
};

/**
 * An inner class that represents a point on a quadratic bezier curve.
 * @param {number} x
 * @param {number} y
 * @param {number} t
 * @param {number} length
 * @constructor
 */
createjs.TweenMotion.Point = function(x, y, t, length) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="t"/>
  /// <param type="number" name="length"/>
  /**
   * The x coordinate of this point.
   * @const {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate of this point.
   * @const {number}
   * @private
   */
  this.y_ = y;

  /**
   * The curve ratio of this point.
   * @const {number}
   * @private
   */
  this.t_ = t;

  /**
   * The approximate length from the beginning of the bezier curve to this
   * point.
   * @type {number}
   * @private
   */
  this.start_ = 0;

  /**
   * The approximate Euclidean distance from the previous point to this point.
   * @type {number}
   * @private
   */
  this.length_ = length;

  /**
   * The curve ratio of the previous point.
   * point.
   * @type {number}
   * @private
   */
  this.t0_ = 0;

  /**
   * The scale factor that normalize a position "[0,length)" to a number
   * "[0,1)", i.e. the reciprocal of the length_ property.
   * @type {number}
   * @private
   */
  this.scale_ = 0;
};

/**
 * An inner class that represents a quadratic bezier curve in a guide path.
 * @param {Array.<number>} path
 * @param {number} index
 * @param {number} start
 * @constructor
 */
createjs.TweenMotion.Curve = function(path, index, start) {
  /// <param type="Array" elementType="number" name="path"/>
  /// <param type="number" name="index"/>
  /// <param type="number" name="start"/>
  /**
   * The x coordinate of the start point.
   * @const {number}
   * @private
   */
  this.x0_ = path[index];

  /**
   * The y coordinate of the start point.
   * @const {number}
   * @private
   */
  this.y0_ = path[index + 1];

  /**
   * The x coordinate of the control point.
   * @const {number}
   * @private
   */
  this.x1_ = path[index + 2];

  /**
   * The y coordinate of the control point.
   * @const {number}
   * @private
   */
  this.y1_ = path[index + 3];

  /**
   * The x coordinate of the end point.
   * @const {number}
   * @private
   */
  this.x2_ = path[index + 4];

  /**
   * The y coordinate of the end point.
   * @const {number}
   * @private
   */
  this.y2_ = path[index + 5];

  /**
   * The anchor points in this quadratic bezier curve.
   * @const {Array.<createjs.TweenMotion.Point>}
   * @private
   */
  this.points_ = [];

  /**
   * The number of anchor points.
   * @type {number}
   * @private
   */
  this.size_ = 0;

  /**
   * The index to the current anchor point.
   * @type {number}
   * @private
   */
  this.index_ = 0;

  /**
   * The Euclidean distance from the beginning of the owner guide path to this
   * curve.
   * @type {number}
   * @private
   */
  this.start_ = start;

  /**
   * The Euclidean distance of this path.
   * @type {number}
   * @private
   */
  this.length_ = -1;

  /**
   * The rotation angle.
   * @type {createjs.TweenMotion.Rotation}
   * @private
   */
  this.rotation_ = null;
};

/**
 * Initializes the rotation angle of this path.
 * @param {number} orientation
 * @const
 */
createjs.TweenMotion.Curve.prototype.setRotation = function(orientation) {
  /// <param type="number" name="orientation"/>
  var x0 = this.x1_ - this.x0_;
  var y0 = this.y1_ - this.y0_;
  var x1 = this.x2_ - this.x1_;
  var y1 = this.y2_ - this.y1_;
  var delta = 0;
  if (orientation != createjs.TweenMotion.Orientation.FIXED) {
    delta = createjs.atan2(x1, y1) - createjs.atan2(x0, y0);
    switch (orientation) {
      case createjs.TweenMotion.Orientation.AUTO:
        if (delta > 180) {
          delta -= 360;
        } else if (delta < -180) {
          delta += 360;
        }
        break;
      case createjs.TweenMotion.Orientation.CLOCKWISE:
        if (delta < 0) {
          delta += 360;
        }
        break;
      case createjs.TweenMotion.Orientation.COUNTERCLOCKWISE:
        if (delta > 0) {
          delta -= 360;
        }
        break;
    }
  }
  this.rotation_ = new createjs.TweenMotion.Rotation(x0, y0, x1, y1, delta);
};

/**
 * Calculates the approximate Euclidean distance of this curve. This method uses
 * de-Casteljeau's algorithm to divide this curve into (up to sixteen) lines
 * and returns the total distance of them.
 * @return {number}
 * @const
 */
createjs.TweenMotion.Curve.prototype.getDistance = function() {
  /// <returns type="number"/>

  // Initialize the anchor-point array with the start point and the end one.
  // The size of this array is always "16 + 1 = 17".
  var points = [
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null
  ];
  var dx = this.x2_ - this.x0_;
  var dy = this.y2_ - this.y0_;
  points[0] = new createjs.TweenMotion.Point(this.x0_, this.y0_, 0, 0);
  points[16] = new createjs.TweenMotion.Point(
      this.x2_, this.y2_, 1, Math.sqrt(dx * dx + dy * dy));

  // Fill the anchor-point array with points on this curve. This loop adds
  // points to approximate the length of this curve with the total length of
  // lines "p0->p1->...->p16", i.e. the length of this curve is sufficiently
  // close to the total length of the lines.
  var EPSILON = 4;
  var stack = [0, 16];
  do {
    // Retrieve the start point and the end point from the stack.
    var n1 = stack.pop();
    var n0 = stack.pop();
    var p1 = points[n1];
    var p0 = points[n0];

    // Calculate the "middle" point of the points.
    var t = (p0.t_ + p1.t_) * 0.5;
    var t_ = 1 - t;
    var t0 = t_ * t_;
    var t1 = 2 * t_ * t;
    var t2 = t * t;
    var x = t0 * this.x0_ + t1 * this.x1_ + t2 * this.x2_;
    var y = t0 * this.y0_ + t1 * this.y1_ + t2 * this.y2_;
    var dx0 = x - p0.x_;
    var dy0 = y - p0.y_;
    var p = new createjs.TweenMotion.Point(
        x, y, t, Math.sqrt(dx0 * dx0 + dy0 * dy0));

    // Calculate the distance "p->p1".
    var dx1 = p1.x_ - x;
    var dy1 = p1.y_ - y;
    var length = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    // Calculate the error between the new distance "p0->p->p1" and the original
    // one "p0->p1" and recursively divide the paths "p0->p" and "p->p1" when
    // the error is greater than the limit. (This error is always positive
    // because of the triangle inequality.)
    var error = p.length_ + length - p1.length_;
    if (error > EPSILON) {
      if (n1 - n0 >= 4) {
        p1.length_ = length;
        var n = (n1 - n0) >> 1;
        points[n] = p;
        stack.push(n0, n, n, n1);
      }
    }
  } while (stack.length > 0);

  // Add the lengths of all anchor points except the first one. (The length of
  // the first anchor point is 0.)
  var size = 0;
  var length = 0;
  var t0 = 0;
  for (var i = 1; i < 17; ++i) {
    var point = points[i];
    if (point) {
      point.t0_ = t0;
      point.start_ = length;
      point.length_ = point.length_;
      point.scale_ = (point.t_ - t0) / point.length_;
      length += point.length_;
      t0 = point.t_;
      this.points_[size] = point;
      ++size;
    }
  }
  this.length_ = length;
  this.size_ = size;
  return this.length_;
};

/**
 * Calculates the interpolated point in this curve.
 * @param {number} position
 * @param {Array.<number>} points
 * @param {number} index
 * @param {number} angle
 * @return {boolean}
 * @const
 */
createjs.TweenMotion.Curve.prototype.interpolate =
    function(position, points, index, angle) {
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="number" name="points"/>
  /// <param type="number" name="index"/>
  /// <param type="number" name="angle"/>
  /// <returns type="boolean"/>
  position -= this.start_;
  for (var i = this.index_; i < this.size_; ++i) {
    var point = this.points_[i];
    var offset = position - point.start_;
    if (offset < point.length_) {
      // Write an interpolated point (and a rotation angle) when the input point
      // is on the line from "this.points_[i - 1]" to "this.points_[i]".
      var t = point.t0_ + offset * point.scale_;
      var t_ = 1 - t;
      var t0 = t_ * t_;
      var t1 = 2 * t_ * t;
      var t2 = t * t;
      points[index] = t0 * this.x0_ + t1 * this.x1_ + t2 * this.x2_;
      points[index + 1] = t0 * this.y0_ + t1 * this.y1_ + t2 * this.y2_;
      if (this.rotation_) {
        points[index + 2] = 1;
        points[index + 3] = this.rotation_.interpolate(t, t_, angle);
      } else {
        points[index + 2] = 0;
        points[index + 3] = 0;
      }
      this.index_ = i;
      return true;
    }
  }
  this.index_ = 0;
  return false;
};

/**
 * Returns the last point.
 * @param {Array.<number>} points
 * @param {number} index
 * @param {number} angle
 * @const
 */
createjs.TweenMotion.Curve.prototype.getLast = function(points, index, angle) {
  points[index] = this.x2_;
  points[index + 1] = this.y2_;
  if (this.rotation_) {
    points[index + 2] = 1;
    points[index + 3] = this.rotation_.getLast(angle);
  } else {
    points[index + 2] = 0;
    points[index + 3] = 0;
  }
};

/**
 * An array of properties to be changed by this motion.
 * @type {Array.<createjs.TweenProperty>}
 * @private
 */
createjs.TweenMotion.prototype.properties_ = null;

/**
 * The current values of the number properties of this motion.
 * @type {Array.<number>}
 * @private
 */
createjs.TweenMotion.prototype.values_ = null;

/**
 * The bit-mask representing the properties changed by this motion and its
 * predecessors.
 * @type {number}
 * @private
 */
createjs.TweenMotion.prototype.mask_ = 0;

/**
 * The start time of this motion.
 * @type {number}
 * @private
 */
createjs.TweenMotion.prototype.start_ = 0;

/**
 * The end time of this motion.
 * @type {number}
 * @private
 */
createjs.TweenMotion.prototype.end_ = 0;

/**
 * The duration of this motion.
 * @type {number}
 * @private
 */
createjs.TweenMotion.prototype.duration_ = 0;

/**
 * The multiplier that converts a tween position [0,duration) to an normalized
 * one [0,1).
 * @type {number}
 * @private
 */
createjs.TweenMotion.prototype.scale_ = 0;

/**
 * An interpolation (a.k.a. easing) function.
 * @type {createjs.Ease.Delegate}
 * @private
 */
createjs.TweenMotion.prototype.ease_ = null;

/**
 * Whether this motion does not change number properties.
 * @type {boolean}
 * @private
 */
createjs.TweenMotion.prototype.noNumber_ = true;

/**
 * The text to be displayed.
 * @type {string}
 * @private
 */
createjs.TweenMotion.prototype.text_ = '';

/**
 * The current createjs.Graphics object when the target of this motion is a
 * createjs.Shape object.
 * @type {createjs.Graphics}
 * @private
 */
createjs.TweenMotion.prototype.graphics_ = null;

/**
 * The points and rotation angles pre-calculated from a 'guide' property. Each
 * pre-calculated point consists of four numbers (x, y, orientation, and angle),
 * the index to the i-th point is "i * 4" (or "i << 2").
 * @type {Array.<number>}
 * @private
 */
createjs.TweenMotion.prototype.points_ = null;

/**
 * Returns the specified property.
 * @param {number} id
 * @return {createjs.TweenProperty}
 * @private
 * @const
 */
createjs.TweenMotion.prototype.getProperty_ = function(id) {
  /// <param type="number" name="id"/>
  /// <returns type="createjs.TweenProperty"/>
  return this.properties_[id];
};

/**
 * Initializes this motion.
 * @param {number} time
 * @param {number} duration
 * @param {createjs.Ease.Delegate} ease
 * @const
 */
createjs.TweenMotion.prototype.initialize = function(time, duration, ease) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="duration"/>
  /// <param type="createjs.Ease.Delegate" name="ease"/>
  this.start_ = time;
  this.end_ = time + duration;
  this.duration_ = duration;
  this.scale_ = 1 / duration;
  this.ease_ = ease;
};

/**
 * Returns whether this motion contains a tween time, i.e. an absolute position.
 * @return {boolean}
 * @const
 */
createjs.TweenMotion.prototype.contain = function(time) {
  /// <param type="number" name="time"/>
  /// <returns type="boolean"/>
  return time < this.end_;
};

/**
 * Returns the property mask of this motion.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getMask = function() {
  /// <returns type="number"/>
  return this.mask_;
};

/**
 * Returns the x position.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.X];
};

/**
 * Sets the x position.
 * @param {number} x
 * @const
 */
createjs.TweenMotion.prototype.setX = function(x) {
  /// <param type="number" name="x"/>
  this.values_[createjs.TweenMotion.ID.X] = x;
};

/**
 * Returns the y position.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.Y];
};

/**
 * Sets the y position.
 * @param {number} y
 * @const
 */
createjs.TweenMotion.prototype.setY = function(y) {
  /// <param type="number" name="y"/>
  this.values_[createjs.TweenMotion.ID.Y] = y;
};

/**
 * Returns the horizontal scale.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getScaleX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.SCALE_X];
};

/**
 * Sets the horizontal scale.
 * @param {number} scaleX
 * @const
 */
createjs.TweenMotion.prototype.setScaleX = function(scaleX) {
  /// <param type="number" name="scaleX"/>
  this.values_[createjs.TweenMotion.ID.SCALE_X] = scaleX;
};

/**
 * Returns the vertical scale.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getScaleY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.SCALE_Y];
};

/**
 * Sets the vertical scale.
 * @param {number} scaleY
 * @const
 */
createjs.TweenMotion.prototype.setScaleY = function(scaleY) {
  /// <param type="number" name="scaleY"/>
  this.values_[createjs.TweenMotion.ID.SCALE_Y] = scaleY;
};

/**
 * Returns the horizontal skew.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getSkewX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.SKEW_X];
};

/**
 * Sets the horizontal skew.
 * @param {number} skewX
 * @const
 */
createjs.TweenMotion.prototype.setSkewX = function(skewX) {
  /// <param type="number" name="skewX"/>
  this.values_[createjs.TweenMotion.ID.SKEW_X] = skewX;
};

/**
 * Returns the vertical skew.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getSkewY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.SKEW_Y];
};

/**
 * Sets the vertical skew.
 * @param {number} skewY
 * @const
 */
createjs.TweenMotion.prototype.setSkewY = function(skewY) {
  /// <param type="number" name="skewY"/>
  this.values_[createjs.TweenMotion.ID.SKEW_Y] = skewY;
};

/**
 * Returns the horizontal registration point.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getRegX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.REG_X];
};

/**
 * Sets the horizontal registration point.
 * @param {number} regX
 * @const
 */
createjs.TweenMotion.prototype.setRegX = function(regX) {
  /// <param type="number" name="regX"/>
  this.values_[createjs.TweenMotion.ID.REG_X] = regX;
};

/**
 * Returns the vertical registration point.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getRegY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.REG_Y];
};

/**
 * Sets the vertical registration point.
 * @param {number} regY
 * @const
 */
createjs.TweenMotion.prototype.setRegY = function(regY) {
  /// <param type="number" name="regY"/>
  this.values_[createjs.TweenMotion.ID.REG_Y] = regY;
};

/**
 * Returns the rotation angle.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getRotation = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.ROTATION];
};

/**
 * Sets the rotation angle.
 * @param {number} rotation
 * @const
 */
createjs.TweenMotion.prototype.setRotation = function(rotation) {
  /// <param type="number" name="rotation"/>
  this.values_[createjs.TweenMotion.ID.ROTATION] = rotation;
};

/**
 * Returns the alpha transparency.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getAlpha = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.ALPHA];
};

/**
 * Sets the alpha transparency.
 * @param {number} alpha
 * @const
 */
createjs.TweenMotion.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  this.values_[createjs.TweenMotion.ID.ALPHA] = alpha;
};

/**
 * Returns the position of the target movie-clip.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getStartPosition = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.START_POSITION];
};

/**
 * Sets the position of the target movie-clip.
 * @param {number} position
 * @const
 */
createjs.TweenMotion.prototype.setStartPosition = function(position) {
  /// <param type="number" name="position"/>
  this.values_[createjs.TweenMotion.ID.START_POSITION] = position;
};

/**
 * Returns the playing mode of the target movie-clip.
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.getPlayMode = function() {
  /// <returns type="number"/>
  return this.values_[createjs.TweenMotion.ID.PLAY_MODE];
};

/**
 * Sets the playing mode of the target movie-clip.
 * @param {number} playMode
 * @const
 */
createjs.TweenMotion.prototype.setPlayMode = function(playMode) {
  /// <param type="number" name="playMode"/>
  this.values_[createjs.TweenMotion.ID.PLAY_MODE] = playMode;
};

/**
 * Returns whether the target is detached from a node tree.
 * @return {boolean}
 * @const
 */
createjs.TweenMotion.prototype.getOff = function() {
  /// <returns type="boolean"/>
  return !!this.values_[createjs.TweenMotion.ID.OFF];
};

/**
 * Sets whether the target is detached from a node tree.
 * @param {boolean} off
 * @const
 */
createjs.TweenMotion.prototype.setOff = function(off) {
  /// <param type="boolean" name="off"/>
  this.values_[createjs.TweenMotion.ID.OFF] = off | 0;
};

/**
 * Returns the visibility.
 * @return {boolean}
 * @const
 */
createjs.TweenMotion.prototype.getVisible = function() {
  /// <returns type="boolean"/>
  return !!this.values_[createjs.TweenMotion.ID.VISIBLE];
};

/**
 * Sets the visibility.
 * @param {boolean} visible
 * @const
 */
createjs.TweenMotion.prototype.setVisible = function(visible) {
  /// <param type="boolean" name="visible"/>
  this.values_[createjs.TweenMotion.ID.VISIBLE] = visible | 0;
};

/**
 * Returns whether the target movie-clip starts over when it reaches its end.
 * @return {boolean}
 * @const
 */
createjs.TweenMotion.prototype.getLoop = function() {
  /// <returns type="boolean"/>
  return !!this.values_[createjs.TweenMotion.ID.LOOP];
};

/**
 * Sets whether the target movie-clip starts over when it reaches its end.
 * @param {boolean} loop
 * @const
 */
createjs.TweenMotion.prototype.setLoop = function(loop) {
  /// <param type="boolean" name="loop"/>
  this.values_[createjs.TweenMotion.ID.LOOP] = loop | 0;
};

/**
 * Returns the text string.
 * @return {string}
 * @const
 */
createjs.TweenMotion.prototype.getText = function() {
  /// <returns type="string"/>
  return this.text_;
};

/**
 * Sets the text string.
 * @param {string} text
 * @const
 */
createjs.TweenMotion.prototype.setText = function(text) {
  /// <param type="string" name="text"/>
  this.text_ = text;
};

/**
 * Returns the current createjs.Sraphics object if the target of this motion is
 * a createjs.Shape object.
 * @return {createjs.Graphics}
 * @const
 */
createjs.TweenMotion.prototype.getGraphics = function() {
  /// <returns type="createjs.Graphics"/>
  return this.graphics_;
};

/**
 * Sets the current createjs.Graphics object if the target of this motion is a
 * createjs.Shape object.
 * @param {createjs.Graphics} graphics
 * @const
 */
createjs.TweenMotion.prototype.setGraphics = function(graphics) {
  /// <param type="createjs.Graphics" name="graphics"/>
  this.graphics_ = graphics;
};

/**
 * Copies the end values of this motion.
 * @param {createjs.TweenMotion} motion
 * @const
 */
createjs.TweenMotion.prototype.copy = function(motion) {
  /// <param type="createjs.TweenMotion" type="motion"/>
  // Create a new step and set the property values at the end of this step.
  var property;
  for (var i = createjs.TweenMotion.ID.X;
       i <= createjs.TweenMotion.ID.LOOP; ++i) {
    property = this.getProperty_(i);
    motion.values_[i] = property ? property.getEndNumber() : this.values_[i];
  }
  property = this.getProperty_(createjs.TweenMotion.ID.TEXT);
  motion.text_ = property ? property.getEndText() : this.text_;
  property = this.getProperty_(createjs.TweenMotion.ID.GRAPHICS);
  motion.graphics_ = property ? property.getEndGraphics() : this.graphics_;

  // When this value has a guide, overwrite the clone properties with its end
  // position and angle.
  if (this.points_) {
    var index = this.points_.length - 4;
    motion.values_[createjs.TweenMotion.ID.X] = this.points_[index];
    motion.values_[createjs.TweenMotion.ID.Y] = this.points_[index + 1];
    if (this.points_[index + 2]) {
      motion.values_[createjs.TweenMotion.ID.ROTATION] =
          this.points_[index + 3];
    }
  }

  // Copy the property mask of the source. (This motion will only add bits to
  // this mask, i.e. this motion does not clear its bits.)
  motion.mask_ = this.mask_;
};

/**
 * Updates the '_off' property. (This method is used by createjs.TweenState
 * objects to attach display objects to a node tree or to detach them.)
 * @param {number} end
 * @const
 */
createjs.TweenMotion.prototype.updateOff = function(end) {
  /// <param type="number" name="end"/>
  if (this.values_[createjs.TweenMotion.ID.OFF] != end) {
    var property = new createjs.TweenProperty();
    property.setBinary(this.values_[createjs.TweenMotion.ID.OFF], end);
    this.properties_[createjs.TweenMotion.ID.OFF] = property;
    this.mask_ |= 1 << createjs.TweenMotion.ID.OFF;
  }
};

/**
 * Parses a 'guide' property and updates this motion.
 * @param {number} mask
 * @param {Array.<number>} path
 * @param {number=} opt_start
 * @param {number=} opt_end
 * @param {string=} opt_orientation
 * @const
 */
createjs.TweenMotion.prototype.updateGuide =
    function(mask, path, opt_start, opt_end, opt_orientation) {
  /// <param type="number" name="mask"/>
  /// <param type="Array" elementType="number" name="path"/>
  /// <param type="number" optional="true" name="opt_start"/>
  /// <param type="number" optional="true" name="opt_end"/>
  /// <param type="string" optional="true" name="opt_orientation"/>
  var start = opt_start || 0;
  var end = (opt_end == null) ? 1 : opt_end;
  var angle = 0;
  var orientation;
  if (!opt_orientation || mask & (1 << createjs.TweenMotion.ID.ROTATION)) {
    orientation = createjs.TweenMotion.Orientation.NONE;
    this.mask_ |= (1 << createjs.TweenMotion.ID.X) |
                  (1 << createjs.TweenMotion.ID.Y);
  } else {
    var ORIENT = {
      'auto': createjs.TweenMotion.Orientation.AUTO,
      'cw': createjs.TweenMotion.Orientation.CLOCKWISE,
      'ccw': createjs.TweenMotion.Orientation.COUNTERCLOCKWISE
    };
    orientation =
        ORIENT[opt_orientation] || createjs.TweenMotion.Orientation.FIXED;
    angle = createjs.atan2(path[3] - path[1], path[2] - path[0]);
    this.mask_ |= (1 << createjs.TweenMotion.ID.X) |
                  (1 << createjs.TweenMotion.ID.Y) |
                  (1 << createjs.TweenMotion.ID.ROTATION);
  }
  // A 'guide' property always changes the 'x' and 'y' properties, i.e. it
  // changes number properties.
  this.noNumber_ = false;

  // Calculate the number of segments in this path. A path consists of three
  // points (i.e. six numbers) and shares its end point (i.e. two numbers) with
  // its next path, i.e. the first segment adds six numbers to the path and the
  // every other segment adds four numbers to the path, respectively. To
  // calculate its inverse function, the number of segments is equal to
  // 'Math.floor((path.length - 2) / 4)'.
  var segments = (path.length - 2) >> 2;

  // Calculate the Euclidean distance of whole this guide path. This method
  // divides the distance by the duration of this motion so its target moves on
  // the path in the same speed.
  var length = 0;
  var curves = [];
  for (var i = 0; i < segments; ++i) {
    // Creates a quadratic bezier curve consisting of six points (path[i * 4],
    // path[i * 4 + 1], ..., path[i * 4 + 5]) and add its Euclidean distance.
    var index = i << 2;
    var curve = new createjs.TweenMotion.Curve(path, index, length);
    if (orientation) {
      curve.setRotation(orientation);
    }
    length += curve.getDistance();
    curves[i] = curve;
  }

  // For each frames from zero to the duration of this motion, calculate the
  // position of its target at that time.
  start *= length;
  end *= length;
  var scale = end - start;
  var points = [
    path[0], path[1], orientation, angle
  ];
  var step = 0;
  var duration = this.duration_ - 1;
  for (var frame = 1; frame < duration; ++frame) {
    // Calculate the position in this guide path from the frame number. This
    // conversion converts a frame number "[0,duration)" to a normalized ratio
    // "[0,1)", and converts the normalized ratio to the position "[0,length)"
    // as listed in the following table.
    //   +----------+--------------+--------------------------------------+
    //   | frame    | ratio        | position                             |
    //   +----------+--------------+--------------------------------------+
    //   | 0        | 0            | start * length                       |
    //   | n        | n / duration | (start + n * (end - start)) * length |
    //   | duration | 1            | end * length                         |
    //   +----------+--------------+--------------------------------------+
    var ratio = frame * this.scale_;
    if (this.ease_) {
      ratio = this.ease_.interpolate(ratio);
    }
    var position = start + ratio * scale;

    // Find the curve that includes the position and set interpolated points.
    var index = frame << 2;
    for (var j = step; j < segments; ++j) {
      var curve = curves[j];
      if (curve.interpolate(position, points, index, angle)) {
        step = j;
        break;
      }
    }
  }
  var index = duration << 2;
  var curve = curves[segments - 1];
  curve.getLast(points, index, angle);

  // Save the calculated points.
  this.points_ = points;
};

/**
 * Parses a property and updates this motion.
 * @param {Object} properties
 * @return {createjs.Graphics}
 * @const
 */
createjs.TweenMotion.prototype.updateProperties = function(properties) {
  /// <param type="Object" name="properties"/>
  /// <returns type="createjs.Graphics"/>
  /**
   * A mapping table from a property name to a property ID.
   * @const {Object.<string,number>}
   */
  var ID_MAP = {
    'x': createjs.TweenMotion.ID.X,
    'y': createjs.TweenMotion.ID.Y,
    'scaleX': createjs.TweenMotion.ID.SCALE_X,
    'scaleY': createjs.TweenMotion.ID.SCALE_Y,
    'skewX': createjs.TweenMotion.ID.SKEW_X,
    'skewY': createjs.TweenMotion.ID.SKEW_Y,
    'regX': createjs.TweenMotion.ID.REG_X,
    'regY': createjs.TweenMotion.ID.REG_Y,
    'rotation': createjs.TweenMotion.ID.ROTATION,
    'alpha': createjs.TweenMotion.ID.ALPHA,
    '_off': createjs.TweenMotion.ID.OFF,
    'visible': createjs.TweenMotion.ID.VISIBLE,
    'text': createjs.TweenMotion.ID.TEXT,
    'graphics': createjs.TweenMotion.ID.GRAPHICS,
    'startPosition': createjs.TweenMotion.ID.START_POSITION,
    'loop': createjs.TweenMotion.ID.LOOP,
    'playMode': createjs.TweenMotion.ID.PLAY_MODE
  };
  var graphics = null;
  var mask = 0;
  for (var key in properties) {
    var end = properties[key];
    var property = new createjs.TweenProperty();
    var id = ID_MAP[key];
    mask |= 1 << id;
    if (id <= createjs.TweenMotion.ID.START_POSITION) {
      property.setNumber(this.values_[id], createjs.castNumber(end));
      this.noNumber_ = false;
    } else if (id == createjs.TweenMotion.ID.PLAY_MODE) {
      property.setPlayMode(this.values_[id], createjs.castString(end));
    } else if (id <= createjs.TweenMotion.ID.LOOP) {
      property.setBinary(this.values_[id], end | 0);
    } else if (id == createjs.TweenMotion.ID.GRAPHICS) {
      graphics = /** @type {createjs.Graphics} */ (end);
      property.setGraphics(this.graphics_, graphics);
    } else {
      property.setText(this.text_, createjs.castString(end));
    }
    this.properties_[id] = property;
  }

  // Merge the mask of properties parsed by this method.
  this.mask_ |= mask;

  // Parse a 'guide' property AFTER parsing the other properties to ignore its
  // 'orient' property when the input property has a 'rotation' property.
  var guide = properties['guide'];
  if (guide) {
    var path = /** @type {Array.<number>} */ (guide['path']);
    this.updateGuide(
        mask, path, guide['start'], guide['end'], guide['orient']);
  }
  return graphics;
};

/**
 * Returns whether this motion needs to update its values. It is not so fast for
 * a motion to update its values. This method is used by tweens to updating
 * their motions only when they have to.
 * @param {number} position
 * @param {boolean} seek
 * @param {number} step
 * @param {number} previous
 * @return {boolean}
 * @const
 */
createjs.TweenMotion.prototype.needUpdate =
    function(position, seek, step, previous) {
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="seek"/>
  /// <param type="number" name="step"/>
  /// <param type="number" name="previous"/>
  /// <returns type="boolean"/>
  // This motion needs to update its values only when its current values are not
  // equal to its previously-interpolated ones.
  if (this.noNumber_ && step == previous) {
    if (!seek && position != this.start_ && position != this.end_) {
      return false;
    }
  }
  return true;
};

/**
 * Calculates the property values of this motion.
 * @param {number} time
 * @return {number}
 * @const
 */
createjs.TweenMotion.prototype.interpolate = function(time) {
  /// <param type="number" name="time"/>
  /// <returns type="number"/>

  // Calculate the normalized position (a number in [0,1)) from an absolute
  // time (used by the caller tween) and apply an easing function to it.
  time -= this.start_;
  var position = time * this.scale_;
  var ratio = this.ease_ ? this.ease_.interpolate(position) : position;

  // When this motion has guides, update them and copy their values to this
  // motion. (When a tween property has both a 'guide' property and a 'rotation'
  // one. This guide should use the value of the 'rotation' property.)
  if (this.points_) {
    var index = time << 2;
    this.values_[createjs.TweenMotion.ID.X] = this.points_[index];
    this.values_[createjs.TweenMotion.ID.Y] = this.points_[index + 1];
    if (this.points_[index + 2]) {
      this.values_[createjs.TweenMotion.ID.ROTATION] = this.points_[index + 3];
    }
  }

  // Scan properties to update this motion.
  // Scan number properties.
  var property;
  for (var i = createjs.TweenMotion.ID.X;
       i <= createjs.TweenMotion.ID.ALPHA; ++i) {
    property = this.getProperty_(i);
    if (property) {
      this.values_[i] = property.getNumber(ratio);
    }
  }
  // A 'startPosition' property is an autonomous clock, i.e. a position
  // automatically increased by the target createjs.MovieClip object.
  property = this.getProperty_(createjs.TweenMotion.ID.START_POSITION);
  this.values_[createjs.TweenMotion.ID.START_POSITION] =
      property ? property.getNumber(position) : -1;
  // Scan binary properties.
  for (var i = createjs.TweenMotion.ID.PLAY_MODE;
       i <= createjs.TweenMotion.ID.LOOP; ++i) {
    property = this.getProperty_(i);
    if (property) {
      this.values_[i] = property.getBinary(ratio);
    }
  }
  // Scan the text property.
  property = this.getProperty_(createjs.TweenMotion.ID.TEXT);
  if (property) {
    this.text_ = property.getText(ratio);
  }
  // Scan the graphics (or Object) property.
  property = this.getProperty_(createjs.TweenMotion.ID.GRAPHICS);
  if (property) {
    this.graphics_ = property.getGraphics(ratio);
  }
  return this.mask_;
}
