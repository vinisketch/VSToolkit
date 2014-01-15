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

var vs = window.vs,
  util = vs.util,
  core = vs.core;
  
/**
 * @private
 */
var _id_index_ = 0;

/**
 * Returns a local unique Id <p>
 * The algorithm is based on an index initialized when the page is loaded.
 *
 * @memberOf vs.core
 *
 * @return {String}
 */
function createId ()
{
  return "vs_id_" + _id_index_++;
}

/**
 * Returns an unique Id <p>
 * The algorithm uses a time stamp and a random number to generate the id.
 *
 * @memberOf vs.core
 *
 * @return {String}
 */
function createUniqueId ()
{
  return "vs_id_" + new Date().getTime() + "" + Math.floor (Math.random() * 1000000);
}

/********************************************************************
                      Export
*********************************************************************/
/**
 * @private
 */
core.createId = createId;
core.createUniqueId = createUniqueId;/**
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
 
 Use code from Canto.js Copyright 2010 Steven Levithan <stevenlevithan.com>
*/

/**
 *  @class
 *  vs.Point is an (x, y) coordinate pair. 
 *  When you use an vs.Point object in matrix operations, the object is 
 *  treated as a vector of the following form <x, y, 1>
 *
 * @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.Point
 *
 * @param {Number} the x-coordinate value.
 * @param {Number} the y-coordinate value.
*/
function Point (x, y)
{
  if (util.isNumber (x)) this.x = x;
  if (util.isNumber (y)) this.y = y;
}

Point.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
   x: 0,
   y: 0,
  
  /*****************************************************************
   *              
   ****************************************************************/
   
  /**
   * Applies the given 2×3 matrix transformation on this Point object and 
   * returns a new, transformed Point object.
   *
   * @name vs.Point#matrixTransform
   * @function
   * @public
   * @param {vs.CSSMatrix} matrix he matrix
   * @returns {vs.Point} the matrix
   */
  matrixTransform : function (matrix)
  {
    var matrix_tmp = new vs.CSSMatrix ();

    matrix_tmp = matrix_tmp.translate (this.x, this.y, this.z || 0);
    matrix = matrix.multiply (matrix_tmp);

    var result = new Point (matrix.m41, matrix.m42);

    delete (matrix_tmp);
    delete (matrix);

    return result;
  }
};

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.Point = Point;
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
 *  @class Object
 *  vs.core.Object is the root class of most class hierarchies. Through
 *  vs.core.Object, objects inherit a basic interface for configuration
 *  and clone mechanism. It provides an unique identifier for objects.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.Object
 *
 * @param {Object} config the configuration structure
*/
function VSObject (config)
{
  this.constructor = core.Object;
  if (util.isString (config)) { this._id = config; }
  else if (config && config.id) { this._id = config.id; }
  else this._id = createId ();
  
  this.__df__ = [];

  if (config)
  {
    this.__config__ = config;//util.clone (config);
  }
}

VSObject.prototype =
{
  /**
   * @protected
   * @String
   */
   _id: '',

  /**
   * @protected
   * @boolean
   */
   __i__: false,
   __input_property__did__change__: false, 

  /**
   * @protected
   * @object
   */
   __config__: null,
   __df__: null,

  /**
   *  Object default init. <p>
   *
   * @name vs.core.Object#init
   * @function
   *
   *  @example
   *  myObject = new vs.core.Object (vs.core.createId ());
   *  myObject.init ();
   *  @return {Object} this
   */
  init : function (fromClone)
  {
    if (this.__i__) { return this; }

    if (!this._id)
    {
      this._id = createId ();
    }

    // save the current object
    VSObject._obs [this._id] = this;

    if (!fromClone) this.initComponent ();
    this.__i__ = true;

    // Call initialization code generated by ViniSketch Designer
    if (!fromClone && this.vsdInit) this.vsdInit ();

    if (this.__config__)
    {
      this.configure (this.__config__);
      this.__config__ = null;
//      delete (this.__config__);
    }

    // Call optional end initialization method
    if (this.componentDidInitialize) this.componentDidInitialize ();

    // legacy code for application using the initSkin mechanism
    // @deprecated
    if (this.initSkin)
    {
      console.warn ("Your application shouldn't use initSkin anymore.\n\
        You should rename by componentDidInitialize.");

      // create a fake initSkin (for super call)
      VSObject.prototype.initSkin = function () {};

      // call the initSkin
      this.initSkin ();

      // remove the fake initSkin
      VSObject.prototype.initSkin = undefined;
    }

    return this;
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {},

  /**
   * @protected
   * @function
   */
  componentDidInitialize : function ()
  {},

  /**
   * @deprecated
   * @private
   */
  createId : function ()
  {
    console.warn
      ("this.createId is deprecated, Use the static method vs.core.createId instead");
    return createId ();
  },

  /**
   *  Object configuation method. <p>
   *  Call this method to adjust some properties of the internal components
   *  using one call. <br/>
   *  It takes as parameters, an associated array <propertyName, value>.
   *  <br/><br/>
   *  Ex:
   *  @example
   *  var myObject = new vs.core.Object ({id: 'myobject'});
   *  myObject.init ();
   *
   *  myObject.configure ({prop1: "1", prop2: 'hello', ..});
   *  <=>
   *  myObject.prop1 = "1";
   *  myObject.prop2 = "hello";
   *  ...
   *
   * @name vs.core.Object#configure
   * @function
   *
   * @param {Object} config the associated array used for configuring the
   *        object.
   */
  configure : function (config)
  {
    if (typeof (config) !== 'object') { return; }
    var props, key, i, should_propagate = false, desc;

    if (this.__df__) 
      this.__df__.forEach (function (df) {
        df.pausePropagation ();
      });

    // Manage model
    if (config instanceof Model)
    {
      desc = this.getPropertyDescriptor ('model');
      if (desc && desc.set)
      {
        // model property assignation
        this.model = config;
        should_propagate = true;
      }
      else
      {
        // one by one property copy
        props = config.getModelProperties ();
        for (i = 0; i < props.length; i++)
        {
          key = props [i];
          if (key === 'id') { continue; }
          this [key] = config [key];
          should_propagate = true;
        }
      }
    }
    else
    {
      if (config) for (key in config)
      {
        if (key === 'id' || key === 'node' ||
            key === 'node_ref' || key === 'view')
        { continue; }
        this [key] = config [key];
        should_propagate = true;
      }
    }

    if (this.__df__ && this.__df__.length) {
      this.__df__.forEach (function (df) {
        df.restartPropagation ();
        if (should_propagate) {
          df.propagate (this);
        }
      });
    }
    else if (should_propagate && this.propertiesDidChange) {
      this.propertiesDidChange ();
    }
  },
  
  /**
   *  This method is called by the dataflow algorithm when input properties have
   *  been changed.
   *  You should reimplement this method if you want make specific calculation
   *  on properties changed, and/or modifying output properties.
   *  If you have modifying an output property (and want to continue the
   *  dataflow propagation) you have to return 'false' or nothing.
   *  Otherwise return 'true' to and the propagation will terminate.
   *
   * @name vs.core.Object#propertiesDidChange
   * @function
   * @return {boolean} true if you wants stop de propagation, false otherwise
   */
  propertiesDidChange: function () { return false; },

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   *
   * @name vs.core.Object#toJSON
   * @function
   * @return {Object} the object value for stringify
   */
  toJSON : function ()
  {
    return this._toJSON ();
  },

  /**
   *  Set objet's properties from JSON stringification.<p/>
   *  This can be used when retrieve data from serialization.
   *
   * @name vs.core.Object#parseJSON
   * @function
   * @param {String} json The JSON String
   */
  parseJSON : function (json)
  {
    try {
      this.parseData ((json && util.parseJSON (json)) || {});
    }
    catch (e)
    {
      if (e.stack) console.log (e.stack)
      console.error ("vs.core.Object.parseJSON failed. " + e.toString ());
    }
  },

  /**
   * @protected
   */
  parseData : function (obj)
  {
    var key, value, result;
    for (key in obj)
    {
      value = obj [key];
//         if (util.isString (value))
//         {
//           result = util.__date_reg_exp.exec (value);
//           if (result && result [1]) // JSON Date -> Date generation
//           {
//             this ['_' + key] = new Date (parseInt (result [1]));
//           }
//           else this ['_' + key] = value; // String
//         }
      this ['_' + util.underscore (key)] = value;
    }
  },

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   * @private
   * @name vs.core.Object#_toJSON
   * @function
   */
  _toJSON : function (json)
  {
    var prop_name, value, data = {}, result,
      _properties_ = this.getModelProperties (), n = 0;

    if (!_properties_) return data;

    for (var i = 0; i < _properties_.length; i++)
    {
      prop_name = _properties_ [i];
      value = this ['_' + util.underscore (prop_name)];
      if (typeof value == "undefined") continue;
      else if (value instanceof Date)
      { result = '"\/Date(' + value.getTime () + ')\/"'; }
      else if (value && value.toJSON) { result = value.toJSON (); }
      else result = value;
      data [prop_name] = result;
    }

    return data;
  },

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this.__i__ = false;
  },

  /**
   * @public
   * @function
   */
  isDeleted : function ()
  {
    return !this.__i__;
  },

  /**
   * Manually force properties change propagation.
   * <br/>
   * If no property name is specified, the system will assume all component's
   * properties have been modified.
   *
   * @name vs.core.Object#propertyChange
   * @function
   *
   * @param {String} property the name of the modified property.[optional]
   */
  propertyChange : function (property)
  {
    this.__input_property__did__change__ = true, self = this;
    if (this.__df__) 
      this.__df__.forEach (function (df) {
        df.propagate (self);
      });
  },


  /**
   * Manually force out properties change propagation.
   * <br/>
   * If no property name is specified, the system will assume all component's
   * properties have been modified.
   *
   * @name vs.core.Object#outPropertyChange
   * @function
   *
   * @param {String} property the name of the modified property.[optional]
   */
  outPropertyChange : function (property)
  {
    this.__input_property__did__change__ = true, self = this;
    if (this.__df__) 
      this.__df__.forEach (function (df) {
        df.propagate (self, false, true);
      });
  },
  /**
   * Manually force properties change propagation.
   * <br/>
   * @deprecated
   * @name vs.core.Object#propagateChange
   * @see vs.core.Object#propertyChange
   * @param {String} property the name of the modified property.[optional]
   * @param {Object} data.[optional]
   */
  propagateChange : function (property)
  {
    this.propertyChange (property);
  },

  /**
   * The method allows to link a model to an other object (a view for
   * instance).<br />
   * This is a simple way to create a MVC architecture; each model
   * modification will be propagated to the view.<br/><br/>
   * Linking is quite different than dataflow.<br/>
   * You can use linking to connect 2 objects with the same properties name.
   * <br/>
   * With dataflow its possible to connect a set of object, and define precisely
   * witch properties are connected together.<br/>
   * <br/>
   * Please notice that dataflow propagation is more optimized than linking
   * propagation.
   *
   * @example
   *  var myModel = new MyModel ().init ();
   *  var myView = new MyView ().init ();
   *
   *  myView.link (myModel);
   *
   *  myModel.prop = "value"; // the myView.prop will be automatically updated.
   *  ...
   *  myModel.stopPropagation ();
   *  myModel.prop = "value";
   *  myModel.propBis = "valueBis";
   *  myModel.change (); // the view is updated
   *
   * @name vs.core.Object#link
   * @function
   * @param {vs.core.Model} model The model to link with
   */
  link : function (model)
  {
    // model update management
    if (model instanceof vs.core.Model)
    {
      if (this.__model) this.__model.unlinkTo (this);
      this.__model = model;
      this.__model.linkTo (this);

      // first configuration
      this.configure (this.__model)
    }
    else throw "vs.core.Object.link; parameter is not a vs.core.Model";
  },

  /**
   * Unlink the model which was linked with this object
   * @see vs.core.Object#link
   *
   * @name vs.core.Object#unlink
   * @function
   */
  unlink : function ()
  {
    // model update management
    if (this.__model)
    {
      if (this.__model)
      {
        this.__model.unlinkTo (this);
        var props = this.__model.getModelProperties (); l = props.length,
          config = {};
        while (l--) { config [props[l]] = null; }
        this.configure (config);
      }
      this.__model = undefined;
    }
  },

  /**
   *  Clone the Object <p>
   *
   * @name vs.core.Object#clone
   * @function
   *
   * @param {Object} config the configuration structure for the new object
   * @return {vs.core.Object} the cloned object
   */
  clone : function (config, cloned_map)
  {
    var obj, key, value, desc, desc_clone, getter, setter;

    if (!cloned_map) { cloned_map = {}; }

    // have already cloned;
    if (cloned_map [this._id]) { return cloned_map [this._id]; }

    if (!config) { config = {}; }
    if (!config.id) { config.id = createId (); }

    if (util.isFunction (this.constructor))
    {
      obj = new this.constructor (config);
    }
    else
    {
      console.warn ("impossible to clone this object.");
      return null
    }

    cloned_map [this._id] = obj;

    function _propertyDecl_api1 (prop_name, src, trg)
    {
      var getter = src.__lookupGetter__ (prop_name),
        setter = src.__lookupSetter__ (prop_name),
        getter_clone = trg.__lookupGetter__ (prop_name),
        setter_clone = trg.__lookupSetter__ (prop_name);

      // manage getter
      if (getter && !getter_clone)
      {
        trg.__defineGetter__ (prop_name, getter);
      }
      // manage setter
      if (setter && !setter_clone)
      {
        trg.__defineSetter__ (prop_name, setter);
      }
      // generic member copy
      if (!setter && !getter)
      {
        var value = src [prop_name];
        if (util.isArray (value)) { trg [prop_name] = value.slice (); }
        else { trg [prop_name] = src [prop_name]; }
      }
      else {
        if (!trg.__properties__) trg.__properties__ = [];
        trg.__properties__.push (prop_name);
      }
    }

    function _propertyDecl_api2 (prop_name, src, trg)
    {
      var desc = src.getOwnPropertyDescriptor (prop_name),
        desc_clone = trg.getOwnPropertyDescriptor (prop_name);

      // manage getter and setter
      if (desc && (desc.get || desc.set))
      {
        // the property description doesn't exist. Create it.
        if (!desc_clone) {
          util.defineProperty (trg, prop_name, desc);
          if (!trg.__properties__) trg.__properties__ = [];
          trg.__properties__.push (prop_name);
        }
      }
      // generic member copy
      else
      {
        var value = src [prop_name];
        if (util.isArray (value)) { trg [prop_name] = value.slice (); }
        else { trg [prop_name] = src [prop_name]; }
      }
    }

    var propertyDecl =
      (Object.defineProperty)?_propertyDecl_api2:_propertyDecl_api1;

    // property and function declaration copy
    for (key in this)
    {
      // do not manage id or private member
      if (key === 'parent' || key === '_id' || key === 'constructor' ||
          key.indexOf ('__') === 0) continue;  
      if (!this.getPropertyDescriptor (key)) continue;

      // function copy
      if (util.isFunction (this [key]) && !util.isFunction (obj [key]))
      { obj [key] = this [key]; }
      
      // property descriptor copy
      else if (!obj.isProperty (key) && this.isProperty (key))
      { propertyDecl (key, this, obj); }
    }

    obj.__i__ = false;
    obj.init ();

    // call object specific clone implementation
    this._clone (obj, cloned_map);

    // property values copy
    this._clone_properties_value (obj, cloned_map);

    // manage linking clone
    if (this.__model)
    {
      if (cloned_map && cloned_map [this.__model._id])
      { obj.link (cloned_map [this.__model._id]); }
      else { obj.link (this.__model); }
    }

    return obj;
  },
  
   /**
   * @name vs.core.Object#_clone_properties_value
   * @function
   * @protected
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone_properties_value : function (obj, cloned_map)
  {
    var key;
    
    for (key in this)
    {
      if (key == 'id') continue;

      // property value copy
      if (this.isProperty (key)) { propertyCloneValue (key, this, obj); }
    }
  },

  /**
   * @name vs.core.Object#_clone
   * @function
   * @private
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone : function (obj, cloned_map)
  {},

  /*************************************************************
                  Properties introscpection
  *************************************************************/

  /**
   *  Returns the list of object's properties name <p>
   *
   * @name vs.core.Object#getModelProperties
   * @function
   * @return {Array} Array of name of properties
   */
  getModelProperties : function ()
  {
    var result = [];
    if (this.__properties__) result = result.concat (this.__properties__);
    if (this.constructor.__properties__)
      result = result.concat (this.constructor.__properties__)

    return result;
  },

  /**
   *  Returns true if this component has a property with this name
   *
   * @name vs.core.Object#isProperty
   * @function
   * @return {boolean} true or false
   */
  isProperty : function (name)
  {
    if (this.__properties__ && this.__properties__.indexOf (name) !== -1) return true;
    if (this.constructor.__properties__.indexOf (name) !== -1) return true;

    return false;
  },
  
  /**
   * Defines a new property directly on an object
   * @name vs.core.Object#defineProperty
   *
   * @param {String} prop_name The name of the property to be defined
   * @param {Object} descriptor The descriptor for the property being defined
   */
  defineProperty : function (prop_name, descriptor)
  {
    util.defineProperty (this, prop_name, descriptor);
    if (!this.__properties__) this.__properties__ = [];
    if (this.__properties__.indexOf (prop_name) === -1)
    { this.__properties__.push (prop_name); }
  },

  /**
   * Returns a property descriptor for an own property (that is, one directly
   * present on an object, not present by dint of being along an object's
   * prototype chain) of a given object.
   * @name vs.core.Object#getOwnPropertyDescriptor
   *
   * @param {String} prop The name of the property whose description is to
   *   be retrieved
   * @return {Object} The property descriptor or null
   */
  getOwnPropertyDescriptor : function (prop)
  {
    return Object.getOwnPropertyDescriptor (this, prop);
  },

  /**
   * Returns a property descriptor for a property (along the object's
   * prototype chain) of a given object.
   * @name vs.core.Object#getPropertyDescriptor
   *
   * @param {String} prop The name of the property whose description is to
   *   be retrieved
   * @return {Object} The property descriptor or null
   */
  getPropertyDescriptor : function (prop)
  {
    var desc = Object.getOwnPropertyDescriptor (this, prop);
    if (desc) return desc;

    /** @private */
    function _getOwnPropertyDescriptor (obj, prop)
    {
      if (!obj) return null;
      var proto = Object.getPrototypeOf (obj);
      if (!proto) return null;
      var desc = Object.getOwnPropertyDescriptor (proto, prop);
      if (desc) return desc;
      return _getOwnPropertyDescriptor (proto, prop);
    }

    return _getOwnPropertyDescriptor (this, prop);
  },

  /**
   * @private
   */
  _super : function ()
  {
    var superFunc = this._super.caller._super_func_;
    if (superFunc) superFunc.apply (this, arguments);
  },
};

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (VSObject, "id", {
  /**
   * Getter for vs.core.Object id
   * @name vs.core.Object#id
   *
   * @type {String}
   */
  get : function () { return this._id; }
});

/**
 * @private
 */
function _cloneValue (value)
{
  if (value && util.isFunction (value.clone)) return value.clone ();
  else return util.clone (value);
}

/**
 * @private
 */
function _propertyCloneValue_api1 (prop_name, src, trg)
{
  var getter = src.__lookupGetter__ (prop_name),
    setter = src.__lookupSetter__ (prop_name),
    setter_clone = trg.__lookupSetter__ (prop_name),
    _prop_name = '_' + util.underscore (prop_name);

  // Property value copy
  if (setter || getter)
  {
    if (setter_clone) { trg [prop_name] = _cloneValue (src [_prop_name]); }
    else { trg [_prop_name] = _cloneValue (src [_prop_name]); }
  }
}

/**
 * @private
 */
function _propertyCloneValue_api2 (prop_name, src, trg)
{
  var desc = src.getPropertyDescriptor (prop_name),
    desc_clone = trg.getPropertyDescriptor (prop_name),
    _prop_name = '_' + util.underscore (prop_name);
  
  // Property value copy
  if (desc && desc_clone && (desc.get || desc.set))
  {
    if (desc_clone.set) { trg [prop_name] = _cloneValue (src [_prop_name]); }
    else { trg [_prop_name] = _cloneValue (src [_prop_name]); }
  }
}

