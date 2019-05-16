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
/// <reference path="graphics.js"/>

/**
 * A class that encapsulates a property changed by a motion. A motion changes
 * four types of properties: number, boolean, string, and Object. This class
 * treats a boolean property as a number one.
 * @constructor
 */
createjs.TweenProperty = function() {
  /**
   * The values of this property when it is a number property or a boolean one.
   *   +-------+----------+
   *   | index | property |
   *   +-------+----------+
   *   | 0     | start    |
   *   | 1     | end      |
   *   | 2     | step     |
   *   +-------+----------+
   * @type {Float32Array}
   * @private
   */
  this.numbers_ = createjs.cloneFloat32Array([0, 0, 0]);
};

/**
 * The values of this property when it is a string property.
 * @type {Array.<string>}
 * @private
 */
createjs.TweenProperty.prototype.texts_ = null;

/**
 * The values of this property when it is a createjs.Graphics property.
 * @type {Array.<createjs.Graphics>}
 * @private
 */
createjs.TweenProperty.prototype.graphics_ = null;

/**
 * Returns the end value in number.
 * @return {number}
 * @const
 */
createjs.TweenProperty.prototype.getEndNumber = function() {
  /// <returns type="number"/>
  return this.numbers_[1];
}

/**
 * Returns the end value in string.
 * @return {string}
 * @const
 */
createjs.TweenProperty.prototype.getEndText = function() {
  /// <returns type="string"/>
  return this.texts_[1];
}

/**
 * Returns the end value in createjs.Graphics object.
 * @return {createjs.Graphics}
 * @const
 */
createjs.TweenProperty.prototype.getEndGraphics = function() {
  /// <returns type="createjs.Graphics"/>
  return this.graphics_[1];
}

/**
 * Returns the interpolated value in number.
 * @param {number} ratio
 * @return {number}
 * @const
 */
createjs.TweenProperty.prototype.getNumber = function(ratio) {
  /// <param type="number" name="ratio"/>
  /// <returns type="number"/>
  return this.numbers_[0] + ratio * this.numbers_[2];
};

/**
 * Sets the values of this property.
 * @param {number} start
 * @param {number} end
 * @const
 */
createjs.TweenProperty.prototype.setNumber = function(start, end) {
  /// <param type="number" name="start"/>
  /// <param type="number" name="end"/>
  this.numbers_[0] = start;
  this.numbers_[1] = end;
  this.numbers_[2] = end - start;
};

/**
 * Returns the interpolated value in boolean.
 * @param {number} ratio
 * @return {number}
 * @const
 */
createjs.TweenProperty.prototype.getBinary = function(ratio) {
  /// <param type="number" name="ratio"/>
  /// <returns type="number"/>
  return this.numbers_[createjs.truncate(ratio)];
};

/**
 * Sets the values of this property.
 * @param {number} start
 * @param {number} end
 * @const
 */
createjs.TweenProperty.prototype.setBinary = function(start, end) {
  /// <param type="number" name="start"/>
  /// <param type="number" name="end"/>
  this.numbers_[0] = start;
  this.numbers_[1] = end;
};

/**
 * Sets the values of this property.
 * @param {number} start
 * @param {string} end
 * @const
 */
createjs.TweenProperty.prototype.setPlayMode = function(start, end) {
  /// <param type="number" name="start"/>
  /// <param type="string" name="end"/>
  this.numbers_[0] = start;
  var INDEPENDENT = 0;
  var SINGLE = 1;
  var SYNCHED = 2;
  this.numbers_[1] = (end == 'single') ? SINGLE :
      ((end == 'synched') ? SYNCHED : INDEPENDENT);
};

/**
 * Returns the interpolated value in string.
 * @param {number} ratio
 * @return {string}
 * @const
 */
createjs.TweenProperty.prototype.getText = function(ratio) {
  /// <param type="number" name="ratio"/>
  /// <returns type="string"/>
  return this.texts_[createjs.truncate(ratio)];
};

/**
 * Sets the values of this property.
 * @param {string} start
 * @param {string} end
 * @const
 */
createjs.TweenProperty.prototype.setText = function(start, end) {
  /// <param type="string" name="start"/>
  /// <param type="string" name="end"/>
  this.texts_ = [start, end];
};

/**
 * Returns the interpolated value in createjs.Graphics.
 * @param {number} ratio
 * @return {createjs.Graphics}
 * @const
 */
createjs.TweenProperty.prototype.getGraphics = function(ratio) {
  /// <param type="number" name="ratio"/>
  /// <returns type="createjs.Graphics"/>
  return this.graphics_[createjs.truncate(ratio)];
};

/**
 * Sets the values of this property.
 * @param {createjs.Graphics} start
 * @param {createjs.Graphics} end
 * @const
 */
createjs.TweenProperty.prototype.setGraphics = function(start, end) {
  /// <param type="createjs.Graphics" name="start"/>
  /// <param type="createjs.Graphics" name="end"/>
  this.graphics_ = [start, end];
};
