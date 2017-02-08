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
/// <reference path="bounding_box.js"/>
/// <reference path="point.js"/>

/**
 * A class that represents an affine transformation compatible with the one used
 * by the CanvasRenderingContext2D interface, i.e. a 3x3 matrix listed below:
 *   | a c tx |
 *   | b d ty |
 *   | 0 0 1  |
 * @constructor
 */
createjs.Transform = function() {
};

/**
 * A flag representing this transformation has scale factors not equal to one,
 * i.e. this.a != 1 or this.d != 1.
 * @const {number}
 * @protected
 */
createjs.Transform.DIRTY_SCALE = (1 << 0);

/**
 * A flag representing this transformation has non-zero skew factors, i.e.
 * this.b != 0 or this.c != 0.
 * @const {number}
 * @protected
 */
createjs.Transform.DIRTY_SKEW = (1 << 1);

/**
 * A flag representing the type of this transformation.
 * @type {number}
 * @private
 */
createjs.Transform.prototype.dirty_ = 0;

/**
 * The horizontal scale.
 * @type {number}
 */
createjs.Transform.prototype.a = 1;

/**
 * The horizontal skew.
 * @type {number}
 */
createjs.Transform.prototype.b = 0;

/**
 * The vertical skew.
 * @type {number}
 */
createjs.Transform.prototype.c = 0;

/**
 * The vertical scale.
 * @type {number}
 */
createjs.Transform.prototype.d = 1;

/**
 * The horizontal translation.
 * @type {number}
 */
createjs.Transform.prototype.tx = 0;

/**
 * The vertical translation.
 * @type {number}
 */
createjs.Transform.prototype.ty = 0;

/**
 * Whether this transform is invertible.
 * @type {number}
 */
createjs.Transform.prototype.invertible = 1;

/**
 * Prepends the specified transform with this transform. This method multiplies
 * this transformation matrix with the specified one as listed in the following
 * formula.
 *   a0 = transform.a, b0 = transform.b, c0 = transform.c, d0 = transform.d,
 *   tx0 = transform.tx, ty0 = transfor.ty,
 *   a = this.a, b = this.b, c = this.c, d = this.d, tx = this.tx, ty = this.ty.
 *   | a0 c0 tx0 |   | a c tz |
 *   | b0 d0 ty0 | * | b d ty |
 *   | 0  0  1   |   | 0 0 1  |
 *       | a0*a+c0*b a0*c+c0*d a0*tx+c0*ty+tx0 |
 *     = | b0*a+d0*b b0*c+d0*d b0*tx+d0*ty+ty0 |
 *       | 0         0         1               |
 * @param {createjs.Transform} transform
 * @private
 */
createjs.Transform.prototype.prepend_ = function(transform) {
  /// <param type="createjs.Transform" name="transform"/>
  var a = this.a;
  var b = this.b;
  var c = this.c;
  var d = this.d;
  var tx = this.tx;
  var ty = this.ty;
  if (!this.dirty_) {
    // Copy the parent transform (including its dirty flag) to this transform
    // when this transform is an identity one. (A dirty flag will be used in
    // calculating a bounding box.)
    this.a = transform.a;
    this.b = transform.b;
    this.c = transform.c;
    this.d = transform.d;
    this.invertible = transform.invertible;
    this.dirty_ = transform.dirty_;
  } else {
    this.a = transform.a * a + transform.c * b;
    this.b = transform.b * a + transform.d * b;
    this.c = transform.a * c + transform.c * d;
    this.d = transform.b * c + transform.d * d;
    this.invertible = (this.a * this.d - this.b * this.c) ? 1 : 0;
  }
  this.tx = transform.a * tx + transform.c * ty + transform.tx;
  this.ty = transform.b * tx + transform.d * ty + transform.ty;
};

/**
 * Generates matrix properties from transform properties used by display
 * objects, and appends them with this matrix.
 * @param {createjs.Point} position
 * @param {createjs.Point} scale
 * @param {number} rotation
 * @param {createjs.Point} skew
 * @param {createjs.Point} registration
 * @const
 */
