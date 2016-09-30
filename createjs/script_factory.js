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
/// <reference path="object.js"/>

/**
 * A class that creates HTMLScriptElement objects.
 * @constructor
 */
createjs.ScriptFactory = function() {
};

/**
 * The instance of the createjs.ScriptFactory object.
 * @type {createjs.ScriptFactory}
 * @private
 */
createjs.ScriptFactory.instance_ = null;

/**
 * Returns the global instance of the createjs.ScriptFactory object.
 * @return {createjs.ScriptFactory}
 * @private
 */
createjs.ScriptFactory.getInstance_ = function() {
  /// <returns type="createjs.ScriptFactory"/>
  if (!createjs.ScriptFactory.instance_) {
    createjs.ScriptFactory.instance_ = new createjs.ScriptFactory();
  }
  return createjs.ScriptFactory.instance_;
};

/**
 * Retrieves whether this factory already has spooled an HTMLScriptElement
 * object for the specified path.
 * @param {string} path
 * @return {HTMLScriptElement}
 * @const
 */
createjs.ScriptFactory.exist = function(path) {
  /// <param type="string" name="path"/>
  /// <returns type="HTMLScriptElement"/>
  return null;
};

/**
 * Retrieves an HTMLImageElement object spooled by the createjs.ScriptFactory
 * object.
 * @param {string} path
 * @param {string} text
 * @return {HTMLScriptElement}
 * @const
 */
createjs.ScriptFactory.get = function(path, text) {
  /// <param type="string" name="path"/>
  /// <param type="string" name="text"/>
  /// <returns type="HTMLScriptElement"/>
  var script =
      /** @type {HTMLScriptElement} */ (document.createElement('script'));
  script.type = 'text/javascript';
  script.text = text;
  if (createjs.SUPPORT_AMD) {
    script.async = true;
  }
  return script;
};

/**
 * Deletes all scripts spooled by the createjs.ScriptFactory object.
 * @param {boolean=} opt_destroy
 * @const
 */
createjs.ScriptFactory.reset = function(opt_destroy) {
  /// <param type="boolean" optional="true" name="opt_destroy"/>
};
