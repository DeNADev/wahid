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
/// <reference path="object.js"/>

/**
 * A class that can receive events and dispatch events. This class can dispatch
 * CreateJS events only to their target CreateJS objects. (This class cannot
 * dispatch capture events.)
 * @extends {createjs.Object}
 * @implements {createjs.Event.Target}
 * @constructor
 */
createjs.EventDispatcher = function() {
  createjs.Object.call(this);
};
createjs.inherits('EventDispatcher', createjs.EventDispatcher, createjs.Object);

/**
 * Representing this dispatcher is in the capture phase.
 * @const {number}
 */
createjs.EventDispatcher.CAPTURE_PHASE = 1;

/**
 * Representing this dispatcher is in the target phase.
 * @const {number}
 */
createjs.EventDispatcher.AT_TARGET = 2;

/**
 * Representing this dispatcher is in the bubbling phase.
 * @const {number}
 */
createjs.EventDispatcher.BUBBLING_PHASE = 3;

/**
 * The event ID of the 'click' event.
 * @const {number}
 */
createjs.EventDispatcher.CLICK = 1 << 0;

/**
 * The event ID of the 'mousedown' event.
 * @const {number}
 */
createjs.EventDispatcher.MOUSE_DOWN = 1 << 1;

/**
 * The event ID of the 'pressmove' event.
 * @const {number}
 */
createjs.EventDispatcher.PRESS_MOVE = 1 << 2;

/**
 * The event ID of the 'pressup' event.
 * @const {number}
 */
createjs.EventDispatcher.PRESS_UP = 1 << 3;

/**
 * Returns the event ID.
 * @param {string} type
 * @return {number}
 * @private
 */
createjs.EventDispatcher.getEventId_ = function(type) {
  /// <param type="string" name="type"/>
  /// <returns type="number"/>
  var EVENTS = {
    'click': createjs.EventDispatcher.CLICK,
    'mousedown': createjs.EventDispatcher.MOUSE_DOWN,
    'pressmove': createjs.EventDispatcher.PRESS_MOVE,
    'pressup': createjs.EventDispatcher.PRESS_UP
  };
  return EVENTS[type] || 0;
};

/**
 * Adds EventDispatcher methods into a target object.
 * @param {Object} target
 * @const
 */
createjs.EventDispatcher.initialize = function(target) {
  /// <param type="Object" name="target"/>
  var prototype = createjs.EventDispatcher.prototype;
  for (var key in prototype) {
    if (!target[key]) {
      target[key] = prototype[key];
    }
  }
};

/**
 * An inner class that represents the context of an event listener. This class
 * is used by the createjs.EventDispatcher class to execute an event listener.
 * event listener.
 * @param {Function|Object} listener
 * @param {Object} scope
 * @param {boolean} once
 * @param {*} data
 * @constructor
 */
createjs.EventDispatcher.Context = function(listener, scope, once, data) {
  /// <signature>
  ///   <param type="Function" name="callback"/>
  ///   <param type="Object" name="scope"/>
  ///   <param type="boolean" name="once"/>
  ///   <param name="data"/>
  /// </signature>
  /// <signature>
  ///   <param type="Object" name="listener"/>
  ///   <param type="Object" name="scope"/>
  ///   <param type="boolean" name="once"/>
  ///   <param name="data"/>
  /// </signature>
  /**
   * The function to be executed when an event dispatcher dispatches an event to
   * this object.
   * @type {Function}
   * @private
   */
  this.handleEvent_ = listener['handleEvent'] || listener;

  /**
   * The context used in executing this event handler.
   * @type {Object}
   * @private
   */
  this.scope_ = listener['handleEvent'] ? listener : scope;

  /**
   * Whether this object should be removed after dispatching an event to it.
   * @type {boolean}
   * @private
   */
  this.once_ = once;

  /**
   * Application-specific data provided in adding an event listener.
   * @type {*}
   * @private
   */
  this.data_ = data;
};

/**
 * Returns whether this listener is equal to the specified listener.
 * @param {Function|Object} listener
 * @return {boolean}
 */
