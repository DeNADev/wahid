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
/// <reference path="config.js"/>
/// <reference path="image_factory.js"/>
/// <reference path="location.js"/>
/// <reference path="progress_event.js"/>
/// <reference path="script_factory.js"/>
/// <reference path="user_agent.js"/>

/**
 * A class that loads a file either from a server or from a cache.
 * @param {createjs.Loader.Listener} listener
 * @param {createjs.Loader.Item} item
 * @implements {EventListener}
 * @implements {createjs.Loader.Cache.Listener}
 * @constructor
 */
createjs.Loader = function(listener, item) {
  /**
   * The listener who listens events from this loader.
   * @type {createjs.Loader.Listener}
   * @private
   */
  this.listener_ = listener;

  /**
   * The item loaded by this loader.
   * @type {createjs.Loader.Item}
   * @private
   */
  this.item_ = item;
};

/**
 * Item types.
 * @enum {number}
 */
createjs.Loader.Type = {
  UNKNOWN: 0,
  IMAGE: 1,
  SOUND: 2,
  JSON: 3,
  CSS: 4,
  SCRIPT: 5,
  MANIFEST: 6,
  TEXT: 7,
  VIDEO: 8,
  HTML: 9
};

/**
 * String representations of the above item types.
 * @const {Array.<string>}
 * @private
 */
createjs.Loader.TYPE_NAMES_ = [
  '',
  'image',
  'sound',
  'json',
  'css',
  'javascript',
  'manifest',
  'text',
  'video',
  'html'
];

/**
 * Extension IDs.
 * @enum {number}
 */
createjs.Loader.Extension = {
  JPEG: 0,
  JPG: 1,
  GIF: 2,
  PNG: 3,
  WEBP: 4,
  BMP: 5,
  OGG: 6,
  MP3: 7,
  MP4: 8,
  M4A: 9,
  WAV: 10,
  JSON: 11,
  CSS: 12,
  JS: 13
};

/**
 * The default loaders.
 * @const {Array.<number>}
 * @private
 */
createjs.Loader.LOADER_TYPES_ = [
  createjs.Loader.Type.IMAGE,   // createjs.Loader.Extension.JPEG
  createjs.Loader.Type.IMAGE,   // createjs.Loader.Extension.JPG
  createjs.Loader.Type.IMAGE,   // createjs.Loader.Extension.GIF
  createjs.Loader.Type.IMAGE,   // createjs.Loader.Extension.PNG
  createjs.Loader.Type.IMAGE,   // createjs.Loader.Extension.WEBP
  createjs.Loader.Type.IMAGE,   // createjs.Loader.Extension.BMP
  createjs.Loader.Type.SOUND,   // createjs.Loader.Extension.OGG
  createjs.Loader.Type.SOUND,   // createjs.Loader.Extension.MP3
  createjs.Loader.Type.SOUND,   // createjs.Loader.Extension.MP4
  createjs.Loader.Type.SOUND,   // createjs.Loader.Extension.M4A
  createjs.Loader.Type.SOUND,   // createjs.Loader.Extension.WAV
  createjs.Loader.Type.JSON,    // createjs.Loader.Extension.JSON
  createjs.Loader.Type.CSS,     // createjs.Loader.Extension.CSS
  createjs.Loader.Type.SCRIPT   // createjs.Loader.Extension.JS
];

/**
 * An interface that listens events from a createjs.Loader object. This
 * interface is used by the createjs.LoadQueue class to dispatch events to
 * games.
 * @interface
 */
createjs.Loader.Listener = function() {};

/**
 * Called when a loader finishes loading a file.
 * @param {createjs.Loader} loader
 */
createjs.Loader.Listener.prototype.handleFileComplete = function(loader) {};

/**
 * Called when an error occurs while loading a file.
 * @param {createjs.Loader} loader
 * @param {string} type
 * @param {string} message
 */
createjs.Loader.Listener.prototype.handleFileError =
    function(loader, type, message) {};

/**
 * A class that represents an item to be loaded by the createjs.Loader object.
 * @constructor
 */
createjs.Loader.Item = function() {
};

/**
 * An interface that listens events from a createjs.Loader.Item object. This
 * interface allows to add a custom task after the createjs.Loader.Item class
 * finishes loading data. (In fact, the createjs.Sound class uses this interface
 * to decode sound data after the createjs.Loader.Item class finishes loading a
 * sound file.)
 * @interface
 */
createjs.Loader.Item.Listener = function() {};

/**
 * Called when a loader finishes loading a file.
 * @param {createjs.Loader} loader
 * @param {ArrayBuffer} buffer
 * @return {boolean}
 */
createjs.Loader.Item.Listener.prototype.handleLoad =
    function(loader, buffer) {};

/**
 * The ID used by CreateJS to identify this item.
 * @type {string}
 */
createjs.Loader.Item.prototype.id = '';

/**
 * The raw response from a server if this item refers to a text file.
 * @type {string}
 */
createjs.Loader.Item.prototype.resultText = '';

/**
 * The raw response from a server if this item refers to a binary file.
 * @type {ArrayBuffer}
 */
createjs.Loader.Item.prototype.resultBuffer = null;

/**
 * The loaded data.
 * @type {*}
 */
createjs.Loader.Item.prototype.resultObject = null;

/**
 * The source URL of this item.
 * @type {string}
 * @private
 */
createjs.Loader.Item.prototype.source_ = '';

/**
 * Whether this item should encapsulate its response to an HTMLElement object.
 * @type {boolean}
 * @private
 */
createjs.Loader.Item.prototype.tag_ = false;

/**
 * The content-type ID of this item.
 * @type {number}
 * @private
 */
createjs.Loader.Item.prototype.type_ = createjs.Loader.Type.UNKNOWN;

if (createjs.USE_CACHE) {
  /**
   * Whether this item should be read from our cache.
   * @type {boolean}
   * @private
   */
  createjs.Loader.Item.prototype.cache_ = false;
}

/**
 * The user-defined object. This object is to be attached to a 'complete' event
 * so event listeners can use it.
 * @type {Object}
 * @private
 */
createjs.Loader.Item.prototype.values_ = null;

/**
 * The file-extension ID of this item.
 * @type {number}
 * @private
 */
