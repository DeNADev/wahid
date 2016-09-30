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

describe('Sound', function() {
  it('createjs.Sound should be exported.', function() {
    expect('Sound' in createjs).toBeTruthy();
  });

  describe('Sound properies', function() {
    it('INTERRUPT_ANY should be exported.', function() {
      expect('INTERRUPT_ANY' in createjs.Sound).toBeTruthy();
    });
    it('INTERRUPT_EARLY should be exported.', function() {
      expect('INTERRUPT_EARLY' in createjs.Sound).toBeTruthy();
    });
    it('INTERRUPT_LATE should be exported.', function() {
      expect('INTERRUPT_LATE' in createjs.Sound).toBeTruthy();
    });
    it('INTERRUPT_NONE should be exported.', function() {
      expect('INTERRUPT_NONE' in createjs.Sound).toBeTruthy();
    });
    it('PLAY_INITED should be masked.', function() {
      expect('PLAY_INITED' in createjs.Sound).toBeFalsy();
    });
    it('PLAY_SUCCEEDED should be exported.', function() {
      expect('PLAY_SUCCEEDED' in createjs.Sound).toBeTruthy();
    });
    it('PLAY_INTERRUPTED should be masked.', function() {
      expect('PLAY_INTERRUPTED' in createjs.Sound).toBeFalsy();
    });
    it('PLAY_FINISHED should be exported.', function() {
      expect('PLAY_FINISHED' in createjs.Sound).toBeTruthy();
    });
    it('PLAY_FAILED should be exported.', function() {
      expect('PLAY_FAILED' in createjs.Sound).toBeTruthy();
    });
    it('activePlugin should be exported.', function() {
      expect('activePlugin' in createjs.Sound).toBeTruthy();
    });
    it('alternativeExtensions should be masked.', function() {
      expect('alternativeExtensions' in createjs.Sound).toBeFalsy();
    });
    it('defaultInterruptBehaviour should be masked.', function() {
      expect('defaultInterruptBehaviour' in createjs.Sound).toBeFalsy();
    });
    it('EXTENSION_MAP should be masked.', function() {
      expect('EXTENSION_MAP' in createjs.Sound).toBeFalsy();
    });
    it('SUPPORTED_EXTENSIONS should be masked.', function() {
      expect('SUPPORTED_EXTENSIONS' in createjs.Sound).toBeFalsy();
    });
  });

  describe('Sound methods', function() {
    var soundUrl = 'http://localhost:8080/assets/sound1.mp4';
    var soundId = 'sound';
    var sound2Url = 'http://localhost:8080/assets/sound2.mp4';
    var sound2Id = 'sound2';
    // For registerSound: opt_data is not optional.
    var optData = {
      audioSprite: [{id:'sound', startTime:0, duration:15000}]
    };

    var queue;
    beforeEach(function(done) {
      queue = new createjs.LoadQueue(true, '', 'Anonymous');
      queue.on('complete', function() {
        done();
      });
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.loadManifest([{src: soundUrl, id: soundId},
                          {src: sound2Url, id: sound2Id}], true);
    });

    afterEach(function() {
      createjs.Sound.removeAllEventListeners();
      if(createjs.Sound.removeAllSounds) {
        createjs.Sound.removeAllSounds();
      }
      queue.removeAll();
    });

    it('initializeDefaultPlugins should returns true.', function() {
      // This method has blank body.
      expect(createjs.Sound.initializeDefaultPlugins()).toBeTruthy();
    });
    it('isReady always returns true.', function() {
      expect(createjs.Sound.isReady()).toBeTruthy();
    });
    it('createInstance should work.', function() {
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      var instance = createjs.Sound.createInstance(soundId);
      expect(instance).not.toBeNull();
      expect(instance).not.toBeUndefined();
    });
    it('removeSound should work.', function() {
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      var result = createjs.Sound.removeSound(soundId);
      expect(result).toBeTruthy();
      var instance = createjs.Sound.createInstance(soundId);
      expect(instance).toBeNull();
    });
    it('play should work.', function() {
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      // Sound.play() returns nothing.
      // So we call Sonud.createInstance() to get the player instance.
      createjs.Sound.play(soundUrl);
      var instance = createjs.Sound.createInstance(soundUrl);
      expect(instance).toBeTruthy();
      expect(instance.playState).toEqual(createjs.Sound.PLAY_SUCCEEDED);
      instance.stop();
      expect(instance.playState).toEqual(createjs.Sound.PLAY_FINISHED);
    });
    it('addEventListener should work.', function(done) {
      createjs.Sound.addEventListener('fileload', function(event) {
        expect(true).toBeTruthy();
        done();
      });
      createjs.Sound.dispatchEvent('fileload');
    });
    it('removeEventListener should work.', function(done) {
      var finished = false;
      var listener = function(event) {
        finished = true;
        expect(true).not.toBeTruthy();
        done();
      };
      createjs.Sound.addEventListener('fileload', listener);
      createjs.Sound.removeEventListener('fileload', listener);
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      setTimeout(function() {
        if (!finished) {
          expect(true).toBeTruthy();
          done();
        }
      }, 500);
    });
    it('removeAllEventListeners should work.', function(done) {
      var finished = false;
      var listener = function(event) {
        expect(true).not.toBeTruthy();
        finished = true;
        done();
      };
      createjs.Sound.addEventListener('fileload', listener);
      createjs.Sound.removeAllEventListeners('fileload');
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      setTimeout(function() {
        if (!finished) {
          expect(true).toBeTruthy();
          done();
        }
      }, 500);
    });
    it('dispatchEvent should work.', function(done) {
      createjs.Sound.addEventListener('fileload', function(event) {
        expect(true).toBeTruthy();
        done();
      });
      createjs.Sound.dispatchEvent('fileload');
    });
    it('hasEventListener should work.', function() {
      expect(createjs.Sound.hasEventListener('fileload')).toBeFalsy();
      createjs.Sound.addEventListener('fileload', function(event) {
      });
      expect(createjs.Sound.hasEventListener('fileload')).toBeTruthy();
    });
    it('setMute should work.', function() {
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      createjs.Sound.play(soundUrl);
      var instance = createjs.Sound.createInstance(soundUrl);
      expect(instance).toBeTruthy();
      instance.setMute(true);
      // We cannot fetch the mute status.
      // Skip testing this case with Wahid.
      //expect(instance.getMute()).toBeTruthy();
      instance.setMute(false);
      //expect(instance.getMute()).toBeFalsy();
    });
    it('setVolume should work.', function() {
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      createjs.Sound.play(soundUrl);
      var instance = createjs.Sound.createInstance(soundUrl);
      expect(instance).toBeTruthy();
      instance.setVolume(1.0);
      // We cannot fetch the volume status.
      // Skip testing this case with Wahid.
      //expect(instance.getVolume()).toEqual(1.0);
      instance.setVolume(0.5);
      //expect(instance.getVolume()).toEqual(0.5);
    });
    it('getCapabilities should be masked.', function() {
      expect('getCapabilities' in createjs.Sound).toBeFalsy();
    });
    it('getCapability should be masked.', function() {
      expect('getCapability' in createjs.Sound).toBeFalsy();
    });
    it('getMute should be masked.', function() {
      expect('getMute' in createjs.Sound).toBeFalsy();
    });
    it('getVolume should be masked.', function() {
      expect('getVolume' in createjs.Sound).toBeFalsy();
    });
    it('registerManifest should be masked.', function() {
      expect('registerManifest' in createjs.Sound).toBeFalsy();
    });
    it('registerPlugins should be masked.', function() {
      expect('registerPlugins' in createjs.Sound).toBeFalsy();
    });
    it('registerSound should work.', function() {
      createjs.Sound.registerSound(soundUrl, soundId, optData);
      expect(createjs.Sound.createInstance(soundUrl)).toBeTruthy();
    });
    it('removeAllSounds should be masked.', function() {
      expect('removeAllSounds' in createjs.Sound).toBeFalsy();
    });
    it('removeManifest should be masked.', function() {
      expect('removeManifest' in createjs.Sound).toBeFalsy();
    });
    it('stop should be masked.', function() {
      expect('stop' in createjs.Sound).toBeFalsy();
    });
    it('loadComplete should be masked.', function() {
      expect('loadComplete' in createjs.Sound).toBeFalsy();
    });
  });
});

