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
/// <reference path="graphics.js"/>

/**
 * An interface used by the createjs.Tween object to change properties of a
 * target object.
 * @interface
 */
createjs.TweenTarget = function() {};

/**
 * Play modes of the tweens attached to a target object.
 * @enum {number}
 */
createjs.TweenTarget.PlayMode = {
  INDEPENDENT: 0,
  SINGLE: 1,
  SYNCHED: 2
};

/**
 * Orientations used by the createjs.TweenTarget.RotationProperty class.
 * @enum {number}
 */
createjs.TweenTarget.Orientation = {
  NONE: 0,
  FIXED: 1,
  AUTO: 2,
  CLOCKWISE: 3,
  COUNTERCLOCKWISE: 4
};

/**
 * An abstract class that changes a property of a createjs.TweenTarget object.
 * @constructor
 */
createjs.TweenTarget.Property = function() {
};

/**
 * Whether this property is a number property.
 * @type {number}
 * @private
 */
createjs.TweenTarget.Property.prototype.isNumber_ = 0;

/**
 * Sets an interpolated value to the specified createjs.TweenTarget object.
 * @param {createjs.TweenTarget} target
 * @param {createjs.TweenTarget} proxy
 * @param {number} ratio
 * @param {createjs.TweenTarget.Property.Listener} listener
 * @param {number} position
 * @param {Array.<createjs.TweenTarget>} targets
 */
createjs.TweenTarget.Property.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
};

/**
 * Returns whether this property is a number property.
 * @return {number}
 * @const
 */
createjs.TweenTarget.Property.prototype.isNumber = function() {
  /// <returns type="number"/>
  return this.isNumber_;
};

/**
 * Returns a clone of this property.
 * @param {createjs.TweenTarget} target
 * @param {Array.<createjs.TweenTarget>} targets
 * @param {*=} opt_value
 * @return {createjs.TweenTarget.Property}
 */
createjs.TweenTarget.Property.prototype.clone = function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param optional="true" name="opt_value"/>
  /// <returns type="createjs.TweenTarget.Property"/>
  return null;
};

/**
 * Interpolates this property with the specified value and returns a clone.
 * @param {*} value
 * @param {number} t0
 * @param {number} t1
 * @return {createjs.TweenTarget.Property}
 */
createjs.TweenTarget.Property.prototype.interpolate = function(value, t0, t1) {
  /// <param name="value"/>
  /// <param type="number" name="t0"/>
  /// <param type="number" name="t1"/>
  return this.clone(null, null);
};

/**
 * An interface that listens events from createjs.TweenTarget.Property objects.
 * @interface
 */
createjs.TweenTarget.Property.Listener = function() {};

/**
 * Called when a createjs.TweenTarget.LoopProperty object changes its value.
 * @param {boolean} value
 */
createjs.TweenTarget.Property.Listener.prototype.handleLoopChanged =
    function(value) {};

/**
 * A class that encapsulates a setter function for a property of a
 * createjs.TweenTarget.Property object. This class is used for creating
 * createjs.TweenTarget.Property objects.
 * @param {Function} setter
 * @constructor
 */
createjs.TweenTarget.Setter = function(setter) {
  /**
   * The setter function.
   * @const {Function}
   * @private
   */
  this.fn_ = setter;
};

/**
 * Whether this setter sets a number property.
 * @const {number}
 * @private
 */
createjs.TweenTarget.Setter.NUMBER_ = 0;

/**
 * Whether this setter sets a boolean property.
 * @const {number}
 * @private
 */
createjs.TweenTarget.Setter.BOOLEAN_ = 1;

/**
 * Whether this setter sets a string property.
 * @const {number}
 * @private
 */
createjs.TweenTarget.Setter.STRING_ = 2;

/**
 * Whether this setter sets a loop property.
 * @const {number}
 * @private
 */
createjs.TweenTarget.Setter.LOOP_ = 3;

/**
 * Whether this setter sets a Graphics property.
 * @const {number}
 * @private
 */
createjs.TweenTarget.Setter.GRAPHICS_ = 4;

/**
 * Whether this setter sets a startPosition property.
 * @const {number}
 * @private
 */
createjs.TweenTarget.Setter.POSITION_ = 5;

/**
 * The type of properties created with this setter.
 * @type {number}
 * @private
 */
createjs.TweenTarget.Setter.prototype.type_ = -1;

/**
 * The start value for number properties created with this setter.
 * @type {number}
 * @private
 */
createjs.TweenTarget.Setter.prototype.number_ = 0;

/**
 * The start value for boolean properties created with this setter.
 * @type {boolean}
 * @private
 */
createjs.TweenTarget.Setter.prototype.bool_ = false;

/**
 * The start value for string properties created with this setter.
 * @type {string}
 * @private
 */
