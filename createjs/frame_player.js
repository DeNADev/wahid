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

/**
 * The top-level namespace for this library.
 * @namespace createjs
 */
var createjs = {};

/**
 * Represents whether this library is compiled with the Closure compiler.
 * @define {boolean}
 */
createjs.COMPILED = false;

/**
 * Represents whether to enable debugging features.
 * @define {boolean}
 */
createjs.DEBUG = true;

/**
 * A reference to the global context.
 * @const {Object}
 */
createjs.global = window;

/**
 * The constructor of the AudioContext class.
 * @const {function(new:AudioContext)}
 */
createjs.AudioContext =
    createjs.global['webkitAudioContext'] || createjs.global['AudioContext'];

/**
 * The commands used for communicating with a createjs.FramePlayer object, which
 * runs on an <iframe> element.
 * @enum {number}
 */
createjs.FrameCommand = {
  LOAD: 0,
  PLAY: 1,
  STOP: 2,
  SET_VOLUME: 3,
  INITIALIZE: 4,
  TOUCH: 5,
  DECODE: 6,
  END: 7,
  CLONE: 8
};

/**
 * Writes a log message to a console.
 * @param {string} message
 */
createjs.log = function(message) {
  /// <param type="string" name="message"/>
  if (createjs.DEBUG) {
    console.log(message);
  }
};

/**
 * Writes a log message to a console.
 * @param {string} message
 */
createjs.debug = function(message) {
  /// <param type="string" name="message"/>
  if (createjs.DEBUG) {
    console.debug(message);
  }
};

/**
 * The AudioContext instance used by this player.
 * @type {AudioContext}
 * @private
 */
createjs.context_ = null;

/**
 * The 1-sample audio buffer representing an empty sound.
 * @type {AudioBuffer}
 * @private
 */
createjs.buffer_ = null;

/**
 * Whether the host device is an iPhone or an iPad.
 * @type {boolean}
 * @private
 */
createjs.iphone_ = false;

/**
 * The instance of the FramePlayer object.
 * @type {createjs.FramePlayer}
 * @private
 */
createjs.player_ = null;

/**
 * The number of times to play an empty sound on touch.
 * @type {number}
 * @private
 */
createjs.retry_ = 1;

/**
 * The user-action event that plays an empty sound. (This is a workaround for
 * WebKit Bug 149367 <http://webkit.org/b/149367>.)
 * @type {string}
 * @private
 */
createjs.USER_ACTION_EVENT_ =
    MouseEvent['WEBKIT_FORCE_AT_MOUSE_DOWN'] ? 'touchend' : 'touchstart';

/**
 * A class that plays sound files on an <iframe> element. This class is used for
 * decoding sound files in a background thread. Decoding sound files with the
 * WebAudio API often consumes so much CPU power, especially on devices that use
 * software decoders, that a game thread cannot consume enough CPU power. This
 * class offloads such WebAudio-API calls onto an <iframe> element. (Most
 * browsers run <iframe> elements on worker threads.)
 * @constructor
 */
createjs.FramePlayer = function() {
  /**
   * @const {Object.<string,createjs.FramePlayer.Sound>}
   * @private
   */
  this.sounds_ = {};
};

/**
 * An inner class representing a sound file played by the createjs.FramePlayer
 * class.
 * @param {string} id
 * @param {Window} parent
 * @constructor
 */
createjs.FramePlayer.Sound = function(id, parent) {
  /**
   * @type {string}
   * @private
   */
  this.id_ = id;

  /**
   * @const {Window}
   * @private
   */
  this.parent_ = parent;
};

/**
 * The volume of this sound.
 * @type {number}
 * @private
 */
createjs.FramePlayer.Sound.prototype.volume_ = 1;

/**
 * The start position in seconds.
 * @type {number}
 * @private
 */
createjs.FramePlayer.Sound.prototype.offset_ = -1;

/**
 * The period of time to be played in seconds.
 * @type {number}
 * @private
 */
createjs.FramePlayer.Sound.prototype.duration_ = 0;

/**
 * Whether this sound should be played when the browser finishes decoding it.
 * (A game may send a play request for this sound while the browser is
 * decoding it.)
 * @type {number}
 * @private
 */
createjs.FramePlayer.Sound.prototype.auto_ = 0;

/**
 * Represents the number of loop counts of this sound. The
 * createjs.FramePlayer object currently supports only -1 (infinite).
 * @type {number}
 * @private
 */
createjs.FramePlayer.Sound.prototype.loop_ = 0;

/**
 * The clones that wait for this sound to be decoded. A game may send clone
 * requests of this sound before the browser finishes decoding it. (Clones use
 * the decoded data of this sound to avoid decoding one sound multiple times.)
 * @type {Array.<createjs.FramePlayer.Sound>}
 * @private
 */
