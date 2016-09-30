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
 * Represents a rectangle on a two-dimensional coordinate system.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @extends {createjs.Object}
 * @implements {createjs.Region}
 * @constructor
 */
createjs.Rectangle = function(x, y, width, height) {
  createjs.Object.call(this);

  /**
   * The x position of this rectangle.
   * @type {number}
   */
  this.x = x;

  /**
   * The y position of this rectangle.
   * @type {number}
   */
  this.y = y;

  /**
   * The width of this rectangle.
   * @type {number}
   */
  this.width = width;

  /**
   * The height of this rectangle.
   * @type {number}
   */
  this.height = height;

};
createjs.inherits('Rectangle', createjs.Rectangle, createjs.Object);

/**
 * Initializes all properties.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {createjs.Rectangle}
 */
createjs.Rectangle.prototype.initialize = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="createjs.Rectangle"/>
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  return this;
};

/**
 * Compares this rectangle with the specified one.
 * @param {createjs.Rectangle} rectangle
 * @return {boolean}
 */
createjs.Rectangle.prototype.isEqual = function(rectangle) {
  /// <param type="createjs.Rectangle" name="rectangle"/>
  /// <returns type="boolean"/>
  return this.x == rectangle.x && this.y == rectangle.y &&
      this.width == rectangle.width && this.height == rectangle.height;
};

/** @override */
createjs.Rectangle.prototype.isEmpty = function() {
  /// <returns type="boolean"/>
  return !this.width || !this.height;
};

/** @override */
createjs.Rectangle.prototype.contain = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <returns type="boolean"/>
  return this.x <= x && x <= this.x + this.width &&
      this.y <= y && y <= this.y + this.height;
};

// Export the createjs.Rectangle object to the global namespace.
createjs.exportObject('createjs.Rectangle', createjs.Rectangle, {
  // createjs.Rectangle methods

  // createjs.Object methods.
});