createjs.TweenTarget.Setter.prototype.text_ = '';

/**
 * The start value for Graphics properties created with this setter.
 * @type {createjs.Graphics}
 * @private
 */
createjs.TweenTarget.Setter.prototype.graphics_ = null;

/**
 * Disables this setter.
 * @const
 */
createjs.TweenTarget.Setter.prototype.setNull = function() {
  this.type_ = -1;
};

/**
 * Sets the start value for number properties created with this setter.
 * @param {number} value
 * @const
 */
createjs.TweenTarget.Setter.prototype.setNumber = function(value) {
  /// <param type="number" name="value"/>
  this.type_ = createjs.TweenTarget.Setter.NUMBER_;
  this.number_ = value;
};

/**
 * Sets the start value for boolean properties created with this setter.
 * @param {boolean} value
 * @const
 */
createjs.TweenTarget.Setter.prototype.setBoolean = function(value) {
  /// <param type="boolean" name="value"/>
  this.type_ = createjs.TweenTarget.Setter.BOOLEAN_;
  this.bool_ = value;
};

/**
 * Sets the start value for string properties created with this setter.
 * @param {string} value
 * @const
 */
createjs.TweenTarget.Setter.prototype.setString = function(value) {
  /// <param type="string" name="value"/>
  this.type_ = createjs.TweenTarget.Setter.STRING_;
  this.text_ = value;
};

/**
 * Sets the start value for 'loop' properties created with this setter.
 * @param {boolean} value
 * @const
 */
createjs.TweenTarget.Setter.prototype.setLoop = function(value) {
  /// <param type="boolean" name="value"/>
  this.type_ = createjs.TweenTarget.Setter.LOOP_;
  this.bool_ = value;
};

/**
 * Sets the start value for Graphics properties created with this setter.
 * @param {createjs.Graphics} value
 * @const
 */
createjs.TweenTarget.Setter.prototype.setGraphics = function(value) {
  /// <param type="createjs.Graphics" name="value"/>
  this.type_ = createjs.TweenTarget.Setter.GRAPHICS_;
  this.graphics_ = value;
};

/**
 * Sets the start value for startPosition properties created with this setter.
 * @param {number} value
 * @const
 */
createjs.TweenTarget.Setter.prototype.setPosition = function(value) {
  /// <param type="number" name="value"/>
  this.type_ = createjs.TweenTarget.Setter.POSITION_;
  this.number_ = value;
};

/**
 * A mapping from a string key to its setter function.
 * @const {Object.<string,createjs.TweenTarget.Setter>}
 * @private
 */
createjs.TweenTarget.Property.setters_ = {
};

/**
 * A class that changes a property of a createjs.TweenTarget object. This class
 * is used by the createjs.TweenTarget.StateProperty class to set Object
 * properties.
 * @param {Function} setter
 * @param {*} value
 * @constructor
 */
createjs.TweenTarget.ValueProperty = function(setter, value) {
  /**
   * The function that changes this property.
   * @const {Function}
   * @private
   */
  this.setter_ = setter;

  /**
   * The value of this property.
   * @const {*}
   * @private
   */
  this.value_ = value;
};

/**
 * Creates a list of createjs.TweenTarget.ValueProperty objects from an Object
 * property.
 * @param {Object} properties
 * @return {Array.<createjs.TweenTarget.ValueProperty>}
 */
createjs.TweenTarget.ValueProperty.get = function(properties) {
  /// <param type="Object" name="properties"/>
  /// <returns type="Array" elementType="createjs.TweenTarget.ValueProperty"/>
  var values = [];
  for (var key in properties) {
    var setter = createjs.TweenTarget.Property.setters_[key];
    if (setter) {
      values.push(new createjs.TweenTarget.ValueProperty(
          setter.fn_, properties[key]));
    }
  }
  return values;
};

/**
 * Sets a property value for the specified createjs.TweenTarget object.
 * @param {createjs.TweenTarget} target
 */
createjs.TweenTarget.ValueProperty.prototype.setValue = function(target) {
  /// <param type="createjs.TweenTarget" name="target"/>
  this.setter_.call(target, this.value_);
};