describe('HTMLAudioPlugin', function() {
  var plugin;
  beforeEach(function() {
    plugin = new createjs.HTMLAudioPlugin();
  });

  it('createjs.HTMLAudioPlugin should be exported.', function() {
    expect('HTMLAudioPlugin' in createjs).toBeTruthy();
  });
  it('HTMLAudioPlugin should be able to create instance.', function() {
    expect(plugin).not.toBeNull();
  });

  describe('HTMLAudioPlugin properies', function() {
    it('enableIOS should be exported.', function() {
      expect('enableIOS' in createjs.HTMLAudioPlugin).toBeTruthy();
    });
    it('defaultNumChannels should be masked.', function() {
      expect('defaultNumChannels' in plugin).toBeFalsy();
    });
    it('MAX_INSTANCES should be exported.', function() {
      expect('MAX_INSTANCES' in plugin).toBeFalsy();
    });
  });

  describe('HTMLAudioPlugin methods', function() {
    it('create should be masked.', function() {
      expect('create' in plugin).toBeFalsy();
    });
    it('isPreloadStarted should be masked.', function() {
      expect('isPreloadStarted' in plugin).toBeFalsy();
    });
    it('isSupported should be masked.', function() {
      expect('isSupported' in plugin).toBeFalsy();
    });
    it('preload should be masked.', function() {
      expect('preload' in plugin).toBeFalsy();
    });
    it('register should be masked.', function() {
      expect('register' in plugin).toBeFalsy();
    });
    it('removeAllSounds should be masked.', function() {
      expect('removeAllSounds' in plugin).toBeFalsy();
    });
    it('removeSound should be masked.', function() {
      expect('removeSound' in plugin).toBeFalsy();
    });
  });
});

