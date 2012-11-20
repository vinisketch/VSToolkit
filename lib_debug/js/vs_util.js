/** @license
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

(function (window, undefined) {

var document = window.document;

/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/********************************************************************

*********************************************************************/

/**
 * @namespace Main ViniSketch toolkit namespace
 * @name vs
 */
window.vs = {};

/**
 * Contains a collections of facilities, internationalization, and miscellaneous
 * utility classes and methods.
 *
 * @namespace Main ViniSketch utility elements.
 * @name vs.util
 */
window.vs.util = {};

/**
 * @namespace Main ViniSketch components
 * @name vs.core
 */
window.vs.core = {};

/**
 * @namespace Main ViniSketch Data components
 * @name vs.data
 */
window.vs.data = {};

/**
 * @namespace Main ViniSketch User Interface components
 * @name vs.ui
 */
window.vs.ui = {};

/**
 * @namespace Main ViniSketch animation...
 * @name vs.fx
 */
window.vs.fx = {};

/**
 * @namespace Main ViniSketch Audio and Video...
 * @name vs.av
 */
window.vs.av = {};

/**
 * @namespace ViniSketch extensions...
 * @name vs.ext
 */
window.vs.ext = {};

/**
 * @namespace ViniSketch GUI extensions...
 * @name vs.ext.ui
 */
window.vs.ext.ui = {};
  
/**
 * @namespace ViniSketch FX extensions...
 * @name vs.ext.fx
 */
window.vs.ext.fx = {};
  
window.vs.SUPPORT_3D_TRANSFORM =
  'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix ()/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/********************************************************************
                   
*********************************************************************/

var document = (typeof window != "undefined")?window.document:null;

/**
 *  @private
 */
var vs = window.vs,
  util = vs.util;

/**
 * Create our "vsTest" element and style that we do most feature tests on.
 * @private
 */
var vsTestElem = (document)?document.createElement ('vstestelem'):null;

/**
 * @private
 */
var vsTestStyle = (vsTestElem)?vsTestElem.style:null;
var __date_reg_exp = /\/Date\((-?\d+)\)\//;

// Test which kind of transformation you can use
vs.SUPPORT_CSS_TRANSFORM =
  (vsTestStyle && (vsTestStyle.webkitTransform || vsTestStyle.msTransform));

/********************************************************************

*********************************************************************/

/**
 * extend with __defineSetter__/__defineGetter__ compatible API
 *
 * @private
 */
function _extend_api1 (destination, source)
{
  for (var property in source)
  {
    getter = source.__lookupGetter__ (property);
    setter = source.__lookupSetter__ (property);

    if (getter)
    {
      destination.__defineGetter__ (property, getter)
    }
    if (setter)
    {
      destination.__defineSetter__ (property, setter)
    }
    if (!getter && !setter)
    {
      destination [property] = source [property];
    }
  }
  return destination;
}

/**
 * extend with Object.defineProperty compatible API
 *
 * @private
 */
function _extend_api2 (destination, source)
{
  for (var property in source)
  {
    var desc = Object.getOwnPropertyDescriptor (source, property);
    
    if (desc && (desc.get || desc.set))
    {
      util.defineProperty (destination, property, desc);
    }
    else
    {
      destination [property] = source [property];
    }
  }
  return destination;
}

/**
 * Copies all properties from the source to the destination object.
 *
 * @memberOf vs.util
 *
 * @param {Object} destination The object to receive the new properties.
 * @param {Object} source The object whose properties will be duplicated.
 **/
vs.util.extend = (Object.defineProperty)?_extend_api2:_extend_api1;

/**
 * Extends a the prototype of a object
 *
 * @memberOf vs.util
 *
 * @param {Object} destination The Class to receive the new properties.
 * @param {Object} source The Class whose properties will be duplicated.
 **/
var extendClass = function (obj, extension)
{
  if (!obj || !extension) { return; }
  if (!obj.prototype || !extension.prototype) { return; }
  
  try
  {
    if (Object.__proto__)
    {
      obj.prototype.__proto__ = extension.prototype;      
    }
    else
    {
      var proto = obj.prototype;
      obj.prototype = new extension ();

      util.extend (obj.prototype, proto);
    }
    
    if (!obj._properties_) obj._properties_ = [];
    if (extension._properties_)
    {
      obj._properties_ = obj._properties_.concat (extension._properties_);
    }

    return obj;
  }
  catch (e)
  {
    console.error (e.message ());
  }
}

/**
 * Free a ViniSketch object
 *
 * @memberOf vs.util
 *
 * @param {Object} obj the object to free
 */
function free (obj)
{
  if (!obj) { return; }
  if (obj._free) { obj._free (); }
  if (obj.destructor) { obj.destructor (); }
  delete (obj);
  obj = null;
}

