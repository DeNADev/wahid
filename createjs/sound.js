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
/// <reference path="loader.js"/>
/// <reference path="user_agent.js"/>
/// <reference path="../externs/webaudio.js"/>

/**
 * A class that plays sound.
 * @extends {createjs.EventDispatcher}
 * @constructor
 */
createjs.Sound = function() {
  createjs.EventDispatcher.call(this);

  /**
   * The sound players.
   * @type {Object.<string,createjs.Sound.Player>}
   * @private
   */
  this.players_ = {};
};
createjs.inherits('Sound', createjs.Sound, createjs.EventDispatcher);

/**
 * The instance of the createjs.Sound object.
 * @type {createjs.Sound}
 * @private
 */
createjs.Sound.instance_ = null;

/**
 * The character (or characters) that are used to split multiple paths from an
 * audio source.
 * @const {string}
 */
createjs.Sound.DELIMITER = '|';

/**
 * The interrupt value to interrupt any currently playing instance with the same
 * source, if the maximum number of instances of the sound are already playing.
 * @const {number}
 */
createjs.Sound.INTERRUPT_ANY = 0;  // 'any'

/**
 * The interrupt value to interrupt the earliest currently playing instance with
 * the same source that progressed the least distance in the audio track, if the
 * maximum number of instances of the sound are already playing.
 * @const {number}
 */
createjs.Sound.INTERRUPT_EARLY = 1;  // 'early';

/**
 * The interrupt value to interrupt the currently playing instance with the same
 * source that progressed the most distance in the audio track, if the maximum
 * number of instances of the sound are already playing.
 * @const {number}
 */
createjs.Sound.INTERRUPT_LATE = 2;  // 'late';

/**
 * The interrupt value to not interrupt any currently playing instances with the
 * same source, if the maximum number of instances of the sound are already
 * playing.
 * @const {number}
 */
createjs.Sound.INTERRUPT_NONE = 3;  // 'none';

/**
 * Defines the playState of an instance that is still initializing.
 * @const {number}
 */
createjs.Sound.PLAY_INITED = 0;  // 'playInited';

/**
 * Defines the playState of an instance that is currently playing or paused.
 * @const {number}
 */
createjs.Sound.PLAY_SUCCEEDED = 2;  // 'playSucceeded';

/**
 * Defines the playState of an instance that was interrupted by another instance.
 * @const {number}
 */
createjs.Sound.PLAY_INTERRUPTED = 3;  // 'playInterrupted';

/**
 * Defines the playState of an instance that completed playback.
 * @const {number}
 */
createjs.Sound.PLAY_FINISHED = 4;  // 'playFinished';

/**
 * Defines the playState of an instance that failed to play.
 * @const {number}
 */
createjs.Sound.PLAY_FAILED = 5;  // 'playFailed';

/**
 * Returns the global instance of the createjs.Sound object.
 * @return {createjs.Sound}
 */
createjs.Sound.getInstance_ = function() {
  /// <returns type="createjs.Sound"/>
  if (!createjs.Sound.instance_) {
    createjs.Sound.instance_ = new createjs.Sound();
  }
  return createjs.Sound.instance_;
};

/**
 * The sound players.
 * @type {Object.<string,createjs.Sound.Player>}
 * @private
 */
createjs.Sound.prototype.players_ = null;

/**
 * The features supported by this module.
 * @type {Object.<string,number>}
 * @private
 */
createjs.Sound.prototype.capabilities_ = {
  'panning': 1,
  'volume': 1,
  'mp3': 1,
  'mpeg': 1,
  'm4a': 1,
  'mp4': 1,
  'ogg': 0,
  'wav': 0
};

/**
 * An inner interface that provides methods for the original SoundJS plug-ins.
 * @interface
 */
createjs.Sound.Plugin = function() {};

/**
 * An inner class that emulates the original createjs.HTMLAudioPlugin class.
 * @implements {createjs.Sound.Plugin}
 * @constructor
 */
createjs.HTMLAudioPlugin = function() {
};

// Export the createjs.HTMLAudioPlugin object to the global namespace.
createjs.exportObject('createjs.HTMLAudioPlugin', createjs.HTMLAudioPlugin, {
}, {
  'enableIOS': true
});

/**
 * An inner class that emulates the original createjs.WebAudioPlugin class.
 * @implements {createjs.Sound.Plugin}
 * @constructor
 */
createjs.WebAudioPlugin = function() {
};

/**
 * The dummy AudioContext instance exported to applications.
 * @const {AudioContext}
 */
createjs.WebAudioPlugin['context'] = {
  'currentTime': -1
};

/**
 * Whether this plug-in is initialized.
 * @type {boolean}
 * @private
 */
createjs.WebAudioPlugin.initialized_ = false;

/**
 * An HTMLAudioElement object that plays a dummy sound.
 * @type {HTMLAudioElement}
 * @private
 */
createjs.WebAudioPlugin.audio_ = null;

/**
 * The AudioContext instance internally used by this plug-in.
 * @type {AudioContext}
 * @private
 */
createjs.WebAudioPlugin.context_ = null;

/**
 * The node that plays an empty sound.
 * @type {AudioBufferSourceNode}
 * @private
 */
createjs.WebAudioPlugin.source_ = null;

/**
 * The 1-sample audio buffer representing an empty sound.
 * @type {AudioBuffer}
 * @private
 */
createjs.WebAudioPlugin.buffer_ = null;

/**
 * Called when a user touches the host window. This method resumes the
 * progression of the AudioContext object used by this plug-in when it is
 * suspended.
 * @param {Event} event
 * @private
 */
createjs.WebAudioPlugin.handleTouch_ = function(event) {
  /// <param type="Event" name="event"/>
  // Stop listening the input event to avoid adding two listeners or more.
  createjs.global.removeEventListener(
      event.type, createjs.WebAudioPlugin.handleTouch_, false);

  // Use the currentTime property (instead of using the state property) for
  // backward compatibility.
  var context = createjs.WebAudioPlugin.context_;
  if (!context.currentTime) {
    // Resume the progression of the AudioContext object used by this plug-in on
    // iOS 10+ and on Chrome 49+.
    if (context.resume) {
      context.resume();
    }
    // Re-play all sounds played by the AudioContext object on Android. Chrome
    // for Android (55 or later) does not resume the sounds played by an
    // AudioContext object on resume <http://crbug.com/614115> as Mobile Safari
    // does.
    if (!createjs.UserAgent.isIPhone()) {
      createjs.Sound.resume();
    }
    // Play an empty sound to resume the AudioContext object on browsers that
    // do not have the AudioContext.prototype.resume() method.
    createjs.WebAudioPlugin.playEmptySound_();
  }
};

/**
 * Called when the watchdog timer expires.
 * @private
 */
createjs.WebAudioPlugin.handleTimeout_ = function() {
  var context = createjs.WebAudioPlugin.context_;
  if (!context.currentTime) {
    // Choose the user-action event that re-plays an empty sound. Chrome and
    // Mobile Safari on iOS 9.0 have to use 'touchend' events due to WebKit
    // Bug 149367 <http://webkit.org/b/149367>.
    var event;
    if (createjs.UserAgent.isIPhone() && createjs.UserAgent.getVersion() != 9) {
      event = 'touchstart';
    } else {
      event = 'touchend';
    }
    createjs.global.addEventListener(
        event, createjs.WebAudioPlugin.handleTouch_, false);
  }
};

/**
 * Plays an empty sound to activate the AudioContext object used by this
 * plug-in only if the AudioContext object needs to.
 * @private
 */
