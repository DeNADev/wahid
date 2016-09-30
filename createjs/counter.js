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
 * A class that stores global counters internally used for debug.
 * @constructor
 */
createjs.Counter = function() {
};

if (createjs.DEBUG) {
  /**
   * The number of renderer objects in the global cache.
   * @type {number}
   */
  createjs.Counter.cachedRenderers = 0;

  /**
   * The total number of renderer objects used by this library.
   * @type {number}
   */
  createjs.Counter.totalRenderers = 0;

  /**
   * The number of display objects painted in a rendering cycle.
   * @type {number}
   */
  createjs.Counter.paintedObjects = 0;

  /**
   * The number of visible display objects in a rendering cycle.
   * @type {number}
   */
  createjs.Counter.visibleObjects = 0;

  /**
   * The total number of display objects in a rendering cycle.
   * @type {number}
   */
  createjs.Counter.totalObjects = 0;

  /**
   * The number of tweens updated in a rendering cycle.
   * @type {number}
   */
  createjs.Counter.updatedTweens = 0;

  /**
   * The number of tweens running in a rendering cycle.
   * @type {number}
   */
  createjs.Counter.runningTweens = 0;

  /**
   * The total number of tweens used by an application.
   * @type {number}
   */
  createjs.Counter.totalTweens = 0;

  /**
   * Resets the global variables used by this class.
   * @const
   */
  createjs.Counter.reset = function() {
    createjs.Counter.cachedRenderers = 0;
    createjs.Counter.totalRenderers = 0;
    createjs.Counter.paintedObjects = 0;
    createjs.Counter.visibleObjects = 0;
    createjs.Counter.totalObjects = 0;
    createjs.Counter.updatedTweens = 0;
    createjs.Counter.runningTweens = 0;
    createjs.Counter.totalTweens = 0;
  };

    // Export the createjs.Counter class to the global namespace.
  createjs.exportObject('createjs.Counter', createjs.Counter, {});
}
