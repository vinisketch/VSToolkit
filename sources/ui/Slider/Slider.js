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
 *  The vs.ui.Slider class
 *
 *  @extends vs.ui.View
 *  @class
 *  An vs.ui.Slider is a control used to select a single value from a continuous
 *  range of values. Sliders are horizontal or vertical.
 *  <p/>
 *  By default the range is include in [0, 100] and the value is a float.
 *
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> continuous_change: data [number]; propagate when during slide
 *    <li/> change: data [number]: propagate at end of slide 
 *  </ul>
 *  <p>
 *  @example
 *  var config = {}
 *  var config.id = 'mySlider';
 *  var config.orientation = vs.ui.Slider.HORIZONTAL;
 *  var config.value = 10;
 *
 *  var mySlider = vs.ui.Slider (config);
 *  mySlider.init ();
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.Slider 
 *
 *  @constructor
 *   Creates a new vs.ui.Slider.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function Slider (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Slider;
  
  this._range = [0, 100];
}

/** 
 * Horizontal constant to configure a slider.
 * <p/>A slider can be horizontal or vertical.
 * Set the orientation property with this constant for a horizontal slider.
 * By default a slider is horizontal.
 * @see vs.ui.Slider#orientation
 * @name vs.ui.Slider.HORIZONTAL
 * @const
 */
Slider.HORIZONTAL = 0;

/** 
 * Vertical constant to configure a slider.
 * <p/>A slider can be horizontal or vertical.
 * Set the orientation property with this constant for a vertical slider.
 * By default a slider is horizontal.
 * @see vs.ui.Slider#orientation
 * @name vs.ui.Slider.VERTICAL
 * @const
 */
Slider.VERTICAL = 1;

Slider.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
  /**
   * slider orientation (0: horizontal, 1: vertical)
   * @protected
   * @type {number}
   */
  _orientation : Slider.HORIZONTAL,

  /**
   * set default button position to 0
   * @protected
   * @type {number}
   */
  _value : 0,

  /**
   *
   * @protected
   * @type {Array.<number>}
   */
  _range: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @private
   * @type {number}
   */
  __v : 0,

  /**
   * @private
   * @type {number}
   */
  __drag_x : 0,

  /**
   * @private
   * @type {number}
   */
  __drag_y : 0,

  /**
   * @private
   * @type {HTMLDivElement}
   */
  __handle : null,
  
  /**
   * @private
   * @type {number}
   */
  __handle_width : 0,
     
  /**
   * @private
   * @type {number}
   */
  __handle_delta : 10,
     