createjs.EventDispatcher.Context.prototype.isEqual = function(listener) {
  /// <signature>
  ///   <param type="Function" name="callback"/>
  ///   <returns type="boolean"/>
  /// </signature>
  /// <signature>
  ///   <param type="Object" name="listener"/>
  ///   <returns type="boolean"/>
  /// </signature>
  if (listener['handleEvent']) {
    return this.scope_ === listener;
  }
  return this.handleEvent_ === listener;
};

/**
 * Dispatches an event to this listener.
 * @param {createjs.Event} event
 * @return {boolean}
 */
createjs.EventDispatcher.Context.prototype.dispatch = function(event) {
  /// <param type="createjs.Event" name="event"/>
  /// <returns type="boolean"/>
  this.handleEvent_.call(this.scope_, event, this.data_);
  return event.removed || this.once_;
};

/**
 * The inner class that encapsulates an array of event listener and their
 * contexts. This class allows applications to add listeners to the list or to
 * remove ones from it while they are iterating it.
 * @param {createjs.EventDispatcher.Context} context
 * @constructor
 */
createjs.EventDispatcher.ContextList = function(context) {
  /// <param type="createjs.EventDispatcher.Context" name="context"/>
  /**
   * The list of event contexts.
   * @type {Array.<createjs.EventDispatcher.Context>}
   * @private
   */
  this.contexts_ = [context];

  /**
   * The clone of the context list. This clone is used for adding contexts (and
   * for removing them) when the context list is locked.
   * @type {Array.<createjs.EventDispatcher.Context>}
   * @private
   */
  this.clone_ = null;

  /**
   * Whether this list is locked.
   * @type {boolean}
   * @private
   */
  this.locked_ = false;
};

/**
 * Retrieves the editable contexts of this list.
 * @return {Array.<createjs.EventDispatcher.Context>}
 * @private
 * @const
 */
createjs.EventDispatcher.ContextList.prototype.getContexts_ = function() {
  /// <returns type="Array" elementType="createjs.EventDispatcher.Context"/>
  if (!this.locked_) {
    return this.contexts_;
  }
  if (!this.clone_) {
    this.clone_ = this.contexts_.slice();
  }
  return this.clone_;
};

/**
 * Returns the number of contexts in this list.
 * @return {number}
 * @private
 * @const
 */
createjs.EventDispatcher.ContextList.prototype.getLength_ = function() {
  return this.contexts_.length;
};

/**
 * Locks this list for iteration. This method changes the state of this list to
 * 'locked' to apply succeeding add operations and remove ones to its clone.
 * @return {Array.<createjs.EventDispatcher.Context>}
 * @private
 * @const
 */
createjs.EventDispatcher.ContextList.prototype.lock_ = function() {
  /// <returns type="Array" elementType="createjs.EventDispatcher.Context"/>
  this.locked_ = true;
  return this.contexts_;
};

/**
 * Unlocks this list. This method changes the stage of this list to 'unlocked'
 * and copies its clone if an application edits the list while it is locked.
 * @const
 */
createjs.EventDispatcher.ContextList.prototype.unlock_ = function() {
  this.locked_ = false;
  if (this.clone_) {
    this.contexts_ = this.clone_;
    this.clone_ = null;
  }
};

/**
 * Returns the clone of this list.
 * @return {Array.<createjs.EventDispatcher.Context>}
 * @private
 * @const
 */
createjs.EventDispatcher.ContextList.prototype.getClone_ = function() {
  /// <returns type="Array" elementType="createjs.EventDispatcher.Context"/>
  if (!this.clone_) {
    this.clone_ = this.contexts_.slice();
  }
  return this.clone_;
};

/**
 * The parent object.
 * @type {createjs.EventDispatcher}
 * @protected
 */
createjs.EventDispatcher.prototype['parent'] = null;

/**
 * Event listeners for bubbling events and at-target ones.
 * @type {Object.<string,createjs.EventDispatcher.ContextList>}
 * @private
 */
