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
/// <reference path="alpha_map_filter.js"/>
/// <reference path="bounding_box.js"/>
/// <reference path="color.js"/>
/// <reference path="color_filter.js"/>
/// <reference path="color_matrix_filter.js"/>
/// <reference path="event_dispatcher.js"/>
/// <reference path="filter.js"/>
/// <reference path="point.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="renderer.js"/>
/// <reference path="shadow.js"/>
/// <reference path="ticker.js"/>
/// <reference path="transform.js"/>
/// <reference path="tween_motion.js"/>
/// <reference path="tween_property.js"/>

/**
 * A base class for all drawable objects. This class consists of five
 * functionalities listed below:
 * 1. Implementing external methods used by games;
 * 2. Implementing getters and setters to monitor the properties changed by
 *    games;
 * 3. Implementing an interface used for rendering an object;
 * 4. Implementing an interface used by a tween to change the properties of this
 *    object, and;
 * 5. Updating tweens attached to this object.
 * A display object updates its tweens when its target is being rendered not
 * only because it can monitor property changes to it but also because it can
 * update a tween only once/frame.)
 * @extends {createjs.EventDispatcher}
 * @implements {createjs.Renderer.RenderObject}
 * @constructor
 */
createjs.DisplayObject = function() {
  createjs.EventDispatcher.call(this);
  this.initialize_();
};
createjs.inherits('DisplayObject',
                  createjs.DisplayObject,
                  createjs.EventDispatcher);

/**
 * The inner class that controls the tweens attached to this object.
 * @param {createjs.Tween} tween
 * @constructor
 */
createjs.DisplayObject.TweenList = function(tween) {
  /// <param type="createjs.Tween" name="tween"/>
  /**
   * The list of tweens in this list.
   * @type {Array.<createjs.Tween>}
   * @private
   */
  this.tweens_ = [tween];

  /**
   * The clone of the tween list. This clone is used for adding tweens when the
   * tween list is locked.
   * @type {Array.<createjs.Tween>}
   * @private
   */
  this.clone_ = null;

  /**
   * Whether this list is locked.
   * @type {boolean}
   * @private
   */
  this.locked_ = false;

  /**
   * The next position of the tweens in this list. This property saves the
   * position set by an action while this clip while it is updating its tweens.
   * @type {number}
   * @private
   */
  this.next_ = -1;

  /**
   * The last time when the owner object updates this list.
   * @type {number}
   * @private
   */
  this.lastTime_ = -1;
};

/**
 * Retrieves the editable items of this list.
 * @return {Array.<createjs.Tween>}
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.getTweens_ = function() {
  /// <returns type="Array" elementType="createjs.Tween"/>
  if (!this.locked_) {
    return this.tweens_;
  }
  if (!this.clone_) {
    this.clone_ = this.tweens_.slice();
  }
  return this.clone_;
};

/**
 * Returns the number of items in this list.
 * @return {number}
 * @const
 */
createjs.DisplayObject.TweenList.prototype.getLength_ = function() {
  /// <returns type="number"/>
  return this.tweens_.length;
};

/**
 * Locks this list for iteration. This method changes the state of this list to
 * 'locked' to apply succeeding add operations and remove ones to its clone.
 * @return {Array.<createjs.Tween>}
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.lock_ = function() {
  /// <returns type="Array" elementType="createjs.Tween"/>
  this.locked_ = true;
  return this.tweens_;
};

/**
 * Unlocks this list. This method changes the stage of this list to 'unlocked'
 * and copies its clone if an application edits the list while it is locked.
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.unlock_ = function() {
  this.locked_ = false;
  if (this.clone_) {
    this.tweens_ = this.clone_;
    this.clone_ = null;
  }
};

/**
 * Removes a tween from this list.
 * @param {createjs.Tween} tween
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.removeTween_ = function(tween) {
  /// <param type="createjs.Tween" name="tween"/>
  var list = this.getTweens_();
  for (var i = list.length - 1; i >= 0; --i) {
    if (list[i] === tween) {
      list.splice(i, 1);
      return;
    }
  }
};

/**
 * Starts playing the tweens in this target.
 * @param {number} time
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.playTweens_ = function(time) {
  /// <param type="number" name="time"/>
  var tweens = this.getTweens_();
  var length = tweens.length;
  for (var i = length - 1; i >= 0; --i) {
    tweens[i].playTween(time);
  }
};

/**
 * Stops playing the tweens in this target.
 * @param {number} time
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.stopTweens_ = function(time) {
  /// <param type="number" name="time"/>
  var tweens = this.getTweens_();
  var length = tweens.length;
  for (var i = length - 1; i >= 0; --i) {
    tweens[i].stopTween(time);
  }
};

/**
 * Updates the tweens in this list.
 * @param {number} time
 * @param {number} flag
 * @return {number}
 * @const
 */
createjs.DisplayObject.TweenList.prototype.updateTweens_ =
    function(time, flag) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="flag"/>
  /// <returns type="number"/>
  var tweens = this.lock_();
  var length = tweens.length;
  createjs.assert(length > 0);
  var position = -1;
  if (this.next_ >= 0 && flag == createjs.PlayMode.SYNCHED) {
    flag |= createjs.TweenFlag.UPDATE;
  }
  for (var i = length - 1; i >= 0; --i) {
    var next = this.next_;
    position = tweens[i].updateTween(time, flag, this.next_);
    // Change the position of the proceeding tweens when an action of the above
    // tween has changed the position of all tweens of this list. (The
    // succeeding updateTween() calls will change the position of all succeeding
    // tweens to the specified one.)
    if (this.next_ != next) {
      flag |= createjs.TweenFlag.UPDATE;
      for (var j = length - 1; j >= i; --j) {
        tweens[j].setPosition(this.next_, 1);
      }
    }
  }
  this.unlock_();
  this.next_ = -1;
  this.lastTime_ = time;
  return position;
};

/**
 * Sets the play offsets of all tweens in this list.
 * @param {number} time
 * @param {number} position
 * @param {boolean} paused
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.setPositions_ =
    function(time, position, paused) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="paused"/>
  if (this.locked_ || (!paused && this.lastTime_ < time)) {
    // Save the given position when this list is being updated so the
    // 'updateTween()' method can use this position.
    this.next_ = position;
    return;
  }
  var tweens = this.getTweens_();
  var length = tweens.length;
  for (var i = length - 1; i >= 0; --i) {
    tweens[i].setPosition(position, 1);
  }
  // Discard the position set by a startPosition property when a gotoAndPlay()
  // call changes it.
  this.next_ = -1;
};

/**
 * Sets the play offsets of all tweens in this list.
 * @param {createjs.DisplayObject} target
 * @param {number} loop
 * @param {number} position
 * @param {boolean} single
 * @private
 * @const
 */
createjs.DisplayObject.TweenList.prototype.setProperties_ =
    function(target, loop, position, single) {
  /// <param type="createjs.DisplayObject" name="target"/>
  /// <param type="number" name="loop"/>
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="single"/>
  var tweens = this.getTweens_();
  var length = tweens.length;
  for (var i = length - 1; i >= 0; --i) {
    tweens[i].setProperties(loop, position, single);
  }
  // Save the given position to change the positions of its tweens when this
  // object updates them. (A movie clip updates its tweens immediately after
  // returning from this method.)
  this.next_ = position;
};

/**
 * An inner class that represents properties used for rendering a DisplayObject
 * object. This class consists of an affine transform, display properties, and a
 * bounding box.
 * @extends {createjs.Transform}
 * @constructor
 */
createjs.DisplayObject.RenderState = function() {
  createjs.Transform.call(this);
};
createjs.inherits('DisplayObject.RenderState',
                  createjs.DisplayObject.RenderState,
                  createjs.Transform);