createjs.Loader.Item.prototype.extension_ = -1;

/**
 * The absolute URL of this item.
 * @type {string}
 * @private
 */
createjs.Loader.Item.prototype.path_ = '';

/**
 * The listener that listens events for this item.
 * @type {createjs.Loader.Item.Listener}
 * @private
 */
createjs.Loader.Item.prototype.listener_ = null;

/**
 * The format of a WebGL texture to be created from this item. The WebGL
 * renderer creates an UNSIGNED_BYTE (full-color) texture when a game does not
 * specify the format.
 *   +-------+------------------------+
 *   | value | texture format         |
 *   +-------+------------------------+
 *   | 0     | UNSIGNED_BYTE          |
 *   | 1     | UNSIGNED_SHORT_4_4_4_4 |
 *   | 2     | UNSIGNED_SHORT_5_5_5_1 |
 *   | 3     | UNSIGNED_SHORT_5_6_5   |
 *   +-------+------------------------+
 * @type {number}
 * @private
 */
createjs.Loader.Item.prototype.format_ = 0;

/**
 * Whether a loader should wait this item to be decoded.
 * @type {boolean}
 * @private
 */
createjs.Loader.Item.prototype.synchronous_ = false;

/**
 * Returns an extension ID.
 * @param {string} extension
 * @return {number}
 * @private
 */
createjs.Loader.Item.getExtension_ = function(extension) {
  /// <param type="string" name="extension"/>
  /// <returns type="number"/>
  var TYPES = {
    'jpeg': createjs.Loader.Extension.JPEG,
    'jpg': createjs.Loader.Extension.JPG,
    'gif': createjs.Loader.Extension.GIF,
    'png': createjs.Loader.Extension.PNG,
    'webp': createjs.Loader.Extension.WEBP,
    'bmp': createjs.Loader.Extension.BMP,
    'ogg': createjs.Loader.Extension.OGG,
    'mp3': createjs.Loader.Extension.MP3,
    'mp4': createjs.Loader.Extension.MP4,
    'm4a': createjs.Loader.Extension.M4A,
    'wav': createjs.Loader.Extension.WAV,
    'json': createjs.Loader.Extension.JSON,
    'css': createjs.Loader.Extension.CSS,
    'js': createjs.Loader.Extension.JS
  };
  return TYPES[extension] || -1;
};

/**
 * Returns a loader type from the specified extension ID.
 * @param {number} extension
 * @return {number}
 * @private
 */
createjs.Loader.Item.getType_ = function(extension) {
  /// <param type="number" name="extension"/>
  /// <returns type="number"/>
  createjs.assert(0 <= extension &&
                  extension < createjs.Loader.LOADER_TYPES_.length);
  return createjs.Loader.LOADER_TYPES_[extension];
};

/**
 * Initializes this item. This method initializes internal variables used in
 * loading this item.
 * @param {Object} values
 * @param {string} basePath
 * @const
 */
createjs.Loader.Item.prototype.initializeItem = function(values, basePath) {
  /// <param type="Object" name="values"/>
  /// <param type="string" name="basePath"/>
  this.importValues(values);
  var target = new createjs.Location(this.source_);
  this.extension_ = createjs.Loader.Item.getExtension_(target.getExtension());
  if (!this.type_) {
    if (this.extension_ >= 0) {
      this.type_ = createjs.Loader.Item.getType_(this.extension_);
      this.values_['type'] = createjs.Loader.TYPE_NAMES_[this.type_];
    }
  }
  // Prepend basePath when the input path is a relative one.
  if (!target.protocol && target.isRelative()) {
    this.path_ = basePath + this.source_;
  } else {
    this.path_ = this.source_;
  }
  // Set whether this item needs an HTMLElement object to store the result. The
  // createjs.Sound class always uses the WebAudio API to play audio files on
  // iPhone devices and it does not need HTMLAudioElement objects.
  if (this.isImage() || this.isScript() || this.isCSS() || this.isVideo()) {
    this.tag_ = true;
  } else if (this.isSound()) {
    this.tag_ = !createjs.AudioContext;
  }
  // Set the generated ID to this item if an application has not set it.
  if (!this.id) {
    this.id = this.source_;
  }
};

/**
 * Imports values from an Object.
 * @param {Object} values
 * @const
 */
createjs.Loader.Item.prototype.importValues = function(values) {
  /// <param type="Object" name="values"/>
  var src = values['src'];
  if (src) {
    this.source_ = createjs.getString(src);
  }
  var type = values['type'];
  if (type) {
    var name = createjs.getString(type);
    var NAMES = createjs.Loader.TYPE_NAMES_;
    for (var i = 1; i < NAMES.length; ++i) {
      if (NAMES[i] == name) {
        this.type_ = i;
        break;
      }
    }
  }
  var id = values['id'];
  if (id != null) {
    this.id = createjs.parseString(id);
  }
  if (createjs.USE_CACHE) {
    if (createjs.Loader.getCache()) {
      this.cache_ = !!values['cache'];
    }
    values['_cache'] = 0;
  }
  this.format_ = createjs.castNumber(values['format']) || 0;
  this.synchronous_ = !!values['sync'];
  this.values_ = values;
};

/**
 * Exports values to an Object.
 * @return {Object}
 * @const
 */
createjs.Loader.Item.prototype.exportValues = function() {
  /// <returns type="Object"/>
  return this.values_;
};

/**
 * Retrieves the source path.
 * @return {string}
 * @const
 */
createjs.Loader.Item.prototype.getSource = function() {
  /// <returns type="string"/>
  return this.source_;
};

/**
 * Sets the source path.
 * @param {string} source
 * @const
 */
createjs.Loader.Item.prototype.setSource = function(source) {
  /// <param type="string" name="source"/>
  this.source_ = source;
};

