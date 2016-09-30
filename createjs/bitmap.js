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
/// <reference path="display_object.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="composer.js"/>
/// <reference path="config.js"/>
/// <reference path="image_factory.js"/>

/**
 * A class that encapsulates an <img> element or a <canvas> element into a
 * CreateJS object. This class should not be used for rendering <video>
 * elements. Mobile Safari (<= iOS 9) cannot play <video> elements inline and it
 * needs workarounds to render <video> elements inline on Mobile Safari. The
 * createjs.Video class implements these workarounds needed for encapsulating a
 * <video> element into a CreateJS object.
 * @extends {createjs.DisplayObject}
 * @implements {EventListener}
 * @constructor
 */
createjs.Bitmap = function(value) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="source"/>
  /// </signature>
  createjs.DisplayObject.call(this);

  // Initialize this object only if its parameter is non-null. Flash-generated 
  // classes use 'derived.prototype = new createjs.Bitmap' to copy the methods
  // of this class and its properties.
  if (value != null) {
    var image = null;
    var width = 0;
    var height = 0;
    if (createjs.isString(value)) {
      var path = createjs.getString(value);
      // Retrieve an image from the ImageFactory object and copy its size only
      // if it is loaded.
      image = createjs.ImageFactory.get(
          path, path, this, createjs.DEFAULT_TEXTURE);
      if (image.complete) {
        width = image.width;
        height = image.height;
      }
    } else {
      image = /** @type {HTMLImageElement} */ (value);
      width = image.width;
      height = image.height;
    }

    /**
     * The image to be rendered. (This variable may be an HTMLCanvasElement
     * object or an HTMLVideoElement.)
     * @type {HTMLImageElement}
     * @private
     */
    this.image_ = image;

    /**
     * A renderer can draw the image attached to this bitmap. (The input image
     * may be an HTMLCanvasElement object and it cannot use the 'complete'
     * property.)
     * @type {boolean}
     * @private
     */
    this.ready_ = !!width;

    /**
     * The offset position of this image. This position is used for aligning
     * this image to the center of its nominal bounds.
     * @type {createjs.Point}
     * @private
     */
    this.offset_ = new createjs.Point(0, 0);

    if (!this.source_) {
      /**
       * The source rectangle of this image.
       * @type {createjs.Rectangle}
       * @private
       */
      this.source_ = new createjs.Rectangle(0, 0, width, height);
    }

    // Layout this image to the center of the nominal bounds.
    width = this.source_.width;
    height = this.source_.height;
    var nominalBounds =
        /** @type {createjs.Rectangle} */ (this['nominalBounds']);
    if (nominalBounds) {
      // Align this image to the center of its nominal bounds.
      var offsetX = nominalBounds.width - width;
      if (offsetX > 0) {
        this.offset_.x = offsetX >> 1;
      }
      var offsetY = nominalBounds.height - height;
      if (offsetY > 0) {
        this.offset_.y = offsetY >> 1;
      }
    }
    // Synchronize the image size with the bounding-box size of this object.
    this.setBoundingBox(0, 0, width, height);
  }
};
createjs.inherits('Bitmap', createjs.Bitmap, createjs.DisplayObject);

/**
 * The <canvas> element used for hit-testing.
 * @type {HTMLCanvasElement}
 * @private
 */
createjs.Bitmap.hitTestCanvas_ = null;

/**
 * The rendering context of the above <canvas> element, i.e. the rendering
 * context used for hit-testing.
 * @type {CanvasRenderingContext2D}
 * @private
 */
createjs.Bitmap.hitTestContext_ = null;

/**
 * An image composer used for applying a color filter to this image.
 * @type {createjs.Composer}
 * @private
 */
createjs.Bitmap.prototype.composer_ = null;

/**
 * The renderer that draws this object.
 * @type {createjs.Renderer}
 * @private
 */
createjs.Bitmap.prototype.output_ = null;