/**
 * The shadow applied to the owner.
 * @type {createjs.Shadow}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.shadow_ = null;

/**
 * The mask applied to the owner.
 * @type {createjs.Renderer.Clip}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.clip_ = null;

/**
 * The bounding box of the owner. This bounding box is in the <canvas>
 * coordinate.
 * @type {createjs.BoundingBox}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.box_ = null;

/**
 * Whether this state has to calculate its bounding box.
 * @type {number}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.dirtyBox_ = 1;

/**
 * Retrieves the clipping information.
 * @return {createjs.Renderer.Clip}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.getClip = function() {
  /// <returns type="createjs.Renderer.Clip"/>
  return this.clip_;
};

/**
 * Retrieves the alpha transparency.
 * @return {number}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.getAlpha = function() {
  /// <returns type="number"/>
  return this.m[6];
};

/**
 * Retrieves the bounding box.
 * @return {createjs.BoundingBox}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.getBox = function() {
  /// <returns type="createjs.BoundingBox"/>
  return this.clip_ ? this.clip_.getBox() : this.box_;
};

/**
 * Resets the bounding box.
 * @const
 */
createjs.DisplayObject.RenderState.prototype.resetBox = function() {
  this.box_.reset();
};

/**
 * Retrieves the shadow.
 * @return {createjs.Shadow}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.getShadow = function() {
  /// <returns type="createjs.Shadow"/>
  return this.shadow_;
};

/**
 * Returns whether this state represents an empty state, i.e. the
 * createjs.Renderer objects cannot render the hosting display object.
 * @return {boolean}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.isEmpty = function() {
  /// <returns type="boolean"/>
  return this.box_.isEmpty();
};

/**
 * Returns whether this state contains the specified point.
 * @param {createjs.Point} point
 * @return {boolean}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.contain = function(point) {
  /// <returns type="createjs.Point"/>
  return this.box_.contain(point.v[0], point.v[1]);
};

/**
 * Copies the specified rendering property to this property.
 * @param {createjs.DisplayObject.RenderState} state
 * @const
 */
createjs.DisplayObject.RenderState.prototype.copyProperties = function(state) {
  /// <param type="createjs.DisplayObject.RenderState" name="state"/>
  this.m[6] = state.m[6];
  this.shadow_ = state.shadow_;
  this.m[7] = state.m[7];
};

/**
 * Appends the specified visual properties to this state.
 * @param {createjs.DisplayObject.RenderState} state
 * @param {number} alpha
 * @param {createjs.Shadow} shadow
 * @param {number} composition
 * @const
 */
createjs.DisplayObject.RenderState.prototype.appendProperties =
    function(state, alpha, shadow, composition) {
  /// <param type="createjs.DisplayObject.RenderState" name="state"/>
  /// <param type="number" name="alpha"/>
  /// <param type="createjs.Shadow" name="shadow"/>
  /// <param type="number" name="composition"/>
  this.m[6] = state.m[6] * alpha;
  this.shadow_ = shadow || state.shadow_;
  this.m[7] = composition || state.m[7];
};

/**
 * Attaches the specified clipping object to this state.
 * @param {createjs.DisplayObject.RenderState} state
 * @param {createjs.Renderer.Clip} clip
 * @const
 */
createjs.DisplayObject.RenderState.prototype.appendClip =
    function(state, clip) {
  this.clip_ = clip || state.clip_;
};

/**
 * Transforms a bounding box in the local coordinate system of the owner object
 * to a box in the global coordinate system, which is used by the
 * createjs.Renderer interface.
 * @param {createjs.BoundingBox} box
 * @const
 */
createjs.DisplayObject.RenderState.prototype.updateBox = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  if (!this.box_) {
    this.box_ = new createjs.BoundingBox();
  }
  this.transformBox(box, this.box_);
};

/**
 * Inflates the bounding box of this rendering state by the one of the specified
 * state.
 * @param {createjs.DisplayObject.RenderState} state
 * @const
 */
createjs.DisplayObject.RenderState.prototype.inflateBox = function(state) {
  /// <param type="createjs.DisplayObject.RenderState" name="state"/>
  this.box_.inflate(state.getBox());
};

/**
 * Returns whether this state represents a visible state.
 * @return {boolean}
 * @const
 */
createjs.DisplayObject.RenderState.prototype.isVisible = function() {
  /// <returns type="boolean"/>
  return this.m[6] > 0;
};

/**
 * A flag representing that this object needs to update its affine
 * transformation.
 * @const {number}
 * @protected
 */
createjs.DisplayObject.DIRTY_TRANSFORM = (1 << 0) | (1 << 3);

/**
 * A flag representing that this object needs to update its attributes.
 * @const {number}
 * @protected
 */
createjs.DisplayObject.DIRTY_PROPERTIES = 1 << 1;

/**
 * A flag representing that this object needs to update its shape.
 * @const {number}
 * @protected
 */
createjs.DisplayObject.DIRTY_SHAPE = 1 << 2;

/**
 * A flag representing that this object needs to update its mask.
 * @const {number}
 * @protected
 */
createjs.DisplayObject.DIRTY_MASK = 1 << 3;

/**
 * A flag representing that this object needs to update its bounding box.
 * @const {number}
 * @protected
 */
createjs.DisplayObject.DIRTY_BOX = 1 << 4;

/**
 * A flag representing that this object needs to update all its properties.
 * @const {number}
 * @protected
 */
createjs.DisplayObject.DIRTY_ALL = createjs.DisplayObject.DIRTY_TRANSFORM |
                                   createjs.DisplayObject.DIRTY_PROPERTIES |
                                   createjs.DisplayObject.DIRTY_SHAPE |
                                   createjs.DisplayObject.DIRTY_BOX;

/**
 * The ID generator that generates target IDs.
 * @type {number}
 * @private
 */
createjs.DisplayObject.targetId_ = 0;

/**
 * Whether this display object should be removed from an object tree. This
 * value is used by tweens to remove a display object.
 * @type {boolean}
 */
createjs.DisplayObject.prototype['_off'] = false;

/**
 * The name of this object. The createjs.Container.prototype.getChildByName()
 * uses this property to find display objects.
 * @type {string}
 */
createjs.DisplayObject.prototype['name'] = '';

/**
 * The z-index used for sorting display objects.
 * @type {number}
 */
createjs.DisplayObject.prototype['zIndex'] = 0;

/**
 * The object ID. This ID is used by tweens to distinguish their targets, i.e.
 * this ID is unique only among display objects.
 * @type {number}
 * @private
 */
createjs.DisplayObject.prototype.targetId_ = 0;

/**
 * The rendering state of this object, variables used by a createjs.Renderer
 * object to render this object.
 * @type {createjs.DisplayObject.RenderState}
 * @private
 */
createjs.DisplayObject.prototype.state_ = null;

/**
 * A dirty flag, i.e. a flag representing variables that should be re-calculated
 * before a createjs.Renderer object renders this object.
 * @type {number}
 * @protected
 */
createjs.DisplayObject.prototype.dirty = 0;

/**
 * Whether this object is a 'createjs.Stage' object.
 * @type {boolean}
 * @protected
 */
createjs.DisplayObject.prototype.isStage = false;

/**
 * The property values that can be animated by tweens. A display object
 * currently has 17 properties that can be animated.
 *   +----+---------------+---------+
 *   | id | property      | type    |
 *   +----+---------------+---------+
 *   | 0  | x             | number  |
 *   | 1  | y             | number  |
 *   | 2  | scaleX        | number  |
 *   | 3  | scaleY        | number  |
 *   | 4  | skewX         | number  |
 *   | 5  | skewY         | number  |
 *   | 6  | regX          | number  |
 *   | 7  | regY          | number  |
 *   | 8  | rotation      | number  |
 *   | 9  | alpha         | number  |
 *   | 10 | startPosition | integer |
 *   | 11 | playMode      | integer |
 *   | 12 | _off          | boolean |
 *   | 13 | visible       | boolean |
 *   | 14 | loop          | boolean |
 *   | 15 | text          | string  |
 *   | 16 | graphics      | Object  |
 *   +----+---------------+---------+
 * @type {Float32Array}
 * @private
 */
