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
 * A class that parses a user-agent string.
 * @param {string} userAgent
 * @param {string} platform
 * @constructor
 */
createjs.UserAgent = function(userAgent, platform) {
  /// <param type="string" name="userAgent"/>
  /// <param type="string" name="platform"/>

  /**
   * The user-agent string.
   * @type {string}
   * @private
   */
  this.userAgent_ = userAgent;

  /**
   * Whether this user-agent uses WebKit (or Blink).
   * @const {boolean}
   * @private
   */
  this.isWebKit_ = userAgent.indexOf('WebKit') >= 0;

  /**
   * The platform ID.
   * @const {number}
   * @private
   */
  this.platform_ = createjs.UserAgent.getPlatform_(userAgent, platform);

  /**
   * The user-agent ID.
   * @const {number}
   * @private
   */
  this.agent_ =
      createjs.UserAgent.getAgent_(userAgent, this.isWebKit_, this.platform_);
};

/**
 * Known user-agent IDs.
 * @enum {number}
 * @private
 */
createjs.UserAgent.Type = {
  OPERA: 0,
  MSIE:  1,
  CHROME: 2,
  SAFARI: 3,
  FIREFOX: 4,
  ANDROID: 5,
  EDGE: 6,
  UNKNOWN: 7
};

/**
 * Known platform IDs.
 * @enum {number}
 * @private
 */
createjs.UserAgent.Platform = {
  WINDOWS: 0,
  MAC: 1,
  LINUX: 2,
  ANDROID: 3,
  IPHONE: 4,
  UNKNOWN: 5
};

/**
 * The instance of the createjs.UserAgent object.
 * @type {createjs.UserAgent}
 * @private
 */
createjs.UserAgent.instance_ = null;

/**
 * Parses a user-agent string and returns the most possible user-agent ID.
 * @param {string} userAgent
 * @param {boolean} isWebKit
 * @param {number} platform
 * @return {number}
 * @private
 */
createjs.UserAgent.getAgent_ = function(userAgent, isWebKit, platform) {
  /// <param type="string" name="userAgent"/>
  /// <param type="boolean" name="isWebKit"/>
  /// <param type="number" name="platform"/>
  /// <returns type="number"/>
  var AGENTS = {
    'Opera': createjs.UserAgent.Type.OPERA,
    'MSIE': createjs.UserAgent.Type.MSIE,
    'Trident': createjs.UserAgent.Type.MSIE,
    'Edge': createjs.UserAgent.Type.EDGE
};
  for (var key in AGENTS) {
    if (userAgent.indexOf(key) >= 0) {
      return AGENTS[key];
    }
  }
  var WEBKIT_AGENTS = {
    'Chrome': createjs.UserAgent.Type.CHROME,
    'Safari': createjs.UserAgent.Type.SAFARI
  };
  var GECKO_AGENTS = {
    'Gecko': createjs.UserAgent.Type.FIREFOX,
    'Firefox': createjs.UserAgent.Type.FIREFOX
  };
  var agents = isWebKit ? WEBKIT_AGENTS : GECKO_AGENTS;
  for (var key in agents) {
    if (userAgent.indexOf(key) >= 0) {
      var agent = agents[key];
      // Assign a pseudo user-agent ID (which represents the stock browsers of
      // Android devices prior to 4.4) when this user agent is not either Chrome
      // for Android or Chromium WebView. (These stock browsers need many
      // browser-specific workarounds.)
      if (platform == createjs.UserAgent.Platform.ANDROID &&
          agent == createjs.UserAgent.Type.SAFARI) {
        return createjs.UserAgent.Type.ANDROID;
      }
      return agent;
    }
  }
  return createjs.UserAgent.Type.UNKNOWN;
};

/**
 * Parses a platform string and returns the most possible platform ID.
 * @param {string} userAgent
 * @param {string} platform
 * @return {number}
 * @private
 */
createjs.UserAgent.getPlatform_ = function(userAgent, platform) {
  /// <param type="string" name="userAgent"/>
  /// <param type="string" name="platform"/>
  /// <returns type="number"/>
  var PLATFORMS = {
    'Win': createjs.UserAgent.Platform.WINDOWS,
    'Mac': createjs.UserAgent.Platform.MAC,
    'Linux': createjs.UserAgent.Platform.LINUX,
    'iPhone': createjs.UserAgent.Platform.IPHONE,
    'iPad': createjs.UserAgent.Platform.IPHONE
  };
  for (var key in PLATFORMS) {
    if (platform.indexOf(key) >= 0) {
      var value = PLATFORMS[key];
      if (value == createjs.UserAgent.Platform.LINUX) {
        // Check the user-agent string to distinguish Android from Linux.
        if (userAgent.indexOf('Android') >= 0) {
          return createjs.UserAgent.Platform.ANDROID;
        }
      }
      return value;
    }
  }
  return createjs.UserAgent.Platform.UNKNOWN;
};