/**
 * The position where this bitmap was hit-tested last time.
 * @type {createjs.Point}
 * @private
 */
createjs.Bitmap.prototype.hitTestPoint_ = null;

/**
 * The result of the last hit-testing.
 * @type {createjs.DisplayObject}
 * @private
 */
createjs.Bitmap.prototype.hitTestResult_ = null;

/**
 * Returns the composer which applies filters to this bitmap.
 * @return {createjs.Composer}
 * @private
 */
createjs.Bitmap.prototype.getComposer_ = function() {
  /// <returns type="createjs.Composer"/>
  if (!this.composer_) {
    this.composer_ = new createjs.Composer();
  }
  return this.composer_;
};

/**
 * Retrieves the image of this bitmap used by the specified renderer.
 * @return {HTMLImageElement|HTMLCanvasElement}
 * @private
 */
createjs.Bitmap.prototype.getSourceImage_ = function() {
  /// <returns type="HTMLImageElement"/>
  if (this.composer_) {
    return this.composer_.getOutput();
  }
  return this.image_;
};

/**
 * Returns the HTMLImageElement object associated with this bitmap.
 * @return {HTMLImageElement}
 */
createjs.Bitmap.prototype.getImage = function() {
  /// <returns type="HTMLImageElement"/>
  return this.image_;
};

/**
 * Changes the HTMLImageElement object associated with this bitmap.
 * @param {HTMLImageElement} image
 */
createjs.Bitmap.prototype.setImage = function(image) {
  /// <param type="HTMLImageElement" name="image"/>
  this.handleDetach();
  this.image_ = image;
  this.ready_ = !!(image && image.width);
  this.handleAttach(1);
};

/**
 * Returns the source rectangle of this bitmap.
 * @return {createjs.Rectangle}
 * @const
 */
createjs.Bitmap.prototype.getSourceRect = function() {
  /// <returns type="createjs.Rectangle"/>
  return this.source_;
};

/**
 * Sets the source rectangle.
 * @param {createjs.Rectangle} rectangle
 * @const
 */
createjs.Bitmap.prototype.setSourceRect = function(rectangle) {
  /// <param type="createjs.Rectangle" name="rectangle"/>
  this.setBoundingBox(0, 0, rectangle.width, rectangle.height);
  this.source_ = rectangle;
};

/** @override */
createjs.Bitmap.prototype.handleEvent = function(event) {
  // Update the size of this object and invalidate it to redraw this object.
  var type = event.type;
  var image = /** @type {HTMLImageElement} */ (event.target);
  createjs.ImageFactory.removeListeners(image, this);
  this.ready_ = type == 'load';
  if (!this.source_ || !this.ready_) {
    this.image_ = null;
    return;
  }
  var width = image.width;
  var height = image.height;
  this.source_.width = width;
  this.source_.height = height;
  // Align this image to the center of its nominal bounds.
  var nominalBounds = /** @type {createjs.Rectangle} */ (this['nominalBounds']);
  if (nominalBounds) {
    var offsetX = nominalBounds.width - width;
    if (offsetX > 0) {
      this.offset_.x = offsetX >> 1;
    }
    var offsetY = nominalBounds.height - height;
    if (offsetY > 0) {
      this.offset_.y = offsetY >> 1;
    }
  }
  this.setBoundingBox(0, 0, width, height);
  this.handleAttach(1);
};

/** @override */
createjs.Bitmap.prototype.handleAttach = function(flag) {
  /// <param type="number" name="flag"/>
  if (!flag || !this.ready_) {
    return;
  }
  var alphaMapFilter = this.getAlphaMapFilter();
  if (alphaMapFilter) {
    var alpha = alphaMapFilter.image;
    this.getComposer_().applyAlphaMap(this.image_, alpha);
  }
};

/** @override */
createjs.Bitmap.prototype.removeAllChildren = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  this.handleDetach();
  this.image_ = null;
  this.source_ = null;
  this.ready_ = false;
};

