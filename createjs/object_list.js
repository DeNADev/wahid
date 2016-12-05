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
/// <reference path="object.js"/>

/**
 * A class that encapsulates an array that is safe to be modified in a loop. It
 * is not safe to modify an array in a loop, e.g. the following loop does not
 * iterate the second item 'b'.
 *
 *   var list = ['a', 'b', 'c'];
 *   for (var i = 0; i < list.length; ++i) {
 *     console.log(list[i]);
 *     if (list[i] == 'a') {
 *       list.splice(i, 1);
 *     }
 *   }
 *
 * Even though iterating a clone solves this problem, it is an overkill to
 * create a clone every time when an application iterates an array.
 *
 *   var list = ['a', 'b', 'c'];
 *   var clone = list.slice();
 *   for (var i = 0; i < clone.length; ++i) {
 *     console.log(clone[i]);
 *     if (clone[i] == 'a') {
 *       list.splice(i, 1);
 *     }
 *   }
 *
 * This class lazily creates a clone of its array for the first time when an
 * application either adds an item to the array or removes one in a loop.
 *
 *   var list = object_list.lock();
 *   for (var i = 0; i < list.length; ++i) {
 *     console.log(list[i]);
 *     if (list[i] == 'a') {
 *       object_list.removeItemAt(i);
 *     }
 *   }
 *   object_list.unlock();
 *
 * @constructor
 */
createjs.ObjectList = function() {
  /**
   * A list of objects.
   * @type {Array.<*>}
   */
  this.items_ = [];
};

/**
 * A list of objects.
 * @type {Array.<createjs.Object>}
 */
createjs.ObjectList.prototype.items_ = null;

/**
 * A clone of the list while this list is locked.
 * @type {Array.<*>}
 */
createjs.ObjectList.prototype.clone_ = null;

/**
 * Whether this list is locked.
 * @type {boolean}
 */
createjs.ObjectList.prototype.locked_ = false;

/**
 * Retrieves the editable items of this list.
 * @return {Array.<*>}
 * @protected
 */
createjs.ObjectList.prototype.getItems = function() {
  /// <returns type="Array"/>
  if (!this.locked_) {
    return this.items_;
  }
  if (!this.clone_) {
    this.clone_ = this.items_.slice();
  }
  return this.clone_;
};

/**
 * Returns whether this list is locked.
 * @return {boolean}
 * @protected
 */
createjs.ObjectList.prototype.isLocked = function() {
  /// <returns type="boolean"/>
  return this.locked_;
};

/**
 * Returns the number of items in this list.
 * @return {number}
 * @const
 */
createjs.ObjectList.prototype.getLength = function() {
  /// <returns type="number"/>
  return this.items_.length;
};

/**
 * Locks this list for iteration. This method changes the state of this list to
 * 'locked' to apply succeeding add operations and remove ones to its clone.
 * @return {Array.<*>}
 * @const
 */
createjs.ObjectList.prototype.lock = function() {
  /// <returns type="Array"/>
  createjs.assert(!this.locked_);
  this.locked_ = true;
  return this.items_;
};

/**
 * Unlocks this list. This method changes the stage of this list to 'unlocked'
 * and copies its clone if an application edits the list while it is locked.
 * @const
 */
createjs.ObjectList.prototype.unlock = function() {
  createjs.assert(this.locked_);
  this.locked_ = false;
  if (this.clone_) {
    this.items_ = this.clone_;
    this.clone_ = null;
  }
};

/**
 * Adds an item to the beginning of this list.
 * @param {*} item
 * @const
 */
createjs.ObjectList.prototype.unshiftItem = function(item) {
  /// <param name="item"/>
  var list = this.getItems();
  list.unshift(item);
};

/**
 * Adds an item to the end of this list.
 * @param {*} item
 * @const
 */
createjs.ObjectList.prototype.pushItem = function(item) {
  /// <param name="item"/>
  var list = this.getItems();
  list.push(item);
};

/**
 * Adds an item to the specified position of this list.
 * @param {number} index
 * @param {*} item
 * @const
 */
createjs.ObjectList.prototype.insertItem = function(index, item) {
  /// <param type="number" name="index"/>
  /// <param name="item"/>
  var list = this.getItems();
  list.splice(index, 0, item);
};

/**
 * Removes an item from this list.
 * @param {*} item
 * @const
 */
createjs.ObjectList.prototype.removeItem = function(item) {
  /// <param name="item"/>
  var list = this.getItems();
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === item) {
      list.splice(i, 1);
      return;
    }
  }
};

/**
 * Finds an item from this list.
 * @param {*} item
 * @return {number}
 * @const
 */
createjs.ObjectList.prototype.findItem = function(item) {
  /// <param name="item"/>
  /// <returns type="number"/>
  var list = this.getItems();
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === item) {
      return i;
    }
  }
  return -1;
};

/**
 * Adds an item to the end of this list only if this list does not have it.
 * @param {*} item
 * @const
 */
createjs.ObjectList.prototype.pushUniqueItem = function(item) {
  /// <param name="item"/>
  var list = this.getItems();
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === item) {
      return;
    }
  }
  list.push(item);
};

/**
 * Swaps two items in this list.
 * @param {*} item1
 * @param {*} item2
 * @const
 */
createjs.ObjectList.prototype.swapItems = function(item1, item2) {
  /// <param name="item1"/>
  /// <param name="item2"/>
  var list = this.getItems();
  var index1 = -1;
  var index2 = -1;
  for (var i = 0; i < list.length; ++i) {
    var item = list[i];
    if (item === item1) {
      index1 = i;
    } else if (item === item2) {
      index2 = i;
    }
    if (index1 >= 0 && index2 >= 0) {
      list[index1] = item2;
      list[index2] = item1;
      return;
    }
  }
};

/**
 * Returns an item at the specified index.
 * @param {number} index
 * @return {*}
 * @const
 */
createjs.ObjectList.prototype.getItemAt = function(index) {
  /// <param type="number" name="index"/>
  /// <returns type="Object"/>
  var list = this.getItems();
  return list[index];
};

/**
 * Removes an item from this list.
 * @param {number} index
 * @const
 */
createjs.ObjectList.prototype.removeItemAt = function(index) {
  /// <param type="number" name="index"/>
  var list = this.getItems();
  list.splice(index, 1);
};

/**
 * Finds an item from this list.
 * @param {number} index1
 * @param {number} index2
 * @const
 */
createjs.ObjectList.prototype.swapItemsAt = function(index1, index2) {
  /// <param type="number" name="index1"/>
  /// <param type="number" name="index2"/>
  var list = this.getItems();
  if (index1 >= list.length || index2 >= list.length) {
    return;
  }
  var object1 = list[index1];
  var object2 = list[index2];
  list[index1] = object2;
  list[index2] = object1;
};

/**
 * Removes all items from this list.
 * @const
 */
createjs.ObjectList.prototype.removeAllItems = function() {
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
createjs.ObjectList.prototype.cloneItems = function() {
  /// <returns type="Array"/>
  var items = this.clone_ ? this.clone_ : this.items_;
  return items.slice();
};