/**
 * Returns whether this item is a binary file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isBinary = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.IMAGE ||
         this.type_ == createjs.Loader.Type.SOUND ||
         this.type_ == createjs.Loader.Type.VIDEO;
};

/**
 * Returns whether this item is a text file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isText = function() {
  /// <returns type="boolean"/>
  return !this.isBinary();
};

/**
 * Returns whether this item is an image file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isImage = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.IMAGE;
};

/**
 * Returns whether this item is an audio file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isSound = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.SOUND;
};

/**
 * Returns whether this item is a script file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isScript = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.SCRIPT;
};

/**
 * Returns whether this item is a CSS file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isCSS = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.CSS;
};

/**
 * Returns whether this item is a JSON file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isJSON = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.JSON;
};

/**
 * Returns whether this item is a manifest file.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isManifest = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.MANIFEST;
};

/**
 * Returns whether this item is a video clip.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isVideo = function() {
  /// <returns type="boolean"/>
  return this.type_ == createjs.Loader.Type.VIDEO;
};

/**
 * Returns the method name.
 * @return {string}
 * @const
 */
createjs.Loader.Item.prototype.getMethod = function() {
  /// <returns type="string"/>
  return 'GET';
};

/**
 * Returns the extension of this item.
 * @return {number}
 * @const
 */
createjs.Loader.Item.prototype.getExtension = function() {
  /// <returns type="number"/>
  return this.extension_;
};

/**
 * Returns the listener attached to this item.
 * @return {createjs.Loader.Item.Listener}
 * @const
 */
createjs.Loader.Item.prototype.getListener = function() {
  /// <returns type="createjs.Loader.Item.Listener"/>
  return this.listener_;
};

/**
 * Attaches a listener to this item.
 * @param {createjs.Loader.Item.Listener} listener
 * @const
 */
createjs.Loader.Item.prototype.setListener = function(listener) {
  /// <param type="createjs.Loader.Item.Listener" name="listener"/>
  this.listener_ = listener;
};

/**
 * Returns whether this item is a PNG image.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isPng = function() {
  /// <returns type="boolean"/>
  return this.extension_ == createjs.Loader.Extension.PNG;
};

/**
 * Returns whether a listener can handle this item synchronously. The
 * createjs.Loader class waits for a listener to handle this item if this
 * function returns true.
 * @return {boolean}
 * @const
 */
createjs.Loader.Item.prototype.isSynchronous = function() {
  /// <returns type="boolean"/>
  return this.synchronous_;
};

/**
 * Returns an mime-type string of this item.
 * @return {string}
 * @private
 */
createjs.Loader.Item.prototype.getMime = function() {
  /// <returns type="string"/>
  /**
   * The MIME types associated with extension IDs.
   * @const {Array.<string>}
   */
  var MIME_TYPES = [
    'image/jpeg',        // createjs.Loader.Extension.JPEG
    'image/jpeg',        // createjs.Loader.Extension.JPG
    'image/gif',         // createjs.Loader.Extension.GIF
    'image/png',         // createjs.Loader.Extension.PNG
    'image/webp',        // createjs.Loader.Extension.WEBP
    'image/bmp',         // createjs.Loader.Extension.BMP
    'audio/ogg',         // createjs.Loader.Extension.OGG
    'audio/mpeg',        // createjs.Loader.Extension.MP3
    'audio/mp4',         // createjs.Loader.Extension.MP4
    'audio/mp4',         // createjs.Loader.Extension.M4A
    'audio/wav',         // createjs.Loader.Extension.WAV
    'application/json',  // createjs.Loader.Extension.JSON
    'text/css',          // createjs.Loader.Extension.CSS
    'text/javascript'    // createjs.Loader.Extension.JS
  ];
  var id = this.extension_;
  createjs.assert(0 <= id && id < MIME_TYPES.length);
  return MIME_TYPES[id];
};

/**
 * An interface that enumerates methods to access a cache storage used by the
 * createjs.Loader object and its derivatives.
 * @interface
 */
createjs.Loader.Cache = function() {};

/**
 * Returns whether this cache storage is opened.
 * @return {boolean}
 */
createjs.Loader.Cache.prototype.isOpened = function() {};

/**
 * Writes a key-value pair.
 * @param {createjs.Loader.Cache.Listener} listener
 * @param {string} key
 * @param {*} value
 */
createjs.Loader.Cache.prototype.set = function(listener, key, value) {};

/**
 * Reads a key-value pair.
 * @param {createjs.Loader.Cache.Listener} listener
 * @param {string} key
 * @return {boolean}
 */
createjs.Loader.Cache.prototype.get = function(listener, key) {};

/**
 * Resets the cache.
 */
createjs.Loader.Cache.prototype.reset = function() {};

/**
 * An interface that listens events from a createjs.Loader.Cache object.
 * @interface
 */
createjs.Loader.Cache.Listener = function() {};

/**
 * Called when a browser has successfully read a key-value pair from a cache.
 * @param {string} key
 * @param {*} data
 */
createjs.Loader.Cache.Listener.prototype.handleGetSuccess =
    function(key, data) {};

/**
 * Called when there is an error while a browser reads a key-value pair from a
 * cache.
 * @param {string} key
 */
createjs.Loader.Cache.Listener.prototype.handleGetError = function(key) {};

/**
 * Called when a browser has successfully written a key-value pair to a cache.
 * @param {string} key
 */
createjs.Loader.Cache.Listener.prototype.handlePutSuccess = function(key) {};

/**
 * Called when there is an error while a browser writes a key-value pair to a
 * cache.
 * @param {string} key
 */
createjs.Loader.Cache.Listener.prototype.handlePutError = function(key) {};

/**
 * The listener who listens events from this loader.
 * @type {createjs.Loader.Listener}
 * @private
 */
createjs.Loader.prototype.listener_ = null;

/**
 * The item this loader represents.
 * @type {createjs.Loader.Item}
 * @private
 */
createjs.Loader.prototype.item_ = null;

/**
 * Whether this loader has finished loading files.
 * @type {boolean}
 * @private
 */
createjs.Loader.prototype.loaded_ = false;

/**
 * Whether this loader has been canceled loading files.
 * @type {boolean}
 * @private
 */
createjs.Loader.prototype.canceled_ = false;

/**
 * The current load progress (percentage) for this item.
 * @type {number}
 * @private
 */
createjs.Loader.prototype.progress_ = 0;

/**
 * An XMLHttpRequet object used to load content.
 * @type {XMLHttpRequest}
 * @private
 */
createjs.Loader.prototype.request_ = null;

