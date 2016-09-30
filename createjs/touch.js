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
/// <reference path="stage.js"/>

/**
 * A class that provides methods to start dispatching touch events to
 * createjs.Stage objects and to stop it.
 * @constructor
 */
createjs.Touch = function() {
};

/**
 * Returns whether the host browser supports touch events.
 * @return {boolean}
 **/
createjs.Touch.isSupported = function() {
  /// <returns type="boolean"/>
  return true;
};

/**
 * Starts dispatching touch events to the specified stage.
 * @param {createjs.Stage} stage
 * @param {boolean=} opt_singleTouch
 * @param {boolean=} opt_allowDefault
 */
createjs.Touch.enable = function(stage, opt_singleTouch, opt_allowDefault) {
  /// <param type="createjs.Stage" name="stage"/>
  /// <param type="boolean" optional="true" name="opt_singleTouch"/>
  /// <param type="boolean" optional="true" name="opt_allowDefault"/>
  if (stage) {
    stage.enableTouchEvents(true, !opt_allowDefault);
  }
};

/**
 * Stops dispatching touch events to the specified stage.
 * @param {createjs.Stage} stage
 */
createjs.Touch.disable = function(stage) {
  /// <param type="createjs.Stage" name="stage"/>
  if (stage) {
    stage.enableTouchEvents(false, true);
  }
};

/**
 * A table of exported functions.
 * @type {Object}
 * @const
 */
createjs.Touch.exports = createjs.exportStatic('createjs.Touch', {
  'isSupported': createjs.Touch.isSupported,
  'enable': createjs.Touch.enable,
  'disable': createjs.Touch.disable
});
