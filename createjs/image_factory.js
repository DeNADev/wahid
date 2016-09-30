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
/// <reference path="event.js"/>

/**
 * A singleton class that creates HTMLImageElement objects used in this library.
 * @constructor
 */
createjs.ImageFactory = function() {
  /**
   * The images created by this object.
   * @type {Object.<string,HTMLImageElement>}
   * @private
   */
  this.images_ = {};
};

/**
 * The instance of the createjs.ImageFactory object.
 * @type {createjs.ImageFactory}
 * @private
 */
createjs.ImageFactory.instance_ = null;

/**
 * Returns the global instance of the createjs.ImageFactory object.
 * @return {createjs.ImageFactory}
 * @private
 */
createjs.ImageFactory.getInstance_ = function() {
  /// <returns type="createjs.ImageFactory"/>
  if (!createjs.ImageFactory.instance_) {
    createjs.ImageFactory.instance_ = new createjs.ImageFactory();
  }
  return createjs.ImageFactory.instance_;
};

/**
 * Creates an HTMLImageElement object.
 * @param {string} path
 * @param {string} source
 * @param {EventListener} listener
 * @param {number} format
 * @return {HTMLImageElement}
 * @private
 */
createjs.ImageFactory.create_ = function(path, source, listener, format) {
  /// <param type="string" name="path"/>
  /// <param type="string" name="source"/>
  /// <param type="EventListener" name="listener"/>
  /// <param type="number" name="format"/>
  /// <returns type="HTMLImageElement"/>
  var image = /** @type {HTMLImageElement} */ (document.createElement('img'));
  var scheme = (source.charCodeAt(0) << 24) + (source.charCodeAt(1) << 16) +
      (source.charCodeAt(2) << 8) + source.charCodeAt(3);
  if (scheme != 0x64617461) {
    // Set the crossOrigin attribute only when the given URI is not a Data URI.
    // Mobile Safari throws an exception when it creates a WebGL texture from
    // an anonymously-shared HTMLImageElement object with its source a Data URI.
    image.crossOrigin = 'anonymous';
  }
  image.addEventListener('load', listener, false);
  image.addEventListener('error', listener, false);
  image.format_ = format;
  image.src = source;
  return image;
};

/**
 * Retrieves an HTMLImageElement object spooled by the createjs.ImageFactory
 * object.
 * @param {string} path
 * @param {string} source
 * @param {EventListener} listener
 * @param {number} format
 * @return {HTMLImageElement}
 * @const
 */
createjs.ImageFactory.get = function(path, source, listener, format) {
  /// <param type="string" name="path"/>
  /// <param type="string" name="source"/>
  /// <param type="EventListener" name="listener"/>
  /// <param type="number" name="format"/>
  /// <returns type="HTMLImageElement"/>
  var instance = createjs.ImageFactory.getInstance_();
  var image = instance.images_[path];
  if (!image) {
    image = createjs.ImageFactory.create_(path, source, listener, format);
    instance.images_[path] = image;
  } else if (!image.complete) {
    // This cached image is created by another object and being loaded now. Add
    // the specified listener so the image calls its handleEvent() method as
    // well.
    image.addEventListener('load', listener, false);
    image.addEventListener('error', listener, false);
  }
  return image;
};

/**
 * Removes all event listeners attached by the 'createjs.ImageFactory.get()'
 * method.
 * @param {EventTarget} image
 * @param {EventListener} listener
 * @const
 */
createjs.ImageFactory.removeListeners = function(image, listener) {
  image.removeEventListener('load', listener, false);
  image.removeEventListener('error', listener, false);
};

/**
 * Deletes all images attached to the createjs.ImageFactory object.
 * @param {boolean=} opt_destroy
 * @return {Object.<string,HTMLImageElement>}
 * @const
 */
createjs.ImageFactory.reset = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  /// <return type="Object"/>
  var instance = createjs.ImageFactory.instance_;
  if (!instance) {
    return null;
  }
  var images = instance.images_;
  if (opt_destroy) {
    instance.images_ = {};
  }
  return images;
};
