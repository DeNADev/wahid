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

var imageUrl = 'assets/32x32.png';
var png32x32 = 'assets/32x32.png'
var mask32x32 = 'assets/m32x32.png';
var pngSpriteSheet = 'assets/spritesheet.png';
var pngEmpty = 'assets/empty.png';
var pngBeginBitmapFillWithoutBitmap =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABYklE' +
  'QVRYR8XWvUqcQRSH8Wde2TvxDlK67MyUgYCllaWVlaXVVvEDIgp+ERdFUTGiKCqJKMqc2VWUBA' +
  'N+gYuCJhYWFhZi+44kK3gHe84NnB//6jEon/n/39c+kPJPGpYGwIYKmFZMis1FGPsGkM/AC9H1' +
  'NRXgYrkBcGEAsifEDmoBvkD2gNghJUAchvwP4ke0AKOQ1xE/pgOwMgGcE92kFuArmBOindICTJ' +
  'PMIVU7owNwYRaygNg5LcACZNuIXVQCyBKkDcR/0wKsQFpG/KoOwMoaME9061qATaBCdFtagO8k' +
  'M07V/tAC7JDMEFW7qwNwYQ/T0k8o7WsBBNNSJpSaW0TvQSI1SL2IP1BaQI4g9SD+WAdg5SfQTX' +
  'S/tAAn5FkXtdJvLcApedZJrXSmA3DhAlPoIBQvtQBXmEI7oVhXAsg1pI+Iv9EC3ELyiL/TAVj5' +
  'SzJtVO29FuARY/714HNTAST3Ch4ntB9pVSa9AAAAAElFTkSuQmCC';



beforeEach(function () {
	jasmine.addMatchers(imagediff.jasmine);
	jasmine.addMatchers({
			toAlmostEqual: function(util, customEqualityTesters) {
				return {
					compare: function(actual, expected, tolerance) {
						tolerance = tolerance || 0.005;
						if (actual < expected - tolerance || expected + tolerance < actual){
							return {pass : false};
						} else {
							return {pass : true};
						}
					}
				};
			}
		});

	this.compareWithImage = function(expect, stage, referenceImageUrl, done) {
		var img = new Image();
		img.onload = function () {
			stage.update();
			expect(stage.canvas).toImageDiffEqual(this, 0);
			if (done) done();
		};
		img.onerror = function(){
			fail('failed to load:' + img.src);
			if (done) done();
		};
		img.src = referenceImageUrl;
	}

	this.negativeCompareWithImage = function(expect, stage,
		                                       referenceImageUrl, done) {
		var img = new Image();
		img.onload = function () {
			stage.update();
			expect(stage.canvas).not.toImageDiffEqual(this, 0);
			if (done) done();
		};
		img.onerror = function(){
			fail('failed to load:' + img.src);
			if (done) done();
		};
		img.src = referenceImageUrl;
	}

	this.resetTick = function() {
			createjs.Ticker.removeAllEventListeners('tick');
		// Wahid does not support Ticker.init(),
		// and CreateJS 0.7.1's createjs.init() was not worked well.
		if (createjs.Ticker.init) {
			createjs.Ticker._inited = false;
			createjs.Ticker.init();
			createjs.Ticker.setFPS(60);
			//createjs.Ticker.addEventListener('tick', createjs.Tween);
		} else {
			createjs.Ticker.reset();
		}
	}
});
