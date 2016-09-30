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
/// <reference path="filter.js"/>
/// <reference path="color.js"/>

/**
 * A class encapsulating a color filter of CreateJS.
 * @param {number=} opt_redMultiplier
 * @param {number=} opt_greenMultiplier
 * @param {number=} opt_blueMultiplier
 * @param {number=} opt_alphaMultiplier
 * @param {number=} opt_redOffset
 * @param {number=} opt_greenOffset
 * @param {number=} opt_blueOffset
 * @param {number=} opt_alphaOffset
 * @extends {createjs.Filter}
 * @constructor
 */
createjs.ColorFilter = function(opt_redMultiplier,
                                opt_greenMultiplier,
                                opt_blueMultiplier,
                                opt_alphaMultiplier,
                                opt_redOffset,
                                opt_greenOffset,
                                opt_blueOffset,
                                opt_alphaOffset) {
  createjs.Filter.call(this, createjs.Filter.Type.COLOR);

  /**
   * The color multiplier.
   * @type {createjs.Color}
   */
  this.multiplier = new createjs.Color(
      (opt_redMultiplier != null) ? opt_redMultiplier : 1,
      (opt_greenMultiplier != null) ? opt_greenMultiplier : 1,
      (opt_blueMultiplier != null) ? opt_blueMultiplier : 1,
      (opt_alphaMultiplier != null) ? opt_alphaMultiplier : 1);

  /**
   * The color offset.
   * @type {createjs.Color}
   */
  this.offset = new createjs.Color(
      opt_redOffset || 0,
      opt_greenOffset || 0,
      opt_blueOffset || 0,
      opt_alphaOffset || 0);
};
createjs.inherits('ColorFilter', createjs.ColorFilter, createjs.Filter);

/**
 * Changes the type of the specified Filter object to createjs.ColorFilter.
 * @param {createjs.Filter} filter
 * @return {createjs.ColorFilter}
 */
createjs.ColorFilter.get = function(filter) {
  /// <param type="createjs.Filter" name="filter"/>
  /// <returns type="createjs.ColorFilter"/>
  return /** @type {createjs.ColorFilter} */ (filter);
};

// Export the createjs.ColorFilter class to the global namespace.
createjs.exportObject('createjs.ColorFilter', createjs.ColorFilter, {
});
