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
/// <reference path="graphics.js"/>
/// <reference path="tween_motion.js"/>

/**
 * An interface used by createjs.Tween objects to change properties of their
 * targets. (This interface is in practice used for avoiding a cyclic dependency
 * between the createjs.DisplayObject class and the createjs.Tween class.)
 * @interface
 */
createjs.TweenTarget = function() {};

/**
 * The play modes of a tween.
 * @enum {number}
 */
createjs.TweenTarget.PlayMode = {
  INDEPENDENT: 0,
  SINGLE: 1,
  SYNCHED: 2
};

/**
 * Registers a tween to this target.
 * @param {createjs.TweenObject} tween
 */
createjs.TweenTarget.prototype.registerTween = function(tween) {};

/**
 * Unregisters a tween registered to this target.
 * @param {createjs.TweenObject} tween
 */
createjs.TweenTarget.prototype.unregisterTween = function(tween) {};

/**
 * Removes all tweens registered to this target.
 */
createjs.TweenTarget.prototype.resetTweens = function() {};

/**
 * Starts playing the tweens registered to this target.
 * @param {number} time
 */
createjs.TweenTarget.prototype.playTweens = function(time) {};

/**
 * Stops playing the tweens registered to this target.
 * @param {number} time
 */
createjs.TweenTarget.prototype.stopTweens = function(time) {};

/**
 * Updates the tweens registered to this target.
 * @param {number} time
 */
createjs.TweenTarget.prototype.updateTweens = function(time) {};

/**
 * Returns whether this target has tweens.
 * @return {boolean}
 */
createjs.TweenTarget.prototype.hasTweens = function() {};

/**
 * Sets the position of all tweens registered to this target.
 * @param {number} position
 */
createjs.TweenTarget.prototype.setTweenPosition = function(position) {};

/**
 * Sets the properties of all tweens registered to this target.
 * @param {boolean} loop
 * @param {number} position
 * @param {boolean} single
 */
createjs.TweenTarget.prototype.setTweenProperties =
    function(loop, position, single) {};

/**
 * Returns whether this target is detached from its parent.
 * @return {boolean}
 */
createjs.TweenTarget.prototype.getOff = function() {};

/**
 * Attaches this target to its parent or detaches it.
 * @param {boolean} off
 */
createjs.TweenTarget.prototype.setOff = function(off) {};

/**
 * Returns the current play mode of the tweens registered to this target.
 * @return {number}
 */
createjs.TweenTarget.prototype.getPlayMode = function() {};

/**
 * Sets the play mode of the tweens registered to this target.
 * @param {number} mode
 */
createjs.TweenTarget.prototype.setPlayMode = function(mode) {};

/**
 * Starts synchronizing the tweens of the specified targets with this target or
 * stops it.
 * @param {createjs.TweenTarget} target
 * @param {boolean} synchronize
 */
createjs.TweenTarget.prototype.synchronize = function(target, synchronize) {};

/**
 * Attaches a createjs.Graphics object to this target.
 * @param {createjs.Graphics} graphics
 */
createjs.TweenTarget.prototype.addGraphics = function(graphics) {};

/**
 * Returns the ID of this target.
 * @return {number}
 */
createjs.TweenTarget.prototype.getTargetId = function() {};

/**
 * Copies the property values of this target to the specified tween motion.
 * @param {createjs.TweenMotion} motion
 * @return {boolean}
 */
createjs.TweenTarget.prototype.getTweenMotion = function(motion) {};

/**
 * Copies the property values of the specified motion to this target.
 * @param {createjs.TweenMotion} motion
 * @param {number} mask
 * @param {createjs.TweenTarget} proxy
 */
createjs.TweenTarget.prototype.setTweenMotion =
    function(motion, mask, proxy) {};
