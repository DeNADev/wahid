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

/**
 * The top-level namespace of this library. All objects in this library must be
 * defined under this namespace to prevent exporting them to the global
 * namespace.
 * @namespace createjs
 */
var createjs = {};

/**
 * Represents the major version of the original CreateJS library.
 * @define {number}
 */
createjs.MAJOR_VERSION = 7;

/**
 * Represents the minor version of the original CreateJS library.
 * @define {number}
 */
createjs.MINOR_VERSION = 1;

/**
 * Represents the major version of this library.
 * @define {number}
 */
createjs.DENA_MAJOR_VERSION = 0;

/**
 * Represents the minor version of this library.
 * @define {number}
 */
createjs.DENA_MINOR_VERSION = 8;

/**
 * Represents the build number of this library. (This define is a placeholder
 * and overridden by make.)
 * @define {number}
 */
createjs.DENA_BUILD_NUMBER = 0;

/**
 * Represents the patch level of this library. (This define is a placeholder and
 * overridden by make.)
 * @define {number}
 */
createjs.DENA_PATCH_LEVEL = 0;

/**
 * Represents whether this library is compiled with the Closure compiler.
 * @define {boolean}
 */
createjs.COMPILED = false;

/**
 * Represents whether to enable debugging features.
 * @define {boolean}
 */
createjs.DEBUG = false;

/**
 * An alias of true. (This define is used only for commenting out unused code.)
 * @define {boolean}
 */
createjs.TRUE = true;

/**
 * An alias of false. (This define is used only for commenting out unused code.)
 * @define {boolean}
 */
createjs.FALSE = false;

/**
 * Represents whether this library uses a network cache.
 * @define {boolean}
 */
createjs.USE_CACHE = false;

/**
 * Represents the database name used by our network cache.
 * @define {string}
 */
createjs.CACHE_DATABASE = 'DeNA';

/**
 * Represents the table name used by our network cache.
 * @define {string}
 */
createjs.CACHE_TABLE = 'CreateJS';

/**
 * Represents the default texture format. This value is used in creating WebGL
 * textures from HTML elements (i.e. <img> elements, <canvas> elements, and
 * <video> elements) that do not specify their texture types.
 *   +-------+------------------------+
 *   | value | texture format         |
 *   +-------+------------------------+
 *   | 0     | UNSIGNED_BYTE          |
 *   | 1     | UNSIGNED_SHORT_4_4_4_4 |
 *   | 2     | UNSIGNED_SHORT_5_5_5_1 |
 *   | 3     | UNSIGNED_SHORT_5_6_5   |
 *   +-------+------------------------+
 * @define {number}
 */
createjs.DEFAULT_TEXTURE = 1;

/**
 * Represents whether to create a module compliant with AMD (Asynchronous Module
 * Definition).
 * @define {boolean}
 */
createjs.SUPPORT_AMD = false;

/**
 * Represents whether the createjs.Sound class uses an <iframe> element to play
 * sounds. (This is a workaround for Chrome for Android, where it is slow to
 * decode audio.)
 * @define {boolean}
 */
createjs.USE_FRAME = true;

/**
 * Represents whether to read pixels in hit-testing.
 * @define {boolean}
 */
createjs.USE_PIXEL_TEST = true;

/**
 * A reference to the global context. (This is used as a short-cut to the global
 * Window object.)
 * @const {Window}
 */
createjs.global = this;

/**
 * The URL interface.
 * @type {URL}
 */
createjs.URL =
    createjs.global['URL'] || createjs.global['webkitURL'];

/**
 * The constructor of the BlobBuilder class.
 * @type {function(new:BlobBuilder)}
 */
createjs.BlobBuilder = createjs.global['WebKitBlobBuilder'];

/**
 * The constructor of the AudioContext class.
 * @const {function(new:AudioContext)}
 */
createjs.AudioContext =
    createjs.global['webkitAudioContext'] || createjs.global['AudioContext'];

/**
 * The commands used for communicating with a createjs.FramePlayer object,
 * which runs on an <iframe> element.
 * @enum {number}
 */
createjs.FrameCommand = {
  LOAD: 0,
  PLAY: 1,
  STOP: 2,
  SET_VOLUME: 3,
  INITIALIZE: 4,
  TOUCH: 5,
  DECODE: 6,
  END: 7,
  CLONE: 8
};

