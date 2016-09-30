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
/// <reference path="display_object.js"/>
/// <reference path="user_agent.js"/>

/**
 * A class that encapsulates a DOM element. This object is a pseudo display
 * object that retrieves its position from the createjs.Renderer object to move
 * the associated DOM element there.
 * @param {string} id
 * @extends {createjs.DisplayObject}
 * @constructor
 */
createjs.DOMElement = function(id) {
  createjs.DisplayObject.call(this);

  /**
   * The HTMLElement object associated with this object.
   * @type {HTMLElement}
   * @private
   */
  this.element_ = document.getElementById(id);

  /**
   * Whether the hosting browser uses WebKit (or blink). This class caches this
   * value to avoid calling a function every time when it updates the position
   * of its associated element.
   * @type {boolean}
   * @private
   */
  this.isWebKit_ = createjs.UserAgent.isWebKit();

  // Set the CSS style of the HTML element associated with this object.
  var style = this.element_.style;
  style.visibility = 'hidden';
  style.position = 'absolute';
  style[this.isWebKit_ ? 'webkitTransformOrigin' : 'transformOrigin'] = '0% 0%';

  // Synchronize the bounding box of this object with the one of the given
  // element.
  this.setBoundingBox(
      0, 0, this.element_.clientWidth, this.element_.clientHeight);
};
createjs.inherits('DOMElement', createjs.DOMElement, createjs.DisplayObject);

/**
 * Returns an HTMLElement object associated with this object.
 * @return {HTMLElement}
 * @private
 */
createjs.DOMElement.prototype.getElement_ = function() {
  /// <returns type="HTMLElement"/>
  return this.element_;
};

/** @override */
createjs.DOMElement.prototype.layout =
    function(renderer, parent, dirty, time, draw) {
  /// <param type="createjs.Renderer" name="renderer"/>
  /// <param type="createjs.DisplayObject" name="parent"/>
  /// <param type="number" name="dirty"/>
  /// <param type="number" name="time"/>
  /// <param type="number" name="draw"/>
  /// <returns type="number"/>

  // Save the alpha value of the element associated with this object, which is
  // not covered by the dirty flag, to change it only when its value has been
  // updated.
  var state = this.getState();
  var alpha = state.getAlpha();

  // Update the layout of this object without adding it to the given renderer.
  // This object is a virtual object and the renderer cannot draw it.
  createjs.DOMElement.superClass_.layout.call(
      this, renderer, parent, dirty, time, 0);

  // Move the element associated with this object to the calculated position.
  var style = this.getElement_().style;
  if (dirty & createjs.DisplayObject.DIRTY_PROPERTIES) {
    if (!state.isVisible()) {
      style.visibility = 'hidden';
      return 0;
    }
    style.visibility = 'visible';
    if (alpha != state.getAlpha()) {
      style.opacity = state.getAlpha();
    }
  }
  if (dirty & createjs.DisplayObject.DIRTY_TRANSFORM) {
    var ratio = renderer.getCSSRatio();
    var tx = state.tx * ratio.x;
    var ty = state.ty * ratio.y;
    var transform = 'matrix(' +
        state.a + ',' + state.b + ',' + state.c + ',' + state.d + ',' +
        tx + ',' + ty + ')';
    style[this.isWebKit_ ? 'webkitTransform' : 'transform'] = transform;
  }
  return 0;
};

// Export the createjs.DOMElement object to the global namespace.
createjs.exportObject('createjs.DOMElement', createjs.DOMElement, {
  // createjs.Object methods.
});