createjs.DisplayObject.prototype.values_ = null;

/**
 * The bounding box of this object in the local coordinate system.
 * @type {createjs.BoundingBox}
 * @private
 */
createjs.DisplayObject.prototype.box_ = null;

/**
 * The composite operation used in rendering this object.
 * @type {number}
 * @private
 */
createjs.DisplayObject.prototype.composition_ =
    createjs.Renderer.Composition.SOURCE_OVER;

/**
 * A shadow to render on this display object.
 * @type {createjs.Shadow}
 * @private
 */
createjs.DisplayObject.prototype.shadow_ = null;

/**
 * A clipping path for this object.
 * @type {createjs.DisplayObject}
 * @private
 */
createjs.DisplayObject.prototype.mask_ = null;

/**
 * A display object that owns this mask object if this object is a mask.
 * @type {Array.<createjs.DisplayObject>}
 * @private
 */
createjs.DisplayObject.prototype.owners_ = null;

/**
 * An inverse Affine transformation used for transforming a point in the local
 * coordinate system to a point in the global coordinate system.
 * @type {createjs.Transform}
 * @private
 */
createjs.DisplayObject.prototype.inverse_ = null;

/**
 * The clipping rectangle of the mask in the global coordinate system.
 * @type {createjs.Renderer.Clip}
 * @private
 */
createjs.DisplayObject.prototype.clip_ = null;

/**
 * The color multiplier used for composing this object.
 * @type {Float32Array}
 * @private
 */
createjs.DisplayObject.prototype.colorMatrix_ = null;

/**
 * The alpha map used for composing this object.
 * @type {createjs.AlphaMapFilter}
 * @private
 */
createjs.DisplayObject.prototype.alphaMapFilter_ = null;

/**
 * A list of tweens attached to this object.
 * @type {createjs.DisplayObject.TweenList}
 * @private
 */
createjs.DisplayObject.prototype.tweens_ = null;

/**
 * Whether this object is playing its tweens or its sprite sheet.
 * @type {boolean}
 * @private
 */
createjs.DisplayObject.prototype.paused_ = false;

/**
 * Whether this object is changing the position of its tweens.
 * @type {boolean}
 * @private
 */
createjs.DisplayObject.prototype.seek_ = false;

/**
 * The current position of the tweens attached to this object.
 * @type {number}
 * @private
 */
createjs.DisplayObject.prototype.currentFrame_ = -1;

/**
 * A list of tween targets synchronized with this object.
 * @type {Array.<createjs.DisplayObject>}
 * @private
 */
createjs.DisplayObject.prototype.synchronized_ = null;

/**
 * A rectangle used by the getBounds() method.
 * @type {createjs.Rectangle}
 * @private
 */
createjs.DisplayObject.prototype.rectangle_ = null;

/**
 * Initializes this object.
 * @private
 */
createjs.DisplayObject.prototype.initialize_ = function() {
  this.targetId_ = createjs.DisplayObject.targetId_++;
  this.state_ = new createjs.DisplayObject.RenderState();
  this.values_ = createjs.cloneFloat32Array([
    createjs.Value.X,
    createjs.Value.Y,
    createjs.Value.SCALE_X,
    createjs.Value.SCALE_Y,
    createjs.Value.SKEW_X,
    createjs.Value.SKEW_Y,
    createjs.Value.REG_X,
    createjs.Value.REG_Y,
    createjs.Value.ROTATION,
    createjs.Value.ALPHA,
    createjs.Value.START_POSITION,
    createjs.Value.PLAY_MODE,
    createjs.Value.OFF,
    createjs.Value.VISIBLE,
    createjs.Value.LOOP
  ]);
  this.box_ = new createjs.BoundingBox();
};

/**
 * Updates the clipping rectangle of this object.
 * @param {createjs.DisplayObject} parent
 * @private
 */
createjs.DisplayObject.prototype.updateClip_ = function(parent) {
  /// <param type="createjs.DisplayObject" name="parent"/>
  var mask = this.mask_;
  mask.updateLayout(parent, createjs.DisplayObject.DIRTY_TRANSFORM);
  mask.state_.updateBox(mask.box_);
  this.clip_ = new createjs.Renderer.Clip(
      mask.state_,
      mask.box_,
      mask.state_.box_,
      mask.composition_,
      this.composition_,
      mask);
};

/**
 * A rectangle automatically generated by Flash. Even though this library does
 * not use this rectangle, we add its placeholder to prevent Flash from
 * extending the DisplayObject object.
 * @type {createjs.Rectangle}
 */
createjs.DisplayObject.prototype.nominalBounds = null;

/**
 * Retrieves the horizontal position.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.X];
};

/**
 * Sets the horizontal position.
 * @param {number} x
 * @const
 */
createjs.DisplayObject.prototype.setX = function(x) {
  /// <param type="number" name="x"/>
  x = createjs.getNumber(x);
  if (!createjs.isNaN(x) && this.values_[createjs.Property.X] != x) {
    this.values_[createjs.Property.X] = x;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the vertical position.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.Y];
};

/**
 * Sets the vertical position.
 * @param {number} y
 * @const
 */
createjs.DisplayObject.prototype.setY = function(y) {
  /// <param type="number" name="y"/>
  y = createjs.getNumber(y);
  if (!createjs.isNaN(y) && this.values_[createjs.Property.Y] != y) {
    this.values_[createjs.Property.Y] = y;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the horizontal scale.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getScaleX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.SCALE_X];
};

/**
 * Sets the horizontal scale.
 * @param {number} scaleX
 * @const
 */
createjs.DisplayObject.prototype.setScaleX = function(scaleX) {
  /// <param type="number" name="scaleX"/>
  scaleX = createjs.getNumber(scaleX);
  if (this.values_[createjs.Property.SCALE_X] != scaleX) {
    this.values_[createjs.Property.SCALE_X] = scaleX;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the vertical scale.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getScaleY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.SCALE_Y];
};

/**
 * Sets the vertical scale.
 * @param {number} scaleY
 * @const
 */
createjs.DisplayObject.prototype.setScaleY = function(scaleY) {
  /// <param type="number" name="scaleY"/>
  scaleY = createjs.getNumber(scaleY);
  if (this.values_[createjs.Property.SCALE_Y] != scaleY) {
    this.values_[createjs.Property.SCALE_Y] = scaleY;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the horizontal skew.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getSkewX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.SKEW_X];
};

/**
 * Sets the horizontal skew.
 * @param {number} skewX
 * @const
 */
createjs.DisplayObject.prototype.setSkewX = function(skewX) {
  /// <param type="number" name="skewX"/>
  skewX = createjs.getNumber(skewX);
  if (this.values_[createjs.Property.SKEW_X] != skewX) {
    this.values_[createjs.Property.SKEW_X] = skewX;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the vertical skew.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getSkewY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.SKEW_Y];
};

/**
 * Sets the vertical skew.
 * @param {number} skewY
 * @const
 */
createjs.DisplayObject.prototype.setSkewY = function(skewY) {
  /// <param type="number" name="skewY"/>
  skewY = createjs.getNumber(skewY);
  if (this.values_[createjs.Property.SKEW_Y] != skewY) {
    this.values_[createjs.Property.SKEW_Y] = skewY;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the horizontal registration point.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getRegX = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.REG_X];
};

/**
 * Sets the horizontal registration point.
 * @param {number} regX
 * @const
 */
createjs.DisplayObject.prototype.setRegX = function(regX) {
  /// <param type="number" name="regX"/>
  regX = createjs.getNumber(regX);
  if (this.values_[createjs.Property.REG_X] != regX) {
    this.values_[createjs.Property.REG_X] = regX;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the vertical registration point.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getRegY = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.REG_Y];
};

/**
 * Sets the vertical registration point.
 * @param {number} regY
 * @const
 */
createjs.DisplayObject.prototype.setRegY = function(regY) {
  /// <param type="number" name="regY"/>
  regY = createjs.getNumber(regY);
  if (this.values_[createjs.Property.REG_Y] != regY) {
    this.values_[createjs.Property.REG_Y] = regY;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the rotation.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getRotation = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.ROTATION];
};