/**
 * The current origin.
 * @type {string}
 */
createjs.origin_ = location.origin || location.protocol + '//' + location.host;

/**
 * Writes a log message to a console.
 * @param {string} message
 */
createjs.log = function(message) {
  /// <param type="string" name="message"/>
  if ((createjs.DEBUG) && createjs.global.console) {
    console.log(message);
  }
};

/**
 * Writes a log message to a console.
 * @param {string} message
 */
createjs.debug = function(message) {
  /// <param type="string" name="message"/>
  if (createjs.DEBUG) {
    createjs.log(message);
  }
};

/**
 * Throws an error.
 * @param {string} message
 */
createjs.error = function(message) {
  /// <param type="string" name="message"/>
  throw new Error(message);
};

/**
 * Throws an error if the specified condition is false.
 * @param {boolean} condition
 */
createjs.assert = function(condition) {
  /// <param type="boolean" name="condition"/>
  if (createjs.DEBUG && !condition) {
    createjs.error('assertion failed');
  }
};

/**
 * Writes a 'NOT IMPLEMENTED' error to the debug console.
 */
createjs.notImplemented = function() {
  if (createjs.DEBUG) {
    createjs.debug('NOT IMPLEMENTED');
  }
};

/**
 * Writes a 'NOT REACHED' message. This function is put the place where its code
 * should not be executed to tell callers that they did unsupported behaviors.
 */
createjs.notReached = function() {
  createjs.debug('NOT REACHED');
};

/**
 * Inherits the prototype methods from a parent constructor into a child one.
 * This function creates a temporary class that copies the prototype methods of
 * the parent class and creates it to avoid calling the parent constructor
 * directly. (It may cause a crash to call the parent constructor without
 * arguments.)
 * @param {string} name
 * @param {Function} child
 * @param {Function} parent
 */
createjs.inherits = function(name, child, parent) {
  /// <param type="string" name="name"/>
  /// <param type="Function" name="child"/>
  /// <param type="Function" name="parent"/>
  child.superClass_ = parent.prototype;
  createjs.assert(!!Object.create);
  child.prototype = Object.create(parent.prototype);
  /** @override */
  child.prototype.constructor = child;
};

/**
 * Exposes an object and its member methods to the global namespace path.
 * @param {string} name
 * @param {Object} object
 * @param {Object.<string,Function>} methods
 * @param {Object.<string,Function>=} opt_statics
 */
createjs.exportObject = function(name, object, methods, opt_statics) {
  /// <param type="string" name="name"/>
  /// <param type="Object" name="object"/>
  /// <param type="Object" name="methods"/>
  /// <param type="Object" optional="true" name="opt_statics"/>
  if (!createjs.SUPPORT_AMD) {
    var context = createjs.global;
    var parts = name.split('.');
    var length = parts.length - 1;
    for (var i = 0; i < length; ++i) {
      var part = parts[i];
      if (!context[part]) {
        context[part] = {};
      }
      context = context[part];
    }
    context[parts[length]] = object;
  }
  for (var key in methods) {
    object.prototype[key] = methods[key];
  }
  // Export the constructor method 'initialize' used by CreateJS.
  object.prototype['initialize'] = object;

  if (opt_statics) {
    for (var key in opt_statics) {
      object[key] = opt_statics[key];
    }
  }
};

/**
 * Exposes static methods to the global namespace path.
 * @param {string} name
 * @param {Object.<string,Function|string|number>} methods
 * @return {Object}
 */
createjs.exportStatic = function(name, methods) {
  /// <param type="string" name="name"/>
  /// <param type="Object" name="methods"/>
  /// <returns type="Object"/>
  var context = createjs.SUPPORT_AMD ? {} : createjs.global;
  if (!createjs.SUPPORT_AMD) {
    var parts = name.split('.');
    var length = parts.length;
    for (var i = 0; i < length; ++i) {
      var part = parts[i];
      if (!context[part]) {
        context[part] = {};
      }
      context = context[part];
    }
  }
  for (var key in methods) {
    context[key] = methods[key];
  }
  return context;
};

