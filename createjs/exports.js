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
/// <reference path="alpha_map_filter.js"/>
/// <reference path="bitmap.js"/>
/// <reference path="button_helper.js"/>
/// <reference path="color_filter.js"/>
/// <reference path="config.js"/>
/// <reference path="container.js"/>
/// <reference path="display_object.js"/>
/// <reference path="dom_element.js"/>
/// <reference path="ease.js"/>
/// <reference path="event_dispatcher.js"/>
/// <reference path="filter.js"/>
/// <reference path="graphics.js"/>
/// <reference path="load_queue.js"/>
/// <reference path="movie_clip.js"/>
/// <reference path="mouse_event.js"/>
/// <reference path="rectangle.js"/>
/// <reference path="shadow.js"/>
/// <reference path="shape.js"/>
/// <reference path="sound.js"/>
/// <reference path="sprite.js"/>
/// <reference path="sprite_sheet.js"/>
/// <reference path="stage.js"/>
/// <reference path="text.js"/>
/// <reference path="ticker.js"/>
/// <reference path="timeline.js"/>
/// <reference path="touch.js"/>
/// <reference path="tween.js"/>
/// <reference path="video.js"/>

if (createjs.SUPPORT_AMD) {
  // Exports symbols to an AMD loader.
  define({
    'AlphaMapFilter': createjs.AlphaMapFilter,
    'Bitmap': createjs.Bitmap,
    'ButtonHelper': createjs.ButtonHelper,
    'ColorFilter': createjs.ColorFilter,
    'Config': createjs.Config.exports,
    'Container': createjs.Container,
    'DisplayObject': createjs.DisplayObject,
    'DOMElement': createjs.DOMElement,
    'EventDispatcher': createjs.EventDispatcher,
    'Ease': createjs.Ease.exports,
    'Filter': createjs.Filter,
    'Graphics': createjs.Graphics,
    'HTMLAudioPlugin': createjs.HTMLAudioPlugin,
    'LoadQueue': createjs.LoadQueue,
    'MotionGuidePlugin': createjs.MotionGuidePlugin,
    'MouseEvent': createjs.MouseEvent,
    'MovieClip': createjs.MovieClip,
    'Rectangle': createjs.Rectangle,
    'Shadow': createjs.Shadow,
    'Shape': createjs.Shape,
    'Sound': createjs.Sound.exports,
    'Sprite': createjs.Sprite,
    'SpriteSheet': createjs.SpriteSheet,
    'Stage': createjs.Stage,
    'Text': createjs.Text,
    'Ticker': createjs.Ticker.exports,
    'Timeline': createjs.Timeline,
    'Touch': createjs.Touch.exports,
    'Tween': createjs.Tween,
    'Video': createjs.Video,
    'WebAudioPlugin': createjs.WebAudioPlugin,
    'version':
        '0.' + createjs.MAJOR_VERSION + '.' + createjs.MINOR_VERSION,
    'denaVersion':
        (createjs.DENA_MAJOR_VERSION << 16) + createjs.DENA_MINOR_VERSION
  });
}
