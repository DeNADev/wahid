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
/// <reference path="counter.js"/>
/// <reference path="display_object.js"/>
/// <reference path="shadow.js"/>
/// <reference path="word_breaker.js"/>

/**
 * A class that displays one-line text or multi-line text.
 * @param {string} text
 * @param {string} font
 * @param {string} color
 * @extends {createjs.DisplayObject}
 * @constructor
 */
createjs.Text = function(text, font, color) {
  /// <param type="string" name="text"/>
  /// <param type="string" name="font"/>
  /// <param type="string" name="color"/>
  createjs.DisplayObject.call(this);
  this.initializeText_(text, font, color);
};
createjs.inherits('Text', createjs.Text, createjs.DisplayObject);

/**
 * An inner class that draws text onto the specified canvas with the Canvas 2D
 * API.
 * @constructor
 */
createjs.Text.Renderer = function() {
  /**
   * The output <canvas> element.
   * @type {HTMLCanvasElement}
   * @private
   */
  this.canvas_ = createjs.createCanvas();

  /**
   * The 2D rendering context attached to the output <canvas> element.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  this.context_ = createjs.getRenderingContext2D(this.canvas_);

  // Use a low-color texture to save memory.
  this.canvas_.format_ = createjs.Renderer.Format.RGBA4444;
};

/**
 * The output <canvas> element.
 * @type {HTMLCanvasElement}
 * @private
 */
createjs.Text.Renderer.prototype.canvas_ = null;

/**
 * The 2D rendering context attached to the output <canvas> element.
 * @type {CanvasRenderingContext2D}
 * @private
 */
createjs.Text.Renderer.prototype.context_ = null;

/**
 * The current width of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Text.Renderer.prototype.width_ = 0;

/**
 * The current height of the output <canvas> element.
 * @type {number}
 * @private
 */
createjs.Text.Renderer.prototype.height_ = 0;

/**
 * The current font style of the output <canvas> element.
 * @type {string}
 * @private
 */
createjs.Text.Renderer.prototype.font_ = '';

/**
 * Deletes all resources attached to this renderer.
 * @private
 */
createjs.Text.Renderer.prototype.destroy_ = function() {
  if (this.canvas_) {
    this.canvas_.width = 0;
    this.context_ = null;
    this.canvas_ = null;
  }
};

/**
 * Returns the HTMLCanvasElement object attached to this renderer.
 * @return {HTMLCanvasElement}
 * @private
 */
createjs.Text.Renderer.prototype.getCanvas_ = function() {
  /// <returns type="HTMLCanvasElement"/>
  return this.canvas_;
};

/**
 * Returns the ID assigned to this renderer.
 * @return {string}
 * @private
 */
createjs.Text.Renderer.prototype.getId_ = function() {
  /// <returns type="string"/>
  return this.canvas_.id;
};

/**
 * Sets the specified ID to this renderer.
 * @param {string} id
 * @private
 */
createjs.Text.Renderer.prototype.setId_ = function(id) {
  /// <param type="string" name="id"/>
  if (createjs.DEBUG) {
    this.canvas_.id = id;
  }
};

/**
 * Sets the output size.
 * @param {number} width
 * @param {number} height
 * @private
 */
createjs.Text.Renderer.prototype.setSize_ = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  if (this.width_ != width) {
    this.width_ = width;
    this.canvas_.width = width;
    this.font_ = '';
  }
  if (this.height_ != height) {
    this.height_ = height;
    this.canvas_.height = height;
    this.font_ = '';
  }
};

/**
 * Sets the font.
 * @param {string} font
 * @private
 */
createjs.Text.Renderer.prototype.setFont_ = function(font) {
  /// <param type="string" name="font"/>
  if (this.font_ != font) {
    this.font_ = font;
    this.context_.font = font;
  }
};

/**
 * Sets the alignment of text.
 * @param {string} textAlign
 * @private
 */