/**
 * A class that changes a number property of a createjs.TweenTarget object.
 * @param {function(number)} setter
 * @param {number} start
 * @param {number} end
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.NumberProperty = function(setter, start, end) {
  createjs.TweenTarget.Property.call(this);

  /**
   * The function that changes this property.
   * @const {function(number)}
   * @private
   */
  this.setter_ = setter;

  /**
   * The start value of this property.
   * @const {number}
   * @private
   */
  this.start_ = start;

  /**
   * The end value of this property.
   * @const {number}
   * @private
   */
  this.end_ = end;
};
createjs.inherits('TweenTarget.NumberProperty',
                  createjs.TweenTarget.NumberProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.NumberProperty object.
 * @param {function(number)} setter
 * @param {number} start
 * @return {createjs.TweenTarget.NumberProperty}
 * @const
 */
createjs.TweenTarget.NumberProperty.get = function(setter, start) {
  /// <param type="Function" name="setter"/>
  /// <param type="number" name="start"/>
  /// <returns type="createjs.TweenTarget.NumberProperty"/>
  return new createjs.TweenTarget.NumberProperty(setter, start, start);
};

/**
 * Creates a copy of the specified createjs.TweenTarget.NumberProperty object.
 * @param {createjs.TweenTarget.NumberProperty} property
 * @param {number} end
 * @return {createjs.TweenTarget.NumberProperty}
 * @const
 */
createjs.TweenTarget.NumberProperty.clone = function(property, end) {
  /// <param type="createjs.TweenTarget.NumberProperty" name="property"/>
  /// <param type="number" name="end"/>
  /// <returns type="createjs.TweenTarget.NumberProperty"/>
  return new createjs.TweenTarget.NumberProperty(property.setter_, end, end);
};

/** @override */
createjs.TweenTarget.NumberProperty.prototype.isNumber_ = 1;

/** @override */
createjs.TweenTarget.NumberProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  this.setter_.call(target, this.start_ + (this.end_ - this.start_) * ratio);
};

/** @override */
createjs.TweenTarget.NumberProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="number" name="opt_value"/>
  /// <returns type="createjs.TweenTarget.NumberProperty"/>
  if (opt_value == null) {
    if (this.start_ == this.end_) {
      return this;
    }
    opt_value = this.end_;
  }
  var end = createjs.getNumber(opt_value);
  return new createjs.TweenTarget.NumberProperty(this.setter_, this.end_, end);
};

/** @override */
createjs.TweenTarget.NumberProperty.prototype.interpolate =
    function(value, t0, t1) {
  /// <param type="number" name="value"/>
  /// <param type="number" name="t0"/>
  /// <param type="number" name="t1"/>
  /// <returns type="createjs.TweenTarget.NumberProperty"/>
  if (value == null) {
    return this.clone(null, null);
  }
  var difference = createjs.getNumber(value) - this.end_;
  var start = this.end_ + difference * t0;
  var end = this.end_ + difference * t1;
  return new createjs.TweenTarget.NumberProperty(this.setter_, start, end);
};

/**
 * A class that changes the position of a createjs.TweenTarget object so it
 * moves along the specified quadratic-Bezier path.
 * @param {createjs.TweenTarget.NumberProperty} x
 * @param {createjs.TweenTarget.NumberProperty} y
 * @param {Array.<number>} path
 * @param {number} index
 * @param {number} start
 * @param {number} step
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.PathProperty =
    function(x, y, path, index, start, step) {
  createjs.TweenTarget.Property.call(this);

  /**
   * The function that changes an 'x' property.
   * @const {function(number)}
   * @private
   */
  this.setX_ = x.setter_;

  /**
   * The function that changes a 'y' property.
   * @const {function(number)}
   * @private
   */
  this.setY_ = y.setter_;

  /**
   * The first value of the x property.
   * @const {number}
   * @private
   */
  this.x0_ = path[index];

  /**
   * The first value of the y property.
   * @const {number}
   * @private
   */
  this.y0_ = path[index + 1];

  /**
   * The second value of the x property.
   * @const {number}
   * @private
   */
  this.x1_ = path[index + 2];

  /**
   * The second value of this property.
   * @const {number}
   * @private
   */
  this.y1_ = path[index + 3];

  /**
   * The third value of this property.
   * @const {number}
   * @private
   */
  this.x2_ = path[index + 4];

  /**
   * The third value of this property.
   * @const {number}
   * @private
   */
  this.y2_ = path[index + 5];

  /**
   * The start position in this path.
   * @const {number}
   * @private
   */
  this.start_ = start;

  /**
   * The step length of this path.
   * @const {number}
   * @private
   */
  this.step_ = step;
};
createjs.inherits('TweenTarget.PathProperty',
                  createjs.TweenTarget.PathProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.PathProperty object.
 * @param {createjs.TweenTarget.NumberProperty} x
 * @param {createjs.TweenTarget.NumberProperty} y
 * @param {Array.<number>} path
 * @param {number} index
 * @param {number} start
 * @param {number} step
 * @return {createjs.TweenTarget.PathProperty}
 * @const
 */
createjs.TweenTarget.PathProperty.get =
    function(x, y, path, index, start, step) {
  /// <param type="createjs.TweenTarget.NumberProperty" name="x"/>
  /// <param type="createjs.TweenTarget.NumberProperty" name="y"/>
  /// <param type="Array" elementType="number" name="path"/>
  /// <param type="number" name="index"/>
  /// <param type="number" name="start"/>
  /// <param type="number" name="step"/>
  /// <returns type="createjs.TweenTarget.GuideProperty"/>
  return new createjs.TweenTarget.PathProperty(
      x, y, path, index, start, step);
};

/** @override */
createjs.TweenTarget.PathProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  var t = this.start_ + ratio * this.step_;
  var t_ = 1 - t;
  var t0 = t_ * t_;
  var t1 = 2 * t_ * t;
  var t2 = t * t;
  var x = t0 * this.x0_ + t1 * this.x1_ + t2 * this.x2_;
  var y = t0 * this.y0_ + t1 * this.y1_ + t2 * this.y2_;
  this.setX_.call(target, x);
  this.setY_.call(target, y);
};