/**
 * Defines a new property directly on an object, or modifies an existing
 * property on an object.<br/><br/>
 *
 * Property descriptors present in objects come in two main flavors: data
 * descriptors and accessor descriptors. A data descriptor is a property that
 * has a value, which may or may not be writable. An accessor descriptor is a
 * property described by a getter-setter pair of functions. A descriptor must be
 * one of these two flavors; it cannot be both. All descriptors regardless of
 * flavor include the configurable and enumerable fields.<br/><br/>
 *
 * A property descriptor is an object with the following fields:
 * <ul>
 * <ol> <b>value</b> The value associated with the property. (data descriptors
 * only). <br/><i>Defaults to undefined.</i></ol>
 * <ol> <b>writable</b> True if and only if the value associated with the
 * property may be changed. (data descriptors only).<br/>
 * <i>Defaults to false.</ol>
 * <ol> <b>get</b> A function which serves as a getter for the property, or
 * undefined if there is no getter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>set</b> A function which serves as a setter for the property, or
 * undefined if there is no setter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>configurable</b> True if and only if the type of this property
 * descriptor may be changed and if the property may be deleted from the
 * corresponding object.<br/><i>Defaults to true.</i></ol>
 * <ol> <b>enumerable</b> True if and only if this property shows up during
 * enumeration of the properties on the corresponding object. <br/>
 * Defaults to true.</i></ol></ul>
 *
 * @memberOf vs.util
 *
 * @param {Object} obj The object on which to define the property.
 * @param {String} prop_name The name of the property to be defined or modified.
 * @param {Object} desc The descriptor for the property being defined or
 * modified
 */


/**
 * defineProperty with __defineSetter__/__defineGetter__ API
 *
 * @private
 */
function _defineProperty_api1 (obj, prop_name, desc)
{
  function hasProperty (obj, prop)
  {
    return Object.prototype.hasOwnProperty.call (obj, prop);
  }

  if (hasProperty (desc, "set"))
  {
    var s = desc.set;
    if (isFunction (s)) obj.__defineSetter__(prop_name, s);
  }

  if (hasProperty (desc, "get"))
  {
    var s = desc.get;
    if (isFunction (s)) obj.__defineGetter__(prop_name, s);
  }
}

/**
 * defineProperty with Object.defineProperty API
 *
 * @private
 */
function _defineProperty_api2 (obj, prop_name, desc)
{
  function hasProperty (obj, prop)
  {
    return Object.prototype.hasOwnProperty.call (obj, prop);
  }

  if (typeof desc != "object" || desc === null)
  {
    throw new TypeError ("bad desc");
  }
  
  if (typeof prop_name != "string" || prop_name === null)
  {
    throw new TypeError ("bad property name");
  }
  
  var d = {};
  
  if (hasProperty (desc, "enumerable")) d.enumerable = !!desc.enumerable;
  else d.enumerable = true; 
  if (hasProperty (desc, "configurable")) d.configurable = !!desc.configurable;
  else d.configurable = true; 
  if (hasProperty (desc, "value")) d.value = desc.value;
  if (hasProperty (desc, "writable")) d.writable = !!desc.writable;
  if (hasProperty (desc, "get"))
  {
    var g = desc.get;
    if (isFunction (g)) d.get = g;
  }
  if (hasProperty (desc, "set"))
  {
    var s = desc.set;
    if (isFunction (s)) d.set = s;
  }

  if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
    throw new TypeError("identity-confused descriptor");

  Object.defineProperty (obj, prop_name, d);
}

/**
 * Defines a new property directly on the object's prototype, or modifies an 
 * existing property on an object's prototype.<br/><br/>
 *
 * Property descriptors present in objects come in two main flavors: data
 * descriptors and accessor descriptors. A data descriptor is a property that
 * has a value, which may or may not be writable. An accessor descriptor is a
 * property described by a getter-setter pair of functions. A descriptor must be
 * one of these two flavors; it cannot be both. All descriptors regardless of
 * flavor include the configurable and enumerable fields.<br/><br/>
 *
 * A property descriptor is an object with the following fields:
 * <ul>
 * <ol> <b>value</b> The value associated with the property. (data descriptors
 * only). <br/><i>Defaults to undefined.</i></ol>
 * <ol> <b>writable</b> True if and only if the value associated with the
 * property may be changed. (data descriptors only).<br/>
 * <i>Defaults to false.</ol>
 * <ol> <b>get</b> A function which serves as a getter for the property, or
 * undefined if there is no getter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>set</b> A function which serves as a setter for the property, or
 * undefined if there is no setter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>configurable</b> True if and only if the type of this property
 * descriptor may be changed and if the property may be deleted from the
 * corresponding object.<br/><i>Defaults to true.</i></ol>
 * <ol> <b>enumerable</b> True if and only if this property shows up during
 * enumeration of the properties on the corresponding object. <br/>
 * Defaults to true.</i></ol></ul>
 *
 * @memberOf vs.util
 *
 * @param {Object} the_class The object's prototype on which to define the 
 * property.
 * @param {String} prop_name The name of the property to be defined or modified.
 * @param {Object} desc The descriptor for the property being defined or
 * modified
 */
function defineClassProperty (the_class, prop_name, desc)
{
  if (!desc) { return; }
  if (!the_class._properties_) the_class._properties_ = [];
  util.defineProperty (the_class.prototype, prop_name, desc);
  if (desc.enumerable != false) the_class._properties_.push (prop_name);
}

/**
 * @private
 */