createjs.WebAudioPlugin.playEmptySound_ = function() {
  // Play an empty sound and start a watchdog timer only when this AudioContext
  // object does not have the state property, i.e. when the AudioContext object
  // does not have the resume() method. (Calling the resume() method is more
  // trustworthy than playing an empty sound.)
  var context = createjs.WebAudioPlugin.context_;
  if (!context.state) {
    var source = context.createBufferSource();
    source.buffer = createjs.WebAudioPlugin.buffer_;
    if (source.start) {
      source.start(0);
    } else {
      source.noteOn(0);
    }
    setTimeout(createjs.WebAudioPlugin.handleTimeout_, 100);
  }
};

/**
 * Retrieves the audio context.
 * @return {AudioContext} context
 * @private
 */
createjs.WebAudioPlugin.getContext_ = function() {
  /// <returns type="AudioContext"/>
  if (!createjs.WebAudioPlugin.initialized_) {
    createjs.WebAudioPlugin.initialized_ = true;
    if (createjs.AudioContext) {
      var context = new createjs.AudioContext();
      createjs.WebAudioPlugin.context_ = context;
      createjs.WebAudioPlugin.buffer_ = context.createBuffer(1, 1, 22500);
      if (!context.state) {
        // This AudioContext object does not have the state property. Play an
        // empty sound to activate it.
        createjs.WebAudioPlugin.playEmptySound_();
      } else if (context.state != 'running') {
        // Listen a user-action when this AudioContext object is not running,
        // i.e. it needs a user action to play sounds.
        createjs.WebAudioPlugin.handleTimeout_();
      }
    }
  }
  return createjs.WebAudioPlugin.context_;
};

/**
 * Resets this plug-in to its initial state.
 * @private
 */
createjs.WebAudioPlugin.reset_ = function() {
  createjs.WebAudioPlugin.stopEmptySound_();
  createjs.WebAudioPlugin.audio_ = null;
  createjs.WebAudioPlugin.context_ = null;
  createjs.WebAudioPlugin.initialized_ = false;
};

/**
 * Stops playing an empty sound. This method stops playing an empty sound played
 * by the 'createjs.WebAudioPlugin.playEmptySound()' method and destroys all its
 * resources.
 * @private
 */
createjs.WebAudioPlugin.stopEmptySound_ = function() {
  var source = createjs.WebAudioPlugin.source_;
  if (source) {
    if (source.stop) {
      source.stop(0);
    } else {
      source.noteOff(0);
    }
    source.disconnect(0);
    createjs.WebAudioPlugin.source_ = null;
  }
};

/**
 * Plays an empty sound. This method is a dummy method used only for backward
 * compatibility.
 * @const
 */
createjs.WebAudioPlugin.playEmptySound = function() {
  createjs.WebAudioPlugin.getContext_();
};

// Export the createjs.WebAudioPlugin object to the global namespace.
createjs.exportObject('createjs.WebAudioPlugin', createjs.WebAudioPlugin, {
}, {
  'playEmptySound': createjs.WebAudioPlugin.playEmptySound
});

/**
 * The base class that plays audio.
 * @param {createjs.Loader.Item} item
 * @extends {createjs.EventDispatcher}
 * @implements {createjs.Loader.Item.Listener}
 * @constructor
 */
createjs.Sound.Player = function(item) {
  /// <param type="cretejs.Loader.Item" name="item"/>
  /**
   * The loader item provided by the createjs.LoadQueue class.
   * @type {createjs.Loader.Item}
   * @protected
   */
  this.item = item;
};
createjs.inherits(
    'Sound.Player', createjs.Sound.Player, createjs.EventDispatcher);

/**
 * @enum {number}
 * @private
 */
createjs.Sound.Player.Event = {
  CANPLAY: 1 << 0,
  SEEKED: 1 << 1,
  ENDED: 1 << 2,
  TOUCH: 1 << 3
};

/**
 * The current state of this player.
 * @type {number}
 */
createjs.Sound.Player.prototype['playState'] = createjs.Sound.PLAY_FAILED;

/**
 * The loader item provided by the createjs.LoadQueue class.
 * @type {createjs.Loader.Item}
 * @protected
 */
createjs.Sound.Player.prototype.item = null;

/**
 * Whether this player repeats playing a sound portion.
 * @type {number}
 * @protected
 */
createjs.Sound.Player.prototype.loop = 0;

/**
 * The start position of a sound portion to be played by this player in seconds.
 * @type {number}
 * @protected
 */
createjs.Sound.Player.prototype.offset = 0;

/**
 * The duration of a sound portion to be played by this player in seconds.
 * (This value is not always equal to the duration of the sound.)
 * @type {number}
 * @protected
 */
createjs.Sound.Player.prototype.duration = 0;

/**
 * The volume for this sound player.
 * @type {number}
 * @protected
 */
createjs.Sound.Player.prototype.volume = 1;

/**
 * Plays audio. This method initializes internal variables and decodes audio
 * data. Even though the createjs.Loader object preloads audio data, this player
 * may wait until a browser finishes decoding it, i.e. this method does not
 * always plays audio immediately.
 * @param {number} interrupt
 * @param {number} delay
 * @param {number} offset
 * @param {number} loop
 * @param {number} volume
 * @param {number} pan
 * @private
 */
createjs.Sound.Player.prototype.play_ =
    function(interrupt, delay, offset, loop, volume, pan) {
  /// <param type="number" name="interrupt"/>
  /// <param type="number" name="delay"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="loop"/>
  /// <param type="number" name="volume"/>
  /// <param type="number" name="pan"/>
  if (loop != null) {
    this.loop = loop;
  }
  if (offset >= 0) {
    this.offset = offset;
  }
  if (volume != null) {
    this.volume = volume;
  }
  this['playState'] = createjs.Sound.PLAY_SUCCEEDED;
};

/**
 * Stops playing audio.
 * @private
 */
createjs.Sound.Player.prototype.stop_ = function() {
  this['playState'] = createjs.Sound.PLAY_FINISHED;
};

/**
 * Sets the mute state.
 * @param {boolean} mute
 * @private
 */
createjs.Sound.Player.prototype.setMute_ = function(mute) {
  /// <param type="boolean" name="mute"/>
};

/**
 * Sets the sound volume.
 * @param {number} volume
 * @private
 */
createjs.Sound.Player.prototype.setVolume_ = function(volume) {
  /// <param type="number" name="volume"/>
};

/**
 * Initializes this sound as an audio sprite.
 * @param {string} id
 * @param {number} offset
 * @param {number} duration
 * @private
 */
createjs.Sound.Player.prototype.setSprite_ = function(id, offset, duration) {
  /// <param type="string" name="id"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="duration"/>
};

/**
 * Resumes playing the sound associated with this player.
 */
createjs.Sound.Player.prototype.resume_ = function() {
};

/** @override */
createjs.Sound.Player.prototype.handleLoad = function(loader, buffer) {
  /// <param type="createjs.Loader" name="loader"/>
  /// <param type="ArrayBuffer" name="buffer"/>
  return true;
};

// Export the methods used by applications.
createjs.Sound.Player.prototype['play'] = createjs.notImplemented;
createjs.Sound.Player.prototype['stop'] = createjs.notImplemented;
createjs.Sound.Player.prototype['setMute'] = createjs.notImplemented;
createjs.Sound.Player.prototype['setVolume'] = createjs.notImplemented;

/**
 * A class that implements the createjs.Sound.Player interface with the
 * HTMLAudioElement interface.
 * @param {createjs.Loader.Item} item
 * @extends {createjs.Sound.Player}
 * @implements {EventListener}
 * @constructor
 */
