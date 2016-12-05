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
/// <reference path="event_dispatcher.js"/>
/// <reference path="object_list.js"/>
/// <reference path="tick_event.js"/>
/// <reference path="tick_listener.js"/>
/// <reference path="user_agent.js"/>

/**
 * A singleton class that provides a tick.
 * @extends {createjs.EventDispatcher}
 * @constructor
 */
createjs.Ticker = function() {
  createjs.EventDispatcher.call(this);
};
createjs.inherits('Ticker', createjs.Ticker, createjs.EventDispatcher);

/**
 * The global instance of the createjs.Ticker object.
 * @type {createjs.Ticker}
 * @private
 */
createjs.Ticker.instance_ = null;

/**
 * Represents the mode that the Ticker object uses the requestAnimationFrame API
 * with synchronization to the target frame-rate.
 * @const {string}
 */
createjs.Ticker.RAF_SYNCHED = 'synched';

/**
 * Represents the mode that the Ticker object uses the requestAnimationFrame API
 * without synchronization to the target frame-rate.
 * @const {string}
 */
createjs.Ticker.RAF = 'raf';

/**
 * The mode representing the Ticker object uses the setTimeout API.
 * @const {string}
 */
createjs.Ticker.TIMEOUT = 'timeout';

/**
 * The mode representing the Ticker object chooses the best API for it.
 * @const {string}
 */
createjs.Ticker.AUTO = 'auto';

/**
 * The requestAnimationFrame() method used by the createjs.Ticker object.
 * @const {Function}
 */
createjs.Ticker.requestAnimationFrame =
    createjs.global['requestAnimationFrame'] ||
    createjs.global['webkitRequestAnimationFrame'];

/** 
 * The cancelAnimationFrame() method used by the createjs.Ticker object.
 * @const {Function}
 */
createjs.Ticker.cancelAnimationFrame =
    createjs.global['cancelAnimationFrame'] ||
    createjs.global['webkitCancelAnimationFrame'];

/**
 * The maximum number of times to measure animation intervals.
 * @const {number}
 */
createjs.Ticker.RETRY = 10;

/** 
 * Whether this ticker is not running now.
 * @type {boolean}
 * @protected
 */
createjs.Ticker.prototype.paused_ = false;

/**
 * Whether this ticker has been initialized. (This does not mean the ticker is
 * currently running or not.)
 * @type {boolean}
 * @protected
 */
createjs.Ticker.prototype.initialized_ = false;

/**
 * The time when this ticker starts dispatching tick events.
 * @type {number}
 * @protected
 */
createjs.Ticker.prototype.startTime_ = 0;

/**
 * The total period of time that this ticker stops dispatching tick events.
 * @type {number}
 * @protected
 */
createjs.Ticker.prototype.pausedTime_ = 0;

/**
 * The interrupt interval for calling the 'tick_()' method repeatedly in
 * milliseconds.
 * @type {number}
 * @protected
 */
createjs.Ticker.prototype.interval_ = 50;

/**
 * The last time when this ticker has dispatched tick events.
 * @type {number}
 * @protected
 */
createjs.Ticker.prototype.lastTime_ = 0;

/**
 * The list of times when this ticker has dispatched tick events.
 * @type {createjs.Ticker.PerformanceCounter}
 * @protected
 */
createjs.Ticker.prototype.times_ = null;

/**
 * Stores the timeout or requestAnimationFrame id.
 * @type {number}
 * @protected
 */
createjs.Ticker.prototype.timerId_ = 0;

/**
 * True if currently using requestAnimationFrame, false if using setTimeout.
 * @type {boolean}
 * @protected
 */
createjs.Ticker.prototype.useRAF_ = false;

/**
 * The listeners which listens tick events. This ticker adds createjs.Stage
 * objects and createjs.Tween objects to update them without dispatching 'tick'
 * events. (There is some overhead for the createjs.EventDispatcher class to
 * dispatch a 'tick' event.)
 * @type {createjs.ObjectList}
 * @private
 */
createjs.Ticker.prototype.tickListeners_ = null;

/**
 * The 'tick' event used by this ticker.
 * @type {createjs.TickEvent}
 * @private
 */
createjs.Ticker.prototype.tickEvent_ = null;

/**
 * The remaining number of times to measure animation intervals.
 * @type {number}
 * @private
 */
createjs.Ticker.prototype.retry_ = createjs.Ticker.RETRY;

/**
 * The timestamp used in measuring the interval of the requestAnimationFrame()
 * API.
 * @type {number}
 * @private
 */