createjs.FramePlayer.Sound.prototype.clones_ = null;

/**
 * The audio data played by this player.
 * @type {AudioBuffer}
 * @private
 */
createjs.FramePlayer.Sound.prototype.buffer_ = null;

/**
 * The source node that plays audio.
 * @type {AudioBufferSourceNode}
 * @private
 */
createjs.FramePlayer.Sound.prototype.source_ = null;

/**
 * The gain node that changes the volume of this player.
 * @type {GainNode}
 * @private
 */
createjs.FramePlayer.Sound.prototype.gain_ = null;

/**
 * Called when the AudioContext object finishes decoding audio.
 * @param {AudioBuffer} buffer
 * @private
 */
createjs.FramePlayer.Sound.prototype.handleDecode_ = function(buffer) {
  createjs.debug('decode=' + this.id_);
  this.buffer_ = buffer;
  this.parent_.postMessage({
    'a': createjs.FrameCommand.DECODE,
    'b': this.id_
  }, "*");
  if (this.auto_) {
    this.play_(this.loop_, this.volume_);
    this.auto_ = 0;
  }
  if (this.clones_) {
    for (var i = 0; i < this.clones_.length; ++i) {
      var clone = this.clones_[i];
      clone.buffer_ = buffer;
      if (clone.auto_) {
        clone.play_(clone.loop_, clone.volume_);
        clone.auto_ = 0;
      }
    }
    this.clones_ = null;
  }
};

/**
 * Called when the AudioBufferSourceNode object associated with this player
 * finishes playing audio.
 * @private
 */
createjs.FramePlayer.Sound.prototype.handleEnded_ = function() {
  createjs.debug('ended=' + this.id_);
  this.stop_();
  this.parent_.postMessage({
    'a': createjs.FrameCommand.END,
    'b': this.id_
  }, "*");
};

/**
 * Starts playing the audio associated with this player.
 * @param {number} loop
 * @param {number} volume
 * @private
 */
createjs.FramePlayer.Sound.prototype.play_ = function(loop, volume) {
  createjs.debug('play=' + this.id_ + ',' + loop + ',' + volume);
  if (!this.buffer_) {
    this.auto_ = 1;
    this.loop_ = loop;
    this.volume_ = volume;
    return;
  }
  if (this.source_) {
    this.stop_();
  }
  this.volume_ = volume;
  var context = createjs.context_;
  var gain =
      context.createGain ? context.createGain() : context.createGainNode();
  gain.connect(context.destination);
  gain.gain.value = this.volume_;
  this.gain_ = gain;
  var source = context.createBufferSource();
  source.connect(gain);
  source.buffer = this.buffer_;
  if (loop) {
    source.loop = true;
  } else {
    source.onended = this.handleEnded_.bind(this);
  }
  if (this.offset_ >= 0) {
    if (source.start) {
      source.start(0, this.offset_, this.duration_);
    } else {
      source.noteGrainOn(0, this.offset_, this.duration_);
    }
  } else {
    if (source.start) {
      source.start(0);
    } else {
      source.noteOn(0);
    }
  }
  this.source_ = source;
};

/**
 * Stops playing the audio associated with this player.
 * @private
 */
createjs.FramePlayer.Sound.prototype.stop_ = function() {
  createjs.debug('stop=' + this.id_);
  var source = this.source_;
  if (source) {
    var playbackState = source.playbackState || 0;
    if (playbackState != 3) {
      if (source.stop) {
        source.stop(0);
      } else {
        source.noteOff(0);
      }
    }
    source.disconnect(0);
    source.onended = null;
    // When an AudioBufferSouceNode object is disconnected from a destination
    // node, Mobile Safari does not delete its AudioBuffer object. Attach a
    // 1-sample AudioBuffer object to the AudioBufferSourceNode object to delete
    // the AudioBuffer object on the browser. (This code throws an exception on
    // Chrome and Firefox, i.e. this code must be executed only on Mobile
    // Safari.)
    if (createjs.iphone_) {
      if (createjs.buffer_) {
        source.buffer = createjs.buffer_;
      }
    }
    this.source_ = null;
    this.gain_.disconnect(0);
    this.gain_ = null;
  }
};

/**
 * Changes the volume of the audio being played by this player.
 * @param {number} volume
 * @private
 */
createjs.FramePlayer.Sound.prototype.setVolume_ = function(volume) {
  createjs.debug('volume=' + this.id_ + ',' + volume);
  if (this.gain_) {
    this.gain_.gain.value = volume;
  }
};

