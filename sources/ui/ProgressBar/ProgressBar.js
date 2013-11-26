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
 *  The vs.ui.ProgressBar class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ProgressBar class is used to convey the progress of a task.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.ProgressBar.
 * @name vs.ui.ProgressBar
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ProgressBar (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ProgressBar;
  
  this._range = [0, 100];
}

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_IOS = 5;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_ANDROID = 5;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_WP7 = 0;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_SYMBIAN = 0;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_BB = 1;

ProgressBar.prototype = {
  
  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __inner_view: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _index: 0,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _indeterminate: false,

  /**
   *
   * @protected
   * @type {Array.<number>}
   */
  _range: null,
   
  /**
   *
   * @private
   * @type {number}
   */
  __border_width: 0,
  
  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    util.setElementSize (this.view, this._size [0],  this._size [1]);
    this.index = this._index;
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this.__inner_view = this.view.firstElementChild;
    this.indeterminate = this._indeterminate;

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_ANDROID * 2;
    }
    else if (os_device == DeviceConfiguration.OS_IOS)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_IOS * 2;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_WP7 * 2;
    }
    else if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_SYMBIAN * 2;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_BB * 2;
    }

    this.index = this._index;
  },
  
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    this.index = this._index;
    View.prototype.refresh.call (this);
  }
};
util.extendClass (ProgressBar, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ProgressBar, {
  'index': {
    /** 
     * Allow to set or get the progress bar index
     * @name vs.ui.ProgressBar#index 
     * @type number
     */ 
    set : function (v)
    {
      if (!util.isNumber (v)) { return; }
  
      this._index = v;
      
      if (!this.__inner_view) { return; }
      
      var width = this.size [0], w;
      width -= this.__border_width;
      
      w = width * (this._index - this._range[0]) / 
                  (this._range [1] - this._range [0]);
      
      if (w > width) { w = width; }
      if (w < 0) { w = 0; }
          
      var os_device = window.deviceConfiguration.os;
      if (os_device === DeviceConfiguration.OS_ANDROID ||
          os_device === DeviceConfiguration.OS_IOS)
      {
        this.__inner_view.style.width = (w + this.__border_width) + 'px';
      }
      else { this.__inner_view.style.width = w + 'px'; }
    },
  
    /** 
     * @ignore
     * @return {number}
     */ 
    get : function ()
    {
      return this._index;
    }
  },
  'range': {
    /** 
     * Set or get the progress bar range, By default range = [0, 100];
     * @name vs.ui.ProgressBar#range 
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }
      if (v[0] === v[1] || v[0] > v[1]) { return; }
  
      this._range [0] = v [0];
      this._range [1] = v [1];
      this.index = this._index;
    },
  
    /** 
     * @ignore
     * @return {Array}
     */ 
    get : function ()
    {
      return this._range.slice ();
    }
  },
  'indeterminate': {
    /** 
     * Boolean value indicating whether the progress bar is indeterminate.
     * @name vs.ui.ProgressBar#indeterminate 
     * @type Boolean
     */ 
    set : function (v)
    {
      if (v)
      {
        this._indeterminate = true;
        if (this.view) util.addClassName (this.view, 'indeterminate');
      }
      else
      {
        this._indeterminate = false;
        if (this.view) util.removeClassName (this.view, 'indeterminate');
      }
    },
  
    /** 
     * @ignore
     * @return Boolean
     */ 
    get : function ()
    {
      return this._indeterminate ;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ProgressBar = ProgressBar;
