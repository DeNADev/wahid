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

/**
 * A class that contains multiple createjs.DisplayObject instances.
 * @extends {createjs.DisplayObject}
 * @constructor
 */
createjs.Container = function() {
  createjs.DisplayObject.call(this);
  this.initializeContainer_();
};
createjs.inherits('Container', createjs.Container, createjs.DisplayObject);

/**
 * The inner class that encapsulates a list of display objects added to this
 * container.
 * @constructor
 */
createjs.Container.ObjectList = function() {
  /**
   * The list of display objects.
   * @type {Array.<*>}
   * @private
   */
  this.items_ = [];

  /**
   * The clone of the display-object list.
   * @type {Array.<*>}
   * @private
   */
  this.clone_ = null;

  /**
   * Whether this list is locked.
   * @type {boolean}
   * @private
   */
  this.locked_ = false;
};

/**
 * Retrieves the editable display objects of this list. This method returns a
 * clone if this list is locked.
 * @return {Array.<*>}
 * @private
 * @const
 */
createjs.Container.ObjectList.prototype.getItems_ = function() {
  /// <returns type="Array" elementType="createjs.DisplayObject"/>
  if (!this.locked_) {
    return this.items_;
  }
  if (!this.clone_) {
    this.clone_ = this.items_.slice();
  }
  return this.clone_;
};

/**
 * Locks this list for iteration. This method changes the state of this list to
 * 'locked' to apply succeeding add operations and remove ones to its clone.
 * @return {Array.<*>}
 * @private
 * @const
 */
createjs.Container.ObjectList.prototype.lock_ = function() {
  /// <returns type="Array" elementType="createjs.DisplayObject"/>
  createjs.assert(!this.locked_);
  this.locked_ = true;
  return this.items_;
};

/**
 * Unlocks this list. This method changes the stage of this list to 'unlocked'
 * and copies its clone if an application edits the list while it is locked.
 * @private
 * @const
 */
createjs.Container.ObjectList.prototype.unlock_ = function() {
  createjs.assert(this.locked_);
  this.locked_ = false;
  if (this.clone_) {
    this.items_ = this.clone_;
    this.clone_ = null;
  }
};

/**
 * Removes a display object from this list.
 * @param {*} item
 * @private
 * @const
 */
createjs.Container.ObjectList.prototype.removeItem_ = function(item) {
  /// <param type="createjs.DisplayObject" name="item"/>
  var children = this.getItems_();
  for (var i = children.length - 1; i >= 0; --i) {
    if (children[i] === item) {
      children.splice(i, 1);
      return;
    }
  }
};

/**
 * Removes all display objects in this list.
 * @private
 * @const
 */
createjs.Container.ObjectList.prototype.removeAllItems_ = function() {
  if (!this.locked_) {
    this.items_ = [];
  } else {
    this.clone_ = [];
  }
};

/**
 * Returns a clone of this list.
 * @return {Array.<*>}
 * @const
 */
createjs.Container.ObjectList.prototype.cloneItems_ = function() {
  /// <returns type="Array" elementType="createjs.DisplayObject"/>
  var items = this.clone_ ? this.clone_ : this.items_;
  return items.slice();
};

/**
 * The list of children of this container.
 * @type {createjs.Container.ObjectList}
 * @private
 */
createjs.Container.prototype.children_ = null;

/**
 * A clone of the list of the children of this container.
 * @type {Array.<createjs.DisplayObject>}
 * @private
 */
createjs.Container.prototype.clone_ = null;

/**
 * A bit-mask representing CreateJS events listened either by this container or
 * by its children.
 * @type {number}
 * @private
 */
createjs.Container.prototype.userEvents_ = 0;

/**
 * Initializes this container.
 * @private
 */
createjs.Container.prototype.initializeContainer_ = function() {
  this.children_ = new createjs.Container.ObjectList();
};

/**
 * Resets a child object having attached to this object.
 * @param {createjs.DisplayObject} child
 * @private
 */
createjs.Container.prototype.resetChild_ = function(child) {
  /// <param type="createjs.DisplayObject" name="child"/>
  child.setParent(null);
  child.removeAllListeners();
};