/**
 * Returns a string representing the type of a variable.
 * @param {*} value
 * @return {string}
 */
createjs.typeOf = function(value) {
  /// <param name="value"/>
  /// <returns type="string"/>
  return typeof value;
};

/**
 * Returns true if the specified variable is a string primitive.
 * @param {*} value
 * @return {boolean}
 */
createjs.isString = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return createjs.typeOf(value) == 'string';
};

/**
 * Returns true if the specified variable is a string primitive.
 * @param {*} value
 * @return {boolean}
 */
createjs.isNumber = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return createjs.typeOf(value) == 'number';
};

/**
 * Returns true if the specified variable is a string primitive.
 * @param {*} value
 * @return {boolean}
 */
createjs.isBoolean = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return createjs.typeOf(value) == 'boolean';
};

/**
 * Returns true if the specified variable is not undefined, i.e. the variable is
 * a defined one.
 * @param {*} value
 * @return {boolean}
 */
createjs.isDefined = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return createjs.typeOf(value) != 'undefined';
};

/**
 * Returns true if the specified variable is a Function object.
 * @param {*} value
 * @return {boolean}
 */
createjs.isFunction = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return createjs.typeOf(value) == 'function';
};

/**
 * Returns true if the specified variable is an Object variable.
 * @param {*} value
 * @return {boolean}
 */
createjs.isObject = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return createjs.typeOf(value) == 'object';
};

/**
 * Returns true if the specified variable is an Array object.
 * @param {*} value
 * @return {boolean}
 */
createjs.isArray = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return value instanceof Array;
};

/**
 * Returns true if the specified variable is NaN. NaN does not become equal to
 * anything, including NaN itself. This method uses this property to check if
 * the specified value is NaN. (This method returns false if the 'value'
 * parameter is undefined, i.e. this method is not completely equivalent to the
 * isNaN() method.)
 * @param {*} value
 * @return {boolean}
 */
createjs.isNaN = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return value !== value;
};

/**
 * Changes the type of the specified variable to string.
 * @param {*} value
 * @return {string}
 */
createjs.castString = function(value) {
  /// <param name="value"/>
  /// <returns type="string"/>
  return /** @type {string} */ (value);
};

/**
 * Changes the type of the specified variable to number. This function does not
 * actually converts a string to a number, i.e. 'createjs.castNumber("0") + 1'
 * returns a string "01" instead of returning a number 1. (In terms of C++, this
 * function is similar to 'reinterpret_cast<TYPE>'.)
 * @param {*} value
 * @return {number}
 */
createjs.castNumber = function(value) {
  /// <param name="value"/>
  /// <returns type="number"/>
  return /** @type {number} */ (value);
};

/**
 * Changes the type of the specified variable to boolean.
 * @param {*} value
 * @return {boolean}
 */
createjs.castBoolean = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  return /** @type {boolean} */ (value);
};

/**
 * Changes the type of the specified variable to Function.
 * @param {*} value
 * @return {Function}
 */
createjs.castFunction = function(value) {
  /// <param name="value"/>
  /// <returns type="Function"/>
  return /** @type {Function} */ (value);
};

/**
 * Changes the type of the specified variable to Object.
 * @param {*} value
 * @return {Object}
 */
createjs.castObject = function(value) {
  /// <param name="value"/>
  /// <returns type="Object"/>
  return /** @type {Object} */ (value);
};

/**
 * Changes the type of the specified variable to Array.
 * @param {*} value
 * @return {Array}
 */
createjs.castArray = function(value) {
  /// <param name="value"/>
  /// <returns type="Array"/>
  return /** @type {Array} */ (value);
};

/**
 * Changes the type of the specified variable to ArrayBuffer.
 * @param {*} value
 * @return {ArrayBuffer}
 */
createjs.castArrayBuffer = function(value) {
  /// <param name="value"/>
  /// <returns type="ArrayBuffer"/>
  return /** @type {ArrayBuffer} */ (value);
};

/**
 * Changes the type of the specified variable to number only if it is a number.
 * @param {*} value
 * @return {string}
 */
createjs.getString = function(value) {
  /// <param name="value"/>
  /// <returns type="string"/>
  if (createjs.DEBUG && !createjs.isString(value)) {
    createjs.error('value is not a string.');
  }
  return createjs.castString(value);
};