createjs.Ticker.prototype.timestamp_ = 0;

/**
 * A class that collects the specified number of values.
 * @constructor
 */
createjs.Ticker.PerformanceCounter = function() {
  /**
   * @type {number}
   */
  this.offset_ = 0;

  /**
   * @type {Array.<number>}
   */
  this.values_ = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ];
};

/**
 * @const {number}
 * @private
 */
createjs.Ticker.PerformanceCounter.SIZE = 64;
 
/**
 * @const {number}
 * @private
 */
createjs.Ticker.PerformanceCounter.MASK =
    createjs.Ticker.PerformanceCounter.SIZE - 1;


/**
 * Adds a value to this object.
 * @param {number} value
 */
createjs.Ticker.PerformanceCounter.prototype.addValue = function(value) {
  /// <param type="number" name="value"/>
  var offset = this.offset_ & createjs.Ticker.PerformanceCounter.MASK;
  this.values_[offset] = value;
  ++this.offset_;
};

/**
 * Returns the average of the values stored in this object.
 * @return {number}
 */
createjs.Ticker.PerformanceCounter.prototype.getAverage = function() {
  /// <returns type="number"/>
  if (!this.offset_) {
    return 0;
  }
  var total = 0;
  var size = createjs.min(this.offset_,
                          createjs.Ticker.PerformanceCounter.SIZE);
  for (var i = 0; i < size; ++i) {
    total += this.values_[i]
  }
  return total / size;
};

/**
 * Returns the frames per second.
 * @return {number}
 */
createjs.Ticker.PerformanceCounter.prototype.getFPS = function() {
  /// <returns type="number"/>
  var size = createjs.min(this.offset_,
                          createjs.Ticker.PerformanceCounter.SIZE);
  var head = (this.offset_ - size) & createjs.Ticker.PerformanceCounter.MASK;
  var tail = (this.offset_ - 1) & createjs.Ticker.PerformanceCounter.MASK;
  return 1000 * size / (this.values_[tail] - this.values_[head]);
};

/**
 * Returns the instance of the createjs.Ticker object.
 * @return {createjs.Ticker}
 */
createjs.Ticker.getInstance_ = function() {
  /// <returns type="createjs.Ticker"/>
  if (!createjs.Ticker.instance_) {
    createjs.Ticker.instance_ = new createjs.Ticker();
  }
  return createjs.Ticker.instance_;
};

/**
 * Returns the instance of the createjs.Ticker object.
 * @param {number} delta
 * @param {boolean} paused
 * @param {number} time
 * @param {number} runTime
 * @return {createjs.TickEvent}
 */
createjs.Ticker.getEvent_ = function(delta, paused, time, runTime) {
  /// <param type="number" name="delta"/>
  /// <param type="boolean" name="paused"/>
  /// <param type="number" name="time"/>
  /// <param type="number" name="runTime"/>
  /// <returns type="createjs.TickEvent"/>
  var ticker = createjs.Ticker.getInstance_();
  if (!ticker.tickEvent_) {
    ticker.tickEvent_ = new createjs.TickEvent(
        'tick', false, false, delta, paused, time, runTime);
  } else {
    ticker.tickEvent_.reset(delta, paused, time, runTime);
  }
  return ticker.tickEvent_;
};

/**
 * Called when the browser sends a system tick event. This method is called
 * either by a requestAnimationFrame() callback or by a setTimeout() callback.
 * @param {number} timestamp
 * @private
 */
createjs.Ticker.tick_ = function(timestamp) {
  /// <param type="number" name="timestamp"/>
  var ticker = createjs.Ticker.getInstance_();
  if (!ticker.startTime_) {
    ticker.startTime_ = timestamp;
  }
  var elapsedTime = timestamp - ticker.lastTime_;
  ticker.lastTime_ = timestamp;
  var paused = ticker.paused_;
  if (paused) {
    ticker.pausedTime_ += elapsedTime;
  } else {
    var time = timestamp - ticker.startTime_;
    var runTime = time - ticker.pausedTime_;
    var tickListeners = ticker.tickListeners_;
    if (tickListeners) {
      var listeners = ticker.tickListeners_.lock();
      for (var i = 0; i < listeners.length; ++i) {
        var listener = /** @type {createjs.TickListener} */ (listeners[i]);
        listener.handleTick(runTime);
      }
      tickListeners.unlock();
    }
    if (ticker.hasListener('tick')) {
      var event = createjs.Ticker.getEvent_(elapsedTime, paused, time, runTime);
      ticker.dispatchRawEvent(event);
    }
  }

  if (!ticker.times_) {
    ticker.times_ = new createjs.Ticker.PerformanceCounter();
  }
  ticker.times_.addValue(timestamp);
};