createjs.EventDispatcher.prototype.listeners_ = null;

/**
 * A bit-mask representing event types that have event listeners attached to
 * this object.
 * @type {number}
 * @private
 */
createjs.EventDispatcher.prototype.eventTypes_ = 0;

/**
 * Whether this object is dispatching events.
 * @type {boolean}
 * @private
 */
createjs.EventDispatcher.prototype.dispatching_ = false;

/**
 * Events to be sent after this object finishes dispatching an event.
 * @type {Array.<createjs.Event>}
 * @private
 */
createjs.EventDispatcher.prototype.events_ = null;

/**
 * Dispatches a createjs.Event object to listeners attached to this object.
 * @param {createjs.Event} event
 * @param {number} phase
 * @private
 * @const
 */
createjs.EventDispatcher.prototype.dispatchEvent_ = function(event, phase) {
  /// <param type="createjs.Event" name="event"/>
  /// <param type="number" name="phase"/>
  /// <var type="createjs.EventDispatcher.ObjectList" name="list"/>
  if (!this.listeners_) {
    return;
  }
  var list = this.listeners_[event.type];
  if (!list || !list.getLength_()) {
    return;
  }
  event.setProperties(this, phase);

  // When an event listener attached to this object dispatches another event to
  // this object, save the given event to an array to send it when this object
  // finishes dispatching the event.
  if (this.dispatching_) {
    this.events_ = this.events_ || [];
    this.events_.push(event);
    return;
  }

  // Lock the context array and dispatch this event. Event handlers may add or
  // remove event listeners while this object calls them and it causes some
  // consistency problems, e.g. reading the object of an non-existent index. To
  // avoid such consistency problems, this loop locks the context list so event
  // dispatchers can change its clone, not the original array. Cloning an array
  // is not so fast on old devices and it is better to clone an array only when
  // an event listener adds a listener or removes one.
  this.dispatching_ = true;
  var contexts = list.lock_();
  var length = contexts.length;
  for (var i = 0; i < length && !event.immediatePropagationStopped; ++i) {
    event.removed = false;
    var context = contexts[i];
    var remove = context.dispatch(event);
    if (remove) {
      var clone = list.getClone_();
      for (var j = clone.length - 1; j >= 0; --j) {
        if (clone[j] === context) {
          clone.splice(j, 1);
          break;
        }
      }
    }
  }
  list.unlock_();
  this.dispatching_ = false;

  // Dispatch the events having queued to this object. Event listeners for these
  // defer-sending events may dispatch more events and this code should keep
  // dispatching defer-sending events until there are not any more events.
  while (this.events_) {
    var events = this.events_;
    this.events_ = null;
    for (var i = 0; i < events.length; ++i) {
      this.dispatchEvent_(events[i], events[i].eventPhase);
    }
  }
};

/**
 * Dispatches a createjs.Event object to listeners attached to this object and
 * listeners attached to its ancestors. NOTE: this method does not implement the
 * capture phase, dispatching an event from the stage to this target. Games do
 * not use capture events so often that this method removes its implementation.
 * (For games consisting of thousands of CreateJS objects, it takes long time to
 * dispatch an event from the stage object to this target on Android browsers.)
 * @param {createjs.Event} event
 * @return {boolean}
 * @protected
 * @const
 */
createjs.EventDispatcher.prototype.dispatchRawEvent = function(event) {
  /// <param type="createjs.Event" name="event"/>
  /// <returns type="boolean"/>
  // Dispatch this event to the target.
  this.dispatchEvent_(event, createjs.EventDispatcher.AT_TARGET);

  // Dispatch this event to the ancestors of this target.
  if (event.bubbles && this['parent']) {
    for (var node = this['parent']; node && !event.propagationStopped;
         node = node['parent']) {
      node.dispatchEvent_(event, createjs.EventDispatcher.BUBBLING_PHASE);
    }
  }
  event.resetProperties();
  return event.defaultPrevented;
};

