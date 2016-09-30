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
/// <reference path="object_list"/>
/// <reference path="point.js"/>
/// <reference path="color.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="bounding_box.js"/>
/// <reference path="transform.js"/>
/// <reference path="filter.js"/>
/// <reference path="shadow.js"/>
/// <reference path="renderer.js"/>
/// <reference path="tween_object.js"/>
/// <reference path="tween_target.js"/>
/// <reference path="ticker.js"/>
/// <reference path="alpha_map_filter.js"/>
/// <reference path="color_filter.js"/>
/// <reference path="color_matrix_filter.js"/>

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
 * @implements {createjs.TweenTarget}
 * @constructor
 */
createjs.DisplayObject = function() {
  createjs.EventDispatcher.call(this);

  if (createjs.DEBUG) {
    /**
     * The Unique ID assigned to this display object.
     * @type {number}
     */
    this.id = createjs.UID.get();
  }

  /**
   * The rendering state of this object, a set of the variables having used by
   * the createjs.Renderer interface to render this object.
   * @type {createjs.DisplayObject.RenderState}
   * @private
   */
  this.state_ = new createjs.DisplayObject.RenderState();

  /**
   * The position of this display object.
   * @type {createjs.Point}
   * @private
   */
  this.position_ = new createjs.Point(0, 0);

  /**
   * The scaling factor to stretch this display object.
   * @type {createjs.Point}
   * @private
   */
  this.scale_ = new createjs.Point(1, 1);

  /**
   * The factor to skew this display object.
   * @type {createjs.Point}
   * @private
   */
  this.skew_ = new createjs.Point(0, 0);

  /**
   * The registration point of this display object.
   * @type {createjs.Point}
   * @private
   */
  this.registration_ = new createjs.Point(0, 0);

  /**
   * The bounding box of this object in the local coordinate system. (The
   * createjs.DisplayObject.RenderState class translates this box to the global
   * coordinate system.)
   * @type {createjs.BoundingBox}
   * @private
   */
  this.box_ = new createjs.BoundingBox();
};
createjs.inherits('DisplayObject',
                  createjs.DisplayObject,
                  createjs.EventDispatcher);
  
/**
 * The inner class that controls the tweens attached to this object.
 * @extends {createjs.ObjectList}
 * @constructor
 */
createjs.DisplayObject.ObjectList = function() {
  createjs.ObjectList.call(this);
};
createjs.inherits('DisplayObject.ObjectList',
                  createjs.DisplayObject.ObjectList,
                  createjs.ObjectList);

/**
 * The next position of the tweens in this list. This property saves the
 * position set by an action while this clip while it is updating its tweens.
 * @type {number}
 * @private
 */
createjs.DisplayObject.ObjectList.prototype.next_ = -1;

/**
 * The last time when the owner object updates this list.
 * @type {number}
 * @private
 */
createjs.DisplayObject.ObjectList.prototype.lastTime_ = -1;

/**
 * Starts playing the tweens in this target.
 * @param {number} time
 * @private
 */
createjs.DisplayObject.ObjectList.prototype.playTweens_ = function(time) {
  /// <param type="number" name="time"/>
  var tweens = /** @type {Array.<createjs.TweenObject>} */ (this.getItems());
  var length = tweens.length;
  for (var i = length - 1; i >= 0; --i) {
    tweens[i].playTween(time);
  }
};

/**
 * Stops playing the tweens in this target.
 * @param {number} time
 * @private
 */