createjs.Sound.HTMLAudioPlayer = function(item) {
  /// <param type="cretejs.Loader.Item" name="item"/>
  createjs.Sound.Player.call(this, item);
};
createjs.inherits('Sound.HTMLAudioPlayer',
                  createjs.Sound.HTMLAudioPlayer,
                  createjs.Sound.Player);

/**
 * @type {number}
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.mask_ = 0;

/**
 * @type {boolean}
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.paused_ = true;

/**
 * The timer ID. This value tells this player has already set a timer.
 * @type {number}
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.timer_ = 0;

/**
 * Starts listening an event from the specified HTMLAudioElement object.
 * @param {EventTarget} audio
 * @param {string} type
 * @param {number} id
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.listen_ = function(audio, type, id) {
  /// <param type="EventTarget" name="audio"/>
  /// <param type="string" name="type"/>
  /// <param type="number" name="id"/>
  if (!(this.mask_ & id)) {
    audio.addEventListener(type, this, false);
    this.mask_ |= id;
  }
};

/**
 * Stops listening an event from the specified HTMLAudioElement object.
 * @param {EventTarget} audio
 * @param {string} type
 * @param {number} id
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.unlisten_ = function(audio, type, id) {
  /// <param type="EventTarget" name="audio"/>
  /// <param type="string" name="type"/>
  /// <param type="number" name="id"/>
  audio.removeEventListener(type, this, false);
  this.mask_ &= ~id;
};

/**
 * Called when the hosting browser finishes playing this sound.
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.handleEnded_ = function() {
  this.timer_ = 0;
  this.stop_();
  this.dispatchNotification('complete');
};

/**
 * Starts playing audio.
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.start_ = function() {
  createjs.assert(!!this.item);
  if (!this.paused_) {
    return;
  }
  createjs.log('HTMLAudio: play ' + this.item.id);
  var audio = /** @type {HTMLAudioElement} */ (this.item.resultObject);
  // Some Android 4.4 WebViews (e.g. Softbank 302SH) stops playing a sound
  // without dispatching an 'ended' event when the 'loop' property is true. To
  // repeat a sound on such devices, this method always set false to the 'loop'
  // property to false and re-start playing when this player receives an 'ended'
  // event.
  if (createjs.FALSE) {
    audio.loop = !!this.loop;
  }
  // Set a timer to stop this sound when it expires. (The HTMLAudioElement
  // class cannot change its duration and this player has to use a timer to
  // stop it manually.)
  if (!this.loop && this.duration) {
    if (this.offset) {
      audio.currentTime = this.offset;
    }
    if (this.timer_) {
      clearTimeout(this.timer_);
    }
    this.timer_ = setTimeout(this.handleEnded_.bind(this), this.duration);
  }
  var volume = this.volume;
  if (volume != 1) {
    audio.volume = volume;
  }
  this.listen_(audio, 'ended', createjs.Sound.Player.Event.ENDED);
  audio.play();

  // Add a touch-event listener to the Window object and replay this BGM again
  // if the browser fails playing it.
  this.paused_ = audio.paused;
  if (this.paused_ && this.loop) {
    this.listen_(window, 'touchstart', createjs.Sound.Player.Event.TOUCH);
  }
};

/**
 * Adds the specified HTMLAudioElement object to the DOM tree.
 * @param {HTMLAudioElement} audio
 * @private
 */
createjs.Sound.HTMLAudioPlayer.prototype.appendChild_ = function(audio) {
  /// <param type="HTMLAudioElement" name="audio"/>
  if (!audio.parentNode) {
    document.body.appendChild(audio);
  }
};

/** @override */
createjs.Sound.HTMLAudioPlayer.prototype.play_ =
    function(interrupt, delay, offset, loop, volume, pan) {
  /// <param type="number" name="interrupt"/>
  /// <param type="number" name="delay"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="loop"/>
  /// <param type="number" name="volume"/>
  /// <param type="number" name="pan"/>
  if (!this.paused_) {
    return;
  }
  createjs.Sound.HTMLAudioPlayer.superClass_.play_.call(
      this, interrupt, delay, offset, loop, volume, pan);
  var audio = /** @type {HTMLAudioElement} */ (this.item.resultObject);
  createjs.assert(!!audio);
  this.appendChild_(audio);
  // Wait until the specified audio becomes ready to play when it is not.
  // Otherwise, play the audio now.
  var HAVE_NOTHING = 0;
  var HAVE_METADATA = 1;
  var HAVE_CURRENT_DATA = 2;
  var HAVE_FUTURE_DATA = 3;
  var HAVE_ENOUGH_DATA = 4;
  if (audio.readyState != HAVE_ENOUGH_DATA) {
    createjs.log('HTMLAudio: load ' + this.item.id);
    this.listen_(audio, 'canplay', createjs.Sound.Player.Event.CANPLAY);
    audio.preload = 'auto';
    audio.load();
  } else {
    this.start_();
  }
};

/** @override */
createjs.Sound.HTMLAudioPlayer.prototype.stop_ = function() {
  createjs.assert(!!this.item);
  createjs.log('HTMLAudio: stop ' + this.item.id);
  var audio = /** @type {HTMLAudioElement} */ (this.item.resultObject);
  audio.pause();
  var parent = audio.parentNode;
  if (parent) {
    parent.removeChild(audio);
  }
  this.unlisten_(audio, 'canplay', createjs.Sound.Player.Event.CANPLAY);
  this.unlisten_(audio, 'ended', createjs.Sound.Player.Event.ENDED);
  this.unlisten_(window, 'touchstart', createjs.Sound.Player.Event.TOUCH);
  this.paused_ = true;
  createjs.Sound.HTMLAudioPlayer.superClass_.stop_.call(this);
};

/** @override */
createjs.Sound.HTMLAudioPlayer.prototype.setMute_ = function(mute) {
  /// <param type="boolean" name="mute"/>
  if (this.item) {
    var audio = /** @type {HTMLAudioElement} */ (this.item.resultObject);
    audio.mute = mute;
  }
};

/** @override */
createjs.Sound.HTMLAudioPlayer.prototype.setVolume_ = function(volume) {
  /// <param type="number" name="volume"/>
  if (this.item && this.volume != volume) {
    this.volume = volume;
    var audio = /** @type {HTMLAudioElement} */ (this.item.resultObject);
    audio.volume = volume;
  }
};

/** @override */
createjs.Sound.HTMLAudioPlayer.prototype.setSprite_ =
    function(id, offset, duration) {
  /// <param type="string" name="id"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="duration"/>
  // This player uses the specified offset to set the 'currentTime' property
  // and the specified duration to call a 'setTimeout()' function, i.e. the
  // offset should be in seconds and the duration should be in milliseconds.
  this.offset = offset * 0.001;
  this.duration = duration;
};

/** @override */
createjs.Sound.HTMLAudioPlayer.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  var type = event.type;
  var audio = event.target;
  createjs.log('HTMLAudio: event ' + this.item.id + ',' + type);
  if (type == 'canplay') {
    this.unlisten_(audio, type, createjs.Sound.Player.Event.CANPLAY);
    this.start_();
  } else if (type == 'ended') {
    if (this.loop) {
      audio.play();
    } else {
      this.stop_();
    }
  } else if (type == 'touchstart') {
    this.unlisten_(window, type, createjs.Sound.Player.Event.TOUCH);
    this.start_();
  }
};

// Export overridden methods.
createjs.Sound.HTMLAudioPlayer.prototype['play'] =
    createjs.Sound.HTMLAudioPlayer.prototype.play_;
createjs.Sound.HTMLAudioPlayer.prototype['stop'] =
    createjs.Sound.HTMLAudioPlayer.prototype.stop_;
