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
/// <reference path="rectangle.js"/>

/**
 * A base class for all filters. (This library uses a shader program to apply
 * filters and this class is just for emulating CreateJS.)
 * @param {number} type
 * @extends {createjs.Object}
 * @constructor
 */
createjs.Filter = function(type) {
  /// <param type="number" name="type"/>
  createjs.Object.call(this);

  /**
   * The type of this filter.
   * @const {number}
   * @private
   */
  this.type_ = type;
};
createjs.inherits('Filter', createjs.Filter, createjs.Object);

/**
 * Known filters.
 * @enum {number}
 */
createjs.Filter.Type = {
  ALPHA_MAP: 0,
  ALPHA_MASK: 1,
  BLUR: 2,
  COLOR: 3,
  COLOR_MATRIX: 4
};

/**
 * Returns the type of this filter.
 * @return {number}
 */
createjs.Filter.prototype.getType = function() {
  /// <returns type="number"/>
  return this.type_;
};

/**
 * Returns a rectangle required to draw this filter or null. (This library does
 * not use this method.)
 * @return {createjs.Rectangle}
 */
createjs.Filter.prototype.getBounds = function() {
  /// <returns type="createjs.Rectangle"/>
  createjs.notReached();
  return null;
};

/**
 * Applies this filter to the specified context. (This library does not use this
 * method.)
 * @param {CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @return {boolean}
 */
createjs.Filter.prototype.applyFilter = function(context, x, y, width, height) {
  /// <param type="CanvasRenderingContext2D" name="context"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <returns type="boolean"/>
  createjs.notReached();
  return false;
};

// Export the createjs.Filter class to the global namespace.
createjs.exportObject('createjs.Filter', createjs.Filter, {
  // createjs.Filter methods
  'getBounds': createjs.Filter.prototype.getBounds,
  'applyFilter': createjs.Filter.prototype.applyFilter

  // createjs.Object methods
});
