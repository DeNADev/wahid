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
 * Represents a point on a two-dimensional coordinate system.
 * @param {number} x
 * @param {number} y
 * @extends {createjs.Object}
 * @constructor
 */
createjs.Point = function(x, y) {
  createjs.Object.call(this);

  /**
   * The two-dimensional vector representing this point.
   *   +-------+----------+
   *   | index | property |
   *   +-------+----------+
   *   | 0     | x        |
   *   | 1     | y        |
   *   +-------+----------+
   * @const {Float32Array}
   */
  this.v = createjs.cloneFloat32Array([x, y]);
};
createjs.inherits('Point', createjs.Point, createjs.Object);

/**
 * Retrieves the horizontal position.
 * @return {number}
 * @const
 */
createjs.Point.prototype.getX = function() {
  /// <returns type="number"/>
  return this.v[0];
};

/**
 * Sets the horizontal position.
 * @param {number} x
 * @const
 */
createjs.Point.prototype.setX = function(x) {
  /// <param type="number" name="x"/>
  this.v[0] = x;
};

/**
 * Retrieves the vertical position.
 * @return {number}
 * @const
 */
createjs.Point.prototype.getY = function() {
  /// <returns type="number"/>
  return this.v[1];
};

/**
 * Sets the vertical position.
 * @param {number} y
 * @const
 */
createjs.Point.prototype.setY = function(y) {
  /// <param type="number" name="y"/>
  this.v[1] = y;
};

// Add getters and setters for applications to access internal variables.
Object.defineProperties(createjs.Point.prototype, {
  'x': {
    get: createjs.Point.prototype.getX,
    set: createjs.Point.prototype.setX
  },
  'y': {
    get: createjs.Point.prototype.getY,
    set: createjs.Point.prototype.setY
  }
});