createjs.Sound.HTMLAudioPlayer.prototype['setMute'] =
    createjs.Sound.HTMLAudioPlayer.prototype.setMute_;
createjs.Sound.HTMLAudioPlayer.prototype['setVolume'] =
    createjs.Sound.HTMLAudioPlayer.prototype.setVolume_;

/**
 * A class that implements the createjs.Sound.Player interface with the WebAudio
 * API without using HTMLAudioElement objects. This player needs to decode ALL
 * audio data before playing it and it takes more memory than other players.
 * @param {createjs.Loader.Item} item
 * @extends {createjs.Sound.Player}
 * @constructor
 */
createjs.Sound.BufferAudioPlayer = function(item) {
  /// <param type="cretejs.Loader.Item" name="item"/>
  createjs.Sound.Player.call(this, item);
};
createjs.inherits('Sound.BufferAudioPlayer',
                  createjs.Sound.BufferAudioPlayer,
                  createjs.Sound.Player);

if (createjs.USE_FRAME) {
  /**
   * An inner class that encapsulates an <iframe> element used for decoding
   * audio data.
   * @implements {EventListener}
   * @constructor
   */
  createjs.Sound.BufferAudioPlayer.Frame = function () {
    var frame =
        /** @type {HTMLIFrameElement} */ (document.createElement('iframe'));
    frame.id = 'cjs-iframe';
    var style = frame.style;
    style.zIndex = -1;
    style.position = 'absolute';
    style.border = '0px';
    style.top = '0px';
    style.left = '0px';
    style.width = '1px';
    style.height = '1px';
    createjs.global.addEventListener('message', this, false);
    if (!createjs.DEBUG) {
      frame.src =
          createjs.Sound.BufferAudioPlayer.Frame.HEADER_ +
          createjs.Sound.BufferAudioPlayer.Frame.SOURCE_MIN_ +
          createjs.Sound.BufferAudioPlayer.Frame.FOOTER_;
    } else {
      frame.src =
          createjs.Sound.BufferAudioPlayer.Frame.HEADER_ +
          createjs.Sound.BufferAudioPlayer.Frame.SOURCE_DEBUG_ +
          createjs.Sound.BufferAudioPlayer.Frame.FOOTER_;
    }
    document.body.appendChild(frame);

    /**
     * @type {HTMLIFrameElement}
     * @private
     */
    this.frame_ = frame;

    /**
     * @type {Array.<Object>}
     * @private
     */
    this.messages_ = [];

    /**
     * @type {Object.<string,createjs.Sound.BufferAudioPlayer>}
     * @private
     */
    this.players_ = {};
  };

  /**
   * The header of the source URL loaded by this <iframe> element.
   * @const {string}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.HEADER_ =
    'data:text/html,' +
    '<html style="-webkit-user-select:none;">' +
    '<head>' +
    '<script type="text/javascript">';

  /**
   * The header of the source URL loaded by this <iframe> element.
   * @const {string}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.FOOTER_ =
    '</script>' +
    '</head>' +
    '<body>' +
    '</body>' +
    '</html>';

  /**
   * The optimized source code of this <iframe> element.
   * @const {string}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.SOURCE_MIN_ =
    'var e=window,f=e.webkitAudioContext||e.AudioContext,g=null,h=null;func' +
    'tion k(){this.e={}}function l(a,b){this.h=a;this.g=b}l.prototype.e=nul' +
    'l;l.prototype.f=function(a){this.e=a;for(var b=[],d=0;d<a.numberOfChan' +
    'nels;++d)b.push(a.getChannelData(d));this.g.postMessage({a:6,b:this.h,' +
    'c:a.sampleRate,d:b},"*")};k.prototype.handleEvent=function(a){if("mess' +
    'age"==a.type){var b=a.data,d=b.b;if(0==b.a){var c=this.e[d];c?(c.g=a.s' +
    'ource,c.f(c.e)):(c=new l(d,a.source),this.e[d]=c,a=c.f.bind(c),g.decod' +
    'eAudioData(b.c,a,a))}}};e.onload=function(){g=new f;h=new k;e.addEvent' +
    'Listener("message",h,!1);e.parent.postMessage({a:4},"*")};';

  /**
   * The source code of this <iframe> element used for debug.
   * @const {string}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.SOURCE_DEBUG_ =
    'var e=window,f=e.webkitAudioContext||e.AudioContext,g=null,h=null;func' +
    'tion k(){this.e={}}function l(a,b){this.g=a;this.h=b}l.prototype.e=nul' +
    'l;l.prototype.f=function(a){console.debug("decode="+this.g);this.e=a;f' +
    'or(var b=[],c=0;c<a.numberOfChannels;++c)b.push(a.getChannelData(c));t' +
    'his.h.postMessage({a:6,b:this.g,c:a.sampleRate,d:b},"*")};k.prototype.' +
    'handleEvent=function(a){if("message"==a.type){var b=a.data,c=b.b;if(0=' +
    '=b.a){console.debug("load="+c);var d=this.e[c];d?(d.h=a.source,d.f(d.e' +
    ')):(d=new l(c,a.source),this.e[c]=d,a=d.f.bind(d),g.decodeAudioData(b.' +
    'c,a,a))}}};e.onload=function(){g=new f;h=new k;e.addEventListener("mes' +
    'sage",h,!1);e.parent.postMessage({a:4},"*")};';

  /**
   * The <iframe> element that decodes audio data.
   * @type {HTMLIFrameElement}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.prototype.frame_ = null;

  /**
   * The messages queued to this frame. An <iframe> element drops messages
   * until it finishes loading a page, i.e. this frame cannot send messages
   * until it receives an INITIALIZE command. This array temporarily saves
   * messages until the <iframe> element becomes ready to receive them.
   * @type {Array.<Object>}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.prototype.messages_ = null;

  /**
   * The mapping table from a resource ID to a BufferAudioPlayer object. This
   * table is used for dispatching messages received from the <iframe>
   * element to BufferAudioPlayer objects.
   * @type {Object.<string,createjs.Sound.BufferAudioPlayer>}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.Frame.prototype.players_ = null;

  /**
   * Loads the specified sound and decodes it.
   * @param {string} id
   * @param {ArrayBuffer} buffer
   * @param {createjs.Sound.BufferAudioPlayer} player
   * @param {boolean} complete
   * @return {boolean}
   * @const
   */
  createjs.Sound.BufferAudioPlayer.Frame.prototype.load =
      function(id, buffer, player, complete) {
    /// <param type="string" name="id"/>
    /// <param type="ArrayBuffer" name="buffer"/>
    /// <param type="createjs.Sound.BufferAudioPlayer" name="player"/>
    /// <param type="boolean" name="complete"/>
    /// <returns type="boolean"/>
    if (this.players_[id]) {
      return true;
    }
    this.players_[id] = player;
    var message = {
      'a': createjs.FrameCommand.LOAD,
      'b': id,
      'c': buffer
    };
    if (this.messages_) {
      this.messages_.push(message);
    } else {
      var window = this.frame_.contentWindow;
      if (window) {
        window.postMessage(message, '*');
      }
    }
    return complete;
  };

  /** @override */
  createjs.Sound.BufferAudioPlayer.Frame.prototype.handleEvent =
      function(event) {
    /// <param type="MessageEvent" name="event"/>
    var data = /** @type {Object} */ (/** @type{*} */ (event.data));
    var command = /** @type {number} */ (data['a']);
    if (command == createjs.FrameCommand.INITIALIZE) {
      // This message is an INITIALIZE message, i.e. the <iframe> element
      // becomes ready to receive messages. This message consists of one field
      // listed below.
      //   +-----+--------+-------------+
      //   | key | type   | value       |
      //   +-----+--------+-------------+
      //   | a   | number | Command (4) |
      //   +-----+--------+-------------+
      // Dispatch the queued messages to the <iframe> element.
      if (this.messages_) {
        var window = this.frame_.contentWindow;
        if (window) {
          for (var i = 0; i < this.messages_.length; ++i) {
            window.postMessage(this.messages_[i], '*');
          }
        }
        this.messages_ = null;
      }
    } else if (command == createjs.FrameCommand.DECODE) {
      // This message is a DECODE message, i.e. the <iframe> element has
      // finished decoding audio data. This message consists of four fields
      // listed below.
      //   +-----+----------------------+-----------------------------------+
      //   | key | type                 | value                             |
      //   +-----+----------------------+-----------------------------------+
      //   | a   | number               | Command (6)                       |
      //   | b   | string               | Player ID                         |
      //   | c   | number               | Frequency                         |
      //   | d   | Array.<Float32Array> | PCM data associated with channels |
      //   +-----+----------------------+-----------------------------------+
      // Create an AudioBuffer object from the input data and dispatch it to the
      // specified player.
      var id = /** @type {string} */ (data['b']);
      var player = this.players_[id];
      if (player) {
        var frequency = /** @type {number} */ (data['c']);
        var channels = /** @type {Array.<Float32Array>} */ (data['d']);
        var buffer = createjs.WebAudioPlugin.buffer_;
        if (channels.length >= 1) {
          var length = channels[0].length;
          var context = createjs.WebAudioPlugin.getContext_();
          buffer = context.createBuffer(channels.length, length, frequency);
          for (var i = 0; i < channels.length; ++i) {
            buffer.getChannelData(i).set(channels[i]);
          }
        }
        player.handleDecode_(buffer);
      }
    }
  };

  /**
   * The instance of an <iframe> element that decodes sounds.
   * @type {createjs.Sound.BufferAudioPlayer.Frame}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.frame_ = null;

  /**
   * Retrieves the global BufferAudioPlayer object.
   * @return {createjs.Sound.BufferAudioPlayer.Frame}
   * @private
   */
  createjs.Sound.BufferAudioPlayer.getFrame_ = function() {
    /// <returns type="createjs.Sound.BufferAudioPlayer.Frame"/>
    if (!createjs.Sound.BufferAudioPlayer.frame_) {
      createjs.Sound.BufferAudioPlayer.frame_ =
          new createjs.Sound.BufferAudioPlayer.Frame();
    }
    return createjs.Sound.BufferAudioPlayer.frame_;
  };
}