createjs.Text.Renderer.prototype.setTextAlign_ = function(textAlign) {
  /// <param type="string" name="textAlign"/>
  this.context_.textAlign = textAlign;
};

/**
 * Sets the baseline of text.
 * @param {string} textBaseline
 * @private
 */
createjs.Text.Renderer.prototype.setTextBaseline_ = function(textBaseline) {
  /// <param type="string" name="textBaseline"/>
  this.context_.textBaseline = textBaseline;
};

/**
 * Sets the text shadow.
 * @param {createjs.Shadow} shadow
 * @private
 */
createjs.Text.Renderer.prototype.setShadow_ = function(shadow) {
  /// <param type="createjs.Shadow" name="shadow"/>
  if (shadow) {
    this.context_.shadowColor = shadow.color;
    this.context_.shadowOffsetX = shadow.offsetX;
    this.context_.shadowOffsetY = shadow.offsetY;
    this.context_.shadowBlur = shadow.blur;
  } else {
    this.context_.shadowColor = '#000';
    this.context_.shadowOffsetX = 0;
    this.context_.shadowOffsetY = 0;
    this.context_.shadowBlur = 0;
  }
};

/**
 * Sets the line width.
 * @param {number} lineWidth
 * @private
 */
createjs.Text.Renderer.prototype.setLineWidth_ = function(lineWidth) {
  /// <param type="number" name="lineWidth"/>
  this.context_.lineWidth = lineWidth;
};

/**
 * Sets the fill color.
 * @param {string} color
 * @private
 */
createjs.Text.Renderer.prototype.setFillColor_ = function(color) {
  /// <param type="string" name="color"/>
  this.context_.fillStyle = color;
};

/**
 * Sets the stroke color.
 * @param {string} color
 * @private
 */
createjs.Text.Renderer.prototype.setStrokeColor_ = function(color) {
  /// <param type="string" name="color"/>
  this.context_.strokeStyle = color;
};

/**
 * Clears an rectangle.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @private
 */
createjs.Text.Renderer.prototype.clearRect_ = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.context_.clearRect(x, y, width, height);
  this.canvas_.dirty_ = true;
};

/**
 * Draws filled text.
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @private
 */
createjs.Text.Renderer.prototype.fillText_ = function(text, x, y, maxWidth) {
  /// <param type="string" name="text"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="maxWidth"/>
  this.context_.fillText(text, x, y, maxWidth);
};

/**
 * Draws an outline of text.
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @private
 */
createjs.Text.Renderer.prototype.strokeText_ = function(text, x, y, maxWidth) {
  /// <param type="string" name="text"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="maxWidth"/>
  this.context_.strokeText(text, x, y, maxWidth);
};

/**
 * Returns text width.
 * @param {string} text
 * @return {TextMetrics}
 * @private
 */
createjs.Text.Renderer.prototype.measureText_ = function(text) {
  /// <param type="string" name="text"/>
  return this.context_.measureText(text);
};

/**
 * The font heights.
 * @type {Object.<string,number>}
 * @private
 */
createjs.Text.lineAdvances_ = {};

/**
 * The text to be displayed.
 * @type {string}
 * @private
 */
createjs.Text.prototype.text_ = '';

/**
 * The font style to use. Any valid value for the CSS font attribute is
 * acceptable (ex. "bold 36px Arial").
 * @type {string}
 * @private
 */
createjs.Text.prototype.font_ = '';

/**
 * The color to draw the text in. Any valid value for the CSS color attribute
 * is acceptable (ex. "#F00"). Default is "#000". It will also accept valid
 * canvas fillStyle values.
 * @type {string}
 * @private
 */
createjs.Text.prototype.textColor_ = '';

/**
 * The parameters for the createjs.Renderer.prototype.drawCanvas() method.
 *   +-------+----------+
 *   | index | property |
 *   +-------+----------+
 *   | 0     | x        |
 *   | 1     | y        |
 *   | 2     | width    |
 *   | 3     | height   |
 *   +-------+----------+
 * @type {Float32Array}
 * @private
 */