/** @override */
createjs.Bitmap.prototype.handleDetach = function() {
  var image = this.getSourceImage_();
  if (image && this.output_) {
    // Detach the WebGLTexture object attached to this image.
    this.output_.uncache(image);
    this.output_ = null;
  }
  if (this.composer_) {
    this.composer_.destroy();
    this.composer_ = null;
  }
};

if (createjs.USE_PIXEL_TEST) {
  /** @override */
  createjs.Bitmap.prototype.hitTestObject = function(point, types, bubble) {
    var object = createjs.DisplayObject.prototype.hitTestObject.call(
        this, point, types, bubble);
    if (object) {
      // Return the cached result if the given point is sufficiently close to
      // the last one. This method is often called twice with the same position
      // when a user taps on this bitmap: one is for a 'touchdown' event, and
      // the other is for a 'touchup' event.
      if (this.hitTestPoint_) {
        var dx = this.hitTestPoint_.x - point.x;
        var dy = this.hitTestPoint_.y - point.y;
        if (dx * dx + dy * dy <= 4) {
          return this.hitTestResult_;
        }
        this.hitTestPoint_.x = point.x;
        this.hitTestPoint_.y = point.y;
      } else {
        this.hitTestPoint_ = new createjs.Point(point.x, point.y);
      }
      var local = new createjs.Point(point.x, point.y);
      this.getInverse().transformPoint(local);
      if (this.source_) {
        local.x += this.source_.x;
        local.y += this.source_.y;
      }
      // Draw this bitmap to the 1x1 <canvas> element used for hit-testing and
      // read its pixel. (This <canvas> element uses the "copy" composite
      // operation to discard the destination pixels in drawing this bitmap,
      // i.e. it is unnecessary to clear the <canvas> element explicitly
      // before drawing this bitmap.)
      var context = createjs.Bitmap.hitTestContext_;
      if (!context) {
        var canvas = createjs.createCanvas();
        canvas.width = 1;
        canvas.height = 1;
        createjs.Bitmap.hitTestCanvas_ = canvas;
        context = createjs.getRenderingContext2D(canvas);
        context.globalCompositeOperation = 'copy';
        createjs.Bitmap.hitTestContext_ = context;
      }
      context.drawImage(this.image_, -local.x, -local.y);
      var pixels = context.getImageData(0, 0, 1, 1);
      if (!pixels.data[3]) {
        object = null;
      }
      this.hitTestResult_ = object;
    }
    return object;
  };
}

/** @override */
createjs.Bitmap.prototype.paintObject = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  var matrix = this.getColorMatrix();
  if (matrix) {
    renderer.setColorMatrix(matrix);
  }
  var image = /** @type {HTMLImageElement} */ (this.getSourceImage_());
  var source = this.source_;
  var x = this.offset_.x;
  var y = this.offset_.y;
  var width = source.width;
  var height = source.height;
  renderer.drawPartial(image,
      source.x, source.y, width, height,
      x, y, width, height);
  if (matrix) {
    renderer.setColorMatrix(null);
  }
};

/** @override */
createjs.Bitmap.prototype.isVisible = function() {
  /// <returns type="boolean"/>
  return this.ready_ && createjs.Bitmap.superClass_.isVisible.call(this);
};

// Add a getter and a setter for applications to access internal variables.
Object.defineProperties(createjs.Bitmap.prototype, {
  'image': {
    get: createjs.Bitmap.prototype.getImage,
    set: createjs.Bitmap.prototype.setImage
  },
  'sourceRect': {
    get: createjs.Bitmap.prototype.getSourceRect,
    set: createjs.Bitmap.prototype.setSourceRect
  }
});

// Export the createjs.Bitmap object to the global namespace.
createjs.exportObject('createjs.Bitmap', createjs.Bitmap, {
});
