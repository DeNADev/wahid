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

/**
 * A base class for all CreateJS events. A CreateJS event is an event dispatched
 * through CreateJS objects. It consists of events encapsulating DOM events
 * (e.g. mouse events, load events, etc.) and events fired by CreateJS objects
 * (e.g. animation events, tick events.) It is slow to bubble events on old
 * Android devices (4.3 or earlier) and this class currently disables event
 * bubbling.
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @extends {createjs.Object}
 * @constructor
 */
createjs.Event = function(type, bubbles, cancelable) {
  /// <param type="string" name="type"/>
  /// <param type="boolean" name="bubbles"/>
  /// <param type="boolean" name="cancelable"/>
  /**
   * The type of this event.
   * @type {string}
   */
  this.type = type;
};
createjs.inherits('Event', createjs.Event, createjs.Object);

/**
 * Key codes for common characters.
 * @enum {number}
 */
createjs.Event.KeyCodes = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  PRINT_SCREEN: 44,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  QUESTION_MARK: 63,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  META: 91,
  WIN_KEY_RIGHT: 92,
  CONTEXT_MENU: 93,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_MULTIPLY: 106,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  NUM_PERIOD: 110,
  NUM_DIVIDE: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  NUMLOCK: 144,
  SCROLL_LOCK: 145,
  SEMICOLON: 186,
  DASH: 189,
  EQUALS: 187,
  COMMA: 188,
  PERIOD: 190,
  SLASH: 191,
  APOSTROPHE: 192,
  TILDE: 192,
  SINGLE_QUOTE: 222,
  OPEN_SQUARE_BRACKET: 219,
  BACKSLASH: 220,
  CLOSE_SQUARE_BRACKET: 221,
  WIN_KEY: 224
};

/**
 * An interface that adds event listeners or removes them. (This interface is
 * for removing a cycling dependency.)
 * @interface
 */
createjs.Event.Target = function() {};

/**
 * Adds the specified event listener. Note that this method does not remove
 * existing listeners even when the specified listener has been already added.
 * So, adding a function three times results that the function is called three
 * times as listed in the following code snippet.
 *
 *   function handleClick(event) {
 *     // This function will be called three times on click.
 *   }
 *   displayObject.on('click', handleClick);
 *   displayObject.on('click', handleClick);
 *   displayObject.on('click', handleClick);
 *
 * @param {string} type
 * @param {Function|Object} listener
 * @param {Object=} opt_scope
 * @param {boolean=} opt_once
 * @param {*=} opt_data
 * @param {boolean=} opt_useCapture
 * @return {Function|Object}
 */
createjs.Event.Target.prototype.on =
    function(type, listener, opt_scope, opt_once, opt_data, opt_useCapture) {
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Function" name="callback"/>
  ///   <param type="Object" optional="true" name="opt_scope"/>
  ///   <param type="boolean" optional="true" name="opt_once"/>
  ///   <param optional="true" optional="true" name="opt_data"/>
  ///   <param type="boolean" optional="true" name="opt_useCapture"/>
  ///   <returns type="Function"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Object" name="listener"/>
  ///   <param type="Object" optional="true" name="opt_scope"/>
  ///   <param type="boolean" optional="true" name="opt_once"/>
  ///   <param optional="true" optional="true" name="opt_data"/>
  ///   <param type="boolean" optional="true" name="opt_useCapture"/>
  ///   <returns type="Object"/>
  /// </signature>
};

/**
 * Removes the specified event listener. Note that this method needs the exact
 * function object used in adding an event listener. If a closure function is
 * added to an event, the closure function itself must be used and another new
 * proxy or closure does not remove the handler as listed in the following code
 * snippet.
 *
 *   function closure(fn, scope) {
 *     return function() { fn.call(scope); };
 *   }
 *   function handleClick(event) {
 *     // The following code does not remove this method.
 *     displayObject.off('click', closure(handleClick, window));
 *   }
 *   displayObject.on('click', closure(handleClick, window));
 *
 * The 'Event.prototype.remove()' method can remove such closure functions as
 * listed in the following code snippet.
 *
 *   function closure(fn, scope) {
 *     return function() { fn.call(scope); };
 *   }
 *   function handleClick(event) {
 *     // This event listener will be removed when it returns.
 *     event.remove();
 *   }
 *   displayObject.on('click', closure(handleClick, window));
 *
 * @param {string} type
 * @param {Function|Object} listener
 * @param {boolean=} opt_useCapture
 */
createjs.Event.Target.prototype.off =
    function(type, listener, opt_useCapture) {
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Function" name="callback"/>
  ///   <param type="boolean" optional="true" name="opt_useCapture"/>
  ///   <returns type="Function"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Object" name="listener"/>
  ///   <param type="boolean" optional="true" name="opt_useCapture"/>
  ///   <returns type="Object"/>
  /// </signature>
};

