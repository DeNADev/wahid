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
/// <reference path="container.js"/>
/// <reference path="tick_listener.js"/>
/// <reference path="renderer.js"/>
/// <reference path="canvas_renderer.js"/>
/// <reference path="webgl_renderer.js"/>
/// <reference path="user_agent.js"/>
/// <reference path="counter.js"/>
/// <reference path="mouse_event.js"/>
/// <reference path="ticker.js"/>
/// <reference path="graphics.js"/>
/// <reference path="sound.js"/>
/// <reference path="image_factory.js"/>
/// <reference path="config.js"/>

/**
 * A class that represents the root node of an object tree.
 * @param {HTMLCanvasElement|string} canvas
 * @extends {createjs.Container}
 * @implements {EventListener}
 * @implements {createjs.TickListener}
 * @constructor
 */
createjs.Stage = function(canvas) {
  createjs.Container.call(this);

  /**
   * The renderer object that renders CreateJS objects in the output <canvas>
   * element.
   * @type {createjs.Renderer}
   * @private
   */
  this.renderer_ = this.createRenderer_(canvas);

  /**
   * Mapping from a pointer ID to its data.
   * @type {Array.<createjs.Stage.Pointer>}
   * @private
   */
  this.pointers_ = [];

  this.enableDOMEvents(true);
};
createjs.inherits('Stage', createjs.Stage, createjs.Container);

/**
 * The pointer ID representing there are not any active pointers.
 * @const {number}
 */
createjs.Stage.POINTER_NULL = -2;

/**
 * The pointer ID representing a mouse event.
 * @const {number}
 */
createjs.Stage.POINTER_MOUSE = -1;

/**
 * A bit-mask representing pointer events.
 * @enum {number}
 */
createjs.Stage.Event = {
  MOUSE: 0,
  TOUCH: 1,
  POINTER: 2
};

/**
 * The list of events used by this stage.
 * @const {Array.<Array.<string>>}
 * @private
 */
createjs.Stage.EVENTS_ = [
  ['mousedown', 'mousemove', 'mouseup'],
  ['touchstart', 'touchmove', 'touchend'],
  ['pointerstart', 'pointermove', 'pointerend']
];

/**
 * An inner class encapsulating a point where a mouse event fires.
 * @param {number} id
 * @constructor
 */
createjs.Stage.Pointer = function(id) {
  /**
   * The pointer ID provided by the host browser.
   * @const {number}
   * @private
   */
  this.id = id;

  /**
   * The page position of this event.
   * @const {createjs.Point}
   * @private
   */
  this.page_ = new createjs.Point(-1, -1);

  /**
   * The source position of this event when it occurs in the hosting stage.
   * @const {createjs.Point}
   * @private
   */
  this.point_ = new createjs.Point(0, 0);

  /**
   * Whether this event is occurs in the hosting stage.
   * @type {boolean}
   * @private
   */
  this.inBounds_ = false;

  /**
   * The display object under the source position.
   * @type {createjs.DisplayObject}
   * @private
   */
  this.target_ = null;

  /**
   * The source position of this event whether it occurs in the hosting stage
   * or not. This position may be the outside of the stage if a user moves a
   * mouse from its inside to its outside.
   * @const {createjs.Point}
   * @private
   */
  this.raw_ = new createjs.Point(0, 0);
};

/**
 * The current X position of the primary pointer.
 * @type {number}
 */
createjs.Stage.prototype['mouseX'] = 0;

/**
 * The current mouse Y position of the primary pointer.
 * @type {number}
 */
createjs.Stage.prototype['mouseY'] = 0;

/**
 * Whether the primary pointer is currently within the bounds of the canvas.
 * @type {boolean}
 */
createjs.Stage.prototype['mouseInBounds'] = false;

/**
 * The draw event dispatched to listeners.
 * @type {createjs.Event}
 * @private
 */
createjs.Stage.prototype.drawEvent_ = null;

/**
 * The mouse event dispatched to listeners.
 * @type {createjs.MouseEvent}
 * @private
 */
createjs.Stage.prototype.mouseEvent_ = null;

/**
 * The ID of the primary pointer.
 * @type {number}
 * @private
 */
createjs.Stage.prototype.primaryPointer_ = createjs.Stage.POINTER_NULL;

