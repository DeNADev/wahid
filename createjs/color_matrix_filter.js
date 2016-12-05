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
/// <reference path="color_matrix.js"/>
/// <reference path="filter.js"/>

/**
 * A class encapsulating a color-matrix filter of CreateJS.
 * @param {createjs.ColorMatrix} matrix
 * @extends {createjs.Filter}
 * @constructor
 */
createjs.ColorMatrixFilter = function(matrix) {
  createjs.Filter.call(this, createjs.Filter.Type.COLOR_MATRIX);

  /**
   * The color matrix used by this filter.
   * @type {createjs.ColorMatrix}
   * @private
   */
  this.matrix_ = matrix;
};
createjs.inherits('ColorMatrixFilter',
                  createjs.ColorMatrixFilter,
                  createjs.Filter);

/**
 * The color matrix used by this filter.
 * @type {createjs.ColorMatrix}
 * @private
 */
createjs.ColorMatrixFilter.prototype.matrix_ = null;

/**
 * Changes the type of the specified Filter object to createjs.ColorFilter.
 * @param {createjs.Filter} filter
 * @return {createjs.ColorMatrixFilter}
 */
createjs.ColorMatrixFilter.get = function(filter) {
  /// <param type="createjs.Filter" name="filter"/>
  /// <returns type="createjs.ColorMatrixFilter"/>
  return /** @type {createjs.ColorMatrixFilter} */ (filter);
};

/**
 * Returns the color matrix as an array.
 * @return {Array.<number>}
 */
createjs.ColorMatrixFilter.prototype.getMatrix = function() {
  /// <returns type="Array" elementType="number"/>
  return this.matrix_.toArray();
};

// Export the createjs.ColorMatrixFilter class to the global namespace.
createjs.exportObject('createjs.ColorMatrixFilter',
                      createjs.ColorMatrixFilter, {
});