/**
 * A class that changes the angle of a createjs.TweenTarget object so it faces
 * to the tangent of the specified quadratic-Bezier path.
 * @param {createjs.TweenTarget.NumberProperty} rotation
 * @param {Array.<number>} path
 * @param {number} index
 * @param {number} start
 * @param {number} step
 * @param {number} offset
 * @param {number} delta
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.RotationProperty =
    function(rotation, path, index, start, step, offset, delta) {
  /**
   * The function that changes a 'rotation' property.
   * @const {function(number)}
   * @private
   */
  this.setter_ = rotation.setter_;

  /**
   * The x value of the first vector.
   * @const {number}
   * @private
   */
  this.x0_ = path[index + 2] - path[index + 0];

  /**
   * The y value of the first vector.
   * @const {number}
   * @private
   */
  this.y0_ = path[index + 3] - path[index + 1];

  /**
   * The x value or the second vector.
   * @const {number}
   * @private
   */
  this.x1_ = path[index + 4] - path[index + 2];

  /**
   * The y value of the second vector.
   * @const {number}
   * @private
   */
  this.y1_ = path[index + 5] - path[index + 3];

  /**
   * The start position in this path.
   * @const {number}
   * @private
   */
  this.start_ = start;

  /**
   * The step length of this path.
   * @const {number}
   * @private
   */
  this.step_ = step;

  /**
   * The angle offset to be added to calculated ones.
   * @const {number}
   * @private
   */
  this.offset_ = rotation.end_ - offset;

  /**
   * The delta angle to be added to calculated ones.
   * @const {number}
   * @private
   */
  this.delta_ = delta;
};
createjs.inherits('TweenTarget.RotationProperty',
                  createjs.TweenTarget.RotationProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.RotationProperty object.
 * @param {createjs.TweenTarget.NumberProperty} rotation
 * @param {Array.<number>} path
 * @param {number} index
 * @param {number} start
 * @param {number} step
 * @param {number} orientation
 * @param {number} offset
 * @return {createjs.TweenTarget.RotationProperty}
 * @const
 */
createjs.TweenTarget.RotationProperty.get =
    function(rotation, path, index, start, step, orientation, offset) {
  /// <param type="createjs.TweenTarget.NumberProperty" name="rotation"/>
  /// <param type="Array" elementType="number" name="path"/>
  /// <param type="number" name="index"/>
  /// <param type="number" name="start"/>
  /// <param type="number" name="step"/>
  /// <param type="number" name="orientation"/>
  /// <param type="number" name="offset"/>
  /// <returns type="createjs.TweenTarget.RotationProperty"/>
  var delta = 0;
  if (orientation != createjs.TweenTarget.Orientation.FIXED) {
    var angle0 = createjs.atan2(path[index + 2] - path[index],
                                path[index + 3] - path[index + 1]);
    var angle1 = createjs.atan2(path[index + 4] - path[index + 2],
                                path[index + 5] - path[index + 3]);
    delta = angle1 - angle0;
    if (orientation == createjs.TweenTarget.Orientation.COUNTERCLOCKWISE) {
      if (delta > 0) {
        delta -= 360;
      }
    } else if (orientation == createjs.TweenTarget.Orientation.CLOCKWISE) {
      if (delta < 0) {
        delta += 360;
      }
    } else {
      if (delta > 180) {
        delta -= 360;
      } else if (delta < -180) {
        delta += 360;
      }
    }
  }
  return new createjs.TweenTarget.RotationProperty(
      rotation, path, index, start, step, offset, delta);
};

/**
 * Retrieves an angle offset. This method is used for creating a list of
 * createjs.TweenTarget.RotationProperty objects from a path.
 * @param {Array.<number>} path
 * @param {number} index
 * @return {number}
 */
createjs.TweenTarget.RotationProperty.getOffset = function(path, index) {
  /// <param type="Array" elementType="number" name="path"/>
  /// <param type="number" name="index"/>
  /// <returns type="number"/>
  return createjs.atan2(path[index + 3] - path[index + 1],
                        path[index + 2] - path[index]);
};

/** @override */
createjs.TweenTarget.RotationProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  var t = this.start_ + ratio * this.step_;
  var t_ = 1 - t;
  var x = t_ * this.x0_ + t * this.x1_;
  var y = t_ * this.y0_ + t * this.y1_;
  var rotation = createjs.atan2(y, x) + this.offset_ + this.delta_ * t;
  this.setter_.call(target, rotation);
};

