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
  /**
   * The transform values. Its first eight values are set by this transform and
   * the last eight values are set by renderers as listed in the following
   * table.
   *   +-------+-------------+
   *   | index | property    |
   *   +-------+-------------+
   *   | 0     | a           |
   *   | 1     | b           |
   *   | 2     | c           |
   *   | 3     | d           |
   *   | 4     | tx          |
   *   | 5     | ty          |
   *   | 6     | alpha       |
   *   | 7     | composition |
   *   +-------+-------------+
   * @type {Float32Array}
   * @const
   */
  this.m = createjs.createFloat32Array([
    1, 0, 0, 1, 0, 0, 1, 0
  ]);
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
 * Returns whether this transform has its skew factors non-zero.
 * @return {number}
 * @const
 */
createjs.Transform.prototype.hasSkew = function() {
  /// <returns type="number"/>
  return this.dirty_ & createjs.Transform.DIRTY_SKEW;
};

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
  var m = this.m;
  var a = m[0];
  var b = m[1];
  var c = m[2];
  var d = m[3];
  var tx = m[4];
  var ty = m[5];
  var m0 = transform.m;
  var a0 = m0[0];
  var b0 = m0[1];
  var c0 = m0[2];
  var d0 = m0[3];
  var tx0 = m0[4];
  var ty0 = m0[5];
  if (!this.dirty_) {
    // Copy the parent transform (including its dirty flag) to this transform
    // when this transform is an identity one. (A dirty flag will be used in
    // calculating a bounding box.)
    m[0] = a0;
    m[1] = b0;
    m[2] = c0;
    m[3] = d0;
    this.dirty_ = transform.dirty_;
  } else {
    m[0] = a0 * a + c0 * b;
    m[1] = b0 * a + d0 * b;
    m[2] = a0 * c + c0 * d;
    m[3] = b0 * c + d0 * d;
  }
  m[4] = a0 * tx + c0 * ty + tx0;
  m[5] = b0 * tx + d0 * ty + ty0;
};

/**
 * Generates matrix properties from transform properties used by display
 * objects, and appends them with this matrix.
 * @param {Float32Array} values
 * @const
 */
