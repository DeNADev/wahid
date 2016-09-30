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

/**
 * A class that encapsulates an alpha-map filter, i.e. a filter that copies the
 * red components of its image to the alpha components of a target object.
 * Applying an alpha-map filter to an <img> element needs an extra <canvas>
 * element, i.e. it consumes so much memory to apply an alpha-map filter to a
 * huge <img> elements (e.g. a sprite sheet, a background image, etc.) that your
 * game becomes more likely to be killed by out-of-memory killers.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @extends {createjs.Filter}
 * @constructor
 */
createjs.AlphaMapFilter = function(image) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  /// </signature>
  createjs.Filter.call(this, createjs.Filter.Type.ALPHA_MAP);

  /**
   * The <img> element representing this alpha map.
   * @type {HTMLImageElement}
   */
  this.image = /** @type {HTMLImageElement} */ (image);
};
createjs.inherits('AlphaMapFilter', createjs.AlphaMapFilter, createjs.Filter);

/**
 * Changes the type of the specified Filter object to createjs.AlphaMapFilter.
 * @param {createjs.Filter} filter
 * @return {createjs.AlphaMapFilter}
 */
createjs.AlphaMapFilter.get = function(filter) {
  /// <param type="createjs.Filter" name="filter"/>
  /// <returns type="createjs.AlphaMapFilter"/>
  return /** @type {createjs.AlphaMapFilter} */ (filter);
};

// Export the createjs.AlphaMapFilter class to the global namespace.
createjs.exportObject('createjs.AlphaMapFilter', createjs.AlphaMapFilter, {
});