/**
 * A class that changes a boolean property of a createjs.TweenTarget object.
 * @param {function(boolean)} setter
 * @param {boolean} start
 * @param {boolean} end
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.BooleanProperty = function(setter, start, end) {
  createjs.TweenTarget.Property.call(this);

  /**
   * The function that changes this property.
   * @const {function(boolean)}
   * @private
   */
  this.setter_ = setter;

  /**
   * The start value of this property.
   * @const {boolean}
   * @private
   */
  this.start_ = start;

  /**
   * The end value of this property.
   * @const {boolean}
   * @private
   */
  this.end_ = end;
};
createjs.inherits('TweenTarget.BooleanProperty',
                  createjs.TweenTarget.BooleanProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.BooleanProperty object.
 * @param {function(boolean)} setter
 * @param {boolean} start
 * @return {createjs.TweenTarget.BooleanProperty}
 * @const
 */
createjs.TweenTarget.BooleanProperty.get = function(setter, start) {
  /// <param type="Function" name="setter"/>
  /// <param type="boolean" name="start"/>
  /// <returns type="createjs.TweenTarget.BooleanProperty"/>
  return new createjs.TweenTarget.BooleanProperty(setter, start, start);
};

/**
 * Retrieves the interpolated value.
 * @param {number} ratio
 * @return {boolean}
 * @protected
 */
createjs.TweenTarget.BooleanProperty.prototype.getBoolean = function(ratio) {
  return (ratio == 1) ? this.end_ : this.start_;
};

/** @override */
createjs.TweenTarget.BooleanProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  this.setter_.call(target, this.getBoolean(ratio));
};

/** @override */
createjs.TweenTarget.BooleanProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="boolean" name="opt_value"/>
  /// <returns type="createjs.TweenTarget.BooleanProperty"/>
  if (opt_value == null) {
    if (this.start_ == this.end_) {
      return this;
    }
    opt_value = this.end_;
  }
  var end = createjs.getBoolean(opt_value);
  return new createjs.TweenTarget.BooleanProperty(this.setter_, this.end_, end);
};

/**
 * A class that changes a string property of a createjs.TweenTarget object.
 * @param {Function} setter
 * @param {string} start
 * @param {string} end
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.StringProperty = function(setter, start, end) {
  createjs.TweenTarget.Property.call(this);

  /**
   * The function that changes this property.
   * @const {Function}
   * @private
   */
  this.setter_ = setter;

  /**
   * The start value of this property.
   * @const {string}
   * @private
   */
  this.start_ = start;

  /**
   * The end value of this property.
   * @const {string}
   * @private
   */
  this.end_ = end;
};
createjs.inherits('TweenTarget.StringProperty',
                  createjs.TweenTarget.StringProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.StringProperty object.
 * @param {Function} setter
 * @param {string} start
 * @return {createjs.TweenTarget.StringProperty}
 * @const
 */
createjs.TweenTarget.StringProperty.get = function(setter, start) {
  /// <param type="number" name="key"/>
  /// <param type="Function" name="setter"/>
  /// <param type="string" name="start"/>
  /// <returns type="createjs.TweenTarget.StringProperty"/>
  return new createjs.TweenTarget.StringProperty(setter, start, start);
};

/** @override */
createjs.TweenTarget.StringProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  this.setter_.call(target, (ratio == 1) ? this.end_ : this.start_, proxy);
};

/** @override */
createjs.TweenTarget.StringProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="string" name="value"/>
  /// <returns type="createjs.TweenTarget.StringProperty"/>
  if (opt_value == null) {
    if (this.start_ == this.end_) {
      return this;
    }
    opt_value = this.end_;
  }
  var end = createjs.getString(opt_value);
  return new createjs.TweenTarget.StringProperty(this.setter_, this.end_, end);
};

/**
 * A class that changes a loop property of a createjs.MovieClip object.
 * @param {function(boolean)} setter
 * @param {boolean} start
 * @param {boolean} end
 * @extends {createjs.TweenTarget.BooleanProperty}
 * @constructor
 */
createjs.TweenTarget.LoopProperty = function(setter, start, end) {
  createjs.TweenTarget.BooleanProperty.call(this, setter, start, end);
};
createjs.inherits('TweenTarget.LoopProperty',
                  createjs.TweenTarget.LoopProperty,
                  createjs.TweenTarget.BooleanProperty);

