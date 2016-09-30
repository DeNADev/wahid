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
/// <reference path="renderer.js"/>
/// <reference path="bounding_box.js"/>
/// <reference path="color.js"/>
/// <reference path="counter.js"/>
/// <reference path="config.js"/>

/**
 * A class that implements the createjs.Renderer interface with the WebGL API.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} context
 * @param {createjs.BoundingBox} viewport
 * @extends {createjs.Renderer}
 * @implements {EventListener}
 * @constructor
 */
createjs.WebGLRenderer = function(canvas, context, viewport) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <param type="Object" name="context"/>
  /// <param type="createjs.BoundingBox" name="viewport"/>
  createjs.Renderer.call(this, canvas, canvas.width, canvas.height);

  /**
   * The rendering context attached to the output <canvas> element.
   * @type {createjs.WebGLRenderer.Context}
   * @private
   */
  this.context_ = new createjs.WebGLRenderer.Context(
      /** @type {WebGLRenderingContext} */ (context));

  /**
   * The horizontal scale that converts an x position of Canvas 2D, i.e.
   * [0,width), to one of WebGL, i.e. [-1,1].
   * @type {number}
   * @private
   */
  this.scaleX_ = 2 / this.getWidth();

  /**
   * The vertical scale that converts a y position of Canvas 2D, i.e.
   * [0,height), to one of WebGL, i.e. [-1,1].
   * @type {number}
   * @private
   */
  this.scaleY_ = 2 / this.getHeight();

  /**
   * The viewport rectangle specified by a game. (This rectangle is used for
   * rendering only the specified part of the output <canvas> element.)
   * @type {createjs.BoundingBox}
   * @private
   */
  this.viewport_ = viewport;

  // Listen the context events of WebGL.
  canvas.addEventListener('webglcontextlost', this, false);
  canvas.addEventListener('webglcontextrestored', this, false);
  if (createjs.DEBUG) {
    document.addEventListener('keyup', this, false);
  }

  // Write the context used by this renderer.
  canvas.setAttribute('dena-context', createjs.WebGLRenderer.context);

  // Set the given viewport rectangle to the scissor rectangle now so this
  // renderer can render only its inside.
  if (viewport) {
    this.context_.enableClip();
    this.context_.updateClip(viewport, this.getHeight());
  }
};
createjs.inherits('WebGLRenderer', createjs.WebGLRenderer, createjs.Renderer);

/**
 * The context name for retrieving a WebGLRenderingContext object.
 * @type {string}
 */
createjs.WebGLRenderer.context = '';

/**
 * An ID assigned to createjs.WebGLRenderer.Context objects.
 * @type {number}
 */
createjs.WebGLRenderer.id = 0;

/**
 * The clipping rectangle of an object.
 * @type {createjs.BoundingBox}
 * @private
 */
createjs.WebGLRenderer.prototype.scissor_ = null;

/**
 * The shader program (and its variables) that draws images onto the drawing
 * buffer (or an off-screen framebuffer).
 * @type {createjs.WebGLRenderer.Program}
 * @private
 */
createjs.WebGLRenderer.prototype.program_ = null;

/**
 * Whether this renderer has render objects.
 * @type {boolean}
 * @private
 */
createjs.WebGLRenderer.prototype.dirty_ = false;

/**
 * An off-screen framebuffer that draws masked objects.
 * @type {createjs.WebGLRenderer.Frame}
 * @private
 */
createjs.WebGLRenderer.prototype.mask_ = null;

if (createjs.DEBUG) {
  /**
   * The interval period or the FPS of the 'createjs.Ticker' object.
   * @type {number}
   * @private
   */
  createjs.WebGLRenderer.ticker_ = 0;
}

/**
 * Constants used by WebGL. These constants are copied from the
 * WebGLRenderingContext interface so the closure compiler can inline them.
 * (Although it is dirty to use numbers, it is faster to use numbers than to
 * read object properties.)
 * @enum {number}
 * @const
 */