createjs.Text.prototype.drawValues_ = null;

/**
 * The horizontal text alignment. This value must be one of "start", "end",
 * "left", "right", and "center".
 * @type {string}
 * @private
 */
createjs.Text.prototype.textAlign_ = 'left';

/**
 * The vertical alignment point on the font. This value must be one of "top",
 * "hanging", "middle", "alphabetic", "ideographic", or "bottom".
 * @type {string}
 * @private
 */
createjs.Text.prototype.textBaseline_ = 'top';

/**
 * The maximum width to draw the text.
 * @type {number}
 * @private
 */
createjs.Text.prototype.maxWidth_ = 0;

/**
 * The line width of the text outline. This object draws only the outline of
 * its text if this value is not 0.
 * @type {number}
 * @private
 */
createjs.Text.prototype.outline_ = 0;

/**
 * The line height (vertical distance between baselines) for multi-line text.
 * If this value is 0, the value of getMeasuredLineHeight is used.
 * @type {number}
 * @private
 */
createjs.Text.prototype.lineHeight_ = 0;

/**
 * Indicates the maximum width for a line of text before it is wrapped to
 * multiple lines. If this value is 0, the text will not be wrapped.
 * @type {number}
 * @private
 */
createjs.Text.prototype.lineWidth_ = 0;

/**
 * Whether this object needs to redraw its text.
 * @type {boolean}
 * @private
 */
createjs.Text.prototype.textDirty_ = true;

/**
 * A list of text lines split from the source text to fit them into the source
 * width.
 * @type {Array.<string>}
 * @private
 */
createjs.Text.prototype.lines_ = null;

/**
 * The height of a line.
 * @type {number}
 * @private
 */
createjs.Text.prototype.lineAdvance_ = 0;

/**
 * The width of a cached image.
 * @type {number}
 * @private
 */
createjs.Text.prototype.width_ = 0;

/**
 * The height of a cached image.
 * @type {number}
 * @private
 */
createjs.Text.prototype.height_ = 0;

/**
 * The renderer that draws text.
 * @type {createjs.Text.Renderer}
 * @private
 */
createjs.Text.prototype.renderer_ = null;

/**
 * The renderer that draws this object.
 * @type {createjs.Renderer}
 * @private
 */
createjs.Text.prototype.output_ = null;

/**
 * Initializes this text.
 * @param {string} text
 * @param {string} font
 * @param {string} color
 * @private
 */
createjs.Text.prototype.initializeText_ = function(text, font, color) {
  /// <param type="string" name="text"/>
  /// <param type="string" name="font"/>
  /// <param type="string" name="color"/>
  this.text_ = text;
  this.font_ = font;
  this.textColor_ = color;
  this.drawValues_ = createjs.createFloat32Array([0, 0, 0, 0]);
};

/**
 * Returns the cache renderer used for drawing text to a cache.
 * @return {createjs.Text.Renderer}
 * @private
 */
createjs.Text.prototype.getRenderer_ = function() {
  /// <returns type="createjs.Text.Renderer"/>
  if (!this.renderer_) {
    if (createjs.DEBUG) {
      ++createjs.Counter.totalRenderers;
    }
    this.renderer_= new createjs.Text.Renderer();
  }
  return this.renderer_;
};

/**
 * Breaks text into lines so the specified renderer can render each of them at
 * one fillText() or strokeText() call.
 * @param {createjs.Text.Renderer} renderer
 * @param {string} text
 * @return {Array.<string>} lines;
 * @private
 */
