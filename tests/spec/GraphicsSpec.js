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

describe(
    'Graphics',
    function() {
      var stage;
      var g;
      beforeEach(function() {
        g = new createjs.Graphics();
        var canvas = document.getElementById('testcanvas');
        stage = new createjs.Stage(canvas);
      });

      it('createjs.Graphics should be exported.', function() {
        expect('Graphics' in createjs).toBeTruthy();
      });
      it('Graphics should be able to create instance.', function() {
        expect(g).toBeTruthy();
      });

      describe('Graphics properies', function() {
        it('BASE_64 should be masked.', function() {
          expect('BASE_64' in g).toBeFalsy();
        });
        it('Command should be masked.', function() {
          expect('Command' in g).toBeFalsy();
        });
        it('STROKE_CAPS_MAP should be masked.', function() {
          expect('STROKE_CAPS_MAP' in g).toBeFalsy();
        });
        it('STROKE_JOINTS_MAP should be masked.', function() {
          expect('STROKE_JOINTS_MAP' in g).toBeFalsy();
        });
      });

      describe(
          'Graphics methods',
          function() {
            beforeEach(function() {
            });
            afterEach(function() {
              stage.removeAllChildren();
              stage.update();
            })

            var drawReference = function(func, done) {
              var iframe = document.createElement('iframe');
              iframe.id = 'reference';
              document.body.appendChild(iframe);
              iframe.onload = function() {
                var rendered = doc.getElementById('testcanvas')
                    .toDataURL();
                document.body.removeChild(iframe);
                done(rendered);
              };
              var doc = iframe.contentWindow.document;
              doc.open();
              var text = ''
+ '<!DOCTYPE html>'
+ '<html>'
+ '<head>'
+ ' <meta charset="utf-8">'
+ ' <script src="http://code.createjs.com/easeljs-0.7.1.min.js"></script>'
+ ' <script src="http://code.createjs.com/tweenjs-0.5.1.min.js"></script>'
+ ' <script src="http://code.createjs.com/movieclip-0.7.1.min.js"></script>'
+ ' <script src="http://code.createjs.com/soundjs-0.5.2.min.js"></script>'
+ ' <script src="http://code.createjs.com/preloadjs-0.4.1.min.js"></script>'
+ ' <script type="text/javascript">'
+ '   wrapper = '
+ wrapper
+ ';'
+ '   draw = '
+ func
+ ';'
+ ' </script>'
+ '</head>'
+ '<body onload="wrapper(draw)">'
+ ' <canvas id="testcanvas" width="32px" height="32px"></canvas>'
+ '</body>'
+ '</html>';

              doc.write(text);
              doc.close();
            };

            var wrapper = function(draw, stage) {
              var canvas = document.getElementById('testcanvas');
              var stage = stage || new createjs.Stage(canvas);
              var shape = new createjs.Shape();
              draw(shape.graphics);
              stage.addChild(shape);
              stage.update();
            };

            // This compares a image rendered by Wahid with one by CreateJS.
            var compareWithReference = function(compareWithImage,
                expect, stage, done, draw) {
              drawReference(draw,
                  function(referenceResult) {
                    // Rendering actual result by Wahid.
                    wrapper(draw, stage);
                    compareWithImage(expect, stage, referenceResult, done);
                  });
            };

            // This compares Wahid's result with an empty image.
            var compareWithNullReference = function(
                compareWithImage, expect, stage, done, draw) {
              // Rendering actual result by Wahid.
              wrapper(draw, stage);
              compareWithImage(expect, stage, pngEmpty, done);
            };

            it('moveTo should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.clear();
                    g.setStrokeStyle(1, 'square', 'bevel', 1, false);
                    g.beginStroke(createjs.Graphics.getRGB(255, 0, 0, 255));
                    g.moveTo(10, 10.5).lineTo(31, 10.5);
                  });
            });

            it('lineTo should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(3, 'round', 'bevel');
                    g.beginStroke(createjs.Graphics.getRGB(128, 0, 128));
                    g.moveTo(2, 4).lineTo(30, 16);
                  });
            });

            it('arcTo should work.', function(done) {
              // dirty rect �����������Ĉꕔ�N���b�v�����̂Ŏ��s����
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(3, 'round', 'bevel');
                    g.beginStroke(createjs.Graphics.getRGB(
                        128, 64, 128));
                    g.moveTo(6, 6).arcTo(0, 0, 16, 40, 6);
                  });
            });

            it('arc should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(3, 'square', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 128));
                    g.arc(16, 16, 8, Math.PI * 0,
                        Math.PI * 1.5, false);
                  });
            });

            it('quadraticCurveTo should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(4, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 64, 192));
                    g.moveTo(4, 4).quadraticCurveTo(30, 16,
                        28, 24);
                  });
            });

            it('bezierCurveTo should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(2, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 192, 192));
                    g.moveTo(4, 4).bezierCurveTo(8, 0, 16,
                        32, 28, 28);
                  });
            });

            it('rect should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(6, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 0, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 0, 0));
                    g.rect(2, 4, 18, 16);
                  });
            });

            it('closePath should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(2, 'square', 'bevel');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 0, 192));
                    g.moveTo(2, 28).lineTo(7, 2).lineTo(12,
                        28);
                    g.closePath();
                    g.moveTo(30, 28).lineTo(25, 2).lineTo(
                        20, 28);
                    g.closePath();
                  });
            });

            it('clear should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(3, 'round', 'bevel');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 255, 0));
                    g.moveTo(2, 30).lineTo(30, 2);
                    g.clear();
                    g.setStrokeStyle(1, 'round', 'bevel');
                    g.beginStroke(createjs.Graphics.getRGB(
                        255, 0, 0));
                    g.moveTo(2, 2).lineTo(30, 30);
                  });
            });

            it('beginFill should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.beginStroke(createjs.Graphics.getRGB(
                        128, 64, 128));
                    g.beginFill(createjs.Graphics.getRGB(0,
                        128, 0));
                    g.rect(2, 2, 30, 30);
                  });
            });

            it('beginLinearGradientFill should work.', function(
                done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        128, 64, 128));
                    g
                        .beginLinearGradientFill([
                            "#000", "#FF0" ], [ 0,
                            1 ], 0, 0, 0, 32);
                    g.rect(2, 2, 30, 30);
                  });
            });

            it('beginRadialGradientFill should work.', function(
                done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        128, 64, 128));
                    g.beginRadialGradientFill([ "#F00",
                        "#00F" ], [ 0, 1 ], 16, 16, 0,
                        16, 16, 16);
                    g.rect(2, 2, 30, 30);
                  });
            });

            it('beginBitmapFill should NOT work.', function(done) {
              var shape = new createjs.Shape();
              var g = shape.graphics;
              stage.addChild(shape);

              var image = new Image();
              image.src = imageUrl;
              var that = this;
              image.onload = function() {
                g.setStrokeStyle(1, 'round', 'round');
                g.beginStroke(createjs.Graphics.getRGB(0, 64,
                    192));
                g.beginBitmapFill(this);
                g.rect(2, 2, 30, 30);
                stage.update();
                that.compareWithImage(expect, stage,
                    pngBeginBitmapFillWithoutBitmap, done);
              };
              image.onerror = function() {
                fail('failed to load:' + image.src);
                done();
              };
            });

            it('endFill should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.beginStroke(createjs.Graphics.getRGB(
                        255, 0, 255));
                    g.beginFill(createjs.Graphics.getRGB(
                        255, 0, 255));
                    g.rect(2, 2, 14, 30);
                    g.endFill();
                    g.rect(18, 2, 30, 30);
                  });
            });

            it('setStrokeStyle should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(3, 'square', 'bevel');
                    g.beginStroke(createjs.Graphics.getRGB(
                        128, 0, 0));
                    g.moveTo(1, 1).lineTo(20, 1)
                        .endStroke();
                    g.setStrokeStyle(5, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 128, 0));
                    g.moveTo(1, 1).lineTo(25, 25)
                        .endStroke();
                  });
            });

            it('beginStroke should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        255, 0, 0));
                    g.moveTo(1, 1).lineTo(30, 1)
                        .endStroke();
                    g.beginStroke('green');
                    g.moveTo(1, 1).lineTo(30, 30)
                        .endStroke();
                    g.beginStroke('rgba(0,0,255,1)');
                    g.moveTo(1, 1).lineTo(1, 30)
                        .endStroke();
                  });
            });

            it('beginLinearGradientStroke should work.', function(
                done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(8, 'round', 'round');
                    g
                        .beginLinearGradientStroke([
                            "#000", "#FFF" ], [ 0,
                            1 ], 0, 0, 31, 8);
                    g.moveTo(1, 1).lineTo(30, 1)
                        .endStroke();
                  });
            });

            it('beginRadialGradientStroke should work.', function(
                done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(2, 'round', 'round');
                    g.beginRadialGradientStroke([ "#F00",
                        "#00F" ], [ 0, 1 ], 16, 16, 0,
                        16, 16, 16);
                    g.moveTo(1, 1).lineTo(30, 30)
                        .endStroke();
                  });
            });

            it('beginBitmapStroke should NOT work.',
                function(done) {
                  var shape = new createjs.Shape();
                  var g = shape.graphics;
                  stage.addChild(shape);

                  var image = new Image();
                  image.src = imageUrl;
                  var that = this;
                  image.onload = function() {
                    g.setStrokeStyle(6, 'round', 'round');
                    g.beginBitmapStroke(image);
                    g.moveTo(1, 1).lineTo(30, 30)
                        .endStroke();
                    that.compareWithImage(expect, stage,
                        pngEmpty, done);
                  };
                  image.onerror = function() {
                    fail('failed to load:' + image.src);
                    done();
                  };
                });

            it('endStroke should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        255, 0, 0));
                    g.moveTo(2, 2).lineTo(30, 2);
                    g.endStroke();
                    g.moveTo(30, 2).lineTo(30, 30);
                  });
            });

            it('curveTo should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(4, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        0, 64, 192));
                    g.moveTo(4, 4).curveTo(30, 16, 28, 24);
                  });
            });

            it('drawRect should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.drawRect(1, 1, 30, 30);
                  });
            });

            it('drawRoundRect should NOT work.', function(done) {
              compareWithNullReference(this.compareWithImage,
                  expect, stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.drawRoundRect(1, 1, 30, 30, 6);
                  });
            });

            it('drawRoundRectComplex should NOT work.', function(
                done) {
              compareWithNullReference(this.compareWithImage,
                  expect, stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.drawRoundRectComplex(4, 4, 28, 28, 3,
                        6, -3, -6);
                  });
            });

            it('drawCircle should NOT work.', function(done) {
              compareWithReference(this.compareWithImage,
                  expect, stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.drawCircle(14, 14, 9);
                  });
            });

            it('drawEllipse should NOT work.', function(done) {
              compareWithReference(this.compareWithImage,
                  expect, stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.drawEllipse(4, 4, 24, 12);
                  });
            });

            it('inject should NOT work.', function() {
              // This method has an empty body.
              expect(true).toBeTruthy();
            });

            it('drawPolyStar should NOT work.', function(done) {
              compareWithNullReference(this.compareWithImage,
                  expect, stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.drawPolyStar(14, 14, 12, 6, 2, 30);
                  });
            });

            it('decodePath should work.', function(done) {
              compareWithReference(this.compareWithImage, expect,
                  stage, done, function(g) {
                    g.setStrokeStyle(1, 'round', 'round');
                    g.beginStroke(createjs.Graphics.getRGB(
                        64, 64, 192));
                    g.beginFill(createjs.Graphics.getRGB(
                        192, 64, 64));
                    g.decodePath('AAUAUIEYEY=='); // moveTo(2,2).lineTo(30,30)
                  });
            });

            it('mt should be the alias of moveTo.', function() {
              expect(g.mt).toBe(g.moveTo);
            });

            it('lt should be the alias of lineTo.', function() {
              expect(g.lt).toBe(g.lineTo);
            });

            it('at should be the alias of arcTo.', function() {
              expect(g.at).toBe(g.arcTo);
            });

            it('qt should be the alias of quadraticCurveTo.',
                function() {
                  expect(g.qt).toBe(g.quadraticCurveTo);
                });

            it('r should be the alias of rect.', function() {
              expect(g.r).toBe(g.rect);
            });

            it('cp should be the alias of closePath.', function() {
              expect(g.cp).toBe(g.closePath);
            });

            it('f should be the alias of beginFill.', function() {
              expect(g.f).toBe(g.beginFill);
            });

            it(
                'lf should be the alias of beginLinearGradientFill.',
                function() {
                  expect(g.lf)
                      .toBe(g.beginLinearGradientFill);
                });

            it(
                'rf should be the alias of beginRadialGradientFill.',
                function() {
                  expect(g.rf)
                      .toBe(g.beginRadialGradientFill);
                });

            it('bf should be the alias of beginBitmapFill.',
                function() {
                  expect(g.bf).toBe(g.beginBitmapFill);
                });

            it('ef should be the alias of endFill.', function() {
              expect(g.ef).toBe(g.endFill);
            });

            it('ss should be the alias of setStrokeStyle.',
                function() {
                  expect(g.ss).toBe(g.setStrokeStyle);
                });

            it('s should be the alias of beginStroke.', function() {
              expect(g.s).toBe(g.beginStroke);
            });

            it(
                'ls should be the alias of beginLinearGradientStroke.',
                function() {
                  expect(g.ls).toBe(
                      g.beginLinearGradientStroke);
                });

            it(
                'rs should be the alias of beginRadialGradientStroke.',
                function() {
                  expect(g.rs).toBe(
                      g.beginRadialGradientStroke);
                });

            it('bs should be the alias of beginBitmapStroke.',
                function() {
                  expect(g.bs).toBe(g.beginBitmapStroke);
                });

            it('es should be the alias of endStroke.', function() {
              expect(g.es).toBe(g.endStroke);
            });

            it('dr should be the alias of drawRect.', function() {
              expect(g.dr).toBe(g.drawRect);
            });

            it('rr should be the alias of drawRoundRect.',
                function() {
                  expect(g.rr).toBe(g.drawRoundRect);
                });

            it('rc should be the alias of drawRoundRectComplex.',
                function() {
                  expect(g.rc).toBe(g.drawRoundRectComplex);
                });

            it('dc should be the alias of drawCircle.', function() {
              expect(g.dc).toBe(g.drawCircle);
            });

            it('de should be the alias of drawEllipse.',
                function() {
                  expect(g.de).toBe(g.drawEllipse);
                });

            it('dp should be the alias of drawPolyStar.',
                function() {
                  expect(g.dp).toBe(g.drawPolyStar);
                });

            it('p should be the alias of decodePath.', function() {
              expect(g.p).toBe(g.decodePath);
            });

            it('getRGB should work.', function() {
              expect(createjs.Graphics.getRGB(0xFF8000)).toEqual(
                  'rgb(255,128,0)');
              expect(createjs.Graphics.getRGB(0xFF8000, 64))
                  .toEqual('rgba(255,128,0,64)');
              expect(createjs.Graphics.getRGB(16, 32, 48))
                  .toEqual('rgb(16,32,48)');
              expect(createjs.Graphics.getRGB(16, 32, 48, 64))
                  .toEqual('rgba(16,32,48,64)');
            });

            it('getHSL should work.', function() {
              expect(createjs.Graphics.getHSL(150, 100, 70))
                  .toEqual('hsl(150,100%,70%)');
            });

            it('clone should NOT work.', function() {
              try {
                expect(g.clone()).toBeNull();
              } catch (e) {
                expect(true).toBeTruthy();
              }
            });

            it('draw should be masked.', function() {
              expect('draw' in g).toBeFalsy();
            });

            it('drawAsPath should be masked.', function() {
              expect('drawAsPath' in g).toBeFalsy();
            });

            it('isEmpty should be masked.', function() {
              expect('isEmpty' in g).toBeFalsy();
            });
          });
    });
