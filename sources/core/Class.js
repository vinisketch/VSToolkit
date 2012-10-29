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

var _constructor_ = Object.prototype.constructor;

/**
 * @example
 *  var Class1 = vs.core.createClass ({
 *    properties: {name: vs.core.Object.PROPERTY_IN_OUT},{});
 *
 *  var t = new Class1 ({name: 'Hello'});
 *  t.init ();
 *  console.log (t.name); // > 'Hello'
 *  
 *  var MyView = vs.core.createClass (
 *    parent: vs.ui.View,
 *
 *    constructor : function ()
 *    {
 *      console.log ('MyView constructor');
 *    }  
 *  });
 *  var d = new Dest ({size: [20, 20]}); // > 'MyView constructor'
 *  d.init ();
 *
 * @public
 */
function createClass (config)
{
  var klass = null, __spec = {}, 
    parent = vs.core.Object, properties = {};

  // Create the class
  klass = function ()
  {
    this.parent = klass.__spec.parent;
    // Call class constructor if it exists
    if (klass.__spec && klass.__spec._constructor)
    {
      klass.__spec._constructor.apply (this, arguments);
    }
    // Otherwise the parent constructor
    else if (klass.__spec && klass.__spec.parent)
    {
      this.parent.apply (this, arguments);
    }

    this.constructor = klass;
  };
  if (config && config.parent)
  {
    parent = config.parent;
    delete (config.parent);
  }
  if (config && config.properties)
  {
    properties = config.properties;
    delete (config.properties);
  }
  
  __spec.parent = parent;
  if (config && config.constructor && config.constructor !== _constructor_)
  {
    __spec._constructor = config.constructor;
    __spec._constructor._super_func_ = parent;
  }
  klass.__spec = __spec;
  
  // set class prototype  
  if (config)
  {
    klass.prototype = config;
    config.constructor = klass;
  }
  if (parent.prototype) util.extendClass (klass, parent);
  
  // declare super methods
  if (config) for (key in config)
  {
    if (!config.hasOwnProperty (key)) continue;
    var func = config [key];
    var superFunc = parent.prototype [key];
    if (!util.isFunction (func) || !util.isFunction (superFunc)) continue;
    
    // new implementation
    func._super_func_ = superFunc;

//     Old implementation
//     The new one, base on this._super.caller._super_func_ (VSObject)
//     should be more efficient
//     config [key] =  (function (func, superFunc)
//     {
//       return function ()
//       {
//         var result, _super = this._super;
//         this._super = superFunc;
//         result = func.apply (this, arguments);
//         this._super = _super;
//         return result;  
//       };
//     }(func, superFunc));  
  }

  // set class properties
  _setProperties (klass, properties);
  
  return klass;
}

/** 
 * @name vs.core.Object.PROPERTY_IN
 * @const
 * @type {number}
 */
vs.core.Object.PROPERTY_IN = 1;

/** 
 * @name vs.core.Object.PROPERTY_OUT
 * @const
 * @type {number}
 */
vs.core.Object.PROPERTY_OUT = 2;

/** 
 * @name vs.core.Object.PROPERTY_IN_OUT
 * @const
 * @type {number}
 */
vs.core.Object.PROPERTY_IN_OUT = 3;

/** 
 * Regular expression used for parsing property export path.
 * @private
 * @const
 * @type {RegExp}
 */
var property_reg = /(\w+[.\w+]*)#(\w+)/;

/**
 * @private
 */
function _setProperties (klass, properties)
{
  var descriptions = {}, export_value, desc, _prop_name;
  for (var prop_name in properties)
  {
    var value = properties [prop_name];
    
    // 1) simple description with In, OUT, IN_OUT export
    if (util.isNumber (value))
    {
      export_value = value; desc = {};
      _prop_name = '_' + util.underscore (prop_name);
      if (export_value & vs.core.Object.PROPERTY_IN)
      {
        desc.set = (function (prop_name, _prop_name)
        {
          return function (v)
          {
            this[_prop_name] = v;
            this.propertyChange (prop_name);
          };
        }(prop_name, _prop_name));
      }
      if (export_value & vs.core.Object.PROPERTY_OUT)
      {
        desc.get = (function (_prop_name)
        {
          return function ()
          {
            return this[_prop_name];
          };
        }(_prop_name));
      }
    }
    
    // 2) export path
    else if (util.isString (value))
    {
      var result = property_reg.exec (value);
      if (!result || result.length != 3)
      {
        throw "Unvalid property path: " + value;
      }
      desc = {};
      desc.set = (function (_path, _prop_name)
      {
        return function (v)
        {
          this[_path][_prop_name] = v;
          this.propertyChange (_prop_name);
        };
      }(result[1], result[2]));

      desc.get = (function (_path, _prop_name)
      {
        return function ()
        {
          return this[_path][_prop_name];
        };
      }(result[1], result[2]));
    }
    
    // 3) Full description
    else if (typeof value == "object")
    {
      desc = value;
    }
    descriptions [prop_name] = desc;
  }
  util.defineClassProperties (klass, descriptions);
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.createClass = createClass;
