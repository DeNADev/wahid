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
/// <reference path="event_dispatcher.js"/>
/// <reference path="file_event.js"/>
/// <reference path="loader.js"/>
/// <reference path="sound.js"/>

/**
 * A class that downloads resources. This class automatically chooses the best
 * method and sends cross-origin requests, i.e. this class ignores the
 * 'opt_useXHR' parameter and the 'opt_crossOrigin' one.
 * @param {boolean=} opt_useXHR
 * @param {string=} opt_basePath
 * @param {string|boolean=} opt_crossOrigin
 * @extends {createjs.EventDispatcher}
 * @implements {createjs.Loader.Listener}
 * @constructor
 */
createjs.LoadQueue = function(opt_useXHR, opt_basePath, opt_crossOrigin) {
  /// <signature>
  ///   <param type="boolean" optional="true" name="opt_useXHR"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  ///   <param type="boolean" optional="true" name="opt_crossOrigin"/>
  /// </signature>
  /// <signature>
  ///   <param type="boolean" optional="true" name="opt_useXHR"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  ///   <param type="string" optional="true" name="opt_crossOrigin"/>
  /// </signature>
  createjs.EventDispatcher.call(this);

  /**
   * A path to be prepended onto the source URLs of its items.
   * @type {string}
   * @private
   */
  this.basePath_ = opt_basePath || '';

  /**
   * A list of items that have not yet started downloading.
   * @type {Array.<createjs.Loader>}
   * @private
   */
  this.queue_ = [];

  /**
   * An array containing the currently downloading files.
   * @type {Array.<createjs.Loader>}
   * @private
   */
  this.loading_ = [];

  /**
   * A mapping table either from a source or from an ID name to a
   * createjs.Loader.Item Object.
   * @type {Object.<string,createjs.Loader.Item>}
   * @private
   */
  this.items_ = {};

  /**
   * A list of scripts being loaded.
   * @type {Array.<createjs.Loader.Item>}
   * @private
   */
  this.scripts_ = [];

  /**
   * An observer who monitors the activities of this object.
   * @type {createjs.LoadQueue.Listener}
   * @private
   */
  this.listener_ = new createjs.Sound.Proxy();
};
createjs.inherits('LoadQueue', createjs.LoadQueue, createjs.EventDispatcher);

/**
 * An interface that observes activities of a LoadQueue object.
 * @interface
 */
createjs.LoadQueue.Listener = function() {};

/**
 * Called when a LoadQueue object starts loading a file.
 * @param {createjs.Loader.Item} item
 */
createjs.LoadQueue.Listener.prototype.handleFileStart = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
};

/**
 * Called when a LoadQueue object has finished loading a file.
 * @param {createjs.Loader.Item} item
 * @return {boolean}
 */
createjs.LoadQueue.Listener.prototype.handleFileComplete = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <returns type="boolean"/>
};

/**
 * A path that will be prepended onto the item's `src`.
 * @type {string}
 * @private
 */
createjs.LoadQueue.prototype.basePath_ = '';

/**
 * A listed of queued items that have not yet started downloading.
 * @type {Array.<createjs.Loader>}
 * @private
 */
createjs.LoadQueue.prototype.queue_ = null;

/**
 * An array containing the currently downloading files.
 * @type {Array.<createjs.Loader>}
 * @private
 */
createjs.LoadQueue.prototype.loading_ = null;

/**
 * A table from a source or an ID name to a createjs.Loader.Item Object.
 * @type {Object.<string,createjs.Loader.Item>}
 * @private
 */
createjs.LoadQueue.prototype.items_ = null;

/**
 * A list of scripts being loaded.
 * @type {Array.<createjs.Loader.Item>}
 * @private
 */
createjs.LoadQueue.prototype.scripts_ = null;

/**
 * A list of observers who monitors the activities of this object.
 * @type {createjs.LoadQueue.Listener}
 * @private
 */
createjs.LoadQueue.prototype.listener_ = null;

/**
 * Whether this object has started loading files.
 * @type {boolean}
 * @private
 */
createjs.LoadQueue.prototype.started_ = false;

/**
 * Whether this loader has been canceled loading files.
 * @type {boolean}
 * @private
 */
createjs.LoadQueue.prototype.canceled_ = false;

/**
 * Whether this loader stops loading files.
 * @type {boolean}
 * @private
 */
createjs.LoadQueue.prototype.paused_ = true;

/**
 * The total load progress (percentage) of this object.
 * @type {number}
 * @private
 */
createjs.LoadQueue.prototype.progress_ = 0;

/**
 * The maximum number of network connections.
 * @type {number}
 * @private
 */