/**
 * Called when the watchdog timer expires. This method sends an event to the
 * owner window of this frame if the global AudioContext object advances its
 * currentTime property, i.e. it actually plays a sound. Otherwise, it waits an
 * user action to play a sound there.
 * @private
 */
createjs.FramePlayer.handleTimeout_ = function() {
  createjs.debug('> currentTime=' + createjs.context_.currentTime);
  if (createjs.context_.currentTime || !createjs.retry_) {
    createjs.global.parent.postMessage({
      'a': createjs.FrameCommand.TOUCH
    }, "*");
  } else {
    --createjs.retry_;
    var player = /** @type {EventListener} */ (createjs.player_);
    createjs.global.addEventListener(
        createjs.USER_ACTION_EVENT_, player, false);
  }
};

/**
 * Plays an empty sound and see the host browser actually plays it. This method
 * waits for 100 ms and sees the AudioContext object advances its currentTime
 * property to verify the browser actually plays an empty sound. (If the value
 * of this currentTime property is 0, the host browser needs a user action to
 * play sounds.)
 * @private
 */
createjs.FramePlayer.playEmptySound_ = function() {
  var context = createjs.context_;
  var source = context.createBufferSource();
  source.buffer = createjs.buffer_;
  if (source.start) {
    source.start(0);
  } else {
    source.noteOn(0);
  }
  setTimeout(createjs.FramePlayer.handleTimeout_, 100);
};

/**
 * Called when this player receives a DOM event.
 * @param {Event} event
 */
createjs.FramePlayer.prototype['handleEvent'] = function(event) {
  var type = event.type;
  if (type == 'message') {
    var data = /** @type {Object} */ (/** @type {*} */ (event.data));
    var command = /** @type {number} */ (data['a']);
    var id = /** @type {string} */ (data['b']);
    if (command == createjs.FrameCommand.LOAD) {
      createjs.debug('load=' + id);
      if (this.sounds_[id]) {
        return;
      }
      var sound = new createjs.FramePlayer.Sound(id, event.source);
      this.sounds_[id] = sound;
      var handleDecode = sound.handleDecode_.bind(sound);
      createjs.context_.decodeAudioData(
          /** @type {ArrayBuffer} */ (data['c']),
          handleDecode,
          /** @type {function()} */ (handleDecode));
      return;
    }
    var sound = this.sounds_[id];
    if (!sound) {
      return;
    }
    if (command == createjs.FrameCommand.PLAY) {
      sound.play_(/** @type {number} */ (data['c']),
                  /** @type {number} */ (data['d']));
    } else if (command == createjs.FrameCommand.STOP) {
      sound.stop_();
    } else if (command == createjs.FrameCommand.SET_VOLUME) {
      sound.setVolume_(/** @type {number} */ (data['c']));
    } else if (command == createjs.FrameCommand.CLONE) {
      createjs.debug('clone=' + data['c'] + ',' + data['d'] + ',' + data['e']);
      var clone = new createjs.FramePlayer.Sound(sound.id_, sound.parent_);
      clone.id_ = /** @type {string} */ (data['c']);
      clone.buffer_ = sound.buffer_;
      clone.offset_ = /** @type {number} */ (data['d']);
      clone.duration_ = /** @type {number} */ (data['e']);
      this.sounds_[/** @type {string} */ (data['c'])] = clone;
      if (!sound.buffer_) {
        if (!sound.clones_) {
          sound.clones_ = [];
        }
        sound.clones_.push(clone);
      }
    }
  } else {
    createjs.debug('> type=' + type);
    var global = createjs.global;
    global.removeEventListener(type, this, false);
    // This frame receives a user action. Plays an empty sound and verify the
    // host browser actually plays it again. (Mobile Safari 9 does not play
    // sounds on first touch when it is scrolling its view.)
    createjs.FramePlayer.playEmptySound_();
  }
};

/**
 * The entry-point method of this application.
 * @const
 */
createjs.global.onload = function() {
  // Create the global objects used by this application.
  createjs.context_ = new createjs.AudioContext();
  createjs.player_ = new createjs.FramePlayer();
  createjs.buffer_ = createjs.context_.createBuffer(1, 1, 22500);
  var platform = navigator.platform;
  createjs.iphone_ = platform == 'iPhone' || platform == 'iPad';

  // Plays an empty sound to see the host browser can play it without user
  // actions.
  createjs.FramePlayer.playEmptySound_();

  // Accept incoming messages from the owner window.
  var player = /** @type {EventListener} */ (createjs.player_);
  createjs.global.addEventListener('message', player, false);
  var parent = createjs.global.parent;
  parent.postMessage({
    'a': createjs.FrameCommand.INITIALIZE
  }, "*");
};