/**
 * Sets the rotation.
 * @param {number} rotation
 * @const
 */
createjs.DisplayObject.prototype.setRotation = function(rotation) {
  /// <param type="number" name="rotation"/>
  rotation = createjs.getNumber(rotation);
  if (this.values_[createjs.Property.ROTATION] != rotation) {
    this.values_[createjs.Property.ROTATION] = rotation;
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
};

/**
 * Retrieves the visibility.
 * @return {boolean}
 * @const
 */
createjs.DisplayObject.prototype.getVisible = function() {
  /// <returns type="boolean"/>
  return !!this.values_[createjs.Property.VISIBLE];
};

/**
 * Sets the visibility.
 * @param {boolean} visible
 * @const
 */
createjs.DisplayObject.prototype.setVisible = function(visible) {
  /// <param type="boolean" name="visible"/>
  var value = visible | 0;
  if (this.values_[createjs.Property.VISIBLE] != value) {
    this.values_[createjs.Property.VISIBLE] = value;
    this.dirty = createjs.DisplayObject.DIRTY_ALL;
  }
};

/**
 * Retrieves the alpha value.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getAlpha = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.ALPHA];
};

/**
 * Sets the alpha value.
 * @param {number} alpha
 * @const
 */
createjs.DisplayObject.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  alpha = createjs.getNumber(alpha);
  if (this.values_[createjs.Property.ALPHA] != alpha) {
    this.values_[createjs.Property.ALPHA] = alpha;
    this.dirty |= !alpha ? createjs.DisplayObject.DIRTY_ALL :
        createjs.DisplayObject.DIRTY_PROPERTIES;
  }
};

/**
 * Retrieves the shadow properties.
 * @return {createjs.Shadow}
 * @const
 */
createjs.DisplayObject.prototype.getShadow = function() {
  /// <returns type="createjs.Shadow"/>
  return this.shadow_;
};

/**
 * Sets the shadow properties.
 * @param {createjs.Shadow} shadow
 * @const
 */
createjs.DisplayObject.prototype.setShadow = function(shadow) {
  /// <param type="createjs.Shadow" name="shadow"/>
  if (this.shadow_) {
    if (this.shadow_.color == shadow.color ||
        this.shadow_.offsetX == shadow.offsetX ||
        this.shadow_.offsetY == shadow.offsetY ||
        this.shadow_.blur == shadow.blur) {
      return;
    }
  }
  this.shadow_ = shadow;
  this.dirty |= createjs.DisplayObject.DIRTY_PROPERTIES;
};

/**
 * Retrieves the composite operation.
 * @return {string}
 * @const
 */
createjs.DisplayObject.prototype.getComposition = function() {
  /// <returns type="string"/>
  return createjs.Renderer.getCompositionName(this.composition_);
};

/**
 * Sets the composite operation.
 * @param {string} value
 * @const
 */
createjs.DisplayObject.prototype.setComposition = function(value) {
  /// <param type="string" name="value"/>
  var composition = createjs.Renderer.getCompositionKey(value);
  if (this.composition_ != composition) {
    this.composition_ = composition;
    this.dirty |= createjs.DisplayObject.DIRTY_PROPERTIES;
  }
};

/**
 * Retrieves the list of filters.
 * @return {Array.<createjs.Filter>}
 * @const
 */
createjs.DisplayObject.prototype.getFilters = function() {
  /// <returns type="Array" elementType="createjs.Filter"/>
  return [];
};

/**
 * Returns the alpha-map filter attached to this object.
 * @return {createjs.AlphaMapFilter}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getAlphaMapFilter = function() {
  /// <returns type="createjs.AlphaMapFilter"/>
  return this.alphaMapFilter_;
};

/**
 * Returns the color filter attached to this object.
 * @return {Float32Array}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getColorMatrix = function() {
  /// <returns type="Float32Array"/>
  return this.colorMatrix_;
};

/**
 * Sets the list of filters.
 * @param {Array.<createjs.Filter>} filters
 * @const
 */
createjs.DisplayObject.prototype.setFilters = function(filters) {
  /// <param type="Array" elementType="createjs.Filter" name="filters"/>
  // Extract an alpha-map filter, a color filter, and a color-matrix filter from
  // the input list. (A color filter is converted to a color matrix so our
  // fragment shader can apply it to images.)
  var alphaFilter = null;
  var colorMatrix = null;
  for (var i = filters.length - 1; i >= 0; --i) {
    var filter = filters[i];
    var type = filter.getType();
    if (type == createjs.Filter.Type.COLOR) {
      var colorFilter = createjs.ColorFilter.get(filter);
      var multiplier = colorFilter.multiplier;
      var offset = colorFilter.offset;
      colorMatrix = new Float32Array([
        multiplier.getRed(), 0, 0, 0, offset.getRed(),
        0, multiplier.getGreen(), 0, 0, offset.getGreen(),
        0, 0, multiplier.getBlue(), 0, offset.getBlue(),
        0, 0, 0, 1, 0,
        0, 0, 0, 0, 1
      ]);
    } else if (type == createjs.Filter.Type.ALPHA_MAP) {
      alphaFilter = createjs.AlphaMapFilter.get(filter);
    } else if (type == createjs.Filter.Type.COLOR_MATRIX) {
      var colorMatrixFilter = createjs.ColorMatrixFilter.get(filter);
      colorMatrix = colorMatrixFilter.getMatrix();
    }
  }
  if (this.alphaMapFilter_ === alphaFilter &&
      this.colorMatrix_ === colorMatrix) {
    return;
  }
  this.alphaMapFilter_ = alphaFilter;
  this.colorMatrix_ = colorMatrix;
  this.dirty |= createjs.DisplayObject.DIRTY_SHAPE;

  // Apply an alpha-map filter to this object and cache the filtered image to a
  // memory <canvas> element.
  this.handleDetach();
  this.handleAttach(1);
};

/**
 * Retrieves the masking path.
 * @return {createjs.DisplayObject}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getMask = function() {
  /// <returns type="createjs.DisplayObject"/>
  return this.mask_;
};

/**
 * Sets the masking path.
 * @param {createjs.DisplayObject} mask
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setMask = function(mask) {
  /// <param name="mask" type="createjs.DisplayObject"/>
  // Attach the given mask to this object and choose a composition method.
  // Use the scissor test to apply the given mask to this object when the MASK
  // (not this object) has its '_scissor' property true.
  mask['_off'] = false;
  if (!mask.owners_) {
    mask.owners_ = [];
  }
  for (var i = 0; i < mask.owners_.length; ++i) {
    if (mask.owners_[i] === this) {
      return;
    }
  }
  mask.owners_.push(this);
  var type;
  mask.composition_ = createjs.Renderer.Mask.COMPOSE;
  mask.state_.m[7] = createjs.Renderer.Composition.DESTINATION_IN;
  this.composition_ = createjs.Renderer.Composition.SOURCE_OVER;
  type = 2;
  mask.handleAttach(type);
  this.mask_ = mask;
  this.clip_ = null;
  this.dirty |= createjs.DisplayObject.DIRTY_MASK;
};

/**
 * Returns the display object which owns this object only if this object is a
 * mask.
 * @return {Array.<createjs.DisplayObject>}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getOwners = function() {
  /// <returns type="Array" elementType="createjs.DisplayObject"/>
  return this.owners_;
};

/**
 * Retrieves the raw value of the specified property.
 * @param {number} id
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getValue = function(id) {
  /// <param type="number" name="id"/>
  /// <returns type="number"/>
  return this.values_[id];
};

/**
 * Sets the raw value of the specified property.
 * @param {number} id
 * @param {number} value
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setValue = function(id, value) {
  /// <param type="number" name="id"/>
  /// <param type="number" name="value"/>
  this.values_[id] = value;
};

/**
 * Retrieves the ID of the composite operation.
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getCompositionId = function() {
  /// <returns type="number"/>
  return this.composition_;
};

/**
 * Retrieves the sort order of this object.
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getZ = function() {
  /// <returns type="number"/>
  return (this['zIndex'] << 10) + (this.getY() | 0);
};

/**
 * Retrieves the parent of this object.
 * @return {createjs.DisplayObject}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getParent = function() {
  /// <returns type="createjs.DisplayObject"/>
  return /** @type {createjs.DisplayObject} */ (this['parent']);
};

