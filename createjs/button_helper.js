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
/// <reference path="movie_clip.js"/>
/// <reference path="object.js"/>
/// <reference path="sprite.js"/>

/**
 * A class that creates an interactive button from a createjs.MovieClip instance
 * or a createjs.Sprite instance.
 * @param {createjs.Sprite|createjs.MovieClip} target
 * @param {string|number=} opt_out
 * @param {string|number=} opt_over
 * @param {string|number=} opt_down
 * @param {boolean=} opt_play
 * @param {createjs.DisplayObject=} opt_area
 * @param {string=} opt_label
 * @extends {createjs.Object}
 * @implements {EventListener}
 * @constructor
 */
createjs.ButtonHelper = function(target,
                                 opt_out,
                                 opt_over,
                                 opt_down,
                                 opt_play,
                                 opt_area,
                                 opt_label) {
  /// <signature>
  ///   <param type="createjs.Sprite" name="target"/>
  ///   <param type="string" optional="true" name="opt_out"/>
  ///   <param type="string" optional="true" name="opt_over"/>
  ///   <param type="string" optional="true" name="opt_down"/>
  ///   <param type="boolean" optional="true" name="opt_play"/>
  ///   <param type="createjs.DisplayObject" optional="true" name="opt_area"/>
  ///   <param type="string" optional="true" name="opt_label"/>
  /// </signature>
  /// <signature>
  ///   <param type="createjs.MovieClip" name="target"/>
  ///   <param type="string" optional="true" name="opt_out"/>
  ///   <param type="string" optional="true" name="opt_over"/>
  ///   <param type="string" optional="true" name="opt_down"/>
  ///   <param type="boolean" optional="true" name="opt_play"/>
  ///   <param type="createjs.DisplayObject" optional="true" name="opt_area"/>
  ///   <param type="string" optional="true" name="opt_label"/>
  /// </signature>
  createjs.Object.call(this);

  /**
   * The target for this button.
   * @type {createjs.MovieClip|createjs.Sprite}
   * @private
   */
  this.target_ = target;

  /**
   * The label name or frame number to jump when the target receives a 'pressup'
   * event.
   * @type {string|number}
   * @private
   */
  this.out_ = (opt_out == null) ? 'out' : opt_out;

  /**
   * The label name or frame number to jump when the target receives a
   * 'mousedown' event.
   * @type {string|number}
   * @private
   */
  this.down_ = (opt_down == null) ? 'down' : opt_down;

  /**
   * Whether this button is playing the target clip.
   * @type {boolean}
   * @private
   */
  this.play_ = !!opt_play;

  // Listen mouse events for the target clip and start playing it.
  this.setEnabled(true);
  this.goto_(this.out_);
};
createjs.inherits('ButtonHelper', createjs.ButtonHelper, createjs.Object);

/**
 * The target for this button helper.
 * @type {createjs.MovieClip|createjs.Sprite}
 * @private
 */
createjs.ButtonHelper.prototype.target_ = null;

/**
 * The label name or frame number to jump when the target receives a 'pressup'
 * event.
 * @type {string|number}
 * @private
 */
createjs.ButtonHelper.prototype.out_ = 'out';

/**
 * The label name or frame number to jump when the target receives a
 * 'mousedown' event.
 * @type {string|number}
 * @private
 */
createjs.ButtonHelper.prototype.down_ = 'down';

/**
 * Whether this ButtonHelper play the target clip.
 * @type {boolean}
 * @private
 */
createjs.ButtonHelper.prototype.play_ = false;

/**
 * Whether the object is listening events.
 * @type {boolean}
 * @private
 */
createjs.ButtonHelper.prototype.enabled_ = false;

/**
 * Whether the target object has received a mousedown event.
 * @type {boolean}
 * @private
 */
createjs.ButtonHelper.prototype.pressed_ = false;

/**
 * Moves the play position of the target clip to the specified label.
 * @param {string|number} label
 * @private
 */
createjs.ButtonHelper.prototype.goto_ = function(label) {
  /// <signature>
  ///   <param type="string" name="label"/>
  /// </signature>
  /// <signature>
  ///   <param type="number" name="label"/>
  /// </signature>
  if (this.play_) {
    if (this.target_.gotoAndPlay) {
      this.target_.gotoAndPlay(label);
    }
  } else {
    if (this.target_.gotoAndStop) {
      this.target_.gotoAndStop(label);
    }
  }
};

/**
 * Enables or disables this button.
 * @param {boolean} value
 * @const
 */
createjs.ButtonHelper.prototype.setEnabled = function(value) {
  /// <param type="boolean" name="value"/>
  var enabled = !!value;
  if (this.enabled_ == enabled) {
    return;
  }
  this.enabled_ = enabled;
  var target = this.target_;
  if (enabled) {
    target.on('mousedown', this);
    target.on('pressup', this);
  } else {
    target.off('mousedown', this);
    target.off('pressup', this);
  }
};

/** @override */
createjs.ButtonHelper.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  var type = event.type;
  var label = '';
  if (type == 'mousedown') {
    this.pressed_ = true;
    label = this.down_;
  } else if (type == 'pressup') {
    this.pressed_ = false;
    label = this.out_;
  }
  this.goto_(label);
};

// Export the createjs.ButtonHelper object to the global namespace.
createjs.exportObject('createjs.ButtonHelper', createjs.ButtonHelper, {
  // createjs.Stage methods
  'setEnabled': createjs.ButtonHelper.prototype.setEnabled
});