var _keys = (typeof Object.keys === 'function')?Object.keys: function (o)
{
  var array = new Array (), key;
  for (key in o)
  {
    if (Object.prototype.hasOwnProperty.call (o, key)) { array.push (key); }
  }
  return array;
};

/**
 * Defines new or modifies existing properties directly on an 'class'.<br/><br/>
 *
 * @see vs.util.defineClassProperty
 *
 * @memberOf vs.util
 *
 * @param {Object} the_class The 'class' on which to define the property.
 * @param {Object} properties An object whose own enumerable properties
 *   constitute descriptors for the properties to be defined or modified.
 */
function defineClassProperties (the_class, properties)
{
  properties = Object (properties);  
  var keys = _keys (properties);  
  for (var i = 0; i < keys.length; i++)
  {
    var prop_name = keys[i]
    var desc = properties[keys[i]];
    defineClassProperty (the_class, prop_name, desc);
  }
}

/********************************************************************
                    Object management
*********************************************************************/

/** 
 * @private
 * @const
 */
NULL_TYPE = 'Null';

/** 
 * @private
 * @const
 */
UNDEFINED_TYPE = 'Undefined';

/** 
 * @private
 * @const
 */
BOOLEAN_TYPE = 'Boolean';

/** 
 * @private
 * @const
 */
NUMBER_TYPE = 'Number';

/** 
 * @private
 * @const
 */
STRING_TYPE = 'String';

/** 
 * @private
 * @const
 */
OBJECT_TYPE = 'Object';

/** 
 * @private
 * @const
 */
BOOLEAN_CLASS = '[object Boolean]';

/** 
 * @private
 * @const
 */
NUMBER_CLASS = '[object Number]';

/** 
 * @private
 * @const
 */
STRING_CLASS = '[object String]';

/** 
 * @private
 * @const
 */
ARRAY_CLASS = '[object Array]';

/** 
 * @private
 * @const
 */
OBJECT_CLASS = '[object Object]';

/**
 * @private
 */
function clone (object)
{
  var destination;

  switch (object)
  {
    case null: return null;
    case undefined: return undefined;
  }

  switch (_toString.call (object))
  {
    case OBJECT_CLASS:
    case OBJECT_TYPE:
      destination = {};
      for (var property in object)
      {
        destination[property] = clone (object [property]);
      }
      return destination; break;
      
    case ARRAY_CLASS:
      destination = [];
      for (var i = 0; i < object.length; i++)
      {
        destination [i] = clone (object [i]);
      }
      return destination; break;

    case BOOLEAN_TYPE:
    case NUMBER_TYPE:
    case STRING_TYPE:
    case BOOLEAN_CLASS:
    case NUMBER_CLASS:
    case STRING_CLASS:
    default:
      return object; break;
  }
};

/**
 *  Returns a JSON string.
 *
 *  @memberOf vs.util
 *
 * @param {Object} value The object to be serialized.
 **/
function toJSON (value)
{
  return JSON.stringify (value);
};

/********************************************************************
                    Testing methods
*********************************************************************/

/**
 * @private
 **/
var _toString = Object.prototype.toString;

/**
 *  Returns `true` if `object` is a DOM node of type 1; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isElement(new Element('div'));
 *  //-> true
 *
 *  vs.util.isElement(document.createElement('div'));
 *  //-> true
 *      
 *  vs.util.isElement(document.createTextNode('foo'));
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isElement (object)
{
  return !!(object && object.nodeType === 1);
};
  
/**
 *  Returns `true` if `object` is an [[Array]]; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isArray([]);
 *  //-> true
 *      
 *  vs.util.isArray({ });
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isArray (object)
{
  if (typeof Array.isArray == 'function')
  {
    return Array.isArray (object);
  }
  return _toString.call (object) === ARRAY_CLASS;
};

/**
 *  Returns `true` if `object` is an Function; `false` otherwise.
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isFunction (object)
{
  return typeof object === "function";
};

/**
 *  Returns `true` if `object` is an String; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isString ("qwe");
 *  //-> true
 *      
 *  vs.util.isString (123);
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isString (object)
{
  return _toString.call (object) === STRING_CLASS;
};

/**
 *  Returns `true` if `object` is an Number; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isNumber (123);
 *  //-> true
 *      
 *  vs.util.isNumber (1.23);
 *  //-> true
 *      
 *  vs.util.isNumber ("123");
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isNumber (object)
{
  return _toString.call (object) === NUMBER_CLASS;
};

/**
 *  Returns `true` if `object` is of type `undefined`; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isUndefined ();
 *  //-> true
 *      
 *  vs.util.isUndefined (undefined);
 *  //-> true
 *      
 *  vs.util.isUndefined (null);
 *  //-> false
 *      
 *  vs.util.isUndefined (0);
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isUndefined (object)
{
  return typeof object === "undefined";
};

/********************************************************************
                    Element Class testing
*********************************************************************/