/********************************************************************
                  setter and getter declarations
********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    if (this.__drag_recognizer)
    {
      this.removePointerRecognizer (this.__drag_recognizer);
      this.__drag_recognizer = null;
    }
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    var os_device =  vs.ui.View.getDeviceCSSCode (); //window.deviceConfiguration.os;

    if (os_device == DeviceConfiguration.OS_IOS)
    {
      this.__handle_width = 28;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this.__handle_width = 30;
    }
    else if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this.__handle_width = 34;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this.__handle_width = 35;
      this.__handle_height = 12;
      this.__handle_delta = 3;
    }
    else { this.__handle_width = 23; }
    
    //1) find first Div.
    this.__handle = this.view.querySelector ('.handle');
      
    // top/bottom click listening
    vs.addPointerListener (this.__handle, core.POINTER_START, this, true);
    if (!this.__drag_recognizer)
    {
      this.__drag_recognizer = new DragRecognizer (this, this);
      this.addPointerRecognizer (this.__drag_recognizer);
    }
    
    this.orientation = this._orientation;
    this.value = this._value;
  },
  
  didDragStart : function (e) {
    this.__handle_width = this.__handle.offsetWidth;
    this.__handle_x = this.__handle.offsetLeft;
    this.__handle_y = this.__handle.offsetTop;

    // set the new handler position
    var clientX = e.pointerList[0].clientX;
    var clientY = e.pointerList[0].clientY;
    
    if (this._orientation === 0) {
      this.value = this._range [0] +
        (this._range [1] - this._range [0]) * clientX / this.view.offsetWidth;
    }
    else {
      this.value = this._range [0] +
        (this._range [1] - this._range [0]) * clientY / this.view.offsetHeight;
    }

    // save the actual value for drag incrementation
    this.__v = this._value;
  },
  
  didDrag : function (info) {
    if (this._orientation === 0) {
      dec = this.view.offsetWidth - this.__handle_width;
      delta = info.dx;
    }
    else {
      dec = this.view.offsetHeight - this.__handle_width;
      delta = info.dy;
    }
    
    this.value = this.__v + delta * (this._range [1] - this._range [0]) / dec;

    this.outPropertyChange ();
    this.propagate ('continuous_change', this._value);
  },
    
  didDragEnd : function () {
    this.propagate ('change', this._value);
  },
  
 /**********************************************************************
 
 *********************************************************************/

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    // reconfigure handle size
    this.__handle_width = this.__handle.offsetWidth;
    // force GUI update
    this.value = this._value;

    View.prototype.refresh.call (this);
  }
};
util.extendClass (Slider, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Slider, {
  'value':{
    /**
     * Set the current slider value
     * The value should be include in [0, 100]
     * @name vs.ui.Slider#value 
     * @type number
     */
    set : function (v)
    {
      var height, width, x, y;
      
      if (isNaN (v)) return;
      if (v < this._range [0]) { v = this._range [0]; }
      if (v > this._range [1]) { v = this._range [1]; }
      
      this._value = v;
      var d1 = this.__handle_width / 2, d2 = 0;
       
      var os_device = window.deviceConfiguration.os;
      if (os_device === DeviceConfiguration.OS_BLACK_BERRY)
      {
        d2 = (this.__handle_height - this.__handle_delta) / 2;
      }
      else
      {
        d2 = (this.__handle_width - this.__handle_delta) / 2;
      }
      
      if (this._orientation === 0)
      {
        width = this.view.offsetWidth,
          x = Math.floor ((v - this._range [0]) * width /
            (this._range [1] - this._range [0])) - d1;
        
        if (SUPPORT_3D_TRANSFORM)
          setElementTransform (this.__handle, "translate3d(" + x + "px,-" + d2 + "px,0)");
        else
          setElementTransform (this.__handle, "translate(" + x + "px,-" + d2 + "px)");
          
        this.view.style.backgroundSize = (x + d1) + "px 10px";
      }
      else
      {
        height = this.view.offsetHeight,
          y = Math.floor ((v - this._range [0]) * height /
            (this._range [1] - this._range [0])) - d1;
          
        if (SUPPORT_3D_TRANSFORM)
          setElementTransform (this.__handle, "translate3d(-" + d2 + "px," + y + "px,0)");
        else
          setElementTransform (this.__handle, "translate(-" + d2 + "px," + y + "px)");
          
        this.view.style.backgroundSize = "10px " + (y + d1) + "px";
      }
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._value;
    }
  },
  'range':{
    /** 
     * Set or get the slider range, By default range = [0, 100];
     * @name vs.ui.Slider#range 
     * @type Array.<number>
     */ 
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }
      if (v[0] === v[1] || v[0] > v[1]) { return; }
  
      this._range [0] = v [0];
      this._range [1] = v [1];
       
      this.value = this._value;
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
  'orientation':{
    /**
     * Property to configure the slider orientation.
     * <p/>A slider can be horizontal or vertical.
     *  Use the vs.ui.Slider.HORIZONTAL
     * or vs.ui.Slider.VERTICAL constant to configure the slider.
     * <p/>By default a slider is horizontal.
     * @name vs.ui.Slider#orientation 
     * @type number
     */
    set : function (v)
    {
      if (v !== Slider.HORIZONTAL && v !== Slider.VERTICAL) { return; }
      
      this._orientation = v;
      
      if (this._orientation === 0)
      {
        this.removeClassName ('vertical');
        this.addClassName ('horizontal');
      }
      else
      {
        this.addClassName ('vertical');
        this.removeClassName ('horizontal');
      }
      
      // re-apply the value
      this.value = this._value;
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._orientation;
    }
  },
  'size':{
    /** 
     * Getter|Setter for size. Gives access to the size of the GUI Object
     * @name vs.ui.Slider#size 
     *
     * @type {vs.ui.Slider.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      
      this._size [0] = v [0];
      this._size [1] = v [1];
      
      if (!this.view) { return; }
      this._updateSizeAndPos ();
      
      // re-apply the value
      this.value = this._value;
    },
  
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (this.view && this.view.parentNode)
      {
        this._size [0] = this.view.offsetWidth;
        this._size [1] = this.view.offsetHeight;
      }
      return this._size.slice ();
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Slider = Slider;