/**
 * Dispatches a notification event, which consists only of a type name.
 * @param {string} type
 * @return {boolean}
 * @protected
 * @const
 */
createjs.EventDispatcher.prototype.dispatchNotification = function(type) {
  /// <param type="string" name="type"/>
  /// <returns type="boolean"/>
  // Dispatch this notification event only if this target has listeners for the
  // event. (A notification event is an at-target event.)
  var listeners = this.listeners_;
  if (!listeners || !listeners[type]) {
    return false;
  }
  return this.dispatchRawEvent(new createjs.Event(type, false, false));
};

/**
 * Returns event types that have event listeners.
 * @return {number}
 * @protected
 * @const
 */
createjs.EventDispatcher.prototype.getEventTypes = function() {
  /// <returns type="number"/>
  return this.eventTypes_;
};

/**
 * Adds the specified event listener. Note that adding multiple listeners to the
 * same function will result in multiple callbacks getting fired.
 *
 * Example
 *   function handleClick(event) {
 *      // Click happened.
 *   }
 *   displayObject.addEventListener("click", handleClick);
 *
 * @param {string} type
 * @param {Function|Object} listener
 * @param {boolean=} opt_useCapture
 * @return {Function|Object}
 * @const
 */
createjs.EventDispatcher.prototype.addListener =
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
  return this.on(type, listener, createjs.global, false, null, opt_useCapture);
};
  
/** @override */
createjs.EventDispatcher.prototype.on =
    function(type, listener, opt_scope, opt_once, opt_data, opt_useCapture) {
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Function" name="callback"/>
  ///   <param type="Object" optional="true" name="opt_scope"/>
  ///   <param type="boolean" optional="true" name="opt_once"/>
  ///   <param optional="true" name="opt_data"/>
  ///   <param type="boolean" optional="true" name="opt_useCapture"/>
  ///   <returns type="Function"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Object" name="listener"/>
  ///   <param type="Object" optional="true" name="opt_scope"/>
  ///   <param type="boolean" optional="true" name="opt_once"/>
  ///   <param optional="true" name="opt_data"/>
  ///   <param type="boolean" optional="true" name="opt_useCapture"/>
  ///   <returns type="Object"/>
  /// </signature>
  if (listener && !opt_useCapture) {
    var scope = opt_scope || this;
    var once = opt_once || false;
    var data = opt_data || null;
    var context =
        new createjs.EventDispatcher.Context(listener, scope, once, data);
    if (!this.listeners_) {
      this.listeners_ = {};
    }
    var list = this.listeners_[type];
    if (!list) {
      this.listeners_[type] = new createjs.EventDispatcher.ContextList(context);
    } else {
      var contexts = list.getContexts_();
      contexts.push(context);
    }
    // Update the bit-mask of event types to avoid hit-testing with display
    // objects that do not have event listeners.
    this.eventTypes_ |= createjs.EventDispatcher.getEventId_(type);
  }
  return listener;
};

/** @override */
createjs.EventDispatcher.prototype.off =
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
  if (listener && !opt_useCapture && this.listeners_) {
    var list = this.listeners_[type];
    if (list) {
      // Remove this listener from the context list.
      var contexts = list.getContexts_();
      for (var i = contexts.length - 1; i >= 0; --i) {
        var context = contexts[i];
        if (context.isEqual(listener)) {
          contexts.splice(i, 1);
          break;
        }
      }
      // Remove the specified event from the bit-mask when this object does
      // not have listeners to stop hit-testing this object any longer.
      if (!contexts.length) {
        var mask = createjs.EventDispatcher.getEventId_(type);
        if (mask) {
          this.eventTypes_ &= ~mask;
        }
      }
    }
  }
};
  
/**
 * Removes all listeners for the specified type, or all listeners of all types.
 *
 * Example
 *   // Remove all listeners
 *   displayObject.removeAllEventListeners();
 *   // Remove all click listeners
 *   displayObject.removeAllEventListeners("click");
 *
 * @param {string=} opt_type
 * @const
 */
