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
 * The base class for file events dispatched by the createjs.Loader class and
 * the createjs.LoadQueue class.
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @param {Object} item
 * @extends {createjs.Event}
 * @constructor
 */
createjs.FileEvent =
    function(type, bubbles, cancelable, item) {
  createjs.Event.call(this, type, bubbles, cancelable);

  /**
   * The item provided by games. The createjs.LoadQueue class sets the item
   * provided by games to this property when it dispatches an event.
   * @type {Object}
   */
  this['item'] = item;
};
createjs.inherits('FileEvent', createjs.FileEvent, createjs.Event);

/**
 * A class that represents a fileerror event.
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @param {Object} item
 * @param {string} message
 * @extends {createjs.FileEvent}
 * @constructor
 */
createjs.FileErrorEvent =
    function(type, bubbles, cancelable, item, message) {
  createjs.FileEvent.call(this, type, bubbles, cancelable, item);
};
createjs.inherits('FileErrorEvent',
                  createjs.FileErrorEvent,
                  createjs.FileEvent);

/**
 * A class that represents a fileprogress event.
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @param {Object} item
 * @param {number} loaded
 * @param {number} total
 * @param {number} progress
 * @extends {createjs.FileEvent}
 * @constructor
 */
createjs.FileProgressEvent =
    function(type, bubbles, cancelable, item, loaded, total, progress) {
  createjs.FileEvent.call(this, type, bubbles, cancelable, item);

  /**
   * The amount that has been loaded so far.
   * @type {number}
   */
  this['loaded'] = loaded;

  /**
   * The total number of bytes read by a loader object.
   * @type {number}
   */
  this['total'] = total;

  /**
   * The ratio that has been loaded between 0 and 1.
   * @type {number}
   */
  this['progress'] = progress;
};
createjs.inherits('FileProgressEvent',
                  createjs.FileProgressEvent,
                  createjs.FileEvent);

/**
 * A class that represents a fileload event.
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @param {Object} item
 * @param {*} result
 * @param {*} rawResult
 * @extends {createjs.FileEvent}
 * @constructor
 */
createjs.FileLoadEvent =
    function(type, bubbles, cancelable, item, result, rawResult) {
  createjs.FileEvent.call(this, type, bubbles, cancelable, item);

  /**
   * The load result. (The type of this object depends on the file type.)
   * @type {*}
   */
  this['result'] = result;

  /**
   * The raw result. (This object should be either an ArrayBuffer object or a
   * string.)
   * @type {*}
   */
  this['rawResult'] = rawResult;
};
createjs.inherits('FileLoadEvent',
                  createjs.FileLoadEvent,
                  createjs.FileEvent);
