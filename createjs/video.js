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
/// <reference path="config.js"/>
/// <reference path="display_object.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="ticker.js"/>

/**
 * A class that encapsulates an HTMLVideoElement object.
 * @param {HTMLVideoElement} video
 * @extends {createjs.DisplayObject}
 * @implements {EventListener}
 * @constructor
 */
createjs.Video = function(video) {
  /// <param type="HTMLVideoElement" name="value"/>
  createjs.DisplayObject.call(this);

  /**
   * The <video> element to be rendered.
   * @type {HTMLVideoElement}
   * @private
   */
  this.video_ = video;

  // Initialize the bounding box with the video size.
  this.setBoundingBox(0, 0, video.videoWidth, video.videoHeight);
};
createjs.inherits('Video', createjs.Video, createjs.DisplayObject);

/**
 * The <video> element to be rendered.
 * @type {HTMLVideoElement}
 * @private
 */
createjs.Video.prototype.video_ = null;

/**
 * Whether the associated <video> element starts over when it reaches its end.
 * @type {boolean}
 * @private
 */
createjs.Video.prototype.loop_ = false;

/**
 * Whether this object is listening 'ended' events.
 * @type {boolean}
 * @private
 */
createjs.Video.prototype.ended_ = false;

/**
 * The position of the associated <video> element when it is rendered, in
 * seconds.
 * @type {number}
 * @private
 */
createjs.Video.prototype.lastTime_ = 0;

/**
 * The last time when the associated <video> element is rendered.
 * @type {number}
 * @private
 */
createjs.Video.prototype.runTime_ = -1;

/**
 * The renderer that draws this object.
 * @type {createjs.Renderer}
 * @private
 */
createjs.Video.prototype.output_ = null;

/**
 * The <canvas> element to be rendered.
 * @type {HTMLCanvasElement}
 * @private
 */
createjs.Video.prototype.canvas_ = null;

/**
 * The <canvas> element to be rendered.
 * @type {CanvasRenderingContext2D}
 * @private
 */
createjs.Video.prototype.context_ = null;

/**
 * Starts playing this video. This method does not only start playing the
 * <video> element attached to this object but it also resets the time-stamp to
 * force drawing this object.
 * @param {number} time
 * @param {boolean} loop
 * @const
 */
createjs.Video.prototype.play = function(time, loop) {
  var video = this.video_;
  if (time) {
    this.lastTime_ = time;
    video.currentTime = time;
  }
  this.loop_ = !!loop;
  // Play this <video> element only when the host browser can play <video>
  // elements inline. (Set both the 'playsinline' attribute so Mobile Safari on
  // iOS can play the <video> element inline and set the 'webkit-playsinline'
  // attribute so standalone-mode web apps can, respectively.)
  // earlier.)
  if (createjs.Config.canPlayInline()) {
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.loop = this.loop_;
    if (!this.loop_) {
      if (!this.ended_) {
        this.ended_ = true;
        video.addEventListener('ended', this, false);
      }
    }
    video.play();
  } else {
    video.load();
    this.runTime_ = createjs.Ticker.getRunTime();
  }
};

/**
 * Stops playing this video.
 * @const
 */
createjs.Video.prototype.stop = function() {
  var video = this.video_;
  if (this.ended_) {
    this.ended_ = false;
    video.removeEventListener('ended', this, false);
  }
  video.pause();
};

/** @override */
createjs.Video.prototype.removeAllChildren = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  this.handleDetach();
};

/** @override */
createjs.Video.prototype.handleDetach = function() {
  if (this.canvas_) {
    if (this.output_) {
      this.output_.uncache(this.canvas_);
    }
    this.context_ = null;
    this.canvas_ = null;
  } else {
    if (this.output_) {
      this.output_.uncache(this.video_);
    }
  }
  this.stop();
  this.video_ = null;
};

/** @override */
createjs.Video.prototype.paintObject = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  var video = this.video_;
  // Draw this <video> element only when it has enough data to avoid a warning
  // "WebGL: INVALID_VALUE: texImage2D: no video".
  /** @enum {number} */
  var ReadyState = {
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    HAVE_CURRENT_DATA: 2,
    HAVE_FUTURE_DATA: 3,
    HAVE_ENOUGH_DATA: 4
  };
  if (video.readyState < ReadyState.HAVE_ENOUGH_DATA) {
    return;
  }
  // Synchronize the video size with the bounding-box size of this object first
  // time when this object is rendered. (The video size is reliable only when
  // its readyState property is >= HAVE_METADATA (1).)
  if (!this.getBoxWidth()) {
    this.setBoundingBox(0, 0, video.videoWidth, video.videoHeight);
  }
  if (!this.output_) {
    this.output_ = renderer;
  }
  var current = video.currentTime;
  if (this.runTime_ >= 0) {
    // Advance the position of the associated <video> element manually to get
    // the image at that position if the host browser cannot play <video>
    // elements inline, i.e. Mobile Safari on iOS 9 or earlier.
    var runTime = createjs.Ticker.getRunTime();
    current += (runTime - this.runTime_) * 0.001;
    this.runTime_ = runTime;
    var duration = video.duration;
    if (current >= duration) {
      if (this.loop_) {
        current = current % duration;
      } else {
        current = duration;
      }
    }
    video.currentTime = current;
  }
  if (!renderer.getExtensions()) {
    // Create a placeholder <canvas> element and copy the current frame to it if
    // this renderer cannot render <video> elements. (The WebGLRenderer object
    // cannot renderer <video> elements on IE11, which does not allow creating
    // WebGLTexture objects with <video> elements.)
    var canvas = this.canvas_;
    if (!canvas) {
      canvas = createjs.createCanvas();
      canvas.width = this.getBoxWidth();
      canvas.height = this.getBoxHeight();
      this.canvas_ = canvas;
      this.context_ = createjs.getRenderingContext2D(canvas);
      current = -1;
    }
    if (this.lastTime_ != current) {
      this.lastTime_ = current;
      this.context_.drawImage(video, 0, 0);
      canvas.dirty_ = 1;
    }
    renderer.drawCanvas(canvas, 0, 0, this.getBoxWidth(), this.getBoxHeight());
  } else {
    if (this.lastTime_ != current) {
      this.lastTime_ = current;
      video.dirty_ = 1;
    }
    renderer.drawVideo(video, 0, 0, this.getBoxWidth(), this.getBoxHeight());
  }
};

/** @override */
createjs.Video.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  var type = event.type;
  if (type == 'ended') {
    this.stop();
    this.dispatchNotification('complete');
  }
};

// Export the createjs.Video object to the global namespace.
createjs.exportObject('createjs.Video', createjs.Video, {
  'play': createjs.Video.prototype.play,
  'stop': createjs.Video.prototype.stop
});