createjs.WebGLRenderer.gl = {
  /* ClearBufferMask */
  DEPTH_BUFFER_BIT: 0x00000100,
  STENCIL_BUFFER_BIT: 0x00000400,
  COLOR_BUFFER_BIT: 0x00004000,

  /* BeginMode */
  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006,

  /* BlendingFactor */
  ZERO: 0,
  ONE: 1,
  SRC_COLOR: 0x0300,
  ONE_MINUS_SRC_COLOR: 0x0301,
  SRC_ALPHA: 0x0302,
  ONE_MINUS_SRC_ALPHA: 0x0303,
  DST_ALPHA: 0x0304,
  ONE_MINUS_DST_ALPHA: 0x0305,
  DST_COLOR: 0x0306,
  ONE_MINUS_DST_COLOR: 0x0307,
  SRC_ALPHA_SATURATE: 0x0308,

  /* BlendEquationSeparate */
  FUNC_ADD: 0x8006,
  BLEND_EQUATION: 0x8009,
  BLEND_EQUATION_RGB: 0x8009,  /* same as BLEND_EQUATION */
  BLEND_EQUATION_ALPHA: 0x883D,

  /* BlendSubtract */
  FUNC_SUBTRACT: 0x800A,
  FUNC_REVERSE_SUBTRACT: 0x800B,

  /* Separate Blend Functions */
  BLEND_DST_RGB: 0x80C8,
  BLEND_SRC_RGB: 0x80C9,
  BLEND_DST_ALPHA: 0x80CA,
  BLEND_SRC_ALPHA: 0x80CB,
  CONSTANT_COLOR: 0x8001,
  ONE_MINUS_CONSTANT_COLOR: 0x8002,
  CONSTANT_ALPHA: 0x8003,
  ONE_MINUS_CONSTANT_ALPHA: 0x8004,
  BLEND_COLOR: 0x8005,

  /* Buffer Objects */
  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,
  ARRAY_BUFFER_BINDING: 0x8894,
  ELEMENT_ARRAY_BUFFER_BINDING: 0x8895,

  STREAM_DRAW: 0x88E0,
  STATIC_DRAW: 0x88E4,
  DYNAMIC_DRAW: 0x88E8,

  BUFFER_SIZE: 0x8764,
  BUFFER_USAGE: 0x8765,

  CURRENT_VERTEX_ATTRIB: 0x8626,

  /* CullFaceMode */
  FRONT: 0x0404,
  BACK: 0x0405,
  FRONT_AND_BACK: 0x0408,

  /* DepthFunction */
  /* NEVER: 0x0200, */
  /* LESS: 0x0201, */
  /* EQUAL: 0x0202, */
  /* LEQUAL: 0x0203, */
  /* GREATER: 0x0204, */
  /* NOTEQUAL: 0x0205, */
  /* GEQUAL: 0x0206, */
  /* ALWAYS: 0x0207, */

  /* EnableCap */
  /* TEXTURE_2D: 0x0DE1, */
  CULL_FACE: 0x0B44,
  BLEND: 0x0BE2,
  DITHER: 0x0BD0,
  STENCIL_TEST: 0x0B90,
  DEPTH_TEST: 0x0B71,
  SCISSOR_TEST: 0x0C11,
  POLYGON_OFFSET_FILL: 0x8037,
  SAMPLE_ALPHA_TO_COVERAGE: 0x809E,
  SAMPLE_COVERAGE: 0x80A0,

  /* ErrorCode */
  NO_ERROR: 0,
  INVALID_ENUM: 0x0500,
  INVALID_VALUE: 0x0501,
  INVALID_OPERATION: 0x0502,
  OUT_OF_MEMORY: 0x0505,

  /* FrontFaceDirection */
  CW: 0x0900,
  CCW: 0x0901,

  /* GetPName */
  LINE_WIDTH: 0x0B21,
  ALIASED_POINT_SIZE_RANGE: 0x846D,
  ALIASED_LINE_WIDTH_RANGE: 0x846E,
  CULL_FACE_MODE: 0x0B45,
  FRONT_FACE: 0x0B46,
  DEPTH_RANGE: 0x0B70,
  DEPTH_WRITEMASK: 0x0B72,
  DEPTH_CLEAR_VALUE: 0x0B73,
  DEPTH_FUNC: 0x0B74,
  STENCIL_CLEAR_VALUE: 0x0B91,
  STENCIL_FUNC: 0x0B92,
  STENCIL_FAIL: 0x0B94,
  STENCIL_PASS_DEPTH_FAIL: 0x0B95,
  STENCIL_PASS_DEPTH_PASS: 0x0B96,
  STENCIL_REF: 0x0B97,
  STENCIL_VALUE_MASK: 0x0B93,
  STENCIL_WRITEMASK: 0x0B98,
  STENCIL_BACK_FUNC: 0x8800,
  STENCIL_BACK_FAIL: 0x8801,
  STENCIL_BACK_PASS_DEPTH_FAIL: 0x8802,
  STENCIL_BACK_PASS_DEPTH_PASS: 0x8803,
  STENCIL_BACK_REF: 0x8CA3,
  STENCIL_BACK_VALUE_MASK: 0x8CA4,
  STENCIL_BACK_WRITEMASK: 0x8CA5,
  VIEWPORT: 0x0BA2,
  SCISSOR_BOX: 0x0C10,
  /* SCISSOR_TEST: 0x0C11, */
  COLOR_CLEAR_VALUE: 0x0C22,
  COLOR_WRITEMASK: 0x0C23,
  UNPACK_ALIGNMENT: 0x0CF5,
  PACK_ALIGNMENT: 0x0D05,
  MAX_TEXTURE_SIZE: 0x0D33,
  MAX_VIEWPORT_DIMS: 0x0D3A,
  SUBPIXEL_BITS: 0x0D50,
  RED_BITS: 0x0D52,
  GREEN_BITS: 0x0D53,
  BLUE_BITS: 0x0D54,
  ALPHA_BITS: 0x0D55,
  DEPTH_BITS: 0x0D56,
  STENCIL_BITS: 0x0D57,
  POLYGON_OFFSET_UNITS: 0x2A00,
  /* POLYGON_OFFSET_FILL: 0x8037, */
  POLYGON_OFFSET_FACTOR: 0x8038,
  TEXTURE_BINDING_2D: 0x8069,
  SAMPLE_BUFFERS: 0x80A8,
  SAMPLES: 0x80A9,
  SAMPLE_COVERAGE_VALUE: 0x80AA,
  SAMPLE_COVERAGE_INVERT: 0x80AB,

  /* DataType */
  BYTE: 0x1400,
  UNSIGNED_BYTE: 0x1401,
  SHORT: 0x1402,
  UNSIGNED_SHORT: 0x1403,
  INT: 0x1404,
  UNSIGNED_INT: 0x1405,
  FLOAT: 0x1406,

  /* PixelFormat */
  DEPTH_COMPONENT: 0x1902,
  ALPHA: 0x1906,
  RGB: 0x1907,
  RGBA: 0x1908,
  LUMINANCE: 0x1909,
  LUMINANCE_ALPHA: 0x190A,

  /* PixelType */
  /* UNSIGNED_BYTE: 0x1401, */
  UNSIGNED_SHORT_4_4_4_4: 0x8033,
  UNSIGNED_SHORT_5_5_5_1: 0x8034,
  UNSIGNED_SHORT_5_6_5: 0x8363,

  /* Shaders */
  FRAGMENT_SHADER: 0x8B30,
  VERTEX_SHADER: 0x8B31,
  MAX_VERTEX_ATTRIBS: 0x8869,
  MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB,
  MAX_VARYING_VECTORS: 0x8DFC,
  MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D,
  MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C,
  MAX_TEXTURE_IMAGE_UNITS: 0x8872,
  MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD,
  SHADER_TYPE: 0x8B4F,
  DELETE_STATUS: 0x8B80,
  LINK_STATUS: 0x8B82,
  VALIDATE_STATUS: 0x8B83,
  ATTACHED_SHADERS: 0x8B85,
  ACTIVE_UNIFORMS: 0x8B86,
  ACTIVE_ATTRIBUTES: 0x8B89,
  SHADING_LANGUAGE_VERSION: 0x8B8C,
  CURRENT_PROGRAM: 0x8B8D,

  /* StencilFunction */
  NEVER: 0x0200,
  LESS: 0x0201,
  EQUAL: 0x0202,
  LEQUAL: 0x0203,
  GREATER: 0x0204,
  NOTEQUAL: 0x0205,
  GEQUAL: 0x0206,
  ALWAYS: 0x0207,

  /* StencilOp */
  /* ZERO: 0, */
  KEEP: 0x1E00,
  REPLACE: 0x1E01,
  INCR: 0x1E02,
  DECR: 0x1E03,
  INVERT: 0x150A,
  INCR_WRAP: 0x8507,
  DECR_WRAP: 0x8508,

  /* StringName */
  VENDOR: 0x1F00,
  RENDERER: 0x1F01,
  VERSION: 0x1F02,

  /* TextureMagFilter */
  NEAREST: 0x2600,
  LINEAR: 0x2601,

  /* TextureMinFilter */
  /* NEAREST: 0x2600, */
  /* LINEAR: 0x2601, */
  NEAREST_MIPMAP_NEAREST: 0x2700,
  LINEAR_MIPMAP_NEAREST: 0x2701,
  NEAREST_MIPMAP_LINEAR: 0x2702,
  LINEAR_MIPMAP_LINEAR: 0x2703,

  /* TextureParameterName */
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,

  /* TextureTarget */
  TEXTURE_2D: 0x0DE1,
  TEXTURE: 0x1702,

  TEXTURE_CUBE_MAP: 0x8513,
  TEXTURE_BINDING_CUBE_MAP: 0x8514,
  TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515,
  TEXTURE_CUBE_MAP_NEGATIVE_X: 0x8516,
  TEXTURE_CUBE_MAP_POSITIVE_Y: 0x8517,
  TEXTURE_CUBE_MAP_NEGATIVE_Y: 0x8518,
  TEXTURE_CUBE_MAP_POSITIVE_Z: 0x8519,
  TEXTURE_CUBE_MAP_NEGATIVE_Z: 0x851A,
  MAX_CUBE_MAP_TEXTURE_SIZE: 0x851C,

  /* TextureUnit */
  TEXTURE0: 0x84C0,
  TEXTURE1: 0x84C1,
  TEXTURE2: 0x84C2,
  TEXTURE3: 0x84C3,
  TEXTURE4: 0x84C4,
  TEXTURE5: 0x84C5,
  TEXTURE6: 0x84C6,
  TEXTURE7: 0x84C7,
  TEXTURE8: 0x84C8,
  TEXTURE9: 0x84C9,
  TEXTURE10: 0x84CA,
  TEXTURE11: 0x84CB,
  TEXTURE12: 0x84CC,
  TEXTURE13: 0x84CD,
  TEXTURE14: 0x84CE,
  TEXTURE15: 0x84CF,
  TEXTURE16: 0x84D0,
  TEXTURE17: 0x84D1,
  TEXTURE18: 0x84D2,
  TEXTURE19: 0x84D3,
  TEXTURE20: 0x84D4,
  TEXTURE21: 0x84D5,
  TEXTURE22: 0x84D6,
  TEXTURE23: 0x84D7,
  TEXTURE24: 0x84D8,
  TEXTURE25: 0x84D9,
  TEXTURE26: 0x84DA,
  TEXTURE27: 0x84DB,
  TEXTURE28: 0x84DC,
  TEXTURE29: 0x84DD,
  TEXTURE30: 0x84DE,
  TEXTURE31: 0x84DF,
  ACTIVE_TEXTURE: 0x84E0,

  /* TextureWrapMode */
  REPEAT: 0x2901,
  CLAMP_TO_EDGE: 0x812F,
  MIRRORED_REPEAT: 0x8370,

  /* Uniform Types */
  FLOAT_VEC2: 0x8B50,
  FLOAT_VEC3: 0x8B51,
  FLOAT_VEC4: 0x8B52,
  INT_VEC2: 0x8B53,
  INT_VEC3: 0x8B54,
  INT_VEC4: 0x8B55,
  BOOL: 0x8B56,
  BOOL_VEC2: 0x8B57,
  BOOL_VEC3: 0x8B58,
  BOOL_VEC4: 0x8B59,
  FLOAT_MAT2: 0x8B5A,
  FLOAT_MAT3: 0x8B5B,
  FLOAT_MAT4: 0x8B5C,
  SAMPLER_2D: 0x8B5E,
  SAMPLER_CUBE: 0x8B60,

  /* Vertex Arrays */
  VERTEX_ATTRIB_ARRAY_ENABLED: 0x8622,
  VERTEX_ATTRIB_ARRAY_SIZE: 0x8623,
  VERTEX_ATTRIB_ARRAY_STRIDE: 0x8624,
  VERTEX_ATTRIB_ARRAY_TYPE: 0x8625,
  VERTEX_ATTRIB_ARRAY_NORMALIZED: 0x886A,
  VERTEX_ATTRIB_ARRAY_POINTER: 0x8645,
  VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 0x889F,

  /* Shader Source */
  COMPILE_STATUS: 0x8B81,

  /* Shader Precision-Specified Types */
  LOW_FLOAT: 0x8DF0,
  MEDIUM_FLOAT: 0x8DF1,
  HIGH_FLOAT: 0x8DF2,
  LOW_INT: 0x8DF3,
  MEDIUM_INT: 0x8DF4,
  HIGH_INT: 0x8DF5,

  /* Framebuffer Object. */
  FRAMEBUFFER: 0x8D40,
  RENDERBUFFER: 0x8D41,

  RGBA4: 0x8056,
  RGB5_A1: 0x8057,
  RGB565: 0x8D62,
  DEPTH_COMPONENT16: 0x81A5,
  STENCIL_INDEX: 0x1901,
  STENCIL_INDEX8: 0x8D48,
  DEPTH_STENCIL: 0x84F9,

  RENDERBUFFER_WIDTH: 0x8D42,
  RENDERBUFFER_HEIGHT: 0x8D43,
  RENDERBUFFER_INTERNAL_FORMAT: 0x8D44,
  RENDERBUFFER_RED_SIZE: 0x8D50,
  RENDERBUFFER_GREEN_SIZE: 0x8D51,
  RENDERBUFFER_BLUE_SIZE: 0x8D52,
  RENDERBUFFER_ALPHA_SIZE: 0x8D53,
  RENDERBUFFER_DEPTH_SIZE: 0x8D54,
  RENDERBUFFER_STENCIL_SIZE: 0x8D55,

  FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 0x8CD0,
  FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 0x8CD1,
  FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 0x8CD2,
  FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 0x8CD3,

  COLOR_ATTACHMENT0: 0x8CE0,
  DEPTH_ATTACHMENT: 0x8D00,
  STENCIL_ATTACHMENT: 0x8D20,
  DEPTH_STENCIL_ATTACHMENT: 0x821A,

  NONE: 0,

  FRAMEBUFFER_COMPLETE: 0x8CD5,
  FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 0x8CD6,
  FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 0x8CD7,
  FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 0x8CD9,
  FRAMEBUFFER_UNSUPPORTED: 0x8CDD,

  FRAMEBUFFER_BINDING: 0x8CA6,
  RENDERBUFFER_BINDING: 0x8CA7,
  MAX_RENDERBUFFER_SIZE: 0x84E8,

  INVALID_FRAMEBUFFER_OPERATION: 0x0506,

  /* WebGL-specific enums */
  UNPACK_FLIP_Y_WEBGL: 0x9240,
  UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
  CONTEXT_LOST_WEBGL: 0x9242,
  UNPACK_COLORSPACE_CONVERSION_WEBGL: 0x9243,
  BROWSER_DEFAULT_WEBGL: 0x9244
};

/**
 * An inner class that encapsulates the WebGL API to draw 2D shapes.
 * @param {WebGLRenderingContext} context
 * @constructor
 */