createjs.LoadQueue.prototype.connections_ = 1;

/**
 * The number of requested items.
 * @type {number}
 * @private
 */
createjs.LoadQueue.prototype.requested_ = 0;

/**
 * The number of loaded items.
 * @type {number}
 * @private
 */
createjs.LoadQueue.prototype.loaded_ = 0;

/**
 * Determines if the load has been canceled.
 * @return {boolean}
 * @private
 */
createjs.LoadQueue.prototype.isCanceled_ = function() {
  /// <returns type="boolean"/>
  return this.canceled_;
};

/**
 * Sends an error event.
 * @param {Object} item
 * @param {string} text
 * @private
 */
createjs.LoadQueue.prototype.sendError_ = function(item, text) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <param type="string" name="text"/>
  if (!this.isCanceled_() && this.hasListener('error')) {
    this.dispatchRawEvent(
        new createjs.FileErrorEvent('error', false, false, item, text));
  }
};

/**
 * Sends a file-load event.
 * @param {createjs.Loader.Item} item
 * @private
 */
createjs.LoadQueue.prototype.sendFileLoad_ = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  if (!this.isCanceled_()) {
    createjs.assert(!!this.listener_);
    if (this.listener_.handleFileComplete(item)) {
      this.disposeItem_(item);
    }
    if (this.hasListener('fileload')) {
      var event = new createjs.FileLoadEvent(
          'fileload', false, false, item.exportValues(),
          item.resultObject, item.resultText);
      this.dispatchRawEvent(event);
    }
  }
};

/**
 * Creates a loader for loading the specified item.
 * @param {createjs.Loader.Item} item
 * @return {createjs.Loader}
 * @private
 */
createjs.LoadQueue.prototype.createLoader_ = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <returns type="createjs.Loader"/>
  return new createjs.Loader(this, item);
};

/**
 * Updates the total progress of this loader and sends a progress event.
 * For example, if 5/10 items have loaded, and item 6 is 20% loaded, the total
 * progress would be:
 *  * 5/10 of the items in the queue (50%)
 *  * plus 20% of item 6's slot (2%)
 *  * equals 52%
 * @private
 */
createjs.LoadQueue.prototype.updateProgress_ = function() {
  var reciprocal = 1 / this.requested_;
  var loaded = this.loaded_ * reciprocal;
  if (this.requested_ > this.loaded_) {
    var chunk = 0;
    var length =  this.loading_.length;
    for (var i = 0; i < length; ++i) {
      chunk += this.loading_[i].getProgress();
    }
    loaded += chunk * reciprocal;
  }
  this.progress_ = loaded;

  // Sends a progress event if there are event listeners attached to this
  // loader.
  if (!this.isCanceled_() && this.hasListener('progress')) {
    this.dispatchRawEvent(new createjs.ProgressEvent('progress',
                                                     false,
                                                     false,
                                                     this.progress_,
                                                     1,
                                                     this.progress_));
  }
};

/**
 * Removes a loader.
 * @param {createjs.Loader} loader
 * @private
 */
createjs.LoadQueue.prototype.removeLoader_ = function(loader) {
  /// <param type="createjs.Loader" name="loader"/>
  var length = this.loading_.length;
  for (var i = 0; i < length; ++i) {
    if (this.loading_[i] == loader) {
      this.loading_.splice(i, 1);
      return;
    }
  }
};

/**
 * Creates a loader item and adds it to this queue.
 * @param {Object} value
 * @private
 */
createjs.LoadQueue.prototype.loadItem_ = function(value) {
  /// <param type="Object" name="value"/>
  var item = new createjs.Loader.Item();
  item.initializeItem(value, this.basePath_);
  this.items_[item.getSource()] = item;
  if (item.getSource() != item.id) {
    this.items_[item.id] = item;
  }
  this.listener_.handleFileStart(item)

  var loader = new createjs.Loader(this, item);
  this.queue_.push(loader);
  ++this.requested_;
  this.updateProgress_();
  if (item.isScript()) {
    this.scripts_.push(item);
  }
};

/**
 * Cleans out item results, to free them from memory. Mainly, the loaded item
 * and results are cleared from internal hashes.
 * @param {createjs.Loader.Item} item
 * @private
 */
createjs.LoadQueue.prototype.disposeItem_ = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  this.items_[item.getSource()] = null;
  this.items_[item.id] = null;
};

/**
 * Loads the next item in the queue.
 * @private
 */