/**
 * Changes the type of the specified variable to number only if it is a number.
 * @param {*} value
 * @return {number}
 */
createjs.getNumber = function(value) {
  /// <param name="value"/>
  /// <returns type="number"/>
  if (createjs.DEBUG && !createjs.isNumber(value)) {
    createjs.error('value is not a number.');
  }
  return createjs.castNumber(value);
};

/**
 * Changes the type of the specified variable to boolean only if it is a boolean
 * variable.
 * @param {*} value
 * @return {boolean}
 */
createjs.getBoolean = function(value) {
  /// <param name="value"/>
  /// <returns type="boolean"/>
  if (createjs.DEBUG && !createjs.isBoolean(value)) {
    createjs.error('value is not a boolean.');
  }
  return createjs.castBoolean(value);
};

/**
 * Changes the type of the specified variable to Function only if it is a
 * Function.
 * @param {*} value
 * @return {Function}
 */
createjs.getFunction = function(value) {
  /// <param name="value"/>
  /// <returns type="Function"/>
  if (createjs.DEBUG && !createjs.isFunction(value)) {
    createjs.error('value is not a Function.');
  }
  return createjs.castFunction(value);
};

/**
 * Changes the type of the specified variable to Object only if it is an Object.
 * @param {*} value
 * @return {Object}
 */
createjs.getObject = function(value) {
  /// <param name="value"/>
  /// <returns type="Object"/>
  if (createjs.DEBUG && !createjs.isObject(value)) {
    createjs.error('value is not an Object.');
  }
  return createjs.castObject(value);
};

/**
 * Changes the type of the specified variable to Array only if it is an Array.
 * @param {*} value
 * @return {Array}
 */
createjs.getArray = function(value) {
  /// <param name="value"/>
  /// <returns type="Array"/>
  if (createjs.DEBUG && !createjs.isArray(value)) {
    createjs.error('value is not an Array.');
  }
  return createjs.castArray(value);
};

/**
 * Converts a string variable and returns a signed integer. This function always
 * returns a signed number object to which we can apply arithmetic operations to
 * it, i.e. 'org.aegis.parseInt("0") + 1' returns a number 1.
 * @param {*} value
 * @return {number}
 */
createjs.parseInt = function(value) {
  /// <param name="value"/>
  /// <returns type="number"/>
  if (createjs.DEBUG &&
      !createjs.isNumber(value) && !createjs.isString(value)) {
    createjs.error('value is not a number.');
  }
  return createjs.castNumber(value) | 0;
};

/**
 * Converts a string variable and returns a floating-point number.
 * @param {*} value
 * @return {number}
 */
createjs.parseFloat = function(value) {
  /// <param name="value"/>
  /// <returns type="number"/>
  if (createjs.DEBUG &&
      !createjs.isNumber(value) && !createjs.isString(value)) {
    createjs.error('value is not a number.');
  }
  return createjs.castNumber(value) * 1;
};

/**
 * Converts a string primitive from a primitive variable.
 * @param {*} value
 * @return {string}
 */
createjs.parseString = function(value) {
  /// <param name="value"/>
  /// <returns type="string"/>
  if (createjs.DEBUG && createjs.isObject(value)) {
    createjs.error('value is not a primitive.');
  }
  return createjs.castString(value) + '';
};

/**
 * Truncates the specified value. This method discards the fractional part of
 * the specified number and returns only its integral part.
 * @param {number} n
 * @return {number}
 */
createjs.truncate = function(n) {
  /// <param type="number" name="n"/>
  /// <returns type="number"/>
  return n | 0;
};

/**
 * Returns the largest integer less than or equal to the specified number.
 * @param {number} n
 * @return {number}
 */
createjs.floor = function(n) {
  /// <param type="number" name="n"/>
  /// <returns type="number"/>
  createjs.assert(0 <= n && n < (1 << 30));
  return createjs.truncate(n);
};

/**
 * Returns the smallest integer greater than or equal to the specified number.
 * @param {number} n
 * @return {number}
 */
createjs.ceil = function(n) {
  /// <param type="number" name="n"/>
  /// <returns type="number"/>
  var floor = createjs.floor(n);
  return (floor == n) ? n : floor + 1;
};

