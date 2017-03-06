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
/// <reference path="loader.js"/>
/// <reference path="user_agent.js"/>

/**
 * A class that provides methods to customize this library.
 * @constructor
 */
createjs.Config = function() {
};

/**
 * The version number used by the loader cache.
 * @type {number}
 * @private
 */
createjs.Config.cacheVersion_ = 1;

/**
 * Whether to use workaround code for Android browsers.
 * @type {Object.<string,number>}
 * @private
 */
createjs.Config.useAndroidWorkarounds_ = {};

/**
 * Whether the host browser can play <video> elements inline.
 * @type {number}
 * @private
 */
createjs.Config.canPlayInline_ = -1;

/**
 * The event interval.
 * @type {number}
 * @private
 */
createjs.Config.interval_ = 0;

/**
 * The time-stamp of the previously-handled event.
 * @type {number}
 * @private
 */
createjs.Config.timestamp_ = 0;

/**
 * Whether to disable events.
 * @type {boolean}
 * @private
 */
createjs.Config.disable_ = false;

/**
 * Deletes all files in the cache.
 * @const
 */
createjs.Config.clearCache = function() {
  createjs.Loader.resetCache();
};

/**
 * Returns the version number of the loader cache.
 * @return {number}
 * @const
 */
createjs.Config.getCacheVersion = function() {
  /// <returns type="number"/>
  if (!createjs.USE_CACHE) {
    return 1;
  }
  return createjs.Config.cacheVersion_;
};

/**
 * Sets the version number of the loader cache.
 * @param {number} version
 * @const
 */
createjs.Config.setCacheVersion = function(version) {
  /// <param type="number" name="version"/>
  if (createjs.USE_CACHE) {
    createjs.Config.cacheVersion_ = version;
    // Open the cache database in advance so it becomes ready when the
    // createjs.Loader class uses it. (Dispatching a request to a database
    // being opened sometimes causes a dead lock on iOS.)
    createjs.Loader.openCache(version);
  }
};

/**
 * Returns whether to use workaround code for Android browsers.
 * @param {string} context
 * @return {number}
 * @const
 */
createjs.Config.useAndroidWorkarounds = function(context) {
  /// <param type="string" name="context"/>
  /// <returns type="number"/>
  return createjs.Config.useAndroidWorkarounds_[context] || 0;
};

/**
 * Sets whether to use workaround code for Android browsers.
 * @param {string} context
 * @param {number} value
 * @const
 */
createjs.Config.setUseAndroidWorkarounds = function(context, value) {
  /// <param type="string" name="context"/>
  /// <param type="number" name="value"/>
  createjs.Config.useAndroidWorkarounds_[context] = createjs.parseInt(value);
};

/**
 * Returns whether the createjs.Sound class should use the FrameAudioPlayer
 * class instead of the BufferAudioPlayer class.
 * @return {boolean}
 * @const
 */
createjs.Config.useFrame = function() {
  /// <returns type="boolean"/>
  if (!createjs.USE_FRAME) {
    return false;
  }
  // Use an <iframe> element to decode audio data on Chrome for Android, which
  // uses a software decoder. (It is pretty fast to decode audio data on other
  // browsers, which use hardware decoders.)
  return createjs.UserAgent.isAndroid() && createjs.UserAgent.isChrome();
};

/**
 * Returns whether the host browser can play <video> elements inline.
 * @return {number}
 * @const
 */
createjs.Config.canPlayInline = function() {
  /// <returns type="number"/>
  if (createjs.Config.canPlayInline_ < 0) {
    // Mobile Safari on iOS 9 or earlier cannot play <video> elements inline.
    // (This "Mobile Safari" does NOT include web apps.) Use the media query
    // instead of a version check as written in the WebKit blog
    //   <http://webkit.org/blog/6784/new-video-policies-for-ios/>.
    if (!createjs.UserAgent.isIPhone() ||
        navigator['standalone'] ||
        createjs.global.matchMedia('(-webkit-video-playback-inline)').matches) {
      createjs.Config.canPlayInline_ = 1;
    } else {
      createjs.Config.canPlayInline_ = 0;
    }
  }
  return createjs.Config.canPlayInline_;
};

/**
 * Returns whether the specified event is prevented the createjs.Stage class
 * from handling it.
 * @param {Event} event
 * @param {number} mask
 * @return {boolean}
 * @const
 */
createjs.Config.isPreventedEvent = function(event, mask) {
  /// <param type="Event" name="event"/>
  /// <param type="number" name="mask"/>
  /// <returns type="boolean"/>
  var MOUSE_MASK = 1 << 0;
  var TOUCH_MASK = 1 << 1;
  var POINTER_MASK = 1 << 2;
  if (mask & TOUCH_MASK) {
    if (event.type == 'touchstart') {
      // Filter out this event (and 'touchmove' events and a 'touchend' one
      // associated with it) when its elapsed time since the previously-handled
      // 'touchstart' event is less than the specified interval.
      var elapsed = event.timeStamp - createjs.Config.timestamp_;
      createjs.Config.disable_ = elapsed < createjs.Config.interval_;
      if (!createjs.Config.disable_) {
        createjs.Config.timestamp_ = event.timeStamp;
      }
      return createjs.Config.disable_;
    } else if (event.type == 'touchend' || event.type == 'touchmove') {
      // Filter out this event if this method has discarded the 'touchstart'
      // event associated with it to avoid dispatching stray events.
      return createjs.Config.disable_;
    }
  } else if (mask & POINTER_MASK) {
    if (event.type == 'pointerdown') {
      var elapsed = event.timeStamp - createjs.Config.timestamp_;
      createjs.Config.disable_ = elapsed < createjs.Config.interval_;
      if (!createjs.Config.disable_) {
        createjs.Config.timestamp_ = event.timeStamp;
      }
      return createjs.Config.disable_;
    } else if (event.type == 'pointerup' || event.type == 'pointermove') {
      return createjs.Config.disable_;
    }
  }
  if (mask & MOUSE_MASK) {
    if (event.type == 'mousedown') {
      var elapsed = event.timeStamp - createjs.Config.timestamp_;
      createjs.Config.disable_ = elapsed < createjs.Config.interval_;
      if (!createjs.Config.disable_) {
        createjs.Config.timestamp_ = event.timeStamp;
        }
      return createjs.Config.disable_;
    } else if (event.type == 'mouseup' || event.type == 'mousemove') {
      return createjs.Config.disable_;
    }
  }
  return false;
};

/**
 * Sets the event interval. This method sets the period of time when the
 * createjs.Stage class discards events after it handles an event.
 * @param {number} milliseconds
 * @const
 */
createjs.Config.setEventInterval = function(milliseconds) {
  /// <param type="number" name="milliseconds"/>
  createjs.Config.interval_ = milliseconds;
};

/**
 * A table of exported functions.
 * @type {Object}
 * @const
 */
createjs.Config.exports = createjs.exportStatic('createjs.Config', {
  'clearCache': createjs.Config.clearCache,
  'setCacheVersion': createjs.Config.setCacheVersion,
  'setUseAndroidWorkarounds': createjs.Config.setUseAndroidWorkarounds,
  'setEventInterval': createjs.Config.setEventInterval
});