/**
 * A callback function for the window.requestAnimationFrame() method. This
 * function sends a tick event only when it takes at least |ticker.internal_|
 * milliseconds since the last time when it sends the event.
 * @param {number} timestamp
 * @private
 */
createjs.Ticker.handleSynchronizedRAF_ = function(timestamp) {
  /// <param type="number" name="timestamp"/>
  var ticker = createjs.Ticker.getInstance_();
  ticker.timerId_ = createjs.Ticker.requestAnimationFrame.call(
      createjs.global, createjs.Ticker.handleSynchronizedRAF_);
  var elapsed = timestamp - ticker.lastTime_;
  // Some browsers truncates the given timestamp to ms (e.g. 33.3 ms -> 33 ms)
  // and it prevents calling the 'tick_()' method at its expected frequency if
  // the interval is not an integer. To work around such truncated timestamps,
  // this method compares with 'ticker.interval_ - 1' instead of comparing with
  // 'ticker.interval_'.
  if (elapsed >= ticker.interval_ - 1) {
    createjs.Ticker.tick_(timestamp);
  }
};

/**
 * A callback function for the window.setInterval() method.
 * @private
 */
createjs.Ticker.handleInterval_ = function() {
  var ticker = createjs.Ticker.getInstance_();
  var timestamp = Date.now();
  createjs.Ticker.tick_(timestamp);
};

/**
 * Stops the global ticker.
 * @param {createjs.Ticker} ticker
 * @private
 */
createjs.Ticker.stopTick_ = function(ticker) {
  /// <param type="createjs.Ticker" name="ticker"/>
  if (ticker.timerId_) {
    if (ticker.useRAF_) {
      if (createjs.Ticker.cancelAnimationFrame) {
        createjs.Ticker.cancelAnimationFrame.call(
            createjs.global, ticker.timerId_);
      }
    } else {
      createjs.global.clearInterval(ticker.timerId_);
    }
    ticker.timerId_ = 0;
  }
};

/**
 * Starts the global ticker.
 * @private
 */
createjs.Ticker.setupTick_ = function() {
  var ticker = createjs.Ticker.getInstance_();
  createjs.Ticker.stopTick_(ticker);
  // There are lots of browser issues and it is not so trivial to choose a tick
  // method for a game to render its frames at 60 fps as listed in the following
  // table.
  //   +---------+------------------------+---------+---------+
  //   | Browser | OS                     | timeout | synched |
  //   +---------+------------------------+---------+---------+
  //   | WebView | Android 4.0 or 4.1     | OK      | N/A     |
  //   |         | Android 4.2            | (3)     | OK      |
  //   |         | Android 4.3            | OK      | OK      |
  //   |         | Android 4.4 or later   | OK      | (1)     |
  //   +---------+------------------------+---------+---------+
  //   | Chrome  | Android                | OK      | (1)     |
  //   |         | Win                    | (2)     | OK      |
  //   |         | Mac                    | (2)     | OK      |
  //   +---------+------------------------+---------+---------+
  //   | Safari  | iOS                    | OK      | OK      |
  //   |         | Mac                    | OK      | OK      |
  //   +---------+------------------------+---------+---------+
  //   | IE11    | Win                    | OK      | OK      |
  //   +---------+------------------------+---------+---------+
  //   | Edge    | Win                    | OK      | OK      |
  //   +---------+------------------------+---------+---------+
  // (1) The requestAnimationFrame() method does not guarantee calling its
  //     callbacks at 60 fps.
  // (2) Chrome skips frames rendered by setInterval() callbacks
  //     <http://crbug.com/436021>.
  // (3) An eval() call clears setInterval() callbacks on Android 4.2
  //     <http://stackoverflow.com/questions/17617608>.
  var mode = /** @type {string} */ (createjs.Ticker.exports['timingMode']);
  if (mode != createjs.Ticker.TIMEOUT) {
    if (createjs.Ticker.requestAnimationFrame) {
      var callback = createjs.Ticker.handleSynchronizedRAF_;
      ticker.timerId_ =
          createjs.Ticker.requestAnimationFrame.call(createjs.global, callback);
      ticker.useRAF_ = true;
      return;
    }
  }
  ticker.useRAF_ = false;
  ticker.timerId_ = createjs.global.setInterval(
      createjs.Ticker.handleInterval_,
      ticker.interval_);
};

/**
 * Stops the global ticker and removes all listeners.
 * @param {boolean=} opt_destroy
 */