createjs.EventDispatcher.prototype.removeAllListeners = function(opt_type) {
  /// <param type="string" optional="true" name="opt_type"/>
  if (!opt_type) {
    this.listeners_ = null;
  } else {
    if (this.listeners_ && this.listeners_[opt_type]) {
      this.listeners_[opt_type] = null;
    }
  }
};

/**
 * Dispatches the specified event to all listeners.
 *
 * Example
 *      // Use a string event
 *      this.dispatchEvent("complete");
 *      // Use an Event instance
 *      var event = new createjs.Event("progress");
 *      this.dispatchEvent(event);
 *
 * @param {Object|string|Event} value
 * @param {Object=} opt_target
 * @return {boolean}
 * @const
 */
createjs.EventDispatcher.prototype.dispatch = function(value, opt_target) {
  /// <signature>
  ///   <param type="Object" name="object"/>
  ///   <param type="Object" optional="true" name="opt_target"/>
  ///   <returns type="boolean"/>
  /// </signature>
  /// <signature>
  ///   <param type="string" name="type"/>
  ///   <param type="Object" optional="true" name="opt_target"/>
  ///   <returns type="boolean"/>
  /// </signature>
  /// <signature>
  ///   <param type="Event" name="event"/>
  ///   <param type="Object" optional="true" name="opt_target"/>
  ///   <returns type="boolean"/>
  /// </signature>
  if (createjs.isString(value)) {
    return this.dispatchNotification(createjs.castString(value));
  }
  var event = new createjs.Event(value['type'], false, false);
  return this.dispatchRawEvent(event);
};

/**
 * Indicates whether there are listeners for the specified event type.
 * @param {string} type
 * @return {boolean}
 * @const
 */
createjs.EventDispatcher.prototype.hasListener = function(type) {
  /// <param type="string" name="type"/>
  /// <returns type="boolean"/>
  if (this.listeners_) {
    var list = this.listeners_[type];
    if (list && list.getLength_()) {
      return true;
    }
  }
  return false;
};
  
/**
 * Indicates whether there are listeners for the specified event type on this
 * object or its ancestors. A return value of true indicates that if a bubbling
 * event of the specified type is dispatched from this object, it will trigger
 * at least one listener. This is similar to the
 * EventDispatcher.hasListener() method but it searches the entire event
 * flow for a listener, not just this object.
 * @param {string} type
 * @return {boolean}
 * @const
 */
createjs.EventDispatcher.prototype.willTrigger = function(type) {
  /// <param type="string" name="type"/>
  /// <returns type="boolean"/>
  var o = this;
  while (o) {
    if (o.hasListener(type)) {
      return true;
    }
    o = o['parent'];
  }
  return false;
};

/**
 * Returns whether the specified object is either this container or its
 * descendant.
 * @param {createjs.EventDispatcher} child
 * @return {boolean}
 * @const
 */
createjs.EventDispatcher.prototype.contains = function(child) {
  /// <param type="createjs.EventDispatcher" name="child"/>
  /// <returns type="boolean"/>
  while (child) {
    if (child === this) {
      return true;
    }
    child = child['parent'];
  }
  return false;
};

// Export the createjs.EventDispatcher object to the global namespace.
createjs.exportObject('createjs.EventDispatcher', createjs.EventDispatcher, {
  // createjs.EventDispatcher methods
  'addEventListener': createjs.EventDispatcher.prototype.addListener,
  'on': createjs.EventDispatcher.prototype.on,
  'removeEventListener': createjs.EventDispatcher.prototype.off,
  'off': createjs.EventDispatcher.prototype.off,
  'removeAllEventListeners':
      createjs.EventDispatcher.prototype.removeAllListeners,
  'dispatchEvent': createjs.EventDispatcher.prototype.dispatch,
  'hasEventListener': createjs.EventDispatcher.prototype.hasListener,
  'willTrigger': createjs.EventDispatcher.prototype.willTrigger,
  'contains': createjs.EventDispatcher.prototype.contains
}, {
  'initialize': createjs.EventDispatcher.initialize
});