/**
 * Determines if the load has been canceled.
 * @return {boolean}
 * @private
 */
createjs.Loader.prototype.isCanceled_ = function() {
  /// <returns type="boolean"/>
  return this.canceled_;
};

/**
 * Changes the loading progress.
 * @param {number} progress
 * @private
 */
createjs.Loader.prototype.setProgress_ = function(progress) {
  /// <param type="number" name="progress"/>
  this.progress = progress;
};

/**
 * Creates an object URL from an ArrayBuffer object.
 * @param {string} type
 * @param {ArrayBuffer} buffer
 * @return {string}
 * @private
 */
createjs.Loader.prototype.createObjectURL_ = function(type, buffer) {
  /// <param type="string" name="type"/>
  /// <param type="ArrayBuffer" name="buffer"/>
  /// <returns type="string"/>
  // Use the webkitBlobBuilder class to create a Blob object only when it is
  // defined. This is a workaround for Android browsers (Android 4.3 or
  // earlier.)
  var blob;
  if (createjs.BlobBuilder) {
    var builder = new createjs.BlobBuilder();
    builder.append(buffer);
    blob = builder.getBlob(type);
  } else {
    blob = new Blob([buffer], { 'type': type });
  }
  return createjs.URL['createObjectURL'](blob);
};

/**
 * Cleans all resources attached to this object.
 * @private
 */
createjs.Loader.prototype.clean_ = function() {
  if (this.request_) {
    var request = this.request_;
    request.removeEventListener('error', this, false);
    request.removeEventListener('load', this, false);
    this.request_ = null;
  }
};

/**
 * Creates a new XMLHttpRequest object.
 * @param {createjs.Loader.Item} item
 * @param {string} path
 * @return {XMLHttpRequest}
 * @private
 */
createjs.Loader.prototype.getRequest_ = function(item, path) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <param type="string" name="path"/>
  /// <returns type="XMLHttpRequest"/>
  if (!createjs.USE_CACHE) {
    // It is somehow slow for Mobile Safari on iOS 6 to draw an image with its
    // source a Data URI. To avoid this issue, this loader always uses an
    // HTMLImageElement object to load an image.
    if (item.isImage() || (item.isSound() && item.tag_)) {
      return null;
    }
  } else {
    // Use XMLHttpRequest objects only when the host browser satisfies all the
    // following conditions:
    // * It has to write this image to a cache, and;
    // * It can create Blob URLs.
    if (item.isImage()) {
      if (!item.cache_  || !createjs.URL) {
        return null;
      }
    } else if (item.isSound() && item.tag_) {
      // Do not use XMLHttpRequest objects when SoundJS uses <audio> elements
      // to play sounds. (Android 4.4 WebViews cannot use a Blob URL as the
      // source of an <audio> element.)
      return null;
    }
  }
  // Return an HTMLScriptElement spooled in the createjs.ScriptFactory object
  // when an application requests the same script file multiple times.
  if (item.isScript() && createjs.ScriptFactory.exist(path)) {
    return null;
  }
  // Create an XMLHttpRequest object and open the above URL. Unfortunately, not
  // all browsers (e.g. Android 2.3) support XMLHttpRequest Level 2, which is
  // necessary for loading binary files. Set the URL to the src properties of
  // the output element directly as a workaround for such browsers.
  var request = new XMLHttpRequest();
  if (item.isBinary() && request.responseType == null) {
    return null;
  }
  return request;
};

/**
 * Sends an XML HTTP request.
 * @private
 */
createjs.Loader.prototype.sendRequest_ = function() {
  // Format a URL to be opened by an XMLHttpRequest object.
  var item = this.getItem();
  var path = item.path_;
  var request = this.getRequest_(item, path);
  if (!request) {
    this.handleLoadComplete_(item, path);
    return;
  }
  request.open(item.getMethod(), path, true);

  // Attach this object to XMLHttpRequest events.
  request.addEventListener('error', this, false);
  request.addEventListener('load', this, false);

  // Add item-specific headers to this request.
  if (item.isText()) {
    request.overrideMimeType('text/plain; charset=utf-8');
  }
  if (item.isBinary()) {
    request.responseType = 'arraybuffer';
  }
  request.send();
  this.request_ = request;
};

/**
 * Creates a result string.
 * @param {createjs.Loader.Item} item
 * @param {*} response
 * @return {string}
 * @private
 */
createjs.Loader.prototype.getResult_ = function(item, response) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <param name="response"/>
  /// <returns type="string"/>
  if (!item.isBinary()) {
    var text = createjs.getString(response);
    item.resultText = text;
    return text;
  }
  var buffer = /** @type {ArrayBuffer} */ (response);
  item.resultBuffer = buffer;
  if (!item.tag_) {
    // Return an empty string if this loader does not have to create an HTML
    // element, i.e. this item is a sound file to be played with the WebAudio
    // API.
    return '';
  }
  // Create an object URL for the response if this loader needs to create an
  // HTML element, i.e. this item is a sound file to be set to an <audio>
  // element or an image file to be set to an <img> element. (Object URLs are
  // supported by all browsers except Android browsers on Android 2.3, which
  // cannot use XMLHttpRequest objects to get binary files. So, it is safe to
  // always create object URLs here.)
  var type = this.request_.getResponseHeader('Content-Type');
  return this.createObjectURL_(type, buffer);
};

/**
 * Creates a type-specific result.
 * @param {createjs.Loader.Item} item
 * @param {string} result
 * @return {boolean}
 * @private
 */