/**
 *  Checks whether element has the given CSS className.
 *
 *  <p>
 *  @example
 *  elem.hasClassName ('selected');
 *  // -> true | false
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className to check
 * @return {Boolean} true if the element has the given className
*/
function hasClassName (element, className)
{
  if (!element) { return; }
  var elementClassName = element.className;
  return (elementClassName && elementClassName.length > 0 && 
    (elementClassName === className ||
    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
}

/**
 *  Adds a CSS classname to Element.
 *
 *  @example
 *  elem.addClassName ('selected');
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className to add
*/
function addClassName ()
{
  var element = arguments [0], className, i = 1;
  if (!element) { return; }
  for (; i < arguments.length; i++)
  {
    className = arguments [i];
    if (!hasClassName(element, className))
    {
      element.className = (element.className ? element.className + ' ' : '') + className;
    }
  }
  return element;
}

/**
 *  Removes element’s CSS className
 *
 *  <p>
 *  @example
 *  elem.removeClassName ('selected');
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className to remove
*/
function removeClassName ()
{
  var element = arguments [0], className, i = 1;
  if (!element || !element.className) { return; }
  for (; i < arguments.length; i++)
  {
    className = arguments [i];
    element.className = strip (element.className.replace (
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
  }
  return element;
}

/**
 *  Toggles element’s CSS className
 *
 *  <p>
 *  @example
 *  elem.toggleClassName ('selected');
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className 
*/
function toggleClassName (element, className)
{
  if (!element) { return; }
  return hasClassName(element, className) ?
    removeClassName(element, className): addClassName(element, className);
}

/********************************************************************
                    String manipulation
*********************************************************************/

/**
 * HTML-encodes a string and returns the encoded string.
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 */
function htmlEncode (str)
{
  if (!isString (str)) return '';
  
  return str.replace (/&/g, "&amp;").
    replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 *  Strips all leading and trailing whitespace from a string.
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 */
function strip (str)
{
  if (!isString (str)) return '';
  
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

/**
 *  Converts a string separated by dashes into a camelCase equivalent
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 * @return {String} the result
 */
function camelize (str)
{
  if (!isString (str)) return '';
  
  var parts = str.split ('-'), len = parts.length;
  if (len === 1) { return parts [0]; }

  var camelized = str.charAt (0) === '-'
    ? parts [0].charAt (0).toUpperCase () + parts [0].substring (1)
    : parts [0];

  for (var i = 1; i < len; i++)
    camelized += parts[i].charAt (0).toUpperCase() + parts[i].substring (1);

  return camelized;
}

/**
 *  Converts a string separated by dashes into a camelCase equivalent
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 * @return {String} the result
 */
function capitalize (str)
{
  if (!isString (str)) return '';
  
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

/**
 *  Converts a camelized string into a series of words separated by an 
 *  underscore (_).
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 * @return {String} the result
 */
function underscore (str)
{
  if (!isString (str)) return '';

  return str.replace (/::/g, '/')
            .replace (/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace (/([a-z\d])([A-Z])/g, '$1_$2')
            .replace (/-/g, '_')
            .toLowerCase ();
}

/**
 *  Parse a json string. <p/>
 *  This function use the JSON.parse function but it manage also 
 *  Date parsing wich is not managed by the JSON.parse
 *
 *  @memberOf vs.util
 *  @ignore
 *
 * @param {String} str String The string
 * @return {Object} the result
 */
function parseJSON (json)
{
  if (!json) return null;
  var temp = JSON.parse (json);
  
  if (!__date_reg_exp.test (json)) return temp;
  
  function manageDate (obj)
  {
    if (isString (obj))
    {
      var result = __date_reg_exp.exec (obj);
      if (result && result [1]) // JSON Date -> Date generation
      {
        obj = new Date (parseInt (result [1]));
      }
    }
    else if (isArray (obj))
    {
      for (var i = 0; i < obj.length; i++) { obj [i] = manageDate (obj [i]); }
    }
    else if (obj instanceof Date) { return obj; }
    else if (obj instanceof Object)
    {
      for (var key in obj) { obj [key] = manageDate (obj [key]); }
    }
    return obj;
  }
  return manageDate (temp);
};

/********************************************************************
                    Element management
*********************************************************************/

/**
 *  Returns the height of `element`.<br/>
 *  
 *  This method returns correct values on elements whose display is set to
 *  `none` either in an inline style rule or in an CSS stylesheet.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 *	@returns {Number} the height
 **/
function getElementHeight (elem)
{
  if (!isElement (elem)) return;
  
  return getElementDimensions (elem).height;
};

/**
 *  Returns the width of `element`.<br/>
 *  
 *  This method returns correct values on elements whose display is set to
 *  `none` either in an inline style rule or in an CSS stylesheet.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 *	@returns {Number} the width
 **/
function getElementWidth (elem)
{
  if (!isElement (elem)) return;
  
  return getElementDimensions (elem).width;
};

/**
 *  Finds the computed width and height of `element` and returns them as
 *  key/value pairs of an object.<br/>
 *  <p/>
 *  For backwards-compatibility, these dimensions represent the dimensions
 *  of the element's "border box" (including CSS padding and border).<br/> This
 *  is equivalent to the built-in `offsetWidth` and `offsetHeight`
 *  browser properties.
 *
 *  @memberOf vs.util
 * 
 * @param {Element} elem The element
 *	@returns {Object} the key/value width & height
 **/
function getElementDimensions (elem)
{
  if (!isElement (elem)) return {};
  
  var display = getElementStyle (elem, 'display'),
    els = elem.style, originalVisibility = els.visibility,
    originalPosition = els.position, originalDisplay = els.display,
    originalWidth = 0, originalHeight = 0;
    
  if (display !== 'none' && display !== null) // Safari bug
  {
    return {width: elem.offsetWidth, height: elem.offsetHeight};
  }
  // All *Width and *Height properties give 0 on elements with display none,
  // so enable the element temporarily
    
  els.visibility = 'hidden';
  els.position = 'absolute';
  els.display = 'block';
  
  originalWidth = elem.clientWidth;
  originalHeight = elem.clientHeight;
  els.display = originalDisplay;
  els.position = originalPosition;
  els.visibility = originalVisibility;
  
  return {width: originalWidth, height: originalHeight};
};

/**
 *  Returns the given CSS property value of `element`.<br/> The property can be
 *  specified in either its CSS form (`font-size`) or its camelized form
 *  (`fontSize`).<br/>
 *
 *  This method looks up the CSS property of an element whether it was
 *  applied inline or in a stylesheet. It works around browser inconsistencies
 *  regarding `float`, `opacity`, which returns a value between `0`
 *  (fully transparent) and `1` (fully opaque), position properties
 *  (`left`, `top`, `right` and `bottom`) and when getting the dimensions
 *  (`width` or `height`) of hidden elements.
 *  
 *  @example
 *  
 *  getElementStyle (elem, 'fontSize');
 *  // -> '12px'
 *
 *  @memberOf vs.util
 * 
 * @param {Element} elem The element
 * @param {String} style The style to find
 *	@returns {Object} the key/value width & height
 **/
function getElementStyle (elem, style)
{
  if (!isElement (elem)) return;
  
  style = style === 'float' ? 'cssFloat' : camelize (style);
  var value = elem.style[style], css;
  if (!value || value === 'auto')
  {
    css = document.defaultView.getComputedStyle (elem, null);
    value = css ? css[style] : null;
  }
  if (style === 'opacity') { return value ? parseFloat (value) : 1.0; }
  return value === 'auto' ? null : value;
};

/**
 *  Modifies `element`'s CSS style properties. Styles are passed as a hash of
 *  property-value pairs in which the properties are specified in their
 *  camelized form.
 *
 * @example
 * setElementStyle ({color: 'red', display: 'block'});
 * // add/set color and display properties
 * setElementStyle ({color: undefined});
 * // remove color property
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Object} style The style to modify
 */
function setElementStyle (elem, styles)
{
  if (!isElement (elem)) return;
  
  var elementStyle = elem.style, property;

  for (property in styles)
  {
    if (property === 'opacity')
    { 
      setElementOpacity (elem, styles[property]);
    }
    else
    {
      if (!styles [property])
      {
        elementStyle.removeProperty (property);
      }
      elementStyle[(property === 'float' || property === 'cssFloat') ?
        (isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
          property] = styles[property];
    }
  }
};

/** 
 *  Sets the visual opacity of an element while working around inconsistencies
 *  in various browsers. The `opacity` argument should be a floating point
 *  number, where the value of `0` is fully transparent and `1` is fully opaque.
 *  
 *  @example
 *  // set to 50% transparency
 *  setElementOpacity (element, 0.5);
 *      
 *  // these are equivalent, but allow for setting more than
 *  // one CSS property at once:
 *  setElementStyle (element, { opacity: 0.5 });
 *  setElementStyle (element, "opacity: 0.5");
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Number} value The opacity
 **/
function setElementOpacity (elem, value)
{
  if (!isElement (elem)) return;
  var elementStyle = elem.style;
  
  if (isUndefined (value)) elementStyle.removeProperty ('opacity');
  
  elementStyle.opacity = (value === 1 || value === '') ? '' :
    (value < 0.00001) ? 0 : value;
};

/** 
 *  Returns the opacity of the element.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @return {Number} value The opacity
 **/
function getElementOpacity (elem)
{
  if (!isElement (elem)) return;
  
  return getElementStyle (elem, 'opacity');
};

/**
 * Compute the elements position in terms of the window viewport
 * Returns a key/value object {x, y}
 *
 *  @memberOf vs.util
 *
 * @return {Object} the x,y absolute position of a element
 **/
function getElementAbsolutePosition (element)
{
  if (!element)
  { return null; }
  if (element.getBoundingClientRect)
  {
    var rec = element.getBoundingClientRect ();
    if (rec) { return { x:rec.left, y:rec.top }; } 
  }
  var x = 0;
  var y = 0;
  var parent = element;
  while (parent)
  {
     var borderXOffset = 0;
     var borderYOffset = 0;
     if (parent != element)
     {
        borderXOffset = parseInt (
          parent.currentStyle?
          parent.currentStyle ["borderLeftWidth"]:0, 0);
        borderYOffset = parseInt (
          parent.currentStyle?
          parent.currentStyle ["borderTopWidth"]:0, 0);
        borderXOffset = isNaN (borderXOffset) ? 0 : borderXOffset;
        borderYOffset = isNaN (borderYOffset) ? 0 : borderYOffset;
     }

     x += parent.offsetLeft - parent.scrollLeft + borderXOffset;
     y += parent.offsetTop - parent.scrollTop + borderYOffset;
     parent = parent.offsetParent;
  }
  return { x:x, y:y };
}

/**
 * @private
 */
function _getBoundingClientRect_api1 (e) 
{
  var rec = getElementAbsolutePosition (e);
  return {
    width: e.offsetWidth,
    height: e.offsetWidth,
    left: rec.x,
    top: rec.y
  }
};

/**
 * @private
 */
function _getBoundingClientRect_api2 (e)
{
  return (e && e.getBoundingClientRect)?e.getBoundingClientRect ():null;
};

/** 
 *  Set the absolute element position.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Number} x The element left position
 * @param {Number} y The element top position
 **/
function setElementPos (elem, x, y)
{
  if (!elem) { return; }
  var elementStyle = elem.style;
  
  elementStyle.left = x + 'px';
  elementStyle.top = y + 'px';
}

/** 
 * Set the element size
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Number} w The element width
 * @param {Number} w The element height
 **/
function setElementSize (elem, w, h)
{
  if (!elem) { return; }
  var elementStyle = elem.style;
  
  elementStyle.width = w + 'px';
  elementStyle.height = h + 'px';
}

/** 
 *  Set the element HTML visibility
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {boolean} v True if the element should be visible or false
 **/
function setElementVisibility (elem, v)
{
  if (!elem) { return; }
  var elementStyle = elem.style;
  
  if (elementStyle || util.isString (elem.innerHTML))
  {
    if (v)
    {
      elementStyle.visibility = 'visible';
    }
    else
    {
      elementStyle.visibility = 'hidden';
    }
  }
//  else if (elem instanceof CharacterData)
//  {}
  else // SVG
  {
    if (v)
    {
      elem.setAttribute ('visibility', 'visible');
    }
    else
    {
      elem.setAttribute ('visibility', 'hidden');
    }
  }
}

/** 
 *  Return true if the element is visible, false otherwise
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @return {boolean}
 **/
function isElementVisible (elem)
{
  if (!elem) { return false; }
  var elementStyle = elem.style;
  
  if (elementStyle || util.isString (elem.innerHTML))
  {
    if (elementStyle.visibility === 'hidden') { return false; }
    else { return true; }
  }
  else if (elem instanceof CharacterData)
  {
    return true;
  }
  else // SVG
  {
    if (elem.getAttribute ('visibility') === 'hidden') { return false; }
    else { return true; }
  }
}

/** 
 *  Remove all element children
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 **/
function removeAllElementChild (elem)
{
  if (!elem) { return; }
  
  while (elem.firstChild)
  {
    elem.removeChild (elem.firstChild);
  }
};

/** 
 *  Set inner content of a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {String} txt The text
 **/
function setElementInnerText (elem, text)
{
  if (!elem) { return; }
  
  removeAllElementChild (elem); //... deroule
  
  if (!util.isString (text))
  {
    if (text === undefined) { text = ""; }
    else if (text === null) { text = ""; }
    else if (util.isNumber (text)) { text = "" + text; }
    else if (text.toString) { text = text.toString (); }
    else { text = ""; }
  }
  var lines = text.split ('\n'), i = 0;
  if (!lines.length) { return; }
  elem.appendChild (document.createTextNode (lines [i]));
  i++;
  for (; i < lines.length; i++)
  {
    elem.appendChild (document.createElement ('br'));
    elem.appendChild (document.createTextNode (lines [i]));
  }
};

/**
 *@private
 */
function setElementWebkitTransform (elem, transform)
{
  if (elem && elem.style) elem.style.webkitTransform = transform;
}

/**
 *@private
 */
function getElementWebkitTransform (elem, transform)
{
  if (elem) return window.getComputedStyle (elem).webkitTransform;
}

/**
 *@private
 */
function setElementMSTransform (elem, transform)
{
  if (elem && elem.style) elem.style.msTransform = transform;
}

/**
 *@private
 */
function getElementMSTransform (elem, transform)
{
  if (elem) return window.getComputedStyle (elem).msTransform;
}

/** 
 *  Set the CSS transformation to a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {String} transform css transformations
 **/
var setElementTransform;

/** 
 *  get the CSS transformation to a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @return {Transform} transform css transformations
 **/
var getElementTransform;

if (vsTestStyle && vsTestStyle.webkitTransform !== undefined)
{
  setElementTransform = setElementWebkitTransform;
  getElementTransform = getElementWebkitTransform;
}  
else if (vsTestStyle && vsTestStyle.msTransform !== undefined)
{
  setElementTransform = setElementMSTransform;
  getElementTransform = getElementMSTransform;
}
/********************************************************************
                    Array extension
*********************************************************************/

/**
 * Removes the elements in the specified interval of this Array.<br/> 
 * Shifts any subsequent elements to the left (subtracts one from their indices).<br/>
 * This method extends the JavaScript Array prototype.
 * By John Resig (MIT Licensed)
 *
 * @param {int} from Index of the first element to be removed
 * @param {int} to Index of the last element to be removed
 */
Array.prototype._remove = function (from, to)
{
  var rest = this.slice ((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply (this, rest);
};


/**
 * @private
 */
var _findItem = function (obj, from)
{
  var len = this.length;

  var from = from?from:0;
  from = (from < 0)? 0: from;

  while (from < len)
  {
    if (this [from] === obj) { return from; }
    from++;
  }
  return -1;
};

/**
 *  Find an element into this Array.
 *
 * @param {Object} obj Element to locate in the array
 * @param {number} fromIndex The index at which to begin the search. 
 *    Defaults to 0, i.e. the whole array will be searched.
 *    If the index is greater than or equal to the length of the 
 *    array, -1 is returned
 * @return {int} the Index of the element. Return -1 if unfound.
 */
Array.prototype.findItem = Array.prototype.indexOf? 
Array.prototype.indexOf:_findItem;

/**
 * Removes the elements in the specified interval of this Array.<br/> 
 * Shifts any subsequent elements to the left (subtracts one from their indices).<br/>
 * This method extends the JavaScript Array prototype.
 *
 * @param {int} from Index of the first element to be removed
 * @param {int} to Index of the last element to be removed
 * @return {Array} the modified array
 */
Array.prototype.remove = function (from, to)
{
  if ((typeof(from) === "object") || util.isString (from))
  {
    var i = 0;
    while (i < this.length)
    {
      if (this[i] === from) { this._remove (i); }
      else { i++; }
    }
  }
  else { this._remove (from, to); }
  return this;
};

/**
 * Removes all elements of this Array.<br/> 
 *
 * @return {Array} the modified array
 */
Array.prototype.removeAll = function ()
{
  while (this.length > 0) { this._remove (0); }
  return this;
};

/**
 * Return a copy of the array 
 *
 * @return {Array} the modified array
 */
Array.prototype.clone = function ()
{
  return this.slice ();
};

/********************************************************************
                         export
*********************************************************************/

/**
 * Imports a JavaScript or css file into a document
 *
 * @memberOf vs.util
 *
 * @param {String} path The file path to import
 * @param {Document} doc The document into import the file
 * @param {Function} clb A function which will be called when the file is loaded
 * @param {String} type The file type ['js', 'css']
 */
function importFile (path, doc, clb, type)
{
  if (!doc) { doc = document; }
  
  var js_effets, css_style;
  
  if (type === 'js' || path.search ('\\.js') >= 0)
  {
    js_effets = doc.createElement ("script");
    js_effets.setAttribute ("type", "text/javascript");
    js_effets.setAttribute ("src", path);
    if (clb)
    {
      js_effets.onload = function ()
      {
        clb.call (this, path);
      };
    }
    if (!doc.head) { doc.head = doc.querySelector ('head'); }
    doc.head.appendChild (js_effets);
  }
  else if (type === 'css' || path.search('\\.css') >= 0)
  {
    css_style = doc.createElement ("link");
    css_style.setAttribute ("rel", "stylesheet");
    css_style.setAttribute ("type", "text/css");
    css_style.setAttribute ("href", path);
    css_style.setAttribute ("media", "screen");
    if (util.isFunction (clb))
    {
      var count = 0;
      
      /**
       * @private
       */
      (function()
      {
        if (!css_style.sheet || !css_style.sheet.cssRules)
        {
          if (count++ < 100)
          {
            cssTimeout = setTimeout (arguments.callee, 100);
          }
          else
          {
            console.error ('CSS load of ' + path + ' failed!');
          }
          return;
        };
        if (css_style.sheet.cssRules &&
            css_style.sheet.cssRules.length === 0)
        {
          console.error ('CSS load of ' + path + ' failed!');
        }
        else
        {
          clb.call (document, path);
        }
      })();
    }
    if (!doc.head) { doc.head = doc.querySelector ('head'); }
    doc.head.appendChild (css_style);
  }
}

/********************************************************************
                         Style mamangent
*********************************************************************/

/**
 * @private
 */
var SET_STYLE_OPTIMIZATION = true;

/**
 * @private
 */
var _current_platform_id = 0;
vs._current_platform_id = _current_platform_id;

/** 
 *  Sets the active stylesheet for the HTML document according to the specified
 *  title.
 *
 *  @memberOf vs.util
 *
 * @param {String} title
 */
var setActiveStyleSheet = function (title)
{
  var i = 0, stylesheets = document.getElementsByTagName ("link"),
    stylesheet, info, id, app, size;
    
  vs._current_platform_id = title;
  var apps = vs.Application_applications;
  
  if (SET_STYLE_OPTIMIZATION)
  {
    if (apps) for (id in apps)
    {
      app = apps [id];
      if (app.view) app.view.style.display = "none";
    }
  }

  for (i = 0; i < stylesheets.length; i++)
  {
    stylesheet = stylesheets [i];
    // If the stylesheet doesn't contain the title attribute, assume it's
    // a persistent stylesheet and should not be disabled
    if (!stylesheet.getAttribute ("title")) { continue; }
    // All other stylesheets than the one specified by "title" should be
    // disabled
    if (stylesheet.getAttribute ("title") !== title)
    {
      stylesheet.setAttribute ("disabled", true);
    } else 
    {
      stylesheet.removeAttribute ("disabled");
    }
  }
  
  if (SET_STYLE_OPTIMIZATION)
  {
    if (apps) for (id in apps)
    {
      app = apps [id];
      if (app.view) app.view.style.display = "block";
    }
  }

//     // resize application
//   if (window.deviceConfiguration.targets)
//   {
//     info = window.deviceConfiguration.targets [title];
//     if (!info)
//     { return; }
//     
//     if (info.orientations [0] === 0 || info.orientations [0] === 180)
//     {
//       size = info.resolution.slice ();
//     }
//     else if (info.orientations [0] === 90 || info.orientations [0] === -90)
//     {
//       size = [];
//       size [0] = info.resolution [1];
//       size [1] = info.resolution [0];
//     }
//     else
//     { return; }
//     
//     if (info.statusBarHeight)
//     {
//       size [1] -= info.statusBarHeight;
//     }
//     if (apps) for (id in apps)
//     {
//       app = Application_applications [id];
//       app.position = [0, 0];
//       app.size = size;
//     }
//   }
}

/**
 *  Preload GUI HTML template for the given component.
 *  <p>
 *  When the developer uses createAndAddComponent method, the system will
 *  load the HTML GUI template associated to the component to create.
 *  This process can take times.<br>
 *  In order to minimize the latency, this class method allows to preload all 
 *  data related to a component.<br>
 *  This method should ne call when the application start.
 * 
 *  @example
 *  vs.util.preloadTemplate ('GUICompOne');
 *  vs.util.preloadTemplate ('GUICompTwo');
 *  ...
 *  myObject.createAndAddComponent ('GUICompOne', conf, 'children');
 * 
 *  @memberOf vs.util
 *
 * @param {String} comp_name The GUI component name   
 */
function preloadTemplate (comp_name)
{
  var path = comp_name + '.xhtml', xmlRequest;
  
  if (vs.ui && vs.ui.View && vs.ui.View.__comp_templates [path]) { return; }

  xmlRequest = new XMLHttpRequest ();
  xmlRequest.open ("GET", path, false);
  xmlRequest.send (null);

  if (xmlRequest.readyState === 4)
  {
    if (xmlRequest.status === 200 || xmlRequest.status === 0)
    {
      data = xmlRequest.responseText;
      if (vs.ui && vs.ui.View) vs.ui.View.__comp_templates [path] = data;
    }
    else
    {
      console.error
        ("Template file for component '" + comp_name + "' unfound");
      return;
    }
  }
  else
  {
    console.error
      ("Pb when load the component '" + comp_name + "' template");
    return;
  }
  xmlRequest = null;
}

/********************************************************************
                         export
*********************************************************************/

util.extend (util, {
  vsTestElem:              vsTestElem,
  vsTestStyle:             vsTestStyle,
  
  // Class functions
  extendClass:             extendClass,
  defineProperty:
        (Object.defineProperty)?_defineProperty_api2:_defineProperty_api1,
  defineClassProperty:     defineClassProperty,
  defineClassProperties:   defineClassProperties,
  clone:                   clone,
  free:                    free,

  // JSON functions  
  toJSON:                  toJSON,

  // testing functions
  isElement:               isElement,
  isArray:                 isArray,
  isFunction:              isFunction,
  isString:                isString,
  isNumber:                isNumber,
  isUndefined:             isUndefined,

  // element class
  hasClassName:    hasClassName,
  addClassName:    addClassName,
  removeClassName: removeClassName,
  toggleClassName: toggleClassName,

  // string
  htmlEncode:      htmlEncode,
  strip:           strip,
  camelize:        camelize,
  capitalize:      capitalize,
  underscore:      underscore,
  parseJSON:       parseJSON,

  // element style
  getElementHeight:           getElementHeight,
  getElementWidth:            getElementWidth,
  getElementDimensions:       getElementDimensions,
  getElementStyle:            getElementStyle,
  setElementStyle:            setElementStyle,
  setElementOpacity:          setElementOpacity,
  getElementOpacity:          getElementOpacity,
  getElementAbsolutePosition: getElementAbsolutePosition,
  setElementPos:              setElementPos,
  setElementSize:             setElementSize,
  setElementVisibility:       setElementVisibility,
  isElementVisible:           isElementVisible,
  removeAllElementChild:      removeAllElementChild,
  setElementInnerText:        setElementInnerText,
  setElementTransform:        setElementTransform,
  getElementTransform:        getElementTransform,
  getBoundingClientRect:      
    (vsTestElem && vsTestElem.getBoundingClientRect)?
    _getBoundingClientRect_api2:_getBoundingClientRect_api1,
  
  // other
  importFile:           importFile,
  setActiveStyleSheet:  setActiveStyleSheet,
  preloadTemplate:      preloadTemplate,
  __date_reg_exp:       __date_reg_exp,
  _findItem:            _findItem, // export only for testing purpose
  _defineProperty_api1: _defineProperty_api1, // export only for testing purpose
  _defineProperty_api2: _defineProperty_api2, // export only for testing purpose
  _extend_api1:         _extend_api1, // export only for testing purpose
  _extend_api2:         _extend_api2 // export only for testing purpose
});

})(window);