createjs.WebGLRenderer.Context = function(context) {
  /// <param type="WebGLRenderingContext" name="context"/>
  // This renderer uses premultiplied alpha due to color composition.
  context.pixelStorei(
      createjs.WebGLRenderer.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

  /**
   * The WebGL rendering context used by this object.
   * @type {WebGLRenderingContext}
   * @private
   */
  this.context_ = context;

  /**
   * An ID assigned to this context.
   * @type {number}
   * @private
   */
  this.id_ = ++createjs.WebGLRenderer.id;
};

/**
 * The WebGLTexture object bound to this context.
 * @type {WebGLTexture}
 * @private
 */
createjs.WebGLRenderer.Context.prototype.texture_ = null;

/**
 * Returns the WebGLRenderingContext object associated with this object.
 * @return {WebGLRenderingContext}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getContext_ = function() {
  /// <returns type="WebGLRenderingContext"/>
  return this.context_;
};

/**
 * Returns the ID assigned to this context. Returning 0 represents this context
 * does not have a drawing buffer.
 * @return {number}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getId = function() {
  /// <return type="number"/>
  return this.id_;
};

/**
 * Sets an ID to this context.
 * @param {number} id
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setId = function(id) {
  /// <param type="number" name="id"/>
  this.id_ = id;
};

/**
 * Creates a vertex shader or a fragment shader and compiles it.
 * @param {number} type
 * @param {string} source
 * @return {WebGLShader}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createShader = function(type, source) {
  /// <param type="number" name="type"/>
  /// <param type="string" name="source"/>
  /// <returns type="WebGLShader"/>
  var context = this.getContext_();
  var shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);
  createjs.assert(!!context.getShaderParameter(
      shader, createjs.WebGLRenderer.gl.COMPILE_STATUS));
  return shader;
};

/**
 * Creates a vertex shader and compiles it.
 * @param {string} source
 * @return {WebGLShader}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createVertexShader = function(source) {
  /// <param type="string" name="source"/>
  /// <returns type="WebGLShader"/>
  return this.createShader(createjs.WebGLRenderer.gl.VERTEX_SHADER, source);
};

/**
 * Creates a fragment shader and compiles it.
 * @param {string} source
 * @return {WebGLShader}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createFragmentShader =
    function(source) {
  /// <param type="string" name="source"/>
  /// <returns type="WebGLShader"/>
  return this.createShader(createjs.WebGLRenderer.gl.FRAGMENT_SHADER, source);
};

/**
 * Deletes a shader.
 * @param {WebGLShader} shader
 * @const
 */
createjs.WebGLRenderer.Context.prototype.deleteShader = function(shader) {
  this.getContext_().deleteShader(shader);
};

/**
 * Creates a shader program.
 * @param {WebGLShader} vertex
 * @param {WebGLShader} fragment
 * @return {WebGLProgram}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createProgram =
    function(vertex, fragment) {
  /// <param type="WebGLShader" name="vertex"/>
  /// <param type="WebGLShader" name="fragment"/>
  /// <returns type="WebGLProgram"/>
  var context = this.getContext_();
  var program = context.createProgram();
  context.attachShader(program, vertex);
  context.attachShader(program, fragment);
  context.linkProgram(program);
  context.useProgram(program);
  return program;
};

/**
 * Deletes a shader program.
 * @param {WebGLProgram} program
 * @const
 */
createjs.WebGLRenderer.Context.prototype.deleteProgram = function(program) {
  /// <param type="WebGLProgram" name="program"/>
  this.getContext_().deleteProgram(program);
};

/**
 * Binds the specified shader program and uses it.
 * @param {WebGLProgram} program
 * @const
 */
createjs.WebGLRenderer.Context.prototype.useProgram = function(program) {
  /// <param type="WebGLProgram" name="program"/>
  this.getContext_().useProgram(program);
};

/**
 * Returns the location to the specified color.
 * @param {WebGLProgram} program
 * @param {string} key
 * @return {WebGLUniformLocation}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getColor = function(program, key) {
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <returns type="WebGLUniformLocation"/>
  return this.getContext_().getUniformLocation(program, key);
};

/**
 * Sets the values of the specified color.
 * @param {WebGLUniformLocation} color
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {number} alpha
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setColor =
    function(color, red, green, blue, alpha) {
  /// <param type="WebGLUniformLocation" name="color"/>
  /// <param type="number" name="red"/>
  /// <param type="number" name="green"/>
  /// <param type="number" name="blue"/>
  /// <param type="number" name="alpha"/>
  this.getContext_().uniform4f(color, red, green, blue, alpha);
};

/**
 * Returns the location to the specified point.
 * @param {WebGLProgram} program
 * @param {string} key
 * @return {WebGLUniformLocation}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getPoint = function(program, key) {
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <returns type="WebGLUniformLocation"/>
  return this.getContext_().getUniformLocation(program, key);
};

/**
 * Sets the values of the specified point.
 * @param {WebGLUniformLocation} point
 * @param {number} x
 * @param {number} y
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setPoint = function(point, x, y) {
  /// <param type="WebGLUniformLocation" name="point"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  this.getContext_().uniform2f(point, x, y);
};

/**
 * Creates an array buffer used by rectangles with the specified values.
 * @param {Float32Array} points
 * @return {WebGLBuffer}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createRectangleBuffer =
    function(points) {
  /// <returns type="WebGLBuffer"/>
  var buffer = this.getContext_().createBuffer();
  this.setRectangleBuffer(buffer, points);
  return buffer;
};

/**
 * Deletes a WebGLBuffer object used by rectangles.
 * @param {WebGLBuffer} buffer
 * @const
 */
createjs.WebGLRenderer.Context.prototype.deleteRectangleBuffer =
    function(buffer) {
  /// <param type="WebGLBuffer" name="buffer"/>
  this.getContext_().deleteBuffer(buffer);
};

/**
 * Sets the specified values to the array buffer.
 * @param {WebGLBuffer} buffer
 * @param {Float32Array} points
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setRectangleBuffer =
    function(buffer, points) {
  /// <param type="WebGLBuffer" name="buffer"/>
  /// <param type="Float32Array" name="points"/>
  var context = this.getContext_();
  context.bindBuffer(createjs.WebGLRenderer.gl.ARRAY_BUFFER, buffer);
  context.bufferData(
      createjs.WebGLRenderer.gl.ARRAY_BUFFER,
      points,
      createjs.WebGLRenderer.gl.STATIC_DRAW);
};

/**
 * Retrieves the location to an attribute and assigns it to the WebGLBuffer
 * object currently bound to this context. (This method expects to be called
 * after a createRectangleBuffer() call or a setRectangleBuffer() call.)
 * @param {WebGLProgram} program
 * @param {string} key
 * @return {number}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getRectangleAttribute =
    function(program, key) {
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <returns type="number"/>
  var context = this.getContext_();
  var attribute = context.getAttribLocation(program, key);
  context.enableVertexAttribArray(attribute);
  context.vertexAttribPointer(
      attribute, 2, createjs.WebGLRenderer.gl.FLOAT, false, 0, 0);
  return attribute;
};

/**
 * Retrieves the location to the specified transform.
 * @param {WebGLProgram} program
 * @param {string} key
 * @return {WebGLUniformLocation}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getTransform = function(program, key) {
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <returns type="WebGLUniformLocation"/>
  return this.getContext_().getUniformLocation(program, key);
};

/**
 * Sets the values to the specified transform.
 * @param {WebGLUniformLocation} transform
 * @param {Float32Array} matrix
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setTransform =
    function(transform, matrix) {
  /// <param type="WebGLUniformLocation" name="transform"/>
  /// <param type="Float32Array" name="matrix"/>
  this.getContext_().uniformMatrix3fv(transform, false, matrix);
};

/**
 * Retrieves the location to the specified color matrix.
 * @param {WebGLProgram} program
 * @param {string} key
 * @return {WebGLUniformLocation}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getColorMatrix =
    function(program, key) {
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <returns type="WebGLUniformLocation"/>
  return this.getContext_().getUniformLocation(program, key);
};

/**
 * Sets the values to the specified color matrix.
 * @param {WebGLUniformLocation} color
 * @param {Float32Array} matrix
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setColorMatrix =
    function(color, matrix) {
  /// <param type="WebGLUniformLocation" name="color"/>
  /// <param type="Float32Array" name="matrix"/>
  this.getContext_().uniformMatrix4fv(color, false, matrix);
};

/**
 * Retrieves the texture type for the specified image.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @return {number}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.getTextureType = function(image) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  ///   <returns type="number"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  ///   <returns type="number"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLVideoElement" name="video"/>
  ///   <returns type="number"/>
  /// </signature>
  var TYPES = [
    createjs.WebGLRenderer.gl.UNSIGNED_BYTE,
    createjs.WebGLRenderer.gl.UNSIGNED_SHORT_4_4_4_4,
    createjs.WebGLRenderer.gl.UNSIGNED_SHORT_5_5_5_1,
    createjs.WebGLRenderer.gl.UNSIGNED_SHORT_5_6_5
  ];
  var format = image.format_ || 0;
  return TYPES[format];
};

/**
 * Creates a new texture from an HTMLImageElement object, an HTMLCanvasElement
 * object, or an HTMLVideoElement object.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @return {WebGLTexture}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createTexture = function(image) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  ///   <returns type="WebGLTexture"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  ///   <returns type="WebGLTexture"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLVideoElement" name="video"/>
  ///   <returns type="WebGLTexture"/>
  /// </signature>
  var context = this.getContext_();
  var texture = context.createTexture();
  var type = this.getTextureType(image);
  context.bindTexture(createjs.WebGLRenderer.gl.TEXTURE_2D, texture);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_WRAP_S,
                        createjs.WebGLRenderer.gl.CLAMP_TO_EDGE);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_WRAP_T,
                        createjs.WebGLRenderer.gl.CLAMP_TO_EDGE);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_MIN_FILTER,
                        createjs.WebGLRenderer.gl.LINEAR);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_MAG_FILTER,
                        createjs.WebGLRenderer.gl.LINEAR);
  context.texImage2D(createjs.WebGLRenderer.gl.TEXTURE_2D,
                     0,
                     createjs.WebGLRenderer.gl.RGBA,
                     createjs.WebGLRenderer.gl.RGBA,
                     type,
                     image);
  this.texture_ = texture;
  return texture;
};

/**
 * Deletes a texture.
 * @param {WebGLTexture} texture
 * @const
 */
createjs.WebGLRenderer.Context.prototype.deleteTexture = function(texture) {
  /// <param type="WebGLTexture" name="texture"/>
  this.getContext_().deleteTexture(texture);
};

/**
 * Binds the specified texture.
 * @param {WebGLTexture} texture
 * @const
 */
createjs.WebGLRenderer.Context.prototype.bindTexture = function(texture) {
  /// <param type="WebGLTexture" name="texture"/>
  if (this.texture_ === texture) {
    return;
  }
  this.getContext_().bindTexture(createjs.WebGLRenderer.gl.TEXTURE_2D, texture);
  this.texture_ = texture;
};

/**
 * Sets the filters of the texture bound to this context.
 * @param {boolean} smoothing
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setFilter = function(smoothing) {
  /// <param type="boolean" name="filter"/>
  var context = this.getContext_();
  var filter = smoothing ?
      createjs.WebGLRenderer.gl.LINEAR : createjs.WebGLRenderer.gl.NEAREST;
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_MIN_FILTER,
                        filter);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_MAG_FILTER,
                        filter);
};

/**
 * Updates the image of the texture bound to this context.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @const
 */
createjs.WebGLRenderer.Context.prototype.updateTexture = function(image) {
  /// <signature>
  ///   <param type="HTMLImageElement" name="image"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLCanvasElement" name="canvas"/>
  /// </signature>
  /// <signature>
  ///   <param type="HTMLVideoElement" name="video"/>
  /// </signature>
  var type = this.getTextureType(image);
  this.getContext_().texImage2D(createjs.WebGLRenderer.gl.TEXTURE_2D,
                                0,
                                createjs.WebGLRenderer.gl.RGBA,
                                createjs.WebGLRenderer.gl.RGBA,
                                type,
                                image);
};

/**
 * Creates a texture to be bound to a frame buffer.
 * @param {number} width
 * @param {number} height
 * @param {number} type
 * @return {WebGLTexture}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createFrameTexture =
    function(width, height, type) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" name="type"/>
  /// <returns type="WebGLTexture"/>
  var context = this.getContext_();
  var texture = context.createTexture();
  context.bindTexture(createjs.WebGLRenderer.gl.TEXTURE_2D, texture);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_WRAP_S,
                        createjs.WebGLRenderer.gl.CLAMP_TO_EDGE);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_WRAP_T,
                        createjs.WebGLRenderer.gl.CLAMP_TO_EDGE);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_MIN_FILTER,
                        createjs.WebGLRenderer.gl.LINEAR);
  context.texParameteri(createjs.WebGLRenderer.gl.TEXTURE_2D,
                        createjs.WebGLRenderer.gl.TEXTURE_MAG_FILTER,
                        createjs.WebGLRenderer.gl.LINEAR);
  context.texImage2D(createjs.WebGLRenderer.gl.TEXTURE_2D,
                     0,
                     createjs.WebGLRenderer.gl.RGBA,
                     width,
                     height,
                     0,
                     createjs.WebGLRenderer.gl.RGBA,
                     type,
                     null);
  this.texture_ = texture;
  return texture;
};

/**
 * Creates a new frame buffer and binds the specified texture to it.
 * @param {WebGLTexture} texture
 * @return {WebGLFramebuffer}
 * @const
 */
createjs.WebGLRenderer.Context.prototype.createFramebuffer = function(texture) {
  /// <param type="WebGLTexture" name="texture"/>
  /// <returns type="WebGLFramebuffer"/>
  var context = this.getContext_();
  var buffer = context.createFramebuffer();
  context.bindFramebuffer(createjs.WebGLRenderer.gl.FRAMEBUFFER, buffer);
  context.framebufferTexture2D(createjs.WebGLRenderer.gl.FRAMEBUFFER,
                               createjs.WebGLRenderer.gl.COLOR_ATTACHMENT0,
                               createjs.WebGLRenderer.gl.TEXTURE_2D,
                               texture,
                               0);
  return buffer;
};

/**
 * Deletes a frame buffer.
 * @param {WebGLFramebuffer} buffer
 * @const
 */
createjs.WebGLRenderer.Context.prototype.deleteFramebuffer = function(buffer) {
  /// <param type="WebGLFramebuffer" name="buffer"/>
  this.getContext_().deleteFramebuffer(buffer);
};

/**
 * Binds the specified frame buffer.
 * @param {WebGLFramebuffer} buffer
 * @const
 */
createjs.WebGLRenderer.Context.prototype.bindFramebuffer = function(buffer) {
  /// <param type="WebGLFramebuffer" name="buffer"/>
  var context = this.getContext_();
  context.bindFramebuffer(createjs.WebGLRenderer.gl.FRAMEBUFFER, buffer);
};

/**
 * Enables clipping.
 * @const
 */
createjs.WebGLRenderer.Context.prototype.enableClip = function() {
  this.getContext_().enable(createjs.WebGLRenderer.gl.SCISSOR_TEST);
};

/**
 * Updates the clipping rectangle. This method converts the given bounding box
 * (in the HTML coordinate) to a scissor rectangle (in the WebGL coordinate) and
 * uses the converted rectangle for the scissor test. (WebGL uses the bottom-up
 * coordinate system for scissor rectangles, i.e. (0,0) represents the
 * bottom-left corner of a scissor rectangle and (width,height) represents its
 * top-right corner, respectively.)
 * @param {createjs.BoundingBox} clip
 * @param {number} height
 * @const
 */
createjs.WebGLRenderer.Context.prototype.updateClip = function(clip, height) {
  /// <param type="createjs.BoundingBox" name="clip"/>
  /// <param type="number" name="height"/>
  var minX = clip.minX;
  var minY = clip.minY;
  var maxX = clip.maxX;
  var maxY = clip.maxY;
  this.getContext_().scissor(minX, height - maxY, maxX - minX, maxY - minY);
};

/**
 * Disables clipping.
 * @const
 */
createjs.WebGLRenderer.Context.prototype.disableClip = function() {
  this.getContext_().disable(createjs.WebGLRenderer.gl.SCISSOR_TEST);
};

/**
 * Clears the drawing buffer (or a framebuffer) bound to this context.
 * @const
 */
createjs.WebGLRenderer.Context.prototype.clear = function() {
  this.getContext_().clear(createjs.WebGLRenderer.gl.COLOR_BUFFER_BIT);
};

/**
 * Draws a rectangle. (This renderer uses a triangle strip as a rectangle.)
 * @const
 */
createjs.WebGLRenderer.Context.prototype.drawRectangle = function() {
  this.getContext_().drawArrays(createjs.WebGLRenderer.gl.TRIANGLE_STRIP, 0, 4);
};

/**
 * Enables color blending and initializes its equations.
 * @const
 */
createjs.WebGLRenderer.Context.prototype.enableBlend = function() {
  var context = this.getContext_();
  context.enable(createjs.WebGLRenderer.gl.BLEND);
  context.blendEquation(createjs.WebGLRenderer.gl.FUNC_ADD);
};

/**
 * Sets a blending function that emulates the specified composite operation.
 * This renderer renders only the region inside of a display object to be
 * rendered, i.e. it does not change its outside. This means it is hard to
 * emulate composite operations that needs to change the outside of a display
 * object, e.g. source-in, source-out, etc.
 * @param {number} operation
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setBlend = function(operation) {
  /// <param type="number" name="operation"/>
  var BLEND = [
    // source-over
    createjs.WebGLRenderer.gl.ONE,
    createjs.WebGLRenderer.gl.ONE_MINUS_SRC_ALPHA,
    // source-atop
    createjs.WebGLRenderer.gl.DST_ALPHA,
    createjs.WebGLRenderer.gl.ONE,
    // source-in (*)
    createjs.WebGLRenderer.gl.DST_ALPHA,
    createjs.WebGLRenderer.gl.ZERO,
    // source-out (*)
    createjs.WebGLRenderer.gl.ONE_MINUS_DST_ALPHA,
    createjs.WebGLRenderer.gl.ZERO,
    // destination-over
    createjs.WebGLRenderer.gl.ONE_MINUS_DST_ALPHA,
    createjs.WebGLRenderer.gl.ONE,
    // destination-atop (*)
    createjs.WebGLRenderer.gl.ONE,
    createjs.WebGLRenderer.gl.SRC_ALPHA,
    // destination-in (*)
    createjs.WebGLRenderer.gl.ZERO,
    createjs.WebGLRenderer.gl.SRC_ALPHA,
    // destination-out
    createjs.WebGLRenderer.gl.ZERO,
    createjs.WebGLRenderer.gl.ONE_MINUS_SRC_ALPHA,
    // lighter
    createjs.WebGLRenderer.gl.ONE,
    createjs.WebGLRenderer.gl.ONE,
    // copy
    createjs.WebGLRenderer.gl.ONE,
    createjs.WebGLRenderer.gl.ZERO,
    // xor
    createjs.WebGLRenderer.gl.ONE_MINUS_DST_ALPHA,
    createjs.WebGLRenderer.gl.ONE_MINUS_SRC_ALPHA,
    // darker (*)
    createjs.WebGLRenderer.gl.DST_COLOR,
    createjs.WebGLRenderer.gl.ONE,
    // multiply (*)
    createjs.WebGLRenderer.gl.ZERO,
    createjs.WebGLRenderer.gl.SRC_COLOR
  ];
  operation <<= 1;
  this.getContext_().blendFunc(BLEND[operation], BLEND[operation + 1]);
};

/**
 * Sets the viewport rectangle.
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.WebGLRenderer.Context.prototype.setViewport = function(width, height) {
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.getContext_().viewport(0, 0, width, height);
};

/**
 * An inner class that encapsulates a composite alpha used by this renderer.
 * This renderer uses a uniform vector (alpha, alpha, alpha, alpha) so it can
 * pre-multiply this composite alpha to RGB colors.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {WebGLProgram} program
 * @param {string} key
 * @param {number} alpha
 * @constructor
 */
createjs.WebGLRenderer.Alpha =
    function(context, program, key, alpha) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <param type="number" name="alpha"/>
  /**
   * The dirty flag.
   * @type {boolean}
   * @private
   */
  this.dirty_ = true;

  /**
   * The uniform location representing this color.
   * @type {WebGLUniformLocation}
   * @private
   */
  this.color_ = context.getColor(program, key);

  /**
   * The alpha component.
   * @type {number}
   * @private
   */
  this.alpha_ = alpha;
};