createjs.Loader.prototype.setResult_ = function(item, result) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <param type="string" name="result"/>
  /// <returns type="boolean"/>
  this.loaded_ = true;
  if (item.isImage()) {
    var image =
        createjs.ImageFactory.get(item.path_, result, this, item.format_);
    item.resultObject = image;
    return image.complete;
  }
  if (item.isSound()) {
    if (!item.tag_) {
      // Call the listener attached to the loaded item to decode this sound
      // so a game can play it when it receives a 'fileload' event.
      var listener = item.getListener();
      if (listener) {
        var buffer = /** @type {ArrayBuffer} */ (item.resultBuffer);
        item.resultBuffer = null;
        return listener.handleLoad(this, buffer);
      }
      return true;
    }
    var audio =
        /** @type {HTMLAudioElement} */ (document.createElement('audio'));
    if (createjs.DEBUG) {
      audio.id = item.path_;
    }
    audio.autoplay = false;
    audio.src = result;
    item.resultObject = audio;
    return true;
  }
  if (item.isScript()) {
    item.resultObject = createjs.ScriptFactory.get(item.path_, result);
    return true;
  }
  if (item.isCSS()) {
    var style =
        /** @type {HTMLStyleElement} */ (document.createElement('style'));
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = result;
    } else {
      style.appendChild(document.createTextNode(result));
    }
    document.head.appendChild(style);
    item.resultObject = style;
    return true;
  }
  if (item.isJSON() || item.isManifest()) {
    item.resultObject = JSON.parse(result);
    return true;
  }
  if (item.isVideo()) {
    var video =
        /** @type {HTMLVideoElement} */ (document.createElement('video'));
    if (createjs.DEBUG) {
      video.id = item.path_;
    }
    // Set 'anonymous' to the crossOrigin attribute of this <video> element to
    // create a WebGL texture from the element. (Mobile Safari throws an
    // exception in creating a WebGL texture from an anonymously-shared <video>
    // element and we except this result URL must not be a Data URI.)
    video.crossOrigin = 'anonymous';
    video.src = result;
    item.resultObject = video;
    return true;
}
  item.resultObject = result;
  return true;
};

/**
 * Dispatches an error event to listeners.
 * @param {string} type
 * @param {string} message
 * @private
 */
createjs.Loader.prototype.dispatchError_ = function(type, message) {
  /// <param type="string" name="type"/>
  /// <param type="string" name="message"/>
  this.clean_();
  if (!this.isCanceled_()) {
    this.listener_.handleFileError(this, type, message);
  }
};

/**
 * Called when this loader finishes loading a file successfully.
 * @param {createjs.Loader.Item} item
 * @param {string} result
 * @private
 */
createjs.Loader.prototype.handleLoadComplete_ = function(item, result) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <param type="string" name="result"/>
  if (this.setResult_(item, result)) {
    if (!this.isCanceled_()) {
      this.listener_.handleFileComplete(this);
      this.canceled_ = true;
    }
  }
};

/**
 * Called when the XMLHttpRequest object has finished loading data.
 * @param {Event} event
 * @private
 */
createjs.Loader.prototype.handleLoad_ = function(event) {
  /// <param type="Event" name="event"/>
  var status = createjs.getNumber(this.request_.status);
  if (status != 200) {
    this.dispatchError_('error', '');
    return;
  }
  var item = this.getItem();
  var response = this.request_.response || this.request_.responseText;
  var result = this.getResult_(item, response);
  if (createjs.USE_CACHE && item.cache_) {
    // Write the loaded data to the cache storage only when it is open. (Indexed
    // database allows adding ArrayBuffer values as well as strings.)
    var cache = createjs.Loader.getCache();
    if (cache && cache.isOpened()) {
      cache.set(this, item.path_, response);
    }
  }
  this.clean_();
  this.handleLoadComplete_(item, result);
  item.resultBuffer = null;
};

/**
 * Retrieves the current loading progress.
 * @return {number}
 * @const
 */
createjs.Loader.prototype.getProgress = function() {
  /// <returns type="number"/>
  return this.progress_;
};

/**
 * Returns a reference to the manifest item.
 * @return {createjs.Loader.Item}
 * @const
 */
createjs.Loader.prototype.getItem = function() {
  /// <returns type="createjs.Loader.Item"/>
  return this.item_;
};

/**
 * Starts loading the item associated with this object.
 * @const
 */
createjs.Loader.prototype.load = function() {
  var item = this.getItem();
  if (!createjs.USE_CACHE) {
    this.sendRequest_();
    return;
  }
  var cache = createjs.Loader.getCache();
  if (!cache || !item.cache_ || !cache.get(this, this.getItem().path_)) {
    this.sendRequest_();
  }
};

/**
 * Cancels loading this item.
 * @const
 */
createjs.Loader.prototype.cancel = function() {
  this.canceled = true;
  this.clean_();
  this.request_.abort();
};

/**
 * Sends a completion event (or an error event) to the listener attached to this
 * loader, i.e. a createjs.LoadQueue object that owns this loader.
 * @param {boolean} error
 * @param {AudioBuffer} buffer
 * @const
 */
createjs.Loader.prototype.sendFileComplete = function(error, buffer) {
  /// <param type="boolean" name="error"/>
  /// <param type="AudioBuffer" name="buffer"/>
  var item = this.getItem();
  if (error) {
    this.dispatchError_('error', '');
  } else {
    item.resultObject = buffer;
    if (!this.isCanceled_()) {
      this.listener_.handleFileComplete(this);
    }
  }
};

/** @override */
createjs.Loader.prototype.handleGetSuccess = function(key, data) {
  this.loaded_ = true;
  this.setProgress_(1);
  var item = this.getItem();
  if (!item.tag_) {
    item.resultBuffer = createjs.castArrayBuffer(data);
  }
  item.values_['_cache'] = 1;
  var result;
  if (item.isImage()) {
    // Create an object URL from the cached data so this loader can set it to an
    // <img> element.
    var type = item.getMime();
    result = this.createObjectURL_(type, createjs.castArrayBuffer(data));
  } else if (createjs.isString(data)) {
    // This data is one of a CSS file, a JavaScript one, or a JSON manifest.
    result = createjs.castString(data);
  } else if (item.isVideo()) {
    // Treat the cached data as an MPEG-4 video clip and create an object URL
    // from the data. It is OK to always treat the cached data as MPEG-4 video
    // clips because this loader can load MPEG-4 video clips only.
    result = this.createObjectURL_('video/mp4', createjs.castArrayBuffer(data));
  } else {
    result = '';
  }
  this.handleLoadComplete_(item, result);
};

/** @override */
createjs.Loader.prototype.handleGetError = function(key) {
  this.sendRequest_();
};

/** @override */
createjs.Loader.prototype.handlePutSuccess = function(key) {
};

/** @override */
createjs.Loader.prototype.handlePutError = function(key) {
};