/**
 * A bit-mask of DOM events listened by this object.
 * @type {number}
 * @private
 */
createjs.Stage.prototype.domEvents_ = 0;

/**
 * Whether to prevent touch events.
 * @type {boolean}
 * @private
 */
createjs.Stage.prototype.preventDefault_ = false;

/**
 * Creates a renderer used for rendering objects to the specified canvas.
 * @param {HTMLElement|string} value
 * @return {createjs.Renderer} renderer
 * @private
 */
createjs.Stage.prototype.createRenderer_ = function(value) {
  /// <param name="value"/>
  /// <returns type="createjs.Renderer"/>
  if (!value) {
    return null;
  }
  if (createjs.isString(value)) {
    value = document.getElementById(createjs.getString(value));
  }
  var canvas = createjs.castCanvas(value);
  // Write the version of this library.
  canvas.setAttribute(
      'dena-version',
      createjs.DENA_MAJOR_VERSION + '.' +
      createjs.DENA_MINOR_VERSION + '.' +
      createjs.DENA_BUILD_NUMBER + '.' +
      createjs.DENA_PATCH_LEVEL);
  if (!createjs.WebGLRenderer.id) {
    createjs.WebGLRenderer.id = 1;
    var CONTEXTS = ['webgl', 'experimental-webgl'];
    for (var i = 0; i < CONTEXTS.length; ++i) {
      var context = canvas.getContext(CONTEXTS[i]);
      if (context) {
        createjs.WebGLRenderer.context = CONTEXTS[i];
        return new createjs.WebGLRenderer(canvas, context, null);
      }
    }
  }
  if (createjs.WebGLRenderer.context) {
    var context = canvas.getContext(createjs.WebGLRenderer.context);
    return new createjs.WebGLRenderer(canvas, context, null);
  }
  return new createjs.CanvasRenderer(canvas, null);
};

/**
 * Sends a draw event to the listeners attached to this stage. This stage does
 * not dispatch draw events, which often cause rendering glitches.
 * @param {string} type
 * @private
 */
createjs.Stage.prototype.sendDrawEvent_ = function(type) {
  /// <param type="string" name="type"/>
}

/**
 * Returns a mouse event to be dispatched to CreateJS objects. (This stage uses
 * a static createjs.MouseEvent object to avoid creating a mouse event every
 * time when the stage dispatches it.)
 * @param {Event} event
 * @param {number} id
 * @return {createjs.MouseEvent}
 * @private
 */
createjs.Stage.prototype.getMouseEvent_ = function(event, id) {
  /// <param type="Event" name="event"/>
  /// <param type="number" name="id"/>
  /// <returns type="createjs.MouseEvent"/>
  if (!this.mouseEvent_) {
    this.mouseEvent_ = new createjs.MouseEvent(
        '', false, false, 0, 0, event, id, false, 0, 0);
  } else {
    this.mouseEvent_.reset(event, id);
  }
  return this.mouseEvent_;
}

/**
 * Applies changes to the createjs.Event object to the specified Event object.
 * (The createjs.Event object, which is dispatched to CreateJS objects, is a
 * JavaScript object and its values need to be copied to the Event object to
 * prevent default actions and to stop propagations.
 * @param {Event} event
 * @param {boolean} defaultPrevented
 * @private
 */
createjs.Stage.prototype.applyMouseEvent_ = function(event, defaultPrevented) {
  /// <param type="Event" name="event"/>
  /// <param type="boolean" name="defaultPrevented"/>
  var mouse = this.mouseEvent_;
  if (mouse) {
    defaultPrevented = defaultPrevented || mouse.defaultPrevented
    mouse.defaultPrevented = false;
    if (mouse.propagationStopped) {
      event.stopPropagation();
    }
    mouse.propagationStopped = false;
  }
  if (defaultPrevented) {
    event.preventDefault();
  }
}

/**
 * Returns the createjs.Renderer object associated with this stage.
 * @return {createjs.Renderer}
 * @private
 */
createjs.Stage.prototype.getRenderer_ = function() {
  /// <returns type="createjs.Renderer"/>
  return this.renderer_;
};

/**
 * Returns the HTMLCanvasElement object associated with this object.
 * @return {HTMLCanvasElement}
 * @private
 */