/**
 * Changes the alpha value of this color.
 * @param {number} alpha
 * @const
 */
createjs.WebGLRenderer.Alpha.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  if (this.alpha_ != alpha) {
    this.dirty_ = true;
    this.alpha_ = alpha;
  }
};

/**
 * Binds this color to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 */
createjs.WebGLRenderer.Alpha.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  if (this.dirty_) {
    this.dirty_ = false;
    context.setColor(
        this.color_, this.alpha_, this.alpha_, this.alpha_, this.alpha_);
  }
};

/**
 * An inner class that encapsulates a point used by this renderer. This renderer
 * uses a uniform vector (x, y) to represent a point.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {WebGLProgram} program
 * @param {string} key
 * @param {number} x
 * @param {number} y
 * @constructor
 */
createjs.WebGLRenderer.Vector = function(context, program, key, x, y) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /**
   * The dirty flag.
   * @type {boolean}
   * @private
   */
  this.dirty_ = true;

  /**
   * The uniform location representing this vector.
   * @type {WebGLUniformLocation}
   * @private
   */
  this.point_ = context.getPoint(program, key);

  /**
   * The x coordinate.
   * @type {number}
   * @private
   */
  this.x_ = x;

  /**
   * The y coordinate.
   * @type {number}
   * @private
   */
  this.y_ = y;
};