/** @override */
createjs.Loader.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  var target = event.target;
  if (target instanceof HTMLImageElement) {
    createjs.ImageFactory.removeListeners(target, this);
  }
  var type = event.type;
  if (type == 'load') {
    if (!this.loaded_) {
      this.handleLoad_(event);
    } else {
      if (!this.isCanceled_()) {
        this.listener_.handleFileComplete(this);
      }
    }
  } else {
    this.dispatchError_(type, '');
  }
};

/**
 * A class that implements the createjs.Loader.Cache interface with the
 * IndexedDB API. This cache uses one table consisting of three columns:
 *   key (string), time (integer), and data (binary).
 * @implements {createjs.Loader.Cache}
 * @constructor
 */
createjs.Loader.IndexedDB = function() {
};

/**
 * Represents whether a transaction is a read one.
 * @const {number}
 * @private
 */
createjs.Loader.IndexedDB.READ_ = 0;

/**
 * Represents whether a transaction is a write one.
 * @const {number}
 * @private
 */
createjs.Loader.IndexedDB.WRITE_ = 1;

/**
 * The interface to access the cache database.
 * @type {IDBDatabase}
 * @private
 */
createjs.Loader.IndexedDB.database_ = null;

/**
 * Returns the instance of the createjs.Loader.IndexedDB object.
 * @return {createjs.Loader.IndexedDB}
 * @const
 */
createjs.Loader.IndexedDB.getInstance = function() {
  /// <returns type="createjs.Loader.IndexedDB"/>
  // Disable the Indexed Database cache on Android browsers. Even though some
  // Android browsers (e.g. SO-04E) provides the Indexed Database API, it throws
  // exceptions.
  if (!createjs.global.indexedDB ||
      (createjs.UserAgent.isAndroid() && !createjs.UserAgent.isChrome())) {
    return null;
  }
  return new createjs.Loader.IndexedDB();
};

/**
 * Retrieves the database request from an Event object.
 * @param {Event} event
 * @return {IDBRequest}
 * @private
 */
createjs.Loader.IndexedDB.getRequest_ = function(event) {
  /// <param type="Event" name="event"/>
  /// <returns type="IDBRequest"/>
  return /** @type {IDBRequest} */ (event.target);
};

/**
 * Retrieves a transaction from the specified Event object.
 * @param {Event} event
 * @return {IDBTransaction}
 * @private
 */
createjs.Loader.IndexedDB.getTransaction_ = function(event) {
  /// <param type="Event" name="event"/>
  /// <returns type="IDBTransaction"/>
  return /** @type {IDBTransaction} */ (event.target);
};

/**
 * Retrieves a cursor from the specified IDBRequest object.
 * @param {IDBRequest} request
 * @return {IDBCursor}
 * @private
 */
createjs.Loader.IndexedDB.getCursor_ = function(request) {
  /// <param type="IDBRequest" name="request"/>
  /// <returns type="IDBCursorWithValue"/>
  return /** @type {IDBCursor} */ (request.result);
};

/**
 * Attaches an listener to an IDBRequest object (or an IDBTransaction object).
 * @param {IDBTransaction|IDBRequest} request
 * @param {createjs.Loader.Cache.Listener} listener
 * @private
 */
createjs.Loader.IndexedDB.setListener_ = function(request, listener) {
  /// <param type="IDBRequest" name="request"/>
  /// <param type="createjs.Loader.Cache.Listener" name="listener"/>
  request.listener_ = listener;
};

/**
 * Returns a listener attached to an IDBRequest object (or an IDBTransaction
 * object).
 * @param {IDBTransaction|IDBRequest} request
 * @return {createjs.Loader.Cache.Listener}
 * @private
 */
createjs.Loader.IndexedDB.getListener_ = function(request) {
  /// <param type="IDBRequest" name="request"/>
  /// <returns type="createjs.Loader.Cache.Listener"/>
  var listener =
      /** @type {createjs.Loader.Cache.Listener} */ (request.listener_);
  if (createjs.DEBUG) {
    request.listener_ = null;
  }
  return listener;
};

/**
 * Attaches a key name to an IDBRequest object (or an IDBTransaction object).
 * @param {IDBTransaction|IDBRequest} request
 * @param {string} key
 * @private
 */
createjs.Loader.IndexedDB.setKey_ = function(request, key) {
  /// <param type="IDBRequest" name="request"/>
  /// <param type="string" name="key"/>
  request.key_ = key;
};

/**
 * Returns the key name associated with an IDBRequest object (or an
 * IDBTransaction object).
 * @param {IDBTransaction|IDBRequest} request
 * @return {string}
 * @private
 */
createjs.Loader.IndexedDB.getKey_ = function(request) {
  /// <param type="IDBRequest" name="request"/>
  /// <returns type="string"/>
  return /** @type {string} */ (request.key_);
};

/**
 * Attaches a key name to an IDBTransaction object.
 * @param {IDBRequest} request
 * @param {number} size
 * @private
 */
createjs.Loader.IndexedDB.setSize_ = function(request, size) {
  /// <param type="IDBTransaction" name="transaction"/>
  /// <param type="number" name="size"/>
  request.size_ = size;
};

/**
 * Returns the key name associated with an IDBTransaction object.
 * @param {IDBRequest} request
 * @return {number}
 * @private
 */
createjs.Loader.IndexedDB.getSize_ = function(request) {
  /// <param type="IDBRequest" name="request"/>
  /// <returns type="number"/>
  return /** @type {number} */ (request.size_);
};

/**
 * Attaches a key name to an IDBTransaction object.
 * @param {IDBTransaction} transaction
 * @param {*} data
 * @private
 */
createjs.Loader.IndexedDB.setData_ = function(transaction, data) {
  /// <param type="IDBTransaction" name="transaction"/>
  /// <param name="key"/>
  transaction.data_ = data;
};

/**
 * Returns the key name associated with an IDBTransaction object.
 * @param {IDBTransaction} transaction
 * @return {string}
 * @private
 */
createjs.Loader.IndexedDB.getData_ = function(transaction) {
  /// <param type="IDBTransaction" name="transaction"/>
  /// <returns type="string"/>
  return /** @type {string} */ (transaction.data_);
};