/**
 * The type of this event.
 * @type {string}
 */
createjs.Event.prototype.type = '';

/**
 * The object that triggered this event.
 * @type {createjs.Event.Target}
 */
createjs.Event.prototype['target'] = null;

/**
 * The current event target, i.e. an object that this event is being
 * dispatched.
 * @type {createjs.Event.Target}
 */
createjs.Event.prototype['currentTarget'] = null;

/**
 * Indicates whether the event will bubble through CreateJS objects. (This
 * feature is disabled.)
 * @type {boolean}
 */
createjs.Event.prototype.bubbles = false;
 
/**
 * Indicates whether the Event.prototype.preventDefault() method can prevent the
 * default behavior of an event. For CreateJS events encapsulating DOM events,
 * their default behaviors are dispatching DOM events to the ancestors of the
 * <canvas> element that receives them. For CreateJS events fired by CreateJS
 * objects, they do not have default behaviors, i.e. their default behaviors are
 * "do nothing".
 * @const {boolean}
 */
createjs.Event.prototype.cancelable = true;

/**
 * Indicates the current event phase:
 * 1. Capture phase: starting from the top parent to the target;
 * 2. at target phase: currently being dispatched from the target;
 * 3. bubbling phase: from the target to the top parent.
 * @const {number}
 */
createjs.Event.prototype.eventPhase = 2;

/**
 * The epoch time at which this event was created.
 * (This event is not exported to games.)
 * @type {number}
 */
createjs.Event.prototype.timeStamp = 0;

/**
 * Whether a handler has called the Event.prototype.preventDefault() method.
 * (This event is not exported to games.)
 * @type {boolean}
 */
createjs.Event.prototype.defaultPrevented = false;

/**
 * Whether a handler has called the Event.prototype.stopPropagation() method or
 * the Event.prototype.stopImmediatePropagation() method. (This event is not
 * exported to games.)
 * @type {boolean}
 */
createjs.Event.prototype.propagationStopped = false;

/**
 * Whether a handler has called the Event.stopImmediatePropagation() method.
 * (This event is not exported to games.)
 * @type {boolean}
 */
createjs.Event.prototype.immediatePropagationStopped = false;

/**
 * Whether a handler has called the Event.prototype.remove() method. (This event
 * is not exported to games.)
 * @type {boolean}
 */
createjs.Event.prototype.removed = false;

/**
 * The current event target, i.e. an object that this event is being dispatched
 * from.
 * @type {createjs.Event.Target}
 * @private
 */
createjs.Event.prototype.currentTarget_ = null;

/**
 * Prevents the default action of this event.
 * @const
 */
createjs.Event.prototype['preventDefault'] = function() {
  this.defaultPrevented = true;
};

/**
 * Stops the event propagation.
 * @const
 */
createjs.Event.prototype['stopPropagation'] = function() {
  this.propagationStopped = true;
};

/**
 * Stops the immediate event propagation.
 * @const
 */
createjs.Event.prototype.stopImmediatePropagation = function() {
  this.immediatePropagationStopped = this.propagationStopped = true;
};
  
/**
 * Resets the properties used by event targets. To reduce the number of new
 * createjs.Event() calls, some event listeners (in this library) use object
 * spools. This method is used by such event dispatchers to clean up an used
 * event.
 * @const
 */
createjs.Event.prototype.resetProperties = function() {
  this['target'] = null;
  this['currentTarget'] = null;
  this.currentTarget_ = null;
};

/**
 * Sets properties used by event targets.
 * @param {createjs.Event.Target} target
 * @param {number} phase
 * @const
 */
createjs.Event.prototype.setProperties = function(target, phase) {
  /// <param type="createjs.Event.Target" name="target"/>
  /// <param type="number" name="phase"/>
  this['target'] = target;
  this['currentTarget'] = target;
  this.currentTarget_ = target;
};

/**
 * Removes the event listener which receives this event after returning from it.
 * @const
 */
createjs.Event.prototype['remove'] = function() {
  this.removed = true;
};
  
/**
 * Adds the specified event listener to the target of this event.
 * @param {string} type
 * @param {Function|Object} listener
 * @return {Function|Object}
 * @const
 */
createjs.Event.prototype['addEventListener'] = function(type, listener) {
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Function" name="callback"/>
  ///   <returns type="Function"/>
  /// <signature>
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Object" name="listener"/>
  ///   <returns type="Object"/>
  /// <signature>
  return this.currentTarget_.on(type, listener);
};

/**
 * Removes the specified event listener from the target of this event.
 * @param {string} type
 * @param {Function|Object} listener
 * @const
 */
createjs.Event.prototype['removeEventListener'] = function(type, listener) {
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Function" name="callback"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Object" name="listener"/>
  /// </signature>
  this.currentTarget_.off(type, listener);
};