/**
 * Changes this point.
 * @param {number} x
 * @param {number} y
 */
createjs.WebGLRenderer.Vector.prototype.set = function(x, y) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  if (this.x_ != x || this.y_ != y) {
    this.dirty_ = true;
    this.x_ = x;
    this.y_ = y;
  }
};

/**
 * Binds this point to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 */
createjs.WebGLRenderer.Vector.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  if (this.dirty_) {
    this.dirty_ = false;
    context.setPoint(this.point_, this.x_, this.y_);
  }
};

/**
 * An inner class that encapsulates a rectangle used by this renderer. This
 * renderer uses a couple of triangles (0,0)-(width,0)-(0,height) and
 * (width,0)-(0,height)-(width,height) to represent a rectangle.
 *       (0,0) +--+ (width,0)
 *             | /|
 *             |/ |
 *  (0,height) +--+ (width,height)
 * @param {createjs.WebGLRenderer.Context} context
 * @param {WebGLProgram} program
 * @param {string} key
 * @param {number} width
 * @param {number} height
 * @constructor
 */
createjs.WebGLRenderer.Rectangle =
    function(context, program, key, width, height) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /**
   * An array representing this triable strip.
   * @type {Float32Array}
   * @private
   */
  this.points_ = new Float32Array([
    0, 0,
    width, 0,
    0, height,
    width, height
  ]);

  /**
   * The WebGL buffer (or GPU memory) stores the above array.
   * @type {WebGLBuffer}
   * @private
   */
  this.buffer_ = context.createRectangleBuffer(this.points_);

  /**
   * The attribute representing this rectangle.
   * @type {number}
   * @private
   */
  this.attribute_ = context.getRectangleAttribute(program, key);
};

/**
 * Deletes all resources used by this rectangle.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.Rectangle.prototype.destroy = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  context.deleteRectangleBuffer(this.buffer_);
};

/**
 * Sets this rectangle.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.WebGLRenderer.Rectangle.prototype.set = function(x, y, width, height) {
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  var minX = x;
  var minY = y;
  var maxX = x + width;
  var maxY = y + height;
  this.points_[0] = minX;
  this.points_[1] = minY;
  this.points_[2] = maxX;
  this.points_[3] = minY;
  this.points_[4] = minX;
  this.points_[5] = maxY;
  this.points_[6] = maxX;
  this.points_[7] = maxY;
};

/**
 * Binds this rectangle to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 */
createjs.WebGLRenderer.Rectangle.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  context.setRectangleBuffer(this.buffer_, this.points_);
};

/**
 * An inner class that encapsulates an affine transform used by this renderer.
 * This renderer uses a 3x3 matrix listed below to apply an affine
 * transform used by the Canvas 2D API in its vertex shader. (This class uses
 * transposed matrices because WebGL uses them by default.)
 *   | a  b  0 |
 *   | c  d  0 |
 *   | tx ty 1 |
 * @param {createjs.WebGLRenderer.Context} context
 * @param {WebGLProgram} program
 * @param {string} key
 * @constructor
 */
createjs.WebGLRenderer.Transform = function(context, program, key) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /**
   * The uniform location representing this transform.
   * @type {WebGLUniformLocation}
   * @private
   */
  this.transform_ = context.getTransform(program, key);

  /**
   * The transformation matrix.
   * @type {Float32Array}
   * @private
   */
  this.matrix_ = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);
};

/**
 * Sets this transform.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} tx
 * @param {number} ty
 */
createjs.WebGLRenderer.Transform.prototype.set = function(a, b, c, d, tx, ty) {
  /// <param type="number" name="a"/>
  /// <param type="number" name="b"/>
  /// <param type="number" name="c"/>
  /// <param type="number" name="d"/>
  /// <param type="number" name="tx"/>
  /// <param type="number" name="ty"/>
  this.matrix_[0] = a;
  this.matrix_[1] = b;
  this.matrix_[2] = 0;
  this.matrix_[3] = c;
  this.matrix_[4] = d;
  this.matrix_[5] = 0;
  this.matrix_[6] = tx;
  this.matrix_[7] = ty;
  this.matrix_[8] = 1;
};

/**
 * Binds this transform to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.Transform.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  context.setTransform(this.transform_, this.matrix_);
};

/**
 * An inner class that encapsulates a color-transform matrix used by a
 * color-matrix filter. This matrix is a transposed 4x4 matrix as listed below.
 * (The uniformMatrix4fv() method needs a transposed matrix on Chrome and
 * Firefox.)
 *   | m00 m10 m20 m30 |
 *   | m01 m11 m21 m31 |
 *   | m02 m12 m22 m32 |
 *   | m03 m13 m23 m33 |
 * @param {createjs.WebGLRenderer.Context} context
 * @param {WebGLProgram} program
 * @param {string} key
 * @constructor
 */
createjs.WebGLRenderer.ColorMatrix = function(context, program, key) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /**
   * The dirty flag.
   * @type {boolean}
   * @private
   */
  this.dirty_ = true;

  /**
   * The OpenGL attribute representing this matrix.
   * @type {WebGLUniformLocation}
   * @private
   */
  this.transform_ = context.getColorMatrix(program, key);

  /**
   * The values of this matrix.
   * @type {Float32Array}
   * @private
   */
  this.matrix_ = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
};

/**
 * Sets the values of this matrix. This method transposes the top-left 3x3
 * sub-matrix of the input matrix and copies its values. (The input matrix is a
 * matrix used by a color-matrix filter, i.e. a 5x5 matrix.)
 * @param {Array.<number>} matrix
 * @const
 */
createjs.WebGLRenderer.ColorMatrix.prototype.set = function(matrix) {
  /// <param type="Array" elementType="number" name="matrix"/>
  this.dirty_ = true;
  this.matrix_[0 * 4 + 0] = matrix[0 * 5 + 0];
  this.matrix_[0 * 4 + 1] = matrix[1 * 5 + 0];
  this.matrix_[0 * 4 + 2] = matrix[2 * 5 + 0];
  // this.matrix_[0 * 4 + 3] = matrix[3 * 5 + 0];
  this.matrix_[1 * 4 + 0] = matrix[0 * 5 + 1];
  this.matrix_[1 * 4 + 1] = matrix[1 * 5 + 1];
  this.matrix_[1 * 4 + 2] = matrix[2 * 5 + 1];
  // this.matrix_[1 * 4 + 3] = matrix[3 * 5 + 1];
  this.matrix_[2 * 4 + 0] = matrix[0 * 5 + 2];
  this.matrix_[2 * 4 + 1] = matrix[1 * 5 + 2];
  this.matrix_[2 * 4 + 2] = matrix[2 * 5 + 2];
  // this.matrix_[2 * 4 + 3] = matrix[3 * 5 + 2];
  // this.matrix_[3 * 4 + 0] = matrix[0 * 5 + 3];
  // this.matrix_[3 * 4 + 1] = matrix[1 * 5 + 3];
  // this.matrix_[3 * 4 + 2] = matrix[2 * 5 + 3];
  // this.matrix_[3 * 4 + 3] = matrix[3 * 5 + 3];
};

/**
 * Resets this matrix to the initial one, i.e. the identify matrix.
 * @const
 */
createjs.WebGLRenderer.ColorMatrix.prototype.reset = function() {
  this.matrix_[0 * 4 + 0] = 1;
  this.matrix_[0 * 4 + 1] = 0;
  this.matrix_[0 * 4 + 2] = 0;
  // this.matrix_[0 * 4 + 3] = 0;
  this.matrix_[1 * 4 + 0] = 0;
  this.matrix_[1 * 4 + 1] = 1;
  this.matrix_[1 * 4 + 2] = 0;
  // this.matrix_[1 * 4 + 3] = 0;
  this.matrix_[2 * 4 + 0] = 0;
  this.matrix_[2 * 4 + 1] = 0;
  this.matrix_[2 * 4 + 2] = 1;
  // this.matrix_[2 * 4 + 3] = 0;
  // this.matrix_[3 * 4 + 0] = 0;
  // this.matrix_[3 * 4 + 1] = 0;
  // this.matrix_[3 * 4 + 2] = 0;
  // this.matrix_[3 * 4 + 3] = 1;
};

/**
 * Binds this transform to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.ColorMatrix.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  if (this.dirty_) {
    this.dirty_ = false;
    context.setColorMatrix(this.transform_, this.matrix_);
  }
};

/**
 * An inner class that encapsulates a color offset used by a color-matrix
 * filter. This renderer uses a uniform vector (red, green, blue, 0) to
 * represent a color.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {WebGLProgram} program
 * @param {string} key
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @constructor
 */