createjs.Text.prototype.breakText_ = function(renderer, text) {
  /// <param type="createjs.JsonText.Renderer" name="renderer"/>
  /// <param type="string" name="text"/>
  /// <returns type="Array" elementType="string"/>

  // Return without calculating the line width (which is used as the width of a
  // cache <canvas> element) when the it is specified by a game.
  var lines = text.split('\n');
  var width = this.maxWidth_;
  if (width > 0) {
    this.width_ = width;
    return lines;
  }

  // When the line width is not specified by a game, calculate the maximum line
  // width as use it so each line of this text can be rendered without inserting
  // line breaks.
  var length = lines.length;
  if (this.lineWidth_ <= 0) {
    width = 0;
    for (var i = 0; i < length; ++i) {
      var lineWidth = renderer.measureText_(lines[i]).width;
      width = createjs.max(lineWidth, width);
    }
    this.width_ = width;
    return lines;
  }

  // Insert line breaks to fit all lines into the specified line width.
  this.width_ = this.lineWidth_ / this.getScaleX();
  width = this.width_;
  var renderLines = [];
  for (var i = 0; i < length; ++i) {
    var line = lines[i];
    var lineWidth = renderer.measureText_(line).width;
    if (lineWidth <= width) {
      renderLines.push(line);
      continue;
    }
    var words = createjs.WordBreaker.breakText(line);
    if (words.length == 1) {
      renderLines.push(line);
      continue;
    }
    lineWidth = 0;
    var lineText = '';
    for (var j = 0; j < words.length; ++j) {
      var wordWidth = renderer.measureText_(words[j]).width;
      lineWidth += wordWidth;
      if (lineWidth > width) {
        renderLines.push(lineText);
        lineText = words[j];
        lineWidth = wordWidth;
      } else {
        lineText += words[j];
      }
    }
    if (lineText) {
      renderLines.push(lineText);
    }
  }
  return renderLines;
};

/**
 * Draws multi-line text to the cache of this object.
 * @private
 */
createjs.Text.prototype.paintCache_ = function() {
  // Break text into lines.
  this.textDirty_ = false;
  var renderer = this.getRenderer_();
  renderer.setId_(this.text_);
  if (!this.lines_) {
    renderer.setFont_(this.font_);
    this.lines_ = this.breakText_(renderer, this.text_);
  }

  // Set the size of the cache HTMLCanvasElement object.
  var lines = this.lines_;
  var length = lines.length;
  this.lineAdvance_ = this.lineHeight_ || this.getMeasuredLineHeight();
  var lineAdvance = this.lineAdvance_;
  this.height_ = (length + 0.5) * lineAdvance;
  var margin = 0;
  if (this.outline_) {
    margin = this.outline_;
  }
  var shadow = this.getShadow();
  if (shadow) {
    var offset =
      createjs.max(createjs.abs(shadow.offsetX), createjs.abs(shadow.offsetY));
    margin = createjs.max(margin, offset + shadow.blur);
  }
  var padding = margin << 1;
  this.width_ += padding;
  this.height_ += padding;
  renderer.setSize_(this.width_, this.height_);
  renderer.setFont_(this.font_);
  renderer.setTextAlign_(this.textAlign_);
  renderer.setTextBaseline_(this.textBaseline_);
  renderer.setShadow_(shadow);
  renderer.clearRect_(0, 0, this.width_, this.height_);

  // Draw text to the cache line by line.
  var x = margin;
  if (this.textAlign_ == 'center') {
    x = this.width_ >> 1;
  } else if (this.textAlign_ == 'right') {
    x = this.width_;
  }
  var y = margin;
  this.drawValues_[0] = -x;
  this.drawValues_[1] = -y;
  this.drawValues_[2] = this.width_;
  this.drawValues_[3] = this.height_;
  var maxWidth = this.maxWidth_ || 10000;
  if (this.outline_) {
    renderer.setStrokeColor_(this.textColor_);
    renderer.setLineWidth_(this.outline_);
    for (var i = 0; i < length; ++i) {
      renderer.strokeText_(lines[i], x, y, maxWidth);
      y += lineAdvance;
    }
  } else {
    renderer.setFillColor_(this.textColor_);
    for (var i = 0; i < length; ++i) {
      renderer.fillText_(lines[i], x, y, maxWidth);
      y += lineAdvance;
    }
  }
  this.setBoundingBox(-x, -y, this.width_ - x, this.height_ - y);
};

