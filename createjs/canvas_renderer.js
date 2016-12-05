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
/// <reference path="counter.js"/>
/// <reference path="event.js"/>
/// <reference path="object.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="renderer.js"/>
/// <reference path="shadow.js"/>
/// <reference path="ticker.js"/>
/// <reference path="user_agent.js"/>

/**
 * A class that implements the createjs.Renderer interface with Canvas 2D.
 * @param {HTMLCanvasElement} canvas
 * @param {createjs.BoundingBox} scissor
 * @extends {createjs.Renderer}
 * @implements {EventListener}
 * @constructor
 */
createjs.CanvasRenderer = function(canvas, scissor) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <param type="createjs.BoundingBox" name="scissor"/>
  createjs.Renderer.call(this, canvas, canvas.width, canvas.height);

  /**
   * The 2D rendering context attached to the output <canvas> element.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  this.context_ = createjs.getRenderingContext2D(canvas);

  // Write the context used by this renderer.
  canvas.setAttribute('dena-context', '2d');

  // Listen keyup events to enable debugging features or disable them.
  if (createjs.DEBUG) {
    document.addEventListener('keyup', this, false);
  }

  // Create the clip specified by an application. (This renderer does NOT delete
  // this clip.)
  if (scissor) {
    this.context_.beginPath();
    this.context_.rect(scissor.getLeft(), scissor.getTop(),
                       scissor.getWidth(), scissor.getHeight());
    this.context_.clip();
  }
};
createjs.inherits('CanvasRenderer', createjs.CanvasRenderer, createjs.Renderer);

/**
 * The 2D rendering context attached to the output <canvas> element.
 * @type {CanvasRenderingContext2D}
 * @private
 */
createjs.CanvasRenderer.prototype.context_ = null;

/**
 * The current alpha value of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.CanvasRenderer.prototype.alpha_ = 1;

/**
 * The current composition value of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.CanvasRenderer.prototype.compositeOperation_ =
    createjs.Renderer.Composition.SOURCE_OVER;

/**
 * The scissor rectangle currently used by this renderer.
 * @type {createjs.BoundingBox}
 * @private
 */
createjs.CanvasRenderer.prototype.scissor_ = null;

/**
 * The scissor rectangle currently used by this renderer.
 * @type {createjs.CanvasRenderer}
 * @private
 */
createjs.CanvasRenderer.prototype.mask_ = null;

/**
 * Saves the current rendering context.
 * @private
 */
createjs.CanvasRenderer.prototype.saveContext_ = function() {
  this.context_.save();
};

/**
 * Restores the rendering context.
 * @private
 */
createjs.CanvasRenderer.prototype.restoreContext_ = function() {
  this.context_.restore();
  this.alpha_ = -1;
  this.compositeOperation_ = -1;
};

/**
 * Updates the scissor rectangle.
 * @param {createjs.BoundingBox} scissor
 * @private
 */
createjs.CanvasRenderer.prototype.updateScissor_ = function(scissor) {
  /// <param type="createjs.CanvasRenderer" name="renderer"/>
  /// <param type="createjs.BoundingBox" name="scissor"/>
  if (this.scissor_) {
    if (this.scissor_.isEqual(scissor)) {
      return;
    }
    this.restoreContext_();
  }
  this.scissor_ = scissor;
  this.saveContext_();
  this.setTransformation(1, 0, 0, 1, 0, 0);
  this.context_.beginPath();
  this.context_.rect(scissor.getLeft(), scissor.getTop(),
                     scissor.getWidth(), scissor.getHeight());
  this.context_.clip();
};

/**
 * Destroys the scissor rectangle.
 * @private
 */
createjs.CanvasRenderer.prototype.destroyScissor_ = function() {
  /// <param type="createjs.CanvasRenderer" name="renderer"/>
  if (this.scissor_) {
    this.restoreContext_();
    this.scissor_ = null;
  }
};