createjs.Transform.prototype.set = function(values) {
  /// <param type="Float32Array" name="values"/>

  // Create a scale matrix.
  //   | a c 0 |   | scale.x 0       0 |
  //   | b d 0 | = | 0       scale.y 0 |
  //   | 0 0 1 |   | 0       0       1 |
  var a = values[createjs.Property.SCALE_X];
  var b = 0;
  var c = 0;
  var d = values[createjs.Property.SCALE_Y];
  this.dirty_ = (a != 1 || d != 1) ? createjs.Transform.DIRTY_SCALE : 0;

  var rotation = values[createjs.Property.ROTATION];
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
  var skewX = values[createjs.Property.SKEW_X];
  var skewY = values[createjs.Property.SKEW_Y];
  if (skewX || skewY) {
    // Multiply a skew matrix with a rotation one as listed in the following
    // formula.
    //   | a c 0 |   | cos(sy) -sin(sx) 0 |   | a c 0 |
    //   | b d 0 | = | sin(sy) cos(sx)  0 | * | b d 0 |
    //   | 0 0 1 |   | 0       0        1 |   | 0 0 1 |
    //               | cos(sy)*a-sin(sx)*b cos(sy)*c-sin(sx)*d 0 |
    //             = | sin(sy)*a+cos(sx)*b sin(sy)*c+cos(sx)*d 0 |
    //               | 0                   0                   1 |
    var a0 = createjs.cos(skewY);
    var b0 = createjs.sin(skewY);
    var c0 = -createjs.sin(skewX);
    var d0 = createjs.cos(skewX);
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
  var m = this.m;
  m[0] = a;
  m[1] = b;
  m[2] = c;
  m[3] = d;
  m[4] = values[createjs.Property.X];
  m[5] = values[createjs.Property.Y];
  var regX = values[createjs.Property.REG_X];
  var regY = values[createjs.Property.REG_Y];
  if (regX || regY) {
    m[4] -= regX * a + regY * c;
    m[5] -= regX * b + regY * d;
  }
  m[15] = 0;
};

/**
 * Copies the specified transform.
 * @param {createjs.Transform} transform
 * @const
 */
createjs.Transform.prototype.copyTransform = function(transform) {
  /// <param type="createjs.Transform" name="transform"/>
  var m = this.m;
  m[0] = transform.m[0];
  m[1] = transform.m[1];
  m[2] = transform.m[2];
  m[3] = transform.m[3];
  m[4] = transform.m[4];
  m[5] = transform.m[5];
  m[15] = 0;
  this.dirty_ = transform.dirty_;
};

/**
 * Generates matrix properties from transform properties used by display
 * objects, and appends them with this matrix.
 * @param {createjs.Transform} transform
 * @param {Float32Array} values
 * @const
 */
createjs.Transform.prototype.appendTransform = function(transform, values) {
  /// <param type="createjs.Transform" name="transform"/>
  /// <param type="Float32Array" name="values"/>
  this.set(values);
  this.prepend_(transform);
};

/**
 * Returns an inverse transformation of this transformation.
 * @return {createjs.Transform}
 * @const
 */
createjs.Transform.prototype.getInverse = function() {
  /// <returns type="createjs.Transform"/>
  var m = this.m;
  var a = m[0];
  var b = m[1];
  var c = m[2];
  var d = m[3];
  var det = a * d - b * c;
  if (!det) {
    return null;
  }
  var idet = 1 / det;
  var tx = m[4];
  var ty = m[5];
  var transform = new createjs.Transform();
  transform.m[0] = d * idet;
  transform.m[1] = -b * idet;
  transform.m[2] = -c * idet;
  transform.m[3] = a * idet;
  transform.m[4] = (c * ty - d * tx) * idet;
  transform.m[5] = -(a * ty - b * tx) * idet;
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
  var x = point.v[0];
  var y = point.v[1];
  var m = this.m;
  point.v[0] = m[0] * x + m[2] * y + m[4];
  point.v[1] = m[1] * x + m[3] * y + m[5];
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
  var minX = box.b[0];
  var minY = box.b[1];
  var maxX = box.b[2];
  var maxY = box.b[3];
  var m = this.m;
  var a = m[0];
  var d = m[3];
  if ((this.dirty_ & createjs.Transform.DIRTY_SKEW) == 0) {
    // Apply this transform to the top-left corner '(minX,minY)' and the
    // bottom-right one '(maxX,maxY)' when this transform does not have skew
    // factors.
    //  | x0 |   | a 0 tx |   | minX |
    //  | y0 | = | 0 d ty | * | minY |
    //  | 1  |   | 0 0 1  |   | 1    |
    //
    //  | x1 |   | a 0 tx |   | maxX |
    //  | y1 | = | 0 d ty | * | maxY |
    //  | 1  |   | 0 0 1  |   | 1    |
    var x0 = a * minX;
    var x1 = a * maxX;
    output.b[0] = createjs.min(x0, x1);
    output.b[2] = createjs.max(x0, x1);
    var y0 = d * minY;
    var y1 = d * maxY;
    output.b[1] = createjs.min(y0, y1);
    output.b[3] = createjs.max(y0, y1);
  } else {
    // Apply this transform to all corners '(minX,minY)', '(maxX,minY)',
    // '(minX,maxY)', and '(maxX,maxY)'.
    //  | x0 |   | a c tx |   | minX |
    //  | y0 | = | b d ty | * | minY |
    //  | 1  |   | 0 0 1  |   | 1    |
    //
    //  | x1 |   | a c tx |   | maxX |
    //  | y1 | = | b d ty | * | minY |
    //  | 1  |   | 0 0 1  |   | 1    |
    //
    //  | x0 |   | a c tx |   | minX |
    //  | y0 | = | b d ty | * | maxY |
    //  | 1  |   | 0 0 1  |   | 1    |
    //
    //  | x1 |   | a c tx |   | maxX |
    //  | y1 | = | b d ty | * | maxY |
    //  | 1  |   | 0 0 1  |   | 1    |
    var b = m[1];
    var c = m[2];
    var x0 = a * minX + c * minY;
    var x1 = a * maxX + c * minY;
    var x2 = a * minX + c * maxY;
    var x3 = a * maxX + c * maxY;
    output.b[0] = createjs.min(createjs.min(createjs.min(x0, x1), x2), x3);
    output.b[2] = createjs.max(createjs.max(createjs.max(x0, x1), x2), x3);
    var y0 = b * minX + d * minY;
    var y1 = b * maxX + d * minY;
    var y2 = b * minX + d * maxY;
    var y3 = b * maxX + d * maxY;
    output.b[1] = createjs.min(createjs.min(createjs.min(y0, y1), y2), y3);
    output.b[3] = createjs.max(createjs.max(createjs.max(y0, y1), y2), y3);
  }
  var tx = m[4];
  var ty = m[5];
  output.b[0] += tx;
  output.b[2] += tx;
  output.b[1] += ty;
  output.b[3] += ty;
};