/**
 * Detaches a display object from this container.
 * @param {createjs.DisplayObject} child
 * @private
 */
createjs.Container.prototype.removeChild_ = function(child) {
  /// <param type="createjs.DisplayObject" name="child"/>
  this.resetChild_(child);
  this.children_.removeItem_(child);
  child.handleDetach();
};

/**
 * Detaches a display object at the specified index.
 * @param {number} index
 * @private
 */
createjs.Container.prototype.removeChildAt_ = function(index) {
  /// <param type="number" name="index"/>
  if (index >= 0) {
    var children = this.children_.getItems_();
    if (index < children.length) {
      var child = /** @type {createjs.DisplayObject} */ (children[index]);
      this.resetChild_(child);
      children.splice(index, 1);
      child.handleDetach();
    }
  }
};

/**
 * Adds the specified child to the specified location only if it is not a child
 * of this container.
 * @param {createjs.DisplayObject} child
 * @private
 */
createjs.Container.prototype.initializeChild_ = function(child) {
  /// <param type="createjs.DisplayObject" name="child"/>
  var parent = child.getParent();
  createjs.assert(parent !== child);
  if (parent) {
    child.setParent(null);
    parent.children_.removeItem_(child);
  } else {
    child.handleAttach(1);
  }
  child.dirty = createjs.DisplayObject.DIRTY_ALL;
  child.setParent(this);
};

/**
 * Returns the child at the specified index.
 * @param {number} index
 * @return {createjs.DisplayObject}
 */
createjs.Container.prototype.getChildAt = function(index) {
  /// <param type="number" name="index"/>
  /// <returns type="createjs.DisplayObject"/>
  var children = this.children_.getItems_();
  return /** @type {createjs.DisplayObject} */ (children[index]);
};
  
/**
 * Returns the child with the specified name.
 * @param {string} name
 * @return {createjs.DisplayObject}
 */
createjs.Container.prototype.getChildByName = function(name) {
  /// <param type="string" name="name"/>
  /// <returns type="createjs.DisplayObject"/>
  var children = this.children_.getItems_();
  for (var i = children.length - 1; i >= 0; --i) {
    var child = /** @type {createjs.DisplayObject} */ (children[i]);
    if (child['name'] == name) {
      return child;
    }
  }
  return null;
};

/**
 * The function that defines the default sort order of the children of this
 * container. (This container sorts its child in the ascending order of their
 * vertical positions by default.)
 * @param {createjs.DisplayObject} a
 * @param {createjs.DisplayObject} b
 * @return {number}
 * @private
 */
createjs.Container.sortFunction_ = function(a, b) {
  /// <param type="createjs.DisplayObject" name="a"/>
  /// <param type="createjs.DisplayObject" name="b"/>
  /// <returns type="number"/>
  return a.getZ() - b.getZ();
};

/**
 * Sorts the children of this container.
 * @param {function(Object, Object): number|undefined} sortFunction
 */
createjs.Container.prototype.sortChildren = function(sortFunction) {
  /// <param type="Function" name="sortFunction"/>
  // Sort the children of this container with their vertical positions only if
  // it is not sorted.
  var runTime = createjs.Ticker.getRunTime();
  var list = /** @type {Array.<createjs.DisplayObject>} */
      (this.children_.getItems_());
  var length = list.length;
  if (length) {
    var z = list[0].getZ();
    for (var i = 1; i < length; ++i) {
      var z0 = list[i].getZ();
      if (z > z0) {
        list.sort(createjs.Container.sortFunction_);
        this.sortTime_ = runTime;
        return;
      }
      z = z0;
    }
  }
};

/**
 * Returns the index of the specified child in the display list, or -1 if it is
 * not in the display list.
 * @param {createjs.DisplayObject} child
 * @return {number}
 */
createjs.Container.prototype.getChildIndex = function(child) {
  /// <param type="createjs.DisplayObject" name="child"/>
  /// <returns type="number"/>
  var children = this.children_.getItems_();
  for (var i = children.length - 1; i >= 0; --i) {
    if (/** @type {createjs.DisplayObject} */ (children[i]) === child) {
      return i;
    }
  }
  return -1;
};