/**
 * @private
 */
var propertyCloneValue =
  (Object.defineProperty)?_propertyCloneValue_api2:_propertyCloneValue_api1;

/********************************************************************
                      Static members
*********************************************************************/
/** @private */
VSObject._obs = {};
VSObject.__propertyCloneValue = propertyCloneValue;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Object = VSObject;
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
 * @memberOf vs.core
 * @name createClass
 * @function
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
          var base = this, namespaces = _path.split ('.');
          while (base && namespaces.length) {
            base = base [namespaces.shift ()];
          }
          if (base) base [_prop_name] = v;
          this.propertyChange (_prop_name);
        };
      }(result[1], result[2]));

      desc.get = (function (_path, _prop_name)
      {
        return function ()
        {
          var base = this, namespaces = _path.split ('.');
          while (base && namespaces.length) {
            base = base [namespaces.shift ()];
          }
          if (base) return base [_prop_name];
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


/*
 *----------------------------------------------------------------------
 *
 * _DoOneEvent --
 *
 *  Process a single event of some sort.  If there's no work to
 *  do, wait for an event to occur, then process it.
 *
 *
 *----------------------------------------------------------------------
 */

/**
 *  Structure used for managing events
 *  @private
 */
function Handler (_obj, _func) {
  this.obj = _obj;
  if (util.isFunction (_func)) {
    this.func_ptr = _func;
  }
  else if (util.isString (_func)) {
    this.func_name = _func;
  }
}

/**
 * @private
 */
Handler.prototype.destructor = function () {
  delete (this.obj);
  delete (this.func_ptr);
  delete (this.func_name);
};

/**
 *  Structure used for managing task
 *  @private
 */
function TaskHandler (func, args) {
  this.func_ptr = func;
  this.args = args;
}

/**
 * @private
 */
TaskHandler.prototype.run = function () {
  this.func_ptr.apply (undefined);
};

/**
 * @private
 */
TaskHandler.prototype.destructor = function () {
  delete (this.args);
  delete (this.func_ptr);
};

/**
 * @private
 */
var
  // Events queue. This array contains event structure for future propagation.
  // This array is part of the algorithm that secure event propagation, in
  // particular that avoids a event pass a previous one.
  _async_events_queue = [],
  
  // Event reference on the current synchronous event.
  _sync_event = null,
  
  // Actions queue. This array contains all actions (function for the moment)
  // that have to be execute.
  // This queue is used only in case we use our own implementation of 
  // setImmediate.
  _actions_queue  = [],
  // Boolean indicating if we are propagating a event or not.
  // To secure event propagation, in particular to avoid a event pass a previous
  // event, we manage a events queue and block new propagation if a event is
  // in propagation.
  _is_async_events_propagating = false,
  _is_sync_events_propagating = false,
  
  // Boolean indicating if we are running an action or not.
  // This boolean is used only in case we use our own implementation of 
  // setImmediate.
  _is_action_runing = false,
  _is_waiting = false;

/**
 * Put an asynchronous event into the event queue and request the mainloop
 *
 * @private
 */
function queueProcAsyncEvent (event, handler_list) {
  if (!event || !handler_list) return;

  var burst = {
    handler_list : handler_list,
    event : event
  }

  // push the event to dispatch into the queue
  _async_events_queue.push (burst);

  // request for the mainloop
  serviceLoop ();
}

/**
 * Setup a synchronous event and request the mainloop
 *
 * @private
 */
function queueProcSyncEvent (event, handler_list) {
  if (!event || !handler_list) return;

  var burst = {
    handler_list : handler_list,
    event : event
  }

  // push the event to dispatch into the queue
  _sync_event = burst;

  // request for the mainloop
  serviceLoop ();
}

/**
 * doOneEvent will dispatch One event to all observers.
 *
 * @private
 * @param {Object} burst a event burst structure
 * @param {Boolean} isSynchron if its true the callbacks are executed
 *             synchronously, otherwise they are executed within a setImmediate
 */
function doOneEvent (burst, isSynchron) {
  var
    handler_list = burst.handler_list,
    n = handler_list.length,
    i = n, l = n,
    event = burst.event;

  if (isSynchron) _is_sync_events_propagating = true;
  else _is_async_events_propagating = true;
  
  // Test is all observers have been called
  function end_propagation () {
    l--;
    if (l <= 0) {
      if (isSynchron) _is_sync_events_propagating = false;
			else _is_async_events_propagating = false;
		}
  }

  /**
   * doOneHandler will dispatch One event to an observer.
   *
   * @private
   * @param {Handler} handler
   */
  function doOneHandler (handler) {
    if (handler) try {
      if (util.isFunction (handler.func_ptr)) {
        // call function
        handler.func_ptr.call (handler.obj, event);
      }
      else if (util.isString (handler.func_name) &&
               util.isFunction (handler.obj[handler.func_name]))
      {
        // specific notify method
        handler.obj[handler.func_name] (event);
      }
      else if (util.isFunction (handler.obj.notify)) {
        // default notify method
        handler.obj.notify (event);
      }
    }
    catch (e) {
      if (e.stack) console.error (e.stack);
      else console.error (e);
    }
    end_propagation ();
  };

  if (!i) end_propagation (); // should not occur
  
  // For each observers, schedule the handler call (callback execution)
  for (i = 0; i < n; i++) {
    if (isSynchron) doOneHandler (handler_list [i])
  
    else (function (handler) {
        vs.setImmediate (function () { doOneHandler(handler) });
      }) (handler_list [i])
  }
}

/**
 * doOneAsyncEvent will dispatch One event to all observers.
 *
 * @private
 */
function doOneAsyncEvent () {
  if (_is_async_events_propagating || _is_sync_events_propagating) return;
  
  // dequeue the next event burst and do it
  doOneEvent (_async_events_queue.shift ());
}

/**
 * doOneSyncEvent will dispatch the synchronous event to all observers.
 *
 * @private
 */
function doOneSyncEvent () {
  doOneEvent (_sync_event, true);
  _sync_event = null;
}

/**
 * doAction, execute one action. This method is called with our setImmediate
 * implementation.
 *
 * @private
 */
function doAction () {

  if (!_actions_queue.length) return;
  
  var action = _actions_queue.shift ();

  if (action) try {
    _is_action_runing = true;
    action.run ();
  }
  catch (e) {
    if (e.stack) console.error (e.stack);
    else console.error (e);
  }

  vs.util.free (action);
  _is_action_runing = false;

  if (_actions_queue.length) { _delay_do_action (); }
}

/**
 * doAction, execute one action. This method is called with our setImmediate
 * implementation.
 *
 * @private
 */
function installPostMessageImplementation () {

  var MESSAGE_PREFIX = "vs.core.scheduler" + Math.random ();

  function onGlobalMessage (event) {
    if (event.data === MESSAGE_PREFIX) {
      doAction ();
    }
  }
  
  if (window.addEventListener) {
    window.addEventListener ("message", onGlobalMessage, false);
  }

  return function () {
    window.postMessage (MESSAGE_PREFIX, "*");
  };
}

var _delay_do_action = (window.postMessage)?installPostMessageImplementation():
  function () {setTimeout (doAction, 0)};

/**
 * Install our awn setImmediate implementation, if needs
 *
 * @private
 */
var setImmediate = window.setImmediate || function (func) {

  // push the action to execute into the queue
  _actions_queue.push (new TaskHandler (func));

  // doAction
  if (!_is_action_runing) _delay_do_action ();
};

/**
 * This method is used to break-up long running operations and run a callback
 * function immediately after the browser has completed other operations such
 * as events and display updates.
 *
 * @example
 * vs.setImmediate (function () {...});
 *
 * @see vs.scheduleAction
 * @name vs.setImmediate 
 * @param {Function} func The action to run
 */
vs.setImmediate = setImmediate;

/**
 * Mainloop core
 *
 * @private
 */
function serviceLoop () {

  if (_sync_event) doOneSyncEvent ();

  if ((_async_events_queue.length === 0 && _actions_queue.length === 0) ||
      _is_waiting) return;

  function loop () {
    _is_waiting = false;
    serviceLoop ();
  }

  if (_is_async_events_propagating || _is_sync_events_propagating) {
    // do the loop
    vs.setImmediate (loop);
    return;
  }

  // dispatch an event to observers
  if (!_is_action_runing && _actions_queue.length) _delay_do_action ();
  if (_async_events_queue.length) doOneAsyncEvent ();
}

/** 
 * Schedule your action on next frame.
 *
 * @example
 * vs.scheduleAction (function () {...}, vs.ON_NEXT_FRAME);
 *
 * @see vs.scheduleAction
 *
 * @name vs.ON_NEXT_FRAME 
 * @type {String}
 * @const
 * @public
 */ 
var ON_NEXT_FRAME = '__on_next_frame__';

/** 
 * Schedule an action to be executed asynchronously.
 * <br />
 * There is three basic scheduling; the action can be executed:
 * <ul>
 *   <li>as soon as possible.
 *   <li>on the next frame
 *   <li>after a delay
 * </ul>
 *
 * 1- As soon as possible<br />
 * The action will be executed as soon as possible in a manner that is
 * typically more efficient and consumes less power than the usual
 * setTimeout(..., 0) pattern.<br />
 * It based on setImmediate if it is available; otherwise it will use postMessage
 * if it is possible and at least setTimeout(..., 0) pattern if previous APIs are
 * not available.
 *<br /><br />
 *
 * 2- On next frame<br />
 * The action will be executed on next frame.<br />It is equivalent to use
 * window.requestAnimationFrame.
 *<br /><br />
 *
 * 2- After a delay<br />
 * The action will be executed after a given delay in millisecond.<br />
 * It is equivalent to use window.setTimeout(..., delay).
 *
 * @example
 * // run asap
 * vs.scheduleAction (function () {...});
 * // run on next frame
 * vs.scheduleAction (function () {...}, vs.ON_NEXT_FRAME);
 * // run after 1s
 * vs.scheduleAction (function () {...}, 1000);
 *
 * @name vs.scheduleAction 
 * @type {String}
 * @function
 * @public
 *
 * @param {Function} func The action to run
 * @param {(Number|String)} delay when run the action [optional]
 */ 
function scheduleAction (func, delay) {
  if (!util.isFunction (func)) return;
  if (delay && util.isNumber (delay)) {
    setTimeout (func, delay);
  }
  else if (delay === ON_NEXT_FRAME) {
    vs.requestAnimationFrame (func);
  }
  else vs.setImmediate (func);
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
util.extend (vs, {
  scheduleAction: scheduleAction,
  ON_NEXT_FRAME: ON_NEXT_FRAME
});
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

/**
 * @name vs.core.FORCE_EVENT_PROPAGATION_DELAY
 */
core.FORCE_EVENT_PROPAGATION_DELAY = false;

var EVENT_SUPPORT_GESTURE = false;
var hasMSPointer = window.navigator.msPointerEnabled;

/** 
 * Start pointer event (mousedown, touchstart, )
 * @name vs.core.POINTER_START
 * @type {String}
 * @const
 */ 
core.POINTER_START = vs.POINTER_START;

/** 
 * Move pointer event (mousemove, touchmove, )
 * @name vs.core.POINTER_MOVE 
 * @type {String}
 * @const
 */ 
core.POINTER_MOVE = vs.POINTER_MOVE;

/** 
 * End pointer event (mouseup, touchend, )
 * @name vs.core.POINTER_END 
 * @type {String}
 * @const
 */ 
core.POINTER_END = vs.POINTER_END;

/** 
 * Cancel pointer event (mouseup, touchcancel, )
 * @name vs.core.POINTER_CANCEL 
 * @type {String}
 * @const
 */ 
core.POINTER_CANCEL = vs.POINTER_CANCEL;

/** 
 * Start gesture event
 * @name vs.core.GESTURE_START
 * @type {String}
 * @const
 */ 
core.GESTURE_START = vs.GESTURE_START;

/** 
 * Change gesture event
 * @name vs.core.GESTURE_MOVE 
 * @type {String}
 * @const
 */ 
core.GESTURE_CHANGE = vs.GESTURE_CHANGE;

/** 
 * End gesture event
 * @name vs.core.GESTURE_END 
 * @type {String}
 * @const
 */ 
core.GESTURE_END = vs.GESTURE_END;

/**
 *  @class
 *  An vs.core.Event object, or simply an event, contains information about an 
 *  input action such as a button click or a key down. The Event object contains
 *  pertinent information about each event, such as where the cursor was located
 *  or which character was typed.<br>
 *  When an event is catch by an application component, the callback
 *  receives as parameters an instance (or sub instance) of this class.
 *  <p>
 *  It specifies the source of the event (which object has generated the event),
 *  the type of the event and an event data.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 *  @memberOf vs.core
 *
 * @param {vs.core.EventSource} src the source of the event [mandatory]
 * @param {string} type the event type [mandatory]
 * @param {Object} data complemetary event data [optional]
*/
var Event = function (src, type, data)
{
  this.src = src;
  this.srcTarget = src;
  this.type = type;
  this.data = data;
}

Event.prototype =
{
  /**
   * The component which produce the event
   * @type {vs.core.EventSource|HTMLElement}
   * @name vs.core.Event#src
   */
  src: null,
  
  /**
   * [Deprecated] The component which produce the event. <br>
   * In case of DOM event, the Event is mapped to the DOM event. Then
   * the developer has access to srcTarget (and many other data).
   * @type {vs.core.EventSource|HTMLElement}
   * @name vs.core.Event#srcTarget
   * @deprecated
   */
  srcTarget : null,
  
  /**
   * The event spec. For instance 'click' for a mouse click event.
   * @type {String}
   * @name vs.core.Event#type
   */
  type: "",
  
  /**
   * The optional data associate to the event.
   * @type {Object|null}
   * @name vs.core.Event#data
   */
  data: null,
  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    delete (this.src);
    delete (this.srcTarget);
    delete (this.type);
    delete (this.data);
  }
};

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Event = Event;

/** touch event messages */
core.EVENT_SUPPORT_GESTURE = EVENT_SUPPORT_GESTURE;
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

/**
 *  @class
 *  vs.core.EventSource is an  class that forms the basis of event and command
 *  processing. All class that handles events must inherit form EventSource.
 *
 *  @extends vs.core.Object
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.EventSource
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function EventSource (config)
{
  this.parent = VSObject;
  this.parent (config);
  this.constructor = core.EventSource;

  this.__bindings__ = {};
  this.__node_binds__ = {};
}

/** @name vs.core.EventSource# */
EventSource.prototype =
{
  /**
   * @protected
   * @function
   */
  __bindings__ : null,

  /**
   * @protected
   * @function
   */
  __node_binds__: null,

  /***************************************************************

  ***************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    var spec, handler_list, i, handler, binds;

    function deleteBindings (handler_list)
    {
      if (!handler_list) return;

      var bind, l = handler_list.length;
      while (l--)
      {
        bind = handler_list [l];
        util.free (bind);
      }
    };

    for (var spec in this.__bindings__)
    {
      deleteBindings (this.__bindings__ [spec]);
      delete (this.__bindings__ [spec]);
    }

    delete (this.__bindings__);

    for (spec in this.__node_binds__)
    {
      binds = this.__node_binds__ [spec];
      if (typeof (binds) === "undefined")
      {
        console.warn
          ("vs.core.Object.destructor, no bind <" + spec + " exists.");
        continue;
      }
      for (i = 0; i < binds.length; i++)
      {
        data = binds [i];
        data.n.removeEventListener (event, data.h);
      }
    }
    delete (this.__node_binds__);

    VSObject.prototype.destructor.call (this);
  },

  /**
   * @name vs.core.EventSource#_clone
   * @function
   * @private
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone : function (obj, cloned_map)
  {
    VSObject.prototype._clone.call (this, obj, cloned_map);

    obj.__bindings__ = {};
    obj.__node_binds__ = {};
  },

  /**
   *  The event bind method to listen events
   *  <p>
   *  When you want listen an event generated by this object, you can
   *  bind your object (the observer) to this object using 'bind' method.
   *  <p>
   *
   * @name vs.core.EventSource#bind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {vs.core.Object} obj the object interested to catch the event [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   */
  bind : function (spec, obj, func)
  {
    if (!spec || !obj) { return; }

    /** @private */
    var handler = new Handler (obj, func),
      handler_list = this.__bindings__ [spec];
    if (!handler_list)
    {
      handler_list = [];
      this.__bindings__ [spec] = handler_list;
    }
    handler_list.push (handler);

    return handler;
  },

  /**
   *  The event unbind method
   *  <p>
   *  Should be call when you want stop event listening on this object
   *
   * @name vs.core.EventSource#unbind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {vs.core.Object} obj the object you want unbind [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        all binding with <spec, obj> will be removed
   */
  unbind : function (spec, obj, func)
  {
    function unbind (handler_list)
    {
      if (!handler_list) return;

      var handler, i = 0;
      while (i < handler_list.length)
      {
        handler = handler_list [i];
        if (handler.obj === obj)
        {
          if (util.isString (func) || util.isFunction (func) )
          {
            if (handler.func_name === func || handler.func_ptr === func)
            {
              handler_list.remove (i);
              util.free (handler);
            }
            else { i++; }
          }
          else
          {
            handler_list.remove (i);
            util.free (handler);
          }
        }
        else { i++; }
      }
    };

    unbind (this.__bindings__ [spec]);
  },

  /**
   *  Propagate an event
   *  <p>
   *  All Object listening this EventSource will receive this new handled
   *  event.
   *
   * @name vs.core.EventSource#propagate
   * @function
   *
   * @param {String} spec the event specification [mandatory]
   * @param {Object} data an optional data event [optional]
   * @param {vs.core.Object} srcTarget a event source, By default this object
   *        is the event source [mandatory]
   */
  propagate : function (type, data, srcTarget)
  {
    var handler_list = this.__bindings__ [type], event;
    if (!handler_list || handler_list.length === 0)
    {
      if (this.__parent)
      {
        if (!srcTarget) { srcTarget = this; }
        this.__parent.propagate (type, data, srcTarget);
      }
      return;
    }

    event = new Event (this, type, data);
    if (srcTarget) { event.srcTarget = srcTarget; }

    queueProcAsyncEvent (event, handler_list);
  },

  /**
   * if this object receive an event it repropagates it if nobody has
   * overcharged the notify method.
   *
   * @name vs.core.EventSource#notify
   * @function
   *
   * @protected
   */
  notify : function (event)
  {
    this.propagate (event.type, event.data);
  },

  /**
   *  The event bind method to listen events form DOM
   *  <p>
   *  When you want you object listen an event generated by the DOM, you can
   *  bind your object (the observer) to the node using 'nodeBind' method.
   *
   * @name vs.core.EventSource#nodeBind
   * @function
   *
   * @param {Node} node the node to observe [mandatory]
   * @param {string} spec the event specification [mandatory]
   * @param {string|Function} func the name of a callback or the callback
   *      itself. If its not defined notify method will be called [optional]
   */
  nodeBind : function (node, event, func_s, modifiers)
  {
    if (!node) { return; }
    if (!util.isString (event)) { return; }

    var self = this, func = null, handler = null, binds, key;

    if (typeof (func_s) === "undefined") { func_s = 'notify'; }
    else if (util.isString (func_s))
    {
      if (!util.isFunction (this [func_s]))
      {
        console.warn
          ("vs.core.Object.nodeBind, unknown function named: " + func_s);
        return;
      }
    }
    else if (!util.isFunction (func_s))
    {
      console.error ("vs.core.Object.nodeBind, invalid func parameter");
      return;
    }
    else
    {
      func = func_s;
      func_s = func.name;
    }

    if (!modifiers || modifiers === KEYBOARD.ANY_MASK)
    {
      /**
       * @private
       */
      handler = function (event)
      {
        // event.preventDefault ();
        // event.stopPropagation (); // Seems this line of code bug with BB OS

        try
        {
          event.src = event.currentTarget;
          event.data = event;

          if (!func) { func = self [func_s]; }
          func.call (self, event);
        }
        catch (e)
        {
          if (e.stack) console.log (e.stack)
          console.error (e);
        }
      };
    }
    else
    {
      handler = function (event)
      {
        // event.preventDefault ();
        // event.stopPropagation ();

        try
        {
          if (!modifiers &&
            (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey))
          { return; }
          else if (modifiers === KEYBOARD.ALT && !event.altKey)
          { return; }
          else if (modifiers === KEYBOARD.CTRL && !event.ctrlKey)
          { return; }
          else if (modifiers === KEYBOARD.SHIFT && !event.shiftKey)
          { return; }
          else if (modifiers === KEYBOARD.META && !event.metaKey)
          { return; }
          event.src = event.currentTarget;
          event.data = event;

          if (!func) { func = self [func_s]; }
          func.call (self, event);
        }
        catch (e)
        {
          if (e.stack) console.log (e.stack)
          console.error (e);
        }
      };
    }

    // save data for nodeUnbind
    key = event + func_s;
    if (!this.__node_binds__)
    {
      console.error ('nodeBind impossible');
      return;
    }
    binds = this.__node_binds__ [key];
    if (typeof (binds) === "undefined")
    {
      binds = [];
      this.__node_binds__ [key] = binds;
    }
    binds.push ({n: node, h: handler});

    // set the listener
    vs.addPointerListener (node, event, handler, false);
  },

  /**
   *  Unbind a DOM event listening
   *  <p>
   *
   * @name vs.core.EventSource#nodeUnbind
   * @function
   *
   * @param {Node} node the node which is observed [mandatory]
   * @param {string} spec the event specification [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   */
  nodeUnbind : function (node, event, func_s)
  {
    if (!node) { return; }
    if (!util.isString (event)) { return; }

    var func = null, i, key, binds, data;
    if (typeof (func_s) === "undefined") { func_s = 'notify'; }
    else if (util.isString (func_s))
    {
      if (!util.isFunction (this [func_s]))
      {
        console.warn ("vs.core.Object.nodeUnbind, unknown function named: " + func_s);
        return;
      }
    }
    else if (!util.isFunction (func_s))
    {
      console.error ("vs.core.Object.nodeBind, invalid func parameter");
      return;
    }
    else
    {
      func = func_s;
      func_s = func.name;
    }

    key = event + func_s;
    binds = this.__node_binds__ [key];
    if (typeof (binds) === "undefined")
    {
      console.warn
        ("vs.core.Object.nodeUnbind, no bind <" + event + ',' + func_s + "> exists.");
      return;
    }
    for (i = 0; i < binds.length;)
    {
      data = binds [i];
      if (data.n === node)
      {
        vs.removePointerListener (node, event, data.h, false);
        binds.remove (i);
      }
      else
      {
        i++;
      }
    }

    // TODO WARNING pas bon, si plusieurs objets l'observe !!!
    node._object_ = undefined;
  },
//
//   /**
//    *  Should be documented
//    *
//    * @name vs.core.EventSource#allDocumentBind
//    * @function
//    *
//    */
//   allDocumentBind : function (event, func)
//   {
//     this._allDocumentBind (document, event, func);
//   },
//
//   /**
//    * @private
//    * @function
//    */
//   _allDocumentBind : function (doc, event, func)
//   {
//     if (!doc) { return; }
//
//     // current document event management
//     this.nodeBind (doc, event, func);
//
//     // children document event management
//     var frame, iframes, i;
//     if (doc.frames)
//     {
//       for (i = 0; i < doc.frames.length; i++)
//       {
//         frame = doc.frames [i];
//         this._allDocumentBind (frame.contentDocument, event, func);
//       }
//     }
//     iframes = doc.getElementsByTagName ('iframe');
//     if (iframes)
//     {
//       for (i = 0; i < iframes.length; i++)
//       {
//         frame = iframes.item (i);
//         this._allDocumentBind (frame.contentDocument, event, func);
//       }
//     }
//   },
//
//   /**
//    *  Should be documented
//    *
//    * @name vs.core.EventSource#allDocumentUnbind
//    * @function
//    *
//    */
//   allDocumentUnbind : function (event, func)
//   {
//     this._allDocumentUnbind (document, event, func);
//   },
//
//   /**
//    * @private
//    * @function
//    */
//   _allDocumentUnbind : function (doc, event, func)
//   {
//     if (!doc) { return; }
//
//     // current document event management
//     this.nodeUnbind (doc, event, func);
//
//     // children document event management
//     var frame, iframes, i;
//     if (doc.frames)
//     {
//       for (i = 0; i < doc.frames.length; i++)
//       {
//         frame = doc.frames [i];
//         this._allDocumentUnbind (frame.contentDocument, event, func);
//       }
//     }
//     iframes = doc.getElementsByTagName ('iframe');
//     if (iframes)
//     {
//       for (i = 0; i < iframes.length; i++)
//       {
//         frame = iframes.item (i);
//         this._allDocumentUnbind (frame.contentDocument, event, func);
//       }
//     }
//   }
};
util.extendClass (EventSource, VSObject);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.EventSource = EventSource;

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

/**
 * The vs.core.Model class
 *
 * @extends vs.core.EventSource
 * @class
 * vs.core.Model is a class that defines the basic Model mechanisms to implement
 * a MVC like architecture. If you need to implement a MVC component, you
 * should extend this class.<br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND
 * THE API MAY CHANGE IN THE FUTURE <<< <p>
 * WikiPedia gives this following definition of a model:<br>
 * "The model manages the behavior and data of the application, responds to
 * requests for information about its state (usually from the view), and
 * responds to instructions to change state (usually from the controller)"
 * <p>
 * The Model class exposes 2 kinds of mechanisms you will need:
 * <ul>
 *  <li> Change event binding
 *  <li> Properties change propagation
 * </ul>
 *
 * <p/>
 *
 * <p/>
 * The fallowing example show a TodoModel class with three properties
 * @example
 *  var TodoModel = vs.core.createClass ({
 *
 *   // parent class
 *   parent: vs.core.Model,
 *
 *   // Properties definition
 *   properties : {
 *     content: vs.core.Object.PROPERTY_IN_OUT,
 *     done: vs.core.Object.PROPERTY_IN_OUT,
 *     date: vs.core.Object.PROPERTY_OUT
 *   },
 *
 *   // Initialization
 *   initComponent : function ()
 *   {
 *     this._date = new Date ();
 *     this._done = false;
 *     this._content = "";
 *   }
 * });
 *
 * var myModel = new TodoModel ({content:"Something to do"});
 * myModel.init ();
 *
 * @see vs.core.DataStorage
 * @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.Model
 *
 * @param {Object} config the configuration structure
 */
function Model (config)
{
  this.parent = EventSource;
  this.parent (config);
  this.constructor = vs.core.Model;

  this.__links__ = [];
}

Model.prototype = {

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @type {Array}
   */
   __links__: null,

  /**
   * @protected
   * @type {Boolean}
   */
   __should_propagate_changes__: true,

  /**
   * @protected
   * @type {vs.core.DataStorage}
   */
   _sync_service_: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * The event bind method to listen model changes
   * <p/>
   * When you want listen modificaan event generated by this object, you can
   * bind your object (the observer) to this object using 'bindChange' method.
   * <p/>
   *
   * @name vs.core.Model#bindChange
   * @function
   * @example
   *  // Listen every change of the model
   *  myModel.bindChange ('', this, this.onChange);
   *  // Listen all the 'add' change of the model
   *  myModel.bindChange ('add', this, this.onChange);
   *
   * @param {string} action the event specification [optional]
   * @param {vs.core.Object} obj the object interested to catch the event [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   */
  bindChange : function (spec, obj, func)
  {
    if (!obj) { return; }

    this.bind ((spec)? 'change:' + spec : 'change', obj, func);
  },

  /**
   *  The event unbind change method
   *  <p>
   *  Should be call when you want stop event listening on this object
   *
   * @name vs.core.Model#unbindChange
   * @function
   *
   * @param {string} spec the event specification [optional]
   * @param {vs.core.Object} obj the object you want unbind [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        all binding with <spec, obj> will be removed
   */
  unbindChange : function (spec, obj, func)
  {
    this.unbind ((spec)? 'change:' + spec : 'change', obj, func);
  },

  /**
   * Configure the model to do not propagate event change.<br/>
   * In order to aggregate rapid changes to a model, you will deactivate
   * change event propagate.
   * After all change are finish you can manual call model.change () to
   * trigger the event.
   * <p>
   * Calling model.change () will reactivate event propagation.
   *
   * @name vs.core.Model#stopPropagation
   * @function
   */
  stopPropagation : function ()
  {
    this.__should_propagate_changes__ = false;
  },

  /**
   *  When you override a Model, you should call this.hasToPropagateChange ()
   *  before calling this.change ().
   *  <p>
   *  Calling model.change () will reactivate event propagation.
   *
   * @name vs.core.Model#hasToPropagateChange
   * @function
   * @protected
   */
  hasToPropagateChange : function ()
  {
    return this.__should_propagate_changes__;
  },

  /**
   * Manually trigger the "change" event.
   * If you have deactivated propagation using myModel.stopPropagation ()
   * in order to aggregate changes to a model, you will want to call
   * myModel.change () when you're all finished.
   * <p>
   * Calling myModel.change () reactivate automatic change propagation
   *
   * @name vs.core.Model#change
   * @function
   *
   * @param {String} action the event specification [optional]
   */
  change : function (spec, data, doNotManageLinks)
  {
    var list_bind, event, handler;

    this.__should_propagate_changes__ = true;

    spec = (spec)? 'change:' + spec : 'change';
    event = new Event (this, spec, data);

    try
    {
      // 1) manage links propagation
      if (!doNotManageLinks)
      {
        var l = this.__links__.length, obj;
        while (l--) { this.__links__ [l].configure (this); }
      }

      //propagate retrictive bindings
      if (spec !== 'change')
        queueProcSyncEvent (event, this.__bindings__ [spec]);

      //propagate general change
      queueProcSyncEvent (event, this.__bindings__ ['change']);
    }
    catch (e)
    {
      if (e.stack) console.error (e.stack);
      console.error (e);
    }
  },

  /**
   *  Propagate an event
   *  <p>
   *  All Object listening this EventSource will receive this new handled
   *  event.
   *
   * @name vs.core.EventSource#propagate
   * @function
   *
   * @param {String} spec the event specification [mandatory]
   * @param {Object} data an optional data event [optional]
   * @param {vs.core.Object} srcTarget a event source, By default this object
   *        is the event source [mandatory]
   */
  propagate : function (type, data, srcTarget)
  {
    this.__should_propagate_changes__ = true;

    EventSource.prototype.propagate.call (this, type, data, srcTarget);
  },

  /**
   * @protected
   *
   * @name vs.core.Model#linkTo
   * @function
   *
   * @param {vs.core.Object} linkTo object
   */
  linkTo : function (obj)
  {
    if (obj instanceof vs.core.Object)
    {
      if (this.__links__.indexOf (obj) === -1)
      { this.__links__.push (obj); }
    }
  },

  /**
   * @protected
   *
   * @name vs.core.Model#unlinkTo
   * @function
   *
   * @param {vs.core.Object} linkTo object
   */
  unlinkTo : function (obj)
  {
    if (obj instanceof vs.core.Object)
    {
      this.__links__.remove (obj);
    }
  },

  /**
   * Manually force dataflow properties change propagation.
   * <br/>
   * If no property name is specified, the system will assume all component's
   * input properties have been modified.
   *
   * @name vs.core.Model#propertyChange
   * @function
   *
   * @param {String} property the name of the modified property.[optional]
   */
  propertyChange : function (property)
  {
    if (vs._default_df_) { vs._default_df_.propagate (this, property); }

    if (this.__should_propagate_changes__)
    {
      var l = this.__links__.length, obj;
      if (property) while (l--)
      { this.__links__ [l] [property] = this [property]; }
      else while (l--) { this.__links__ [l].configure (this); }

      this.change (null, null, true);
    }
  },

  /**
   * @protected
   */
  parseData : function (obj)
  {
    var prop_name;
      
    for (prop_name in obj)
    {
      this._parse_property (prop_name, obj [prop_name]);
    }
  },

  /**
   * @protected
   */
  _parse_property : function (prop_name, value)
  {
    var
      _properties_ = this.getModelProperties (),
      desc, _prop_name = '_' + util.underscore (prop_name), model;

    if ((value && value.data) || util.isArray (value))
    {
      model = new VSArray ({id: value.id}).init ();
      model.parseData (value);
    }
    else model = value;
    
    if (_properties_.indexOf (prop_name) === -1)
    {
      // add propperty
      desc = {};
      _prop_name = '_' + util.underscore (prop_name);
      desc.set = (function (prop_name, _prop_name)
      {
        return function (v)
        {
          this[_prop_name] = v;
          this.propertyChange (prop_name);
        };
      }(prop_name, _prop_name));
      
      desc.get = (function (_prop_name)
      {
        return function ()
        {
          return this[_prop_name];
        };
      }(_prop_name));
      
      this.defineProperty (prop_name, desc);
    }


//         if (util.isString (value))
//         {
//           result = util.__date_reg_exp.exec (value);
//           if (result && result [1]) // JSON Date -> Date generation
//           {
//             this ['_' + key] = new Date (parseInt (result [1]));
//           }
//           else this ['_' + key] = value; // String
//         }
    
    this [_prop_name] = model;
  }
};
util.extendClass (Model, EventSource);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Model = Model;
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

/**
 *  The vs.core.KEYBOARD Object
 * <p>
 * <p>
 *  List of predefined event spec:<br>
 *  <ul>
 *  <li> vs.core.KEYBOARD.KEY_UP
 *  <li> vs.core.KEYBOARD.ESC
 *  <li> vs.core.KEYBOARD.ENTER
 *  <li> vs.core.KEYBOARD.SPACE
 *  <li> vs.core.KEYBOARD.BACKSPACE
 *  <li> vs.core.KEYBOARD.SHIFT
 *  <li> vs.core.KEYBOARD.CTRL
 *  <li> vs.core.KEYBOARD.ALT
 *  <li> vs.core.KEYBOARD.NUMLOCK
 *  <li> vs.core.KEYBOARD.LEFT_ARROW 
 *  <li> vs.core.KEYBOARD.UP_ARROW 
 *  <li> vs.core.KEYBOARD.RIGHT_ARROW
 *  <li> vs.core.KEYBOARD.DOWN_ARROW 
 *  <li> vs.core.KEYBOARD.A
 *  <li> vs.core.KEYBOARD.S
 *  <li> vs.core.KEYBOARD.Z
 *  <li> vs.core.KEYBOARD.META
 *  <li> vs.core.KEYBOARD.ANY_MASK
 *  <li> vs.core.KEYBOARD.UNDO
 *  <li> vs.core.KEYBOARD.REDO
 *  <li> vs.core.KEYBOARD.SAVE
 * </ul>
 *
 *  @type vs.core.EventSource
 *
 * @name vs.core.KEYBOARD
 *  @const
 */
var KEYBOARD = new EventSource ('__KEYBOARD__');

/**
 * @private
 */
KEYBOARD._handler_set_down = false;

/**
 * @private
 */
KEYBOARD._handler_set_up = false;

/**
 *  The event bind method to listen events
 *  <p>
 *  When you want listen an event generated by this object, you can
 *  bind your object (the observer) to this object using 'bind' method.
 *  <p>
 *  Warning:<br>
 *  If you know the process of your callback can take time or can be blocking
 *  you should set delay to 'true' otherwise you application will be stuck.
 *  But be careful this options add an overlay in the event propagation.
 *  For debug purpose or more secure coding you can force delay to true, for
 *  all bind using global variable vs.core.FORCE_EVENT_PROPAGATION_DELAY.<br/>
 *  You just have set as true (vs.core.FORCE_EVENT_PROPAGATION_DELAY = true)
 *  at beginning of your program.
 *
 * @name vs.core.KEYBOARD.bind
 * 
 * @param {string} spec the event specification [mandatory]
 * @param {vs.core.Object} obj the object interested to catch the event [mandatory]
 * @param {string} func the name of a callback. If its not defined
 *        notify method will be called [optional]
 * @param {boolean} delay if true the callback 'func' will be call within 
 *        an other "simili thread". 
 */
function KEYBOARD_bind (keyCode, obj, func, prevent)
{
  var handler = EventSource.prototype.bind.call (this, keyCode, obj, func),
    self = this;
  if (prevent) { handler.prevent = true; }
  if (keyCode > KEYBOARD.KEY_UP)
  {
    if (!this._handler_set_up)
    {
      document.documentElement.addEventListener
        ("keyup", function (event)
      {
        self.managePrevent (event.keyCode, event);
        self.propagate (event.keyCode + KEYBOARD.KEY_UP, event);
      }, false);
      this._handler_set_up = true;
    }
  }
  else
  {
    if (!this._handler_set_down)
    {
      document.documentElement.addEventListener
        ("keydown", function (event)
      {
        if ((event.ctrlKey || event.metaKey) &&
            !event.shiftKey && event.keyCode === KEYBOARD.Z)
        {
          self.propagate (KEYBOARD.UNDO);
          event.preventDefault ();
        }
        else if ((event.ctrlKey || event.metaKey) &&
                  event.shiftKey && event.keyCode === KEYBOARD.Z)
        {
          self.propagate (KEYBOARD.REDO);
          event.preventDefault ();
        }
        else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.keyCode === KEYBOARD.S)
        {
          self.propagate (KEYBOARD.SAVE);
          event.preventDefault ();
        }
        else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.keyCode)
        {
          self.managePrevent (KEYBOARD.META + event.keyCode, event);
          self.propagate (KEYBOARD.META + event.keyCode);
          //event.preventDefault ();
        }
        else
        {
          self.managePrevent (event.keyCode, event);
          self.propagate (event.keyCode, event);
        }
      }, false);
      this._handler_set_down = true;
    }
  }
  
  return handler;
};

/**
 *  @private
 */
KEYBOARD.managePrevent = function (type, event)
{
  var list_bind = this.__bindings__ [type], i, handler;
  if (!list_bind) { return; }
  
  for (i = 0; i < list_bind.length; i++)
  {
    handler = list_bind [i];
    if (handler.prevent)
    {
      event.preventDefault ();
      return;
    }
  }
};

KEYBOARD.KEY_UP = 1000; 
KEYBOARD.ESC = 27;
KEYBOARD.ENTER = 13;
KEYBOARD.SPACE = 32;
KEYBOARD.BACKSPACE = 8;
KEYBOARD.SHIFT = 16;
KEYBOARD.CTRL = 17;
KEYBOARD.ALT = 18;
KEYBOARD.NUMLOCK = 144;

KEYBOARD.LEFT_ARROW = 37;
KEYBOARD.UP_ARROW = 38;
KEYBOARD.RIGHT_ARROW = 39;
KEYBOARD.DOWN_ARROW = 40;

KEYBOARD.L = 76;
KEYBOARD.S = 83;
KEYBOARD.Z = 90;


KEYBOARD.META = 2000;
KEYBOARD.ANY_MASK = 3000;

KEYBOARD.UNDO = 256;
KEYBOARD.REDO = 257;
KEYBOARD.SAVE = 258;

/**
 * @private
 */
core.KEYBOARD = KEYBOARD;
core.KEYBOARD.bind = KEYBOARD_bind;
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
 OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 *  The Fsm class
 *
 *  @extends vs.core.EventSource
 *  @class
 *  Fsm element defines a deterministic Finite-State-Machine
 *  (aka Finite-State Automaton). A fsn is an automaton such as:
 *  <ul>
 *    <li />there is only one initial state;
 *    <li />there is no transitions conditioned on null input;
 *    <li />there is only one transition for a given input and a given state.
 *  </ul>
 *
 *    A fsm is specified as flollowing :
 *  <ul>
 *    <li />the set Q, is the set of state;
 *    <li />the set I, is the input alphabet, i.e. a set of word that ca be
 *      generate a transition between two states;
 *    <li />the set O, is the ouput alphabet. It containts the set of word
 *      produced when a transition is crossed;
 *    <li />the set E, is the list of transition <QxIxQxO>;
 *    <li />an initial state.
 *  </ul>
 *
 *  When an automaton is rendered (after run), it begins in the initial state.
 *  It changes to new states depending on events that it receives and the
 *  transition function. Whenever the automaton is deactivated (for instance
 *  by being in a deactivated branch of a Rules), it does not react any more
 *  to events. It will resume to its last state and react again to events when
 *  reactivated.<br /><br />
 *
 *  The general manner to control fsm and make it cross a transition is to
 *  associate event to a input lexem. For that use the methods setInput ().
 *  But an automaton can also be manually control by notifying to it a input
 *  lexem. For that, use the method Fsm.fsmNotify (String).<br /><br />
 *
 *  Automatons can have outputs associated to their transitions (aka Mealy
 *  machine) or states (aka Moore machine, not yet implemented). At that time 
 *  the fsm emit event defined by an string (the output lexem) or call an
 *  action associated to the output lexem.
 *  The event can be received by setting a Binding on this fsm.
 *  Otherwise for specifying the action use the setOuput () method.<br />
 *  <br />
 *  Known limitations:
 *  <ul>
 *   <li />only one output lexem can be generated when crossing a transition.
 *  </ul>
 *
 *  Simple example to create a automata:
 *  @example
 *
 *   var my_fsm = new vs.core.Fsm (object);
 *   // States declaration 
 *   my_fsm.addState ("1");
 *   my_fsm.addState ("2");
 *   // Input lexems declaration
 *   my_fsm.addInput ("a");
 *   my_fsm.addInput ("b");
 *   // Ouptut lexems declaration
 *   my_fsm.addOutput ("c");
 *   my_fsm.addOutput ("d");
 *   // transitions declaration
 *   my_fsm.addTransition ("1", "2", "a", "c");
 *   my_fsm.addTransition ("2", "3", "b", "d");
 *   // initial state declaration
 *   my_fsm.setInitialState ("1");
 *   // activate the FSM
 *   my_fsm.activate ();
 * 
 *   // event associations
 *   // "a" will be generated after the button selection
 *   my_fsm.setInput ("a", aButton, 'select');
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.Fsm.
 *
 * @name vs.core.Fsm
 *
 * @param {vs.core.Object} owner the Object using this Fsm [mandatory]
 */
var Fsm = function (owner)
{
  this.parent = core.EventSource;
  this.parent (createId ());
  this.constructor = Fsm;
  
  this.owner = owner;

  this._list_of_state = {};   ///< List of fsm state : Q
  this._list_input = new Array ();   ///< List of input lexem (alphabet) : I
  this._list_output = new Array ();  ///< List of output lexem (alphabet) : O

  this._initial_state = "";  ///< initial state name
  this._current_state = "";  ///< current state name

  this._inputs = {};
  this._output_action = {};
}

Fsm.prototype =
{
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    delete (this._list_of_state);
    
    this.owner = undefined;
  
    delete (this._list_of_state);
    delete (this._list_input);
    delete (this._list_output);
    delete (this._inputs);
    delete (this._output_action);
    
    core.EventSource.prototype.destructor.call (this);
  },

  /*****************************************************************
  *     Generic function
  ****************************************************************/

  /**
   * @private
   * @function
   * 
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone : function (obj, cloned_map)
  {
    EventSource.prototype._clone.call (this, obj, cloned_map);

    obj.owner = obj.__config__.owner;
    obj._current_state = "";
    
    obj._inputs = {};
    obj._output_action = {};
    
    // XXX TODO WARNING il faut refaire in inputs en outputs.
  },
  
  /**
   *  Full facility constructor that takes specification of the fsm as
   *  parameter.
   *  transitions is an array of object {from, to, on, output}
   *
   * @name vs.core.Fsm#initWithData 
   * @function
   *
   * @param {Array} states is an array of state
   * @param {Array} inputs is an array of input
   * @param {Array} outputs is an array of output
   * @param {Array} transitions is an array of object {from, to, on, output}
   */
  initWithData : function (states, inputs, outputs, transitions)
  {
    if (!states || !inputs || !outputs || !transitions) { return; }
    
    for (var i = 0; i < states.length; i++)
    { this.addState (states [i]); }
    
    for (var i = 0; i < inputs.length; i++)
    { this.addInput (inputs [i]); }
    
    for (var i = 0; i < outputs.length; i++)
    { this.addOutput (outputs [i]); }
    
    for (var i = 0; i < transitions.length; i++)
    {
      this.addTransition (transitions [i].from, transitions [i].to,
        transitions [i].on, transitions [i].output);
    }
  },
  
  /**
   *  Full facility constructor that takes state x state matrix of the fsm as
   *  parameter:
   * <ul>
   *   <li />First columm : list of "from" sates \n
   *   <li />First row : list of "to" sates \n
   *   <li />other cell : tuple "i/o" of input and ouput event \n
   * </ul>
   *
   *  If no id is specified, will create a random one.
   *
   *  @example
   *  // fsm is : 1 -a-> 2 -b-> 3 -c-> 1 \n
   *
   *  matrix = [
   *       ["", "1", "2", "3"],
   *       ["1", "", "a/", ""],
   *       ["2", "", "", "b/"],
   *       ["3", "c/", "", ""]
   *  ];
   *
   *  // Specification for input/output of a transition must have the following
   *  // form : "i" | "i/" | "/o" | "i/o"
   *
   *  fsm = new Fsm (object);
   *  fsm.initWithMatrix (matrix);
   *
   * @name vs.core.Fsm#initWithMatrix 
   * @function
   * @param {Array} matrix
   */
  initWithMatrix : function (matrix)
  {
    // add state
    for (var i = 1; i < matrix[0].length; i++)
    { this.addState (matrix[0] [i]); }
    
    // add transition (add input / output)
    for (var i = 1; i < matrix.length; i++)
    {
      var from = matrix[i][0]

      for (var j = 1; j < matrix[0].length; j++)
      {
        var to = matrix[0][j];
        var i_o =  matrix [i][j];
        if (i_o)
        {
          var io_a = i_o.split ('/');
          if (io_a[0]) this.addInput (io_a[0]);
          if (io_a[1]) this.addOutput (io_a[1]);
          
          this.addTransition (from, to, io_a[0], io_a[1]);
        }
      }
    }
  },
  
  /*******************************************
              Managing inputs
  *******************************************/
  
  /**
   *  Add an imput to the fsm
   *  This input will be add to the list of input alphabet.
   *
   * @name vs.core.Fsm#addInput 
   * @function
   *
   * @param {string} input the new word that will be add to the alphabet
   */
  addInput : function (input)
  {
    if (!input || this.existInput (input)) { return; }
    
    this._list_input.push (input);
  },
  
  /**
   *  Return the input alphabet of the fsm
   *
   * @name vs.core.Fsm#getInputs 
   * @function
   *
   * @return {Array} the alphabet as a set of String
   */
  getInputs : function ()
  {
    return this._list_input.slice ();
  },

  /**
   *  Test if a word in inlcude in imput alphabet
   *
   * @name vs.core.Fsm#existInput 
   * @function
   *
   * @param {string} input the input
   * @return true is exists
   */
  existInput : function (input)
  {
    if (!input) { return; }
    
    return (this._list_input.findItem (input) > -1)
  },
    
  /*******************************************
              Managing outputs
  *******************************************/
  /**
   *  Add an ouput to the fsm
   *  This ouput will be add to the list of ouput alphabet.
   *
   * @name vs.core.Fsm#addOutput 
   * @function
   *
   * @param {string} output the new word that will be add to the alphabet
   */
  addOutput : function (output)
  {
    if (!output || this.existOutput (output)) { return; }
    
    this._list_output.push (output);
  },

  /**
   *  Return the ouput alphabet of the fsm
   *
   * @name vs.core.Fsm#getOutputs 
   * @function
   *
   * @return the alphanet as a set of String
   */
  getOutputs : function ()
  {
    return this._list_output.slice ();
  },

  /**
   *  Test if a word in include in ouput alphabet
   *
   * @name vs.core.Fsm#existOutput 
   * @function
   *
   * @param {string} output the output
   * @return true is exists
   */
  existOutput : function (output)
  {
    if (!output) { return; }
    
    return (this._list_output.findItem (output) > -1)
  },
  
  /*******************************************
              Managing States
  *******************************************/
  /**
   *  Add a State to the fsm
   *
   * @name vs.core.Fsm#addState 
   * @function
   *
   * @param {string} name the new state name
   */
  addState : function (name)
  {
    if (!name || this.existState (name)) { return false; }
    
    var state = {};
    state.transitionEvents = {};
    
    this._list_of_state [name] = state;
    return true;
  },

  /**
   *  Remove a State from the fsm
   *
   * @name vs.core.Fsm#removeState 
   * @function
   *
   * @param {string} name the new state name
   */
  removeState : function (name)
  {
    if (!name || !this.existState (name)) { return false; }
        
    delete (this._list_of_state [name]);
    return true;
  },

  /**
   *  Rename a State of the fsm
   *
   * @name vs.core.Fsm#renameState 
   * @function
   *
   * @param {string} old_name the old state name
   * @param {string} new_name the new state name
   */
  renameState : function (old_name, new_name)
  {
    if (!old_name || !this.existState (old_name)) { return false; }
    if (!new_name || this.existState (new_name)) { return false; }
    
    // change state name
    this._list_of_state [new_name] = this._list_of_state [old_name];
    delete (this._list_of_state [old_name]);
    
    // rename initial state if need
    if (this._initial_state === old_name)
    {
      this._initial_state = new_name;
    }
    
    // change all transition to state with the new name
    for (var state_id in this._list_of_state)
    {
      var state = this._list_of_state [state_id];
      if (state === null) { continue; }
      
      for (var input in state.transitionEvents)
      {
        var t = state.transitionEvents [input];
        
        if (t.to === old_name)
        {
          t.to = new_name;
        }
      }
    }
    
    return true;
  },

  /**
   *  Get list of fsm State
   *
   * @name vs.core.Fsm#getListState 
   * @function
   *
   * @return {Array} list of states
   */
  getListState : function ()
  {
    var result = [];
    
    for (var key in this._list_of_state)
    {
      result.push (key);
    }
    return result;
  },

  /**
   *  Test existance of a state
   *
   * @name vs.core.Fsm#existState 
   * @function
   *
   * @param {string} state the state
   * @return true if state exists
   */
  existState : function (state)
  {
    if (!state) { return false; }
    
    if (this._list_of_state [state]) { return true; }
    return false;
  },
    
  /**
   *  Add a new transition from the state "from" to the state "to".
   *  The state from have to be already specified, otherwise, it will
   *  generate a exception.
   *
   * @name vs.core.Fsm#addTransition 
   * @function
   *
   * @param {string} from State from
   * @param {string} to State to
   * @param {string} on input lexem which cause the crossing of transition
   * @param {string} ouput optional ouput lexem that will be produce by the 
   *    crossing
   */
  addTransition : function (from, to, on, output)
  {
    if (!from || !this.existState (from)) { return; }
    if (!to || !this.existState (to)) { return; }
    if (!on || !this.existInput (on)) { return; }

    var transition = {
      on: on,
      to: to,
      output: output
    };
    this._list_of_state [from].transitionEvents [on] = transition;
  },

  /**
   *  Remove a transition from the state "from".
   *
   * @name vs.core.Fsm#removeTransitionFrom 
   * @function
   *
   * @param {string} from State from
   * @param {string} on input lexem which cause the crossing of transition
   */
  removeTransitionFrom : function (from, on)
  {
    if (!from || !this.existState (from)) { return; }
    if (!on || !this.existInput (on)) { return; }

    var state = this._list_of_state [from]
    if (state.transitionEvents [on])
    {
      delete (state.transitionEvents [on]);
    }
  },

  /**
   *  Remove a transition to the state "to".
   *
   * @name vs.core.Fsm#removeTransitionTo 
   * @function
   *
   * @param {string} tp State tp
   * @param {string} on input lexem which cause the crossing of transition
   */
  removeTransitionTo : function (to, on)
  {
    if (!to || !this.existState (to)) { return; }
    if (!on || !this.existInput (on)) { return; }
    
    
    for (var from in this._list_of_state)
    {
      var state = this._list_of_state [from];
      var t = state.transitionEvents [on];
      if (!t || t.to !== to) { continue; }
      
      delete (state.transitionEvents [on]);
    }
  },

  /**
   *  Return the list of transitions to the state set
   *
   * @name vs.core.Fsm#getTransionsToState 
   * @function
   *
   * @param {string} to State to
   * @return {Array} list of transitions
   */
  getTransionsToState : function (to)
  {
    if (!this.existState (to)) { return; }
    
    var result = [];
    
    for (var state_id in this._list_of_state)
    {
      var state = this._list_of_state [state_id];
      if (state === null) { continue; }
      
      for (var input in state.transitionEvents)
      {
        var t = state.transitionEvents [input];
        
        if (t.to !== to) { continue; }
        
        var tt = util.clone (t);
        tt.from = state_id;
        result.push (tt);
      }
    }
    
    return result;
  },

  /**
   *  Return the list of transitions from the state set
   *
   * @name vs.core.Fsm#getTransionsFromState 
   * @function
   *
   * @param {string} from State from
   * @return {Array} list of transitions
   */
  getTransionsFromState : function (from)
  {
    if (!this.existState (from)) { return; }
    
    var result = [];
    
    var state = this._list_of_state [from];
    if (state === null) { return null; }
    
    for (var inputs in state.transitionEvents)
    {
      var t = state.transitionEvents [inputs];
      
      var tt = util.clone (t);
      tt.from = from;
      result.push (tt);
    }
    
    return result;
  },

  /**
   *  Switch two states of the fsm
   *
   *  if states have transitions from or to them,
   *  the function reconfigures the transitions.
   *
   * @name vs.core.Fsm#switchStates 
   * @function
   *
   * @param {string} state_id1 State 
   * @param {string} state_id2 State 
   */
  switchStates : function (state_id1, state_id2)
  {
    if (state_id1 === state_id2) { return; }
   
    if (!this.existState (state_id1) || !this.existState (state_id2))
    { return; }
  
    // 1) get all transitions coming from arriving to state 1 and 2
    // 1.1) get all transitions
    var t_to_state1 = this.getTransionsToState (state_id1);
    var t_from_state1 = this.getTransionsFromState (state_id1);
    var t_to_state2 = this.getTransionsToState (state_id2);
    var t_from_state2 = this.getTransionsFromState (state_id2);
    
    // 1.2) remove doublons in case state_id1 is connected to state_id2
    //   and vise versa.
    for (var i = 0; i < t_to_state1.length;)
    {
      var t = t_to_state1 [i];
      if (t.from === state_id2) { t_to_state1.remove (t); }
      else { i++; }
    }
    for (var i = 0; i < t_from_state1.length;)
    {
      var t = t_from_state1 [i];
      if (t.to === state_id2) { t_from_state1.remove (t); }
      else { i++; }
    }

    // 2) remove all these transitions in order to reconfigure the fsm
    for (var i = 0; i < t_to_state1.length; i ++)
    {
      var t = t_to_state1 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    for (var i = 0; i < t_from_state1.length; i ++)
    {
      var t = t_from_state1 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    for (var i = 0; i < t_to_state2.length; i ++)
    {
      var t = t_to_state2 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    for (var i = 0; i < t_from_state2.length; i ++)
    {
      var t = t_from_state2 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    
    // 3) reconfigure the fsm
    for (var i = 0; i < t_to_state1.length; i ++)
    {
      var t = t_to_state1 [i];
      
      var from = (t.from === state_id2)?state_id1:t.from;
      this.addTransition (from, state_id2, t.on, t.output);
    }
    for (var i = 0; i < t_from_state1.length; i ++)
    {
      var t = t_from_state1 [i];

      var to = (t.from === state_id2)?state_id1:t.to;
      this.addTransition (state_id2, to, t.on, t.output);
    }
    for (var i = 0; i < t_to_state2.length; i ++)
    {
      var t = t_to_state2 [i];

      var from = (t.from === state_id1)?state_id2:t.from;
      this.addTransition (from, state_id1, t.on, t.output);
    }
    for (var i = 0; i < t_from_state2.length; i ++)
    {
      var t = t_from_state2 [i];

      var to = (t.to === state_id1)?state_id2:t.to;
      this.addTransition (state_id1, to, t.on, t.output);
    }
    
    if (this._initial_state === state_id1)
    { this._initial_state = state_id2; }
    else if (this._initial_state === state_id2)
    { this._initial_state = state_id1; }
  },
  
/*******************************************
            Managing Call
*******************************************/
  /**
   *   Build a event binding to an input lexem.
   *  To control the fsm and make it passes trought a transition, the
   *  programmer is able to directly fsmNotify a entry lexem to the fsm (see the
   *  general fsm documentation), or associate event source and spec to an
   *  input lexem, like event binding. <br /><br />
   *
   *  This method takes as parameter a pointer on the event source and the
   *  specification of the event.
   *
   * @name vs.core.Fsm#setInput 
   * @function
   *
   * @param {string} on input lexem on which is associated the event
   * @param {vs.core.EventSource} src the object source of the event
   * @param {string} spec the name of the event
   */
  setInput : function (on, src, event_spec)
  {
    if (!on || !src || !event_spec) { return; }
    
    if (src.bind)
    {
      src.bind (event_spec, this);
    }
    else if (src.addEventListener)
    {
      this.nodeBind (src, event_spec);
    }
    else { return; }

    var a = this._inputs [src];
    if (!a)
    {
      a = [];
      this._inputs [src] = a;
    }
    a.push ([event_spec, on, src]);
  },


  /**
   *   Associate an action to the generation of an output lexem.
   *  To make able the fsm to control the application, the programmer can
   *  associate an action to the generation of an ouput lexem when the fsm
   *  cross a transition.<br /><br />
   *
   *  This method takes as parameter a pointer on an action object and a
   *  optional user data.
   *
   * @name vs.core.Fsm#setOutput 
   * @function
   *
   * @param {string}output output lexem on which is associated the action
   * @param {function|string} action the function's name a function of the
   *        fsm owner
   */
  setOutput : function (output, action)
  {
    if (!output || !action) { return; }
    
    this._output_action [output] = action;
  },
  
/*******************************************
          Event managing methodes
*******************************************/

  /**
   *  Activate the FSM which start by the initial state.
   *  <p>
   *  Return false if no initial state is specified.
   *
   * @name vs.core.Fsm#activate 
   * @function
   *
   * @return {boolean} is activated
   */
  activate : function ()
  {
    if (!this._initial_state || !this._list_of_state [this._initial_state])
    { return false; }
    
    this.goTo (this._initial_state);
    return true;
  },
  
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.core.Fsm#goTo 
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   * @return {Boolean} is the transition was reached
   */
  goTo : function (state_id, output, event)
  {
    // manage output
    // TODO WARNING
    var state = undefined;
    
    if (!this.existState (state_id))
    { return false; }
    
    // hide old states view
    if (this._current_state)
    {
      state = this._list_of_state [this._current_state];
    }
    
    ///
    this._current_state = state_id;
    
    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (util.isFunction (clb))
      {
        clb.call (this.owner, event);
      }
      else if (util.isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
    
    return true;
  },
  
  /**
   *  Clear the fsm.
   *  All state, event and binding are deleted
   *
   * @name vs.core.Fsm#clear
   * @function
   */
  clear : function ()
  {
    this._list_of_state = {};
    
    delete (this._list_input);
    delete (this._list_output);
    
    this._list_input = new Array ();
    this._list_output = new Array ();
    
    this._initial_state = "";
    
    // remove input event bindings
    for (var key in this._inputs)
    {
      var a = this._inputs [key];
      
      for (var i = 0; i < a.length; i++)
      {
        var src = a [i][2];
        var event_spec = a [i][0];
        if (src.bind)
        {
          src.unbind (event_spec, this)
        }
        else if (src.addEventListener)
        {
          this.nodeUnbind (src, event_spec);
        }
      }
    }
    
    this._current_state = "";
  },
  
  /**
   *  @private
   *
   * @name vs.core.Fsm#notify 
   *
   * @param {Object} event the event
   * @function
   */
  notify : function (event)
  {
    var a = this._inputs [event.src];
    if (!a) { return; }
    
    for (var i = 0; i < a.length; i++)
    {
      var spec = a [i][0], on = a [i][1];
      if (event.type !== spec) continue;
      
      if (!this._list_of_state [this._current_state]) { continue; }
      
      this.fsmNotify (on, event.data);
    }
  },
  
  /**
   *  Returns the state accessible on the given input from the current state.
   *  Returns undefined in no state is accessible.
   *
   * @name vs.core.Fsm#getAccessibleStateOn 
   * @function
   * @public
   *
   * @param {String} on input
   * @return {Object} the state  
   */
  getAccessibleStateOn: function (on) {
    if (!this._list_of_state [this._current_state]) { return; }
    
    var transition =
      this._list_of_state [this._current_state].transitionEvents [on];
      
    if (!transition) { return; }
    
    return this._list_of_state [transition.to];
  },
  
  /**
   *  @public
   *
   * @name vs.core.Fsm#fsmNotify 
   * @function
   *
   * @param {String} on input
   * @return {Object} data associate to the event 
   */
  fsmNotify : function (on, data, instant)
  {
    if (!this._list_of_state [this._current_state]) { return; }
    
    var transition =
      this._list_of_state [this._current_state].transitionEvents [on];
      
    if (!transition) { return false; }
    
    this.goTo (transition.to, transition.output, {on: on, data: data}, instant);
    return true;
  }
};
util.extendClass (Fsm, EventSource);

/*****************************************************************
 *     Properties declaration
 ****************************************************************/

util.defineClassProperty (Fsm, "initialState", {
  /**
   *   Define the initiale state
   *   Generate a exception if the state was not already defined
   *
   *   @name vs.core.Fsm#initialState 
   *   @param {string} state_id the state
   */
  set : function (state_id)
  {
    if (!state_id)
    {
      this._initial_state = undefined;
      return;
    }
    
    if (!this.existState (state_id)) { return; }

    // set initial state and go to it   
    this._initial_state = state_id;
  },
  
  /**
   * @ignore
   */
  get : function ()
  {
    return this._initial_state;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/**
 * @private
 */
core.Fsm = Fsm;
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

var edge_id_counter = 1;

function DataFlow (comp) {
  
  // ordered node list Array<Object>
  this.dataflow_node = [];

  // edges from components Object[component.id] => Array[3] <Object, , properties>
  this.dataflow_edges = {};
  this.is_propagating = false;
//  this._node_link = {};
  this.__shouldnt_propagate__ = 0;
  
  this._list_node = [];
  this._edges_from = {};
  
  if (comp && comp.__df__) {
    comp.__df__.push (this);
  }
}

DataFlow.prototype = {
 
  propagate_values : function (obj) {
 
    var data = this.dataflow_edges [obj._id],
      connectors, edges, i = 0, j = 0, l = 0,
      fnc, descriptors,
      edge, obj_next,
      length = 0, length_desc = 0, func = null, params;
    
    if (!data) { return; }

    length = data.length;
    for (i = 0; i < length; i++) {
    
      connectors = data [i]; if (!connectors) { continue; }
      obj_next = connectors [0]; if (!obj_next) { continue; }

      edges = connectors [2];
      if (!edges || !edges.length) { continue; }
      
      for (j = 0; j < edges.length; j++) {
      
        edge = edges [j];
        func = edge [3];
        params = [];
        descriptors = edge [1]; // properties out
        length_desc = descriptors.length;

        // configure parameters
        for (l = 0; l < length_desc; l++) {
          params.push (descriptors [l].call (obj));
        }
        
        if (func) {
          params = func.apply (window, params);
          if (!util.isArray (params)) {
            params = [params];
          }
        }
        
        descriptors = edge [2]; // properties in
        length_desc = descriptors.length;

        if (params.length !== length_desc) {
          console.error ("Dataflow, invalid parameters");
          return;
        }

        // properties value propagation
        for (l = 0; l < length_desc; l++) {
          fnc = descriptors [l];
          fnc.call (obj_next, params [l]);
        }

        obj_next.__input_property__did__change__ = true;
      }
    }
  },
  
  /**
   * Propagates values along the dataflow graph
   *
   * @protected
   *
   * @param {Object} comp, an optional component form witch start the
   *                 propagation
   * @param {Boolean} force force a full propagation, without test
   *                  if properties have changed or not
   * @param {Boolean} output_propagation, do a propagation, starting from
   *         output property instead of input property (default configuration)
   */
  propagate : function (obj, force, output_propagation) {

    // The graph is sorted and save into an array.
    // Propagation consiste of take each object of tree, one by one, following
    // the array order, and propagation value between node, and call
    // propertiesDidChange method.
  
    // 1) the dataflow is propagating values, do nothing.
    if (this.is_propagating || this.__shouldnt_propagate__) { return; }

    this.is_propagating = true;
    
    var i = 0, dataflow_node = this.dataflow_node, l = dataflow_node.length;
    
    // 2) manage the first object from which starting propagation
    if (obj) {
      // find the first node corresponding to the id
      while (i < l && dataflow_node [i] !== obj) { i++; }

      // the node was found. First data propagation
      if (i < l - 1) {
        if (!output_propagation && obj.propertiesDidChange) {
          if (obj.propertiesDidChange ()) {
            // true means output properties were not changed.
            // => stop propagation

            // end of propagation
            this.is_propagating = false;
            return;
          }
        }
        this.propagate_values (obj);
        i++;
      }
      else {
        i = 0;
      }
    }

    // 3) continue the propagation to following nodes
    for (; i < l; i++) {
      obj = dataflow_node [i];
      if (!obj) { continue; }

      if (obj.__input_property__did__change__) {
        obj.__input_property__did__change__ = false;
        if (obj.propertiesDidChange) {
          if (obj.propertiesDidChange ()) {
            // true means output properties were not changed.
            // => stop propagation
            continue;
          }
        }
        this.propagate_values (obj);
      }
    }

    // 4) end of propagation
    this.is_propagating = false;
  },

  /**
   * Connect two components within the datalfow.
   * After a connection, you have to call build method to compile the dataflow.
   * Build can (should) be call when all connection are done (to avoid
   * un-necessary calculation)
   *
   * @public
   * @param {String|Object} obj_src the Component (or Id) source.
   * @param {String|Array} property_out one or an array of output property name(s)
   * @param {String|Object} obj_trg the Component (or Id) target.
   * @param {String|Array} property_in one or an array of input property name(s)
   */
  connect : function (obj_src, property_out, obj_trg, property_in, func) {

    var
      cid_src, cid_trg, properties_out, properties_in,
      data, index, data_l,
      connections, edges,
      edge_id = edge_id_counter++, edge;
  
    if (util.isString (obj_src)){
      cid_src = obj_src;
    }
    else {
      cid_src = obj_src._id;
    }
    
    obj_src = VSObject._obs [cid_src]; if (!obj_src) { return; }
    if (obj_src.__df__.indexOf (this) === -1) {
      obj_src.__df__.push (this);
    }
  
    if (util.isString (obj_trg)) {
      cid_trg = obj_trg;
    }
    else {
      cid_trg = obj_trg._id;
    }
    
    // Properties out management
    if (util.isString (property_out)) {
      properties_out = [property_out];
    }
    else if (!util.isArray (property_out)) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    else {
      properties_out = property_out;
    }
  
    // Properties in management
    if (util.isString (property_in)) {
      properties_in = [property_in];
    }
    else if (!util.isArray (property_in)) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    else {
      properties_in = property_in;
    }
    
    if (!func && properties_in.length !== properties_out.length) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    
    if (this._list_node.indexOf (cid_src) === -1)
      this._list_node.push (cid_src);

    if (this._list_node.indexOf (cid_trg) === -1)
      this._list_node.push (cid_trg);

    data = this._edges_from [cid_src];
    if (!data) {
      data = [];
      this._edges_from [cid_src] = data;
    }
    
    data_l = data.length;
      
    // find a existing connection to the component
    for (index = 0; index < data_l; index++) {
      connections = data [index];
      if (connections[0] === cid_trg) {
        edges = connections [2];
        break;
      }
    }
    // no connection exist, create
    if (!edges) {
      edges = [];
      data.push ([cid_trg, 1, edges]);
    }
    
    edge = [edge_id, properties_out.slice (), properties_in.slice (), func];
    edges.push (edge);
    
    return edge_id;
  },

  /**
   * Remove a dataflow connection
   * After the remove, you have to call build method to compile the dataflow.
   * Build can (should) be call when all remove are done (to avoid
   * un-necessary calculation)
   *
   *  @example
   *  // there is two APIs:
   *  df.unconnect (edge_id);
   *  or
   *  df.unconnect (obj_src, property_out, obj_trg, property_in);
   *
   * @public
   * @param {Number|String|Object} edge_id the id of the edge to remove (this id is returned
   *                 by connect method) or obj_src the Component (or Id) source.
   * @param {String|Array} property_out one or an array of output property name(s)
   * @param {String|Object} obj_trg the Component (or Id) target.
   * @param {String|Array} property_in one or an array of input property name(s)
   */
  unconnect : function () {
    
    if (arguments.length === 1) {
      this._unconnect_by_id (arguments [0]);
    }
    else {
      this._unconnect_by_params.apply (this, arguments);  
    }
  },

  /**
   * Remove a dataflow connection using a edge parameters
   *
   * @private
   * @param {String|Object} obj_src the Component (or Id) source.
   * @param {String|Array} property_out one or an array of output property name(s)
   * @param {String|Object} obj_trg the Component (or Id) target.
   * @param {String|Array} property_in one or an array of input property name(s)
   */
  _unconnect_by_params : function (obj_src, property_out, obj_trg, property_in) {
  
    var
      cid_src, cid_trg, properties_out, properties_in,
      data, index, data_l,
      connections, edges,
      edge_id = edge_id_counter++, edge;

    if (util.isString (obj_src)){
      cid_src = obj_src;
    }
    else {
      cid_src = obj_src._id;
    }

    data = this._edges_from [cid_src];
    if (!data) { return; }
    
    obj_src = VSObject._obs [cid_src]; if (!obj_src) { return; }
    if (obj_src.__df__.indexOf (this) === -1) { return; }
  
    if (util.isString (obj_trg)) {
      cid_trg = obj_trg;
    }
    else {
      cid_trg = obj_trg._id;
    }

    // Properties out management
    if (util.isString (property_out)) {
      properties_out = [property_out];
    }
    else if (!util.isArray (property_out)) {
      console.warn ("DataFlow.unconnect, error");
      return;
    }
    else {
      properties_out = property_out;
    }
  
    // Properties in management
    if (util.isString (property_in)) {
      properties_in = [property_in];
    }
    else if (!util.isArray (property_in)) {
      console.warn ("DataFlow.unconnect, error");
      return;
    }
    else {
      properties_in = property_in;
    }
    
    function removeProperties (sources, list) {
      list.forEach (function (data) {
        var index = sources.indexOf (data);
        if (index !== -1) sources.remove (index);
      });
    }
      
    // find a existing connection to the component
    for (index = 0; index < data.length; index++) {
      connections = data [index];
      if (connections[0] === cid_trg) {
        edges = connections [2];
        
        var i = 0, edge;
        for (; i < edges.length;) {
          edge = edges [i];
      
          properties_out_s = edge [1];
          properties_in_s = edge [2];
          
          removeProperties (properties_out_s, properties_out);
          removeProperties (properties_in_s, properties_in);
          
          if (properties_out_s.length === 0 || properties_in.length === 0) {
            edges.remove (i);
          }
          else i++;
        }
        if (edges.length === 0) {
          data.remove (index);
        }
        else index++;
      }
      else index++;
    }
  },

  /**
   * Remove a dataflow connection using a edge ids
   *
   * @private
   * @param {Number} edge_id the id of the edge to remove
   */
  _unconnect_by_id : function (edge_id) {
    
    for (var cid in this._edges_from) {
      var data = this._edges_from [cid];
      if (!data) continue;
      
      var data_l = data.length;
      
      // find a existing connection to the component
      for (var index = 0; index < data_l; index++) {
        var connections = data [index];
        var edges = connections [2];

        var i = 0, edges_l = edges.length, edge;
        for (; i < edges_l; i++) {
          edge = edges [i];
      
          if (edge && edge [0] === edge_id) {
            edges.remove (i);
//             if (edges.length === 0) {
//               // remove connection
//               
//               
//             }
            return;
          }
        }
      }   
    }
  },

  /**
   * Performs a topological sort on this DAG, so that getNodes returns the
   * ordered list of nodes.<p>
   * Returns true if the graph is acyclic, false otherwise. When the graph is
   * cyclic, the algorithm does at it best to partially order it and issues a
   * warning.
   *
   * @private
   * @return {boolean}
   */
  _sort : function () {

    /// This method uses the classical sorting algorithm with cycle-detection.
    /// See, e.g., http://www.cs.umb.edu/cs310/class23.html
    /// It is normally O(|E|) but this probably won't be the case here
    /// until efficiency issues have been solved.
    /// The algorithm has also been modified in order to cyclic graphs to be
    /// partially sorted instead of being not sorted at all.

    /// 1) Calculate in-degrees for nodes
    var
      nb_node = this._list_node.length,
      indegrees = [], i, j, key, ids, index;

    for (i = 0; i < nb_node; i++) {
      indegrees [i] = 0;
    }

    for (key in this._edges_from) {
      /// FIXME: For more efficiency, store indexes into edges to avoid node
      /// search.
      ids = this._edges_from [key];
      for (j = 0; j < ids.length; j++) {
        //find the index of the node in the node list
        index = this._list_node.findItem (ids [j][0]);
        indegrees [index]++;
      }
    }

    /// 2) Initialization
    var
      pending = this._list_node.slice (),
      sorted = [], violationcount = 0;

    /// 3) Loop until everything has been sorted
    while (pending.length !== 0) {
      /// Extract a node of minimal input degree and append it to list topsorted
      var
        min_i = this._array_min (indegrees),
        indegree = indegrees [min_i];
        
      indegrees.remove (min_i);

      var n_id = pending [min_i];
      pending.remove (min_i);
      
      if (indegree > 0) {
        violationcount++;
      }
      sorted.push (n_id);

      /// 4) Decrement indegrees of nodes m adjacent to n
      /// FIXME: For more efficiency, store adjacent nodes to avoid this search.
      /// Use an adjacency matrix implementation ?
      ids = this._edges_from [n_id];
      if (ids) {
        for (j = 0; j < ids.length; j++) {
          var mi =  pending.findItem (ids [j][0]);
          if (mi !== -1) {
            indegrees [mi]--;
          }
        }
      }
    }

    /// 5) Update node list & return result
    this._list_node = sorted;
    this.is_sorted = true;
    this.is_cyclic = violationcount > 0;

    if (violationcount > 0) {
      var edgecount = Object.keys (this._edges_from).length;
      console.warn (
        "WARNING: Cycles detected during topological sort." +
        "%d dependencies out of %d have been violated.\n",
        violationcount, edgecount);
    }
    return !this.is_cyclic;
  },
  
  /**
   * Returns the index of the smallest element into an array
   *
   * @private
   * @param {Array} indegrees the Array
   * @return {integer} the index
   */
  _array_min : function (indegrees) {
    var count = indegrees.length;
    if (count === 0) return -1;
    if (count === 1) return 0;
    var min_index = 0;
    var min = indegrees [min_index];

    for (var i = 1; i < indegrees.length; i++) {
      if (indegrees [i] < min) {
        min = indegrees [i];
        min_index = i;
      }
    }
    return min_index;
  },

  build : function () {
    this._sort ();

    this._data_optimize (this._edges_from, this._list_node);
  },
  
  /**
   * @private
   */
  pausePropagation : function () {
    this.__shouldnt_propagate__ ++;
  },

  /**
   * @private
   */
  restartPropagation : function () {
    this.__shouldnt_propagate__ --;
    if (this.__shouldnt_propagate__ < 0) this.__shouldnt_propagate__ = 0;
  },

  _data_optimize : function (_ref_edges, _ref_node) {
    if (!_ref_node || !_ref_edges) { return; }
  
    var temp = [], i, j, k,
      data, data_temp,
      connections, connections_temp,
      edges, edges_temp,
      edge, edge_temp,
      cid_src, cid_trg, obj_src, obj_trg,
      property_name, descriptor, properties, properties_temp;
    
    for (i = 0; i < _ref_node.length; i++) {
      cid_src = _ref_node [i];    
      obj_src = VSObject._obs [cid_src]; if (!obj_src) { continue; }
    
      temp.push (obj_src);
    }
    this.dataflow_node = temp;
  
    temp = {};
    for (cid_src in _ref_edges) {
      obj_src = VSObject._obs [cid_src]; if (!obj_src) { continue; }

      data = _ref_edges [cid_src];
      data_temp = [];
      temp [cid_src] = data_temp;
    
      if (data) for (i = 0; i < data.length; i++) {
        connections = data [i];
        connections_temp = [3];
        
        data_temp.push (connections_temp);
        cid_trg = connections [0];
        obj_trg = VSObject._obs [cid_trg];  if (!obj_trg) { continue; }
      
        connections_temp [0] = obj_trg;
        connections_temp [1] = connections [1];
      
        edges = connections [2];
        edges_temp = [];
        connections_temp [2] = edges_temp;
      
        for (j = 0; j < edges.length; j++) {
          edge = edges [j];
          edge_temp = [4];
          edges_temp.push (edge_temp);

          edge_temp [0] = edge [0]; // id copy
          if (util.isFunction (edge [3])) {
            // function copy
            edge_temp [3] = edge [3];
          }
        
          // manage out properties
          properties = edge [1], properties_temp = [];
          for (k = 0; k < properties.length; k++) {
            property_name = properties [k];
            descriptor = obj_src.getPropertyDescriptor (property_name);
            if (!descriptor) { continue; }
            if (descriptor.get) properties_temp.push (descriptor.get);
            else {
              properties_temp.push ((function (_prop_name) {
                return function () { return this[_prop_name]; };
              }('_' + util.underscore (property_name))));
            }
          }
          edge_temp [1] = properties_temp;
      
          // manage in properties
          properties = edge [2], properties_temp = [];
          for (k = 0; k < properties.length; k++) {
            property_name = properties [k];
            descriptor = obj_trg.getPropertyDescriptor (property_name);
            if (!descriptor) { continue; }
            if (descriptor.set) {
              properties_temp.push (descriptor.set);
            }
            else {
              properties_temp.push ((function (_prop_name) {
                return function (v) { this[_prop_name] = v; };
              }('_' + util.underscore (property_name))));
            }
          }
          edge_temp [2] = properties_temp;
        }
      }
    }
    this.dataflow_edges = temp;
  }
};

/********************************************************************
                      Export
*********************************************************************/
core.DataFlow = DataFlow;
vs._default_df_ = new DataFlow ();

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


// function Scheduler ()
// {
//   this.parent = core.EventSource;
//   this.parent (createId ());
//   this.constructor = vs.core.Scheduler;
// };
//
// Scheduler.prototype = {
//
// };
//util.extendClass (Scheduler, EventSource);
//

/**
 *  The vs.core.Task class
 *
 *  <p>
 *
 * Delegates:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.Task .
 *
 * @name vs.core.Task
 *
 * @param {Object} config the configuration structure
*/
function Task (conf)
{
  this.parent = core.Object;
  this.parent (conf);
  this.constructor = Task;
};

/**
 * The task is started
 * @const
 * @name vs.core.Task.STARTED
 */
Task.STARTED = 1;

/**
 * The task is stopped
 * @const
 * @name vs.core.Task.STOPPED
 */
Task.STOPPED = 0;

/**
 * The task is paused
 * @const
 * @name vs.core.Task.PAUSED
 */
Task.PAUSED = 2;

Task.prototype = {

/********************************************************************

********************************************************************/

  /**
   * TaskDelegate.
   * Methods are called when state changes (stop | pause)
   *
   *  <p>
   *  @example
   *  var delegate = {};
   *  delegate.taskDidEnd = function () { ... }
   *
   *  // Declare a PAR task including a SEC Task
   *  var task = new Task (...)
   *  task.delegate = delegate;
   *  task.start ();
   *
   * @name vs.core.Task#delegate
   *
   * @property {object}
   */
  delegate : null,

/********************************************************************
                  States
********************************************************************/
  /**
   *	@private
   */
  _state : Task.STOPPED,

/********************************************************************

********************************************************************/

  /**
   *  Default task destructor
   *
   * @name vs.core.Task#destructor
   * @function
   */
  destructor: function ()
  {
    this.stop ();
    this._super ();
  },
  
  /**
   *  Starts the task
   *
   * @name vs.core.Task#start
   * @function
   *
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start: function (param) {},

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the TaskDelegate.taskDidStop
   *  if it declared.
   *
   * @name vs.core.Task#stop
   * @function
   */
  stop: function () {},

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the TaskDelegate.taskDidPause
   *  if it declared.
   *
   * @name vs.core.Task#pause
   * @function
   */
  pause: function () {}
};
util.extendClass (Task, core.Object);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (Task, "state", {

  /**
   *  Return the task State. <br />
   *  Possible values: {@link vs.core.Task.STARTED},
   *  {@link vs.core.Task.STOPPED},
   *  {@link vs.core.Task.PAUSED}
   *
   * @name vs.core.Task#state
   *  @type {number}
   */
  get : function ()
  {
    return this._state;
  }
});

/**
 *  The vs.core.Task_PAR class
 *
 *  @extends vs.core.Task
 *
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The Task_PAR class provides a parallel group of tasks.<br />
 *  Task_PAR is a vs.core.Task that starts all its tasks when it is started itself.
 *  <br />
 *  The Task_SEQ ended when longest lasting task has ended.
 *
 *  <p>
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *
 *  Methods borrowed from class {@link vs.core.Task}:<br />
 *  &nbsp;&nbsp;&nbsp;&nbsp;{@link vs.core.Task#pause}, {@link vs.core.Task#start},
 *  {@link vs.core.Task#stop}
 *
 *  <p>
 *  @example
 *  // Declare two tasks (animations)
 *  var rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  var scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the Task_PAR
 *  var par = Task_PAR ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  par.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  var seq = new Task_SEQ
 *    ([scale, comp0], new Task_PAR ([rotate, comp1], [rotate, comp2]));
 *  seq.delegate = this;
 *  seq.start ();
 *
 *  @author David Thevenin
 *
 *  @borrows vs.core.Task#start as Task_PAR#start
 *
 *  @constructor
 *   Creates a new vs.core.Task.
 *
 * @name vs.core.Task_PAR
 *
 * @param list List of task to start parallel with an optional
 *  parameter
*/
function Task_PAR (tasksAndParams)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = Task_PAR;

  this._tasksAndParams = [];
  this._state = Task.STOPPED;

  if (arguments.length) this.setTasks (arguments);
};

/**
 *  Methods that create a PAR group
 *
 *  <p>
 *  @example
 *
 *  // Declare the Task_PAR
 *  var group = vs.par ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 * @param list List of task to start parallel with an optional
 *  parameter
 */
vs.par = function ()
{
  if (arguments.length === 0) return;

  var task = new Task_PAR ();
  task.setTasks (arguments);

  return task;
};

Task_PAR.prototype = {

/********************************************************************

********************************************************************/
  /**
   *	@private
  */
  _tasksAndParams : null,

  /**
   * taks ended
   *	@private
  */
  _tasksWillEnded : null,

/********************************************************************

********************************************************************/

  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name vs.core.Task_PAR#setTasks
   * @function
   *
   * @param list List of task to start parallel with an optional
   *  parameter
   */
  setTasks : function (tasksAndParams)
  {
    if (this._state !== Task.STOPPED) { return false; }
    var i, taskAndparam, task, param;

    this._tasksAndParams = [];
    for (i = 0; i < tasksAndParams.length; i ++)
    {
      taskAndparam = tasksAndParams [i];
      if (!taskAndparam) { continue; }

      param = null; task = null;

      if (util.isArray (taskAndparam))
      {
        if (taskAndparam.length === 1)
        {
          task = taskAndparam [0];
        }
        else if (taskAndparam.length === 2)
        {
          task = taskAndparam [0];
          param = taskAndparam [1];
        }
      }
      else
      {
        task = taskAndparam;
        param = null;
      }

      if (!task)
      {
        console.warn ('Undefined task');
        continue;
      }

      if (!task.start || !task.stop || !task.pause)
      {
        console.warn ('Invalid task: ' + task.toString ());
        continue;
      }

      this._tasksAndParams.push ([task, param]);
    }
  },

  /**
   *  Starts the task
   *
   * @name vs.core.Task_PAR#start
   * @function
   * @ignore
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start: function (param)
  {
    if (this._state === Task.STARTED) { return false; }
    this._tasksWillEnded = this._tasksAndParams.length;
    this._state = Task.STARTED;

    var taskAndparam, i;
    for (i = 0; i < this._tasksAndParams.length; i ++)
    {
      taskAndparam = this._tasksAndParams [i];

      taskAndparam [0].delegate = this;
      taskAndparam [0].start ((taskAndparam [1])?taskAndparam [1]:param);
    }

    return true;
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @function
   * @ignore
   */
  stop: function ()
  {
    if (this._state === Task.STOPPED) { return false; }
    this._state = Task.STOPPED;

    var taskAndparam, i;
    for (i = 0; i < this._tasksAndParams.length; i ++)
    {
      taskAndparam = this._tasksAndParams [i];
      taskAndparam [0].stop ();
    }

    return true;
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the taskDidPause if it exits.
   *  @ignore
   * @function
   */
  pause: function ()
  {
    if (this._state === Task.PAUSED) { return false; }
    this._state = Task.PAUSED;

    var taskAndparam, i;
    for (i = 0; i < this._tasksAndParams.length; i ++)
    {
      taskAndparam = this._tasksAndParams [i];
      taskAndparam [0].pause ();
    }

    return true;
  },

/********************************************************************
               delegate methodes
********************************************************************/

  /**
   * @protected
   * @function
   */
  taskDidStop : function (task)
  {
    this._state = Task.STOPPED;

    this._tasksWillEnded --;
    if (this._tasksWillEnded === 0)
    {
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  },

  /**
   * @protected
   * @function
   */
  taskDidPause : function (task)
  {
    this._state = Task.STOPPED;

    this._tasksWillEnded --;
    if (this._tasksWillEnded === 0)
    {
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  },

  /**
   * @protected
   * @function
   */
  taskDidEnd : function (task)
  {
    this._state = Task.STOPPED;

    this._tasksWillEnded --;
    if (this._tasksWillEnded === 0)
    {
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  }
};
util.extendClass (Task_PAR, Task);

/**
 *  The Task_SEQ class
 *
 *  @extends vs.core.Task
 *
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The Task_SEQ class provides a sequential group of tasks.<br />
 *  Task_SEQ is a vs.core.Task that runs its tasks in sequence, i.e., it starts
 *  one task after another has ended. <br />
 *  The tasks are started in the order they are defined within the constructor.
 *  <br />
 *  The Task_SEQ finishes when its last tasks has ended.
 *
 *  <p>
 *
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *
 *  Methods borrowed from class {@link vs.core.Task}:<br />
 *  &nbsp;&nbsp;&nbsp;&nbsp;{@link vs.core.Task#pause}, {@link vs.core.Task#start},
 *  {@link vs.core.Task#stop}
 *
 *  @example
 *  // Declare two tasks (animations)
 *  var rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  var scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the Task_SEQ
 *  var seq = Task_SEQ ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations sequentially
 *  seq.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  var seq = new Task_SEQ
 *    ([scale, comp0], new Task_PAR ([rotate, comp1], [rotate, comp2]));
 *  seq.delegate = this;
 *  seq.start ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.Task_SEQ.
 *
 * @name vs.core.Task_SEQ
 *
 * @param list List of task to start sequentially with an optional
 *  parameter
 */
function Task_SEQ (tasksAndParams)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = Task_SEQ;

  this._tasksAndParams = [];
  this._state = Task.STOPPED;

  if (arguments.length) this.setTasks (arguments);
};

/**
 *  Methods that create a SEQ group
 *
 *  <p>
 *  @example
 *
 *  // Declare the Task_PAR
 *  var group = vs.seq ([scale, comp0], [rotate, comp0]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 * @param list List of task to start sequentially with an optional
 *  parameter
 */
vs.seq = function ()
{
  if (arguments.length === 0) return;

  var task = new Task_SEQ ();
  task.setTasks (arguments);

  return task;
};

Task_SEQ.prototype = {

/********************************************************************

********************************************************************/
  /**
   *	@private
  */
  _tasksAndParams : null,

  /**
   *	@private
  */
  _nextTaskToStart : 0,

  /**
   *	@private
  */
  _startParam : null,

/********************************************************************

********************************************************************/

  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name vs.core.Task_SEQ#setTasks
   * @function
   *
   * @param list List of task to start parallel with an optional
   *  parameter
   */
  setTasks : function (tasksAndParams)
  {
    if (this._state !== Task.STOPPED) { return false; }
    var i, taskAndparam, task, param;

    this._tasksAndParams = [];
    for (i = 0; i < tasksAndParams.length; i ++)
    {
      taskAndparam = tasksAndParams [i];
      if (!taskAndparam) { continue; }

      param = null; task = null;

      if (util.isArray (taskAndparam))
      {
        if (taskAndparam.length === 1)
        {
          task = taskAndparam [0];
        }
        else if (taskAndparam.length === 2)
        {
          task = taskAndparam [0];
          param = taskAndparam [1];
        }
      }
      else
      {
        task = taskAndparam;
        param = null;
      }

      if (!task)
      {
        console.warn ('Undefined task');
        continue;
      }

      if (!task.start || !task.stop || !task.pause)
      {
        console.warn ('Invalid task: ' + task.toString ());
        continue;
      }

      this._tasksAndParams.push ([task, param]);
    }
  },

  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start: function (param)
  {
    if (this._state === Task.STARTED) { return false; }
    this._state = Task.STARTED;

    this._startParam = param;

    var taskAndparam = this._tasksAndParams [this._nextTaskToStart];
    if (!taskAndparam) { return false; }

    this._nextTaskToStart++;
    taskAndparam [0].delegate = this;
    taskAndparam [0].start ((taskAndparam [1])?taskAndparam [1]:param);

    return true;
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop: function ()
  {
    if (this._state === Task.STOPPED) { return false; }
    this._state = Task.STOPPED;

    var taskAndparam = this._tasksAndParams [this._nextTaskToStart - 1];
    if (!taskAndparam) { return false; }

    this._nextTaskToStart = 0;
    taskAndparam [0].stop ();

    return true;
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause: function ()
  {
    if (this._state === Task.PAUSED) { return false; }
    this._state = Task.PAUSED;

    var taskAndparam = this._tasksAndParams [this._nextTaskToStart - 1];
    if (!taskAndparam) { return false; }

    taskAndparam [0].pause ();

    return true;
  },

/********************************************************************
               delegate methodes
********************************************************************/

  /**
   * @protected
   * @function
   */
  taskDidStop : function (task)
  {
    this._state = Task.STOPPED;

    if (this._nextTaskToStart === 0)
    { this._nextTaskToStart = this._nextTaskToStart - 1; }

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }
  },

  /**
   * @protected
   * @function
   */
  taskDidPause : function (task)
  {
    this._state = Task.PAUSED;

    this._nextTaskToStart = this._nextTaskToStart - 1;

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }
  },

  /**
   * @protected
   * @function
   */
  taskDidEnd : function (task)
  {
    this._state = Task.STOPPED;

    if (this._nextTaskToStart < this._tasksAndParams.length)
    {
      // start the next task
      this.start (this._startParam);
    }
    else
    {
      this._nextTaskToStart = 0;
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  }
};
util.extendClass (Task_SEQ, Task);

/**
 *  The vs.core.TaskWait class
 *
 *  @extends vs.core.Task
 *
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The vs.core.TaskWait class provides ...
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.TaskWait.
 *
 * @name vs.core.TaskWait
 *
 * @param time The time to wait, using millisecond
 *  parameter
 */
function TaskWait (time)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = TaskWait;
  this._state = Task.STOPPED;

  this.time = time;
};

TaskWait.prototype = {

/********************************************************************

********************************************************************/
  /**
   *	@private
  */
  _time : 0,
  _left_time : 0,

  /**
   *	@private
   */
  _timer : null,

  /**
   *	@private
   */
  _start_time : 0,

/********************************************************************

********************************************************************/

  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start: function ()
  {
    var self = this, time = this._time;
    if (this._state === Task.STARTED) { return false; }
    if (this._state === Task.PAUSED)
    { time = this._left_time; }
    else
    { this._left_time = time; }

    this._state = Task.STARTED;

    this._start_time = new Date ().getTime ();
    var self = this;
    this._timer = setTimeout (function ()
    {
      self._state = Task.STOPPED;
      if (self.delegate && self.delegate.taskDidEnd)
      { self.delegate.taskDidEnd (self); }
    }, time);

    return true;
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop: function ()
  {
    if (this._state === Task.STOPPED) { return false; }
    this._state = Task.STOPPED;

    clearTimeout (this._timer);
    this._timer = null;

    this._left_time = this._time;

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }

    return true;
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause: function ()
  {
    if (this._state === Task.PAUSED) { return false; }
    this._state = Task.PAUSED;

    this._left_time =
      this._left_time - new Date ().getTime () + this._start_time;

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }

    return true;
  }
};
util.extendClass (TaskWait, Task);

util.defineClassProperty (TaskWait, "state", {

  /**
   * Set the task time, using millisecond. <br />
   * @name vs.core.TaskWait#time
   * @type {number}
   */
  set : function (v)
  {
    if (!util.isNumber (v)) { return; }
    this._time = v;
  }
});

/********************************************************************
                      Export
*********************************************************************/
util.extend (core, {
  Task:        Task,
  Task_PAR:    Task_PAR,
  Task_SEQ:    Task_SEQ,
  TaskWait:    TaskWait
});

/*
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

/**
 * This represents the mobile device, and provides properties for inspecting
 * the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
 
/**
 *  @class An vs.core.DeviceConfiguration object describes the device's hardware
 *  and software.
 *  <br /><br />
 *  A global object is visible in the window global scope: 
 *  window.deviceConfiguration.
 *
 *  
 *  @example
 *  var conf = window.deviceConfiguration;
 *  console.log ("OS: " + conf.os);
 *  console.log ("Screen size: " + conf.screenResolution);
 *  console.log ("Screen ratio: " + conf.screenRatio);
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 *  @name vs.core.DeviceConfiguration
 */
function DeviceConfiguration ()
{
  this.orientation = null;
  this.deviceId = null;
//  this.targets = {};
  
  this.browserDetect ();
  this.orientationDetect ();
  this.screenDetect ();
}

/**
 * @name vs.core.DeviceConfiguration.OS_UNKNOWN 
 * @const
 */
DeviceConfiguration.OS_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.OS_WINDOWS 
 * @const
 */
DeviceConfiguration.OS_WINDOWS = 1;

/**
 * @name vs.core.DeviceConfiguration.OS_MACOS 
 * @const
 */
DeviceConfiguration.OS_MACOS = 2;

/**
 * @name vs.core.DeviceConfiguration.OS_LINUX 
 * @const
 */
DeviceConfiguration.OS_LINUX = 4;

/**
 * @name vs.core.DeviceConfiguration.OS_IOS 
 * @const
 */
DeviceConfiguration.OS_IOS = 5;

/**
 * @name vs.core.DeviceConfiguration.OS_WP7 
 * @const
 */
DeviceConfiguration.OS_WP7 = 6;

/**
 * @name vs.core.DeviceConfiguration.OS_BLACK_BERRY 
 * @const
 */
DeviceConfiguration.OS_BLACK_BERRY = 7;

/**
 * @name vs.core.DeviceConfiguration.OS_SYMBIAN 
 * @const
 */
DeviceConfiguration.OS_SYMBIAN = 8;

/**
 * @name vs.core.DeviceConfiguration.OS_ANDROID 
 * @const
 */
DeviceConfiguration.OS_ANDROID = 9;

/**
 * @name vs.core.DeviceConfiguration.OS_MEEGO 
 * @const
 */
DeviceConfiguration.OS_MEEGO = 10;

/**
 * @name vs.core.DeviceConfiguration.SR_UNKNOWN 
 * @const
 */
DeviceConfiguration.SR_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.SR_QVGA 
 * @const
 * QVGA (320×240) 
 */
DeviceConfiguration.SR_QVGA = 1;

/**
 * @name vs.core.DeviceConfiguration.SR_WQVGA 
 * @const
 * QVGA (400×240) 
 */
DeviceConfiguration.SR_WQVGA = 2;

/**
 * @name vs.core.DeviceConfiguration.SR_HVGA 
 * @const
 * HVGA (480×320) 
 */
DeviceConfiguration.SR_HVGA = 4;

/**
 * @name vs.core.DeviceConfiguration.SR_VGA 
 * @const
 * VGA (640×480) 
 */
DeviceConfiguration.SR_VGA = 5;

/**
 * @name vs.core.DeviceConfiguration.SR_WVGA 
 * @const
 * WVGA (800×480) 
 */
DeviceConfiguration.SR_WVGA = 6;

/**
 * @name vs.core.DeviceConfiguration.SR_FWVGA 
 * @const
 * FWVGA (854×480) 
 */
DeviceConfiguration.SR_FWVGA = 7;

/**
 * @name vs.core.DeviceConfiguration.SR_SVGA 
 * @const
 * SVGA (800×600)
 */
DeviceConfiguration.SR_SVGA = 8;

/**
 * @name vs.core.DeviceConfiguration.SR_DVGA 
 * @const
 * DVGA (960×640) 
 */
DeviceConfiguration.SR_DVGA = 9;

/**
 * @name vs.core.DeviceConfiguration.SR_WDVGA 
 * @const
 * WDVGA (1136×640) 
 */
DeviceConfiguration.SR_WDVGA = 10;

/**
 * @name vs.core.DeviceConfiguration.SR_XGA 
 * @const
 * XGA (1024×768)
 */
DeviceConfiguration.SR_XGA = 11;

/**
 * @name vs.core.DeviceConfiguration.SR_N_HD 
 * @const
 * nHD (640×360)
 */
DeviceConfiguration.SR_N_HD = 12;

/**
 * @name vs.core.DeviceConfiguration.SR_Q_HD 
 * @const
 * qHD (960×540)
 */
DeviceConfiguration.SR_Q_HD = 13;

/**
 * @name vs.core.DeviceConfiguration.SR_WXGA 
 * @const
 * WXGA (1280×720/768/800)
 */
DeviceConfiguration.SR_WXGA = 14;

/**
 * @name vs.core.DeviceConfiguration.SR_QXGA 
 * @const
 * QXGA (2048x1536)
 */
DeviceConfiguration.SR_QXGA = 15;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_UNKNOWN 
 * @const
 */
DeviceConfiguration.BROWSER_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_CHROME
 * @const
 */
DeviceConfiguration.BROWSER_CHROME = 1;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_SAFARI 
 * @const
 */
DeviceConfiguration.BROWSER_SAFARI = 2;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_OPERA 
 * @const
 */
DeviceConfiguration.BROWSER_OPERA = 3;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_FIREFOX 
 * @const
 */
DeviceConfiguration.BROWSER_FIREFOX = 4;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_MSIE 
 * @const
 */
DeviceConfiguration.BROWSER_MSIE = 5;

/**
 * @name vs.core.DeviceConfiguration.SCREEN_SIZE_UNKNOWN 
 * @const
 */
DeviceConfiguration.SS_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.SCREEN_4_INCH 
 * @const
 */
DeviceConfiguration.SS_4_INCH = 1;

/**
 * @name vs.core.DeviceConfiguration.SCREEN_7_INCH 
 * @const
 */
DeviceConfiguration.SS_7_INCH = 2;

/**
 * @name vs.core.DeviceConfiguration.SCREEN_10_INCH 
 * @const
 */
DeviceConfiguration.SS_10_INCH = 3;


DeviceConfiguration.prototype = {
  
  /** 
   * Get the device's operating system name.
   * @name vs.core.DeviceConfiguration#os 
   * @type {number}
   */
  os : DeviceConfiguration.OS_UNKNOWN,

  /** 
   * Get the browser name.
   * @name vs.core.DeviceConfiguration#browser 
   * @type {number}
   */
  browser : DeviceConfiguration.BROWSER_UNKNOWN,

  /** 
   * Get the device's screen resolution type.
   * @name vs.core.DeviceConfiguration#screenResolution 
   * @type {number}
   */
  screenResolution : DeviceConfiguration.SR_UNKNOWN,

  /** 
   * Get the device's screen ratio.
   * @name vs.core.DeviceConfiguration#screenRatio 
   * @type {number}
   */
  screenRatio : 0,

  /** 
   * Get the device's class type (4, 7, 10 inches)
   * @name vs.core.DeviceConfiguration#screenSize 
   * @type {number}
   */
  screenSize : DeviceConfiguration.SS_UNKNOWN,
  
  virtualScreenSize : null,

  /**
   * @protected
   * @function
   */
  browserDetect : function ()
  {
    function searchString (data)
    {
      var i = data.length;
      while (i--)
      {
        var dataString = data [i].string;
        var dataProp = data [i].prop;
//        this.versionSearchString = data[i].versionSearch || data[i].identity;
        if (dataString)
        {
          if (dataString.match (data[i].subString))
          { return data[i].identity; }
        }
        else if (dataProp) { return data[i].identity; }
      }
    }

    this.browser = searchString (DeviceConfiguration._data_browser) ||   
      DeviceConfiguration.BROWSER_UNKNOWN;

    this.os = searchString (DeviceConfiguration._data_OS) ||
      DeviceConfiguration.OS_UNKNOWN;
  },
  
  /**
   * @protected
   * @function
   */
  orientationDetect : function ()
  {
    if (window.orientation) this.orientation = window.orientation;
    else if (window.outerWidth > window.outerHeight) this.orientation = 90;
    else this.orientation = 0;
  },
  
  _getScreenSize : function () {
    if (window.device && window.device.width) {
      return [window.device.width, window.device.height]
    }
    else if (this.os >= DeviceConfiguration.OS_IOS &&
        this.os <= DeviceConfiguration.OS_MEEGO) {
      // MOBILE DEVICES
      return [window.screen.width, window.screen.height];
    }
    else {
      // DESKTOP
      return [window.outerWidth, window.outerHeight];
    }
  },
  
  /**
   * @protected
   * @function
   */
  screenDetect : function ()
  {
    var pixelRatio = window.devicePixelRatio, screenSize;
    if (!pixelRatio) pixelRatio = 1;
    
    screenSize = this._getScreenSize ();

    if (screenSize[0] > screenSize[1])
    {
      var temp = screenSize[0]
      screenSize[0] = screenSize[1];
      screenSize[1] = temp;
    }
    
    this.screenResolution =
        DeviceConfiguration._getScreenResolutionCode (
          screenSize[0], screenSize[1]);

    this.screenRatio = screenSize[1] / screenSize[0];
    
    var dpi = 160 * pixelRatio;
    if (window.device && window.device.dpi) dpi = device.dpi;
 
    var size = Math.sqrt (
      screenSize[0] * screenSize[0] + screenSize[1] * screenSize[1]) / 
      dpi;
      
    if (size < 6) this.screenSize = DeviceConfiguration.SS_4_INCH;
    else if (size < 9) this.screenSize = DeviceConfiguration.SS_7_INCH;
    else if (size < 11) this.screenSize = DeviceConfiguration.SS_10_INCH;
  },
  
  /**
   * Returns the current GUI orientation.
   * <p/>
   * Be careful this API does not return the device orientation, which can be
   * deferent from the GUI orientation.
   * <p/>
   * Use the orientation module to have access to the device orientation.
   *
   * @name vs.core.DeviceConfiguration#getOrientation 
   * @function
   * 
   * @return {integer} returns a integer include in [-90, 0, 90, 180];
   * @public
   */
  getOrientation : function ()
  {
    return this.orientation;
  },
  
  /**
   * @protected
   * @function
   */
  setDeviceId : function (did)
  {
    //var screenSize;
    
    if (!util.isString (did)) return; 
    
    this.screenResolution = DeviceConfiguration.SR_UNKNOWN;
   
    this.deviceId = did;
    // screenSize = this._getScreenSize ();  
    // if (screenSize[0] > screenSize[1])
    // {
    //   var temp = screenSize[0]
    //   screenSize[0] = screenSize[1];
    //   screenSize[1] = temp;
    // }
    
    if (did.indexOf ("wp7") != -1)
    {
      this.os = DeviceConfiguration.OS_WP7;
      this.screenResolution = DeviceConfiguration.SR_WVGA;
      this.screenRatio = 16/10;
      this.screenSize = DeviceConfiguration.SS_4_INCH;
    }
    else if (did.indexOf ("iphone") != -1)
    {
      this.os = DeviceConfiguration.OS_IOS;
      this.screenResolution = DeviceConfiguration.SR_HVGA;
      if (did.indexOf ("_3_2") != -1) { this.screenRatio = 3/2; }
      else if (did.indexOf ("_16_9") != -1) { this.screenRatio = 16/9; }
      this.screenSize = DeviceConfiguration.SS_4_INCH;
    }
    else if (did.indexOf ("ipad") != -1)
    {
      this.os = DeviceConfiguration.OS_IOS;
      this.screenResolution = DeviceConfiguration.SR_XGA;
      this.screenRatio = 4/3;
      this.screenSize = DeviceConfiguration.SS_10_INCH;
    }
    // else if (did.indexOf ("nokia_s3") != -1)
    // {
    //   this.os = DeviceConfiguration.OS_SYMBIAN;
    //   this.screenResolution = DeviceConfiguration.SR_N_HD;
    //   this.screenRatio = 4/3;
    //   this.screenSize = DeviceConfiguration.SS_4_INCH;
    // }
    else if (did.indexOf ("android") != -1)
    {
      this.os = DeviceConfiguration.OS_ANDROID;
      if (did.indexOf ("_3_2") != -1) { this.screenRatio = 3/2; }
      else if (did.indexOf ("_16_10") != -1) { this.screenRatio = 16/10; }
      else if (did.indexOf ("_16_9") != -1) { this.screenRatio = 16/9; }
      
      if (did.indexOf ("android_4") != -1) { this.screenSize = DeviceConfiguration.SS_4_INCH; }
      else if (did.indexOf ("android_7") != -1) { this.screenSize = DeviceConfiguration.SS_7_INCH; }
      else if (did.indexOf ("android_10") != -1) { this.screenSize = DeviceConfiguration.SS_10_INCH; }

      // this.screenResolution =
      //   DeviceConfiguration._getScreenResolutionCode (
      //     screenSize[0], screenSize[1]);
    }
    // else if (did.indexOf ("blackberry") != -1)
    // {
    //   this.os = DeviceConfiguration.OS_BLACK_BERRY;
    //   if (did.indexOf("_4_3")) { this.screenRatio = 4/3; }
    //   else if (did.indexOf("_3_2")) { this.screenRatio = 3/2; }
    //   else if (did.indexOf("_16_10")) { this.screenRatio = 16/10; }
            
    //   this.screenResolution =
    //     DeviceConfiguration._getScreenResolutionCode (
    //       screenSize[0], screenSize[1]);
    // }
  },
  
  generateDeviceId : function (force)
  {
    if (force && this.deviceId) return this.deviceId;
    
    this.orientationDetect ();
    this.screenDetect ();
    var did = "";

    switch (this.os) {
      case DeviceConfiguration.OS_IOS:
        screenSize = this._getScreenSize ();
        if (screenSize[0] === 320 || screenSize[0] === 480) did += "iphone";
        if (screenSize[0] === 640 || screenSize[0] === 960) did += "iphone";
        if (screenSize[0] === 768 || screenSize[0] === 1024) did += "ipad";
        if (screenSize[0] === 1536 || screenSize[0] === 2048) did += "ipad";
      break;
 
      case DeviceConfiguration.OS_ANDROID:
        did += "android"
      break;
 
      case DeviceConfiguration.OS_WP7:
        did += "wp7"
      break;
 
      case DeviceConfiguration.OS_BLACK_BERRY:
        did += "blackberry"
      break;
    }    

    switch (this.screenSize) {
      case DeviceConfiguration.SS_4_INCH:
        did += "_3"
      break;
 
      case DeviceConfiguration.SS_7_INCH:
        did += "_7"
      break;
 
      case DeviceConfiguration.SS_10_INCH:
        did += "_10"
      break;
    }    

    if (Math.abs (window.deviceConfiguration.screenRatio - 3/2) < 0.1) 
      did += "_3_2";
    else if (Math.abs (window.deviceConfiguration.screenRatio - 4/3) < 0.1) 
      did += "_4_3";
    else if (Math.abs (window.deviceConfiguration.screenRatio - 16/10) < 0.1) 
      did += "_16_10";
    else if (Math.abs (window.deviceConfiguration.screenRatio - 16/9) < 0.1) 
      did += "_16_9";
      
    switch (this.orientation) {
      case 90:
      case -90:
        did += "_l"
      break;

      case 0:
      case 180:
        did += "_p"
      break;
    }
    
    return did;
  },

  /**
   * Set the GUI orientation
   *
   * @name vs.ui.Application#setOrientation 
   * @function
   * @protected
   * @param {number} orientation number include in {0, 180, -90, 90}
   */
  setOrientation : function (orientation, force)
  {
    var tmp_device_id, target_id, device, i, len, id, comp, 
      width = window.innerWidth, height = window.innerHeight, t;
        
    if (width > height)
    {
      t = height;
      height = width;
      width = t;
    }
  
    for (id in core.Object._obs)
    {
      comp = core.Object._obs [id];
      if (!comp) { continue; }
      
      if (comp._orientationWillChange)
      { comp._orientationWillChange (orientation); }
      if (comp.orientationWillChange)
      { comp.orientationWillChange (orientation); }
    }
    
    if (this.targetId) {
      target_id = this.targetId.replace ('_p', '');
      target_id = target_id.replace ('_l', '');
      
      if (orientation === 0 || orientation === 180) target_id += '_p';
      else target_id += '_l';
      
      this.targetId = target_id;
      this.setActiveStyleSheet (this.targetId);
    }
    this.orientation = orientation;

    if (this.virtualScreenSize && cordova && cordova.exec) {
      cordova.exec (
        null, null,
        "VSD_Application", "setAppSize",
        [{width: this.virtualScreenSize[0], height: this.virtualScreenSize[1]}]
      );
    }

    /**
     * @private
     */
    var orientationDidChangeFct = function ()
    {
      var id, comp;
      for (id in core.Object._obs)
      {
        comp = core.Object._obs [id];
        if (!comp || !comp.orientationDidChange) { continue; }
      
        comp.orientationDidChange (orientation);
      }
    }
    if (!force)
    {
      setTimeout (orientationDidChangeFct, 100);
    }
    else
    {
      orientationDidChangeFct.call (this);
    }
  },
    
  /**
   * @protected
   * @function
   */
  setActiveStyleSheet : function (pid)
  {
    util.setActiveStyleSheet (pid);
  },
    
  /**
   * @protected
   * @function
   */
  registerTargetId : function (tid, conf)
  {
//    this.targets [tid] = conf;
  }
};

/**
 * @private
 */
DeviceConfiguration._getScreenResolutionCode = function (width, height)
{
  width *= window.devicePixelRatio;
  height *= window.devicePixelRatio;
  if (width === 240 && height === 320) return DeviceConfiguration.SR_QVGA;
  if (width === 240 && height === 400) return DeviceConfiguration.SR_WQVGA;
  if (width === 320 && height === 480) return DeviceConfiguration.SR_HVGA;
  if (width === 480 && height === 640) return DeviceConfiguration.SR_VGA;
  if (width === 480 && height === 800) return DeviceConfiguration.SR_WVGA;
  if (width === 320 && height === 854) return DeviceConfiguration.SR_WFVGA;
  if (width === 600 && height === 800) return DeviceConfiguration.SR_SVGA;
  if (width === 640 && height === 960) return DeviceConfiguration.SR_DVGA;
  if (width === 640 && height === 1136) return DeviceConfiguration.SR_WDVGA
  if (width === 768 && height === 1024) return DeviceConfiguration.SR_XGA;
  if (width === 360 && height === 640) return DeviceConfiguration.SR_N_HD;
  if (width === 540 && height === 960) return DeviceConfiguration.SR_Q_HD;
  if (width === 720 && height === 1280) return DeviceConfiguration.SR_WXGA;
  if (width === 768 && height === 1280) return DeviceConfiguration.SR_WXGA;
  if (width === 800 && height === 1280) return DeviceConfiguration.SR_WXGA;
  if (width === 1536 && height === 2048) return DeviceConfiguration.SR_QXGA;
}

/**
 * @private
 */
DeviceConfiguration._estimateScreenSize = function (metric)
{
  var w = metric.width / metric.xdpi;
  var h = metric.height / metric.ydpi;
  var size = Math.sqrt (w*w + h*h);
  
  if (size < 5) return 3;
  if (size < 8) return 7;
  else return 10;
};

if (typeof navigator != "undefined")
{
/**
 * @private
 * @const
 */
DeviceConfiguration._data_browser = [
  {
    string: navigator.userAgent,
    subString: "Chrome",
    identity: DeviceConfiguration.BROWSER_CHROME
  },
  {
    string: navigator.vendor,
    subString: "Apple",
    identity: DeviceConfiguration.BROWSER_SAFARI,
    versionSearch: "Version"
  },
  {
    prop: window.opera,
    identity: DeviceConfiguration.BROWSER_OPERA,
    versionSearch: "Version"
  },
  {
    string: navigator.userAgent,
    subString: "Firefox",
    identity: DeviceConfiguration.BROWSER_FIREFOX
  },
  {
    string: navigator.userAgent,
    subString: "MSIE",
    identity: DeviceConfiguration.BROWSER_MSIE,
    versionSearch: "MSIE"
  }
];
}
else DeviceConfiguration._data_browser = [];

if (typeof navigator != "undefined")
{
/**
 * @private
 * @const
 */
DeviceConfiguration._data_OS = [
  {
    string: navigator.platform,
    subString: "Win",
    identity: DeviceConfiguration.OS_WINDOWS
  },
  {
    string: navigator.platform,
    subString: "Mac",
    identity: DeviceConfiguration.OS_MACOS
  },
  {
    string: navigator.platform,
    subString: "Linux",
    identity: DeviceConfiguration.OS_LINUX
  },
  {
     string: navigator.userAgent,
     subString: "iPad|iPhone|iPod",
     identity: DeviceConfiguration.OS_IOS
  },
  {
     string: navigator.userAgent,
     subString: "Android",
     identity: DeviceConfiguration.OS_ANDROID
  }
];
}
else DeviceConfiguration._data_OS = [];

if (typeof window != 'undefined' && !window.deviceConfiguration)
{
/**
 * @name deviceConfiguration 
 * @type vs.core.DeviceConfiguration
 */
  window.deviceConfiguration = new DeviceConfiguration ();
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.DeviceConfiguration = DeviceConfiguration;
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


/**
 *  The HTTPRequest class
 *
 * @extends vs.core.EventSource
 * @name vs.core.HTTPRequest
 * @events textload, xmlload, loaderror
 * @class
 * It provides scripted client functionality for transferring data between
 * a client and a server.
 *
 *  @constructor
 *   Creates a new HTTPRequest.
 *
 *  <br />
 *  Events:
 *  <ul>textload
 *    <li/> xmlload: data [xml doc]; propagate when data are loaded
 *    <li/> textload: data [text]: propagate when data are loaded
 *    <li/> loaderror: data [error information]: propagate when an error occured
 *  </ul>
 *  <br />
 * @example
 *  var xhr = new vs.core.HTTPRequest ({url: "http..."});
 *  xhr.init ();
 *  xhr.bind ('xmlload', this, this.processRSS);
 *  xhr.send ();
 *
 * @param {Object} config the configuration structure
 */
HTTPRequest = function (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = HTTPRequest;

  this._headers = {};
};

HTTPRequest.prototype = {

 /*********************************************************
 *                  private data
 *********************************************************/

  /**
   *
   * @protected
   * @type {string}
   */
  _url: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _method: 'GET',

  /**
   *
   * @protected
   * @type {string}
   */
  _login: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _password: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _content_type: '',

  /**
   *
   * @protected
   * @type {Object}
   */
  _headers: null,

 /*********************************************************
 *                   management
 *********************************************************/

  /**
   *
   * @name vs.core.HTTPRequest#setHeaders
   * @function
   * An object of additional header key/value pairs to send along with the
   * request.
   *
   * @param {Object} obj A <key/string> object
   */
  setHeaders : function (obj)
  {
    if (!obj) return;

    for (var key in obj)
    {
      this._headers [key] = obj [key];
    }
  },

  /**
   *
   * @name vs.core.HTTPRequest#send
   * @function
   *
   * @param {String} data The data to send [optional]
   */
  send : function (data)
  {
    var xhr = new XMLHttpRequest ();

    try
    {
      this._response_text = null;
      this._response_xml = null;

      //prepare the xmlhttprequest object
      xhr.open (this._method, this._url, true, this._login || null, this._password || null);

      xhr.setRequestHeader ("Cache-Control", "no-cache");
      xhr.setRequestHeader ("Pragma", "no-cache");

      for (var key in this._headers)
      {
        xhr.setRequestHeader (key, this._headers [key]);
      }
      this._headers = {};

      if (this._content_type)
      { xhr.setRequestHeader('Content-Type', this._content_type); }

      var self = this;
      xhr.onabort = function (e)
      {
        xhr.onload = xhr.onerror = xhr.onabort = null;
        delete (xhr);
        self.propagate ('loaderror', {'status': 'aborted'});
      }
      xhr.onerror = function (e)
      {
        xhr.onload = xhr.onerror = xhr.onabort = null;
        delete (xhr);
        self.propagate ('loaderror', {'status': 'failed', 'response':e});
      }
      xhr.onload = function ()
      {
        xhr.onload = xhr.onerror = xhr.onabort = null;
        
        function endWithError (message) {
          self.propagate ('loaderror', message);
          delete (xhr);
          return false;
        }
        
        // manage possible errors
        if (xhr.readyState !== 4) return endWithError (xkr.statusText); 
        
        else if (xhr.status === 200)
        {
          self._response_text = xhr.responseText;
          self._response_xml = xhr.responseXML;

          self.propagateChange ();

          self.propagate ('textload', self._response_text);
          if (self._response_xml)
            self.propagate ('xmlload', self._response_xml);
          delete (xhr);
          return true;
        }
        
        else
        {
          return endWithError ({
            'status': xhr.statusText,
            'response':xhr.response
          });
        }
      }

      //send the request
      xhr.send (data);
    }
    catch (e)
    {
      xhr.onload = xhr.onerror = xhr.onabort = null;
      delete (xhr);
      this.propagate ('loaderror', e);
      return;
    }
  }
};
util.extendClass (HTTPRequest, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (HTTPRequest, {
  "url": {
    /**
     * Setter for the url
     * @name vs.core.HTTPRequest#url
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._url = v;
    }
  },

  'method': {
    /**
     * Set request method (GET | POST)
     * @name vs.core.HTTPRequest#method
     * @type String
     */
    set : function (v)
    {
      if (v != 'GET' && v != 'POST') { return; }

      this._method = v;
    }
  },

  'login': {
    /**
     * Set request login
     * @name vs.core.HTTPRequest#login
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._login = v;
    }
  },

  'password': {
    /**
     * Set request password
     * @name vs.core.HTTPRequest#password
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._password = v;
    }
  },

  'contentType': {
    /**
     * Set request content type
     * @name vs.core.HTTPRequest#contentType
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._content_type = v;
    }
  },

  'responseText': {
    /**
     * Return request result as Text
     * @name vs.core.HTTPRequest#responseText
     * @type String
     */
    get : function ()
    {
      return this._response_text;
    }
  },

  'responseXML': {
    /**
     * Return request result as XML document
     * @name vs.core.HTTPRequest#responseXML
     * @type Document
     */
    get : function ()
    {
      return this._response_xml;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.HTTPRequest = HTTPRequest;
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


/**
 *  The AjaxJSONP class
 *
 * @extends vs.core.EventSource
 * @name vs.core.AjaxJSONP
 * @events jsonload, loaderror
 * @class
 * It performs a JSONP request to fetch data from another domain.
 *
 *  @constructor
 *   Creates a new AjaxJSONP.
 *
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> jsonload: data [Object]: propagate when data are loaded
 *    <li/> loaderror: data [error information]: propagate when an error occured
 *  </ul>
 *  <p>
 * @example
 *  var xhr = new vs.core.AjaxJSONP ({url: "http..."}).init ();
 *  xhr.bind ('jsonload', this, this.processRSS);
 *  xhr.send ();
 *
 * @param {Object} config the configuration structure
 */
var AjaxJSONP = core.createClass ({

  parent: core.EventSource,

  /*********************************************************
  *                  private data
  *********************************************************/

  /**
   *
   * @protected
   * @type {string}
   */
  _url: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _clb_param_name: 'callback',

  /**
   *
   * @private
   * @type {number}
   */
  __index: 0,

  /*********************************************************
  *                  Properties
  *********************************************************/

  properties : {
    "url": {
      /**
       * Setter for the url
       * @name vs.core.AjaxJSONP#url
       * @type String
       */
      set : function (v)
      {
        if (!util.isString (v)) { return; }

        this._url = v;
      }
    },
    "clbParamName": {
      /**
       * Setter for the name of the callback parameter in jsonp payload
       * By default the value is 'callback'
       * @name vs.core.AjaxJSONP#clbParamName
       * @type String
       */
      set : function (v)
      {
        if (!util.isString (v)) { return; }

        this._clb_param_name = v;
      }
    },

    'responseJson': {
      /**
       * Return request result as Javascript Object
       * @name vs.core.AjaxJSONP#responseJson
       * @type Document
       */
      get : function ()
      {
        return this._response_json;
      }
    }
  },

 /*********************************************************
 *                   management
 *********************************************************/

  /**
   *
   * @name vs.core.AjaxJSONP#send
   * @function
   */
  send : function ()
  {
    var
      self = this,
      callbackName = 'jsonp' + self._id + (self.__index++),
      urlCallback = this._clb_param_name + "=" + callbackName,
      script_src = self._url, lastIndex = script_src.length - 1;

    if (script_src [lastIndex] === '?')
      script_src += urlCallback;
    else if (script_src.indexOf ('?') !== "-1")
      script_src += "&" + urlCallback;
    else if (script_src [lastIndex] === '/')
      script_src = script_src.substr (0, lastIndex) + "?" + urlCallback;
    else
      script_src += "?" + urlCallback;

    var
      script = util.importFile (script_src, null, null, 'js'),
      removeScript = function ()
      {
        if (script)
        {
          script.parentElement.removeChild (script);
          script = undefined;
        }
      },
      abortTimeout = setTimeout (function ()
      {
        removeScript ();
        if (callbackName in window) delete (window [callbackName]);
        self.propagate ('loaderror', 'Impossible to load data');
      }, 3000);

    window [callbackName] = function (data)
    {
      clearTimeout (abortTimeout)
      removeScript ();
      delete window[callbackName];

      if (!data) return;
      if (data.error)
      {
        self.propagate ('loaderror', data.error);
        return;
      }
      self._response_json = data;
      self.outPropertyChange ();
      self.propagate ('jsonload', data);
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.AjaxJSONP = AjaxJSONP;
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

 Use code from Canto.js Copyright 2010 Steven Levithan <stevenlevithan.com>
*/

/**
 *  @class
 *  vs.core.Array is an Array of Object or Model.
 *
 * @extends vs.core.Model
 * @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.Array
 *
 * @param {Object} config the configuration structure
*/
function VSArray (config)
{
  this.parent = vs.core.Model;
  this.parent (config);
  this.constructor = vs.core.Array;
}

VSArray.prototype = {

  /*****************************************************************
   *
   ****************************************************************/

   _data: null,
   _model_class: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @name vs.core.Array#initComponent
   * @function
   * @protected
   */
   initComponent : function ()
   {
     this._data = [];
     this.forEach = Array.prototype.forEach.bind (this._data);
   },

  /*****************************************************************
   *
   ****************************************************************/
   
   forEach: function () {},

  /**
   * Returns the nth element
   *
   * @name vs.core.Array#item
   * @function
   *
   * @param {number} index
   */
  item : function (index)
  {
    return this._data [index];
  },

  /**
   * @private
   * @name vs.core.Array#_instanceModel
   * @function
   */
  _instanciateModel : function (obj)
  {
    if (obj instanceof vs.core.Model) return obj;
    if (obj instanceof Object && this._model_class)
    {
      try
      {
        var _model = new this._model_class (obj);
        _model.init ();
        return _model;
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        console.error (e.toString ());
      }
    }

    return obj;
  },

  /**
   * Adds one or more elements to the end of an array and returns the
   * new length of the array.
   *
   * @name vs.core.Array#add
   * @function
   *
   * @param {...vs.core.Object} datas
   */
  add : function ()
  {
    var args = [], i = 0;
    for (;i < arguments.length; i++)
    { args.push (this._instanciateModel (arguments[i])); }

    this._data.push.apply (this._data, args);

    if (this.hasToPropagateChange ()) this.change ('add');

    return this.length;
  },

  /**
   * Adds one or more elements to the end of an array and returns the
   *
   * @name vs.core.Array#addAtIndex
   * @function
   *
   * @param {number} index the position
   * @param {...vs.core.Object} datas
   */
  addAtIndex : function ()
  {
    if (arguments.length < 2) { return; }
    var args = [], i = 1;
    for (;i < arguments.length; i++)
    { args.push (this._instanciateModel (arguments[i])); }

    this._data.splice.apply (this._data, args);
    if (this.hasToPropagateChange ())
      this.change ('add', {from: args[0], to: args.length - 2});
  },

  /**
   * Removes the elements in the specified interval of this Array.<br/>
   * Shifts any subsequent elements to the left (subtracts one from
   * their indices).<br/>
   *
   * @example
   * myarray.remove (3); //remove the fourth item
   * ...
   * myarray.remove (3, 5); //remove the fourth, fifth and sixth items
   *
   * @name vs.core.Array#remove
   * @function
   *
   * @param {int} from Index of the first element to be removed
   * @param {int} to Index of the last element to be removed
   */
  remove : function (from, to)
  {
    this._data.remove (from, to);
    if (this.hasToPropagateChange ()) this.change ('remove', {from: from, to: to});
  },

  /**
   * Removes all elements of this Array.<br/>
   * @name vs.core.Array#removeAll
   * @function
   */
  removeAll : function ()
  {
    this._data = [];
    this.forEach = Array.prototype.forEach.bind (this._data);
    if (this.hasToPropagateChange ()) this.change ('removeall');
  },

  /**
   *  .
   *
   * @name vs.core.Array#indexOf
   * @function
   * @param {String} str the url to parse
   */
  indexOf : function ()
  {
    throw ("method not yet implemented");
//    this._data.push ();
  },

  /*****************************************************************
   *
   ****************************************************************/

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   *
   * @name vs.core.Array#toJSON
   * @function
   * @return {Object} the object value for stringify
   */
  toJSON : function ()
  {
    var result = this._toJSON (), i = 0, l = this._data.length, obj;
    
    result.data = [];
    for (;i < l; i++)
    {
      obj = this._data [i];
      if (typeof obj == "undefined") continue;
      else if (obj instanceof Date)
      { obj = '"\/Date(' + obj.getTime () + ')\/"'; }
      else if (obj && obj.toJSON) obj = obj.toJSON ();
      
      result.data.push (obj);
    }

    return result;
  },

  /**
   * @protected
   */
  parseData : function (obj)
  {
    var i, key, _model, item, self = this;

    function fillArray (data)
    {
      self._data = [];
      self.forEach = Array.prototype.forEach.bind (self._data);
      for (i = 0; i < data.length; i++)
      {
        item = data [i];
        
        // set model
        if (self._model_class) {
          _model = new self._model_class ().init ();
        }

        else if (util.isArray (item)) {
          _model = new VSArray ().init ();
        }
        
        else if (util.isUndefined (item) || util.isString (item) ||
          util.isNumber (item) || typeof item == "boolean" ||
          item == null || item instanceof Date) _model = null
          
        // generic model
        else _model = new Model ().init ();
        
        if (_model) {
          _model.parseData (item);
          self.add (_model);
        }
        else self.add (item);
      }
    };

    if (util.isArray (obj))
    {
      fillArray (obj);
    }
    else for (key in obj)
    {
      if (key == 'data')
      {
        fillArray (obj.data);
      }
      else this._parse_property (key, obj [key]);
    }
  }
};
util.extendClass (VSArray, core.Model);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (VSArray, {
  "data" : {
    /**
     * Set data elements for the array
     *
     * @name vs.core.Array#data
     * @type {Array | vs.core.Array}
     */
    set : function (v)
    {
      if (!this.__i__) throw ("Component not initialized");

      if (util.isArray (v)) {
        this._data = v.slice ();
        this.forEach = Array.prototype.forEach.bind (this._data);
      }
      else if (v instanceof VSArray)
      {
        this._data = v._data.slice ();
        this.forEach = Array.prototype.forEach.bind (this._data);
      }
      else return;

      if (this.hasToPropagateChange ()) this.change ('add');
    },

    /**
     * Returns an array of elements
     *
     * @name vs.core.Array#data
     * @type {Array}
     */
    get : function ()
    {
      if (!this.__i__) throw ("Component not initialized");
      return this._data.slice ();
    }
  },

  "length" : {
    /**
     * Reflects the number of elements in an array.
     *
     * @name vs.core.Array#length
     * @type {number}
     */
    get : function ()
    {
      if (!this.__i__) throw ("Component not initialized");
      return this._data.length;
    }
  },

  "modelClass" : {
    /**
     * Set this property to specify the model class that the Array contains
     *
     * @name vs.core.Array#modelClass
     * @type {vs.core.Model}
     */
    set : function (v)
    {
      if (!(util.isFunction (v))) return;

      this._model_class = v;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Array = VSArray;
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

/**
 *  @extends vs.core.EventSource
 *  @class vs.core.DataStorage 
 *  is an abstract class for managing data save and laod.
 *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND 
 *  THE API MAY CHANGE IN THE FUTURE <<< <p>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.DataStorage
 * @see vs.core.LocalStorage
 *
 * @param {Object} config the configuration structure
 */
function DataStorage (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = vs.core.DataStorage;

  this.__models__ = {};
}

DataStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
   __models__: null,
  
  /*****************************************************************
   *              
   ****************************************************************/
   
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Register a model into the sync service.
   *
   * @name vs.core.DataStorage#registerModel
   * @function
   * @param {String} name model name
   * @param {vs.core.Model} model the model to register
   */
  registerModel : function (name, model)
  {
    if (!name || !model) return;
    
    if (this.__models__ [name])
      error.log ("Model with the name already registered.");
      
    this.__models__ [name] = model;
    
    model._sync_service_ = this;
  },
  
  /**
   * Remove a model from the sync service. <br/>
   * If the you want also delete delete data you have to call before the 
   * delete methode
   *
   * @name vs.core.DataStorage#removeModel
   * @function
   * @param {String} name model name
   */
  removeModel : function (name)
  {
    if (!name) return;
    
    if (!this.__models__ [name]) return;
      
    delete (this.__models__ [name]);
  },
  
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Save models. If a name is specified, it save only the model
   * associated to the name.
   *
   * @name vs.core.DataStorage#save
   * @function
   * @param {String} name model name to save [optional]
   */
  save : function (name) {},
  
  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.DataStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name) {},
  
  /*****************************************************************
   *              
   ****************************************************************/
};
util.extendClass (DataStorage, core.EventSource);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.DataStorage = DataStorage;
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

/**
 *  @extends vs.core.DataStorage
 *  @class vs.core.LocalStorage 
 *  is an implementation of DataStorage for storing data into HTML5 LocalStorage
 *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND 
 *  THE API MAY CHANGE IN THE FUTURE <<< <p>
 * 
 *  @example
 *   var todoList = vs.core.Array ();
 *   todoList.init ();
 *
 *   var localStorage = new vs.core.LocalStorage ();
 *   localStorage.init ();
 *   localStorage.registerModel ("todoslist", todosList);
 *   localStorage.load ();
 *   ...
 *   // model modification
 *   localStorage.save ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.LocalStorage
 *
 * @param {Object} config the configuration structure
 */
function LocalStorage (config)
{
  this.parent = DataStorage;
  this.parent (config);
  this.constructor = vs.core.LocalStorage;
}

LocalStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
  /*****************************************************************
   *              
   ****************************************************************/
   
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Save models. If a name is specified, it saves only the model
   * associated to the name.
   *
   * @name vs.core.LocalStorage#save
   * @function
   * @param {String} name model name to save [optional]
   */
  save : function (name)
  {
    var self = this;
    function _save (name)
    {
      var json, model = self.__models__ [name];
      if (!model) return;
      
      try
      {
        json = JSON.stringify (model);
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        error.log (e);
        self.propagate ("error", e);
      }
      
      localStorage.setItem (name, json);
    }
    if (name) _save (name);
    else for (var name in this.__models__) _save (name);
    
    self.propagate ("save");
  },
  
  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.LocalStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name)
  {
    var self = this;
    function _load (name)
    {
      try {
        var json, model = self.__models__ [name];
        if (!model) return;
        
        var store = localStorage.getItem (name);
        model.parseJSON (store);
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
    
    self.propagate ("load");
  }
};
util.extendClass (LocalStorage, DataStorage);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.LocalStorage = LocalStorage;
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

/**
 *  @extends vs.core.DataStorage
 *  @class vs.core.RestStorage
 *  is an implementation of DataStorage for REST service
 *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND
 *  THE API MAY CHANGE IN THE FUTURE <<< <p>
 *  SUPPORT only load for now.
 *
 *  @example
 *   var todoList = new vs.core.Array ();
 *   todoList.init ();
 *
 *   var restSource = new vs.core.RestStorage ({
 *     url: "https://xxx"
 *   }).init ();
 *   restSource.registerModel ("todoslistOne", todosList);
 *   restSource.registerModel ("todoslistTwo", todosList);
 *   // Load all models
 *   restSource.load ();
 *   // Load only todoslistOne model
 *   restSource.load ("todoslistOne");
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.RestStorage
 *
 * @param {Object} config the configuration structure
 */
function RestStorage (config)
{
  this.parent = DataStorage;
  this.parent (config);
  this.constructor = RestStorage;

  this._xhrs = {};
  this._headers = {};
}

/**
 * Configure the RestStorage to use HttpRequest. Default configuration.
 * @name vs.core.RestStorage.XHR
 * @see vs.core.RestStorage#mode
 * @const
 */
RestStorage.XHR = 0;

/**
 * Configure the RestStorage to use JSONP
 * @name vs.core.RestStorage.JSONP
 * @see vs.core.RestStorage#mode
 * @const
 */
RestStorage.JSONP = 1;

RestStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/

  /**
   *
   * @protected
   * @type {Object}
   */
  _xhrs: null,

  /**
   *
   * @protected
   * @type {}
   */
  _mode: 0,

  /**
   *
   * @protected
   * @type {Object}
   */
  _headers: null,

  /**
   *
   * @protected
   * @type {String}
   */
  _url: '',

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    DataStorage.prototype.initComponent.call (this);
  },

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    DataStorage.prototype.destructor.call (this);
  },

  /**
   *
   * @name vs.core.RestStorage#setHeaders
   * @function
   * An object of additional header key/value pairs to send along with the
   * HTTP request.
   *
   * @param {Object} obj A <key/string> object
   */
  setHeaders : function (obj)
  {
    if (!obj) return;

    this._headers = {};

    for (var key in obj)
    {
      this._headers [key] = obj [key];
    }
  },

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * Save models. If a name is specified, it saves only the model
   * associated to the name.
   *
   * @name vs.core.RestStorage#save
   * @function
   * @param {String} name model name to save [optional]
   */
  save : function (name)
  {
    var self = this;
    function _save (name)
    {
      var json, model = self.__models__ [name];
      if (!model) return;

      try
      {
        json = JSON.stringify (model);
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        error.log (e);
        self.propagate ("error", e);
      }

      RestStorage.setItem (name, json);
    }
    if (name) _save (name);
    else for (var name in this.__models__) _save (name);

    self.propagate ("save");
  },

  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.RestStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name)
  {
    if (this._mode === RestStorage.XHR) this._load_xhr (name);
    if (this._mode === RestStorage.JSONP) this._load_jsonp (name);
  },

  /**
   * @private
   */
  _load_xhr : function (name)
  {
    var type = "GET";

    var dataType = 'xml';

    var self = this;
    function _load (name)
    {
      try {
        var model = self.__models__ [name];
        if (!model) return;

//        var url = self._url + name + '.json';
        var url = self._url + name;

        var ps = model.getModelProperties (), j = 0;
        if (ps && ps.length)
        {
          url += '?';
          for (var i = 0; i < ps.length; i ++)
          {
            var prop_name = ps[i], value = model ['_' + util.underscore (prop_name)];
            if (prop_name === "id" || prop_name === 'modelClass') continue
            if (!util.isString (value) && !util.isNumber (value)) continue;
            if (j++) url += '&';
            url += prop_name + '=' + escape (value);
          }
        }

        var xhr = new HTTPRequest ().init ();
        self._xhrs [xhr.id] = name;
        xhr.bind ('textload', self, self._process_xhr_result);
        xhr.setHeaders (self._headers);
        xhr.url = url;
        xhr.method = "GET";
        xhr.contentType = "application/json";
        xhr.send ();
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
  },

 /**
   * @private
   */
  _load_jsonp : function (name)
  {
    var type = "GET";

    var dataType = 'xml';

    var self = this;
    function _load (name)
    {
      try {
        var model = self.__models__ [name];
        if (!model) return;

        var url = self._url + name + '.json';

        var ps = model.getModelProperties (), j = 0;
        if (ps && ps.length)
        {
          url += '?';
          for (var i = 0; i < ps.length; i ++)
          {
            var prop_name = ps[i], value = model ['_' + util.underscore (prop_name)];
            if (prop_name === "id" || prop_name === 'modelClass') continue
            if (!util.isString (value) && !util.isNumber (value)) continue;
            if (j++) url += '&';
            url += prop_name + '=' + escape (value);
          }
        }

        var xhr = new AjaxJSONP ().init ();
        self._xhrs [xhr.id] = name;
        xhr.bind ('jsonload', self, self._process_json_result);
        xhr.url = url;
        xhr.send ();
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
  },

  _sync : function (method, url, specific_data)
  {
//     var params = {}, data = '';
//
//     // Ensure that we have the appropriate request data.
//     if (method == 'POST' || method == 'PUT')
//     {
//       this._xhr.contentType = 'application/json';
//       if (!specific_data)
//       { data = this.toJSON (); }
//       else
//       { data = specific_data; }
//     }
//
//     this._xhr.method = method;
//     this._xhr.url = url;
//
//     // Make the request.
//     this._xhr.send (data);
  },

  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#_process_xhr_result
   * @function
   *
   * @private
   * @param Text rsstxt
   * @param Document rssxml
   */
  _process_xhr_result : function (event)
  {
    var data = event.data, xhr = event.src;
    var model_name = this._xhrs [xhr.id];
    xhr.unbind ('textload', this, this._process_xhr_result);
    vs.util.free (xhr);
    delete (this._xhrs [xhr.id]);

    if (!data)
    {
      console.error ("Failed to parse rss document that is null.");
      return false;
    }

    var model = this.__models__ [model_name];
    if (!model) return;

    model.parseJSON (data);
    model.change ();
    this.propagate ('load', model);
  },

  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#_process_json_result
   * @function
   *
   * @private
   * @param Text rsstxt
   * @param Document rssxml
   */
  _process_json_result : function (event)
  {
    var data = event.data, xhr = event.src;
    var model_name = this._xhrs [xhr.id];
    xhr.unbind ('textload', this, this._process_json_result);
    vs.util.free (xhr);
    delete (this._xhrs [xhr.id]);

    var model = this.__models__ [model_name];
    if (!model) return;

    model.parseData (data);
    model.change ();
    this.propagate ('load', model);
  }
};
vs.util.extendClass (RestStorage, DataStorage);

/********************************************************************
                  Define class properties
********************************************************************/

vs.util.defineClassProperties (RestStorage, {
  "url": {
    /**
     * Setter for the url
     * @name vs.core.RestStorage#url
     * @type String
     */
    set : function (v)
    {
      if (!vs.util.isString (v)) { return; }

      this._url = v;
    },

    /**
     * Getter for the url
     * @name vs.core.RestStorage#url
     * @type String
     */
    get : function (v)
    {
      return this._url;
    }
  },

  "mode": {
    /**
     * Setter request mode
     * @name vs.core.RestStorage#mode
     * @type XHR | JSONP
     */
    set : function (v)
    {
      if (v === 0 || v === 1) this._mode = v;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.core.RestStorage = RestStorage;

})(window);