/**
 * Creates a database transaction used by this object.
 * @param {number} mode
 * @return {IDBTransaction}
 * @private
 */
createjs.Loader.IndexedDB.createTransaction_ = function(mode) {
  /// <returns type="IDBObjectStore"/>
  createjs.assert(!!createjs.Loader.IndexedDB.database_);
  var database = createjs.Loader.IndexedDB.database_
  return database.transaction([createjs.CACHE_TABLE],
                              mode ? 'readwrite' : 'readonly');
};

/**
 * Returns the database table used by the specified transaction.
 * @param {IDBTransaction} transaction
 * @return {IDBObjectStore}
 * @private
 */
createjs.Loader.IndexedDB.getStore_ = function(transaction) {
  /// <param type="IDBTransaction" name="transaction"/>
  /// <returns type="IDBObjectStore"/>
  return transaction.objectStore(createjs.CACHE_TABLE);
};

/**
 * Called when a browser successfully finishes retrieving a cursor from a table.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleClearSuccess_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = createjs.Loader.IndexedDB.getRequest_(event);
  var cursor = createjs.Loader.IndexedDB.getCursor_(request);
  if (!cursor) {
    return;
  }
  var data = cursor.value['data'];
  var size = createjs.Loader.IndexedDB.getSize_(request) - data.length;
  createjs.Loader.IndexedDB.setSize_(request, size);
  if (size > 0) {
    cursor['delete']();
    cursor['continue']();
  }
};

/**
 * Called when there is an error while a browser deletes old items from a table.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleClearError_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = createjs.Loader.IndexedDB.getRequest_(event);
  var listener = createjs.Loader.IndexedDB.getListener_(request);
  listener.handlePutError(createjs.Loader.IndexedDB.getKey_(request));
};

/**
 * Creates a clear request to the table used by this object.
 * @param {createjs.Loader.Cache.Listener} listener
 * @param {string} key
 * @param {number} size
 * @private
 */
createjs.Loader.IndexedDB.clear_ = function(listener, key, size) {
  /// <param type="createjs.Loader.Cache.Listener" name="listener"/>
  var transaction = createjs.Loader.IndexedDB.createTransaction_(
      createjs.Loader.IndexedDB.WRITE_);
  var store = createjs.Loader.IndexedDB.getStore_(transaction);
  var request = store.index('time').openCursor();
  request.onerror = createjs.Loader.IndexedDB.handleClearError_;
  request.onsuccess = createjs.Loader.IndexedDB.handleClearSuccess_;
  createjs.Loader.IndexedDB.setListener_(request, listener);
  createjs.Loader.IndexedDB.setKey_(transaction, key);
  createjs.Loader.IndexedDB.setSize_(request, size);
};

/**
 * Called when a browser successfully finishes writing a key-value pair.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handlePutComplete_ = function(event) {
  /// <param type="Event" name="event"/>
  var transaction = createjs.Loader.IndexedDB.getTransaction_(event);
  var listener = createjs.Loader.IndexedDB.getListener_(transaction);
  listener.handlePutSuccess(createjs.Loader.IndexedDB.getKey_(transaction));
};

/**
 * Called when a browser aborts a database transaction.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handlePutAbort_ = function(event) {
  /// <param type="Event" name="event"/>
  /// <var type="Error" name="error"/>
  var transaction = createjs.Loader.IndexedDB.getTransaction_(event);
  var listener = createjs.Loader.IndexedDB.getListener_(transaction);
  var key = createjs.Loader.IndexedDB.getKey_(transaction);
  var error = event.target.error;
  if (error.name != 'QuotaExceededError') {
    listener.handlePutError(key);
  } else {
    // Round up the data size by a 4MB boundary and remove this calculated size
    // of data from the cache. Also retry putting the data to the cache after
    // the removal transaction. (The IndexedDB API serializes write transactions
    // and these transactions are executed sequentially.)
    var UNIT = 1 << 12;
    var data = createjs.Loader.IndexedDB.getData_(transaction);
    var size = ((data.length + UNIT - 1) >> 12) << 12;
    createjs.Loader.IndexedDB.clear_(listener, key, size);
    createjs.Loader.IndexedDB.put_(listener, key, data);
  }
};

/**
 * Creates a put request to the table used by this object.
 * @param {createjs.Loader.Cache.Listener} listener
 * @param {string} key
 * @param {*} data
 * @private
 */
createjs.Loader.IndexedDB.put_ = function(listener, key, data) {
  /// <param type="createjs.Loader.Cache.Listener" name="listener"/>
  /// <param type="string" name="key"/>
  /// <param name="data"/>
  var transaction = createjs.Loader.IndexedDB.createTransaction_(
      createjs.Loader.IndexedDB.WRITE_);
  transaction.oncomplete = createjs.Loader.IndexedDB.handlePutComplete_;
  transaction.onabort = createjs.Loader.IndexedDB.handlePutAbort_;
  createjs.Loader.IndexedDB.setListener_(transaction, listener);
  createjs.Loader.IndexedDB.setKey_(transaction, key);
  createjs.Loader.IndexedDB.setData_(transaction, data);
  var value = {
    'time': Date.now(),
    'data': data
  };
  createjs.Loader.IndexedDB.getStore_(transaction).put(value, key);
};

/**
 * Called when a browser successfully finishes reading a key-value pair from a
 * table.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleGetSuccess_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = createjs.Loader.IndexedDB.getRequest_(event);
  var listener = createjs.Loader.IndexedDB.getListener_(request);
  var result = /** @type {Object} */ (request.result);
  if (!result || !result['data']) {
    listener.handleGetError(createjs.Loader.IndexedDB.getKey_(request));
    return;
  }
  var data = result['data'];
  listener.handleGetSuccess(createjs.Loader.IndexedDB.getKey_(request), data);
};

/**
 * Called when there is an error while a browser reads a key-value pair from a
 * table.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleGetError_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = createjs.Loader.IndexedDB.getRequest_(event);
  var listener = createjs.Loader.IndexedDB.getListener_(request);
  listener.handleGetError(createjs.Loader.IndexedDB.getKey_(request));
};

/**
 * Creates a get request to the table used by this object.
 * @param {createjs.Loader.Cache.Listener} listener
 * @param {string} key
 * @private
 */