/**
 * Returns the text.
 * @return {string}
 */
createjs.Text.prototype.getText = function() {
  /// <returns type="string"/>
  return this.text_;
};

/**
 * Sets the text.
 * @param {string} text
 */
createjs.Text.prototype.setText = function(text) {
  /// <param type="string" name="text"/>
  text = (text == null) ? '' : createjs.parseString(text);
  if (this.text_ != text) {
    this.text_ = text;
    this.lines_ = null;
    this.textDirty_ = true;
  }
};

/**
 * Returns the text font.
 * @return {string}
 */
createjs.Text.prototype.getFont = function() {
  /// <returns type="string"/>
  return this.text_;
};

/**
 * Sets the text font.
 * @param {string} font
 */
createjs.Text.prototype.setFont = function(font) {
  /// <param type="string" name="font"/>
  if (this.font_ != font) {
    this.font_ = font;
    this.lineAdvance_ = 0;
    this.textDirty_ = true;
  }
};

/**
 * Returns the text color.
 * @return {string}
 */
createjs.Text.prototype.getColor = function() {
  /// <returns type="string"/>
  return this.textColor_;
};

/**
 * Sets the text color.
 * @param {string} value
 */
createjs.Text.prototype.setColor = function(value) {
  /// <param type="string" name="value"/>
  var color = value || '#000';
  if (this.textColor_ != color) {
    this.textColor_ = color;
    this.textDirty_ = true;
  }
};

/**
 * Returns the text alignment.
 * @return {string}
 */
createjs.Text.prototype.getTextAlign = function() {
  /// <returns type="string"/>
  return this.textAlign_;
};

/**
 * Sets the text alignment.
 * @param {string} value
 */
createjs.Text.prototype.setTextAlign = function(value) {
  /// <param type="string" name="value"/>
  var textAlign = value || 'left';
  if (this.textAlign_ != textAlign) {
    this.textAlign_ = textAlign;
    this.textDirty_ = true;
  }
};

/**
 * Returns the text baseline.
 * @return {string}
 */
createjs.Text.prototype.getTextBaseline = function() {
  /// <returns type="string"/>
  return this.textBaseline_;
};

/**
 * Sets the text baseline.
 * @param {string} value
 */
createjs.Text.prototype.setTextBaseline = function(value) {
  /// <param type="string" name="value"/>
  var textBaseline = value || 'top';
  if (this.textBaseline_ != textBaseline) {
    this.textBaseline_ = textBaseline;
    this.textDirty_ = true;
  }
};

/**
 * Returns the maximum width.
 * @return {number}
 */
createjs.Text.prototype.getMaxWidth = function() {
  /// <returns type="number"/>
  return this.maxWidth_;
};

/**
 * Sets the maximum width.
 * @param {number} maxWidth
 */
createjs.Text.prototype.setMaxWidth = function(maxWidth) {
  /// <param type="number" name="maxWidth"/>
  if (this.maxWidth_ != maxWidth) {
    this.maxWidth_ = maxWidth;
    this.lines_ = null;
    this.textDirty_ = true;
  }
};

/**
 * Returns the thickness of text outlines.
 * @return {number}
 */
createjs.Text.prototype.getOutline = function() {
  /// <returns type="number"/>
  return this.outline_;
};

/**
 * Sets the thickness of text outlines.
 * @param {number} outline
 */
createjs.Text.prototype.setOutline = function(outline) {
  /// <param type="number" name="outline"/>
  var thickness = createjs.parseFloat(outline);
  if (this.outline_ != outline) {
    this.outline_ = outline;
    this.textDirty_ = true;
  }
};

/**
 * Returns the line height.
 * @return {number}
 */
createjs.Text.prototype.getLineHeight = function() {
  /// <returns type="number"/>
  return this.lineHeight_;
};

/**
 * Sets the line height.
 * @param {number} lineHeight
 */