/**
 * Returns the instance of the createjs.userAgent object.
 * @return {createjs.UserAgent}
 * @private
 */
createjs.UserAgent.getInstance_ = function() {
  /// <returns type="createjs.UserAgent"/>
  if (!createjs.UserAgent.instance_) {
    var navigator = createjs.global['navigator'];
    var userAgent = navigator ? navigator['userAgent'] : '';
    var platform = navigator ? navigator['platform'] : '';
    createjs.UserAgent.instance_ = new createjs.UserAgent(userAgent, platform);
  }
  return createjs.UserAgent.instance_;
};

/**
 * Returns whether the detected user-agent ID is equal to the specified one.
 * @param {number} agent
 * @return {boolean}
 * @private
 */
createjs.UserAgent.compareAgent_ = function(agent) {
  /// <param type="number" name="agent"/>
  /// <returns type="boolean"/>
  return createjs.UserAgent.getInstance_().agent_ == agent;
};

/**
 * Returns whether the detected platform ID is equal to the specified one.
 * @param {number} platform
 * @return {boolean}
 * @private
 */
createjs.UserAgent.comparePlatform_ = function(platform) {
  /// <param type="number" name="platform"/>
  /// <returns type="boolean"/>
  return createjs.UserAgent.getInstance_().platform_ == platform;
};

/**
 * Returns the user-agent string.
 * @return {string}
 */
createjs.UserAgent.getUserAgent = function() {
  /// <returns type="string"/>
  return createjs.UserAgent.getInstance_().userAgent_;
};

/**
 * Returns whether the hosting browser is Opera (Presto). (Newer versions of
 * Opera use Blink and they are treated as Chrome.)
 * @return {boolean}
 */
createjs.UserAgent.isOpera = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.OPERA);
};

/**
 * Returns whether the hosting browser is Internet Explorer (Trident).
 * @return {boolean}
 */
createjs.UserAgent.isMSIE = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.MSIE);
};

/**
 * Returns whether the hosting browser is Firefox (Gecko).
 * @return {boolean}
 */
createjs.UserAgent.isFirefox = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.FIREFOX);
};

/**
 * Returns whether the hosting browser is Chrome (WebKit or Blink).
 * @return {boolean}
 */
createjs.UserAgent.isChrome = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.CHROME);
};

/**
 * Returns whether the hosting browser is Safari (WebKit).
 * @return {boolean}
 */
createjs.UserAgent.isSafari = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.SAFARI);
};

/**
 * Returns whether the hosting browser is a stock browser or a WebView of
 * Android (prior to 4.4).
 * @return {boolean}
 */
createjs.UserAgent.isAndroidBrowser = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.ANDROID);
};

/**
 * Returns whether the hosting browser is Microsoft Edge.
 * @return {boolean}
 */
createjs.UserAgent.isEdge = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.EDGE);
};

/**
 * Returns whether the hosting browser is an unknown browser.
 * @return {boolean}
 */
createjs.UserAgent.isUnknown = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.compareAgent_(createjs.UserAgent.Type.UNKNOWN);
};

/**
 * Returns whether the host platform is Windows.
 * @return {boolean}
 */
createjs.UserAgent.isWindows = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.comparePlatform_(
      createjs.UserAgent.Platform.WINDOWS);
};

/**
 * Returns whether the host platform is Mac OS X.
 * @return {boolean}
 */
createjs.UserAgent.isMac = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.comparePlatform_(createjs.UserAgent.Platform.MAC);
};

/**
 * Returns whether the host platform is Linux.
 * @return {boolean}
 */
createjs.UserAgent.isLinux = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.comparePlatform_(createjs.UserAgent.Platform.LINUX);
};

/**
 * Returns whether the host platform is Android.
 * @return {boolean}
 */
createjs.UserAgent.isAndroid = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.comparePlatform_(
      createjs.UserAgent.Platform.ANDROID);
};

/**
 * Returns whether the host platform is iPhone or iPad.
 * @return {boolean}
 */
createjs.UserAgent.isIPhone = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.comparePlatform_(
      createjs.UserAgent.Platform.IPHONE);
};

/**
 * Returns whether the host platform uses WebKit (or blink).
 * @return {boolean}
 */
createjs.UserAgent.isWebKit = function() {
  /// <returns type="boolean"/>
  return createjs.UserAgent.getInstance_().isWebKit_;
};