/**
 * Returns a set of parameters used for rendering this object.
 * @return {createjs.DisplayObject.RenderState}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getState = function() {
  /// <returns type="createjs.DisplayObject.RenderState"/>
  return this.state_;
};

/**
 * Returns the inverse-affine transformation used for transforming a point in
 * the global coordination to a point in the coordination of this object.
 * @return {createjs.Transform}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getInverse = function() {
  /// <returns type="createjs.Transform"/>
  if (!this.inverse_) {
    this.inverse_ = this.state_.getInverse();
  }
  return this.inverse_;
};

/**
 * Sets the horizontal position.
 * @param {createjs.DisplayObject} parent
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setParent = function(parent) {
  createjs.assert(parent != this);
  this['parent'] = parent;
};

/**
 * Returns the bounding box of this object.
 * @return {createjs.BoundingBox}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getBoundingBox = function() {
  /// <returns type="createjs.BoundingBox"/>
  return this.box_;
};

/**
 * Sets the bounding box of this object.
 * @param {number} minX
 * @param {number} minY
 * @param {number} maxX
 * @param {number} maxY
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setBoundingBox =
    function(minX, minY, maxX, maxY) {
  if (this.box_.b[0] != minX || this.box_.b[1] != minY ||
      this.box_.b[2] != maxX || this.box_.b[3] != maxY) {
    this.box_.b[0] = minX;
    this.box_.b[1] = minY;
    this.box_.b[2] = maxX;
    this.box_.b[3] = maxY;
    this.dirty |= createjs.DisplayObject.DIRTY_BOX;
  }
};

/**
 * Retrieves the width of this object.
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getBoxWidth = function() {
  /// <returns type="number"/>
  return this.box_.getWidth();
};

/**
 * Retrieves the height of this object.
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getBoxHeight = function() {
  /// <returns type="number"/>
  return this.box_.getHeight();
};

/**
 * Returns the current position of the tweens attached to this object.
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getCurrentFrame = function() {
  /// <returns type="number"/>
  return this.currentFrame_;
};

/**
 * Sets the current position of the tweens attached to this object.
 * @param {number} frame
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setCurrentFrame = function(frame) {
  /// <param type="number" name="frame"/>
  this.currentFrame_ = frame;
};

/**
 * Returns whether this object is playing its tweens or its sprite sheet.
 * @return {boolean}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.isPaused = function() {
  /// <returns type="boolean"/>
  return this.paused_;
};

/**
 * Sets the current playing status of its tweens or its sprite sheet.
 * @param {boolean} paused
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setIsPaused = function(paused) {
  /// <param type="boolean" name="paused"/>
  this.paused_ = paused;
};

/**
 * Destroys all properties of this object.
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.destroy = function() {
};

/**
 * Adds a child (or children) to the top of this display object.
 * @param {...createjs.DisplayObject} var_args
 * @return {createjs.DisplayObject}
 */
createjs.DisplayObject.prototype.addChild = function(var_args) {
  /// <param type="createjs.DisplayObject" name="var_args"/>
  /// <returns type="createjs.DisplayObject"/>
  createjs.notReached();
  return null;
};

/**
 * Adds a child (or children) to this display object at the specified index.
 * @param {...(createjs.DisplayObject|number)} var_args
 * @return {createjs.DisplayObject}
 */
createjs.DisplayObject.prototype.addChildAt = function(var_args) {
  /// <param type="createjs.DisplayObject" name="var_args"/>
  /// <returns type="createjs.DisplayObject"/>
  createjs.notReached();
  return null;
};

/**
 * Removes the specified child (or children) from this display object.
 * @param {...createjs.DisplayObject} var_args
 * @return {boolean}
 */
createjs.DisplayObject.prototype.removeChild = function(var_args) {
  /// <param type="createjs.DisplayObject" name="var_args"/>
  /// <returns type="boolean"/>
  createjs.notReached();
  return false;
};

/**
 * Removes the child (or children) at the specified index from this display
 * object.
 * @param {...number} var_args
 * @return {boolean}
 */
createjs.DisplayObject.prototype.removeChildAt = function(var_args) {
  /// <returns type="boolean"/>
  createjs.notReached();
  return false;
};

/**
 * Removes all children from this display object.
 * @param {boolean=} opt_destroy
 */
createjs.DisplayObject.prototype.removeAllChildren = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
};

/**
 * Called when this display object is attached to another display object as its
 * child.
 * @param {number} flag
 * @protected
 */
createjs.DisplayObject.prototype.handleAttach = function(flag) {
  /// <param type="number" name="flag"/>
};

/**
 * Called when this display object is detached from another display object.
 * @protected
 */
createjs.DisplayObject.prototype.handleDetach = function() {
};

/**
 * Returns an object under the specified point. (This point is one in the global
 * coordinate.)
 * @param {createjs.Point} point
 * @param {number} types
 * @param {number} bubble
 * @return {createjs.DisplayObject}
 * @protected
 */
createjs.DisplayObject.prototype.hitTestObject =
    function(point, types, bubble) {
  /// <param type="createjs.Point" name="point"/>
  /// <param type="number" name="types"/>
  /// <param type="number" name="bubble"/>
  /// <returns type="createjs.DisplayObject"/>
  bubble |= types & this.getEventTypes();
  if (!bubble) {
    return null;
  }
  // Return null when the given point is not in the (global) bounding box of
  // this object to avoid testing the point with DisplayObject objects that
  // do not obviously contain it.
  var state = this.getState();
  var clip = state.getClip();
  var box;
  if (clip) {
    box = clip.getBox();
  } else {
    if (state.dirtyBox_) {
      state.updateBox(this.box_);
      state.dirtyBox_ = 0;
    }
    box = state.box_;
  }
  if (!this.isVisible() || !box.contain(point.v[0], point.v[1])) {
    return null;
  }
  // The above bounding box becomes equal to the frame rectangle of this object
  // only when this object is not either rotated or skewed. When this object is
  // either rotated or skewed, this function needs to translate the point into
  // the local coordinate of this object and tests whether the translated point
  // is in the frame rectangle.
  var transform = clip ? clip.getTransform() : state;
  if (transform.hasSkew()) {
    var region = clip ? clip.getRectangle() : this.getBoundingBox();
    if (!transform.invertible || region.isEmpty()) {
      return null;
    }
    var local = new createjs.Point(point.v[0], point.v[1]);
    transform.getInverse().transformPoint(local);
    if (!region.contain(local.v[0], local.v[1])) {
      return null;
    }
  }
  return this;
};

/**
 * Returns all objects under the specified point.
 * @param {createjs.Point} point
 * @param {Array.<createjs.DisplayObject>} list
 * @param {number} types
 * @param {number} bubble
 * @protected
 */
createjs.DisplayObject.prototype.hitTestObjects =
    function(point, list, types, bubble) {
  /// <param type="createjs.Point" name="point"/>
  /// <param type="Array" elementType="createjs.DisplayObject" name="list"/>
  /// <param type="number" name="types"/>
  /// <param type="number" name="bubble"/>
  var result = this.hitTestObject(point, types, bubble);
  if (result) {
    list.push(result);
  }
};

/**
 * Updates the rendering state of this object.
 * @param {createjs.DisplayObject} parent
 * @param {number} dirty
 * @protected
 */