/**
 * The source node that plays audio with this player.
 * @type {AudioBufferSourceNode}
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.source_ = null;

/**
 * The gain node that changes the volume of this player.
 * @type {GainNode}
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.gain_ = null;

/**
 * The createjs.Loader object that waits for this object to decode data.
 * @type {createjs.Loader}
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.loader_ = null;

/**
 * Whether this sound should be played when the browser finishes decoding it.
 * (A game may send a play request for this sound while the browser is decoding
 * it.)
 * @type {number}
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.auto_ = 0;

/**
 * Called when the hosting browser finishes playing this sound.
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.handleEnded_ = function() {
  this.stop_();
  this.dispatchNotification('complete');
};

/**
 * Plays decoded audio.
 * @param {AudioBuffer} buffer
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.playAudioBuffer_ = function(buffer) {
  /// <param type="AudioBuffer" name="buffer"/>
  // Add the following audio graph to the destination node. (This class
  // multiplies the master volume to the audio volume to connect the gain node
  // directly to the destination.)
  //   +---------------+   +------+   +-------------+
  //   | buffer source |-->| gain |-->| destination |
  //   +---------------+   +------+   +-------------+
  createjs.log('WebAudio: play ' + this.item.id);
  var context = createjs.WebAudioPlugin.getContext_();
  var gain =
      context.createGain ? context.createGain() : context.createGainNode();
  gain.connect(context.destination);
  gain.gain.value = this.volume;
  this.gain_ = gain;

  var source = context.createBufferSource();
  source.connect(gain);
  source.buffer = buffer;
  if (this.loop) {
    source.loop = true;
    if (source.start) {
      source.start(0);
    } else {
      source.noteOn(0);
    }
  } else {
    source.onended = this.handleEnded_.bind(this);
    if (source.start) {
      source.start(0, this.offset, this.duration);
    } else {
      source.noteGrainOn(0, this.offset, this.duration);
    }
  }
  this.source_ = source;
};

/**
 * Called when the AudioContext class finishes decoding sound data.
 * @param {AudioBuffer} buffer
 * @private
 */