createjs.Text.prototype.setLineHeight = function(lineHeight) {
  /// <param type="number" name="lineHeight"/>
  if (this.lineHeight_ != lineHeight) {
    this.lineHeight_ = lineHeight;
    this.textDirty_ = true;
  }
};

/**
 * Returns the line width.
 * @return {number}
 */
createjs.Text.prototype.getLineWidth = function() {
  /// <returns type="number"/>
  return this.lineWidth_;
};

/**
 * Sets the line width.
 * @param {number} lineWidth
 */
createjs.Text.prototype.setLineWidth = function(lineWidth) {
  /// <param type="number" name="lineWidth"/>
  if (this.lineWidth_ != lineWidth) {
    this.lineWidth_ = lineWidth;
    this.lines_ = null;
    this.textDirty_ = true;
  }
};

/**
 * Returns the measured, untransformed width of the text without wrapping. Use
 * Text.getBounds() for a more robust value.
 * @return {number} The measured, untransformed width of the text.
 */
createjs.Text.prototype.getMeasuredWidth = function() {
  /// <returns type="number"/>
  if (this.textDirty_ && this.text_) {
    this.paintCache_();
  }
  return this.width_;
};

/**
 * Returns an approximate line height of the text.
 * @return {number}
 */
createjs.Text.prototype.getMeasuredLineHeight = function() {
  /// <returns type="number"/>
  if (!this.lineAdvance_) {
    if (!createjs.Text.lineAdvances_[this.font_]) {
      // Multiply 1.2 with the width of 'M' to get the measured line height used
      // by CreateJS.
      var renderer = this.getRenderer_();
      renderer.setFont_(this.font_);
      createjs.Text.lineAdvances_[this.font_] =
          renderer.measureText_('M').width * 1.2;
    }
    this.lineAdvance_ = createjs.Text.lineAdvances_[this.font_];
  }
  return this.lineAdvance_;
};

/**
 * Returns the approximate height of multi-line text.
 * @return {number}
 */
createjs.Text.prototype.getMeasuredHeight = function() {
  /// <returns type="number"/>
  if (this.textDirty_ && this.text_) {
    this.paintCache_();
  }
  var length = this.lines_ ? this.lines_.length : 0;
  return this.lineAdvance_ * length;
};
  
/** @override */
createjs.Text.prototype.isVisible = function() {
  /// <returns type="boolean"/>
  return !!this.text_ && createjs.Text.superClass_.isVisible.call(this);
};

/** @override */
createjs.Text.prototype.handleAttach = function(flag) {
  /// <param type="number" name="flag"/>
};

/** @override */
createjs.Text.prototype.removeAllChildren = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
  this.handleDetach();
  this.text_ = '';
};

/** @override */
createjs.Text.prototype.handleDetach = function() {
  if (createjs.DEBUG) {
   --createjs.Counter.totalRenderers;
  }
  if (this.output_ && this.renderer_) {
    this.output_.uncache(this.renderer_.getCanvas_());
  }
  this.output_ = null;
  if (this.renderer_) {
    this.renderer_.destroy_();
  }
  this.renderer_ = null;
  this.textDirty_ = true;
};

/** @override */
createjs.Text.prototype.layout =
    function(renderer, parent, dirty, time, draw) {
  /// <param type="createjs.Renderer" name="renderer"/>
  /// <param type="createjs.DisplayObject" name="parent"/>
  /// <param type="number" name="dirty"/>
  /// <param type="number" name="time"/>
  /// <param type="number" name="draw"/>
  /// <returns type="number"/>
  if (this.textDirty_ && draw) {
    this.dirty |= createjs.DisplayObject.DIRTY_SHAPE;
    this.paintCache_();
  }
  if (!this.output_) {
    this.output_ = renderer;
  }
  return createjs.Text.superClass_.layout.call(
      this, renderer, parent, dirty, time, draw);
};

/** @override */
createjs.Text.prototype.paintObject = function(renderer) {
  /// <param type="createjs.Renderer" name="renderer"/>
  renderer.drawCanvas(this.renderer_.getCanvas_(), this.drawValues_);
};

