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

/**
 * An interface enumerating the must-have methods for all classes in this
 * library.
 * @constructor
 */
createjs.Object = function() {
};

/**
 * Copies all properties of this object.
 * @param {createjs.Object} object
 * @return {createjs.Object}
 * @protected
 */
createjs.Object.prototype.copy = function(object) {
  /// <param type="createjs.Object" name="object"/>
  /// <returns type="createjs.Object"/>
  return this;
};

/**
 * Returns a clone of this object.
 * @param {boolean} deep
 * @return {createjs.Object}
 */
createjs.Object.prototype['clone'] = function(deep) {
  /// <param type="boolean" name="deep"/>
  /// <returns type="createjs.Object"/>
  if (createjs.DEBUG) {
    createjs.error('This object does not have the clone() method.');
  }
  return null;
};
