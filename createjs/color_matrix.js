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
 * A class that implements a color-transformation matrix.
 * @param {number} brightness
 * @param {number} contrast
 * @param {number} saturation
 * @param {number} hue
 * @extends {createjs.Object}
 * @constructor
 */
createjs.ColorMatrix = function(brightness, contrast, saturation, hue) {
  /// <param type="number" name="brightness"/>
  /// <param type="number" name="contrast"/>
  /// <param type="number" name="saturation"/>
  /// <param type="number" name="hue"/>
  this.setColor(brightness, contrast, saturation, hue);
};
createjs.inherits('ColorMatrix',
                  createjs.ColorMatrix,
                  createjs.Object);

/**
 * The color matrix. Even though this is a 5x5 matrix, this class actually
 * uses its 4x5 sub-matrix.
 * @type {Float32Array}
 * @private
 */
createjs.ColorMatrix.prototype.matrix_ = null;

/**
 * Initializes this matrix and applies color filters.
 * @param {number} brightness
 * @param {number} contrast
 * @param {number} saturation
 * @param {number} hue
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.setColor =
    function(brightness, contrast, saturation, hue) {
  /// <param type="number" name="brightness"/>
  /// <param type="number" name="contrast"/>
  /// <param type="number" name="saturation"/>
  /// <param type="number" name="hue"/>
  /// <returns type="createjs.ColorMatrix"/>
  return this.reset().adjustColor(brightness, contrast, saturation, hue);
};

/**
 * Sets this matrix to the identify one.
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.reset = function() {
  /// <returns type="createjs.ColorMatrix"/>
  this.matrix_ = new Float32Array([
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ]);
  return this;
};

/**
 * Applies color filters.
 * @param {number} brightness
 * @param {number} contrast
 * @param {number} saturation
 * @param {number} hue
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.adjustColor =
    function(brightness, contrast, saturation, hue) {
  /// <param type="number" name="brightness"/>
  /// <param type="number" name="contrast"/>
  /// <param type="number" name="saturation"/>
  /// <param type="number" name="hue"/>
  /// <returns type="createjs.ColorMatrix"/>
  this.adjustHue(hue);
  this.adjustContrast(contrast);
  this.adjustBrightness(brightness);
  this.adjustSaturation(saturation);
  return this;
};

/**
 * Applies the brightness filter.
 * @param {number} brightness
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.adjustBrightness = function(brightness) {
  /// <param type="number" name="brightness"/>
  /// <returns type="createjs.ColorMatrix"/>
  if (brightness && !createjs.isNaN(brightness)) {
    if (createjs.FALSE) {
      brightness = createjs.max(-255, createjs.min(brightness, 255));
    }
    // Multiply a brightness-filter matrix.
    //   | a00 a01 a02 a03 a04 |   | 1 0 0 0 B |
    //   | a10 a11 a12 a13 a14 |   | 0 1 0 0 B |
    //   | a20 a21 a22 a23 a24 | x | 0 0 1 0 B |
    //   | a30 a31 a32 a33 a34 |   | 0 0 0 1 0 |
    //   | 0   0   0   0   1   |   | 0 0 0 0 1 |
    //     | a00 a01 a02 a03 a00*B+a01*B+a02*B+a04 |
    //     | a10 a11 a12 a13 a10*B+a11*B+a12*B+a14 |
    //   = | a20 a21 a22 a23 a20*B+a21*B+a22*B+a24 |
    //     | a30 a31 a32 a33 a30*B+a31*B+a32*B+a34 |
    //     | 0   0   0   0   1                     |
    var LINE = 5;
    for (var y = 0; y < 4 * LINE; y += LINE) {
      this.matrix_[y + 4] += this.matrix_[y + 0] * brightness +
                             this.matrix_[y + 1] * brightness +
                             this.matrix_[y + 2] * brightness;
    }
  }
  return this;
};

/**
 * Applies the contrast filter.
 * @param {number} contrast
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.adjustContrast = function(contrast) {
  /// <param type="number" name="contrast"/>
  /// <returns type="createjs.ColorMatrix"/>
  if (contrast && !createjs.isNaN(contrast)) {
    // Create a contrast-filter matrix from the input contast.
    var luminance = 1;
    var brightness = 0;
    if (contrast < 0) {
      if (createjs.FALSE) {
        contrast = createjs.max(-100, contrast);
      }
      //  luminance = (127 + contrast / 100 * 127) / 127
      //            = 1 + contrast / 100
      //  brightness = (127 - (127 + contrast / 100 * 127)) * 0.5
      //             = -0.635 * contrast
      luminance = 1 + contrast * 0.01;
      brightness = -0.635 * contrast;
    } else {
      if (createjs.FALSE) {
        contrast = createjs.min(contrast, 100);
      }
      var CONTRASTS = [
        0.00, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.10, 0.11,
        0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
        0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
        0.44, 0.46, 0.48, 0.50, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68,
        0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
        1.00, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
        1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.00, 2.12, 2.25,
        2.37, 2.50, 2.62, 2.75, 2.87, 3.00, 3.20, 3.40, 3.60, 3.80,
        4.00, 4.30, 4.70, 4.90, 5.00, 5.50, 6.00, 6.50, 6.80, 7.00,
        7.30, 7.50, 7.80, 8.00, 8.40, 8.70, 9.00, 9.40, 9.60, 9.80,
        10.0
      ];
      var numerator = createjs.truncate(contrast);
      var denominator = contrast - numerator;
      if (!denominator) {
        contrast = CONTRASTS[numerator];
      } else {
        contrast = CONTRASTS[numerator] * (1 - denominator) +
                   CONTRASTS[numerator + 1] * denominator;
      }
      // luminance = (127 + contrast * 127) / 127
      //           = 1 + contrast
      // brightness = (127 - (contrast * 127 + 127)) * 0.5
      //            = -63.5 * contrast
      luminance = 1 + contrast;
      brightness = -63.5 * contrast;
    }
    // Multiply the contrast-filter matrix.
    //   | a00 a01 a02 a03 a04 |   | L 0 0 0 B |
    //   | a10 a11 a12 a13 a14 |   | 0 L 0 0 B |
    //   | a20 a21 a22 a23 a24 | x | 0 0 L 0 B |
    //   | a30 a31 a32 a33 a34 |   | 0 0 0 1 0 |
    //   | 0   0   0   0   1   |   | 0 0 0 0 1 |
    //     | a00*L a01*L a02*L a03 a00*B+a01*B+a02*B+a04 |
    //     | a10*L a11*L a12*L a13 a10*B+a11*B+a12*B+a14 |
    //   = | a20*L a21*L a22*L a23 a20*B+a21*B+a22*B+a24 |
    //     | a30*L a31*L a32*L a33 a30*B+a31*B+a32*B+a34 |
    //     | 0     0     0     0   1                     |
    var LINE = 5;
    for (var y = 0; y < 4 * LINE; y += LINE) {
      var column0 = this.matrix_[y + 0];
      var column1 = this.matrix_[y + 1];
      var column2 = this.matrix_[y + 2];
      this.matrix_[y + 0] *= luminance;
      this.matrix_[y + 1] *= luminance;
      this.matrix_[y + 2] *= luminance;
      this.matrix_[y + 4] += column0 * brightness +
                             column1 * brightness +
                             column2 + brightness;
    }
  }
  return this;
};

/**
 * Applies the saturation filter.
 * @param {number} saturation
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.adjustSaturation = function(saturation) {
  /// <param type="number" name="saturation"/>
  /// <returns type="createjs.ColorMatrix"/>
  if (saturation && !createjs.isNaN(saturation)) {
    if (createjs.FALSE) {
      saturation = createjs.max(-100, createjs.min(saturation, 100));
    }
    var x_ = saturation * ((saturation > 0) ? -0.03 : -0.01);
    var x = 1 + x;
    //   | a00 a01 a02 a03 a04 |   | Rx G  B  0 0 |
    //   | a10 a11 a12 a13 a14 |   | R  Gx B  0 0 |
    //   | a20 a21 a22 a23 a24 | x | R  G  Bx 0 0 |
    //   | a30 a31 a32 a33 a34 |   | 0  0  0  1 0 |
    //   | 0   0   0   0   1   |   | 0  0  0  0 1 |
    //     | a00*Rx+a01*R+a02*R a00*G+a01*Gx+a02*G a00*B+a01*B+a02*Bx a03 a04 |
    //     | a10*Rx+a11*R+a12*R a10*G+a11*Gx+a12*G a10*B+a11*B+a12*Bx a13 a14 |
    //   = | a20*Rx+a21*R+a22*R a20*G+a21*Gx+a22*G a20*B+a21*B+a22*Bx a23 a24 |
    //     | a30*Rx+a31*R+a32*R a30*G+a31*Gx+a32*G a30*B+a31*B+a32*Bx a33 a34 |
    //     | 0                  0                  0                  0   1   |
    var r = 0.3086 * x_;
    var rx = r + x;
    var g = 0.6094 * x_;
    var gx = r + x;
    var b = 0.0820 * x_;
    var bx = r + x;
    var LINE = 5;
    for (var y = 0; y < 4 * LINE; ++y) {
      var column0 = this.matrix_[y + 0];
      var column1 = this.matrix_[y + 1];
      var column2 = this.matrix_[y + 2];
      this.matrix_[y + 0] = column0 * rx + column1 * r + column2 * r;
      this.matrix_[y + 1] = column0 * g + column1 * gx + column2 * g;
      this.matrix_[y + 2] = column0 * b + column1 * b + column2 * bx;
    }
  }
  return this;
};

/**
 * Applies the hue-rotation filter.
 * @param {number} hue
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.adjustHue = function(hue) {
  /// <param type="number" name="hue"/>
  /// <returns type="createjs.ColorMatrix"/>
  if (hue && !createjs.isNaN(hue)) {
    if (createjs.FALSE) {
      hue = createjs.max(-180, createjs.min(hue, 180));
    }
    var cos = createjs.cos(hue);
    var sin = createjs.sin(hue);
    //   | a00 a01 a02 a03 a04 |   | R0 G0 B0 0 0 |
    //   | a10 a11 a12 a13 a14 |   | R1 G1 B1 0 0 |
    //   | a20 a21 a22 a23 a24 | x | R2 G2 B2 0 0 |
    //   | a30 a31 a32 a33 a34 |   | 0  0  0  1 0 |
    //   | 0   0   0   0   1   |   | 0  0  0  0 1 |
    //     | a00*R0+a01*R1+a02*R2 a00*G0+a01*G1+a02*G2 a00*B0+a01*B1+a02*B2 a03 a04 |
    //     | a10*R0+a11*R1+a12*R2 a10*G0+a11*G1+a12*G2 a10*B0+a11*B1+a12*B2 a13 a14 |
    //   = | a20*R0+a21*R1+a22*R2 a20*G0+a21*G1+a22*G2 a20*B0+a21*B1+a22*B2 a23 a24 |
    //     | a30*R0+a31*R1+a32*R2 a30*G0+a31*G1+a32*G2 a30*B0+a31*B1+a32*B2 a33 a34 |
    //     | 0                    0                    0                    0   1   |
    var R = 0.213;
    var G = 0.715;
    var B = 0.072;
    var r0 = R + cos * (1 - R) + sin * -R;
    var r1 = R + cos * -R + sin * 0.143;
    var r2 = R + cos * -R + sin * (R - 1);
    var g0 = G + cos * -G + sin * -G;
    var g1 = G + cos * (1 - G) + sin * 0.140;
    var g2 = G + cos * -G + sin * G;
    var b0 = B + cos * -B + sin * (1 - B);
    var b1 = B + cos * -B + sin * -0.283;
    var b2 = B + cos * (1 - B) + sin * B;
    var LINE = 5;
    for (var y = 0; y < 4 * LINE; y += LINE) {
      var column0 = this.matrix_[y + 0];
      var column1 = this.matrix_[y + 1];
      var column2 = this.matrix_[y + 2];
      this.matrix_[y + 0] = column0 * r0 + column1 * r1 + column2 * r2;
      this.matrix_[y + 1] = column0 * g0 + column1 * g1 + column2 * g2;
      this.matrix_[y + 2] = column0 * b0 + column1 * b1 + column2 * b2;
    }
  }
  return this;
};

/**
 * Multiplies this matrix by the specified one.
 * @param {Array.<number>} matrix
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.concat = function(matrix) {
  /// <param type="Array" elementType="number" name="matrix"/>
  /// <returns type="createjs.ColorMatrix"/>
  var LINE = 5;
  for (var y = 0; y < 4 * LINE; y += LINE) {
    var column0 = this.matrix_[y + 0];
    var column1 = this.matrix_[y + 1];
    var column2 = this.matrix_[y + 2];
    var column3 = this.matrix_[y + 3];
    var column4 = this.matrix_[y + 4];
    for (var x = 0; x < 5; ++x) {
      this.matrix_[y + x] = column0 * matrix[0 * LINE + x] +
                            column1 * matrix[1 * LINE + x] +
                            column2 * matrix[2 * LINE + x] +
                            column3 * matrix[3 * LINE + x] +
                            column4 * matrix[4 * LINE + x];
    }
  }
  return this;
};

/**
 * Copies the specified array.
 * @param {Array.<number>} matrix
 * @return {createjs.ColorMatrix}
 * @const
 */
