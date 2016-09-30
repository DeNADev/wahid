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
/// <reference path="event.js"/>

/**
 * A class that represents a 'tick' event send by the createjs.Ticker object.
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @param {number} delta
 * @param {boolean} paused
 * @param {number} time
 * @param {number} runTime
 * @extends {createjs.Event}
 * @constructor
 **/
createjs.TickEvent =
    function(type, bubbles, cancelable, delta, paused, time, runTime) {
  createjs.Event.call(this, type, bubbles, cancelable);
};
createjs.inherits('TickEvent', createjs.TickEvent, createjs.Event);

/**
 * Resets this event. This method sets properties of this event to re-use it.
 * @param {number} delta
 * @param {boolean} paused
 * @param {number} time
 * @param {number} runTime
 * @const
 */
createjs.TickEvent.prototype.reset = function(delta, paused, time, runTime) {
};
