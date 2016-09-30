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
/// <reference path="tween_target.js"/>

/**
 * An interface used for controlling a tween.
 * @interface
 */
createjs.TweenObject = function() {};

/**
 * Masks used by the updateTween() method.
 * @enum {number}
 */
createjs.TweenObject.Flag = {
  PLAY_MODE: 3,
  UPDATE: 4
};

/**
 * Updates the position of this tween.
 * @param {number} time
 * @param {number} flag
 * @param {number} next
 * @return {number}
 */
createjs.TweenObject.prototype.updateTween = function(time, flag, next) {};

/**
 * Starts playing this tween.
 * @param {number} time
 */
createjs.TweenObject.prototype.playTween = function(time) {};

/**
 * Stops playing this tween.
 * @param {number} time
 */
createjs.TweenObject.prototype.stopTween = function(time) {};

/**
 * Sets a proxy that intermediates this tween and its target.
 * @param {createjs.TweenTarget} proxy
 * @param {Array.<createjs.TweenTarget>} targets
 * @return {number}
 */
createjs.TweenObject.prototype.setProxy = function(proxy, targets) {};

/**
 * Sets the play offset of this tween.
 * @param {number} position
 * @param {number} mode
 */
createjs.TweenObject.prototype.setPosition = function(position, mode) {};

/**
 * Sets the properties of this tween.
 * @param {boolean} loop
 * @param {number} position
 * @param {boolean} single
 */
createjs.TweenObject.prototype.setProperties =
    function(loop, position, single) {};

/**
 * Returns whether this tween reaches its end.
 * @return {boolean}
 */
createjs.TweenObject.prototype.isEnded = function() {};
