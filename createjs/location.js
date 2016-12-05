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
 * A class that parses a URL and creates properties compatible with the ones of
 * the Location interface.
 * @param {string} source
 * @constructor
 */
createjs.Location = function(source) {
  /// <param type="string" name="source"/>
  var match = source.match(createjs.Location.PATTERN_);

  /**
   * The protocol scheme, e.g. 'http:', 'https:', etc.
   * @const {string}
   */
  this.protocol = match[1];

  /**
   * The user-name and the password, e.g. 'anonymous:password@'.
   * @const {string}
   */
  this.user = match[2];

  /**
   * The host name and the port number, e.g. 'localhost:8888'.
   * @const {string}
   */
  this.hostname = match[3];

  /**
   * The file path, e.g. '/images/logo.png'.
   * @const {string}
   */
  this.pathname = match[4];

  /**
   * The search string, e.g. '?q=0'.
   * @const {string}
   */
  this.search = match[5];

  /**
   * The hash string, e.g. '#top'.
   * @const {string}
   */
  this.hash = match[6];
};

/**
 * A regular expression matching to a URI. This expression is used for dividing
 * a URI into properties compatible with the Location interface.
 * @const {RegExp}
 * @private
 */
createjs.Location.PATTERN_ = new RegExp(
    '^' +
    '(?:' +
      '([^:/?#.]+:)' +   // $1 = protocol
    ')?' +
    '(?://' +
      '([^/?#]*@)?' +    // $2 = username + password
      '([^/?#@]+)?' +    // $3 = hostname
    ')?' +
    '([^?#]+)?' +        // $4 = pathname
    '(?:\\?([^#]*))?' +  // $5 = search
    '(?:#(.*))?' +       // $6 = hash
    '$');

/**
 * Returns whether this location is a relative one.
 * @return {boolean}
 * @const
 */
createjs.Location.prototype.isRelative = function() {
  /// <returns type="boolean"/>
  return !!this.pathname && this.pathname.charCodeAt(0) != 0x2f;
};

/**
 * Returns whether this location is a cross-domain one.
 * @return {boolean}
 * @const
 */
createjs.Location.prototype.isCrossDomain = function() {
  /// <returns type="boolean"/>
  var targetOrigin = this.protocol + '//' + this.hostname;
  var origin = createjs.getOrigin();
  return targetOrigin != origin;
};

/**
 * Returns whether this location is a local one.
 * @return {boolean}
 * @const
 */
createjs.Location.prototype.isLocal = function() {
  /// <returns type="boolean"/>
  return !this.hostname || this.protocol == 'file:';
};

/**
 * Returns the extension.
 * @return {string}
 * @const
 */
createjs.Location.prototype.getExtension = function() {
  /// <returns type="string"/>
  if (!this.pathname) {
    return '';
  }
  var index = this.pathname.lastIndexOf('.');
  if (index < 0) {
    return '';
  }
  return this.pathname.substring(index + 1).toLowerCase();
};