createjs.DisplayObject.ObjectList.prototype.stopTweens_ = function(time) {
  /// <param type="number" name="time"/>
  var tweens = /** @type {Array.<createjs.TweenObject>} */ (this.getItems());
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
 */
createjs.DisplayObject.ObjectList.prototype.updateTweens_ =
    function(time, flag) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="flag"/>
  /// <returns type="number"/>
  var tweens = /** @type {Array.<createjs.TweenObject>} */ (this.lock());
  var length = tweens.length;
  createjs.assert(length > 0);
  var position = -1;
  if (this.next_ >= 0 && flag == createjs.TweenTarget.PlayMode.SYNCHED) {
    flag |= createjs.TweenObject.Flag.UPDATE;
  }
  for (var i = length - 1; i >= 0; --i) {
    var next = this.next_;
    position = tweens[i].updateTween(time, flag, this.next_);
    // Change the position of the proceeding tweens when an action of the above
    // tween has changed the position of all tweens of this list. (The
    // succeeding updateTween() calls will change the position of all succeeding
    // tweens to the specified one.)
    if (this.next_ != next) {
      flag |= createjs.TweenObject.Flag.UPDATE;
      for (var j = length - 1; j >= i; --j) {
        tweens[j].setPosition(this.next_, 1);
      }
    }
  }
  this.unlock();
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
 */
createjs.DisplayObject.ObjectList.prototype.setPositions_ =
    function(time, position, paused) {
  /// <param type="number" name="time"/>
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="paused"/>
  if (this.isLocked() || (!paused && this.lastTime_ < time)) {
    // Save the given position when this list is being updated so the
    // 'updateTween()' method can use this position.
    this.next_ = position;
    return;
  }
  var tweens = /** @type {Array.<createjs.TweenObject>} */ (this.getItems());
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
 * @param {createjs.TweenTarget} target
 * @param {boolean} loop
 * @param {number} position
 * @param {boolean} single
 * @private
 */
createjs.DisplayObject.ObjectList.prototype.setProperties_ =
    function(target, loop, position, single) {
  /// <param type="boolean" name="loop"/>
  /// <param type="number" name="position"/>
  /// <param type="boolean" name="single"/>
  var tweens = /** @type {Array.<createjs.TweenObject>} */ (this.getItems());
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

  /**
   * The bounding box of the owner. This bounding box is in the <canvas>
   * coordinate.
   * @type {createjs.BoundingBox}
   * @private
   */
  this.box_ = new createjs.BoundingBox();
};
createjs.inherits('DisplayObject.RenderState',
                  createjs.DisplayObject.RenderState,
                  createjs.Transform);

/**
 * The absolute alpha transparency, i.e. an alpha transparency multiplied with
 * the ancestor ones.
 * @type {number}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.alpha_ = 1;

/**
 * The shadow applied to the owner.
 * @type {createjs.Shadow}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.shadow_ = null;

/**
 * The color composition applied to the owner.
 * @type {number}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.composition_ =
    createjs.Renderer.Composition.SOURCE_OVER;

/**
 * The mask applied to the owner.
 * @type {createjs.Renderer.Clip}
 * @private
 */
createjs.DisplayObject.RenderState.prototype.clip_ = null;

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
  return this.alpha_;
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
 * Returns whether this state represents an empty state, i.e. the hosting
 * display object is not 
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
  return this.box_.contain(point.x, point.y);
};

/**
 * Copies the specified rendering property to this property.
 * @param {createjs.DisplayObject.RenderState} state
 * @const
 */
createjs.DisplayObject.RenderState.prototype.copyProperties = function(state) {
  /// <param type="createjs.DisplayObject.RenderState" name="state"/>
  this.alpha_ = state.alpha_;
  this.shadow_ = state.shadow_;
  this.composition_ = state.composition_;
};

/**
 * Appends the specified visual properties to this state.
 * @param {createjs.DisplayObject.RenderState} state
 * @param {number} alpha
 * @param {createjs.Shadow} shadow
 * @param {number} composition
 * @param {boolean} visible
 * @const
 */
createjs.DisplayObject.RenderState.prototype.appendProperties =
    function(state, alpha, shadow, composition, visible) {
  /// <param type="createjs.DisplayObject.RenderState" name="state"/>
  /// <param type="number" name="alpha"/>
  /// <param type="createjs.Shadow" name="shadow"/>
  /// <param type="number" name="composition"/>
  /// <param type="boolean" name="visible"/>
  this.alpha_ = state.alpha_ * alpha;
  this.shadow_ = shadow || state.shadow_;
  this.composition_ = composition || state.composition_;
};

/**
 * Attaches the specified clipping object to this state.
 * @param {createjs.DisplayObject.RenderState} state
 * @param {createjs.Renderer.Clip} clip
 * @const
 */
createjs.DisplayObject.RenderState.prototype.appendClip =
    function(state, clip) {
  this.clip_ = state.clip_ || clip;
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
  return this.alpha_ > 0;
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

if (createjs.DEBUG) {
  /**
   * The unique ID assigned to this object.
   * @type {number}
   * @protected
   */
  createjs.DisplayObject.prototype.id = -1;
}

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
 * The rotation in degrees for this display object.
 * @type {number}
 * @private
 */
createjs.DisplayObject.prototype.rotation_ = 0;

/**
 * Whether this display object should be rendered.
 * @type {boolean}
 * @private
 */
createjs.DisplayObject.prototype.visible_ = true;

/**
 * The alpha (transparency) value of this display object.
 * @type {number}
 * @private
 */
createjs.DisplayObject.prototype.alpha_ = 1;

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
 * @type {Array.<number>}
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
 * @type {createjs.DisplayObject.ObjectList}
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
 * The play mode of the tweens attached to this object.
 * @type {number}
 * @private
 */
createjs.DisplayObject.prototype.playMode_ =
    createjs.TweenTarget.PlayMode.INDEPENDENT;

/**
 * A list of tween targets synchronized with this object.
 * @type {Array.<createjs.TweenTarget>}
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
 * Returns the dirty state of this object.
 * @return {number}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getDirty = function() {
  /// <returns type="number"/>
  return this.dirty;
};

/**
 * Sets the dirty state of this object.
 * @param {number} dirty
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.setDirty = function(dirty) {
  /// <param type="number" name="dirty"/>
  this.dirty |= dirty;
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
  return this.position_.x;
};

/**
 * Sets the horizontal position.
 * @param {number} x
 * @const
 */
createjs.DisplayObject.prototype.setX = function(x) {
  /// <param type="number" name="x"/>
  x = createjs.getNumber(x);
  if (!createjs.isNaN(x) && this.position_.x != x) {
    this.position_.x = x;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the vertical position.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getY = function() {
  /// <returns type="number"/>
  return this.position_.y;
};

/**
 * Sets the vertical position.
 * @param {number} y
 * @const
 */
createjs.DisplayObject.prototype.setY = function(y) {
  /// <param type="number" name="y"/>
  y = createjs.getNumber(y);
  if (!createjs.isNaN(y) && this.position_.y != y) {
    this.position_.y = y;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the horizontal scale.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getScaleX = function() {
  /// <returns type="number"/>
  return this.scale_.x;
};

/**
 * Sets the horizontal scale.
 * @param {number} scaleX
 * @const
 */
createjs.DisplayObject.prototype.setScaleX = function(scaleX) {
  /// <param type="number" name="scaleX"/>
  scaleX = createjs.getNumber(scaleX);
  if (this.scale_.x != scaleX) {
    this.scale_.x = scaleX;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the vertical scale.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getScaleY = function() {
  /// <returns type="number"/>
  return this.scale_.y;
};

/**
 * Sets the vertical scale.
 * @param {number} scaleY
 * @const
 */
createjs.DisplayObject.prototype.setScaleY = function(scaleY) {
  /// <param type="number" name="scaleY"/>
  scaleY = createjs.getNumber(scaleY);
  if (this.scale_.y != scaleY) {
    this.scale_.y = scaleY;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the horizontal skew.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getSkewX = function() {
  /// <returns type="number"/>
  return this.skew_.x;
};

/**
 * Sets the horizontal skew.
 * @param {number} skewX
 * @const
 */
createjs.DisplayObject.prototype.setSkewX = function(skewX) {
  /// <param type="number" name="skewX"/>
  skewX = createjs.getNumber(skewX);
  if (this.skew_.x != skewX) {
    this.skew_.x = skewX;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the vertical skew.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getSkewY = function() {
  /// <returns type="number"/>
  return this.skew_.y;
};

/**
 * Sets the vertical skew.
 * @param {number} skewY
 * @const
 */
createjs.DisplayObject.prototype.setSkewY = function(skewY) {
  /// <param type="number" name="skewY"/>
  skewY = createjs.getNumber(skewY);
  if (this.skew_.y != skewY) {
    this.skew_.y = skewY;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the horizontal registration point.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getRegX = function() {
  /// <returns type="number"/>
  return this.registration_.x;
};

/**
 * Sets the horizontal registration point.
 * @param {number} regX
 * @const
 */
createjs.DisplayObject.prototype.setRegX = function(regX) {
  /// <param type="number" name="regX"/>
  regX = createjs.getNumber(regX);
  if (this.registration_.x != regX) {
    this.registration_.x = regX;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the vertical registration point.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getRegY = function() {
  /// <returns type="number"/>
  return this.registration_.y;
};

/**
 * Sets the vertical registration point.
 * @param {number} regY
 * @const
 */
createjs.DisplayObject.prototype.setRegY = function(regY) {
  /// <param type="number" name="regY"/>
  regY = createjs.getNumber(regY);
  if (this.registration_.y != regY) {
    this.registration_.y = regY;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the rotation.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getRotation = function() {
  /// <returns type="number"/>
  return this.rotation_;
};

/**
 * Sets the rotation.
 * @param {number} rotation
 * @const
 */
createjs.DisplayObject.prototype.setRotation = function(rotation) {
  /// <param type="number" name="rotation"/>
  rotation = createjs.getNumber(rotation);
  if (this.rotation_ != rotation) {
    this.rotation_ = rotation;
    this.setDirty(createjs.DisplayObject.DIRTY_TRANSFORM);
  }
};

/**
 * Retrieves the visibility.
 * @return {boolean}
 * @const
 */
createjs.DisplayObject.prototype.getVisible = function() {
  /// <returns type="boolean"/>
  return this.visible_;
};

/**
 * Sets the visibility.
 * @param {boolean} visible
 * @const
 */
createjs.DisplayObject.prototype.setVisible = function(visible) {
  /// <param type="boolean" name="visible"/>
  visible = !!visible;
  if (this.visible_ != visible) {
    this.visible_ = visible;
    this.setDirty(createjs.DisplayObject.DIRTY_ALL);
  }
};

/**
 * Retrieves the alpha value.
 * @return {number}
 * @const
 */
createjs.DisplayObject.prototype.getAlpha = function() {
  /// <returns type="number"/>
  return this.alpha_;
};

/**
 * Sets the alpha value.
 * @param {number} alpha
 * @const
 */
createjs.DisplayObject.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  alpha = createjs.getNumber(alpha);
  if (this.alpha_ != alpha) {
    this.alpha_ = alpha;
    this.setDirty(!alpha ? createjs.DisplayObject.DIRTY_ALL :
        createjs.DisplayObject.DIRTY_PROPERTIES);
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
  this.setDirty(createjs.DisplayObject.DIRTY_PROPERTIES);
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
    this.setDirty(createjs.DisplayObject.DIRTY_PROPERTIES);
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
 * @return {Array.<number>}
 * @protected
 * @const
 */
createjs.DisplayObject.prototype.getColorMatrix = function() {
  /// <returns type="Array" elementType="number"/>
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
      colorMatrix = [
        multiplier.getRed(), 0, 0, 0, offset.getRed(),
        0, multiplier.getGreen(), 0, 0, offset.getGreen(),
        0, 0, multiplier.getBlue(), 0, offset.getBlue(),
        0, 0, 0, 1, 0,
        0, 0, 0, 0, 1
      ];
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
  this.setDirty(createjs.DisplayObject.DIRTY_SHAPE);

  // Apply an alpha-map filter to this object and cache the filtered image to a
  // memory <canvas> element.
  this.handleDetach();
  this.handleAttach(1);
};

/**
 * Retrieves the masking path.
 * @return {createjs.DisplayObject}
 * @const
 */
createjs.DisplayObject.prototype.getMask = function() {
  /// <returns type="createjs.DisplayObject"/>
  return this.mask_;
};

/**
 * Sets the masking path.
 * @param {createjs.DisplayObject} mask
 * @const
 */
createjs.DisplayObject.prototype.setMask = function(mask) {
  /// <param name="mask" type="createjs.DisplayObject"/>
  // Over-write the '_off' property of this mask so the 'layout()' method can
  // calculate its bounding box. (It does not have to be drawable, though.)
  mask['_off'] = false;

  // Add this object to an owner of this mask so the mask can set its dirty
  // flag when it has its createjs.Graphics object changed by a tween.
  if (!mask.owners_) {
    mask.owners_ = [];
  }
  for (var i = 0; i < mask.owners_.length; ++i) {
    if (mask.owners_[i] === this) {
      return;
    }
  }
  mask.owners_.push(this);

  // Set the composition command to draw this object over the mask.
  mask.composition_ = createjs.Renderer.Mask.COMPOSE;
  mask.state_.composition_ = createjs.Renderer.Composition.DESTINATION_IN;
  this.composition_ = createjs.Renderer.Composition.SOURCE_OVER;

  // Draw the mask onto a memory <canvas> element.
  var type = 2;
  mask.handleAttach(type);
  this.mask_ = mask;
  this.clip_ = null;
  this.setDirty(createjs.DisplayObject.DIRTY_MASK);
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
 * Retrieves the parent of this object.
 * @return {createjs.DisplayObject}
 * @protected
 */
createjs.DisplayObject.prototype.getParent = function() {
  /// <returns type="createjs.DisplayObject"/>
  return /** @type {createjs.DisplayObject} */ (this['parent']);
};

/**
 * Returns a set of parameters used for rendering this object.
 * @return {createjs.DisplayObject.RenderState}
 * @protected
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
 */
createjs.DisplayObject.prototype.setParent = function(parent) {
  createjs.assert(parent != this);
  this['parent'] = parent;
};

/**
 * Returns the bounding box of this object.
 * @return {createjs.BoundingBox}
 * @protected
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
 */
createjs.DisplayObject.prototype.setBoundingBox =
    function(minX, minY, maxX, maxY) {
  if (this.box_.minX != minX || this.box_.minY != minY ||
      this.box_.maxX != maxX || this.box_.maxY != maxY) {
    this.box_.minX = minX;
    this.box_.minY = minY;
    this.box_.maxX = maxX;
    this.box_.maxY = maxY;
    this.setDirty(createjs.DisplayObject.DIRTY_BOX);
  }
};

/**
 * Retrieves the width of this object.
 * @return {number}
 * @protected
 */
createjs.DisplayObject.prototype.getBoxWidth = function() {
  /// <returns type="number"/>
  return this.box_.getWidth();
};

/**
 * Retrieves the height of this object.
 * @return {number}
 * @protected
 */
createjs.DisplayObject.prototype.getBoxHeight = function() {
  /// <returns type="number"/>
  return this.box_.getHeight();
};

/**
 * Returns the current position of the tweens attached to this object.
 * @return {number}
 * @protected
 */
createjs.DisplayObject.prototype.getCurrentFrame = function() {
  /// <returns type="number"/>
  return this.currentFrame_;
};

/**
 * Sets the current position of the tweens attached to this object.
 * @param {number} frame
 * @protected
 */
createjs.DisplayObject.prototype.setCurrentFrame = function(frame) {
  /// <param type="number" name="frame"/>
  this.currentFrame_ = frame;
};

/**
 * Returns whether this object is playing its tweens or its sprite sheet.
 * @return {boolean}
 * @protected
 */
createjs.DisplayObject.prototype.isPaused = function() {
  /// <returns type="boolean"/>
  return this.paused_;
};

/**
 * Sets the current playing status of its tweens or its sprite sheet.
 * @param {boolean} paused
 * @protected
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
  for (var key in this) {
    var value = this[key];
    if (value && createjs.isObject(value)) {
      this[key] = null;
    }
  }
  this.visible_ = false;
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
  var box = clip ? clip.getBox() : state.box_;
  if (!this.isVisible() || !box.contain(point.x, point.y)) {
    return null;
  }
  // The above bounding box becomes equal to the frame rectangle of this object
  // only when this object is not either rotated or skewed. When this object is
  // either rotated or skewed, this function needs to translate the point into
  // the local coordinate of this object and tests whether the translated point
  // is in the frame rectangle.
  var transform = clip ? clip.getTransform() : state;
  if (transform.b || transform.c) {
    var region = clip ? clip.getRectangle() : this.getBoundingBox();
    if (!transform.invertible || region.isEmpty()) {
      return null;
    }
    var local = new createjs.Point(point.x, point.y);
    transform.getInverse().transformPoint(local);
    if (!region.contain(local.x, local.y)) {
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
    state.appendTransform(parent.state_,
                          this.position_,
                          this.scale_,
                          this.rotation_,
                          this.skew_,
                          this.registration_);
    this.inverse_ = null;
  }
  if (dirty & createjs.DisplayObject.DIRTY_PROPERTIES) {
    state.appendProperties(parent.state_,
                           this.alpha_,
                           this.shadow_,
                           this.composition_,
                           this.visible_);
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
    if (!state.getClip() && (dirty & DIRTY_BOX)) {
      state.updateBox(this.box_);
    }
  }
  // Render this object if the renderer can render it. (The WebGL renderer
  // cannot render this object as expected when its affine transformation is not
  // invertible, i.e. its affine-transformed shape is not a rectangle.)
  draw &= state.invertible;
  if (draw) {
    renderer.addObject(this);
  }
  parent.state_.inflateBox(state);
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
  var state = this.state_;
  createjs.assert(!!state.invertible);
  renderer.setTransformation(
      state.a, state.b, state.c, state.d, state.tx, state.ty);
  renderer.setAlpha(state.alpha_);
  renderer.setComposition(state.composition_);
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
  return this.visible_ && !!this.alpha_ && !!this.scale_.x && !!this.scale_.y;
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
    'x': createjs.DisplayObject.prototype.setX,
    'y': createjs.DisplayObject.prototype.setY,
    'scaleX': createjs.DisplayObject.prototype.setScaleX,
    'scaleY': createjs.DisplayObject.prototype.setScaleY,
    'skewX': createjs.DisplayObject.prototype.setSkewX,
    'skewY': createjs.DisplayObject.prototype.setSkewY,
    'regX': createjs.DisplayObject.prototype.setRegX,
    'regY': createjs.DisplayObject.prototype.setRegY,
    'rotation': createjs.DisplayObject.prototype.setRotation,
    'visible': createjs.DisplayObject.prototype.setVisible,
    'alpha': createjs.DisplayObject.prototype.setAlpha,
    '_off': createjs.DisplayObject.prototype.setOff,
    'compositeOperation': createjs.DisplayObject.prototype.setComposition
  };
  for (var key in properties) {
    var setter = KEYS[key];
    if (setter) {
      var value = properties[key];
      setter.call(this, value);
    }
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

/** @override */
createjs.DisplayObject.prototype.registerTween = function(tween) {
  if (!this.tweens_) {
    this.tweens_ = new createjs.DisplayObject.ObjectList();
  } else {
    if (this.tweens_.findItem(tween) >= 0) {
      return;
    }
  }
  this.tweens_.unshiftItem(tween);

  // Start playing the tweens attached to this object without changing the
  // status of the other tweens, i.e. registering a tween should not play the
  // paused tweens attached to this object.
  this.paused_ = false;
};

/** @override */
createjs.DisplayObject.prototype.unregisterTween = function(tween) {
  if (this.tweens_) {
    this.tweens_.removeItem(tween);
  }
};

/** @override */
createjs.DisplayObject.prototype.resetTweens = function() {
  if (this.tweens_) {
    this.tweens_.stopTweens_(0);
    this.tweens_ = null;
  }
  this.synchronized_ = null;
};

/** @override */
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

/** @override */
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

/** @override */
createjs.DisplayObject.prototype.updateTweens = function(time) {
  /// <param type="number" name="time"/>
  if (this.hasTweens()) {
    if (!this.paused_ || this.seek_) {
      this.seek_ = false;
      this.currentFrame_ = this.tweens_.updateTweens_(time, this.getPlayMode());
    }
  }
};

/** @override */
createjs.DisplayObject.prototype.hasTweens = function() {
  return !!this.tweens_ && !!this.tweens_.getLength();
};

/** @override */
createjs.DisplayObject.prototype.setTweenPosition = function(position) {
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

/** @override */
createjs.DisplayObject.prototype.setTweenProperties =
    function(loop, position, single) {
  if (this.tweens_) {
    this.tweens_.setProperties_(this, loop, position, single);
  }
};

/** @override */
createjs.DisplayObject.prototype.getOff = function() {
  /// <returns type="boolean"/>
  return this['_off'];
};

/** @override */
createjs.DisplayObject.prototype.setOff = function(off) {
  /// <param type="boolean" name="off"/>
  if (this.getOff() != off) {
    this['_off'] = off;
    this.setDirty(createjs.DisplayObject.DIRTY_ALL);
    if (off) {
      this.setTweenPosition(0);
    }
  }
};

/** @override */
createjs.DisplayObject.prototype.getPlayMode = function() {
  /// <returns type="number"/>
  return this.playMode_;
};

/** @override */
createjs.DisplayObject.prototype.setPlayMode = function(mode) {
  /// <param type="number" name="mode"/>
  this.playMode_ = mode;
};

/** @override */
createjs.DisplayObject.prototype.synchronize = function(target, synchronize) {
  /// <param type="createjs.TweenTarget" name="target"/>
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

/** @override */
createjs.DisplayObject.prototype.addGraphics = function(graphics) {
  /// <param type="createjs.Graphics" name="graphics"/>
};

/** @override */
createjs.DisplayObject.prototype.getSetters = function() {
  /// <returns type="Object" elementType="createjs.TweenTarget.Setter"/>
  if (!this.position_) {
    return null;
  }
  var setters = createjs.TweenTarget.Property.getSetters();
  setters['_off'].setBoolean(this.getOff());
  setters['x'].setNumber(this.position_.x);
  setters['y'].setNumber(this.position_.y);
  setters['scaleX'].setNumber(this.scale_.x);
  setters['scaleY'].setNumber(this.scale_.y);
  setters['skewX'].setNumber(this.skew_.x);
  setters['skewY'].setNumber(this.skew_.y);
  setters['regX'].setNumber(this.registration_.x);
  setters['regY'].setNumber(this.registration_.y);
  setters['rotation'].setNumber(this.rotation_);
  setters['visible'].setBoolean(this.visible_);
  setters['alpha'].setNumber(this.alpha_);

  // Disable setters not available for this object.
  setters['startPosition'].setNull();
  setters['loop'].setNull();
  setters['mode'].setNull();
  setters['text'].setNull();
  setters['graphics'].setNull();
  return setters;
};

// Add setters to allow tweens to change this object.
createjs.TweenTarget.Property.addSetters({
  '_off': createjs.DisplayObject.prototype.setOff,
  'x': createjs.DisplayObject.prototype.setX,
  'y': createjs.DisplayObject.prototype.setY,
  'scaleX': createjs.DisplayObject.prototype.setScaleX,
  'scaleY': createjs.DisplayObject.prototype.setScaleY,
  'skewX': createjs.DisplayObject.prototype.setSkewX,
  'skewY': createjs.DisplayObject.prototype.setSkewY,
  'regX': createjs.DisplayObject.prototype.setRegX,
  'regY': createjs.DisplayObject.prototype.setRegY,
  'rotation': createjs.DisplayObject.prototype.setRotation,
  'visible': createjs.DisplayObject.prototype.setVisible,
  'alpha': createjs.DisplayObject.prototype.setAlpha
});

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