createjs.Stage.prototype.getCanvas_ = function() {
  /// <returns type="HTMLCanvasElement"/>
  return this.getRenderer_().getCanvas();
};

/**
 * Attaches an HTMLCanvasElement object to this object. This method discards all
 * resources attached to the currently-attached createjs.Renderer object and
 * re-create a createjs.Renderer object with the specified <canvas> element.
 * @param {HTMLCanvasElement} canvas
 * @private
 */
createjs.Stage.prototype.setCanvas_ = function(canvas) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  var renderer = this.getRenderer_();
  if (renderer) {
    var current = renderer.getCanvas();
    if (current) {
      this.removeListeners_(current, createjs.Stage.Event.MOUSE);
      this.removeListeners_(current, createjs.Stage.Event.TOUCH);
      this.removeListeners_(current, createjs.Stage.Event.POINTER);
    }
    renderer.destroy();
    this.renderer_ = null;
  }
  this.renderer_ = this.createRenderer_(canvas);
};

/**
 * Retrieves the pointer object, which stores the last position of the specified
 * pointer.
 * @param {number} id
 * @param {boolean=} opt_remove
 * @return {createjs.Stage.Pointer}
 * @private
 */
createjs.Stage.prototype.getPointer_ = function(id, opt_remove) {
  /// <param type="number" name="id"/>
  /// <param type="boolean" optional="true" name="opt_remove"/>
  /// <returns type="createjs.Stage.Pointer"/>
  for (var i = 0; i < this.pointers_.length; ++i) {
    if (this.pointers_[i].id == id) {
      var pointer = this.pointers_[i];
      if (opt_remove && id >= 0) {
        this.pointers_.splice(i, 1);
      }
      return pointer;
    }
  }
  createjs.assert(!opt_remove);
  var pointer = new createjs.Stage.Pointer(id);
  this.pointers_.push(pointer);
  return pointer;
};

/**
 * Updates the pointer position. This method normalizes the event position to
 * fit it in the HTMLCanvasElement object associated with this object. This
 * method may be called with a MouseEvent object, a Touch object, or a
 * PointerEvent object.
 * @param {createjs.Stage.Pointer} pointer
 * @param {number} x
 * @param {number} y
 * @param {createjs.MouseEvent} mouse
 * @private
 */
createjs.Stage.prototype.updatePointer_ = function(pointer, x, y, mouse) {
  /// <param type="createjs.Stage.Pointer" name="pointer"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="createjs.MouseEvent" name="mouse"/>
  // Update the position of this pointer only when it has been moved by at least
  // four pixels to avoid updating it too often. (It is slow to update a pointer
  // position on mobile devices.)
  if (createjs.abs(pointer.page_.x - x) <= 4 &&
      createjs.abs(pointer.page_.y - y) <= 4) {
    return;
  }
  pointer.page_.x = x;
  pointer.page_.y = y;
  var renderer = this.getRenderer_();
  var canvas = renderer.getCanvas();
  var width =  renderer.getWidth();
  var height = renderer.getHeight();
  // Emulate the above adjusted offsetX and offsetY values for browsers that
  // do not provide them, e.g. MouseEvents of Firefox or Touch objects.
  var bounds = canvas.getBoundingClientRect();
  var offsetX = window.pageXOffset - document.body.clientLeft;
  var offsetY = window.pageYOffset - document.body.clientTop;
  var styles = window.getComputedStyle(canvas);
  var left = bounds.left + offsetX +
             createjs.parseInt(styles.paddingLeft) +
             createjs.parseInt(styles.borderLeftWidth);
  var top = bounds.top + offsetY +
            createjs.parseInt(styles.paddingTop) +
            createjs.parseInt(styles.borderTopWidth);
  var right = bounds.right + offsetX -
              createjs.parseInt(styles.paddingRight) -
              createjs.parseInt(styles.borderRightWidth);
  var bottom = bounds.bottom + offsetY -
               createjs.parseInt(styles.paddingBottom) -
               createjs.parseInt(styles.borderBottomWidth);
  x = (x - left) / (right - left) * width;
  y = (y - top) / (bottom - top) * height;
  var inBounds = (0 <= x && x < width) && (0 <= y && y < height);
  if (inBounds) {
    pointer.point_.x = x;
    pointer.point_.y = y;
  }
  pointer.inBounds_ = inBounds;
  pointer.raw_.x = x;
  pointer.raw_.y = y;
  var primary = pointer.id == this.primaryPointer_;
  if (primary) {
    this['mouseX'] = x;
    this['mouseY'] = y;
    this['mouseInBounds'] = inBounds;
  }
  mouse.setStage(pointer.point_.x, pointer.point_.y);
  mouse.setPrimary(primary);
  mouse.setRaw(pointer.raw_.x, pointer.raw_.y);
};

