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
/// <reference path="color.js"/>
/// <reference path="object.js"/>
/// <reference path="renderer.js"/>
/// <reference path="user_agent.js"/>

/**
 * A class that composes an image.
 * @constructor
 */
createjs.Composer = function() {
};

/**
 * An inner class that encapsulates a composed image.
 * @param {number} width
 * @param {number} height
 * @constructor
 */
createjs.Composer.Renderer = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  var canvas = createjs.createCanvas();
  canvas.width = width;
  canvas.height = height;

  /**
   * The HTMLCanvasElement object representing the composed image.
   * @type {HTMLCanvasElement}
   * @private
   */
  this.canvas_ = canvas;

  /**
   * The 2D rendering context attached to the HTMLCanvasElement object.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  this.context_ = createjs.getRenderingContext2D(canvas);
};

/**
 * Returns the HTMLCanvasElement object associated with this renderer.
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.Composer.Renderer.prototype.reset = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.canvas_.width = width;
  this.canvas_.height = height;
};

/**
 * Deletes all resources associated with this renderer.
 * @const
 */
createjs.Composer.Renderer.prototype.destroy = function() {
  this.context_ = null;
  if (this.canvas_) {
    this.canvas_.width = 0;
    this.canvas_ = null;
  }
};

/**
 * Returns the HTMLCanvasElement object associated with this renderer.
 * @return {HTMLCanvasElement}
 * @const
 */
createjs.Composer.Renderer.prototype.getCanvas = function() {
  /// <returns type="HTMLCanvasElement"/>
  return this.canvas_;
};

/**
 * Sets the alpha value used by this renderer.
 * @param {number} alpha
 * @const
 */
createjs.Composer.Renderer.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  this.context_.globalAlpha = alpha;
};

/**
 * Sets the composition operation used by this renderer.
 * @param {number} operation
 * @const
 */
createjs.Composer.Renderer.prototype.setComposition = function(operation) {
  this.context_.globalCompositeOperation =
      createjs.Renderer.getCompositionName(operation);
};

/**
 * Sets the fill color used by the 'fillRect()' method.
 * @param {string} color
 * @const
 */
createjs.Composer.Renderer.prototype.setFillColor = function(color) {
  this.context_.fillStyle = color;
};

/**
 * Fills the specified region of this renderer with the color specified with a
 * 'setFillColor()' call.
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.Composer.Renderer.prototype.fillRect = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.context_.fillRect(0, 0, width, height);
};

/**
 * Draws an image.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @const
 */
createjs.Composer.Renderer.prototype.drawImage = function(image) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  /// </signature>
  this.context_.drawImage(image, 0, 0);
};

/**
 * Draws an alpha mask. This method copies the specified image and applies the
 * following color-matrix filter to the copy.
 *       | 1 0 0 0 0 |
 *       | 0 1 0 0 0 |
 *   A = | 0 0 1 0 0 |
 *       | 1 0 0 0 0 |
 *       | 0 0 0 0 0 |
 * @param {HTMLImageElement|HTMLCanvasElement} alpha
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.Composer.Renderer.prototype.drawAlphaMask =
    function(alpha, width, height) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="alpha"/>
  ///   <param type="number" name="width"/>
  ///   <param type="number" name="height"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="alpha"/>
  ///   <param type="number" name="width"/>
  ///   <param type="number" name="height"/>
  /// </signature>
  this.context_.drawImage(alpha, 0, 0);
  var image = this.context_.getImageData(0, 0, width, height);
  var data = image.data;
  var length = data.length;
  for (var i = 0; i < length; i += 4) {
    data[i + 3] = data[i];
  }
  this.context_.putImageData(image, 0, 0);
};

/**
 * Multiplies the specified color to this renderer. This method applies the
 * following color-matrix filter to the HTMLCanvasElement object associated with
 * this renderer.
 *       | 1 0 0 0 red   |
 *       | 0 1 0 0 green |
 *   A = | 0 0 1 0 blue  |
 *       | 0 0 0 1 0     |
 *       | 0 0 0 0 0     |
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.Composer.Renderer.prototype.addOffset =
    function(red, green, blue, width, height) {
  /// <param type="number" name="red"/>
  /// <param type="number" name="green"/>
  /// <param type="number" name="blue"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  var output = new createjs.Composer.Renderer(width, height);
  output.drawImage(this.getCanvas());
  output.setComposition(createjs.Renderer.Composition.LIGHTER);
  output.setFillColor('rgb(' + red + ',' + green + ',' + blue + ')');
  output.fillRect(width, height);
  this.setComposition(createjs.Renderer.Composition.SOURCE_IN);
  this.drawImage(output.getCanvas());
};

/**
 * Multiplies the specified color to this renderer. This method applies the
 * following color-matrix filter to the HTMLCanvasElement object associated with
 * this renderer.
 *       | red 0     0    0 0 |
 *       | 0   green 0    0 0 |
 *   A = | 0   0     blue 0 0 |
 *       | 0   0     0    1 0 |
 *       | 0   0     0    0 0 |
 * @param {Array.<number>} matrix
 * @param {number} width
 * @param {number} height
 * @return {number}
 * @const
 */