/**
 * Creates a new createjs.TweenTarget.LoopProperty object.
 * @param {function(boolean)} setter
 * @param {boolean} start
 * @return {createjs.TweenTarget.LoopProperty}
 * @const
 */
createjs.TweenTarget.LoopProperty.get = function(setter, start) {
  /// <param type="Function" name="setter"/>
  /// <param type="boolean" name="start"/>
  /// <returns type="createjs.TweenTarget.LoopProperty"/>
  return new createjs.TweenTarget.LoopProperty(setter, start, start);
};

/** @override */
createjs.TweenTarget.LoopProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  createjs.TweenTarget.LoopProperty.superClass_.setValue.call(
      this, target, proxy, ratio, listener, position, targets);
  listener.handleLoopChanged(this.getBoolean(ratio));
};

/** @override */
createjs.TweenTarget.LoopProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="boolean" name="opt_value"/>
  /// <returns type="createjs.TweenTarget.LoopProperty"/>
  if (opt_value == null) {
    if (this.start_ == this.end_) {
      return this;
    }
    opt_value = this.end_;
  }
  var end = createjs.getBoolean(opt_value);
  return new createjs.TweenTarget.LoopProperty(this.setter_, this.end_, end);
};

/**
 * A class that changes the 'graphics' property of a createjs.TweenTarget
 * object.
 * @param {Function} setter
 * @param {createjs.Graphics} start
 * @param {createjs.Graphics} end
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.GraphicsProperty = function(setter, start, end) {
  createjs.TweenTarget.Property.call(this);

  /**
   * The function that changes this property.
   * @const {Function}
   * @private
   */
  this.setter_ = setter;

  /**
   * The start value of this property.
   * @const {createjs.Graphics}
   * @private
   */
  this.start_ = start;

  /**
   * The end value of this property.
   * @const {createjs.Graphics}
   * @private
   */
  this.end_ = end;
};
createjs.inherits('TweenTarget.GraphicsProperty',
                  createjs.TweenTarget.GraphicsProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.GraphicsProperty object.
 * @param {Function} setter
 * @param {createjs.Graphics} start
 * @return {createjs.TweenTarget.GraphicsProperty}
 * @const
 */
createjs.TweenTarget.GraphicsProperty.get = function(setter, start) {
  /// <param type="Function" name="setter"/>
  /// <param type="createjs.Graphics" name="start"/>
  /// <returns type="createjs.TweenTarget.GraphicsProperty"/>
  return new createjs.TweenTarget.GraphicsProperty(setter, start, start);
};

/** @override */
createjs.TweenTarget.GraphicsProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  this.setter_.call(target, (ratio == 1) ? this.end_ : this.start_);
};

/** @override */
createjs.TweenTarget.GraphicsProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="createjs.Graphics" name="opt_value"/>
  /// <returns type="createjs.TweenTarget.GraphicsProperty"/>
  if (arguments.length == 2) {
    if (this.start_ === this.end_) {
      return this;
    }
    opt_value = this.end_;
  }
  var end = /** @type {createjs.Graphics} */ (opt_value);
  if (target) {
    target.addGraphics(end);
  }
  return new createjs.TweenTarget.GraphicsProperty(this.setter_, this.end_, end);
};

/**
 * A class that changes a startPosition property of a createjs.MovieClip object.
 * @param {function(number)} setter
 * @param {number} start
 * @param {number} end
 * @extends {createjs.TweenTarget.NumberProperty}
 * @constructor
 */
createjs.TweenTarget.PositionProperty = function(setter, start, end) {
  createjs.TweenTarget.NumberProperty.call(this, setter, start, end);
};
createjs.inherits('TweenTarget.PositionProperty',
                  createjs.TweenTarget.PositionProperty,
                  createjs.TweenTarget.NumberProperty);

/**
 * Creates a new createjs.TweenTarget.PositionProperty object.
 * @param {function(number)} setter
 * @param {number} start
 * @return {createjs.TweenTarget.PositionProperty}
 * @const
 */
createjs.TweenTarget.PositionProperty.get = function(setter, start) {
  /// <param type="Function" name="setter"/>
  /// <param type="number" name="start"/>
  /// <returns type="createjs.TweenTarget.PositionProperty"/>
  return new createjs.TweenTarget.PositionProperty(setter, start, start);
};

/** @override */
createjs.TweenTarget.PositionProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  if (position >= 0) {
    this.setter_.call(
        target, this.start_ + (this.end_ - this.start_) * position);
  }
};

/** @override */
createjs.TweenTarget.PositionProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param type="number" name="opt_value"/>
  /// <returns type="createjs.TweenTarget.NumberProperty"/>
  if (opt_value == null) {
    if (this.start_ == this.end_) {
      return this;
    }
    opt_value = this.end_;
  }
  var end = createjs.getNumber(opt_value);
  return new createjs.TweenTarget.PositionProperty(
      this.setter_, this.end_, end);
};