createjs.LoadQueue.prototype.loadNext_ = function() {
  if (this.paused_) {
    return;
  }

  // Dispatch a 'loadstart' event when this queue is going to load the first
  // item.
  if (!this.started_) {
    if (!this.isCanceled_() && this.hasListener('loadstart')) {
      this.dispatchNotification('loadstart');
    }
    this.started_ = true;
  }

  // Dispatch a 'complete' event when this queue finishes loading all items.
  this.loaded = this.requested_ == this.loaded_;
  if (this.loaded) {
    if (!this.isCanceled_()) {
      this.dispatchNotification('complete');
    }
  } else {
    // Start loading items in the load queue. The following 'loader.load()' call
    // recursively calls this method when its specified resource is cached, i.e.
    // the 'loading_' property and the 'queue_' property may be changed in the
    // call. To avoid reading an item from an empty queue, this loop has to
    // read the queue length in it directly without caching it.
    for (var i = 0; i < this.connections_ - this.loading_.length; ++i) {
      if (!this.queue_.length) {
        break;
      }
      var loader = this.queue_.shift();
      this.loading_.push(loader);
      loader.load();
    }
  }
};

/**
 * Changes whether to use XMLHttpRequest objects to load files. (The
 * createjs.Loader class uses XMLHttpRequest v2 whenever possible and it ignores
 * this setting.)
 * @param {boolean} useXHR
 * @return {boolean}
 * @const
 */
createjs.LoadQueue.prototype.setUseXHR = function(useXHR) {
  /// <param type="boolean" name="useXHR"/>
  /// <returns type="boolean"/>
  return useXHR;
};

/**
 * Registers a plug-in.
 * @param {Object} plugin
 * @const
 */
createjs.LoadQueue.prototype.installPlugin = function(plugin) {
  /// <param type="Object" name="plugin"/>
  createjs.notReached();
};

/**
 * Retrieves a loaded result with either an ID or a source. This method returns
 * the content if it has been loaded.
 * * An HTMLImageElement object for image files.
 * * An HTMLAudioElement object for audio files. (This method returns null if
 *   the createjs.Sound class uses the WebAudio API.)
 * * An HTMLScriptElement object for JavaScript files.
 * * An HTMLStyleElement object for CSS files.
 * * A string primitive for TEXT files.
 * * A JavaScript object for JSON files.
 * @param {string} value
 * @param {boolean=} opt_rawResult
 * @return {*}
 * @const
 */
createjs.LoadQueue.prototype.getResult = function(value, opt_rawResult) {
  /// <signature>
  ///   <param type="string" name="value"/>
  ///   <param type="boolean" optional="true" name="opt_rawResult"/>
  ///   <returns type="HTMLElement"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="value"/>
  ///   <param type="boolean" optional="true" name="opt_rawResult"/>
  ///   <returns type="string"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="value"/>
  ///   <param type="boolean" optional="true" name="opt_rawResult"/>
  ///   <returns type="Object"/>
  /// </signature>
  var item = this.items_[value];
  if (!item) {
    return null;
  }
  if (!!opt_rawResult && item.resultText) {
    return item.resultText;
  }
  return item.resultObject;
};

/**
 * Stops all queued and loading items, and clears the queue.
 * @const
 */
createjs.LoadQueue.prototype.removeAll = function() {
  this.close();
  this.items_ = {};
  createjs.LoadQueue.call(this, true);
};

/**
 * Removes an item from the loading queue. This method sops an item from being
 * loaded, and removes it from the queue. If nothing is passed, all items are
 * removed. This also removes internal references to loaded item(s).
 *
 * Example
 *   queue.loadManifest([
 *     { 'src': 'test.png', 'id': 'png' },
 *     { 'src': 'test.jpg', 'id': 'jpg' },
 *     { 'src': 'test.mp3', 'id': 'mp3' }
 *   ]);
 *   queue.remove('png'); // Single item by ID
 *   queue.remove('png', 'test.jpg'); // Items as arguments. Mixed id and src.
 *   queue.remove(['test.png', 'jpg']); // Items in an Array. Mixed id and src.
 *
 * @param {...(string|Array.<string>)} var_args
 * @const
 */
createjs.LoadQueue.prototype.remove = function(var_args) {
  /// <signature>
  ///   <param type="string" name="source"/>
  /// </signature>
  /// <signature>
  ///   <param type="Array" type="string" name="sources"/>
  /// </signature>
  createjs.notReached();
};

/**
 * Sets the maximum number of concurrent connections.
 * @param {number} value
 * @const
 */
createjs.LoadQueue.prototype.setMaxConnections = function(value) {
  /// <param type="number" name="value"/>
  this.connections_ = value;
  if (!this.paused_ && this.queue_.length > 0) {
    this.loadNext_();
  }
};