createjs.DisplayObject.prototype.updateLayout = function(parent, dirty) {
  /// <param type="createjs.DisplayObject" name="parent"/>
  /// <param type="number" name="dirty"/>
  // Append transform of this object and its properties to the current rendering
  // state to create a composite rendering state.
  if (createjs.DEBUG) {
    ++createjs.Counter.totalObjects;
  }
  var state = this.state_;
  if (dirty & createjs.DisplayObject.DIRTY_TRANSFORM) {
    state.appendTransform(parent.state_, this.values_);
    this.inverse_ = null;
  }
  if (dirty & createjs.DisplayObject.DIRTY_PROPERTIES) {
    state.appendProperties(parent.state_,
                           this.values_[createjs.Property.ALPHA],
                           this.shadow_,
                           this.composition_);
  }
  if (dirty & createjs.DisplayObject.DIRTY_MASK) {
    if (this.mask_ && !this.mask_.box_.isEmpty()) {
      this.updateClip_(parent);
    }
    state.appendClip(parent.state_, this.clip_);
  }
};

/**
 * Updates the layout of this object.
 * @param {createjs.Renderer} renderer
 * @param {createjs.DisplayObject} parent
 * @param {number} dirty
 * @param {number} time
 * @param {number} draw
 * @return {number}
 * @protected
 */
createjs.DisplayObject.prototype.layout =
    function(renderer, parent, dirty, time, draw) {
  /// <param type="createjs.Renderer" name="renderer"/>
  /// <param type="createjs.DisplayObject" name="parent"/>
  /// <param type="number" name="dirty"/>
  /// <param type="number" name="time"/>
  /// <param type="number" name="draw"/>
  /// <returns type="number"/>
  var state = this.state_;
  if (!this.isVisible()) {
    // Prohibit dispatching events to this object when it is invisible.
    return 0;
  }
  dirty |= this.dirty;
  if (dirty) {
    this.updateLayout(parent, dirty);
    var DIRTY_BOX = createjs.DisplayObject.DIRTY_TRANSFORM |
                    createjs.DisplayObject.DIRTY_BOX;
    state.dirtyBox_ = dirty & DIRTY_BOX;
  }
  renderer.addObject(this);
  return this.getEventTypes();
};

/** @override */
createjs.DisplayObject.prototype.isDirtyObject = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <returns type="boolean"/>
  if (!this.dirty && !box.hasIntersection(this.state_.getBox())) {
    return false;
  }
  return true;
};

/** @override */
createjs.DisplayObject.prototype.getRenderBox = function() {
  /// <returns type="createjs.BoundingBox"/>
  return this.state_.getBox();
};

/** @override */
createjs.DisplayObject.prototype.getClip = function() {
  /// <returns type="createjs.Renderer.Clip"/>
  return this.state_.getClip();
};

/** @override */
createjs.DisplayObject.prototype.beginPaintObject = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  this.dirty = 0;
  renderer.setProperties(this.state_.m);
};

/** @override */
createjs.DisplayObject.prototype.paintObject = function(renderer) {
  /// <returns type="createjs.Renderer"/>
};

/**
 * Returns whether this display object is visible.
 * @return {boolean}
 */
createjs.DisplayObject.prototype.isVisible = function() {
  /// <returns type="boolean"/>
  var visible = this.values_[createjs.Property.VISIBLE];
  var alpha = this.values_[createjs.Property.ALPHA];
  var scaleX = this.values_[createjs.Property.SCALE_X];
  var scaleY = this.values_[createjs.Property.SCALE_Y];
  return (visible && alpha && scaleX && scaleY) ? true : false;
};

/**
 * Draws this display object into the specified <canvas> context. (This method
 * is deprecated because it does not work with WebGL.)
 * @param {CanvasRenderingContext2D} context
 * @param {boolean} ignoreCache
 * @return {boolean}
 * @deprecated
 */
createjs.DisplayObject.prototype.draw = function(context, ignoreCache) {
  /// <param type="CanvasRenderingContext2D" name="context"/>
  /// <param type="boolean" name="ignoreCache"/>
  return false;
};

/**
 * Applies this display object's transformation, alpha, composite operation,
 * clipping path (mask), and shadow to the specified context. (This method is
 * deprecated because it does not work with WebGL.)
 * @param {CanvasRenderingContext2D} context
 * @deprecated
 */
createjs.DisplayObject.prototype.updateContext = function(context) {
  /// <param type="CanvasRenderingContext2D" name="context"/>
};

/**
 * Draws this display object into a cache <canvas> element. (This method is
 * deprecated because derived objects have caches optimized for them.)
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number=} opt_scale
 * @deprecated
 */
createjs.DisplayObject.prototype.cache =
    function(x, y, width, height, opt_scale) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" optional="true" name="opt_scale"/>
};

/**
 * Redraws this display object to a cache <canvas> element.
 * @param {string} compositeOperation
 * @deprecated
 */
createjs.DisplayObject.prototype.updateCache = function(compositeOperation) {
  /// <param type="string" name="compositeOperation"/>
};

/**
 * Clears the cache <canvas> element.
 * @deprecated
 */
createjs.DisplayObject.prototype.uncache = function() {
};
  
/**
 * Returns a data URL of the cache <canvas> element.
 * @return {string}
 * @deprecated
 */
createjs.DisplayObject.prototype.getCacheDataURL = function() {
  /// <returns type="string"/>
  return '';
};

/**
 * Returns the createjs.Stage object to which that this display object belongs
 * to, or null if it is detached.
 * @return {createjs.DisplayObject}
 */
createjs.DisplayObject.prototype.getStage = function() {
  /// <returns type="createjs.DisplayObject"/>
  var o = this;
  while (o.getParent()) {
    o = o.getParent();
  }
  return o.isStage ? o : null;
};

/**
 * Transforms the specified x and y position from the coordinate of this object
 * to the global coordinate.
 * @param {number} x
 * @param {number} y
 * @return {createjs.Point}
 */
createjs.DisplayObject.prototype.localToGlobal = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Point"/>
  var point = new createjs.Point(x, y);
  return this.state_.transformPoint(point);
};

/**
 * Transforms the specified x and y position from the global coordinate to the
 * one of this object.
 * @param {number} x
 * @param {number} y
 * @return {createjs.Point}
 */
createjs.DisplayObject.prototype.globalToLocal = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.Point"/>
  var point = new createjs.Point(x, y);
  return this.getInverse().transformPoint(point);
};

/**
 * Transforms the specified x and y position from the coordinate of this object
 * to the one of the specified target object.
 * @param {number} x
 * @param {number} y
 * @param {createjs.DisplayObject} target
 * @return {createjs.Point}
 */
createjs.DisplayObject.prototype.localToLocal = function(x, y, target) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="createjs.DisplayObject" name="target"/>
  /// <returns type="createjs.Point"/>
  var point = this.localToGlobal(x, y);
  return target.getInverse().transformPoint(point);
};

/**
 * Sets the transform properties on this display object.
 * @param {number} x
 * @param {number} y
 * @param {number} scaleX
 * @param {number} scaleY
 * @param {number} rotation
 * @param {number} skewX
 * @param {number} skewY
 * @param {number} regX
 * @param {number} regY
 * @return {createjs.DisplayObject}
 */
createjs.DisplayObject.prototype.setTransform =
    function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
  /// <param type="number" optional="true" name="x"/>
  /// <param type="number" optional="true" name="y"/>
  /// <param type="number" optional="true" name="scaleX"/>
  /// <param type="number" optional="true" name="scaleY"/>
  /// <param type="number" optional="true" name="rotation"/>
  /// <param type="number" optional="true" name="skewX"/>
  /// <param type="number" optional="true" name="skewY"/>
  /// <param type="number" optional="true" name="regX"/>
  /// <param type="number" optional="true" name="regY"/>
  /// <returns type="createjs.DisplayObject"/>
  this.setX(x || 0);
  this.setY(y || 0);
  this.setScaleX(scaleX == null ? 1 : scaleX);
  this.setScaleY(scaleY == null ? 1 : scaleY);
  this.setSkewX(skewX || 0);
  this.setSkewY(skewY || 0);
  this.setRegX(regX || 0);
  this.setRegY(regY || 0);
  this.setRotation(rotation || 0);
  return this;
};
  