/**
 * Returns the nearest integer of the specified number.
 * @param {number} n
 * @return {number}
 */
createjs.round = function(n) {
  /// <param type="number" name="n"/>
  /// <returns type="number"/>
  return createjs.floor(n + 0.5);
};

/**
 * Returns the absolute value of the specified number.
 * @param {number} n
 * @return {number}
 */
createjs.abs = function(n) {
  /// <param type="number" name="n"/>
  /// <returns type="number"/>
  return n > 0 ? n : -n;
};

/**
 * Returns the minimum value.
 * @param {number} n0
 * @param {number} n1
 * @return {number}
 */
createjs.min = function(n0, n1) {
  /// <param type="number" name="n0"/>
  /// <param type="number" name="n1"/>
  /// <returns type="number"/>
  return n0 < n1 ? n0 : n1;
};

/**
 * Returns the maximum value.
 * @param {number} n0
 * @param {number} n1
 * @return {number}
 */
createjs.max = function(n0, n1) {
  /// <param type="number" name="n0"/>
  /// <param type="number" name="n1"/>
  /// <returns type="number"/>
  return n0 > n1 ? n0 : n1;
};

/**
 * Returns an approximate value of the Math.sin() method.
 * @param {number} angle
 * @return {number}
 */
createjs.sin = function(angle) {
  /// <param type="number" name="angle"/>
  /// <returns type="number"/>
  var M_PI_180 = 0.017453292519943295;  // Math.PI / 180;
  return Math.sin(angle * M_PI_180);
};

/**
 * Returns an approximate value of the Math.cos() method.
 * @param {number} angle
 * @return {number}
 */
createjs.cos = function(angle) {
  /// <param type="number" name="angle"/>
  /// <returns type="number"/>
  var M_PI_180 = 0.017453292519943295;  // Math.PI / 180;
  return Math.cos(angle * M_PI_180);
};

/**
 * Returns an approximate value of the arctangent of y / x in degrees. This
 * method does not normalize the output angle to a range [-180,180].
 * @param {number} y
 * @param {number} x
 * @return {number}
 */
createjs.atan2 = function(y, x) {
  /// <param type="number" name="y"/>
  /// <param type="number" name="x"/>
  /// <returns type="number"/>
  var M_180_PI = 57.29577951308232;  // 180 / Math.PI;
  return Math.atan2(y, x) * M_180_PI;
};

/**
 * Changes the type of the specified variable to HTMLCanvasElement.
 * @param {*} value
 * @return {HTMLCanvasElement}
 */
createjs.castCanvas = function(value) {
  /// <param name="value"/>
  /// <returns type="HTMLCanvasElement"/>
  return /** @type {HTMLCanvasElement} */ (value);
};

/**
 * Creates a <canvas> element.
 * @return {HTMLCanvasElement}
 */
createjs.createCanvas = function() {
  /// <returns type="HTMLCanvasElement"/>
  return createjs.castCanvas(document.createElement('canvas'));
};

/**
 * Returns the rendering context associated with a <canvas> element.
 * @param {HTMLCanvasElement} canvas
 * @return {CanvasRenderingContext2D}
 */
createjs.getRenderingContext2D = function(canvas) {
  /// <param type="HTMLCanvasElement" name="canvas"/>
  /// <returns type="CanvasRenderingContext2D"/>
  return /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
};

/**
 * Creates an <img> element.
 * @return {HTMLImageElement}
 */
createjs.createImage = function() {
  /// <returns type="HTMLImageElement"/>
  return /** @type {HTMLImageElement} */ (document.createElement('img'));
};

/**
 * Returns the origin of the current location.
 * @return {string}
 */
createjs.getOrigin = function() {
  /// <returns type="string"/>
  return createjs.origin_;
};

if (!createjs.SUPPORT_AMD) {
  // Export a couple of variables to the global namespace.
  createjs.exportStatic('createjs', {
    'version':
        '0.' + createjs.MAJOR_VERSION + '.' + createjs.MINOR_VERSION,
    'denaVersion':
        (createjs.DENA_MAJOR_VERSION << 16) + createjs.DENA_MINOR_VERSION
  });
}