/**
 * A class that changes a state property of a createjs.TweenTarget object.
 * @param {Array.<createjs.TweenTarget>} targets
 * @param {Array.<Array.<createjs.TweenTarget.ValueProperty>>} start
 * @param {Array.<Array.<createjs.TweenTarget.ValueProperty>>} end
 * @extends {createjs.TweenTarget.Property}
 * @constructor
 */
createjs.TweenTarget.StateProperty = function(targets, start, end) {
  createjs.TweenTarget.Property.call(this);

  /**
   * The initial properties of the targets.
   * @const {Array.<Array.<createjs.TweenTarget.ValueProperty>>}
   * @private
   */
  this.start_ = start;

  /**
   * The final properties of the targets.
   * @const {Array.<Array.<createjs.TweenTarget.ValueProperty>>}
   * @private
   */
  this.end_ = end;
};
createjs.inherits('TweenTarget.StateProperty',
                  createjs.TweenTarget.StateProperty,
                  createjs.TweenTarget.Property);

/**
 * Creates a new createjs.TweenTarget.StateProperty object.
 * @param {Array.<createjs.TweenTarget>} targets
 * @return {createjs.TweenTarget.StateProperty}
 * @const
 */
createjs.TweenTarget.StateProperty.get = function(targets) {
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <returns type="createjs.TweenTarget.StateProperty"/>
  var start = [];
  for (var i = 0; i < targets.length; ++i) {
    start.push(createjs.TweenTarget.ValueProperty.get({ '_off': true }));
  }
  return new createjs.TweenTarget.StateProperty(targets, start, start);
};

/** @override */
createjs.TweenTarget.StateProperty.prototype.setValue =
    function(target, proxy, ratio, listener, position, targets) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="createjs.TweenTarget" name="proxy"/>
  /// <param type="number" name="ratio"/>
  /// <param type="createjs.TweenTarget.Property.Listener" name="listener"/>
  /// <param type="number" name="position"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  var properties = ratio == 1 ? this.end_ : this.start_;
  for (var i = 0; i < targets.length; ++i) {
    var values = properties[i];
    for (var j = 0; j < values.length; ++j) {
      values[j].setValue(targets[i]);
    }
  }
};

/** @override */
createjs.TweenTarget.StateProperty.prototype.clone =
    function(target, targets, opt_value) {
  /// <param type="createjs.TweenTarget" name="target"/>
  /// <param type="Array" elementType="createjs.TweenTarget" name="targets"/>
  /// <param name="opt_value"/>
  /// <returns type="createjs.TweenTarget.StateProperty"/>
  if (opt_value == null) {
    // Just create another property with the last state of this property when
    // this property is cloned without any arguments, i.e. when the wait()
    // method is called for a state tween.
    return new createjs.TweenTarget.StateProperty(
        targets, this.end_, this.end_);
  }
  // Normalize this state tween. This code fills implicit parameters to the
  // existing steps so each step represents the states of all targets added
  // or removed by this tween. For example, consider the code snippet listed
  // below.
  //   var shape1 = new createjs.Shape();
  //   var shape2 = new createjs.Shape();
  //     ...
  //   createjs.Tween.get({}).
  //       to({ state: [{ t: shape1 }]}).to({ state: [{ t: shape2 }]});
  // To fill implicit parameters to this tween, it becomes the state tween
  // listed below.
  //   createjs.Tween.get({}).
  //       to({ state: [{ t: shape1, p: { _off: false }},
  //                    { t: shape2, p: { _off: true }}]}).
  //       to({ state: [{ t: shape1, p: { _off: true }},
  //                    { t: shape2, p: { _off: false }}]})
  // It is easy to seek normalized tweens and this code converts state tweens
  // to normalized ones.
  var end = /** @type {Array.<Object>} */ (createjs.getArray(opt_value));
  var properties = [];
  for (var i = 0; i < targets.length; ++i) {
    var off = true;
    var property = {};
    for (var j = 0; j < end.length; ++j) {
      var state = end[j];
      if (targets[i] === state['t']) {
        if (state['p']) {
          property = state['p'];
        }
        off = false;
        break;
      }
    }
    property['_off'] = off;
    properties.push(createjs.TweenTarget.ValueProperty.get(property));
  }
  return new createjs.TweenTarget.StateProperty(
      targets, this.end_, properties);
};

/**
 * Adds setters used for creating createjs.TweenTarget.Property objects that
 * changes the specified properties.
 * @param {Object.<string,Function>} setters
 * @const
 */
createjs.TweenTarget.Property.addSetters = function(setters) {
  for (var key in setters) {
    createjs.TweenTarget.Property.setters_[key] =
        new createjs.TweenTarget.Setter(setters[key]);
  }
};