/**
 * Called when this stage receives a pointer-down event, i.e. a mousedown event,
 * a pointerdown event, or a touchdown event.
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {Event} event
 * @private
 */
createjs.Stage.prototype.handlePointerDown_ = function(id, x, y, event) {
  /// <param type="number" name="id"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="Event" name="event"/>
  var mouse = this.getMouseEvent_(event, id);
  // Dispatch a 'stagemousedown' event to this stage and a 'mousedown' event
  // to a display object under the given point.
  var pointer = this.getPointer_(id);
  this.updatePointer_(pointer, x, y, mouse);
  mouse.type = 'stagemousedown';
  mouse.bubbles = false;
  if (pointer.inBounds_ && this.hasListener(mouse.type)) {
    this.dispatchRawEvent(mouse);
  }
  var TYPES =
      createjs.EventDispatcher.CLICK | createjs.EventDispatcher.MOUSE_DOWN;
  var target = this.hitTestObject(pointer.point_, TYPES, 0);
  if (target) {
    mouse.type = 'mousedown';
    mouse.bubbles = true;
    target.dispatchRawEvent(mouse);
  }
  if (!mouse.defaultPrevented) {
    pointer.target_ = target;
  }
};

/**
 * Called when this stage receives a pointer-move event, i.e. a mousemove event,
 * a pointermove event, or a touchmove event.
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {Event} event
 * @private
 */
createjs.Stage.prototype.handlePointerMove_ = function(id, x, y, event) {
  /// <param type="number" name="id"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="Event" name="event"/>
  var mouse = this.getMouseEvent_(event, id);
  // Compare the 'inBound' state before updating pointer events with the one
  // after updating them to send mouse events as listed below.
  //    +--------+-------+-------------------------------------------+
  //    | before | after | events                                    |
  //    +--------+-------+-------------------------------------------+
  //    | false  | false | none                                      |
  //    | false  | true  | mouseenter, stagemousemove, and pressmove |
  //    | true   | false | mouseleave, stagemousemove, and pressmove |
  //    | true   | true  | stagemousemove and pressmove              |
  //    +--------+-------+-------------------------------------------+
  var pointer = this.getPointer_(id);
  var inBounds = pointer.inBounds_;
  this.updatePointer_(pointer, x, y, mouse);
  if (inBounds || pointer.inBounds_) {
    if (id == createjs.Stage.POINTER_MOUSE && pointer.inBounds_ == !inBounds) {
      mouse.type = inBounds ? 'mouseleave' : 'mouseenter';
      mouse.bubbles = false;
      if (this.hasListener(mouse.type)) {
        this.dispatchRawEvent(mouse);
      }
    }
    mouse.type = 'stagemousemove';
    mouse.bubbles = false;
    if (this.hasListener(mouse.type)) {
      this.dispatchRawEvent(mouse);
    }
    if (pointer.target_) {
      mouse.type = 'pressmove';
      mouse.bubbles = true;
      pointer.target_.dispatchRawEvent(mouse);
    }
  }
};

/**
 * Called when this stage receives a pointer-up event, i.e. a mouseup event, a
 * pointerend event, or a touchend event.
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {Event} event
 * @private
 */
createjs.Stage.prototype.handlePointerUp_ = function(id, x, y, event) {
  /// <param type="number" name="id"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="Event" name="event"/>
  var mouse = this.getMouseEvent_(event, id);
  var pointer = this.getPointer_(id, true);
  mouse.type = 'stagemouseup';
  mouse.bubbles = false;
  if (this.hasListener(mouse.type)) {
    this.dispatchRawEvent(mouse);
  }
  if (pointer.target_) {
    // Compare the saved target (i.e. the target for a 'mousedown' event with
    // the one under the given position. Dispatch a 'click' event if they are
    // the same object.
    var TYPES =
        createjs.EventDispatcher.CLICK | createjs.EventDispatcher.PRESS_UP;
    var target = this.hitTestObject(pointer.point_, TYPES, 0);
    if (target == pointer.target_) {
      mouse.type = 'click';
      mouse.bubbles = true;
      target.dispatchRawEvent(mouse);
    }
    mouse.type = 'pressup';
    mouse.bubbles = true;
    pointer.target_.dispatchRawEvent(mouse);
    mouse.type = 'mouseup';
    pointer.target_.dispatchRawEvent(mouse);
    pointer.target_ = null;
  }
};

