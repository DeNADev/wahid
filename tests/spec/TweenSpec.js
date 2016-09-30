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

describe('Timeline', function() {
  var timeline;
  beforeEach(function() {
    timeline = new createjs.Timeline([]);
  });

  it('createjs.Timeline should be exported.', function() {
    expect('Timeline' in createjs).toBeTruthy();
  });
  it('Timeline should be able to create instance.', function() {
    expect(timeline).not.toBeNull();
  });

  describe('Timeline properies', function() {
    it('duration should be exported.', function() {
      expect('duration' in timeline).toBeTruthy();
    });
    it('ignoreGlobalPause should be masked.', function() {
      expect('ignoreGlobalPause' in timeline).toBeFalsy();
    });
    it('loop should be masked.', function() {
      expect('loop' in timeline).toBeFalsy();
    });
    it('position should be masked.', function() {
      expect('position' in timeline).toBeFalsy();
    });
  });

  describe('Timeline methods', function() {
    it('addTween should work.', function() {
      var tween = createjs.Tween.get({});
      timeline.addTween(tween);
      if (timeline.tweens_) {
        expect(timeline.tweens_.length).toEqual(1);
      } else {
        expect(true).toBeTruthy();
      }
    });
    it('removeTween should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('addLabel should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('setLabels should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('getLabels should NOT work.', function() {
      timeline.setLabels({
        start: 10,
        end: 20
      });
      expect(timeline.getLabels()).toBeNull();
    });
    it('getCurrentLabel should NOT work.', function() {
      expect(timeline.getCurrentLabel()).toEqual('');
    });
    it('setPaused should work.', function() {
      timeline.setPaused(true);
      if (timeline.paused_) {
        expect(timeline.paused_).toBeTruthy();
      } else {
        expect(true).toBeTruthy();
      }
      timeline.setPaused(false);
      if (timeline.paused_) {
        expect(timeline.paused_).toBeFalsy();
      } else {
        expect(true).toBeTruthy();
      }
    });
    it('gotoAndPlay should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('gotoAndStop should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('resolve should be masked.', function() {
      expect('resolve' in timeline).toBeFalsy();
    });
    it('setPosition should be masked.', function() {
      expect('setPosition' in timeline).toBeFalsy();
    });
    it('tick should be masked.', function() {
      expect('tick' in timeline).toBeFalsy();
    });
    it('update should be masked.', function() {
      expect('update' in timeline).toBeFalsy();
    });
  });
});

describe('Tween', function() {
  it('createjs.Tween should be exported.', function() {
    expect('Tween' in createjs).toBeTruthy();
  });
  it('Tween should be able to create instance.', function() {
    var tween = new createjs.Tween();
    expect(tween).not.toBeNull();
  });

  describe('Tween properies', function() {
    var tween;
    beforeEach(function() {
      tween = createjs.Tween.get({});
    });

    it('target should be exported.', function() {
      expect('target' in tween).toBeTruthy();
    });
    it('duration should be exported.', function() {
      expect('duration' in tween).toBeTruthy();
    });
    it('position should be exported.', function() {
      expect('position' in tween).toBeTruthy();
    });
    it('IGNORE should be masked.', function() {
      expect('IGNORE' in tween).toBeFalsy();
    });
    it('IgnoreGlobalPause should be masked.', function() {
      expect('IgnoreGlobalPause' in tween).toBeFalsy();
    });
    it('LOOP should be masked.', function() {
      expect('LOOP' in tween).toBeFalsy();
    });
    it('loop should be masked.', function() {
      expect('loop' in tween).toBeFalsy();
    });
    it('NONE should be masked.', function() {
      expect('NONE' in tween).toBeFalsy();
    });
    it('passive should be masked.', function() {
      expect('passive' in tween).toBeFalsy();
    });
    it('pluginData should be masked.', function() {
      expect('pluginData' in tween).toBeFalsy();
    });
    it('REVERSE should be masked.', function() {
      expect('REVERSE' in tween).toBeFalsy();
    });
  });

  describe('Tween methods', function() {
    var target;
    var props;
    var stage;
    var mc;
    beforeEach(function() {
      // Using Stage-MovieClip-Child tree is the safe way to use Wahid-Tween.
      var canvas = document.getElementById('testcanvas');
      stage = new createjs.Stage(canvas);
      mc = new createjs.MovieClip(null, 0, true, {});
      target = new createjs.Shape();
      mc.addChild(target);
      stage.addChild(mc);
      createjs.Ticker.addEventListener('tick', stage);

      props = {
        useTicks: true
      };
    });
    afterEach(function() {
      stage.removeChild(mc);
      mc.removeChild(target);
      createjs.Ticker.removeEventListener('tick', stage);
			this.resetTick();
    });
    it('setPaused should work.', function(done) {
      target.x = 0;
      var props = {
        useTicks: true
      };
      var finished = false;
      var tween = createjs.Tween.get(target, props);
      tween.to({x: 100}, 10).call(function() {
        if (!finished) {
          fail("something wrong...");
          done();
        }
      });

      // play -> pause
      var prev;
      var counter = 0;
      tween.setPaused(false);
      var handleTick = function() {
        if (counter == 1) {
          prev = target.x;
        } else if (counter == 2) {
          expect(target.x).toBeGreaterThan(prev);
          prev = target.x;
          tween.setPaused(true);
        } else if (counter == 3){
          expect(target.x).toEqual(prev);
          createjs.Ticker.removeEventListener('tick', handleTick);
          finished = true;
          done();
        }
        ++counter;
      }
      createjs.Ticker.addEventListener('tick', handleTick);
    });
    it('wait should work.', function(done) {
      var frameCount = 0;
      var handleTick = function() {
        ++frameCount;
      }
      createjs.Ticker.addEventListener('tick', handleTick);
      var tween = createjs.Tween.get(target, props);
      tween.wait(10).call(function() {
        expect(frameCount).not.toBeLessThan(10);
        createjs.Ticker.removeEventListener('tick', handleTick);
        done();
      });
    });
    it('to should work.', function(done) {
      target.x = 0;
      var props = {
        useTicks: true
      };
      var tween = createjs.Tween.get(target, props);
      tween
      .to({x: 100}, 10)
      .call(function() {
        expect(target.x).toEqual(100);
        done();
      });
    });
    it('call should work.', function(done) {
      createjs.Tween.get(target).call(function() {
        expect(true).toBeTruthy();
        done();
      });
    });
    it('set should NOT work.', function(done) {
      target.x = 0;
      target.y = 100;
      var props = {
        useTicks: true
      };
      var tween = createjs.Tween.get(target, props);
      tween.set({
        x: 123,
        y: 321
      }).call(function() {
        expect(target.x).not.toEqual(123);
        expect(target.y).not.toEqual(321);
        done();
      });
    });
    it('play should work.', function(done) {
      target.x = 0;
      target.y = 0;
      var props = {
        useTicks: true
      };
      props.paused = true;
      var other = createjs.Tween.get(target, props);
      other.to({y:100}, 10).call(function() {
        expect(target.x).toEqual(100);
        expect(target.y).toEqual(100);
        done();
      });

      // x:0, y:0 => x:100, y:0 => x:100, y:100 => done.
      props.paused = false;
      var tween = createjs.Tween.get(target, props);
      tween.to({x:100}, 10).call(function() {
        expect(target.x).toEqual(100);
        expect(target.y).toEqual(0);
      }).play(other);
    });
    it('pause should work.', function(done) {
      target.x = 0;
      target.y = 0;
      var props = {
        useTicks: true
      };
      var tween = createjs.Tween.get(target, props);
      tween.to({x:100}, 10).pause().to({y:100}, 10);
      var counter = 0;
      var pausedX;
      var handleTick = function() {
        if (counter == 1) {
          pausedX = target.x;
        } if (counter == 10) {
          expect(target.x).toEqual(pausedX);
          createjs.Ticker.removeEventListener('tick', handleTick);
          done();
        }
        if (target.x == 100) {
          ++counter;
        }
      }
      createjs.Ticker.addEventListener('tick', handleTick);
    });
    it('setPosition should work.', function(done) {
      target.x = 0;
      var props = {
        useTicks: true
      };
      var tween = createjs.Tween.get(target, props);
      tween.to({x:100}, 10);

      var counter = 0;
      var handleTick = function() {
        if (counter == 0) {
          expect(target.x).toBeLessThan(100);
          tween.setPosition(10);
        } else {
          expect(target.x).toEqual(100);
          createjs.Ticker.removeEventListener('tick', handleTick);
          done();
        }
        ++counter;
      }
      createjs.Ticker.addEventListener('tick', handleTick);
    });
    it('w should be the alias of wait.', function() {
      var tween = createjs.Tween.get({});
      expect(tween.w).toBe(tween.wait);
    });
    it('t should be the alias of to.', function() {
      var tween = createjs.Tween.get({});
      expect(tween.t).toBe(tween.to);
    });
    it('c should be the alias of call.', function() {
      var tween = createjs.Tween.get({});
      expect(tween.c).toBe(tween.call);
    });
    it('s should be the alias of set.', function() {
      var tween = createjs.Tween.get({});
      expect(tween.s).toBe(tween.set);
    });
    it('get should work.', function() {
      var tween = createjs.Tween.get(target);
      expect(tween).not.toBeNull();
    });
    it('removeTweens should work.', function() {
      createjs.Tween.get(target).wait(1);
      createjs.Tween.get(target).wait(2);
      createjs.Tween.removeTweens(target);
      expect(createjs.Tween.hasActiveTweens(target)).toBeFalsy();
    });
    it('removeAllTweens should NOT work.', function() {
      var targetA = target;
      var targetB = new createjs.Shape();
      createjs.Tween.get(targetA).wait(1);
      createjs.Tween.get(targetB).wait(2);
      createjs.Tween.removeAllTweens();
      expect(createjs.Tween.hasActiveTweens(targetA)).toBeTruthy();
      expect(createjs.Tween.hasActiveTweens(targetB)).toBeTruthy();
    });
    it('hasActiveTweens should work.', function() {
      expect(createjs.Tween.hasActiveTweens(target)).toBeFalsy();
      createjs.Tween.get(target).wait(1);
      expect(createjs.Tween.hasActiveTweens(target)).toBeTruthy();
    });
    it('installPlugin should NOT work.', function() {
      // This is an empty implementation.
      expect('installPlugin' in createjs.Tween).toBeTruthy();
    });
    it('tick should be masked.', function() {
      expect('tick' in createjs.Tween).toBeFalsy();
    });
  });
});

describe('Ease', function() {
  beforeEach(function() {
  });
  afterEach(function() {
    createjs.Tween.removeAllTweens();
  });

  it('createjs.Ease should be exported.', function() {
    expect('Ease' in createjs).toBeTruthy();
  });

  describe('Ease methods', function() {
    afterEach(function() {
      createjs.Tween.removeAllTweens();
      // createjs.Ticker.reset(); //TODO
    });
    var checkTable = function(ease, table, done) {

      // With Wahid, Tween should be used with DisplayObject and Stage.
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      var mc = new createjs.MovieClip(null, 0, true, {
        start: 0
      });
      stage.addChild(mc);

      var target = new createjs.Shape();
      target.x = 0;

      var props = {
        useTicks: true,
        position: 1,
        loop: false,
        paused: false
      };

      var tween = createjs.Tween.get(target, props);
      tween.to({x: 1}, 10, ease);

      mc.timeline.addTween(tween);
      mc.play();

      // Tick manually.
      var i = 0;
      var handleTick = function(event) {
        stage.update();
        //console.log(i, tween.position, target.x);
        expect(target.x).toAlmostEqual(table[tween.position - 1], 0.001);
        if (++i > 10) {
          stage.removeAllChildren();
          createjs.Tween.removeAllTweens();
          createjs.Ticker.removeEventListener('tick', handleTick);
          done();
        }
      }
      createjs.Ticker.addEventListener('tick', handleTick);
    };
    it('backIn should be masked.', function() {
      expect('backIn' in createjs.Ease).toBeFalsy();
    });
    it('backInOut should be masked.', function() {
      expect('backInOut' in createjs.Ease).toBeFalsy();
    });
    it('backOut should be masked.', function() {
      expect('backOut' in createjs.Ease).toBeFalsy();
    });
    it('bounceIn should be masked.', function() {
      expect('bounceIn' in createjs.Ease).toBeFalsy();
    });
    it('bounceInOut should be masked.', function() {
      expect('bounceInOut' in createjs.Ease).toBeFalsy();
    });
    it('bounceOut should be masked.', function() {
      expect('bounceOut' in createjs.Ease).toBeFalsy();
    });
    it('circIn should be masked.', function() {
      expect('circIn' in createjs.Ease).toBeFalsy();
    });
    it('circInOut should be masked.', function() {
      expect('circInOut' in createjs.Ease).toBeFalsy();
    });
    it('circOut should be masked.', function() {
      expect('circOut' in createjs.Ease).toBeFalsy();
    });
    it('cubicIn should work.', function(done) {
      var table = [0.000, 0.001, 0.008, 0.027, 0.064, 0.125, 0.216, 0.343,
          0.512, 0.729, 1.000];
      checkTable(createjs.Ease.cubicIn, table, done);
    });
    it('cubicInOut should work.', function(done) {
      var table = [0.000, 0.004, 0.032, 0.108, 0.256, 0.500, 0.744, 0.892,
          0.968, 0.996, 1.000];
      checkTable(createjs.Ease.cubicInOut, table, done);
    });
    it('cubicOut should work.', function(done) {
      var table = [0.000, 0.271, 0.488, 0.657, 0.784, 0.875, 0.936, 0.973,
          0.992, 0.999, 1.000];
      checkTable(createjs.Ease.cubicOut, table, done);
    });
    it('elasticIn should be masked.', function() {
      expect('elasticIn' in createjs.Ease).toBeFalsy();
    });
    it('elasticInOut should be masked.', function() {
      expect('elasticInOut' in createjs.Ease).toBeFalsy();
    });
    it('elasticOut should be masked.', function() {
      expect('elasticOut' in createjs.Ease).toBeFalsy();
    });
    it('get should work.', function(done) {
      // get(0) equals linear
      var table = [0.000, 0.100, 0.200, 0.300, 0.400, 0.500, 0.600, 0.700,
          0.800, 0.900, 1.000];
      checkTable(createjs.Ease.get(0), table, done);
      // get(1<=x)
      // get(-1<=x)
      // get(1<x<1)
    });
    it('getBackIn should be masked.', function() {
      expect('getBackIn' in createjs.Ease).toBeFalsy();
    });
    it('getBackInOut should be masked.', function() {
      expect('getBackInOut' in createjs.Ease).toBeFalsy();
    });
    it('getBackOut should be masked.', function() {
      expect('getBackOut' in createjs.Ease).toBeFalsy();
    });
    it('getElasticIn should be masked.', function() {
      expect('getElasticIn' in createjs.Ease).toBeFalsy();
    });
    it('getElasticInOut should be masked.', function() {
      expect('getElasticInOut' in createjs.Ease).toBeFalsy();
    });
    it('getElasticOut should be masked.', function() {
      expect('getElasticOut' in createjs.Ease).toBeFalsy();
    });
    it('getPowIn should be masked.', function() {
      expect('getPowIn' in createjs.Ease).toBeFalsy();
    });
    it('getPowInOut should be masked.', function() {
      expect('getPowInOut' in createjs.Ease).toBeFalsy();
    });
    it('getPowOut should be masked.', function() {
      expect('getPowOut' in createjs.Ease).toBeFalsy();
    });
    it('linear should work.', function(done) {
      var table = [0.000, 0.100, 0.200, 0.300, 0.400, 0.500, 0.600, 0.700,
          0.800, 0.900, 1.000];
      checkTable(createjs.Ease.linear, table, done);
    });
    it('none should work.', function(done) {
      var table = [0.000, 0.100, 0.200, 0.300, 0.400, 0.500, 0.600, 0.700,
          0.800, 0.900, 1.000];
      checkTable(createjs.Ease.none, table, done);
    });
    it('quadIn should work.', function(done) {
      var table = [0.000, 0.010, 0.040, 0.090, 0.160, 0.250, 0.360, 0.490,
          0.640, 0.810, 1.000];
      checkTable(createjs.Ease.quadIn, table, done);
    });
    it('quadInOut should work.', function(done) {
      var table = [0.000, 0.020, 0.080, 0.180, 0.320, 0.500, 0.680, 0.820,
          0.920, 0.980, 1.000];
      checkTable(createjs.Ease.quadInOut, table, done);
    });
    it('quadOut should work.', function(done) {
      var table = [0.000, 0.190, 0.360, 0.510, 0.640, 0.750, 0.840, 0.910,
          0.960, 0.990, 1.000];
      checkTable(createjs.Ease.quadOut, table, done);
    });
    it('quartIn should be masked.', function() {
      expect('quartIn' in createjs.Ease).toBeFalsy();
    });
    it('quartInOut should be masked.', function() {
      expect('quartInOut' in createjs.Ease).toBeFalsy();
    });
    it('quartOut should be masked.', function() {
      expect('quartOut' in createjs.Ease).toBeFalsy();
    });
    it('quintIn should be masked.', function() {
      expect('quintIn' in createjs.Ease).toBeFalsy();
    });
    it('quintInOut should be masked.', function() {
      expect('quintInOut' in createjs.Ease).toBeFalsy();
    });
    it('quintOut should be masked.', function() {
      expect('quintOut' in createjs.Ease).toBeFalsy();
    });
    it('sineIn should be masked.', function() {
      expect('sineIn' in createjs.Ease).toBeFalsy();
    });
    it('sineInOut should be masked.', function() {
      expect('sineInOut' in createjs.Ease).toBeFalsy();
    });
    it('sineOut should be masked.', function() {
      expect('sineOut' in createjs.Ease).toBeFalsy();
    });
  });
});
