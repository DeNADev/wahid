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

(function (lib, cjs) {

lib.container;
lib.ball;
lib.blocks;
lib.frame;

var STAGE_WIDTH = 512;
var STAGE_HEIGHT = 256;
var BLOCKS_ROWS = 8;
var BLOCKS_COLS = 5;
var BLOCK_ASPECT_FACTOR = 3;
var BLOCK_WIDTH = STAGE_WIDTH / BLOCKS_ROWS;
var BLOCK_HEIGHT = BLOCK_WIDTH / BLOCK_ASPECT_FACTOR;
var BALL_RADIUS = BLOCK_HEIGHT / 2;

lib.initialize = function(stage) {
	// This container contains all shapes in this game.
	container = new cjs.Container();

	ball = new cjs.Shape();
	// Ball is a circle.
	ball.regX = ball.regY = BALL_RADIUS;
	ball.graphics.setStrokeStyle(2)
		.beginStroke(cjs.Graphics.getRGB(64, 64, 255))
		.beginFill(cjs.Graphics.getRGB(128, 128, 255))
		.drawCircle(BALL_RADIUS, BALL_RADIUS, BALL_RADIUS);
	ball.x = STAGE_WIDTH / 2;
	ball.y = STAGE_HEIGHT - BALL_RADIUS;
	ball.vx = Math.random() * 10 + 5;
	ball.vy = -(Math.random() * 10 + 5);

	container.addChild(ball);

	// Blocks is a container.
	blocks = new cjs.Container();
	var offsetY = 2;
	for (var y = 0; y < BLOCKS_COLS; ++y) {
		for (var x = 0; x < BLOCKS_ROWS; ++x) {
			// Each block is a rectangle.
			var block = new cjs.Shape();
			block.x = BLOCK_WIDTH * x;
			block.y = BLOCK_HEIGHT * (y + offsetY);
			var hue = 360 / BLOCKS_COLS * y;
			block.graphics.setStrokeStyle(2)
					.beginStroke(cjs.Graphics.getHSL(hue, 50, 25))
					.beginFill(cjs.Graphics.getHSL(hue, 50, 67))
					.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT);
			block.minX = block.x;
			block.minY = block.y;
			block.maxX = block.x + BLOCK_WIDTH;
			block.maxY = block.y + BLOCK_HEIGHT;

			blocks.addChild(block);
		}
	}
	container.addChild(blocks);

	// Frame is a wireframe.
	frame = new cjs.Shape();
	frame.x = frame.y = 0;
	frame.width = STAGE_WIDTH;
	frame.height = STAGE_HEIGHT;
	frame.graphics.setStrokeStyle(2)
		.beginStroke(cjs.Graphics.getRGB(32, 32, 32))
		.drawRect(frame.x, frame.y, frame.width, frame.height);

	container.addChild(frame);

	return container;
};

var cleanUp = function() {
	container.removeChild(frame);
	frame = null;
	blocks.children.forEach(function(block){
		container.removeChild(block);
	});
	container.removeChild(blocks);
	blocks = null;
	container.removeChild(ball);
	ball = null;
	container.removeAllChildren();
	container = null;
};

lib.updateFrame = function() {
	ball.x += ball.vx;
	ball.y += ball.vy;

	// very simple(not perfect) hit tests.
	var ballBounds = {
		minX: ball.x - BALL_RADIUS,
		minY: ball.y - BALL_RADIUS,
		maxX: ball.x + BALL_RADIUS,
		maxY: ball.y + BALL_RADIUS,
	};

	// hit tests with frame.
	if (ballBounds.minX <= frame.x || (frame.x + frame.width) <= ballBounds.maxX) {
		ball.vx = -ball.vx;
	} 
	if (ballBounds.minY <= frame.y || (frame.y + frame.height) <= ballBounds.maxY) {
		ball.vy = -ball.vy;
	}

	// hit tests with blocks.
	var hittedX = false;
	var hittedY = false;
	blocks.children.forEach(function(block) {
		if ((block.minX <= ballBounds.maxX && ballBounds.minX <= block.maxX)
				&& (block.minY <= ballBounds.maxY && ballBounds.minY <= block.maxY)) {
			// hit!
			var blockCenterX = block.x + BLOCK_WIDTH / 2;
			var blockCenterY = block.y + BLOCK_HEIGHT / 2;
			var diffXRatio = Math.abs(ball.x - blockCenterX) / BLOCK_ASPECT_FACTOR;
			var diffYRatio = Math.abs(ball.y - blockCenterY);
			if (diffXRatio > diffYRatio) {
				if (!hittedX) {
					ball.vx = -ball.vx;
					hittedX = true;
				}
			} else {
				if (!hittedY) {
					ball.vy = -ball.vy;
					hittedY = true;
				}
			}
			blocks.removeChild(block);
		}
	});

	if (blocks.children.length == 0) {
		cleanUp();
		if (lib.handleReset) {
			lib.handleReset();
		}
	}
};

lib.handleReset = null;

})(breakout = breakout||{}, createjs = createjs||{});
var breakout, createjs;