createjs.Ticker.reset = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  var ticker = createjs.Ticker.getInstance_();
  ticker.removeAllListeners();
  ticker.tickListeners_ = null;
  if (opt_destroy) {
    createjs.Ticker.stopTick_(ticker);
  }
};
  
/**
 * Kicks the global ticker. This method explicitly calls the setInterval()
 * callback added by the ticker if it uses the setInterval() method. (This is a
 * workaround for Android Chrome, which does not call setInterval() callbacks
 * while it dispatches touch events.)
 */
createjs.Ticker.kick = function() {
  var ticker = createjs.Ticker.getInstance_();
  if (!ticker.useRAF_ && ticker.timerId_) {
    var timestamp = Date.now();
    var elapsed = timestamp - ticker.lastTime_;
    if (elapsed >= ticker.interval_ - 1) {
      createjs.Ticker.tick_(timestamp);
    }
  }
};

/**
 * Sets the tick interval (in milliseconds).
 * @param {number} interval
 */
createjs.Ticker.setInterval = function(interval) {
  /// <param type="number" name="value"/>
  var ticker = createjs.Ticker.getInstance_();
  ticker.interval_ = interval;
  if (ticker.initialized_) {
    createjs.Ticker.setupTick_();
  }
};

/**
 * Returns the current tick interval.
 * @return {number}
 */
createjs.Ticker.getInterval = function() {
  /// <returns type="number"/>
  var ticker = createjs.Ticker.getInstance_();
  return ticker.interval_;
};

/**
 * Sets the target frame-rate in frames per second (FPS).
 * @param {number} value
 * @param {boolean=} opt_noClip
 */
createjs.Ticker.setFPS = function(value, opt_noClip) {
  /// <param type="number" name="value"/>
  /// <param type="number" optional="true" name="opt_noClip"/>
  // Round up the input FPS so it becomes a divisor of 60.
  value = 60 / createjs.truncate(60 / value);
  createjs.Ticker.setInterval(createjs.truncate(1000 / value));
};

/**
 * Returns the target frame-rate in frames per second (FPS).
 * @return {number}
 */
createjs.Ticker.getFPS = function() {
  /// <returns type="number"/>
  var ticker = createjs.Ticker.getInstance_();
  return 1000 / ticker.interval_;
};

/**
 * Returns the time elapsed since the last tick in frames.
 * @return {number}
 */
createjs.Ticker.getFrames = function() {
  /// <returns type="number"/>
  return 1;
};

/**
 * Returns the average time spent within a tick.
 * @param {number=} opt_ticks
 * @return {number}
 */
createjs.Ticker.getMeasuredTickTime = function(opt_ticks) {
  /// <param type="number" optional="true" name="opt_ticks"/>
  /// <returns type="number"/>
  return 0;
};

/**
 * Returns the actual frames per second.
 * @param {number=} opt_ticks
 * @return {number}
 */
createjs.Ticker.getMeasuredFPS = function(opt_ticks) {
  /// <param type="number" optional="true" name="opt_ticks"/>
  /// <returns type="number"/>
  var ticker = createjs.Ticker.getInstance_();
  return ticker.times_.getFPS();
};

/**
 * Starts the Ticker object or stops it.
 * @param {boolean} value
 */
createjs.Ticker.setPaused = function(value) {
  /// <param type="boolean" name="value"/>
  var ticker = createjs.Ticker.getInstance_();
  ticker.paused_ = value;
};

/**
 * Returns whether the Ticker object is paused.
 * @return {boolean}
 */
createjs.Ticker.getPaused = function() {
  /// <returns type="boolean"/>
  var ticker = createjs.Ticker.getInstance_();
  return ticker.paused_;
};

/**
 * Returns the last time when this object dispatches a tick event.
 * @return {number}
 */
createjs.Ticker.getRunTime = function() {
  /// <returns type="number"/>
  var ticker = createjs.Ticker.getInstance_();
  return ticker.lastTime_ - ticker.startTime_ - ticker.pausedTime_;
};

/**
 * Returns the last tick time.
 * @param {boolean=} opt_runTime
 * @returns {number}
 */
createjs.Ticker.getEventTime = function(opt_runTime) {
  /// <param type="boolean" optional="true" name="opt_runTime"/>
  /// <returns type="number"/>
  var ticker = createjs.Ticker.getInstance_();
  var time = ticker.lastTime_;
  if (!!opt_runTime) {
    time -= ticker.pausedTime_;
  }
  return time;
};
  