describe('WebAudioPlugin', function() {
  var plugin;
  beforeEach(function() {
    plugin = new createjs.WebAudioPlugin();
  });

  it('createjs.WebAudioPlugin should be exported.', function() {
    expect('WebAudioPlugin' in createjs).toBeTruthy();
  });
  it('WebAudioPlugin should be able to create instance.', function() {
    expect(plugin).not.toBeNull();
  });

  describe('WebAudioPlugin properies', function() {
    it('context should be exported.', function() {
      expect('context' in createjs.WebAudioPlugin).toBeTruthy();
    });
    it('dynamicCompressorNode should be masked.', function() {
      expect('dynamicCompressorNode' in plugin).toBeFalsy();
    });
    it('gainNode should be masked.', function() {
      expect('gainNode' in plugin).toBeFalsy();
    });
  });

  describe('WebAudioPlugin methods', function() {
    it('playEmptySound should work.', function() {
      // It's hard to test this with this framework...
      createjs.WebAudioPlugin.playEmptySound();
      // if there is no error, it's ok.
      expect(true).toBeTruthy();
    });
    it('addPreloadResults should be masked.', function() {
      expect('addPreloadResults' in plugin).toBeFalsy();
    });
    it('create should be masked.', function() {
      expect('create' in plugin).toBeFalsy();
    });
    it('getVolume should be masked.', function() {
      expect('getVolume' in plugin).toBeFalsy();
    });
    it('isPreloadComplete should be masked.', function() {
      expect('isPreloadComplete' in plugin).toBeFalsy();
    });
    it('isPreloadStarted should be masked.', function() {
      expect('isPreloadStarted' in plugin).toBeFalsy();
    });
    it('isSupported should be masked.', function() {
      expect('isSupported' in plugin).toBeFalsy();
    });
    it('preload should be masked.', function() {
      expect('preload' in plugin).toBeFalsy();
    });
    it('register should be masked.', function() {
      expect('register' in plugin).toBeFalsy();
    });
    it('removeAllSounds should be masked.', function() {
      expect('removeAllSounds' in plugin).toBeFalsy();
    });
    it('removeSound should be masked.', function() {
      expect('removeSound' in plugin).toBeFalsy();
    });
    it('setMute should be masked.', function() {
      expect('setMute' in plugin).toBeFalsy();
    });
    it('setVolume should be masked.', function() {
      expect('setVolume' in plugin).toBeFalsy();
    });
  });
});
