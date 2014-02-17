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
   _index: null,
   _value: null,

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
    if (!(util.isNumber (index))) return;
    if (index < 0 || index > this._data.length) return;
    
    this._index = index;
    this._value = this._data [index];
    
    this.propertyChange ("value");
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
    this._index = -1;
    this._value = undefined;
    
    this.forEach = Array.prototype.forEach.bind (this._data);
    if (this.hasToPropagateChange ()) this.change ('removeall');
  },

  /**
   * Removes all elements of this Array.<br/>
   * @name vs.core.Array#clear
   * @param {Boolean} should_free free content items
   * @function
   */
  clear : function (should_free)
  {
    var i = 0, l = this._data.length;
    
    if (should_free) for (;i < l; i++) {
      vs.util.free (this._data [i]);
    }
    
    this.removeAll ();
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
  },
  
  "index" : {
    /**
     * Select the nth element. The output property value, will be changed
     *
     * @name vs.core.Array#index
     * @type {number}
     */
    set : function (v)
    {
      if (util.isString (v)) v = parseInt (v, 10);
      
      if (!(util.isNumber (v))) return;
      if (v < 0 || v > this._data.length) return;
      
      v = Math.floor (v);
      
      this._index = v;
      this._value = this._data [v];
      
      this.propertyChange ("value");
    },
    
    /**
     *  Return the current index value
     *
     * @name vs.core.Array#value
     * @type {number}
     */
    get : function ()
    {
      return this._index;
    }
  },

  "value" : {
    /**
     *  Return the current selected element. This property change when
     *  array#index property change or if the method item is called.
     *
     * @name vs.core.Array#value
     * @type {number}
     */
    get : function ()
    {
      return this._value;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Array = VSArray;
