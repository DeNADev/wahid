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
/// <reference path="region.js"/>

/**
 * A class representing a bounding box.
 * @extends {createjs.Object}
 * @implements {createjs.Region}
 * @constructor
 */
createjs.BoundingBox = function() {
  createjs.Object.call(this);

  /**
   * The array representing this box.
   *   +-------+----------+
   *   | index | property |
   *   +-------+----------+
   *   | 0     | minX     |
   *   | 1     | minY     |
   *   | 2     | maxX     |
   *   | 3     | maxY     |
   *   +-------+----------+
   * @const {Float32Array}
   */
  this.b = createjs.createFloat32Array([10000, 10000, -10000, -10000]);
};
createjs.inherits('BoundingBox', createjs.BoundingBox, createjs.Object);

/**
 * Returns a clone of the specified box.
 * @param {createjs.BoundingBox} box
 * @return {createjs.BoundingBox}
 */
createjs.BoundingBox.clone = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <returns type="createjs.BoundingBox"/>
  var clone = new createjs.BoundingBox();
  clone.b[0] = box.b[0];
  clone.b[1] = box.b[1];
  clone.b[2] = box.b[2];
  clone.b[3] = box.b[3];
  return clone;
};

/**
 * Resets all properties of this object to the initial state.
 * @const
 */
createjs.BoundingBox.prototype.reset = function() {
  this.b[0] = 10000;
  this.b[1] = 10000;
  this.b[2] = -10000;
  this.b[3] = -10000;
};

/**
 * Returns the x position of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getLeft = function() {
  /// <returns type="number"/>
  return this.b[0];
};

/**
 * Returns the y position of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getTop = function() {
  /// <returns type="number"/>
  return this.b[1];
};

/**
 * Returns the width of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getWidth = function() {
  /// <returns type="number"/>
  return this.b[2] - this.b[0];
};

/**
 * Returns the height of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getHeight = function() {
  /// <returns type="number"/>
  return this.b[3] - this.b[1];
};

/**
 * Returns whether this box is an empty one.
 * @param {createjs.BoundingBox} box
 * @return {boolean}
 * @const
 */
createjs.BoundingBox.prototype.isEqual = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <returns type="boolean"/>
  return this.b[0] == box.b[0] && this.b[2] == box.b[2] &&
      this.b[1] == box.b[1] && this.b[3] == box.b[3];
};

/**
 * Updates this bounding box.
 * @param {number} x
 * @param {number} y
 * @const
 */
createjs.BoundingBox.prototype.update = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  this.b[0] = createjs.min(x, this.b[0]);
  this.b[1] = createjs.min(y, this.b[1]);
  this.b[2] = createjs.max(x, this.b[2]);
  this.b[3] = createjs.max(y, this.b[3]);
};

/**
 * Inflates this bounding box.
 * @param {createjs.BoundingBox} box
 * @const
 */
createjs.BoundingBox.prototype.inflate = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  this.b[0] = createjs.min(box.b[0], this.b[0]);
  this.b[1] = createjs.min(box.b[1], this.b[1]);
  this.b[2] = createjs.max(box.b[2], this.b[2]);
  this.b[3] = createjs.max(box.b[3], this.b[3]);
};

/**
 * Adds the specified margin to this box.
 * @param {number} margin
 * @const
 */
createjs.BoundingBox.prototype.addMargin = function(margin) {
  /// <param type="number" name="margin"/>
  this.b[0] -= margin;
  this.b[1] -= margin;
  this.b[2] += margin;
  this.b[3] += margin;
  this.b[2] = this.b[0] + createjs.truncate(this.b[2] - this.b[0]);
  this.b[3] = this.b[1] + createjs.truncate(this.b[3] - this.b[1]);
};

/**
 * Returns whether this box contains the specified one.
 * @param {createjs.BoundingBox} box
 * @return {boolean}
 * @const
 */
createjs.BoundingBox.prototype.containBox = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <returns type="boolean"/>
  createjs.assert(!this.isEmpty() && !box.isEmpty());
  return this.b[0] <= box.b[0] && box.b[2] <= this.b[2] &&
      this.b[1] <= box.b[1] && box.b[3] <= this.b[3];
};

/**
 * Returns whether this box has intersection with the specified one.
 * @param {createjs.BoundingBox} box
 * @return {boolean}
 * @const
 */
createjs.BoundingBox.prototype.hasIntersection = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  /// <returns type="boolean"/>
  // Two convexes have intersection only when there are not any lines in between
  // them separated by a gap as noted by the hyperplane-separation theorem.
  // Especially for two rectangles, their separation axises become an X-axis and
  // a Y-axis. So, these rectangles have intersection when there are not any
  // gaps in their projections both to the X-axis and to the Y-axis.
  var maxMinX = createjs.max(this.b[0], box.b[0]);
  var minMaxX = createjs.min(this.b[2], box.b[2]);
  var maxMinY = createjs.max(this.b[1], box.b[1]);
  var minMaxY = createjs.min(this.b[3], box.b[3]);
  return maxMinX < minMaxX && maxMinY < minMaxY;
};

/**
 * Returns whether this box has intersections with the specified rectangle
 * (0,0)-(width,height). This method is used by a renderer to determine if it
 * needs to redraw its objects.
 * @param {number} width
 * @param {number} height
 * @return {boolean}
 * @const
 */
createjs.BoundingBox.prototype.isDirty = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="boolean"/>
  if (this.isEmpty() ||
      this.b[2] <= 0 || width <= this.b[0] ||
      this.b[3] <= 0 || height <= this.b[1]) {
    return false;
  }
  return true;
};

/**
 * Returns whether this box is a subset of the specified rectangle
 * (0,0)-(width,height). This method is used by a renderer to calculate its
 * clipping rectangle.
 * @param {number} width
 * @param {number} height
 * @return {boolean}
 * @const
 */
createjs.BoundingBox.prototype.needClip = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="boolean"/>
  if (this.b[0] <= 0 && width <= this.b[2] &&
      this.b[1] <= 0 && height <= this.b[3]) {
    return false;
  }
  // Snap this bounding box to a pixel boundary.
  this.b[0] = (this.b[0] <= 0) ? 0 : createjs.floor(this.b[0]);
  this.b[1] = (this.b[1] <= 0) ? 0 : createjs.floor(this.b[1]);
  this.b[2] = createjs.ceil(this.b[2]);
  this.b[3] = createjs.ceil(this.b[3]);
  return true;
};

/** @override */
createjs.BoundingBox.prototype.isEmpty = function() {
  /// <returns type="boolean"/>
  return this.b[2] <= this.b[0];
};

/** @override */
createjs.BoundingBox.prototype.contain = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="boolean"/>
  return this.b[0] <= x && x <= this.b[2] && this.b[1] <= y && y <= this.b[3];
};