createjs.Loader.IndexedDB.get_ = function(listener, key) {
  /// <param type="createjs.Loader.Cache.Listener" name="listener"/>
  /// <param type="string" name="key"/>
  var transaction = createjs.Loader.IndexedDB.createTransaction_(
      createjs.Loader.IndexedDB.READ_);
  var request = createjs.Loader.IndexedDB.getStore_(transaction).get(key);
  request.onsuccess = createjs.Loader.IndexedDB.handleGetSuccess_;
  request.onerror = createjs.Loader.IndexedDB.handleGetError_;
  createjs.Loader.IndexedDB.setListener_(request, listener);
  createjs.Loader.IndexedDB.setKey_(request, key);
};

/**
 * Called when a browser successfully finishes opening a database.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleOpenSuccess_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = createjs.Loader.IndexedDB.getRequest_(event);
  createjs.Loader.IndexedDB.database_ =
      /** @type {IDBDatabase} */ (request.result);

  // Send a get request to get the value for the key.
  createjs.Loader.IndexedDB.get_(
      createjs.Loader.IndexedDB.getListener_(request),
      createjs.Loader.IndexedDB.getKey_(request));
};

/**
 * Called when there is an error while a browser opens a database.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleOpenError_ = function(event) {
  /// <param type="Event" name="event"/>
  createjs.Loader.instance_ = null;
};

/**
 * Called when the specified database needs an update.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleUpgradeNeeded_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = createjs.Loader.IndexedDB.getRequest_(event);
  var database = request.result;
  if (database.objectStoreNames.contains(createjs.CACHE_TABLE)) {
    database.deleteObjectStore(createjs.CACHE_TABLE);
  }
  var store = database.createObjectStore(createjs.CACHE_TABLE);
  store.createIndex('time', 'time', { 'unique': false });
};

/**
 * Creates an open request to open the database used by this object.
 * @param {number} version
 * @return {IDBRequest}
 * @private
 */
createjs.Loader.IndexedDB.open_ = function(version) {
  /// <param type="number" name="version"/>
  /// <returns type="IDBRequest"/>
  createjs.assert(!!createjs.global.indexedDB);
  var request = createjs.global.indexedDB.open(
      createjs.CACHE_DATABASE, version);
  if (request) {
    request.onerror = createjs.Loader.IndexedDB.handleOpenError_;
    request.onsuccess = createjs.Loader.IndexedDB.handleOpenSuccess_;
    request.onupgradeneeded = createjs.Loader.IndexedDB.handleUpgradeNeeded_;
  }
  return request;
};

/**
 * Called when a browser finishes deleting the cache database.
 * @param {Event} event
 * @private
 */
createjs.Loader.IndexedDB.handleReset_ = function(event) {
  /// <param type="Event" name="event"/>
};

/** @override */
createjs.Loader.IndexedDB.prototype.isOpened = function() {
  /// <returns type="boolean"/>
  return !!createjs.Loader.IndexedDB.database_;
};

/** @override */
createjs.Loader.IndexedDB.prototype.set = function(listener, key, value) {
  /// <param type="createjs.Loader.Cache.Listener" name="listener"/>
  /// <param type="string" name="key"/>
  /// <param name="value"/>
  createjs.Loader.IndexedDB.put_(listener, key, value);
};

/** @override */
createjs.Loader.IndexedDB.prototype.get = function(listener, key) {
  /// <param type="createjs.Loader.Cache.Listener" name="listener"/>
  /// <param type="string" name="key"/>
  /// <returns type="boolean"/>
  // Return false so the createjs.Loader object can load the specified resource
  // from the server when this cache is not opened, including while it is being
  // opened.
  if (!this.isOpened()) {
    return false;
  }
  createjs.Loader.IndexedDB.get_(listener, key);
  return true;
};

/** @override */
createjs.Loader.IndexedDB.prototype.reset = function() {
  // Close the database connection before deleting the cache database. (Chrome
  // cannot delete a database while there is an open connection to it.)
  var database = createjs.Loader.IndexedDB.database_;
  if (database) {
    database.close();
    createjs.Loader.IndexedDB.database_ = null;
  }
  var request =
      createjs.global.indexedDB.deleteDatabase(createjs.CACHE_DATABASE);
  if (request) {
    request.onerror = createjs.Loader.IndexedDB.handleReset_;
    request.onsuccess = createjs.Loader.IndexedDB.handleReset_;
  }
};

/**
 * The global instance that provides the createjs.Loader.Cache interface.
 * @type {createjs.Loader.Cache}
 * @private
 */
createjs.Loader.instance_ = null;

/**
 * Whether the 'createjs.Loader.instance_' variable has been initialized.
 * @type {boolean}
 * @private
 */
createjs.Loader.initialized_ = false;

/**
 * Retrieves an available createjs.Loader.Cache interface. This method creates
 * an object that implements the createjs.Loader.Cache interface and returns it.
 * @return {createjs.Loader.Cache}
 */
createjs.Loader.getCache = function() {
  /// <returns type="createjs.Loader.Cache"/>
  if (!createjs.Loader.initialized_) {
    createjs.Loader.initialized_ = true;
    createjs.Loader.instance_ = createjs.Loader.IndexedDB.getInstance();
  }
  return createjs.Loader.instance_;
};

/**
 * Opens the cache. This method creates a database when the browser does not
 * have one or upgrades it when its version is less than the specified one.
 * (The input version must be a positive integer less than Math.pow(2, 64).)
 * @param {number} version
 * @const
 */
createjs.Loader.openCache = function(version) {
  /// <param type="number" name="version"/>
  if (createjs.USE_CACHE) {
    var cache = createjs.Loader.getCache();
    if (cache) {
      createjs.Loader.IndexedDB.open_(version);
    }
  }
};

/**
 * Clears all files in the cache and resets its state.
 * @const
 */
createjs.Loader.resetCache = function() {
  if (createjs.USE_CACHE) {
    if (createjs.Loader.instance_) {
      createjs.Loader.instance_.reset();
      createjs.Loader.instance_ = null;
    }
    createjs.Loader.initialized_ = false;
  }
};