/**
 * Tests whether this display object intersects the specified local point.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
createjs.DisplayObject.prototype.hitTest = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="boolean"/>
  return !!this.hitTestObject(new createjs.Point(x, y), 0, 1);
};
  
/**
 * Sets properties of this DisplayObject object.
 * @param {Object} properties
 * @return {createjs.DisplayObject}
 */
createjs.DisplayObject.prototype.set = function(properties) {
  /// <param type="Object" name="properties"/>
  /// <returns type="createjs.DisplayObject"/>
  var KEYS = {
    'x': createjs.Property.X + 1,
    'y': createjs.Property.Y + 1,
    'scaleX': createjs.Property.SCALE_X + 1,
    'scaleY': createjs.Property.SCALE_Y + 1,
    'skewX': createjs.Property.SKEW_X + 1,
    'skewY': createjs.Property.SKEW_Y + 1,
    'regX': createjs.Property.REG_X + 1,
    'regY': createjs.Property.REG_Y + 1,
    'rotation': createjs.Property.ROTATION + 1,
    'alpha': createjs.Property.ALPHA + 1
  };
  var mask = 0;
  for (var key in properties) {
    var value = properties[key];
    if (key == '_off') {
      this.setOff(!!value);
    } else if (key == 'compositeOperation') {
      this.setComposition(createjs.castString(value));
    } else {
      var id = KEYS[key];
      if (id) {
        --id;
        var numberValue = +value;
        if (this.values_[id] != numberValue) {
          this.values_[id] = numberValue;
          mask = 1 << id;
        }
      }
    }
  }
  var kTransformMask = (1 << createjs.Property.X) |
                       (1 << createjs.Property.Y) |
                       (1 << createjs.Property.SCALE_X) |
                       (1 << createjs.Property.SCALE_Y) |
                       (1 << createjs.Property.SKEW_X) |
                       (1 << createjs.Property.SKEW_Y) |
                       (1 << createjs.Property.REG_X) |
                       (1 << createjs.Property.REG_Y) |
                       (1 << createjs.Property.ROTATION);
  if (mask & kTransformMask) {
    this.dirty |= createjs.DisplayObject.DIRTY_TRANSFORM;
  }
  if (mask & (1 << createjs.Property.ALPHA)) {
    var alpha = this.values_[createjs.Property.ALPHA];
    this.dirty |= !alpha ? createjs.DisplayObject.DIRTY_ALL :
        createjs.DisplayObject.DIRTY_PROPERTIES;
  }
  if (mask & (1 << createjs.Property.VISIBLE)) {
    this.dirty |= createjs.DisplayObject.DIRTY_ALL;
  }
  return this;
};
  
/**
 * Returns a rectangle representing this object's bounds in its local coordinate
 * system, i.e. without affine transformation. This method converts the bounding
 * box calculated in rendering this object to a createjs.Rectangle object and
 * returns it. (This method returns an empty rectangle when it has never been
 * rendered.)
 * @return {createjs.Rectangle}
 */
createjs.DisplayObject.prototype.getBounds = function() {
  /// <returns type="createjs.Rectangle"/>
  var x = this.box_.getLeft();
  var y = this.box_.getTop();
  var width = this.box_.getWidth();
  var height = this.box_.getHeight();
  if (!this.rectangle_) {
    this.rectangle_ = new createjs.Rectangle(x, y, width, height);
  } else {
    this.rectangle_.initialize(x, y, width, height);
  }
  return this.rectangle_;
};
  
/**
 * Returns a rectangle representing this object's bounds in the coordinate
 * system of its parent.
 * @return {createjs.Rectangle}
 */
createjs.DisplayObject.prototype.getTransformedBounds = function() {
  /// <returns type="createjs.Rectangle"/>
  createjs.notImplemented();
  return this.rectangle_;
};
  
/**
 * Allows you to manually specify the bounds of an object. (This method is
 * deprecated because each display object calculates its bounds correctly.)
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @deprecated
 */
createjs.DisplayObject.prototype.setBounds = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
};

/**
 * Registers a tween to this object.
 * @param {createjs.Tween} tween
 * @const
 */
createjs.DisplayObject.prototype.registerTween = function(tween) {
  /// <param type="createjs.Tween" name="tween"/>
  if (!this.tweens_) {
    this.tweens_ = new createjs.DisplayObject.TweenList(tween);
  } else {
    var list = this.tweens_.getTweens_();
    for (var i = list.length - 1; i >= 0; --i) {
      if (list[i] === tween) {
        return;
      }
    }
    list.unshift(tween);
  }

  // Start playing the tweens attached to this object without changing the
  // status of the other tweens, i.e. registering a tween should not play the
  // paused tweens attached to this object.
  this.paused_ = false;
};

/**
 * Unregisters a tween registered to this object.
 * @param {createjs.Tween} tween
 * @const
 */
createjs.DisplayObject.prototype.unregisterTween = function(tween) {
  /// <param type="createjs.Tween" name="tween"/>
  if (this.tweens_) {
    this.tweens_.removeTween_(tween);
  }
};

/**
 * Removes all tweens registered to this object.
 * @const
 */
createjs.DisplayObject.prototype.resetTweens = function() {
  if (this.tweens_) {
    this.tweens_.stopTweens_(0);
    this.tweens_ = null;
  }
  this.synchronized_ = null;
};

/**
 * Starts playing the tweens registered to this object.
 * @param {number} time
 * @const
 */
createjs.DisplayObject.prototype.playTweens = function(time) {
  /// <param type="number" name="time"/>
  if (this.paused_ || this.synchronized_) {
    this.paused_ = false;
    if (this.synchronized_) {
      for (var i = 0; i < this.synchronized_.length; ++i) {
        var target = this.synchronized_[i];
        target.playTweens(time);
      }
    }
  }
};

/**
 * Stops playing the tweens registered to this object.
 * @param {number} time
 * @const
 */
createjs.DisplayObject.prototype.stopTweens = function(time) {
  /// <param type="number" name="time"/>
  // Immediately stop all tweens attached to this display object and being
  // synchronized with it. (This method is usually called by an action tween
  // while a display object is executes the updateTween() method.)
  if (!this.paused_) {
    this.paused_ = true;
    if (this.synchronized_) {
      for (var i = 0; i < this.synchronized_.length; ++i) {
        this.synchronized_[i].stopTweens(time);
      }
    }
  }
};

/**
 * Updates the tweens registered to this object.
 * @param {number} time
 */
createjs.DisplayObject.prototype.updateTweens = function(time) {
  /// <param type="number" name="time"/>
  if (this.hasTweens()) {
    if (!this.paused_ || this.seek_) {
      this.seek_ = false;
      this.currentFrame_ = this.tweens_.updateTweens_(time,
          this.getValue(createjs.Property.PLAY_MODE));
    }
  }
};

/**
 * Returns whether this object has tweens.
 * @return {boolean}
 * @const
 */
createjs.DisplayObject.prototype.hasTweens = function() {
  /// <returns type="boolean"/>
  return !!this.tweens_ && !!this.tweens_.getLength_();
};

/**
 * Sets the position of all tweens registered to this object.
 * @param {number} position
 * @const
 */
createjs.DisplayObject.prototype.setTweenPosition = function(position) {
  /// <param type="number" name="number"/>
  if (this.tweens_) {
    this.tweens_.setPositions_(
        createjs.Ticker.getRunTime(), position, this.paused_);
  }
  if (this.synchronized_) {
    for (var i = 0; i < this.synchronized_.length; ++i) {
      this.synchronized_[i].setTweenPosition(position);
    }
  }
  this.seek_ = true;
};

/**
 * Sets the properties of all tweens registered to this object.
 * @param {number} loop
 * @param {number} position
 * @param {boolean} single
 * @const
 */