createjs.WebGLRenderer.Color =
    function(context, program, key, red, green, blue) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="WebGLProgram" name="program"/>
  /// <param type="string" name="key"/>
  /// <param type="number" name="red"/>
  /// <param type="number" name="green"/>
  /// <param type="number" name="blue"/>
  /**
   * The dirty flag.
   * @type {boolean}
   * @private
   */
  this.dirty_ = true;

  /**
   * The uniform location representing this color.
   * @type {WebGLUniformLocation}
   * @private
   */
  this.color_ = context.getColor(program, key);

  /**
   * The red component.
   * @type {number}
   * @private
   */
  this.red_ = red;

  /**
   * The green component.
   * @type {number}
   * @private
   */
  this.green_ = green;

  /**
   * The blue component.
   * @type {number}
   * @private
   */
  this.blue_ = blue;
};

/**
 * Changes this color.
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @const
 */
createjs.WebGLRenderer.Color.prototype.set = function(red, green, blue) {
  /// <param type="number" name="red"/>
  /// <param type="number" name="green"/>
  /// <param type="number" name="blue"/>
  if (this.red_ != red || this.green_ != green || this.blue_ != blue) {
    this.dirty_ = true;
    this.red_ = red;
    this.green_ = green;
    this.blue_ = blue;
  }
};

/**
 * Binds this color to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 */
createjs.WebGLRenderer.Color.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  if (this.dirty_) {
    this.dirty_ = false;
    context.setColor(this.color_, this.red_, this.green_, this.blue_, 0);
  }
};

/**
 * An inner class that blends colors used by this renderer.
 * @param {createjs.WebGLRenderer.Context} context
 * @constructor
 */
createjs.WebGLRenderer.Blend = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /**
   * The dirty flag.
   * @type {boolean}
   * @private
   */
  this.dirty_ = true;

  /**
   * The composition ID.
   * @type {number}
   * @private
   */
  this.operation_ = createjs.Renderer.Composition.SOURCE_OVER;

  // Enable blending now to avoid enabling it every time when changing blend
  // functions. (This renderer always use blending with the add equation.)
  context.enableBlend();
};

/**
 * Sets the color-blend operation.
 * @param {number} operation
 * @const
 */
createjs.WebGLRenderer.Blend.prototype.setComposition = function(operation) {
  /// <param type="number" name="operation"/>
  if (this.operation_ != operation) {
    this.dirty_ = true;
    this.operation_ = operation;
  }
};

/**
 * Binds this color-blending operation to the specified context.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.Blend.prototype.bindContext = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  if (this.dirty_) {
    this.dirty_ = false;
    context.setBlend(this.operation_);
  }
};

/**
 * An inner class that encapsulates a frame buffer with an attached texture.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {number} width
 * @param {number} height
 * @param {number} mask
 * @constructor
 */
createjs.WebGLRenderer.Frame = function(context, width, height, mask) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" name="mask"/>
  /**
   * The texture that stores the pixels of this framebuffer.
   * @type {WebGLTexture}
   * @private
   */
  this.texture_ = context.createFrameTexture(width, height, mask);

  /**
   * The framebuffer.
   * @type {WebGLFramebuffer}
   * @private
   */
  this.buffer_ = context.createFramebuffer(this.texture_);
};

/**
 * Returns the texture associated with this frame buffer.
 * @return {WebGLTexture}
 * @const
 */
createjs.WebGLRenderer.Frame.prototype.getTexture = function() {
  /// <returns type="WebGLTexture"/>
  return this.texture_;
};

/**
 * Returns the frame buffer itself.
 * @return {WebGLFramebuffer}
 * @const
 */
createjs.WebGLRenderer.Frame.prototype.getBuffer = function() {
  /// <returns type="WebGLFramebuffer"/>
  return this.buffer_;
};

/**
 * Deletes the resources owned by this frame buffer.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.Frame.prototype.destroy = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  context.deleteFramebuffer(this.buffer_);
  context.deleteTexture(this.texture_);
  if (createjs.DEBUG) {
    this.buffer_ = null;
    this.texture_ = null;
  }
};

/**
 * An inner class that encapsulates a vertex shader and a fragment shader used
 * by this renderer.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {string} vertex
 * @param {string} fragment
 * @constructor
 */
createjs.WebGLRenderer.Shaders = function(context, vertex, fragment) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="string" name="vertex"/>
  /// <param type="string" name="fragment"/>
  /**
   * @const {WebGLShader}
   * @private
   */
  this.vertex_ = context.createVertexShader(vertex);

  /**
   * @const {WebGLShader}
   * @private
   */
  this.fragment_ = context.createFragmentShader(fragment);
};

/**
 * Deletes the vertex shader and the fragment shader owned by this object.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.Shaders.prototype.destroy = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  context.deleteShader(this.vertex_);
  context.deleteShader(this.fragment_);
};

/**
 * Returns the vertex shader owned by this object.
 * @return {WebGLShader}
 * @const
 */
createjs.WebGLRenderer.Shaders.prototype.getVertex = function() {
  /// <returns type="WebGLShader"/>
  return this.vertex_;
};

/**
 * Returns the vertex shader owned by this object.
 * @return {WebGLShader}
 * @const
 */
createjs.WebGLRenderer.Shaders.prototype.getFragment = function() {
  /// <returns type="WebGLShader"/>
  return this.fragment_;
};

/**
 * An inner class that encapsulates the shader program and its parameters used
 * by this renderer.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {number} scaleX
 * @param {number} scaleY
 * @constructor
 */
createjs.WebGLRenderer.Program = function(context, scaleX, scaleY) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="number" name="scaleX"/>
  /// <param type="number" name="scaleY"/>
  var POSITION = 'p';
  var TEXTURE = 't';
  var SCREEN = 's';
  var TRANSFORM = 'x';
  var UVPOINT = 'u';
  var COLOR = 'c';
  var IMAGE = 'i';
  var MATRIX = 'm';
  var OFFSET = 'o';
  var PIXEL = 'v';
  var VERTEX =
    'attribute vec2 ' + POSITION + ';' +
    'attribute vec2 ' + TEXTURE + ';' +
    'uniform vec2 ' + SCREEN + ';' +
    'uniform mat3 ' + TRANSFORM + ';' +
    'varying vec2 ' + UVPOINT + ';' +
    'void main(){' +
      'vec3 v=' + TRANSFORM + '*' +
          'vec3(' + POSITION + '[0],' + POSITION + '[1],1);' +
      'gl_Position=vec4(' +
          'v[0]*' + SCREEN + '[0]-1.0,' +
          'v[1]*' + SCREEN + '[1]+1.0,' +
          '0,' +
          '1);' +
      UVPOINT + '=' + TEXTURE + ';' +
    '}';
  var FRAGMENT =
    'precision mediump float;' +
    'varying vec2 ' + UVPOINT + ';' +
    'uniform vec4 ' + COLOR + ';' +
    'uniform mat4 ' + MATRIX + ';' +
    'uniform vec4 ' + OFFSET + ';' +
    'uniform sampler2D ' + IMAGE + ';' +
    'void main(){' +
      'vec4 ' + PIXEL + '=texture2D(' + IMAGE + ',' + UVPOINT + ');' +
      'gl_FragColor=' + COLOR + '*' +
          '(' + MATRIX + '*' + PIXEL + '+' + OFFSET + '*' + PIXEL + '[3]);' +
    '}';

  /**
   * The rendering context that owns this program.
   * @type {createjs.WebGLRenderer.Context}
   * @private
   */
  this.context_ = context;

  /**
   * The vertex shader and the fragment shader. (This program uses one vertex
   * shader and one fragment shader.)
   * @type {createjs.WebGLRenderer.Shaders}
   * @private
   */
  this.shaders_ = new createjs.WebGLRenderer.Shaders(
      context, VERTEX, FRAGMENT);

  /**
   * The shader program.
   * @type {WebGLProgram}
   * @private
   */
  this.program_ = context.createProgram(this.shaders_.getVertex(),
                                        this.shaders_.getFragment());

  /**
   * The vector representing the output <canvas> element of this program.
   * @type {createjs.WebGLRenderer.Vector}
   * @private
   */
  this.screen_ = new createjs.WebGLRenderer.Vector(
      context, this.program_, SCREEN, scaleX, -scaleY);

  /**
   * The affine transform used by CreateJS.
   * @type {createjs.WebGLRenderer.Transform}
   * @private
   */
  this.transform_ = new createjs.WebGLRenderer.Transform(
      context, this.program_, TRANSFORM);

  /**
   * The destination rectangle.
   * @type {createjs.WebGLRenderer.Rectangle}
   * @private
   */
  this.position_ = new createjs.WebGLRenderer.Rectangle(
      context, this.program_, POSITION, 0, 0);

  /**
   * The source rectangle.
   * @type {createjs.WebGLRenderer.Rectangle}
   * @private
   */
  this.texture_ = new createjs.WebGLRenderer.Rectangle(
      context, this.program_, TEXTURE, 1, 1);

  /**
   * The alpha-composition value.
   * @type {createjs.WebGLRenderer.Alpha}
   * @private
   */
  this.alpha_ = new createjs.WebGLRenderer.Alpha(
      context, this.program_, COLOR, 1);

  /**
   * The color matrix.
   * @type {createjs.WebGLRenderer.ColorMatrix}
   * @private
   */
  this.matrix_ = new createjs.WebGLRenderer.ColorMatrix(
      context, this.program_, MATRIX);

  /**
   * The color offset.
   * @type {createjs.WebGLRenderer.Color}
   * @private
   */
  this.offset_ = new createjs.WebGLRenderer.Color(
      context, this.program_, OFFSET, 0, 0, 0);

  /**
   * The blending operation.
   * @type {createjs.WebGLRenderer.Blend}
   * @private
   */
  this.blend_ = new createjs.WebGLRenderer.Blend(context);

  if (createjs.DEBUG) {
    /**
     * The images that have their textures created by this program.
     * @type {Object.<string,number>}
     * @private
     */
    this.ids_ = {};
  }
};