/**
 * Called when this stage receives a pointer-move event, i.e. a mouseenter event
 * or a pointerenter event.
 * @param {string} type
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {Event} event
 * @private
 */
createjs.Stage.prototype.handlePointerEnter_ = function(type, id, x, y, event) {
  /// <param type="string" name="type"/>
  /// <param type="number" name="id"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="Event" name="event"/>
  var mouse = this.getMouseEvent_(event, id);
  var pointer = this.getPointer_(id);
  this.updatePointer_(pointer, x, y, mouse);
  if (this.hasListener(type)) {
    mouse.type = type;
    mouse.bubbles = true;
    this.dispatchRawEvent(mouse);
  }
  pointer.target_ = null;
};

/**
 * Called when this stage receives a pointer-move event, i.e. a mouseleave event
 * or a pointerleave event.
 * @param {string} type
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {Event} event
 * @private
 */
createjs.Stage.prototype.handlePointerLeave_ = function(type, id, x, y, event) {
  /// <param type="string" name="type"/>
  /// <param type="number" name="id"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="Event" name="event"/>
  var mouse = this.getMouseEvent_(event, id);
  var pointer = this.getPointer_(id);
  this.updatePointer_(pointer, x, y, mouse);
  if (this.hasListener(type)) {
    mouse.type = type;
    mouse.bubbles = true;
    this.dispatchRawEvent(mouse);
  }
  pointer.target_ = null;
};

/**
 * Called when this stage needs to send a mouseover event.
 * @param {boolean} clear
 * @param {createjs.Stage} owner
 * @param {createjs.Stage} eventTarget
 * @private
 */
createjs.Stage.prototype.testMouseOver_ = function(clear, owner, eventTarget) {
  /// <param type="boolean" name="clear"/>
  /// <param type="createjs.Stage" name="owner"/>
  /// <param type="createjs.Stage" name="eventTarget"/>
  createjs.notImplemented();
};

/**
 * Attaches this object to the specified set of events.
 * @param {EventTarget} canvas
 * @param {number} id
 * @private
 */
createjs.Stage.prototype.addListeners_ = function(canvas, id) {
  /// <param type="EventTarget" name="canvas"/>
  /// <param type="number" name="id"/>
  var mask = 1 << id;
  if (!(this.domEvents_ & mask)) {
    this.domEvents_ |= mask;
    var events = createjs.Stage.EVENTS_[id];
    for (var j = 0; j < events.length; ++j) {
      canvas.addEventListener(events[j], this, false);
    }
  }
};

/**
 * Removes this object from the specified set of events.
 * @param {EventTarget} canvas
 * @param {number} id
 * @private
 */
createjs.Stage.prototype.removeListeners_ = function(canvas, id) {
  /// <param type="EventTarget" name="canvas"/>
  /// <param type="number" name="id"/>
  var mask = 1 << id;
  this.domEvents_ &= ~mask;
  var events = createjs.Stage.EVENTS_[id];
  for (var j = 0; j < events.length; ++j) {
    canvas.removeEventListener(events[j], this, false);
  }
};

/**
 * Updates this stage. This method is usually used by applications to draw all
 * display objects without running tweens.
 * @const
 */
createjs.Stage.prototype.update = function() {
  if (this.renderer_ && this.renderer_.getCanvas()) {
    this.handleTick(createjs.Ticker.getRunTime());
  }
};

/**
 * Clears the target canvas.
 * @const
 */
createjs.Stage.prototype.clear = function() {
};

/**
 * Returns a data URL that contains a Base64-encoded image of the contents of
 * the stage. The returned data URL can be specified as the src value of an
 * image element.
 * @param {string} backgroundColor
 * @param {string} mimeType
 * @return {string}
 * @const
 */
