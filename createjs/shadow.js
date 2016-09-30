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
 * A class representing a set of properties used for rendering a shadow.
 * @param {string} color The color of the shadow.
 * @param {number} offsetX The x offset of the shadow in pixels.
 * @param {number} offsetY The y offset of the shadow in pixels.
 * @param {number} blur The size of the blurring effect.
 * @extends {createjs.Object}
 * @constructor
 */
createjs.Shadow = function(color, offsetX, offsetY, blur) {
  createjs.Object.call(this);

  /**
   * The color of the shadow.
   * @type {string}
   */
  this.color = color;

  /**
   * The x offset of the shadow.
   * @type {number}
   */
  this.offsetX = offsetX;

  /**
   * The y offset of the shadow.
   * @type {number}
   */
  this.offsetY = offsetY;

  /**
   * The blur of the shadow.
   * @type {number}
   */
  this.blur = blur;
};
createjs.inherits('Shadow', createjs.Shadow, createjs.Object);

// Export the createjs.Shadow object to the global namespace.
createjs.exportObject('createjs.Shadow', createjs.Shadow, {
});