/**
 * Returns the rendering context who owns this program.
 * @return {createjs.WebGLRenderer.Context}
 * @private
 */
createjs.WebGLRenderer.Program.prototype.getContext_ = function() {
  /// <returns type="createjs.WebGLRenderer.Context"/>
  return this.context_;
};

/**
 * Binds the texture attached to the specified image to this context. This
 * method creates a new one if the specified image does not have a texture. (It
 * is very slow to create a texture from an image. To avoid creating textures
 * every time when this renderer renders the image, this method caches the
 * created textures and re-uses them.)
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @private
 */
createjs.WebGLRenderer.Program.prototype.bindImage_ = function(image) {
  /// <param type="HTMLImageElement" name="image"/>
  // Try creating a cache for this image and return if the cache() method
  // actually creates one and binds it to this context.
  if (this.cache(image)) {
    return;
  }
  var context = this.getContext_();
  context.bindTexture(/** @type {WebGLTexture} */ (image.texture_));
  if (image.dirty_) {
    image.dirty_ = false;
    context.updateTexture(image);
  }
};

/**
 * Draws the texture bound to this program.
 * @private
 */
createjs.WebGLRenderer.Program.prototype.drawTexture_ = function() {
  var context = this.getContext_();
  this.transform_.bindContext(context);
  this.position_.bindContext(context);
  this.texture_.bindContext(context);
  this.alpha_.bindContext(context);
  this.matrix_.bindContext(context);
  this.offset_.bindContext(context);
  this.blend_.bindContext(context);
  context.drawRectangle();
};

/**
 * Deletes the resources owned by this program.
 * @param {createjs.WebGLRenderer.Context} context
 * @const
 */
createjs.WebGLRenderer.Program.prototype.destroy = function(context) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  this.position_.destroy(context);
  this.texture_.destroy(context);
  context.deleteProgram(this.program_);
  this.shaders_.destroy(context);
  if (createjs.DEBUG) {
    this.position_ = null;
    this.texture_ = null;
    this.shaders_ = null;
    this.program_ = null;
    this.context_ = null;
  }
};

/**
 * Sets the specified transform.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} tx
 * @param {number} ty
 * @const
 */
createjs.WebGLRenderer.Program.prototype.setTransform =
    function(a, b, c, d, tx, ty) {
  /// <param type="number" name="a"/>
  /// <param type="number" name="b"/>
  /// <param type="number" name="c"/>
  /// <param type="number" name="d"/>
  /// <param type="number" name="tx"/>
  /// <param type="number" name="ty"/>
  this.transform_.set(a, b, c, d, tx, ty);
};

/**
 * Sets the alpha value.
 * @param {number} alpha
 * @const
 */
createjs.WebGLRenderer.Program.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  this.alpha_.setAlpha(alpha);
};

/**
 * Sets the color matrix used by the color-matrix filter.
 * @param {Array.<number>} matrix
 * @const
 */
createjs.WebGLRenderer.Program.prototype.setColorMatrix = function(matrix) {
  /// <param type="Array" elementType="number" name="matrix"/>
  if (matrix) {
    var COLOR_SCALE = 1 / 255;
    this.matrix_.set(matrix);
    this.offset_.set(matrix[0 * 5 + 4] * COLOR_SCALE,
                     matrix[1 * 5 + 4] * COLOR_SCALE,
                     matrix[2 * 5 + 4] * COLOR_SCALE);
  } else {
    this.matrix_.reset();
    this.offset_.set(0, 0, 0);
  }
};

/**
 * Sets the composition value.
 * @param {number} operation
 * @const
 */
createjs.WebGLRenderer.Program.prototype.setComposition = function(operation) {
  /// <param type="number" name="operation"/>
  this.blend_.setComposition(operation);
};

/**
 * Draws the specified image.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.WebGLRenderer.Program.prototype.drawImage =
    function(image, x, y, width, height) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.position_.set(x, y, width, height);
  this.texture_.set(0, 0, 1, 1);

  // Bind the given image and draw it.
  this.bindImage_(image);
  this.drawTexture_();
};

/**
 * Draws the specified part of an image.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @param {number} srcX
 * @param {number} srcY
 * @param {number} srcWidth
 * @param {number} srcHeight
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @const
 */
createjs.WebGLRenderer.Program.prototype.drawPartial =
    function(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="number" name="srcX"/>
  /// <param type="number" name="srcY"/>
  /// <param type="number" name="srcWidth"/>
  /// <param type="number" name="srcHeight"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.position_.set(x, y, width, height);
  var scaleX = 1 / image.width;
  var scaleY = 1 / image.height;
  this.texture_.set(
      srcX * scaleX, srcY * scaleY, srcWidth * scaleX, srcHeight * scaleY);

  // Bind the given image and draw it.
  this.bindImage_(image);
  this.drawTexture_();
};

/**
 * Creates a cache texture for the specified image and attaches it to the image.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @return {boolean}
 * @const
 */
createjs.WebGLRenderer.Program.prototype.cache = function(image) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <returns type="boolean"/>
  var context = this.getContext_();
  var texture = /** @type {WebGLTexture} */ (image.texture_);
  var tid = /** @type {number} */ (image.tid_);
  if (texture && tid == context.getId()) {
    return false;
  }
  // Create a texture and attach it to the given image. Also attach an ID of the
  // context that creates this texture to release the texture when the context
  // is lost.
  if (createjs.DEBUG) {
    if (!this.ids_[image.id]) {
      this.ids_[image.id] = 0;
    }
    this.ids_[image.id]++;
  }
  texture = context.createTexture(image);
  image.texture_ = texture;
  image.tid_ = context.getId();
  return true;
};

/**
 * Deletes the cache texture attached to the specified image.
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
 * @const
 */
createjs.WebGLRenderer.Program.prototype.uncache = function(image) {
  /// <param type="HTMLImageElement" name="image"/>
  var texture = /** @type {WebGLTexture} */ (image.texture_);
  image.texture_ = null;
  var context = this.getContext_();
  if (texture && context) {
    context.deleteTexture(texture);
    if (createjs.DEBUG) {
      --this.ids_[image.id];
    }
  }
};

/**
 * Draws the specified frame buffer.
 * @param {createjs.WebGLRenderer.Frame} frame
 * @param {number} width
 * @param {number} height
 * @param {number} composition
 * @private
 * @const
 */
createjs.WebGLRenderer.Program.prototype.drawFrame =
    function(frame, width, height, composition) {
  /// <param type="createjs.WebGLRenderer.Frame" name="frame"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" name="composition"/>

  // Reset all variables used by the shader program. The texture of a frame
  // buffer is an OpenGL texture and its origin is its bottom-left corner. On
  // the other hand, this program is for rendering HTML objects and assumes
  // their origins are their top-left corners. This code applies the following
  // affine transformation (a vertical flip) to absorb this coordinate
  // difference.
  //   | 1 0      0 |
  //   | 0 -1     0 |
  //   | 0 height 1 |
  this.position_.set(0, 0, width, height);
  this.texture_.set(0, 0, 1, 1);
  this.setTransform(1, 0, 0, -1, 0, height);
  this.setAlpha(1);
  this.setComposition(composition);

  // Bind the given frame buffer and draw it.
  this.getContext_().bindTexture(frame.getTexture());
  this.drawTexture_();
};

/**
 * Starts drawing to the drawing buffer with this program.
 * @param {number} scaleX
 * @param {number} scaleY
 * @private
 */
createjs.WebGLRenderer.Program.prototype.beginPaint_ =
    function(scaleX, scaleY) {
  /// <param type="number" name="scaleX"/>
  /// <param type="number" name="scaleY"/>
  this.screen_.set(scaleX, -scaleY);
  this.screen_.bindContext(this.getContext_());
};

/**
 * Ends drawing to the drawing buffer with this program.
 * @private
 */
createjs.WebGLRenderer.Program.prototype.endPaint_ = function() {
};

/**
 * Returns the rendering context attached to this renderer.
 * @return {createjs.WebGLRenderer.Context}
 * @private
 */
createjs.WebGLRenderer.prototype.getContext_ = function() {
  /// <returns type="createjs.WebGLRenderer.Context"/>
  return this.context_;
};

/**
 * Returns the shader program used for drawing images or canvases.
 * @return {createjs.WebGLRenderer.Program}
 * @private
 */
createjs.WebGLRenderer.prototype.getProgram_ = function() {
  /// <returns type="createjs.WebGLRenderer.Program"/>
  if (!this.program_) {
    this.program_ = new createjs.WebGLRenderer.Program(
        this.context_, this.scaleX_, this.scaleY_);
  }
  return this.program_;
};

/**
 * Returns the framebuffer used for rendering a masked object.
 * @param {createjs.WebGLRenderer.Context} context
 * @return {createjs.WebGLRenderer.Frame}
 * @private
 * @const
 */
createjs.WebGLRenderer.prototype.getMask_ = function(context) {
  /// <param type="createjs.WebGLRenderer.Frame" name="context"/>
  /// <returns type="createjs.WebGLRenderer.Frame"/>
  if (!this.mask_) {
    this.mask_ = new createjs.WebGLRenderer.Frame(
        context,
        this.getWidth(),
        this.getHeight(),
        createjs.WebGLRenderer.gl.UNSIGNED_SHORT_4_4_4_4);
  } else {
    context.bindFramebuffer(this.mask_.getBuffer());
  }
  context.clear();
  return this.mask_;
};

/**
 * Draws a masked object to the drawing buffer. This method copies the pixels of
 * the off-screen framebuffer used for rendering masked objects to the drawing
 * buffer.
 * @param {createjs.WebGLRenderer.Frame} frame
 * @param {number} width
 * @param {number} height
 * @param {number} composition
 * @private
 */
createjs.WebGLRenderer.prototype.drawMask_ =
    function(frame, width, height, composition) {
  /// <param type="createjs.WebGLRenderer.Frame" name="frame"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="number" name="composition"/>
  this.program_.drawFrame(
      frame, width, height, createjs.Renderer.Composition.SOURCE_OVER);
};