createjs.Stage.prototype.toDataURL = function(backgroundColor, mimeType) {
  /// <param type="string" name="backgroundColor"/>
  /// <param type="string" name="mimeType"/>
  /// <returns type="string"/>
  createjs.notImplemented();
  return '';
};

/**
 * Enables or disables (by passing a frequency of 0) dispatching mouse-over
 * events.
 * @param {number=} opt_frequency
 * @const
 */
createjs.Stage.prototype.enableMouseOver = function(opt_frequency) {
  /// <param type="number" optional="true" name="opt_frequency"/>
  createjs.notImplemented();
};

/**
 * Starts or stops listening mouse events.
 * @param {boolean} enable
 * @const
 */
createjs.Stage.prototype.enableDOMEvents = function(enable) {
  /// <param type="boolean" name="enable"/>
  if (!this.renderer_) {
    return;
  }
  var canvas = this.getCanvas_();
  if (canvas) {
    if (!enable) {
      this.removeListeners_(canvas, createjs.Stage.Event.MOUSE);
    } else {
      this.addListeners_(canvas, createjs.Stage.Event.MOUSE);
      window.addEventListener('hashchange', this, false);
      window.addEventListener('unload', this, false);
    }
  }
};

/**
 * Starts or stops listening touch events.
 * @param {boolean} enable
 * @param {boolean} preventDefault
 * @const
 */
createjs.Stage.prototype.enableTouchEvents = function(enable, preventDefault) {
  if (!this.renderer_) {
    return;
  }
  var canvas = this.getCanvas_();
  if (!enable) {
    this.removeListeners_(canvas, createjs.Stage.Event.TOUCH);
    this.removeListeners_(canvas, createjs.Stage.Event.POINTER);
  } else {
    this.preventDefault_ = preventDefault;
    if (createjs.UserAgent.isMSIE()) {
      this.addListeners_(canvas, createjs.Stage.Event.POINTER);
    } else {
      this.addListeners_(canvas, createjs.Stage.Event.TOUCH);
    }
  }
};

/** @override */
createjs.Stage.prototype.isStage = true;

/** @override */
createjs.Stage.prototype.removeAllChildren = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  // Remove not only all children of this stage but also the global resources
  // used by them to avoid resource leaks.
  createjs.Stage.superClass_.removeAllChildren.call(this);
  createjs.Graphics.reset();
  createjs.Ticker.reset(opt_destroy);
  if (createjs.DEBUG) {
    createjs.Counter.reset();
  }
  var images = createjs.ImageFactory.reset(opt_destroy);
  var renderer = this.getRenderer_();
  if (renderer) {
    if (images) {
      var destroy = opt_destroy && createjs.UserAgent.isIPhone();
      for (var key in images) {
        var image = images[key];
        if (image) {
          renderer.uncache(image);
          if (destroy) {
            // Attach a 1x1 GIF image to this <img> element to discard the
            // previous one.
            image.src =
                'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
          }
        }
      }
    }
    renderer.destroy();
  }
};

/** @override */
createjs.Stage.prototype.handleTick = function(time) {
  /// <param type="number" name="time"/>
  if (!this.renderer_) {
    return;
  }
  createjs.assert(!!this.getCanvas_());

  // Renders display objects to an HTMLCanvasElement with the createjs.Renderer
  // interface.
  if (createjs.DEBUG) {
    createjs.Counter.paintedObjects = 0;
    createjs.Counter.visibleObjects = 0;
    createjs.Counter.totalObjects = 0;
    createjs.Counter.updatedTweens = 0;
    createjs.Counter.runningTweens = 0;
  }
  this.sendDrawEvent_('drawstart');
  this.updateTweens(time);
  this.renderer_.begin();
  this.layout(this.renderer_, this, this.getDirty(), time, 1);
  this.renderer_.paint(time);
  this.sendDrawEvent_('drawend');
};