/**
 * Loads a single file.
 * @param {Object | string} file
 * The file object or path to load. A file can be either:
 *   1. A string path to a resource, or;
 *   2. An object that contains:<ul>
 *     * src
 *       The source of the file that is being loaded. This property is required.
 *       The source can either be a string (recommended), or an HTML tag.
 *     * type
 *       The type of file that will be loaded (image, sound, json, etc).
 *       PreloadJS does auto-detection of types using the extension. Supported
 *       types are defined on LoadQueue, such as LoadQueue.IMAGE. It is
 *       recommended that a type is specified when a non-standard file URI (such
 *       as a PHP script) us used.
 *     * id
 *       A string identifier which can be used to reference the loaded object.
 *     * callback (optional)
 *       used for JSONP requests, to define what method to call when the JSONP
 *       is loaded.
 *     * data
 *       An arbitrary data object, which is included with the loaded object.
 *     * method
 *       used to define if this request uses GET or POST when sending data to
 *       the server. The default value is "GET".
 *     * values (optional)
 *       An object of name/value pairs to send to the server.
 *     * headers (optional)
 *       An object hash of headers to attach to an XHR request.
 * @param {boolean=} opt_loadNow
 * @param {string=} opt_basePath
 * @const
 */
createjs.LoadQueue.prototype.loadFile =
    function(file, opt_loadNow, opt_basePath) {
  /// <signature>
  ///   <param type="string" name="source"/>
  ///   <param type="boolean" optional="true" name="opt_loadNow"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  /// </signature>
  /// <signature>
  ///   <param type="Object" name="item"/>
  ///   <param type="boolean" optional="true" name="opt_loadNow"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  /// </signature>
  if (!file) {
    this.sendError_({}, 'PRELOAD_NO_FILE');
    return;
  }
  var item = createjs.isString(file) ?
      { 'src': createjs.getString(file) } : createjs.getObject(file);
  this.loadItem_(item);
  this.setPaused(opt_loadNow == null ? false : !opt_loadNow);
};

/**
 * Loads an array of files.
 * @param {Array|string|Object} manifest
 * An list of files to load. The loadManifest call supports four types of
 * manifests:
 *   1. A string path, which points to a manifest file, which is a JSON file
 *      that contains a manifest property, which defines the list of files to
 *      load, and can optionally contain a path property, which will be
 *      prepended to each file in the list.
 *   2. An array of files to load.
 *   3. An object which defines a src property, which is a JSON or JSONP file. A
 *      callback property can be defined for JSONP file. The JSON/JSONP file
 *      should contain a manifest property, which defines the list of files to
 *      load, and can optionally contain a "path" property, which will be
 *      prepended to each file in the list.
 *   4. An object which contains a manifest property, which defines the list of
 *      files to load, and can optionally contain a path property, which will be
 *      prepended to each file in the list.
 * See the loadFile() method for description about a file.
 *
 * @param {boolean=} opt_loadNow
 * @param {string=} opt_basePath
 * @const
 */
createjs.LoadQueue.prototype.loadManifest =
    function(manifest, opt_loadNow, opt_basePath) {
  /// <signature>
  ///   <param type="string" name="source"/>
  ///   <param type="boolean" optional="true" name="opt_loadNow"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  /// </signature>
  /// <signature>
  ///   <param type="Array" elementType="string" name="sources"/>
  ///   <param type="boolean" optional="true" name="opt_loadNow"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  /// </signature>
  /// <signature>
  ///   <param type="Object" name="items"/>
  ///   <param type="boolean" optional="true" name="opt_loadNow"/>
  ///   <param type="string" optional="true" name="opt_basePath"/>
  /// </signature>
  // Always treat the input manifest as an array. Some old browsers (e.g.
  // Android browsers) do not treat array-like objects (e.g. JSON arrays,
  // Arguments, NodeList, etc.) as arrays. This method always treats the first
  // argument as an array to avoid adding workarounds for these browsers. (Most
  // games call this method with an array.)
  var files = /** @type {Array} */ (manifest);
  if (!files.length) {
    this.sendError_({}, 'INVALID_MANIFEST');
    createjs.notReached();
    return;
  }
  for (var i = 0; i < files.length; ++i) {
    this.loadItem_(files[i]);
  }
  this.setPaused(opt_loadNow == null ? false : !opt_loadNow);
};

/**
 * Retrieves a preload item provided by applications from an ID or a source.
 * @param {string} value
 * @return {Object}
 * @const
 */
createjs.LoadQueue.prototype.getItem = function(value) {
  /// <param type="string" name="value"/>
  /// <returns type="Object"/>
  return this.items_[value].exportValues();
};

