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
 * A class representing an ARGB color.
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {number} alpha
 * @extends {createjs.Object}
 * @constructor
 */
createjs.Color = function(red, green, blue, alpha) {
  /// <param type="number" name="red"/>
  /// <param type="number" name="green"/>
  /// <param type="number" name="blue"/>
  /// <param type="number" name="alpha"/>
  createjs.Object.call(this);

  /**
   * The red component.
   * @type {number}
   */
  this.red_ = red;

  /**
   * The green component.
   * @type {number}
   */
  this.green_ = green;

  /**
   * The blue component.
   * @type {number}
   */
  this.blue_ = blue;

  /**
   * The alpha component.
   * @type {number}
   */
  this.alpha_ = alpha;
};
createjs.inherits('Color', createjs.Color, createjs.Object);

/**
 * Returns the red component of this color.
 * @return {number}
 * @const
 */
createjs.Color.prototype.getRed = function() {
  /// <returns type="number"/>
  return this.red_;
};

/**
 * Returns the green component of this color.
 * @return {number}
 * @const
 */
createjs.Color.prototype.getGreen = function() {
  /// <returns type="number"/>
  return this.green_;
};

/**
 * Returns the blue component of this color.
 * @return {number}
 * @const
 */
createjs.Color.prototype.getBlue = function() {
  /// <returns type="number"/>
  return this.blue_;
};

/**
 * Returns the alpha component of this color.
 * @return {number}
 * @const
 */
createjs.Color.prototype.getAlpha = function() {
  /// <returns type="number"/>
  return this.alpha_;
};

/**
 * Copies the specified color to this color.
 * @param {createjs.Color} color
 * @const
 */
createjs.Color.prototype.copyColor = function(color) {
  /// <param type="createjs.Color" name="color"/>
  this.red_ = color.red_;
  this.green_ = color.green_;
  this.blue_ = color.blue_;
  this.alpha_ = color.alpha_;
};

/**
 * Adds the specified color with this color.
 * @param {createjs.Color} color
 * @const
 */
createjs.Color.prototype.addColor = function(color) {
  /// <param type="createjs.Color" name="color"/>
  this.red_ += color.red_;
  this.green_ += color.green_;
  this.blue_ += color.blue_;
  this.alpha_ += color.alpha_;
};

/**
 * Multiplies the specified color with this color.
 * @param {createjs.Color} color
 * @const
 */
createjs.Color.prototype.multiplyColor = function(color) {
  /// <param type="createjs.Color" name="color"/>
  this.red_ *= color.red_;
  this.green_ *= color.green_;
  this.blue_ *= color.blue_;
  this.alpha_ *= color.alpha_;
};