/**
 * Returns the number of children in the display list.
 * @return {number} The number of children in the display list.
 */
createjs.Container.prototype.getNumChildren = function() {
  /// <returns type="number"/>
  var children = this.children_.getItems_();
  return children.length;
};
  
/**
 * Returns a clone of the child list of this container.
 * @return {Array.<createjs.DisplayObject>}
 */
createjs.Container.prototype.getChildren = function() {
  /// <returns type="Array" elementType="createjs.DisplayObject"/>
  if (!this.clone_) {
    this.clone_ = this.children_.cloneItems_();
  }
  return this.clone_;
};

/**
 * Swaps the children at the specified indexes. Fails silently if either index
 * is out of range.
 * @param {number} index1
 * @param {number} index2
 */
createjs.Container.prototype.swapChildrenAt = function(index1, index2) {
  /// <param type="number" name="index1"/>
  /// <param type="number" name="index2"/>
  if (index1 >= 0 && index2 >= 0) {
    var children = this.children_.getItems_();
    var length = children.length;
    if (index1 < length && index2 < length) {
      var child1 = children[index1];
      var child2 = children[index2];
      children[index1] = child2;
      children[index2] = child1;
    }
  }
};
  
/**
 * Swaps the specified children's depth in the display list. Fails silently if
 * either child is not a child of this object.
 * @param {createjs.DisplayObject} child1
 * @param {createjs.DisplayObject} child2
 */
createjs.Container.prototype.swapChildren = function(child1, child2) {
  /// <param type="createjs.DisplayObject" name="child1"/>
  /// <param type="createjs.DisplayObject" name="child2"/>
  if (child1.getParent() === this && child2.getParent() === this) {
    var children = this.children_.getItems_();
    var index1 = -1;
    var index2 = -1;
    for (var i = children.length - 1; i >= 0; --i) {
      var child = /** @type {createjs.DisplayObject} */ (children[i]);
      if (child === child1) {
        index1 = i;
      } else if (child === child2) {
        index2 = i;
      }
    }
    if (index1 >= 0 && index2 >= 0) {
      children[index1] = child2;
      children[index2] = child1;
    }
  }
};
  
/**
 * Changes the depth of the specified child. Fails silently if the child is not
 * a child of this container, or the index is out of range.
 * @param {createjs.DisplayObject} child
 * @param {number} index  
 */
createjs.Container.prototype.setChildIndex = function(child, index) {
  /// <param type="createjs.DisplayObject" name="child"/>
  /// <param type="number" name="index"/>
  if (index >= 0 && child.getParent() === this) {
    var children = this.children_.getItems_();
    for (var i = children.length - 1; i >= 0; --i) {
      if (/** @type {createjs.DisplayObject} */ (children[i]) === child) {
        children.splice(i, 1);
        break;
      }
    }
    children.splice(index, 0, child);
  }
};

/**
 * Returns an array of all display objects under the specified coordinates that
 * are in this container's display list. This routine ignores any display
 * objects with mouseEnabled set to false. The array will be sorted in order of
 * visual depth, with the top-most display object at index 0. This uses shape
 * based hit detection, and can be an expensive operation to run, so it is best
 * to use it carefully. For example, if testing for objects under the mouse,
 * test on tick (instead of on mousemove), and only if the mouse's position has
 * changed.
 * @param {number} x
 * @param {number} y
 * @return {Array.<createjs.DisplayObject>}
 */
createjs.Container.prototype.getObjectsUnderPoint = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.DisplayObject"/>
  var list = [];
  this.hitTestObjects(this.localToGlobal(x, y), list, 0, 1);
  return list;
};

/**
 * Similar to the Container.getObjectsUnderPoint() method, but returns only the
 * top-most display object. This runs significantly faster than the
 * Container.getObjectsUnderPoint() method, but is still an expensive operation.
 * See the Container.getObjectsUnderPoint() for more information.
 * @param {number} x
 * @param {number} y
 * @return {createjs.DisplayObject}
 */
createjs.Container.prototype.getObjectUnderPoint = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="createjs.DisplayObject"/>
  return this.hitTestObject(new createjs.Point(x, y), 0, 1);
};
  