/**
 * Pauses loading items or resumes it.
 * @param {boolean} value
 * @const
 */
createjs.LoadQueue.prototype.setPaused = function(value) {
  /// <param type="string" name="value"/>
  this.paused_ = value;
  if (!this.paused_) {
    this.loadNext_();
  }
};

/**
 * Starts loading files added to this queue.
 * @const
 */
createjs.LoadQueue.prototype.load = function() {
  this.setPaused(false);
};

/**
 * Closes the active queue.
 * @const
 */
createjs.LoadQueue.prototype.close = function() {
  for (var i = 0; i < this.loading_.length; ++i) {
    this.loading_[i].cancel();
  }
  this.loading_ = [];
  this.scripts_ = [];
  this.loadedScripts_ = [];
  this.started_ = false;
};

/**
 * Resets this loader. This method stops all open loads, destroys any loaded
 * items, and reloads all items in the queue.
 * @const
 */
createjs.LoadQueue.prototype.reset = function() {
  this.close();
  this.queue_ = [];
  this.items_ = {};
  this.requested_ = 0;
  this.loaded_ = 0;
};

/** @override */
createjs.LoadQueue.prototype.handleFileComplete = function(loader) {
  /// <param type="createjs.Loader" name="loader"/>
  this.removeLoader_(loader);
  var item = loader.getItem();
  if (item.isScript()) {
    // Count the number of loaded scripts from the beginning to sort the loaded
    // scripts in the order requested by this object.
    var length = this.scripts_.length;
    var index = 0;
    for (index = 0; index < length; ++index) {
      if (!this.scripts_[index].resultObject) {
        break;
      }
    }
    if (index > 0) {
      for (var i = 0; i < index; ++i) {
        // Add JavaScript files to the DOM tree in the order added to this
        // LoadQueue object, and send a 'fileload' event. (Games expect a
        // 'fileload' is dispatched AFTER a <script> element is added to the DOM
        // tree.)
        var script = this.scripts_[i];
        document.body.appendChild(
            /** @type {HTMLScriptElement} */ (script.resultObject));
        this.sendFileLoad_(script);
      }
      this.scripts_.splice(0, index);
    }
  } else {
    this.sendFileLoad_(item);
  }
  ++this.loaded_;
  this.updateProgress_();
  this.loadNext_();
};

/** @override */
createjs.LoadQueue.prototype.handleFileError = function(loader, type, message) {
  /// <param type="createjs.Loader" name="loader"/>
  /// <param type="string" name="type"/>
  /// <param type="string" name="message"/>
  ++this.loaded_;
  this.updateProgress_();
  this.sendError_(loader.getItem().exportValues(), 'FILE_LOAD_ERROR');
  this.removeLoader_(loader);
  var item = loader.getItem();
  if (item.isScript()) {
    // Remove this non-existent script from the scripts array so the
    // handleFileComplete() method can ignore it.
    var length = this.scripts_.length;
    for (var i = 0; i < length; ++i) {
      if (this.scripts_[i] === item) {
        this.scripts_.splice(i, 1);
        break;
      }
    }
  }
  this.loadNext_();
};

// Export the createjs.LoadQueue object to the global namespace.
createjs.exportObject('createjs.LoadQueue', createjs.LoadQueue, {
  'setUseXHR': createjs.LoadQueue.prototype.setUseXHR,
  'installPlugin': createjs.LoadQueue.prototype.installPlugin,
  'getResult': createjs.LoadQueue.prototype.getResult,
  'removeAll': createjs.LoadQueue.prototype.removeAll,
  'remove': createjs.LoadQueue.prototype.remove,
  'setMaxConnections': createjs.LoadQueue.prototype.setMaxConnections,
  'loadFile': createjs.LoadQueue.prototype.loadFile,
  'loadManifest': createjs.LoadQueue.prototype.loadManifest,
  'getItem': createjs.LoadQueue.prototype.getItem,
  'setPaused': createjs.LoadQueue.prototype.setPaused,
  'load': createjs.LoadQueue.prototype.load,
  'close': createjs.LoadQueue.prototype.close,
  'reset': createjs.LoadQueue.prototype.reset
}, {
  'BINARY': 'binary',
  'CSS': 'css',
  'IMAGE': 'image',
  'JAVASCRIPT': 'javascript',
  'JSON': 'json',
  'JSONP': 'jsonp',
  'MANIFEST': 'manifest',
  'SOUND': 'sound',
  'SVG': 'svg',
  'TEXT': 'text',
  'XML': 'xml'
});