createjs.DisplayObject.prototype.setTweenProperties =
    function(loop, position, single) {
  /// <param type="number" name="loop"/>
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="single"/>
  if (this.tweens_) {
    this.tweens_.setProperties_(this, loop, position, single);
  }
};

/**
 * Attaches this object to its parent virtually or detaches it.
 * @param {boolean} off
 * @const
 */
createjs.DisplayObject.prototype.setOff = function(off) {
  /// <param type="boolean" name="off"/>
  if (this['_off'] != off) {
    this['_off'] = off;
    this.values_[createjs.Property.OFF] = off | 0;
    this.dirty = createjs.DisplayObject.DIRTY_ALL;
    if (off) {
      this.setTweenPosition(0);
    }
  }
};

/**
 * Returns the current play mode of the tweens registered to this object.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getPlayMode = function() {
  /// <returns type="number"/>
  return this.values_[createjs.Property.PLAY_MODE];
};

/**
 * Starts synchronizing the tweens of the specified objects with this object or
 * stops it.
 * @param {createjs.DisplayObject} target
 * @param {boolean} synchronize
 * @const
 */
createjs.DisplayObject.prototype.synchronize = function(target, synchronize) {
  /// <param type="createjs.DisplayObject" name="target"/>
  /// <param type="boolean" name="synchronize"/>
  if (!this.synchronized_) {
    if (!synchronize) {
      return;
    }
    this.synchronized_ = [];
  } else {
    for (var i = 0; i < this.synchronized_.length; ++i) {
      if (this.synchronized_[i] === target) {
        if (!synchronize) {
          this.synchronized_.splice(i, 1);
        }
        return;
      }
    }
  }
  this.synchronized_.push(target);
};

/**
 * Attaches a createjs.Graphics object to this object.
 * @param {createjs.Graphics} graphics
 */
createjs.DisplayObject.prototype.addGraphics = function(graphics) {
  /// <param type="createjs.Graphics" name="graphics"/>
};

/**
 * Returns the ID of this object.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getTargetId = function() {
  return this.targetId_;
}

/**
 * Copies the property values of this object to the specified tween motion.
 * @param {createjs.TweenMotion} motion
 * @return {boolean}
 */
createjs.DisplayObject.prototype.getTweenMotion = function(motion) {
  /// <param type="createjs.TweenMotion" name="motion"/>
  /// <returns type="boolean"/>
  if (!this.values_) {
    return false;
  }
  this.values_[createjs.Property.OFF] = this['_off'] | 0;
  for (var id = createjs.Property.X; id <= createjs.Property.LOOP; ++id) {
    motion.setValue(id, this.values_[id]);
  }
  return true;
};

/**
 * Copies the property values of the specified motion to this object.
 * @param {createjs.TweenMotion} motion
 * @param {number} mask
 * @param {createjs.DisplayObject} proxy
 */
createjs.DisplayObject.prototype.setTweenMotion =
    function(motion, mask, proxy) {
  /// <param type="createjs.TweenMotion" name="motion"/>
  /// <param type="number" name="mask"/>
  /// <param type="createjs.DisplayObject" name="proxy"/>
  if (!mask) {
    return;
  }
  var flag = createjs.DisplayObject.DIRTY_TRANSFORM;
  for (var id = createjs.Property.X; id <= createjs.Property.ROTATION; ++id) {
    if (mask & (1 << id)) {
      this.values_[id] = motion.getValue(id);
    }
  }
  if (mask & (1 << createjs.Property.ALPHA)) {
    var alpha = motion.getAlpha();
    if (this.values_[createjs.Property.ALPHA] != alpha) {
      flag |= !alpha ? createjs.DisplayObject.DIRTY_ALL :
          createjs.DisplayObject.DIRTY_PROPERTIES;
      this.values_[createjs.Property.ALPHA] = alpha;
    }
  }
  if (mask & (1 << createjs.Property.OFF)) {
    this.setOff(motion.getOff());
  }
  if (mask & (1 << createjs.Property.VISIBLE)) {
    var visible = motion.getVisible();
    if (this.values_[createjs.Property.VISIBLE] != visible) {
      flag |= createjs.DisplayObject.DIRTY_ALL;
      this.values_[createjs.Property.VISIBLE] = visible;
    }
  }
  this.dirty |= flag;
};

// Add getters and setters for applications to access internal variables.
Object.defineProperties(createjs.DisplayObject.prototype, {
  'x': {
    get: createjs.DisplayObject.prototype.getX,
    set: createjs.DisplayObject.prototype.setX
  },
  'y': {
    get: createjs.DisplayObject.prototype.getY,
    set: createjs.DisplayObject.prototype.setY
  },
  'scaleX': {
    get: createjs.DisplayObject.prototype.getScaleX,
    set: createjs.DisplayObject.prototype.setScaleX
  },
  'scaleY': {
    get: createjs.DisplayObject.prototype.getScaleY,
    set: createjs.DisplayObject.prototype.setScaleY
  },
  'skewX': {
    get: createjs.DisplayObject.prototype.getSkewX,
    set: createjs.DisplayObject.prototype.setSkewX
  },
  'skewY': {
    get: createjs.DisplayObject.prototype.getSkewY,
    set: createjs.DisplayObject.prototype.setSkewY
  },
  'regX': {
    get: createjs.DisplayObject.prototype.getRegX,
    set: createjs.DisplayObject.prototype.setRegX
  },
  'regY': {
    get: createjs.DisplayObject.prototype.getRegY,
    set: createjs.DisplayObject.prototype.setRegY
  },
  'rotation': {
    get: createjs.DisplayObject.prototype.getRotation,
    set: createjs.DisplayObject.prototype.setRotation
  },
  'visible': {
    get: createjs.DisplayObject.prototype.getVisible,
    set: createjs.DisplayObject.prototype.setVisible
  },
  'alpha': {
    get: createjs.DisplayObject.prototype.getAlpha,
    set: createjs.DisplayObject.prototype.setAlpha
  },
  'shadow': {
    get: createjs.DisplayObject.prototype.getShadow,
    set: createjs.DisplayObject.prototype.setShadow
  },
  'compositeOperation': {
    get: createjs.DisplayObject.prototype.getComposition,
    set: createjs.DisplayObject.prototype.setComposition
  },
  'filters': {
    get: createjs.DisplayObject.prototype.getFilters,
    set: createjs.DisplayObject.prototype.setFilters
  },
  'mask': {
    get: createjs.DisplayObject.prototype.getMask,
    set: createjs.DisplayObject.prototype.setMask
  },
  'stage': {
    get: createjs.DisplayObject.prototype.getStage
  }
});

// Export the createjs.DisplayObject object to the global namespace.
createjs.exportObject('createjs.DisplayObject', createjs.DisplayObject, {
  // createjs.DisplayObject methods
  'nominalBounds': createjs.DisplayObject.prototype.nominalBounds,
  'cache': createjs.notReached,
  'updateCache': createjs.notReached,
  'uncache': createjs.notReached,
  'getCacheDataURL': createjs.notReached,
  'getStage': createjs.DisplayObject.prototype.getStage,
  'localToGlobal': createjs.DisplayObject.prototype.localToGlobal,
  'globalToLocal': createjs.DisplayObject.prototype.globalToLocal,
  'localToLocal': createjs.DisplayObject.prototype.localToLocal,
  'setTransform': createjs.DisplayObject.prototype.setTransform,
  'hitTest': createjs.DisplayObject.prototype.hitTest,
  'set': createjs.DisplayObject.prototype.set,
  'getScaleX': createjs.DisplayObject.prototype.getScaleX,
  'setScaleX': createjs.DisplayObject.prototype.setScaleX,
  'getScaleY': createjs.DisplayObject.prototype.getScaleY,
  'setScaleY': createjs.DisplayObject.prototype.setScaleY,
  'getBounds': createjs.DisplayObject.prototype.getBounds,
  'setBounds': createjs.notReached
  // createjs.EventDispatcher methods
  // createjs.Object methods
});