/**
 * Changes the scissor rectangle. This renderer uses two scissor rectangles:
 * * A viewport rectangle used by a game to render only the specified part of
 *   the output <canvas> element, and;
 * * A bounding box of a mask.
 * This method automatically enables the scissor test and sets the specified
 * rectangle. (A scissor test is not so fast on some Android 4.0 devices and
 * this renderer uses it only when it has to.)
 * @param {createjs.WebGLRenderer.Context} context
 * @param {createjs.BoundingBox} scissor
 * @param {number} height
 * @private
 */
createjs.WebGLRenderer.prototype.updateScissor_ =
    function(context, scissor, height) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="createjs.BoundingBox" name="scissor"/>
  /// <param type="number" name="height"/>
  if (this.scissor_ && this.scissor_.isEqual(scissor)) {
    return;
  }
  // Enable the scissor test when this renderer has not enabled it, i.e. this
  // renderer does not have either a scissor rectangle or a clipping rectangle.
  if (!this.scissor_ && !this.viewport_) {
    context.enableClip();
  }
  this.scissor_ = scissor;
  context.updateClip(scissor, height);
};

/**
 * Destroys the scissor rectangle. This method also restores the scissor
 * rectangle to the viewport rectangle.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {number} height
 * @private
 */
createjs.WebGLRenderer.prototype.destroyScissor_ = function(context, height) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="number" name="height"/>
  if (this.scissor_) {
    if (!this.viewport_) {
      context.disableClip();
    } else {
      context.updateClip(this.viewport_, height);
    }
    this.scissor_ = null;
  }
};

/**
 * Draws a render object to the output framebuffer.
 * @param {createjs.WebGLRenderer.Context} context
 * @param {number} width
 * @param {number} height
 * @param {createjs.Renderer.RenderObject} object
 * @private
 */
createjs.WebGLRenderer.prototype.drawObject_ =
    function(context, width, height, object) {
  /// <param type="createjs.WebGLRenderer.Context" name="context"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  /// <param type="createjs.Renderer.RenderObject" name="object"/>
  if (createjs.DEBUG) {
    ++createjs.Counter.paintedObjects;
  }
  var scissor = object.getClip();
  if (!scissor || !scissor.getMethod()) {
    this.destroyScissor_(context, height);
  } else if (!scissor.getShape()) {
    this.updateScissor_(context, scissor.getBox(), height);
  } else {
    // It is tricky to draw a masked object. This code draws a masked object
    // with the steps listed below.
    // 1. Get an empty frame buffer used for composing a render object with a
    //    mask;
    // 2. Enable a scissor test with the bounding box of the mask to prevent
    //    the render object from being rendered outside of the mask;
    // 3. Draw the render object with the SOURCE_OVER operation;
    // 4. Draw the mask bitmap (a bitmap filled in white) with the
    //    DESTINATION-IN operation to get the intersection between the render
    //    object and the mask, and;
    // 5. Draw the frame buffer to this frame buffer.
    var frame = this.getMask_(context);
    if (!this.scissor_) {
      context.enableClip();
    }
    context.updateClip(scissor.getBox(), height);
    object.beginPaintObject(this);
    object.paintObject(this);
    var shape = scissor.getShape();
    shape.beginPaintObject(this);
    shape.paintObject(this);
    if (!this.scissor_) {
      context.disableClip();
    } else {
      context.updateClip(this.scissor_, height);
    }
    context.bindFramebuffer(null);
    this.drawMask_(frame, width, height, scissor.getComposition());
    return;
  }
  object.beginPaintObject(this);
  object.paintObject(this);
};

/** @override */
createjs.WebGLRenderer.prototype.destroy = function() {
  var canvas = this.getCanvas();
  if (canvas) {
    canvas.removeEventListener('webglcontextlost', this, false);
    canvas.removeEventListener('webglcontextrestored', this, false);
    if (createjs.DEBUG) {
      document.removeEventListener('keyup', this, false);
    }
  }
  var context = this.getContext_();
  if (context) {
    if (this.mask_) {
      this.mask_.destroy(context);
      this.mask_ = null;
    }
    var layer = this.layer_;
    if (layer) {
      layer.destroy(context);
      this.layer_ = null;
    }
    var program = this.program_;
    if (program) {
      program.destroy(context);
      this.program_ = null;
    }
  }
};

/** @override */
createjs.WebGLRenderer.prototype.setTransformation =
    function(a, b, c, d, tx, ty) {
  /// <param type="number" name="a"/>
  /// <param type="number" name="b"/>
  /// <param type="number" name="c"/>
  /// <param type="number" name="d"/>
  /// <param type="number" name="tx"/>
  /// <param type="number" name="ty"/>
  this.getProgram_().setTransform(a, b, c, d, tx, ty);
};

/** @override */
createjs.WebGLRenderer.prototype.setAlpha = function(alpha) {
  /// <param type="number" name="alpha"/>
  this.getProgram_().setAlpha(alpha);
};

/** @override */
createjs.WebGLRenderer.prototype.setColorMatrix = function(matrix) {
  /// <param type="Array" elementType="number" name="matrix"/>
  this.getProgram_().setColorMatrix(matrix);
};

/** @override */
createjs.WebGLRenderer.prototype.setComposition = function(operation) {
  /// <param type="number" name="operation"/>
  this.getProgram_().setComposition(operation);
};

/** @override */
createjs.WebGLRenderer.prototype.drawCanvas =
    function(canvas, x, y, width, height) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.getProgram_().drawImage(canvas, x, y, width, height);
};

/** @override */
createjs.WebGLRenderer.prototype.getExtensions = function() {
  /// <returns type="number"/>
  if (createjs.UserAgent.isMSIE()) {
    return 0;
  }
  return createjs.Renderer.Extension.VIDEO;
};

/** @override */
createjs.WebGLRenderer.prototype.drawVideo =
    function (video, x, y, width, height) {
  /// <param type="HTMLVideoElement" name="video"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.getProgram_().drawImage(video, x, y, width, height);
};

/** @override */
createjs.WebGLRenderer.prototype.drawPartial =
    function(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height) {
  /// <param type="HTMLImageElement" name="image"/>
  /// <param type="number" name="srcX"/>
  /// <param type="number" name="srcY"/>
  /// <param type="number" name="srcWidth"/>
  /// <param type="number" name="srcHeight"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <param type="number" name="width"/>
  /// <param type="number" name="height"/>
  this.getProgram_().drawPartial(
      image, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
};

/** @override */
createjs.WebGLRenderer.prototype.addObject = function(object) {
  /// <param type="createjs.Renderer.RenderObject" name="object"/>
  var context = this.getContext_();
  if (context.getId()) {
    this.drawObject_(
          context, this.getWidth(), this.getHeight(), object);
    this.dirty_ = true;
    if (createjs.DEBUG) {
      ++createjs.Counter.visibleObjects;
    }
  }
};

/** @override */
createjs.WebGLRenderer.prototype.uncache = function(image) {
  /// <param type="HTMLImageElement" name="image"/>
  this.getProgram_().uncache(image);
};

/** @override */
createjs.WebGLRenderer.prototype.begin = function() {
  // Synchronize the viewport (and a uniform vector) with the <canvas> width and
  // its height.
  var canvas = this.getCanvas();
  var width = canvas.width;
  var height = canvas.height;
  if (width != this.getWidth() || height != this.getHeight()) {
    this.setWidth(width);
    this.setHeight(height);
    this.scaleX_ = 2 / width;
    this.scaleY_ = 2 / height;
    this.getContext_().setViewport(width, height);
  }
  this.getProgram_().beginPaint_(this.scaleX_, this.scaleY_);
};

/** @override */
createjs.WebGLRenderer.prototype.paint = function(time) {
  /// <param type="number" name="time"/>
  // Exit this renderer loses its WebGL context.
  if (!this.getContext_().getId()) {
    return;
  }
  // Clear the drawing buffer only when this renderer have to draw a blank
  // page. (Some Android 4.1.x browsers needs to trigger DOM reflow in clearing
  // the drawing buffer, i.e. it is very slow to manually clear the output
  // framebuffer. This renderer clears the output framebuffer only when this
  // renderer has to clear it to avoid DOM reflow.)
  var program = this.getProgram_();
  var context = this.getContext_();
  if (!this.dirty_) {
    context.clear();
    // Trigger DOM reflow on Android 4.1.x browsers that have the bug:
    //   <https://code.google.com/p/android/issues/detail?id=39247>.
    // This bug happens in clearing the drawing buffer on Android 4.1.x browsers
    // that implement WebGL (e.g. Softbank Mobile ARROWS A 101F, ASUS Memo Pad
    // ME173X).
    this.updateCanvas('webgl');
  }
  if (this.scissor_) {
    context.disableClip();
    this.scissor_ = null;
  }
  program.endPaint_();
  this.dirty_ = false;
};

/** @override */
createjs.WebGLRenderer.prototype.handleEvent = function(event) {
  /// <param type="KeyboardEvent" name="event"/>
  if (createjs.DEBUG && event.type == 'keyup') {
    var keyEvent = /** @type {KeyboardEvent} */ (event);
    var keyCode = keyEvent.keyCode;
    if (keyCode == createjs.Event.KeyCodes.E) {
      if (!createjs.WebGLRenderer.ticker_) {
        createjs.WebGLRenderer.ticker_ = createjs.Ticker.getInterval();
        createjs.Ticker.setInterval(1000);
      } else {
        createjs.Ticker.setInterval(createjs.WebGLRenderer.ticker_);
        createjs.WebGLRenderer.ticker_ = 0;
      }
    }
    return;
  }
  createjs.assert(event.type == 'webglcontextlost' ||
                  event.type == 'webglcontextrestored');
  if (event.type == 'webglcontextlost') {
    // Release the shader program and the frame buffers used by this renderer.
    // (Textures will be released the next time when this renderer accesses
    // them.)
    this.layer_ = null;
    this.program_ = null;
    this.getContext_().setId(0);

    // Wait for a drawing buffer to be restored.
    event.preventDefault();
  } else {
    // Assign a new context ID to recreate the textures created by the released
    // context.
    this.getContext_().setId(++createjs.WebGLRenderer.id);
  }
};
