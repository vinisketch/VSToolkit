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

import {
  isArray, isUndefined, isString, isNumber, isFunction, free
} from 'vs_utils';

import { Model } from 'vs_core';

/**
 *  @class
 *  core.Array is an Array of Object or Model.
 *
 * @extends core.Model
 * @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name core.Array
 *
 * @param {Object} config the configuration structure
*/
class VSArray extends Model {

  protected _data: any[] | null = null;
  protected _model_class: (new (...args: any[]) => any) | null = null;
  protected _index: number | null = null;
  protected _value: any = null;

  constructor(config?: any) {
    super(config);
  }

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @name core.Array#initComponent
   * @function
   * @protected
   */
  initComponent(): void {
    this._data = [];
    this.forEach = Array.prototype.forEach.bind(this._data);
  }

  /*****************************************************************
   *
   ****************************************************************/

  forEach(...args: any[]): void {}

  /**
   * Returns the nth element
   *
   * @name core.Array#item
   * @function
   *
   * @param {number} index
   */
  item(index: number): any {
    if (!isNumber(index)) return;
    if (index < 0 || index > this._data!.length) return;

    return this._data![index];
  }

  /**
   * @private
   * @name core.Array#_instanceModel
   * @function
   */
  _instantiateModel(obj: any): any {
    if (obj instanceof Model) return obj;
    if (obj instanceof Object && this._model_class) {
      try {
        const _model = new this._model_class(obj);
        _model.init();
        return _model;
      }
      catch (e: any) {
        if (e.stack) console.log(e.stack);
        console.error(e);
      }
    }

    return obj;
  }

  /**
   * Adds one or more elements to the end of an array and returns the
   * new length of the array.
   *
   * @name core.Array#add
   * @function
   *
   * @param {...core.Object} datas
   */
  add(...datas: any[]): number {
    const args = datas.map(d => this._instantiateModel(d));

    this._data!.push(...args);

    if (this.hasToPropagateChange()) this.change('add');

    return this.length;
  }

  /**
   * Adds one or more elements to the end of an array and returns the
   *
   * @name core.Array#addAtIndex
   * @function
   *
   * @param {number} index the position
   * @param {...core.Object} datas
   */
  addAtIndex(index: number, ...datas: any[]): void {
    if (datas.length < 1) return;

    const models = datas.map(d => this._instantiateModel(d));
    this._data!.splice(index, 0, ...models);

    if (this.hasToPropagateChange())
      this.change('add', {from: index, to: datas.length - 1});
  }

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
   * @name core.Array#remove
   * @function
   *
   * @param {int} from Index of the first element to be removed
   * @param {int} to Index of the last element to be removed
   */
  remove(from: number, to?: number): void {
    (this._data as any).remove(from, to);
    if (this.hasToPropagateChange()) this.change('remove', {from, to});
  }

  /**
   * Removes all elements of this Array.<br/>
   * @name core.Array#removeAll
   * @function
   */
  removeAll(): void {
    this._data = [];
    this._index = -1;
    this._value = undefined;

    this.forEach = Array.prototype.forEach.bind(this._data);
    if (this.hasToPropagateChange()) this.change('removeall');
  }

  /**
   * Removes all elements of this Array.<br/>
   * @name core.Array#clear
   * @param {Boolean} should_free free content items
   * @function
   */
  clear(should_free?: boolean): void {
    if (should_free) {
      for (const item of this._data!) {
        free(item);
      }
    }

    this.removeAll();
  }

  /**
   *  .
   *
   * @name core.Array#indexOf
   * @function
   * @param {String} str the url to parse
   */
  indexOf(): never {
    throw ("method not yet implemented");
  }

  /*****************************************************************
   *
   ****************************************************************/

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   *
   * @name core.Array#toJSON
   * @function
   * @return {Object} the object value for stringify
   */
  toJSON(): any {
    const result = this._toJSON();

    result.data = [];
    for (let obj of this._data!) {
      if (typeof obj === "undefined") continue;
      else if (obj instanceof Date)
        obj = `"\/Date(${obj.getTime()})\/"`;
      else if (obj?.toJSON) obj = obj.toJSON();

      result.data.push(obj);
    }

    return result;
  }

  /**
   * @protected
   */
  parseData(obj: any): void {
    this.stopPropagation();

    const fillArray = (data: any[]): void => {
      this._data = [];
      this.forEach = Array.prototype.forEach.bind(this._data);
      for (const item of data) {
        let _model: any;

        // set model
        if (this._model_class) {
          _model = new this._model_class().init();
        }
        else if (isArray(item)) {
          _model = new VSArray().init();
        }
        else if (isUndefined(item) || isString(item) ||
          isNumber(item) || typeof item === "boolean" ||
          item == null || item instanceof Date) {
          _model = null;
        }
        // generic model
        else {
          _model = new Model().init();
        }

        if (_model) {
          _model.parseData(item);
          this.add(_model);
        }
        else this.add(item);
      }
    };

    if (isArray(obj)) {
      fillArray(obj);
    }
    else {
      for (const key in obj) {
        if (key === 'data') {
          fillArray(obj.data);
        }
        else this._parse_property(key, obj[key]);
      }
    }

    this.change();
  }

  /********************************************************************
                    Define class properties
  ********************************************************************/

  /**
   * Set data elements for the array
   *
   * @name core.Array#data
   * @type {Array | core.Array}
   */
  set data(v: any[] | VSArray) {
    if (!this.__i__) throw ("Component not initialized");

    if (isArray(v)) {
      this._data = (v as any[]).slice();
      this.forEach = Array.prototype.forEach.bind(this._data);
    }
    else if (v instanceof VSArray) {
      this._data = v._data!.slice();
      this.forEach = Array.prototype.forEach.bind(this._data);
    }
    else return;

    if (this.hasToPropagateChange()) this.change('add');
  }

  /**
   * Returns an array of elements
   *
   * @name core.Array#data
   * @type {Array}
   */
  get data(): any[] {
    if (!this.__i__) throw ("Component not initialized");
    return this._data!.slice();
  }

  /**
   * Reflects the number of elements in an array.
   *
   * @name core.Array#length
   * @type {number}
   */
  get length(): number {
    if (!this.__i__) throw ("Component not initialized");
    return this._data!.length;
  }

  /**
   * Set this property to specify the model class that the Array contains
   *
   * @name core.Array#modelClass
   * @type {core.Model}
   */
  set modelClass(v: new (...args: any[]) => any) {
    if (!isFunction(v)) return;

    this._model_class = v;
  }

  /**
   * Select the nth element. The output property value, will be changed
   *
   * @name core.Array#index
   * @type {number}
   */
  set index(v: number | string) {
    if (isString(v)) v = parseInt(v as string, 10);

    if (!isNumber(v)) return;
    if ((v as number) < 0 || (v as number) > this._data!.length) return;

    v = Math.floor(v as number);

    this._index = v;
    this._value = this._data![v];

    this.propertyChange("value");
  }

  /**
   *  Return the current index value
   *
   * @name core.Array#value
   * @type {number}
   */
  get index(): number | null {
    return this._index;
  }

  /**
   *  Return the current selected element. This property change when
   *  array#index property change or if the method item is called.
   *
   * @name core.Array#value
   * @type {number}
   */
  get value(): any {
    return this._value;
  }
}

/********************************************************************
                    Export
*********************************************************************/
/** @private */
export default VSArray;
