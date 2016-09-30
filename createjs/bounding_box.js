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
  clone.minX = box.minX;
  clone.minY = box.minY;
  clone.maxX = box.maxX;
  clone.maxY = box.maxY;
  return clone;
};

/**
 * The left position of this bounding box.
 * @type {number}
 */
createjs.BoundingBox.prototype.minX = 10000;

/**
 * The top position of this bounding box.
 * @type {number}
 */
createjs.BoundingBox.prototype.minY = 10000;

/**
 * The right position of this bounding box.
 * @type {number}
 */
createjs.BoundingBox.prototype.maxX = -10000;

/**
 * The bottom position of this bounding box.
 * @type {number}
 */
createjs.BoundingBox.prototype.maxY = -10000;

/**
 * Resets all properties of this object to the initial state.
 * @const
 */
createjs.BoundingBox.prototype.reset = function() {
  this.minX = 10000;
  this.minY = 10000;
  this.maxX = -10000;
  this.maxY = -10000;
};

/**
 * Returns the x position of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getLeft = function() {
  /// <returns type="number"/>
  return this.minX;
};

/**
 * Returns the y position of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getTop = function() {
  /// <returns type="number"/>
  return this.minY;
};

/**
 * Returns the width of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getWidth = function() {
  /// <returns type="number"/>
  return this.maxX - this.minX;
};

/**
 * Returns the height of this bounding box.
 * @return {number}
 * @const
 */
createjs.BoundingBox.prototype.getHeight = function() {
  /// <returns type="number"/>
  return this.maxY - this.minY;
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
  return this.minX == box.minX && this.maxX == box.maxX &&
      this.minY == box.minY && this.maxY == box.maxY;
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
  this.minX = createjs.min(x, this.minX);
  this.minY = createjs.min(y, this.minY);
  this.maxX = createjs.max(x, this.maxX);
  this.maxY = createjs.max(y, this.maxY);
};

/**
 * Inflates this bounding box.
 * @param {createjs.BoundingBox} box
 * @const
 */
createjs.BoundingBox.prototype.inflate = function(box) {
  /// <param type="createjs.BoundingBox" name="box"/>
  this.minX = createjs.min(box.minX, this.minX);
  this.minY = createjs.min(box.minY, this.minY);
  this.maxX = createjs.max(box.maxX, this.maxX);
  this.maxY = createjs.max(box.maxY, this.maxY);
};

/**
 * Adds the specified margin to this box.
 * @param {number} margin
 * @const
 */
createjs.BoundingBox.prototype.addMargin = function(margin) {
  /// <param type="number" name="margin"/>
  this.minX -= margin;
  this.minY -= margin;
  this.maxX += margin;
  this.maxY += margin;
  this.maxX = this.minX + createjs.truncate(this.maxX - this.minX);
  this.maxY = this.minY + createjs.truncate(this.maxY - this.minY);
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
  return this.minX <= box.minX && box.maxX <= this.maxX &&
      this.minY <= box.minY && box.maxY <= this.maxY;
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
  var maxMinX = createjs.max(this.minX, box.minX);
  var minMaxX = createjs.min(this.maxX, box.maxX);
  var maxMinY = createjs.max(this.minY, box.minY);
  var minMaxY = createjs.min(this.maxY, box.maxY);
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
      this.maxX <= 0 || width <= this.minX ||
      this.maxY <= 0 || height <= this.minY) {
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
  if (this.minX <= 0 && width <= this.maxX &&
      this.maxY <= 0 && height <= this.maxY) {
    return false;
  }
  // Snap this bounding box to a pixel boundary.
  this.minX = (this.minX <= 0) ? 0 : createjs.floor(this.minX);
  this.minY = (this.minY <= 0) ? 0 : createjs.floor(this.minY);
  this.maxX = createjs.ceil(this.maxX);
  this.maxY = createjs.ceil(this.maxY);
  return true;
};

/** @override */
createjs.BoundingBox.prototype.isEmpty = function() {
  /// <returns type="boolean"/>
  return this.maxX <= this.minX;
};

/** @override */
createjs.BoundingBox.prototype.contain = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="boolean"/>
  return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
};