createjs.Transform.prototype.set =
    function(position, scale, rotation, skew, registration) {
  /// <param type="createjs.Point" name="position"/>
  /// <param type="createjs.Point" name="scale"/>
  /// <param type="number" name="rotation"/>
  /// <param type="createjs.Point" name="skew"/>
  /// <param type="createjs.Point" name="registration"/>

  // Create a scale matrix.
  //   | a c 0 |   | scale.x 0       0 |
  //   | b d 0 | = | 0       scale.y 0 |
  //   | 0 0 1 |   | 0       0       1 |
  var a = scale.x;
  var b = 0;
  var c = 0;
  var d = scale.y;
  this.dirty_ = (a != 1 || d != 1) ? createjs.Transform.DIRTY_SCALE : 0;
  if (rotation) {
    // Multiply a rotation matrix with a scale one as listed in the following
    // formula.
    //   | a c 0 |   | cos(r) -sin(r) 0 |   | a 0 0 |
    //   | b d 0 | = | sin(r) cos(r)  0 | * | 0 d 0 |
    //   | 0 0 1 |   | 0      0       1 |   | 0 0 1 |
    //               | cos(r)*a -sin(r)*d 0 |
    //             = | sin(r)*a cos(r)*d  0 |
    //               | 0        0         1 |
    var cos = createjs.cos(rotation);
    var sin = createjs.sin(rotation);
    b = sin * a;
    c = -sin * d;
    a = cos * a;
    d = cos * d;
    this.dirty_ |= createjs.Transform.DIRTY_SKEW;
  }
  if (skew.x || skew.y) {
    // Multiply a skew matrix with a rotation one as listed in the following
    // formula.
    //   | a c 0 |   | cos(sy) -sin(sx) 0 |   | a c 0 |
    //   | b d 0 | = | sin(sy) cos(sx)  0 | * | b d 0 |
    //   | 0 0 1 |   | 0       0        1 |   | 0 0 1 |
    //               | cos(sy)*a-sin(sx)*b cos(sy)*c-sin(sx)*d 0 |
    //             = | sin(sy)*a+cos(sx)*b sin(sy)*c+cos(sx)*d 0 |
    //               | 0                   0                   1 |
    var a0 = createjs.cos(skew.y);
    var b0 = createjs.sin(skew.y);
    var c0 = -createjs.sin(skew.x);
    var d0 = createjs.cos(skew.x);
    var a1 = a;
    var b1 = b;
    var c1 = c;
    var d1 = d;
    a = a0 * a1 + c0 * b1;
    b = b0 * a1 + d0 * b1;
    c = a0 * c1 + c0 * d1;
    d = b0 * c1 + d0 * d1;
    this.dirty_ |= createjs.Transform.DIRTY_SKEW;
  }
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;
  this.tx = position.x;
  this.ty = position.y;
  if (registration.x || registration.y) {
    this.tx -= registration.x * this.a + registration.y * this.c;
    this.ty -= registration.x * this.b + registration.y * this.d;
  }
};

/**
 * Copies the specified transform.
 * @param {createjs.Transform} transform
 * @const
 */
createjs.Transform.prototype.copyTransform = function(transform) {
  /// <param type="createjs.Transform" name="transform"/>
  this.a = transform.a;
  this.b = transform.b;
  this.c = transform.c;
  this.d = transform.d;
  this.tx = transform.tx;
  this.ty = transform.ty;
  this.invertible = transform.invertible;
  this.dirty_ = transform.dirty_;
};

/**
 * Generates matrix properties from transform properties used by display
 * objects, and appends them with this matrix.
 * @param {createjs.Transform} transform
 * @param {createjs.Point} position
 * @param {createjs.Point} scale
 * @param {number} rotation
 * @param {createjs.Point} skew
 * @param {createjs.Point} registration
 * @const
 */
createjs.Transform.prototype.appendTransform =
    function(transform, position, scale, rotation, skew, registration) {
  /// <param type="createjs.Transform" name="transform"/>
  /// <param type="createjs.Point" name="position"/>
  /// <param type="createjs.Point" name="scale"/>
  /// <param type="number" name="rotation"/>
  /// <param type="createjs.Point" name="skew"/>
  /// <param type="createjs.Point" name="registration"/>
  this.set(position, scale, rotation, skew, registration);
  this.prepend_(transform);
};

/**
 * Returns an inverse transformation of this transformation.
 * @return {createjs.Transform}
 * @const
 */