/**
 * Adds setters used for creating createjs.TweenTarget.Property objects that
 * changes the specified properties.
 * @return {Object.<string,createjs.TweenTarget.Setter>}
 * @const
 */
createjs.TweenTarget.Property.getSetters = function() {
  /// <return type="Object" elementType="createjs.TweenTarget.Setter"/>
  return createjs.TweenTarget.Property.setters_;
};

/**
 * Creates a createjs.TweenTarget.Property object.
 * @param {createjs.TweenTarget.Setter} setter
 * @return {createjs.TweenTarget.Property}
 * @const
 */
createjs.TweenTarget.Property.get = function(setter) {
  /// <param type="createjs.TweenTarget.Setter" name="setter"/>
  /// <return type="createjs.TweenTarget.Property"/>
  if (setter.type_ == createjs.TweenTarget.Setter.NUMBER_) {
    return createjs.TweenTarget.NumberProperty.get(
        /** @type {function(number)} */ (setter.fn_),
        setter.number_);
  } else if (setter.type_ == createjs.TweenTarget.Setter.BOOLEAN_) {
    return createjs.TweenTarget.BooleanProperty.get(
        /** @type {function(boolean)} */ (setter.fn_),
        setter.bool_);
  } else if (setter.type_ == createjs.TweenTarget.Setter.STRING_) {
    return createjs.TweenTarget.StringProperty.get(setter.fn_, setter.text_);
  } else if (setter.type_ == createjs.TweenTarget.Setter.LOOP_) {
    return createjs.TweenTarget.LoopProperty.get(
        /** @type {function(boolean)} */ (setter.fn_),
        setter.bool_);
  } else if (setter.type_ == createjs.TweenTarget.Setter.POSITION_) {
    return createjs.TweenTarget.PositionProperty.get(
        /** @type {function(number)} */ (setter.fn_),
        setter.number_);
  } else if (setter.type_ == createjs.TweenTarget.Setter.GRAPHICS_) {
    return createjs.TweenTarget.GraphicsProperty.get(
        setter.fn_, setter.graphics_);
  } else {
    return null;
  }
};

/**
 * Registers a tween.
 * @param {createjs.TweenObject} tween
 */
createjs.TweenTarget.prototype.registerTween = function(tween) {};

/**
 * Unregisters a tween.
 * @param {createjs.TweenObject} tween
 */
createjs.TweenTarget.prototype.unregisterTween = function(tween) {};

/**
 * Removes all tween registered to this target.
 */
createjs.TweenTarget.prototype.resetTweens = function() {};

/**
 * Starts playing the tweens attached to this target.
 * @param {number} time
 */
createjs.TweenTarget.prototype.playTweens = function(time) {};

/**
 * Stops playing the tweens attached to this target.
 * @param {number} time
 */
createjs.TweenTarget.prototype.stopTweens = function(time) {};

/**
 * Updates the tweens attached to this target.
 * @param {number} time
 */
createjs.TweenTarget.prototype.updateTweens = function(time) {};

/**
 * Returns whether this target has tweens.
 * @return {boolean}
 */
createjs.TweenTarget.prototype.hasTweens = function() {};

/**
 * Sets the position of all tweens attached to this target.
 * @param {number} position
 */
createjs.TweenTarget.prototype.setTweenPosition = function(position) {};

/**
 * Sets the properties of all tweens attached to this target.
 * @param {boolean} loop
 * @param {number} position
 * @param {boolean} single
 */
createjs.TweenTarget.prototype.setTweenProperties =
    function(loop, position, single) {};

/**
 * Returns whether this target is detached by a tween.
 * @return {boolean}
 */
createjs.TweenTarget.prototype.getOff = function() {};

/**
 * Attaches this target to an object tree or detaches it.
 * @param {boolean} off
 */
createjs.TweenTarget.prototype.setOff = function(off) {};

/**
 * Returns the play mode of this target.
 * @return {number}
 */
createjs.TweenTarget.prototype.getPlayMode = function() {};

/**
 * Sets the play mode of this target.
 * @param {number} mode
 */
createjs.TweenTarget.prototype.setPlayMode = function(mode) {};

/**
 * Retrieves setters for the createjs.Tween object to change properties of a
 * createjs.TweenTarget object.
 * @return {Object.<string,createjs.TweenTarget.Setter>}
 */
createjs.TweenTarget.prototype.getSetters = function() {};

/**
 * Synchronizes the specified target with this target.
 * @param {createjs.TweenTarget} target
 * @param {boolean} synchronize
 */
createjs.TweenTarget.prototype.synchronize = function(target, synchronize) {};

/**
 * Synchronizes the specified target with this target.
 * @param {createjs.Graphics} graphics
 */
createjs.TweenTarget.prototype.addGraphics = function(graphics) {};