createjs.ColorMatrix.prototype.copyArray = function(matrix) {
  /// <param type="Array" elementType="number" name="matrix"/>
  /// <returns type="createjs.ColorMatrix"/>
  var LINE = 5;
  for (var i = 0; i < LINE * LINE; ++i) {
    this.matrix_[i] = matrix[i];
  }
  return this;
};

/**
 * Returns the color matrix.
 * @return {Float32Array}
 * @const
 */
createjs.ColorMatrix.prototype.toArray = function() {
  /// <returns type="Float32Array"/>
  return this.matrix_;
};

// Export the createjs.ColorMatrix class to the global namespace.
createjs.exportObject('createjs.ColorMatrix',
                      createjs.ColorMatrix, {
  'setColor': createjs.ColorMatrix.prototype.setColor,
  'reset': createjs.ColorMatrix.prototype.reset,
  'adjustColor': createjs.ColorMatrix.prototype.adjustColor,
  'adjustBrightness': createjs.ColorMatrix.prototype.adjustBrightness,
  'adjustContrast': createjs.ColorMatrix.prototype.adjustContrast,
  'adjustSaturation': createjs.ColorMatrix.prototype.adjustSaturation,
  'adjustHue': createjs.ColorMatrix.prototype.adjustHue,
  'concat': createjs.ColorMatrix.prototype.concat,
  'copy': createjs.ColorMatrix.prototype.copyArray,
  'toArray': createjs.ColorMatrix.prototype.toArray
});
