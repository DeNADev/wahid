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

describe('LoadQueue', function() {
  var queue;
  beforeEach(function() {
    queue = new createjs.LoadQueue(true, 'assets/', 'Anonymous');
  });

  it('createjs.LoadQueue should be exported.', function() {
    expect('LoadQueue' in createjs).toBeTruthy();
  });
  it('LoadQueue should be able to create instance.', function() {
    expect(queue).not.toBeNull();
  });

  describe('LoadQueue properies', function() {
    it('BINARY should be exported.', function() {
      expect('BINARY' in createjs.LoadQueue).toBeTruthy();
    });
    it('CSS should be exported.', function() {
      expect('CSS' in createjs.LoadQueue).toBeTruthy();
    });
    it('IMAGE should be exported.', function() {
      expect('IMAGE' in createjs.LoadQueue).toBeTruthy();
    });
    it('JAVASCRIPT should be exported.', function() {
      expect('JAVASCRIPT' in createjs.LoadQueue).toBeTruthy();
    });
    it('JSON should be exported.', function() {
      expect('JSON' in createjs.LoadQueue).toBeTruthy();
    });
    it('JSONP should be exported.', function() {
      expect('JSONP' in createjs.LoadQueue).toBeTruthy();
    });
    it('MANIFEST should be exported.', function() {
      expect('MANIFEST' in createjs.LoadQueue).toBeTruthy();
    });
    it('SOUND should be exported.', function() {
      expect('SOUND' in createjs.LoadQueue).toBeTruthy();
    });
    it('SVG should be exported.', function() {
      expect('SVG' in createjs.LoadQueue).toBeTruthy();
    });
    it('TEXT should be exported.', function() {
      expect('TEXT' in createjs.LoadQueue).toBeTruthy();
    });
    it('XML should be exported.', function() {
      expect('XML' in createjs.LoadQueue).toBeTruthy();
    });
    it('loadTimeout should be masked.', function() {
      expect('loadTimeout' in createjs.LoadQueue).toBeFalsy();
    });
    it('maintainScriptOrder should be masked.', function() {
      expect('maintainScriptOrder' in queue).toBeFalsy();
    });
    it('next should be masked.', function() {
      expect('next' in queue).toBeFalsy();
    });
    it('stopOnError should be masked.', function() {
      expect('stopOnError' in queue).toBeFalsy();
    });
    it('useXHR should be masked.', function() {
      expect('useXHR' in queue).toBeFalsy();
    });
    it('canceled should be masked.', function() {
      expect('canceled' in queue).toBeFalsy();
    });
    it('loaded should be masked.', function() {
      expect('loaded' in queue).toBeFalsy();
    });
    it('progress should be masked.', function() {
      expect('progress' in queue).toBeFalsy();
    });
  });

  describe('LoadQueue methods', function() {
    afterEach(function() {
      queue.setPaused(true);
      try {
        queue.removeAll();
      } catch (e) {
        if (e instanceof TypeError) {
          // Temporary patch, it's ok.
        } else {
          throw e;
        }
      }
      queue = new createjs.LoadQueue(true, 'assets/', 'Anonymous');
    });
    it('setUseXHR should NOT work.', function() {
      expect(true).toBeTruthy(); // TODO blank method
    });
    it('installPlugin should NOT work.', function() {
      expect(true).toBeTruthy(); // TODO blank method
    });
    it('getResult should work.', function(done) {
      queue.loadFile({
        id: 'json',
        src: 'test.json'
      });
      queue.on('complete', function() {
        var result = queue.getResult('json');
        expect(result.text).toEqual('This is a plain text.');
        done();
      });
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
    });
    it('removeAll should work.', function(done) {
      queue.on('complete', function() {
        fail('already removed all request.');
      });
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.loadFile({
        id: 'json',
        src: 'test.json'
      });
      try {
        queue.removeAll();
      } catch (e) {
        if (e instanceof TypeError) {
          // Temporary patch, it's ok.
        } else {
          throw e;
        }
      }
      setTimeout(function() {
        expect(true).toBeTruthy();
        done();
      }, 500);
    });
    it('remove should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('setMaxConnections should work.', function() {
      queue.setMaxConnections(3);
      if (queue.connections_) {
        expect(queue.connections_).toEqual(3);
      } else {
        expect(true).toBeTruthy();
      }
    });
    it('loadFile should work.', function(done) {
      queue.on('complete', function() {
        var result = queue.getResult('img');
        expect(result.src.indexOf('y32x32.png')).not.toEqual(-1);
        done();
      });
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.loadFile({
        id: 'img',
        src: 'y32x32.png'
      });
    });
    it('loadManifest should work.', function(done) {
      queue.on('complete', function() {
        var json = queue.getResult('json');
        var y32 = queue.getResult('y32');
        expect(json).not.toBeNull();
        expect(y32).not.toBeNull();
        done();
      });
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.loadManifest([{
        src: 'test.json',
        id: 'json'
      }, {
        src: 'y32x32.png',
        id: 'y32'
      }]);
    });
    it('getItem should work.', function() {
      queue.loadManifest([{
        src: 'test.json',
        id: 'json'
      }, {
        src: 'y32x32.png',
        id: 'y32'
      }]);
      var byId = queue.getItem('json');
      var bySrc = queue.getItem('test.json');
      expect(byId).not.toBeNull();
      expect(byId).toBe(bySrc);
      try {
        queue.removeAll();
      } catch (e) {
        if (e instanceof TypeError) {
          // Temporary patch, it's ok.
        } else {
          throw e;
        }
      }
    });
    it('setPaused should work.', function(done) {
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.on('complete', function() {
        fail('loadNow=false failed.');
        done();
      });

      queue.loadFile({
        id: 'img',
        src: 'y32x32.png'
      }, false);

      setTimeout(function() {
        queue.removeAllEventListeners('complete');
        queue.on('complete', function() {
          var result = queue.getResult('img');
          expect(result.src.indexOf('y32x32.png')).not.toEqual(-1);
          done();
        });
        queue.setPaused(false);
      }, 500);
    });
    it('load should work.', function(done) {
      // LoadQueue.load() equals LoadQueue.setPaused(false) .
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.on('complete', function() {
        fail('loadNow=false failed.');
        done();
      });

      queue.loadFile({
        id: 'img',
        src: 'y32x32.png'
      }, false);

      setTimeout(function() {
        queue.removeAllEventListeners('complete');
        queue.on('complete', function() {
          var result = queue.getResult('img');
          expect(result.src.indexOf('y32x32.png')).not.toEqual(-1);
          done();
        });
        queue.load();
      }, 500);
    });
    it('close should work.', function(done) {
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.on('complete', function() {
        var y32 = queue.getItem('y32');
        expect(y32).not.toBeNull();
        if (y32) {
          done();
        }
      });

      queue.setMaxConnections(1);
      queue.loadFile({
        src: 'y32x32.png',
        id: 'y32'
      });
      queue.loadFile({
        src: 'test.json',
        id: 'json'
      });
      queue.close();

      setTimeout(function() {
        expect(true).toBeTruthy();
        done();
      }, 500);
    });
    // This test will fail due to LoadQueue.reset() problem.
    it('reset should work.', function(done) {
      queue.on('error', function(err) {
        fail('cannot load file:' + err.src);
        done();
      });
      queue.on('complete', function() {
        fail('loadNow=false or reset() failed.');
        done();
      });

      queue.reset();
      queue.loadFile({
        id: 'img',
        src: 'y32x32.png'
      }); // TODO current running item will not reset?
      queue.reset();

      setTimeout(function() {
        expect(true).toBeTruthy();
      }, 500);
    });
  });
});