createjs.Composer.Renderer.prototype.multiplyColor =
    function(matrix, width, height) {
  /// <param type="Array" elementType="number" name="matrix"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <returns type="number"/>
  var red = matrix[0 * 5 + 0];
  var green = matrix[1 * 5 + 1];
  var blue = matrix[2 * 5 + 2];
  if (red == green && green == blue) {
    if (red == 1) {
      return 0;
    }
    // Draws a black rectangle onto the source image with the 'source-atop'
    // operation. This 'source-atop' operation multiplies (1 - globalAlpha)
    // with background colors and writes the multiplied colors onto the
    // destination if it is not transparent as listed in the following code
    // snippet. (This operation preserves the alpha values of the original
    // image.)
    //    for (var i = 0; i < p.length; i += 4) {
    //      if (p[i + 3] > 0) {
    //        p[i + 0] = (1 - red) * 0 + (1 - (1 - red)) * p[i + 0];
    //        p[i + 1] = (1 - red) * 0 + (1 - (1 - red)) * p[i + 1];
    //        p[i + 2] = (1 - red) * 0 + (1 - (1 - red)) * p[i + 2];
    //      }
    //    }
    this.setAlpha(1 - red);
    this.setComposition(createjs.Renderer.Composition.SOURCE_ATOP);
    this.setFillColor('#000');
    this.fillRect(width, height);
    return 0;
  }
  if (createjs.UserAgent.isMSIE()) {
    // Read each pixel in the original image and multiply the specified color on
    // IE 11 or earlier, which does not provide the blend mode "multiply".
    var image = this.context_.getImageData(0, 0, width, height);
    var data = image.data;
    var length = data.length;
    for (var i = 0; i < length; i += 4) {
      data[i] *= red;
      data[i + 1] *= green;
      data[i + 2] *= blue;
    }
    this.context_.putImageData(image, 0, 0);
    return 0;
  }
  var output = new createjs.Composer.Renderer(width, height);
  if (!createjs.UserAgent.isAndroidBrowser()) {
    // Use the blend mode "multiply" for color multiplication on browsers that
    // provide it. (This blend mode is implemented by all major browsers except
    // IE (11 or earlier) or Android browsers (on Android 4.3 or earlier), as of
    // 11 September, 2015.) This operation sets 1 to all alpha values of this
    // renderer and needs to restore the alpha values of the original image
    // later.
    output.setComposition(createjs.Renderer.Composition.COPY);
    output.drawImage(this.getCanvas());
    output.setComposition(createjs.Renderer.Composition.MULTIPLY);
    output.setFillColor('rgb(' +
        createjs.floor(red * 255) + ',' +
        createjs.floor(green * 255) + ',' +
        createjs.floor(blue * 255) + ')');
    output.fillRect(width, height);
  } else {
    // Use the non-standard blend mode "darker" on Android 4.3 or earlier.
    output.setComposition(createjs.Renderer.Composition.LIGHTER);
    var renderer = new createjs.Composer.Renderer(width, height);
    var colors = [
      { color: 1 - red, mask: '#f00' },
      { color: 1 - green, mask: '#0f0' },
      { color: 1 - blue, mask: '#00f' }
    ];
    for (var i = 0; i < 3; ++i) {
      // Copy the source image.
      renderer.setComposition(createjs.Renderer.Composition.COPY);
      renderer.drawImage(this.getCanvas());

      // Extract the specified color component of the source image.
      renderer.setComposition(createjs.Renderer.Composition.DARKER);
      renderer.setFillColor(colors[i].mask);
      renderer.fillRect(width, height);

      // Draw a black rectangle onto the extracted image with the 'source-over'
      // operation to multiply the given multiplier with all pixels of the
      // extracted image as listed in the following formulas. This operation
      // also sets 1 to all alpha values of this renderer and needs to restore
      // the alpha values of the original image later.
      //    for (var i = 0; i < p.length; i += 4) {
      //      p[i + 0] = (1 - red)   * 0 + (1 - (1 - red))   * p[i + 0];
      //      p[i + 1] = (1 - green) * 0 + (1 - (1 - green)) * p[i + 1];
      //      p[i + 2] = (1 - blue)  * 0 + (1 - (1 - blue))  * p[i + 2];
      //      p[i + 3] = 1;
      //    }
      renderer.setComposition(createjs.Renderer.Composition.SOURCE_OVER);
      if (colors[i].color) {
        renderer.setAlpha(colors[i].color);
        renderer.setFillColor('#000');
        renderer.fillRect(width, height);
        renderer.setAlpha(1);
      }
      output.drawImage(renderer.getCanvas());
    }
    renderer.destroy();
  }
  // Add an offset color to the output <canvas> element.
  red = matrix[0 * 5 + 4];
  green = matrix[1 * 5 + 4];
  blue = matrix[2 * 5 + 4];
  if (red || green || blue) {
    // Add each pixel of the output canvas by the offset color. (
    // Fill the output canvas with the offset color and the "lighter" operation
    output.setComposition(createjs.Renderer.Composition.LIGHTER);
    output.setFillColor('rgb(' + red + ',' + green + ',' + blue + ')');
    output.fillRect(width, height);
  }
  // Draws the composed image into the original image to restore the alpha
  // values of the original one.
  this.setComposition(createjs.Renderer.Composition.SOURCE_IN);
  this.drawImage(output.getCanvas());
  output.destroy();
  return 1;
};