createjs.Sound.BufferAudioPlayer.prototype.handleDecode_ = function(buffer) {
  /// <param type="AudioBuffer" name="buffer"/>
  this.duration = buffer.duration;
  this.item.resultObject = buffer;
  if (this.loader_) {
    this.loader_.sendFileComplete(!buffer, buffer);
    this.loader_ = null;
  }
  if (this.auto_) {
    this.playAudioBuffer_(buffer);
    this.auto_ = 0;
  }
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.play_ =
    function(interrupt, delay, offset, loop, volume, pan) {
  /// <param type="number" name="interrupt"/>
  /// <param type="number" name="delay"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="loop"/>
  /// <param type="number" name="volume"/>
  /// <param type="number" name="pan"/>
  createjs.Sound.BufferAudioPlayer.superClass_.play_.call(
      this, interrupt, delay, offset, loop, volume, pan);
  if (!this.item.resultObject) {
    // A browser does not finish decoding this sound. Play this sound when a
    // browser finishes decoding it.
    this.auto_ = 1;
    return;
  }
  if (this.source_) {
    this.stop_();
  }
  this.playAudioBuffer_(/** @type {AudioBuffer} */ (this.item.resultObject));
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.stop_ = function() {
  createjs.Sound.BufferAudioPlayer.superClass_.stop_.call(this);
  this.auto_ = 0;
  var source = this.source_;
  if (source) {
    createjs.log('WebAudio: stop ' + this.item.id);
    // Read the 'playbackState' property if this AudioBufferSourceNode has it
    // and check if its value is 3 (FINISHED_STATE). This code is a workaround
    // for "InvalidStateError" exceptions on older browsers (e.g. SC-02F) whose
    // AudioBufferSourceNode interface does not have the onended property.
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
    // Chrome and Firefox, i.e. this code  must be executed only on Mobile
    // Safari.)
    if (createjs.UserAgent.isIPhone()) {
      if (!createjs.WebAudioPlugin.buffer_) {
        var context = createjs.WebAudioPlugin.getContext_();
        createjs.WebAudioPlugin.buffer_ = context.createBuffer(1, 1, 22500);
      }
      this.source_.buffer = createjs.WebAudioPlugin.buffer_;
    }
    this.source_ = null;
    this.gain_.disconnect(0);
    this.gain_ = null;
  }
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.setMute_ = function(mute) {
  /// <param type="boolean" name="mute"/>
  if (this.gain_) {
    if (mute) {
      this.gain_.gain.value = 0;
    } else {
      this.gain_.gain.value = this.volume;
    }
  }
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.setVolume_ = function(volume) {
  /// <param type="number" name="volume"/>
  if (this.volume != volume) {
    this.volume = volume;
    if (this.gain_) {
      this.gain_.gain.value = volume;
    }
  }
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.setSprite_ =
    function(id, offset, duration) {
  /// <param type="string" name="id"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="duration"/>
  this.offset = offset * 0.001;
  this.duration = duration * 0.001;
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.resume_ = function() {
  if (this.source_) {
    this.stop_();
    this.playAudioBuffer_(/** @type {AudioBuffer} */ (this.item.resultObject));
  }
};

/** @override */
createjs.Sound.BufferAudioPlayer.prototype.handleLoad =
    function(loader, buffer) {
  /// <param type="createjs.Loader" name="loader"/>
  /// <param type="ArrayBuffer" name="buffer"/>
  if (buffer) {
    var context = createjs.WebAudioPlugin.getContext_();
    if (createjs.USE_FRAME) {
      // Dispatch this audio data to the <iframe> element to decode it there.
      if (createjs.Config.useFrame()) {
        var frame = createjs.Sound.BufferAudioPlayer.getFrame_();
        var complete =
            frame.load(this.item.id, buffer, this, !this.item.isSynchronous());
        if (!complete) {
          this.loader_ = loader;
        }
        return complete;
      }
    }
    var handleDecode =
        createjs.Sound.BufferAudioPlayer.prototype.handleDecode_.bind(this);
    context.decodeAudioData(
        buffer, handleDecode, /** @type {function()} */ (handleDecode));
    if (this.item.isSynchronous()) {
      this.loader_ = loader;
      return false;
    }
  }
  return true;
};

// Export overridden methods.
createjs.Sound.BufferAudioPlayer.prototype['play'] =
    createjs.Sound.BufferAudioPlayer.prototype.play_;
createjs.Sound.BufferAudioPlayer.prototype['stop'] =
    createjs.Sound.BufferAudioPlayer.prototype.stop_;
createjs.Sound.BufferAudioPlayer.prototype['setMute'] =
    createjs.Sound.BufferAudioPlayer.prototype.setMute_;
createjs.Sound.BufferAudioPlayer.prototype['setVolume'] =
    createjs.Sound.BufferAudioPlayer.prototype.setVolume_;

/**
 * A class that intermediates a createjs.LoadQueue object and a createjs.Sound
 * object.
 * @implements {createjs.LoadQueue.Listener}
 * @constructor
 */
createjs.Sound.Proxy = function() {
};

/** @override */
createjs.Sound.Proxy.prototype.handleFileStart = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  if (item.isSound()) {
    var player = createjs.Sound.getInstance_().addPlayer_(item);
    item.setListener(player);
  }
};

/** @override */
createjs.Sound.Proxy.prototype.handleFileComplete = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <returns type="boolean"/>
  return !!createjs.Sound.getInstance_().getPlayer_(item.id);
};

/**
 * Creates an available player.
 * @param {createjs.Loader.Item} item
 * @return {createjs.Sound.Player}
 * @private
 */
createjs.Sound.prototype.createPlayer_ = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <returns type="createjs.Sound.Player"/>
  var context = createjs.WebAudioPlugin.getContext_();
  if (context) {
    return new createjs.Sound.BufferAudioPlayer(item);
  }
  createjs.assert(!createjs.UserAgent.isIPhone());
  return new createjs.Sound.HTMLAudioPlayer(item);
};

/**
 * Creates a sound player for the specified item and adds it to this object.
 * @param {createjs.Loader.Item} item
 * @return {createjs.Sound.Player}
 * @private
 */
createjs.Sound.prototype.addPlayer_ = function(item) {
  /// <param type="createjs.Loader.Item" name="item"/>
  /// <returns type="createjs.Sound.Player"/>
  var source = item.getSource();
  var player = this.players_[source];
  if (!player) {
    player = this.createPlayer_(item);
    this.players_[source] = player;
    if (item.id != source) {
      this.players_[item.id] = player;
    }
  }
  return player;
};

/**
 * Retrieves a preloaded item.
 * @param {string} key
 * @return {createjs.Sound.Player}
 * @private
 */
createjs.Sound.prototype.getPlayer_ = function(key) {
  /// <param type="string" name="key"/>
  /// <returns type="createjs.Sound.Player"/>
  return this.players_[key];
};

/**
 * Retrieves the capabilities of the active plug-in,
 * @return {Object}
 * @private
 */
createjs.Sound.prototype.getCapabilities_ = function() {
  /// <returns ype="Object"/>
  return this.capabilities_;
};

/**
 * Returns a specific capability of the active plugin.
 * @param {string} key
 * @return {number}
 */
createjs.Sound.prototype.getCapability_ = function(key) {
  /// <param type="string" name="key"/>
  /// <returns type="number"/>
  return this.capabilities_[key] || 0;
};

/**
 * Returns the source source from the specified ID.
 * @param {string} id
 * @return {string}
 * @private
 */
createjs.Sound.prototype.getSourceById_ = function(id) {
  /// <param type="string" name="id"/>
  /// <returns type="string"/>
  return '';
};

/**
 * Registers an audio file for loading.
 * @param {string} source
 * @param {Object} data
 * @private
 */
createjs.Sound.prototype.registerSound_ = function(source, data) {
  /// <param type="string" name="source"/>
  /// <param type="Object" name="data"/>
  var player = this.getPlayer_(source);
  var audioSprite = createjs.getArray(data['audioSprite']);
  if (player && audioSprite) {
    for (var i = 0; i < audioSprite.length; ++i) {
      // Create a clone of the source player and update its offset and
      // duration. The createjs.Sound.registerSound() method uses the number
      // milliseconds both for the 'startTime' property and for the 'duration'
      // property. Players should convert their values to their preferable
      // formats.)
      var sprite = audioSprite[i];
      var id = createjs.getString(sprite['id']);
      var startTime = createjs.getNumber(sprite['startTime']);
      var duration = createjs.getNumber(sprite['duration']);
      var clone = this.createPlayer_(player.item);
      clone.setSprite_(id, startTime, duration);
      this.players_[id] = clone;
    }
  }
};

/**
 * Removes a sound from this object.
 * @param {string} key
 * @param {string} basePath
 * @return {boolean}
 * @private
 */
createjs.Sound.prototype.removeSound_ = function(key, basePath) {
  /// <param type="string" name="key"/>
  /// <param type="string" name="basePath"/>
  /// <returns type="boolean"/>
  var player = this.getPlayer_(key);
  if (!player) {
    return false;
  }
  player.stop_();
  var item = player.item;
  var source = item.getSource();
  this.players_[source] = null;
  if (item.id != source) {
    this.players_[item.id] = null;
  }
  return true;
};

/**
 * Removes all sounds.
 * @private
 */
createjs.Sound.prototype.removeAllSounds_ = function() {
  createjs.notImplemented();
};

/**
 * Returns whether a source file has been loaded by this object.
 * @param {string} source
 * @return {boolean}
 * @private
 */
createjs.Sound.prototype.loadComplete_ = function(source) {
  /// <param type="string" name="source"/>
  /// <returns type="boolean"/>
  return false;
};

/**
 * Creates a new sound instance.
 * @param {string} source
 * @param {number=} opt_startTime
 * @param {number=} opt_duration
 * @return {createjs.Sound.Player}
 * @private
 */
createjs.Sound.prototype.createInstance_ =
    function(source, opt_startTime, opt_duration) {
  /// <param type="string" name="source"/>
  /// <param type="number" optional="true" name="opt_startTime"/>
  /// <param type="number" optional="true" name="opt_duration"/>
  /// <returns type="createjs.Sound.Player"/>
  return this.getPlayer_(source);
};

/**
 * Plays a sound file.
 * @param {string} source
 * @param {number} interrupt
 * @param {number} delay
 * @param {number} offset
 * @param {number} loop
 * @param {number} volume
 * @param {number} pan
 * @private
 */
createjs.Sound.prototype.play_ =
    function(source, interrupt, delay, offset, loop, volume, pan) {
  /// <param type="string" name="source"/>
  /// <param type="number" name="interrupt"/>
  /// <param type="number" name="delay"/>
  /// <param type="number" name="offset"/>
  /// <param type="number" name="loop"/>
  /// <param type="number" name="volume"/>
  /// <param type="number" name="pan"/>
  var player = this.createInstance_(source);
  if (player) {
    player.play_(0, delay, offset, loop, volume, pan);
  }
};

/**
 * Sets the master volume.
 * @param {number} volume
 * @private
 */
createjs.Sound.prototype.setVolume_ = function(volume) {
  /// <param type="number" name="volume"/>
};

/**
 * Gets the master volume.
 * @return {number}
 * @private
 */
createjs.Sound.prototype.getVolume_ = function() {
  /// <returns type="number"/>
  return 1;
};

/**
 * Sets the mute state.
 * @param {boolean} value
 * @return {boolean}
 * @private
 */
createjs.Sound.prototype.setMute_ = function(value) {
  /// <param type="boolean" name="value"/>
  /// <returns type="boolean"/>
  for (var key in this.players_) {
    var player = this.players_[key];
    if (player) {
      player.setMute_(value);
    }
  }
  return true;
};

/**
 * Returns the current mute state.
 * @return {boolean}
 * @private
 */
createjs.Sound.prototype.getMute_ = function() {
  /// <returns type="boolean"/>
  return false;
};

/**
 * Stops playing all audio.
 * @private
 */
createjs.Sound.prototype.stop_ = function() {
};

/**
 * Registers a plug-in.
 * @param {Object} plugin
 * @return {boolean}
 */
createjs.Sound.registerPlugin = function(plugin) {
  /// <param type="Object" name="plugin"/>
  /// <returns type="boolean"/>
  return false;
};

/**
 * Registers plug-ins.
 * @param {Array} plugins
 * @return {boolean}
 */
createjs.Sound.registerPlugins = function(plugins) {
  /// <param type="Array" elementType="Object" name="plugins"/>
  /// <returns type="boolean"/>
  return false;
};

/**
 * Returns whether there is at least one listener for the specified event type.
 * @return {createjs.Sound.Plugin}
 */
createjs.Sound.getActivePlugin = function() {
  /// <returns type="createjs.WebAudioPlugin"/>
  if (createjs.AudioContext) {
    return new createjs.WebAudioPlugin();
  }
  return new createjs.HTMLAudioPlugin();
};

/**
 * Initializes the default plug-ins.
 * @return {boolean}
 */
createjs.Sound.initializeDefaultPlugins = function() {
  /// <returns type="boolean"/>
  return true;
};

/**
 * Returns whether this module can play sound.
 * @return {boolean}
 */
createjs.Sound.isReady = function() {
  /// <returns type="boolean"/>
  return true;
};

/**
 * Creates a new sound instance.
 * @param {string} source
 * @return {createjs.Sound.Player}
 */
createjs.Sound.createInstance = function(source) {
  /// <param type="string" name="source"/>
  /// <returns type="createjs.Sound.Player"/>
  return createjs.Sound.getInstance_().createInstance_(source);
};

/**
 * Creates audio sprites from an audio file and registers them. This method
 * creates audio sprites from an audio file (loaded by a LoadQueue object) so
 * a game can play a part of the audio file as listed in the following snippet.
 *   var queue = new createjs.LoadQueue();
 *   queue.on('complete', function() {
 *     createjs.Sound.registerSound('http://server/audio.m4a', '', {
 *       audioSprite: [
 *         { id: 'sound1', startTime: 0, duration: 500 },
 *         { id: 'sound2', startTime: 1000, duration: 400 },
 *         { id: 'sound3', startTime: 1700, duration: 1000 }
 *       }
 *     );
 *   });
 *   queue.loadFile({ src: 'http://server/audio.m4a' });
 * @param {string|Object} source
 * @param {string=} opt_id
 * @param {number|Object=} opt_data
 * @param {boolean=} opt_preload
 * @param {string=} opt_basePath
 */
createjs.Sound.registerSound =
    function(source, opt_id, opt_data, opt_preload, opt_basePath) {
  /// <param type="string" name="source"/>
  /// <param type="string" optional="true" name="opt_id"/>
  /// <param type="number" optional="true" name="opt_data"/>
  /// <param type="boolean" optional="true" name="opt_preload">
  /// <param type="string" optional="true" name="opt_basePath"/>
  var id = opt_id || createjs.getString(source);
  createjs.Sound.getInstance_().registerSound_(
      id, createjs.getObject(opt_data));
};

/**
 * Creates audio sprites from audio files and registers them.
 *   createjs.Sound.registerSounds([{
 *     src: 'http://server/audio.m4a',
 *     data: {
 *       audioSprite: [
 *         { id: 'sound1', startTime: 0, duration: 500 },
 *         { id: 'sound2', startTime: 1000, duration: 400 },
 *         { id: 'sound3', startTime: 1700, duration: 1000 }
 *       ]
 *     }
 *   }]);
 * @param {Array.<Object>} sources
 * @param {string=} opt_basePath
 */
createjs.Sound.registerSounds = function(sources, opt_basePath) {
  for (var i = 0; i < sources.length; ++i) {
    var source = sources[i];
    createjs.Sound.registerSound(source['src'], '', source['data']);
  }
};

/**
 * Registers a manifest of audio files for loading.
 * @param {Array} manifest
 * @param {string} basePath
 * @return {Array.<Object>}
 */
createjs.Sound.registerManifest = function(manifest, basePath) {
  /// <param type="Array" elementType="Object" name="manifest"/>
  /// <param type="string" name="basePath"/>
  /// <returns type="Array"/>
  var values = [];
  var length = manifest.length;
  for (var i = 0; i < length; ++i) {
    var item = manifest[i];
    values.push(createjs.Sound.registerSound(
        item['src'], item['id'], item['data'], item['preload'], basePath));
  }
  return values;
};

/**
 * Removes a sound.
 * @param {string|Object} src
 * @param {string} basePath
 * @return {boolean}
 */
createjs.Sound.removeSound = function(src, basePath) {
  /// <param type="string" name="src"/>
  /// <param type="string" name="basePath"/>
  /// <returns type="boolean"/>
  var instance = createjs.Sound.getInstance_();
  if (createjs.isObject(src)) {
    var item = createjs.getObject(src);
    return instance.removeSound_(createjs.getString(item['src']), basePath);
  }
  return instance.removeSound_(createjs.getString(src), basePath);
};

/**
 * Removes all sound files in a manifest.
 * @param {Array.<Object>} manifest
 * @param {string} basePath
 * @return {Array.<boolean>}
 */
createjs.Sound.removeManifest = function(manifest, basePath) {
  /// <param type="Array" elementType="Object" name="manifest"/>
  /// <param type="string" name="basePath"/>
  /// <returns type="Array"/>
  var instance = createjs.Sound.getInstance_();
  var returnValues = [];
  var length = manifest.length;
  for (var i = 0; i < length; ++i) {
    var item = createjs.getObject(manifest[i]);
    returnValues[i] = instance.removeSound_(item['src'], basePath);
  }
  return returnValues;
};

/**
 * Removes all sounds registered to this object.
 */
createjs.Sound.removeAllSounds = function() {
  return createjs.Sound.getInstance_().removeAllSounds_();
};

/**
 * Returns whether a source has been loaded.
 * @param {string} source
 * @return {boolean}
 */
createjs.Sound.prototype.loadComplete = function(source) {
  /// <param type="string" name="source"/>
  /// <returns type="boolean"/>
  return createjs.Sound.getInstance_().loadComplete_(source);
};

/**
 * Resets the global variables used by this class and the inner classes in this
 * file.
 * @param {number=} opt_destroy
 * @const
 */
createjs.Sound.reset = function(opt_destroy) {
  /// <param type="number" optional="true" name="opt_destroy"/>
  if (opt_destroy) {
    var instance = createjs.Sound.getInstance_();
    for (var key in instance.players_) {
      var player = instance.players_[key];
      if (player) {
        player.stop_();
      }
    }
    createjs.WebAudioPlugin.reset_();
  }
};

/**
 * Resumes playing all sounds played by this context.
 * @const
 */
createjs.Sound.resume = function() {
  var instance = createjs.Sound.getInstance_();
  for (var key in instance.players_) {
    var player = instance.players_[key];
    if (player) {
      player.resume_();
    }
  }
};

/**
 * Plays a sound.
 * @param {string} source
 * @param {string|Object} value
 * @param {number=} opt_delay
 * @param {number=} opt_offset
 * @param {number=} opt_loop
 * @param {number=} opt_volume
 * @param {number=} opt_pan
 * @static
 */
createjs.Sound.play = function(source,
                               value,
                               opt_delay,
                               opt_offset,
                               opt_loop,
                               opt_volume,
                               opt_pan) {
  /// <param type="string" name="source"/>
  /// <param type="string" name="value"/>
  /// <param type="number" optional="true" name="opt_delay"/>
  /// <param type="number" optional="true" name="opt_offset"/>
  /// <param type="number" optional="true" name="opt_loop"/>
  /// <param type="number" optional="true" name="opt_volume"/>
  /// <param type="number" optional="true" name="opt_pan"/>
  if (value != null && createjs.isObject(value)) {
    var options = createjs.getObject(value);
    value = options['interrupt'];
    opt_delay = options['delay'];
    opt_offset = options['offset'];
    opt_loop = options['loop'];
    opt_volume = options['volume'];
    opt_pan = options['pan'];
  }
  var interrupt = createjs.Sound.INTERRUPT_NONE;
  if (createjs.isString(value)) {
    var key = createjs.getString(value);
    var INTERRUPTS = {
      'any': createjs.Sound.INTERRUPT_ANY,
      'early': createjs.Sound.INTERRUPT_EARLY,
      'late': createjs.Sound.INTERRUPT_LATE,
      'none': createjs.Sound.INTERRUPT_NONE
    };
    interrupt = INTERRUPTS[key] || createjs.Sound.INTERRUPT_NONE;
  }
  var delay = opt_delay || 0;
  var offset = opt_offset || 0;
  var loop = opt_loop || 0;
  var volume = (opt_volume == null) ? 1 : createjs.getNumber(opt_volume);
  var pan = opt_pan || 0;
  createjs.Sound.getInstance_().play_(
      source, interrupt, delay, offset, loop, volume, pan);
};

/**
 * Sets the master volume.
 * @param {number} value
 * @static
 */
createjs.Sound.setVolume = function(value) {
  /// <param type="number" name="volume"/>
  value = createjs.max(0, createjs.min(1, value));
  return createjs.Sound.getInstance_().setVolume_(value);
};

/**
 * Returns the master volume.
 * @return {number}
 * @static
 */
createjs.Sound.getVolume = function() {
  /// <returns type="number"/>
  return createjs.Sound.getInstance_().getVolume_();
};

/**
 * Mutes/Unmutes all audio.
 * @param {boolean} value
 * @return {boolean}
 */
createjs.Sound.setMute = function(value) {
  /// <param type="boolean" name="value"/>
  /// <returns type="boolean"/>
  createjs.assert(value != null);
  return createjs.Sound.getInstance_().setMute_(value);
};

/**
 * Returns the mute status.
 * @return {boolean}
 */
createjs.Sound.getMute = function() {
  /// <returns type="boolean"/>
  return createjs.Sound.getInstance_().getMute_();
};

/**
 * Stops all audio (global stop)
 */
createjs.Sound.stop = function() {
  return createjs.Sound.getInstance_().stop_();
};

/**
 * Adds an event listener.
 * @param {string} type
 * @param {Function|Object} listener
 * @param {boolean=} opt_useCapture
 * @return {Function|Object}
 */
createjs.Sound.addListener = function(type, listener, opt_useCapture) {
  /// <param type="string" name="type"/>
  /// <param type="Function" name="listener"/>
  /// <param type="boolean" optional="true" name="opt_useCapture"/>
  /// <returns type="Function"/>
  var instance = createjs.Sound.getInstance_();
  return instance.on(type, listener);
};

/**
 * Removes the specified event listener.
 * @param {string} type
 * @param {Function|Object} listener
 * @param {boolean=} opt_useCapture
 */
createjs.Sound.removeListener = function(type, listener, opt_useCapture) {
  /// <param type="string" name="type"/>
  /// <param type="Function" name="listener"/>
  /// <param type="boolean" optional="true" name="opt_useCapture"/>
  var instance = createjs.Sound.getInstance_();
  instance.off(type, listener);
};

/**
 * Removes all listeners for the specified type, or all listeners of all types.
 * @param {string=} opt_type
 */
createjs.Sound.removeAllListeners = function(opt_type) {
  /// <param type="string" optional="true" name="opt_type"/>
  var instance = createjs.Sound.getInstance_();
  instance.removeAllListeners(opt_type || '');
};

/**
 * Dispatches the specified event to all listeners.
 * @param {Object|string|Event} event
 * @param {Object=} opt_target
 * @return {boolean}
 */
createjs.Sound.dispatch = function(event, opt_target) {
  /// <param type="Object" name="event"/>
  /// <param type="Object" optional="true" name="opt_target"/>
  /// <returns type="boolean"/>
  var instance = createjs.Sound.getInstance_();
  return instance.dispatch(event, opt_target || null);
};

/**
 * Returns whether there is at least one listener for the specified event type.
 * @param {string} type
 * @return {boolean}
 */
createjs.Sound.hasListener = function(type) {
  /// <param type="string" name="type"/>
  /// <returns type="boolean"/>
  var instance = createjs.Sound.getInstance_();
  return instance.hasListener(type);
};

/**
 * A table of exported functions.
 * @const {Object}
 */
createjs.Sound.exports = createjs.exportStatic('createjs.Sound', {
  'INTERRUPT_ANY': createjs.Sound.INTERRUPT_ANY,
  'INTERRUPT_EARLY': createjs.Sound.INTERRUPT_EARLY,
  'INTERRUPT_LATE': createjs.Sound.INTERRUPT_LATE,
  'INTERRUPT_NONE': createjs.Sound.INTERRUPT_NONE,
  'PLAY_SUCCEEDED': createjs.Sound.PLAY_SUCCEEDED,
  'PLAY_FINISHED': createjs.Sound.PLAY_FINISHED,
  'PLAY_FAILED': createjs.Sound.PLAY_FAILED,
  'activePlugin': createjs.Sound.getActivePlugin(),
  'initializeDefaultPlugins': createjs.Sound.initializeDefaultPlugins,
  'isReady': createjs.Sound.isReady,
  'createInstance': createjs.Sound.createInstance,
  'registerSound': createjs.Sound.registerSound,
  'registerSounds': createjs.Sound.registerSounds,
  'removeSound': createjs.Sound.removeSound,
  'play': createjs.Sound.play,
  'addEventListener': createjs.Sound.addListener,
  'removeEventListener': createjs.Sound.removeListener,
  'removeAllEventListeners': createjs.Sound.removeAllListeners,
  'dispatchEvent': createjs.Sound.dispatch,
  'hasEventListener': createjs.Sound.hasListener,
  'setMute': createjs.Sound.setMute,
  'setVolume': createjs.Sound.setVolume
});