/** @override */
createjs.Container.prototype.addChild = function(var_args) {
  /// <var type="Array" elementType="createjs.DisplayObject" name="args"/>
  var args = arguments;
  var length = args.length;
  if (length < 1) {
    return null;
  }
  var children = this.children_.getItems_();
  for (var i = 0; i < length; ++i) {
    var child = /** @type {createjs.DisplayObject} */ (args[i]);
    this.initializeChild_(child);
    children.push(child);
  }
  this.clone_ = null;
  return /** @type {createjs.DisplayObject} */ (args[length - 1]);
};

/** @override */
createjs.Container.prototype.addChildAt = function(var_args) {
  /// <var type="Array" elementType="createjs.DisplayObject" name="args"/>
  var args = arguments;
  var length = args.length;
  if (length < 2) {
    return null;
  }
  var children = this.children_.getItems_();
  var index = createjs.getNumber(args[--length]);
  for (var i = 0; i < length; ++i, ++index) {
    var child = /** @type {createjs.DisplayObject} */ (args[i]);
    this.initializeChild_(child);
    children.splice(index, 0, child);
  }
  this.clone_ = null;
  return /** @type {createjs.DisplayObject} */ (args[length - 1]);
};

/** @override */
createjs.Container.prototype.removeChild = function(var_args) {
  /// <var type="Array" elementType="createjs.DisplayObject" name="args"/>
  var args = arguments;
  var length = args.length;
  if (length < 1) {
    return false;
  }
  for (var i = 0; i < length; ++i) {
    var child = /** @type {createjs.DisplayObject} */ (args[i]);
    this.removeChild_(child);
  }
  this.clone_ = null;
  return true;
};

/** @override */
createjs.Container.prototype.removeChildAt = function(var_args) {
  /// <var type="Array" elementType="number" name="args"/>
  var args = arguments;
  var length = args.length;
  if (length < 1) {
    return false;
  }
  for (var i = 0; i < length; ++i) {
    var index = /** @type {number} */ (args[i]);
    this.removeChildAt_(index);
  }
  this.clone_ = null;
  return true;
};

/** @override */
createjs.Container.prototype.removeAllChildren = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  if (this.children_) {
    var children = this.children_.getItems_();
    for (var i = children.length - 1; i >= 0; --i) {
      var child = /** @type {createjs.DisplayObject} */ (children[i]);
      if (child) {
        child.removeAllChildren(true);
        this.resetChild_(child);
      }
    }
    this.children_.removeAllItems_();
  }
  this.clone_ = null;
};

/** @override */
createjs.Container.prototype.handleDetach = function() {
  if (this.children_) {
    var children = this.children_.getItems_();
    for (var i = children.length - 1; i >= 0; --i) {
      var child = children[i];
      child.dirty = createjs.DisplayObject.DIRTY_ALL;
      child.handleDetach();
    }
  }
};

