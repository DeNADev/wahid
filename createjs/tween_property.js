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
};

/**
 * The start value (when this property is a number property).
 * @type {number}
 * @private
 */
createjs.TweenProperty.prototype.startNumber_ = 0;

/**
 * The end value (when this property is a number property).
 * @type {number}
 * @private
 */
createjs.TweenProperty.prototype.endNumber_ = 0;

/**
 * The difference between the start value and the end value.
 * @type {number}
 * @private
 */
createjs.TweenProperty.prototype.stepNumber_ = 0;

/**
 * The start value (when this property is a string property).
 * @type {string}
 * @private
 */
createjs.TweenProperty.prototype.startText_ = '';

/**
 * The end value (when this property is a string property).
 * @type {string}
 * @private
 */
createjs.TweenProperty.prototype.endText_ = '';

/**
 * The start value (when this property is a createjs.Graphics property).
 * @type {createjs.Graphics}
 * @private
 */
createjs.TweenProperty.prototype.startGraphics_ = null;

/**
 * The end value (when this property is a createjs.Graphics property).
 * @type {createjs.Graphics}
 * @private
 */
createjs.TweenProperty.prototype.endGraphics_ = null;

/**
 * Returns the end value in number.
 * @return {number}
 * @const
 */
createjs.TweenProperty.prototype.getEndNumber = function() {
  /// <returns type="number"/>
  return this.endNumber_;
}

/**
 * Returns the end value in string.
 * @return {string}
 * @const
 */
createjs.TweenProperty.prototype.getEndText = function() {
  /// <returns type="string"/>
  return this.endText_;
}

/**
 * Returns the end value in createjs.Graphics object.
 * @return {createjs.Graphics}
 * @const
 */
createjs.TweenProperty.prototype.getEndGraphics = function() {
  /// <returns type="createjs.Graphics"/>
  return this.endGraphics_;
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
  return this.startNumber_ + ratio * this.stepumber_;
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
  this.startNumber_ = start;
  this.endNumber_ = end;
  this.stepumber_ = end - start;
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
  return ratio == 1 ? this.endNumber_ : this.startNumber_;
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
  this.startNumber_ = start;
  this.endNumber_ = end;
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
  this.startNumber_ = start;
  var INDEPENDENT = 0;
  var SINGLE = 1;
  var SYNCHED = 2;
  this.endNumber_ = (end == 'single') ? SINGLE :
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
  return ratio == 1 ? this.endText_ : this.startText_;
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
  this.startText_ = start;
  this.endText_ = end;
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
  return ratio == 1 ? this.endGraphics_ : this.startGraphics_;
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
  this.startGraphics_ = start;
  this.endGraphics_ = end;
};