/** @override */
createjs.Stage.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  var TOUCH_MASK = 1 << createjs.Stage.Event.TOUCH;
  var POINTER_MASK = 1 << createjs.Stage.Event.POINTER;
  var MOUSE_MASK = 1 << createjs.Stage.Event.MOUSE;
  // Process touch events first for phones, which do not have so much processing
  // power as PCs.
  var type = event.type;
  var processed = false;
  if (this.domEvents_ & TOUCH_MASK) {
    if (type == 'touchstart') {
      processed = true;
      var touches = event.changedTouches; // event.touches;
      if (this.primaryPointer_ == createjs.Stage.POINTER_NULL) {
        this.primaryPointer_ = touches[0].identifier || 0;
      }
      for (var i = 0; i < touches.length; ++i) {
        var touch = touches[i];
        var id = touch.identifier || i;
        this.handlePointerDown_(id, touch.pageX, touch.pageY, event);
      }
    } else if (type == 'touchmove') {
      processed = true;
      var touches = event.changedTouches; // event.touches;
      for (var i = 0; i < touches.length; ++i) {
        var touch = touches[i];
        var id = touches[i].identifier || i;
        this.handlePointerMove_(id, touch.pageX, touch.pageY, event);
      }
    } else if (type == 'touchend') {
      processed = true;
      var touches = event.changedTouches; // event.touches;
      for (var i = 0; i < touches.length; ++i) {
        var touch = touches[i];
        var id = touch.identifier || i;
        this.handlePointerUp_(id, touch.pageX, touch.pageY, event);
        if (this.primaryPointer_ == id) {
          this.primaryPointer_ = createjs.Stage.POINTER_NULL;
        }
      }
    }
  } else if (this.domEvents_ & POINTER_MASK) {
    var pageX = event.pageX;
    var pageY = event.pageY;
    if (type == 'pointerdown') {
      processed = true;
      if (event.isPrimary) {
        this.primaryPointer_ = event.pointerId;
      }
      this.handlePointerDown_(event.pointerId, pageX, pageY, event);
    } else if (type == 'pointermove') {
      processed = true;
      this.handlePointerMove_(event.pointerId, pageX, pageY, event);
    } else if (type == 'pointerup') {
      this.handlePointerUp_(event.pointerId, pageX, pageY, event);
      processed = true;
    }
  }
  // Prevent a browser from sending mouse events when this object has processed
  // touch events or pointer events.
  if (processed) {
    this.applyMouseEvent_(event, this.preventDefault_);
    // Kick the global ticker and try updating this stage for Android Chrome,
    // which dispatches touch events too often and it does not call the
    // setInterval() callback of the ticker while it sends touch events.
    createjs.Ticker.kick();
    return;
  }
  // Remove all children of this stage and the global resources used by the
  // children when this stage is being unloaded. (A hashchange event is not
  // actually an unload event and some browsers do not automatically delete
  // resources used by the current page, i.e. they may leak objects used by this
  // stage and its children.)
  if (type == 'hashchange' || type == 'unload') {
    window.removeEventListener(type, this, false);
    this.removeAllChildren(true);
    var unload = type == 'unload' ? 1 : 0;
    createjs.Sound.reset(unload);
    return;
  }
  // Finally, process mouse events.
  var pageX = event.pageX;
  var pageY = event.pageY;
  if (this.domEvents_ & MOUSE_MASK) {
    if (type == 'mousedown') {
      this.primaryPointer_ = createjs.Stage.POINTER_MOUSE;
      this.handlePointerDown_(
          createjs.Stage.POINTER_MOUSE, pageX, pageY, event);
    } else if (type == 'mousemove') {
      this.handlePointerMove_(
          createjs.Stage.POINTER_MOUSE, pageX, pageY, event);
    } else if (type == 'mouseup') {
      this.handlePointerUp_(createjs.Stage.POINTER_MOUSE, pageX, pageY, event);
    }
    this.applyMouseEvent_(event, false);
  }
};

// Adds getters and setters for applications to access internal variables.
Object.defineProperties(createjs.Stage.prototype, {
  'canvas': {
    get: createjs.Stage.prototype.getCanvas_,
    set: createjs.Stage.prototype.setCanvas_
  }
});

// Export the createjs.Stage object to the global namespace.
createjs.exportObject('createjs.Stage', createjs.Stage, {
  // createjs.Stage methods
  'update': createjs.Stage.prototype.update,
  'clear': createjs.notReached,
  'toDataURL': createjs.notImplemented,
  'enableMouseOver': createjs.notImplemented,
  'enableDOMEvents': createjs.Stage.prototype.enableDOMEvents,
  'handleEvent': createjs.Stage.prototype.handleEvent
});
