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
  // Android browsers (on Android 4.3 or earlier) cannot send ArrayBuffer
  // objects with the postMessage() method and it is impossible to use the
  // FrameAudioPlayer class on them.
  return !createjs.UserAgent.isAndroidBrowser();
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
 * A table of exported functions.
 * @type {Object}
 * @const
 */
createjs.Config.exports = createjs.exportStatic('createjs.Config', {
  'clearCache': createjs.Config.clearCache,
  'setCacheVersion': createjs.Config.setCacheVersion,
  'setUseAndroidWorkarounds': createjs.Config.setUseAndroidWorkarounds
});