/**
 * Whether this composer can use the blend mode 'multiply'.
 * @type {number}
 * @private
 */
createjs.Composer.hasMultiply_ = -1;

/**
 * The renderer that represents the composed image.
 * @type {createjs.Composer.Renderer}
 * @private
 */
createjs.Composer.prototype.renderer_ = null;

/**
 * The image that represents the alpha component of the source image. This
 * composer copies the red component of this image to the alpha component of the
 * source image.
 * @type {HTMLImageElement}
 * @private
 */
createjs.Composer.prototype.alpha_ = null;

/**
 * The color matrix applied to the source image.
 * @type {Array.<number>}
 * @private
 */
createjs.Composer.prototype.matrix_ = null;

/**
 * Returns whether the hosting browser supports the blend mode "multiply".
 * @return {number}
 * @private
 */
createjs.Composer.prototype.hasMultiply = function() {
  if (createjs.Composer.hasMultiply_ < 0) {
    if (createjs.UserAgent.isMSIE() || createjs.UserAgent.isAndroidBrowser()) {
      createjs.Composer.hasMultiply_ = 0;
    } else {
      createjs.Composer.hasMultiply_ = 1;
    }
  }
  return createjs.Composer.hasMultiply_;
};

/**
 * Returns whether the hosting browser supports the blend mode "multiply".
 * @return {HTMLCanvasElement}
 * @const
 */
createjs.Composer.prototype.getOutput = function() {
  /// <returns type="HTMLCanvasElement"/>
  return this.renderer_ ? this.renderer_.getCanvas() : null;
};

/**
 * Destroys all resources owned by this composer.
 * @const
 */
createjs.Composer.prototype.destroy = function() {
  if (this.renderer_) {
    this.renderer_.destroy();
    this.renderer_ = null;
  }
};

/**
 * Applies an alpha-map filter to the specified image.
 * @param {HTMLImageElement} image
 * @param {HTMLImageElement} alpha
 * @const
 */
createjs.Composer.prototype.applyAlphaMap = function(image, alpha) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="HTMLImageElement" name="alpha"/>
  if (this.alpha_ === alpha) {
    return;
  }
  this.alpha_ = alpha;
  this.matrix_ = null;

  // Create a renderer that stores the output <canvas> element and apply the
  // specified alpha-mask filter to the source image. (The output <canvas>
  // element represents an alpha-masked image.)
  var width = image.width;
  var height = image.height;
  if (!this.renderer_) {
    this.renderer_ = new createjs.Composer.Renderer(width, height);
  }
  this.renderer_.setComposition(createjs.Renderer.Composition.COPY);
  this.renderer_.drawAlphaMask(alpha, width, height);
  this.renderer_.setComposition(createjs.Renderer.Composition.SOURCE_IN);
  this.renderer_.drawImage(image);
};

/**
 * Applies a color filter to the specified image.
 * @param {HTMLImageElement} image
 * @param {Array.<number>} matrix
 * @const
 */
createjs.Composer.prototype.applyColorFilter = function(image, matrix) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="Array" elementType="number" name="matrix"/>
  if (!this.alpha_ && this.matrix_ === matrix) {
    return;
  }
  this.alpha_ = null;
  this.matrix_ = matrix;

  var width = image.width;
  var height = image.height;
  var red = matrix[0 * 5 + 0];
  var green = matrix[1 * 5 + 1];
  var blue = matrix[2 * 5 + 2];
  if (red == 1 && green == 1 && blue == 1) {
    red = matrix[0 * 5 + 4];
    green = matrix[1 * 5 + 4];
    blue = matrix[2 * 5 + 4];
    if (!red && !green && !blue) {
      this.destroy();
      return;
    }
    if (!this.renderer_) {
      this.renderer_ = new createjs.Composer.Renderer(width, height);
    }
    this.renderer_.drawImage(image);
    this.renderer_.setComposition(createjs.Renderer.Composition.LIGHTER);
    this.renderer_.setFillColor('rgb(' + red + ',' + green + ',' + blue + ')');
    this.renderer_.fillRect(width, height);
    this.renderer_.setComposition(createjs.Renderer.Composition.DESTINATION_IN);
    this.renderer_.drawImage(image);
    return;
  }
  // Apply a color filter to the output.
  if (!this.renderer_) {
    this.renderer_ = new createjs.Composer.Renderer(width, height);
  }
  this.renderer_.setComposition(createjs.Renderer.Composition.COPY);
  this.renderer_.drawImage(image);
  if (!this.renderer_.multiplyColor(matrix, width, height)) {
    red = matrix[0 * 5 + 4];
    green = matrix[1 * 5 + 4];
    blue = matrix[2 * 5 + 4];
    this.renderer_.addOffset(red, green, blue, width, height);
  }
};