/** @override */
createjs.Text.prototype.set = function(properties) {
  createjs.Text.superClass_.set.call(this, properties);
  var KEYS = {
    'text': createjs.Text.prototype.setText,
    'font': createjs.Text.prototype.setFont,
    'color': createjs.Text.prototype.setColor,
    'textAlign': createjs.Text.prototype.setTextAlign,
    'textBaseline': createjs.Text.prototype.setTextBaseline,
    'maxWidth': createjs.Text.prototype.setMaxWidth,
    'outline': createjs.Text.prototype.setOutline,
    'lineHeight': createjs.Text.prototype.setLineHeight,
    'lineWidth': createjs.Text.prototype.setLineWidth,
    'shadow': createjs.Text.prototype.setShadow
  };
  for (var key in properties) {
    var setter = KEYS[key];
    if (setter) {
      var value = properties[key];
      setter.call(this, value);
    }
  }
  return this;
};

/** @override */
createjs.Text.prototype.getBounds = function() {
  if (this.getBoundingBox().isEmpty()) {
    var width = this.getMeasuredWidth();
    this.setBoundingBox(0, 0, width, 0);
  }
  return createjs.Text.superClass_.getBounds.call(this);
};

/** @override */
createjs.Text.prototype.getTweenMotion = function(motion) {
  /// <param type="createjs.TweenMotion" name="motion"/>
  /// <returns type="boolean"/>
  if (!createjs.Text.superClass_.getTweenMotion.call(this, motion)) {
    return false;
  }
  motion.setText(this.text_);
  return true;
};

/** @override */
createjs.Text.prototype.setTweenMotion = function(motion, mask, proxy) {
  /// <param type="createjs.TweenMotion" name="motion"/>
  /// <param type="number" name="mask"/>
  /// <param type="createjs.DisplayObject" name="proxy"/>
  if (mask & (1 << createjs.Property.TEXT)) {
    var text = motion.getText();
    if (this.text_ != text) {
      this.text_ = text;
      this.lines_ = null;
      this.textDirty_ = true;
    }
  }
  createjs.Text.superClass_.setTweenMotion.call(this, motion, mask, proxy);
};

// Add getters and setters for applications to access internal variables.
Object.defineProperties(createjs.Text.prototype, {
  'text': {
    get: createjs.Text.prototype.getText,
    set: createjs.Text.prototype.setText
  },
  'font': {
    get: createjs.Text.prototype.getFont,
    set: createjs.Text.prototype.setFont
  },
  'color': {
    get: createjs.Text.prototype.getColor,
    set: createjs.Text.prototype.setColor
  },
  'textAlign': {
    get: createjs.Text.prototype.getTextAlign,
    set: createjs.Text.prototype.setTextAlign
  },
  'textBaseline': {
    get: createjs.Text.prototype.getTextBaseline,
    set: createjs.Text.prototype.setTextBaseline
  },
  'maxWidth': {
    get: createjs.Text.prototype.getMaxWidth,
    set: createjs.Text.prototype.setMaxWidth
  },
  'outline': {
    get: createjs.Text.prototype.getOutline,
    set: createjs.Text.prototype.setOutline
  },
  'lineHeight': {
    get: createjs.Text.prototype.getLineHeight,
    set: createjs.Text.prototype.setLineHeight
  },
  'lineWidth': {
    get: createjs.Text.prototype.getLineWidth,
    set: createjs.Text.prototype.setLineWidth
  }
});

// Export the createjs.Text object to the global namespace.
createjs.exportObject('createjs.Text', createjs.Text, {
  // createjs.Text methods
  'getMeasuredWidth': createjs.Text.prototype.getMeasuredWidth,
  'getMeasuredLineHeight': createjs.Text.prototype.getMeasuredLineHeight,
  'getMeasuredHeight': createjs.Text.prototype.getMeasuredHeight
  // createjs.DisplayObject methods
  // createjs.EventDispatcher methods
  // createjs.Object methods.
});