createjs.Transform.prototype.getInverse = function() {
  /// <returns type="createjs.Transform"/>
  if (!this.invertible) {
    return null;
  }
  var idet = 1 / (this.a * this.d - this.b * this.c);
  var transform = new createjs.Transform();
  transform.a = this.d * idet;
  transform.b = -this.b * idet;
  transform.c = -this.c * idet;
  transform.d = this.a * idet;
  transform.tx = (this.c * this.ty - this.d * this.tx) * idet;
  transform.ty = -(this.a * this.ty - this.b * this.tx) * idet;
  return transform;
};

/**
 * Applies this transformation to the specified point and returns the
 * transformed point as listed in the following formula.
 *   | x' |   | a c tx |   | x |
 *   | y' | = | b d ty | * | y |
 *   | 1  |   | 0 0 1  |   | 1 |
 *            | a*x+c*y+tx |
 *          = | b*x+d*y+ty |
 *            | 1          |
 * This method is used for converting a point in a local coordinate to a point
 * in the global coordinate, and vice versa.
 * @param {createjs.Point} point
 * @return {createjs.Point}
 * @const
 */
createjs.Transform.prototype.transformPoint = function(point) {
  /// <param type="createjs.Point" name="point"></param>
  /// <returns type="createjs.Point"/>
  var x = point.x;
  var y = point.y;
  point.x = this.a * x + this.c * y + this.tx;
  point.y = this.b * x + this.d * y + this.ty;
  return point;
};

/**
 * Transforms a bounding box in the coordinate system of the owner object to a
 * box in the global coordinate system, which is used by the createjs.Renderer
 * interface. This method applies an affine transformation to the corner points
 * of the given box to get their global positions to create its transformed
 * bounding box.
 * @param {createjs.BoundingBox} box
 * @param {createjs.BoundingBox} output
 * @protected
 * @const
 */
createjs.Transform.prototype.transformBox = function(box, output) {
  /// <param type="createjs.BoundingBox" name="box"></param>
  /// <param type="createjs.BoundingBox" name="output"></param>
  var minX = box.minX;
  var minY = box.minY;
  var maxX = box.maxX;
  var maxY = box.maxY;
  if ((this.dirty_ & createjs.Transform.DIRTY_SKEW) == 0) {
    // This transform does not have skew factors and we can transform just the
    // top-left corner and the bottom-right one to get its transformed bounding
    // box.
    //  | x0 |   | this.a this.c tx |   | box.minX |
    //  | y0 | = | this.b this.d ty | * | box.minY |
    //  | 1  |   | 0      0      1  |   | 1        |
    //           | this.a * box.minX + this.c * box.minY + tx |
    //         = | this.b * box.minX + this.d * box.minY + ty |
    //           | 1                                          |
    //  | x1 |   | this.a this.c tx |   | box.maxX |
    //  | y1 | = | this.b this.d ty | * | box.maxY |
    //  | 1  |   | 0      0      1  |   | 1        |
    //           | this.a * box.maxX + this.c * box.maxY + tx |
    //         = | this.b * box.maxX + this.d * box.maxY + ty |
    //           | 1                                          |
    var x0 = this.a * minX + this.c * minY;
    var x1 = this.a * maxX + this.c * maxY;
    if (x0 < x1) {
      output.minX = x0;
      output.maxX = x1;
    } else {
      output.minX = x1;
      output.maxX = x0;
    }
    var y0 = this.b * minX + this.d * minY;
    var y1 = this.b * maxX + this.d * maxY;
    if (y0 < y1) {
      output.minY = y0;
      output.maxY = y1;
    } else {
      output.minY = y1;
      output.maxY = y0;
    }
  } else {
    var x0 = this.a * minX + this.c * minY;
    var x1 = this.a * maxX + this.c * minY;
    var x2 = this.a * minX + this.c * maxY;
    var x3 = this.a * maxX + this.c * maxY;
    output.minX = createjs.min(createjs.min(createjs.min(x0, x1), x2), x3);
    output.maxX = createjs.max(createjs.max(createjs.max(x0, x1), x2), x3);
    var y0 = this.b * minX + this.d * minY;
    var y1 = this.b * maxX + this.d * minY;
    var y2 = this.b * minX + this.d * maxY;
    var y3 = this.b * maxX + this.d * maxY;
    output.minY = createjs.min(createjs.min(createjs.min(y0, y1), y2), y3);
    output.maxY = createjs.max(createjs.max(createjs.max(y0, y1), y2), y3);
  }
  output.minX += this.tx;
  output.maxX += this.tx;
  output.minY += this.ty;
  output.maxY += this.ty;
};
