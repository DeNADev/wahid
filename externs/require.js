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
 * @fileoverview Definitions for the AMD (Asynchronous Module Definition) API.
 * @see http://requirejs.org/
 * @externs
 */

/**
 * @see http://requirejs.org/docs/api.html
 * @param {Array.<string>} deps
 * @param {Function} callback
 * @param {Function=} opt_errback
 * @param {*=} opt_optional
 */
function require(deps, callback, opt_errback, opt_optional) {
  /// <param type="Array" elementType="string" name="deps"/>
  /// <param type="Function" optional="true" name="callback"/>
  /// <param type="Function" optional="true" name="opt_errback"/>
  /// <param optional="true" name="opt_optional"/>
}

/**
 * @see http://requirejs.org/docs/api.html
 * @param {Array.<string>} deps
 * @param {Function} callback
 * @param {Function=} opt_errback
 * @param {*=} opt_optional
 */
function requirejs(deps, callback, opt_errback, opt_optional) {
  /// <param type="Array" elementType="string" name="deps"/>
  /// <param type="Function" optional="true" name="callback"/>
  /// <param type="Function" optional="true" name="opt_errback"/>
  /// <param optional="true" name="opt_optional"/>
}

/**
 * @see http://requirejs.org/docs/api.html
 * @param {string|Object|Function|Array.<string>} name
 * @param {Object|Function|Array.<string>=} opt_deps
 * @param {Function=} opt_callback
 */
function define(name, opt_deps, opt_callback) {
  /// <param name="name"/>
  /// <param optional="true" name="opt_deps"/>
  /// <param optional="true" name="opt_callback"/>
}
