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
 * A class that breaks text into words.
 * @constructor
 */
createjs.WordBreaker = function() {
};

/**
 * Whether to support punctuation characters (U+2000...U+20FF).
 * @define {boolean}
 */
createjs.WordBreaker.PUNCTUATION_CHARACTERS = false;

/**
 * Whether to support CJK ideographic characters (U+3000...U+ABFF).
 * @define {boolean}
 */
createjs.WordBreaker.IDEOGRAPHIC_CHARACTERS = true;

/**
 * Whether to support full-width alphabet forms (U+FF00...U+FFFF).
 * @define {boolean}
 */
createjs.WordBreaker.FULLWIDTH_ALPHABETS = false;

/**
 * Return whether the specified code allows inserting a word break before it.
 * @param {number} code
 * @return {boolean}
 * @private
 */
createjs.WordBreaker.canBreakBefore_ = function(code) {
  /// <param type="number" name="code"/>
  /// <returns type="boolean"/>
  var high = code >> 8;
  var low = code & 0xff;
  if (high == 0x20) {
    if (createjs.WordBreaker.PUNCTUATION_CHARACTERS) {
      var NO_BREAK_BEFORE_2000 = [
        0x00000000, 0x00000040, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000
      ];
      return (NO_BREAK_BEFORE_2000[low >> 5] & (1 << (low & 0x1f))) == 0;
    }
  } else if (high == 0x30) {
    if (createjs.WordBreaker.IDEOGRAPHIC_CHARACTERS) {
      var NO_BREAK_BEFORE_3000 = [
        0x0aa2aa06, 0x00000000, 0x000002aa, 0x00000008,
        0x000000a8, 0x000002aa, 0x00000008, 0x100000a8
      ];
      return (NO_BREAK_BEFORE_3000[low >> 5] & (1 << (low & 0x1f))) == 0;
    }
  } else if (high == 0xff) {
    if (createjs.WordBreaker.FULLWIDTH_ALPHABETS) {
      var NO_BREAK_BEFORE_FF00 = [
        0x80005000, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000
      ];
      return (NO_BREAK_BEFORE_FF00[low >> 5] & (1 << (low & 0x1f))) == 0;
    }
  }
  return true;
};

/**
 * Return whether the specified code allows inserting a word break after it.
 * @param {number} code
 * @return {boolean}
 * @private
 */
createjs.WordBreaker.canBreakAfter_ = function(code) {
  /// <param type="number" name="code"/>
  /// <returns type="boolean"/>
  var high = code >> 8;
  var low = code & 0xff;
  if (high == 0x30) {
    if (createjs.WordBreaker.IDEOGRAPHIC_CHARACTERS) {
      var NO_BREAK_AFTER_3000 = [
        0x05515500, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000
      ];
      return (NO_BREAK_AFTER_3000[low >> 5] & (1 << (low & 0x1f))) == 0;
    }
  } else if (high == 0xff) {
    if (createjs.WordBreaker.FULLWIDTH_ALPHABETS) {
      var NO_BREAK_AFTER_FF00 = [
        0x00000100, 0x08000000, 0x08000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000
      ];
      return (NO_BREAK_AFTER_FF00[low >> 5] & (1 << (low & 0x1f))) == 0;
    }
  }
  return true;
};

/**
 * Breaks text into words. This method splits text into a list of text segments
 * where we can insert a line break. In brief, this method implements a subset
 * of Unicode UAX #29.
 * @param {string} text
 * @return {Array.<string>}
 */
createjs.WordBreaker.breakText = function(text) {
  /// <param type="string" name="text"/>
  /// <returns type="Array" elementType="string"/>
  createjs.assert(text.length > 0);
  var words = [];
  var start = 0;
  var previous = text.charCodeAt(0);
  for (var i = 1; i < text.length; ++i) {
    var code = text.charCodeAt(i);
    if (code <= 0x20) {
      if (i >= start) {
        words.push(text.substring(start, i));
      }
      start = i;
    } else if (0x3000 <= code && code < 0xac00) {
      if (createjs.WordBreaker.canBreakAfter_(previous)) {
        if (createjs.WordBreaker.canBreakBefore_(code)) {
          if (i >= start) {
            words.push(text.substring(start, i));
          }
          start = i;
        }
      }
    }
    previous = code;
  }
  if (start < text.length) {
    words.push(text.substring(start));
  }
  return words;
};
