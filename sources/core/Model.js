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

var _constructor_ = window.Object.prototype.constructor;

/**
 * @example
 *  var Class1 = vs.core.createClass ({
 *    properties: {name: vs.core.Object.PROPERTY_IN_OUT},{});
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
      _prop_name = '_' + prop_name;
      if (export_value & vs.core.Object.PROPERTY_IN)
      {
        desc.set = (function (_prop_name)
        {
          return function (v)
          {
            this[_prop_name] = v;
            this.propertyChange (_prop_name);
          };
        }(_prop_name));
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

/**
 * The vs.core.Model class
 *
 * @extends vs.core.Object
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
 *   properties {
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
  this.parent = core.Object;
  this.parent (config);
  this.constructor = vs.core.Model;

  this.__bindings__ = {};
}

Model.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @protected
   * @type {Array}
   */
   __bindings__: null,
   
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
   * @protected
   * @function
   */
  destructor: function ()
  {
    core.Object.prototype.destructor.call (this);
    
    if (this._sync_service_) this._sync_service_.removeModel (this);
    
    function deleteBindings (list_bind)
    {
      if (!list_bind) return;
      
      var bind, i = 0;
      while (i < list_bind.length)
      {
        bind = list_bind [i];
        util.free (bind);
      }
    };
    
    for (var spec in this.__bindings__)
    {
      deleteBindings (this.__bindings__ [spec]);
      delete (this.__bindings__ [spec]);
    }
    
    delete (this.__bindings__);
  },

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
    var list_bind, handler;
    
    spec = spec || 'change'
    handler = new Handler (spec, obj, func, false);    
    
    list_bind = this.__bindings__ [spec];
    if (!list_bind)
    {
      list_bind = [];
      this.__bindings__ [spec] = list_bind; 
    }
    list_bind.push (handler);
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
    if (!spec) spec = 'change';

    function unbind (list_bind)
    {
      if (!list_bind) return;
      
      var bind, i = 0;
      while (i < list_bind.length)
      {
        bind = list_bind [i];
        if (bind.spec === spec)
        {
          if (bind.obj === obj)
          {
            if (util.isString (func) || util.isFunction (func) )
            {
              if (bind.func === func || bind.func_ptr === func)
              {
                list_bind.remove (i);
                util.free (bind);
              }
              else { i++; }
            }
            else
            {
              list_bind.remove (i);
              util.free (bind);
            }
          }
          else { i++; }
        }
        else { i++; }
      }
    };

    unbind (this.__bindings__ [spec]);
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
  change : function (spec)
  {
    var list_bind, event, handler;
    
    this.__should_propagate_changes__ = true;

    event = new Event (this, spec || 'change:' + spec);
    
    try
    {
      function _change (list_bind)
      {
        if (!list_bind) return;
        var i = list_bind.length, handler;
  
        while (i--)
        {
          /** @private */
          handler = list_bind [i];    
          
          if (handler.func_ptr) // function pointer call
          {
            handler.func_ptr.call (handler.obj, event);
          }
          else if (handler.func) // function name call
          {
            handler.obj[handler.func] (event); 
          }
          else // default notify method
          {
            handler.obj.notify (event); 
          }
        }
      };
      
      if (spec && spec != 'change') _change (this.__bindings__ [spec]);
      _change (this.__bindings__ ['change']);
    }
    catch (e)
    {
      console.error (e);
    }
  },

  /**
   * Manually force dataflow properties change propagation.
   * <br/>
   * If no property name is specified, the system will assume all component's
   * properties have been modified.
   *
   * @name vs.core.Model#propertyChange
   * @function
   *
   * @param {String} property the name of the modified property.[optional]
   */
  propertyChange : function (property)
  {
    var df = _df_node_to_def [this._id];
    if (!df) { return; }
    
    df.propagate (this._id, property);
    if (this.__should_propagate_changes__) { this.change (); }
  }
};
util.extendClass (Model, core.Object);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Model = Model;