/**
 * Returns the number of ticks that have been broadcast by Ticker.
 * @param {boolean} pauseable
 * @return {number}
 */
createjs.Ticker.getTicks = function(pauseable) {
  /// <param type="boolean" name="pausable"/>
  /// <returns type="number"/>
  return 0;
};

/**
 * Adds an event listener.
 * @param {string} type
 * @param {Function|Object} listener
 * @param {boolean=} opt_useCapture
 * @return {Function|Object}
 */
createjs.Ticker.addListener = function(type, listener, opt_useCapture) {
  /// <param type="string" name="type"/>
  /// <param type="Function" name="listener"/>
  /// <param type="boolean" optional="true" name="opt_useCapture"/>
  /// <returns type="Function"/>
  createjs.assert(type == 'tick');
  var ticker = createjs.Ticker.getInstance_();
  if (!ticker.initialized_) {
    ticker.initialized_ = true;
    createjs.Ticker.setupTick_();
  }
  if (listener.handleTick) {
    if (!ticker.tickListeners_) {
      ticker.tickListeners_ = new createjs.ObjectList();
    }
    ticker.tickListeners_.pushUniqueItem(listener);
    return listener;
  }
  return ticker.on(type, listener);
};

/**
 * Removes the specified event listener.
 * @param {string} type
 * @param {Function|Object} listener
 * @param {boolean=} opt_useCapture
 */
createjs.Ticker.removeListener = function(type, listener, opt_useCapture) {
  /// <param type="string" name="type"/>
  /// <param type="Function" name="listener"/>
  /// <param type="boolean" optional="true" name="opt_useCapture"/>
  createjs.assert(type == 'tick');
  if (!listener) {
    return;
  }
  var ticker = createjs.Ticker.getInstance_();
  if (listener.handleTick) {
    var listeners = ticker.tickListeners_;
    if (listeners) {
      listeners.removeItem(listener);
    }
    return;
  }
  ticker.off(type, listener);
};

/**
 * Removes all listeners for the specified type, or all listeners of all types.
 * @param {string=} opt_type
 */
createjs.Ticker.removeAllListeners = function(opt_type) {
  /// <param type="string" optional="true" name="type"/>
  createjs.assert(opt_type == null || opt_type == 'tick');
  var ticker = createjs.Ticker.getInstance_();
  var listeners = ticker.tickListeners_;
  if (listeners) {
    listeners.removeAllItems();
  }
  ticker.removeAllListeners(opt_type || '');
};

/**
 * Dispatches the specified event to all listeners.
 * @param {Object|string|Event} event
 * @param {Object=} opt_target
 * @return {boolean}
 */
createjs.Ticker.dispatch = function(event, opt_target) {
  /// <param name="event"/>
  /// <param type="Object" optional="true" name="opt_target"/>
  /// <returns type="boolean"/>
  var ticker = createjs.Ticker.getInstance_();
  return ticker.dispatch(event, opt_target || null);
};

/**
 * Returns whether there is at least one listener for the specified event type.
 * @param {string} type
 * @return {boolean}
 */
createjs.Ticker.hasListener = function(type) {
  /// <param name="event"/>
  /// <returns type="boolean"/>
  createjs.assert(type == 'tick');
  var ticker = createjs.Ticker.getInstance_();
  return ticker.hasListener(type);
};

/**
 * A table of exported functions.
 * @type {Object.<string,Function|string>}
 * @const
 */
createjs.Ticker.exports = createjs.exportStatic('createjs.Ticker', {
  'reset': createjs.Ticker.reset,
  'setInterval': createjs.Ticker.setInterval,
  'getInterval': createjs.Ticker.getInterval,
  'setFPS': createjs.Ticker.setFPS,
  'getFPS': createjs.Ticker.getFPS,
  'getMeasuredTickTime': createjs.Ticker.getMeasuredTickTime,
  'getMeasuredFPS': createjs.Ticker.getMeasuredFPS,
  'setPaused': createjs.Ticker.setPaused,
  'getPaused': createjs.Ticker.getPaused,
  'getTime': createjs.Ticker.getEventTime,
  'getEventTime': createjs.Ticker.getEventTime,
  'getTicks': createjs.Ticker.getTicks,
  'addEventListener': createjs.Ticker.addListener,
  'removeEventListener': createjs.Ticker.removeListener,
  'removeAllEventListeners': createjs.Ticker.removeAllListeners,
  'dispatchEvent': createjs.Ticker.dispatch,
  'hasEventListener': createjs.Ticker.hasListener,
  'timingMode': createjs.Ticker.RAF_SYNCHED
});