if (createjs.DEBUG) {
  /**
   * Whether to show a red rectangle around a painted objects in a rendering
   * cycle.
   * @type {boolean}
   * @private
   */
  createjs.CanvasRenderer.prototype.showPainted_ = true;

  /**
   * @type {Array.<createjs.Renderer.RenderObject>}
   * @private
   */
  createjs.CanvasRenderer.prototype.painted_ = null;

  /**
   * Draws debug information on this renderer.
   * @param {Array.<createjs.Renderer.RenderObject>} painted
   * @private
   */
  createjs.CanvasRenderer.prototype.drawDebug_ = function(painted) {
    /// <param type="Array" elementType="createjs.Renderer.RenderObject"
    ///        name="painted"/>
    var context = this.context_;
    if (!createjs.UserAgent.isIPhone()) {
      context.fillStyle = '#f00';
      var HEIGHT = 24;
      context.font = HEIGHT + 'px arial';
      var text = createjs.Counter.paintedObjects + '/' +
                 createjs.Counter.visibleObjects + '/' +
                 createjs.Counter.totalObjects + ' ' +
                 createjs.Counter.updatedTweens + '/' +
                 createjs.Counter.runningTweens + ' ' +
                 createjs.Counter.cachedRenderers + '/' +
                 createjs.Counter.totalRenderers;
      context.fillText(text, 0, HEIGHT, 10000);
    }
    if (this.showPainted_) {
      context.strokeStyle = '#f00';
      context.setTransform(1, 0, 0, 1, 0, 0);
      for (var i = 0; i < painted.length; ++i) {
        var object = painted[i];
        var box = object.getRenderBox();
        context.strokeRect(
            box.getLeft(), box.getTop(), box.getWidth(), box.getHeight());
      }
    }
  };

  /** @override */
  createjs.CanvasRenderer.prototype.addDirtyObject = function(object) {
    this.painted_.push(object);
  };

  /** @override */
  createjs.CanvasRenderer.prototype.handleEvent = function(event) {
    createjs.assert(event.type == 'keyup');

    /// <var type="KeyboardEvent" name="keyEvent"/>
    var keyEvent = /** @type {KeyboardEvent} */ (event);
    var keyCode = keyEvent.keyCode;
    if (keyCode == createjs.Event.KeyCodes.Q) {
      this.showPainted_ = !this.showPainted_;
    }
  };
}

/**
 * Clears the invalidated rectangles.
 * @protected
 */
createjs.CanvasRenderer.prototype.clearScreen = function() {
  // There is a bug on stock browsers of Android 4.1.x and 4.2.x where the
  // clearRect() method crashes or does not clear the target canvas. To work
  // around this bug, this method calls the clearRect() method with a size
  // bigger than the canvas size.
  this.context_.setTransform(1, 0, 0, 1, 0, 0);
  this.context_.clearRect(0, 0, this.getWidth() + 1, this.getHeight() + 1);
};

/**
 * Returns a renderer used for composing a render object with a mask.
 * @return {createjs.CanvasRenderer}
 * @protected
 */
createjs.CanvasRenderer.prototype.getMask = function() {
  /// <returns type="createjs.CanvasRenderer"/>
  if (!this.mask_) {
    var canvas = createjs.createCanvas();
    canvas.width = this.getWidth();
    canvas.height = this.getHeight();
    this.mask_ = new createjs.CanvasRenderer(canvas, null);
  } else {
    this.mask_.clearScreen();
  }
  return this.mask_;
};

/**
 * Deletes the renderer used for composing a render object with a mask.
 * @protected
 * @const
 */
createjs.CanvasRenderer.prototype.destroyMask = function() {
  if (this.mask_) {
    this.mask_.destroy();
    this.mask_ = null;
  }
};

/**
 * Copies the image of a mask renderer, a renderer used for composing a render
 * object with a mask object, to this renderer.
 * @param {createjs.CanvasRenderer} mask
 * @param {number} composition
 * @protected
 * @const
 */
createjs.CanvasRenderer.prototype.drawMask = function(mask, composition) {
  /// <param type="createjs.CanvasRenderer" name="mask"/>
  /// <param type="number" name="composition"/>
  this.setTransformation(1, 0, 0, 1, 0, 0);
  this.setAlpha(1);
  this.setComposition(createjs.Renderer.Composition.SOURCE_OVER);
  this.drawCanvas(
      mask.getCanvas(), 0, 0, this.getWidth(), this.getHeight());
};

/** @override */
createjs.CanvasRenderer.prototype.destroy = function() {
  this.destroyMask();
  this.context_ = null;
  this.resetCanvas();
};