/** @override */
createjs.Container.prototype.hitTestObject = function(point, types, bubble) {
  /// <param type="createjs.Point" name="point"/>
  /// <param type="number" name="types"/>
  /// <param type="number" name="bubble"/>
  /// <returns type="createjs.DisplayObject"/>
  bubble |= types & this.getEventTypes();
  var testChildren = bubble | (types & this.userEvents_);
  if (testChildren) {
    var children = this.children_.getItems_();
    for (var i = children.length - 1; i >= 0; --i) {
      var child = /** @type {createjs.DisplayObject} */ (children[i]);
      if (!child['_off'] && child.isVisible()) {
        var result = child.hitTestObject(point, types, bubble);
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
};

/** @override */
createjs.Container.prototype.hitTestObjects =
    function(point, list, types, bubble) {
  /// <param type="createjs.Point" name="point"/>
  /// <param type="Array" elementType="createjs.DisplayObject" name="list"/>
  /// <param type="number" name="types"/>
  /// <param type="number" name="bubble"/>
  bubble |= types & this.getEventTypes();
  var testChildren = bubble | (types & this.userEvents_);
  if (testChildren) {
    var children = this.children_.getItems_();
    for (var i = children.length - 1; i >= 0; --i) {
      var child = /** @type {createjs.DisplayObject}*/ (children[i]);
      if (!child['_off'] && child.isVisible()) {
        child.hitTestObjects(point, list, types, bubble);
      }
    }
  }
};

/** @override */
createjs.Container.prototype.layout =
    function(renderer, parent, dirty, time, draw) {
  /// <param type="createjs.Renderer" name="renderer"/>
  /// <param type="createjs.DisplayObject" name="parent"/>
  /// <param type="number" name="dirty"/>
  /// <param type="number" name="time"/>
  /// <param type="number" name="draw"/>
  /// <returns type="numer"/>
  // Updates the layout state of this object. The children of this object uses
  // this layout state and this update must be executed BEFORE updating the
  // layout of its children.
  this.userEvents_ = this.getEventTypes();
  dirty |= this.dirty;
  this.updateLayout(parent, dirty);

  // Update the tweens attached to all children of this container, and update
  // their layouts. Tweens may add children to this container or remove them.
  // When a tween adds a child, this code creates a clone of this children list
  // and adds the child to the clone.
  var children = this.children_.lock_();
  var length = children.length;
  for (var i = 0; i < length; ++i) {
    var child = children[i];
    if (child['_off']) {
      child.dirty = createjs.DisplayObject.DIRTY_ALL;
    } else {
      child.updateTweens(time);
      if (child.isVisible()) {
        this.userEvents_ |= child.layout(renderer, this, dirty, time, draw);
      }
    }
  }
  this.children_.unlock_();

  // Inflate parent's bounding box so it contains the bounding box of this
  // object and the ones of its children.
  this.dirty = 0;
  return this.userEvents_;
};

/** @override */
createjs.Container.prototype.getBounds = function() {
  // Calculate the bounding box of its children when this container has never
  // been rendered.
  if (this.getBoundingBox().isEmpty()) {
    var children = this.children_.lock_();
    var minX = 10000;
    var minY = 10000;
    var maxX = -10000;
    var maxY = -10000;
    for (var i = children.length - 1; i >= 0; --i) {
      var child = children[i];
      var bounds = child.getBounds();
      var x = bounds.x + child.getX();
      var y = bounds.y + child.getY();
      minX = createjs.min(minX, x);
      minY = createjs.min(minY, y);
      maxX = createjs.max(maxX, x + bounds.width);
      maxY = createjs.max(maxY, y + bounds.height);
    }
    this.children_.unlock_();
    if (minX > maxX || minY > maxY) {
      return null;
    }
    this.setBoundingBox(minX, minY, maxX, maxY);
  }
  return createjs.Container.superClass_.getBounds.call(this);
};

// Add a getter for applications to access an internal variable.
Object.defineProperties(createjs.Container.prototype, {
  'children': {
    get: createjs.Container.prototype.getChildren
  }
});

// Export the createjs.Container object to the global namespace.
createjs.exportObject('createjs.Container', createjs.Container, {
  // createjs.Container methods
  'addChild': createjs.Container.prototype.addChild,
  'addChildAt': createjs.Container.prototype.addChildAt,
  'removeChild': createjs.Container.prototype.removeChild,
  'removeChildAt': createjs.Container.prototype.removeChildAt,
  'removeAllChildren': createjs.Container.prototype.removeAllChildren,
  'getChildAt': createjs.Container.prototype.getChildAt,
  'getChildByName': createjs.Container.prototype.getChildByName,
  'sortChildren': createjs.Container.prototype.sortChildren,
  'getChildIndex': createjs.Container.prototype.getChildIndex,
  'getNumChildren': createjs.Container.prototype.getNumChildren,
  'swapChildrenAt': createjs.Container.prototype.swapChildrenAt,
  'swapChildren': createjs.Container.prototype.swapChildren,
  'setChildIndex': createjs.Container.prototype.setChildIndex,
  'getObjectsUnderPoint': createjs.Container.prototype.getObjectsUnderPoint,
  'getObjectUnderPoint': createjs.Container.prototype.getObjectUnderPoint,

  // createjs.DisplayObject methods
  'getBounds': createjs.Container.prototype.getBounds

  // createjs.EventDispatcher methods

  // createjs.Object methods.
});