/** @override */
createjs.CanvasRenderer.prototype.setTransformation =
    function(a, b, c, d, tx, ty) {
  /// <param type="number" name="a"/>
  /// <param type="number" name="b"/>
  /// <param type="number" name="c"/>
  /// <param type="number" name="d"/>
  /// <param type="number" name="tx"/>
  /// <param type="number" name="ty"/>
  this.context_.setTransform(a, b, c, d, tx, ty);
};

/** @override */
createjs.CanvasRenderer.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  if (this.alpha_ != alpha) {
    this.alpha_ = alpha;
    this.context_.globalAlpha = alpha;
  }
};

/** @override */
createjs.CanvasRenderer.prototype.setComposition = function(operation) {
  /// <param type="number" name="operation"/>
  if (this.compositeOperation_ != operation) {
    this.compositeOperation_ = operation;
    this.context_.globalCompositeOperation =
        createjs.Renderer.getCompositionName(operation);
  }
};

/** @override */
createjs.CanvasRenderer.prototype.drawCanvas =
    function(canvas, x, y, width, height) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.context_.drawImage(canvas, x, y, width, height);
};

/** @override */
createjs.CanvasRenderer.prototype.drawVideo =
    function (video, x, y, width, height) {
  /// <param type="HTMLVideoElement" name="video"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.context_.drawImage(video, x, y, width, height);
};

/** @override */
createjs.CanvasRenderer.prototype.drawPartial =
    function(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="number" name="srcX"/>
  /// <param type="number" name="srcY"/>
  /// <param type="number" name="srcWidth"/>
  /// <param type="number" name="srcHeight"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.context_.drawImage(
      image, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
};

/** @override */
createjs.CanvasRenderer.prototype.addObject = function(object) {
  /// <param type="createjs.Renderer.RenderObject" name="object"/>
  // Skip rendering the specified object if it is not in the output <canvas>.
  // Even when this renderer skips rendering an object, it still needs to
  // call its 'beginPaintObject()' method and to update properties of this
  // renderer so it can render succeeding objects.
  var box = object.getRenderBox();
  if (box.maxX <= 0 || box.maxY <= 0 ||
      this.getWidth() <= box.minX || this.getHeight() <= box.minY) {
    object.beginPaintObject(this);
    return;
  }
  if (createjs.DEBUG) {
    if (createjs.CanvasRenderer.showPainted_) {
      this.addDirtyObject(object);
    }
    ++createjs.Counter.paintedObjects;
  }
  // Draw a masked object. The current code just show render objects
  // with 'compose' clips.
  var scissor = object.getClip();
  if (!scissor || !scissor.getMethod() || scissor.isShow()) {
    this.destroyScissor_();
  } else if (!scissor.getShape()) {
    this.updateScissor_(scissor.getBox());
  } else if (scissor.isCompose()) {
    var mask = this.getMask();
    object.beginPaintObject(mask);
    object.paintObject(mask);
    var shape = scissor.getShape();
    shape.beginPaintObject(mask);
    shape.paintObject(mask);
    this.drawMask(mask, scissor.getComposition());
    return;
  } else {
    return;
  }
  object.beginPaintObject(this);
  object.paintObject(this);
};

/** @override */
createjs.CanvasRenderer.prototype.begin = function() {
  if (createjs.DEBUG) {
    this.painted_ = [];
  }
  this.clearScreen();
  // Some Android 4.1.x browsers (e.g. DoCoMo L-05E) has an issue that calling
  // the CanvasRenderingContext2D.prototype.clearRect() method in a
  // setInterval() callback does not clear a <canvas> element:
  //   <https://code.google.com/p/android/issues/detail?id=39247>.
  // This renderer triggers DOM reflow to work around this issue when a game
  // needs it, i.e. it calls the createjs.Config.setUseAndroidWorkarounds()
  // method with its parameters '2d' and 1. (DOM reflow is a very slow operation
  // and this renderer does not trigger it by default.)
  this.updateCanvas('2d');
};

/** @override */
createjs.CanvasRenderer.prototype.paint = function(time) {
  /// <param type="number" name="time"/>
  // Render each layer and copy it to this renderer. Passing null to the
  // endPaint() method prevents it from copying its result to this renderer.
  // (This is used only by debug builds to hide layers specified by a user.)
  this.destroyScissor_();
  if (createjs.DEBUG) {
    this.drawDebug_(this.painted_);
  }
};
