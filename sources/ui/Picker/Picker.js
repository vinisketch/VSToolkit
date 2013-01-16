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
 * 
 * Find more about the Spinning Wheel function at
 * http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch/11
 *
 * Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 1.4 - Last updated: 2009.07.09
 * 
 */

/**
 *  The vs.ui.Picker class
 *
 *  @extends vs.ui.View
 *  @class
 *  vs.ui.Picker defines a view that use a spinning-wheel or slot-machine 
 *  metaphor to show one or more sets of values. Users select values by 
 *  rotating the wheels so that the desired row of values aligns with a
 *  selection indicator.
 *  <p>
 *  This code ins based on Spinning Wheel object from Matteo Spinelli.
 *
 *  <p>
 *  Delegate:
 *  <ul>
 *    <li/>pickerViewSelectRow : function (vs.ui.Picker the view)
 *  </ul>
 *  <p>
 *  Event:
 *  <ul>
 *    <li/>change : data : {index: slot_index, key: selected key, value, 
 *                  selected value} 
 *  </ul>
 *  <p>
 *  @example
 *  var sizePicker = new vs.ui.Picker ();
 *  
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot ({ separator: ',', 'readonly');
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot ({ cm: 'Cm', ft: 'Feet' }, 'shrink');
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.Picker.
 * @name vs.ui.Picker
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function Picker (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Picker;
}

/**
 * Predefined numbers for the Picker
 *
 * @name vs.ui.Picker.NUMBERS
 * @public
 * @const
 */
Picker.NUMBERS =
  { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9};

/**
 * @private
 * @const
 */
Picker.MODE_IOS = 0;

/**
 * @private
 * @const
 */
Picker.MODE_ANDROID = 1;

/**
 * @private
 * @const
 */
Picker.MODE_WP7 = 2;

/**
 * @private
 * @const
 */
Picker.MODE_SYMBIAN = 3;

/**
 * @private
 * @const
 */
Picker.MODE_BLACK_BERRY = 4;

Picker.prototype = {

  /**
   * @private
   * @type {Number}
   */
  _mode: Picker.MODE_IOS,

  /**
   * @private
   * @type {Number}
   */
  _cell_height: 44,

  /**
   * @private
   * @type {Number}
   */
  _friction: 0.003,

  /**
   * Slots data
   * @protected
   * @type {Array}
   */
  _data: null,

  /**
   * Slots build elements
   * @private
   * @type {Array}
   */
  _slots_elements: null,

  /**
   * Slots build elements
   * @private
   * @type {Array}
   */
  _current_values: null,

  /**
   * @protected
   * @type {Array}
   */
  _selected_keys: null,

  /**
   * @protected
   * @type {Array}
   */
  _selected_values: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * destructor
   *
   * @protected
   * @function
   */
  destructor : function ()
  {
    this._frame_view.removeEventListener (core.POINTER_START, this, false);

    document.removeEventListener (core.POINTER_START, this, false);
    document.removeEventListener (core.POINTER_MOVE, this, false);

    this._slots_view.innerHTML = "";
    delete (this._data);
    delete (this._slots_elements);
    delete (this._frame_view);
    delete (this._slots_view);
 
    delete (this._current_values);
 
    View.prototype.destructor.call (this);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    this._data = [];
    this._slots_elements = [];
    
    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this._mode = Picker.MODE_ANDROID;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this._mode = Picker.MODE_WP7;
    }
    else if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this._mode = Picker.MODE_SYMBIAN;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this._mode = Picker.MODE_BLACK_BERRY;
    }
    else
    {
      this._mode = Picker.MODE_IOS;
    }
    
    // Pseudo table element (inner wrapper)
    this._slots_view = this.view.querySelector ('.slots');
        
    // The scrolling controller
    this._frame_view = this.view.querySelector ('.frame');
    
    switch (this._mode)
    {
      case Picker.MODE_IOS:
        // Add scrolling to the slots
        this._frame_view.addEventListener (core.POINTER_START, this);
        this._frame_border_width = 0;
      break;
      
      case Picker.MODE_SYMBIAN:
        // Add scrolling to the slots
        this._frame_view.addEventListener (core.POINTER_START, this);
        this._frame_border_width = 0;
      break;
      
      case Picker.MODE_WP7:
        this._frame_view.parentElement.removeChild (this._frame_view);
        this._cell_height = 83;
      break;
      
      case Picker.MODE_ANDROID:
        this._frame_view.parentElement.removeChild (this._frame_view);
      break;

      case Picker.MODE_BLACK_BERRY:
        this._frame_view.addEventListener (core.POINTER_START, this);
        this._cell_height = 50;
      break;
    }    
  },

  /**
   * Remove all slots from the picker
   *
   * @public
   * @name vs.ui.Picker#removeAllSlots 
   * @function
   */
  removeAllSlots: function ()
  {
    delete (this._data);
    this._data = [];
    
    this._remove_all_slots ();
  },

  /**
   * Remove all slots from the picker
   *
   * @public
   * @name vs.ui.Picker#removeAllSlots 
   * @function
   */
  _remove_all_slots: function ()
  {
    this._slots_view.innerHTML = "";

    delete (this._slots_elements);
    this._slots_elements = [];
    
    this._active_slot = null;
  },

  /**
   * Renders slots
   *
   * @private
   * @function
   */
  _render_slots: function ()
  {
    // Create HTML slot elements
    for (var l = 0; l < this._data.length; l++)
    {
      // Create the slot
      this._render_a_slot (l);
    }
  },  
  
  /**
   * Renders one slot
   *
   * @private
   * @function
   */
  _render_a_slot: function (l)
  {
    var i, out, ul, div, data = this._data[l];

    if (!data) { return; }

    var width = 0;
    var os_device = window.deviceConfiguration.os;
    if (data.length && os_device == DeviceConfiguration.OS_WP7)
      width = Math.floor (100 / data.length);
    
     // Create the slot
    ul = document.createElement ('ul');
    ul.index = l;

    // WP7 does not manage box model (then use inline-block instead of)
    if (width) util.setElementStyle (ul, {"width": width + '%'});

    out = '';
    
    for (i in data.values)
    {
      out += '<li>' + data.values[i] + '<' + '/li>';
    }
    ul.innerHTML = out;
    
    if (this._mode === Picker.MODE_ANDROID)
    {
      // Create slot container
      div = document.createElement ('div');
      
      var buttons = this._generate_button (l);

      div.appendChild (buttons [0]);
    
      // Create slot container
      var slot = document.createElement ('div');
      // Add styles to the container
      slot.className = data.style;
      slot.appendChild (ul);
      div.appendChild (slot);

      div.appendChild (buttons [1]);
    }
    else
    {
      // Create slot container
      div = document.createElement ('div');
      // Add styles to the container
      div.className = data.style;
      div.appendChild (ul);
    }

    // Append the slot to the wrapper
    this._slots_view.appendChild (div);
    
    // Save the slot position inside the wrapper
    ul.slotPosition = l;
    ul.slotYPosition = 0;
    switch (this._mode)
    {
      case Picker.MODE_WP7:
        ul.slotMaxScroll = this.view.clientHeight - ul.clientHeight;
        ul.addEventListener (core.POINTER_START, this, true);
      break;
    }    
    
    // Add default transition
    ul.style.webkitTransitionTimingFunction = 'cubic-bezier(0, 0, 0.2, 1)';   

    if (SUPPORT_3D_TRANSFORM)
      setElementTransform (ul, 'translate3d(0,0,0)');
    else
      setElementTransform (ul, 'translate(0,0)');
    
    // Save the slot for later use
    this._slots_elements.push (ul);
    
    // Place the slot to its default position (if other than 0)
    if (data.defaultValue)
    {
      this.scrollToValue (l, data.defaultValue);  
    }
  },
  
  /**
   * @protected
   * @function
   */
  _generate_button: function (i)
  {
    var readonly = this._data[i].style.match ('readonly');

    var button_incr = document.createElement ('div');
    if (readonly)
    {
      button_incr.className = 'button_incr readonly';
    }
    else
    {
      button_incr.className = "button_incr";
      button_incr.innerHTML = '+';
      button_incr.slotPosition = i;
    }

    if (!readonly)
    {
      button_incr.addEventListener (core.POINTER_START, this);
      button_incr.addEventListener (core.POINTER_END, this);
      button_incr.addEventListener (core.POINTER_CANCEL, this);
    }
    
    // Create the slot
    var button_decr = document.createElement ('div');
    if (readonly)
    {
      button_decr.className = 'button_decr readonly';
    }
    else
    {
      button_decr.className = 'button_decr';
      button_decr.innerHTML = '-';
      button_decr.slotPosition = i;
    }

    if (!readonly)
    {
      button_decr.addEventListener (core.POINTER_START, this);
      button_decr.addEventListener (core.POINTER_END, this);
      button_decr.addEventListener (core.POINTER_CANCEL, this);
    }
    
    return [button_incr, button_decr];
  },
  
  /**
   * @protected
   * @function
   */
  _buttonSelected : function (e)
  {
    var slotNum = e.target.slotPosition;
    switch (e.type)
    {
      case core.POINTER_START:
        util.addClassName (e.target, 'active');
        break
      
      case core.POINTER_END:
        var slot_elem = this._slots_elements[slotNum], slotMaxScroll,
          pos = slot_elem.slotYPosition;
        if (util.hasClassName (e.target, 'button_decr'))
        {
          pos += 44;
          if (pos > 0) { pos = 0;}
        }
        else
        {
          pos -= 44;
          var slotMaxScroll = this.getSlotMaxScroll (slot_elem);
          if (pos < slotMaxScroll) { pos = slotMaxScroll; }
        }

        this._scrollTo (slotNum, pos);
      case core.POINTER_CANCEL:
        util.removeClassName (e.target, 'active');
        break
    }
  },
  
  /**
   * Add a new slot to the picket view.
   * <p>
   * The new slot is added at right of others slots.<br/>
   * Values is in the form of: < key: value >. Keys are the identifiers
   * that won’t be shown in the picker.<br/>
   *
   * Styles is a list of space separated predefined styles to be applied
   * to the slot. The available values are:
   * <ul>
   *  <li />right, align text inside the slot to the right;
   *  <li />readonly, the slot can’t be spun;
   *  <li />shrink, shrink the slot width to the minimum possible.
   * </ul>
   *
   * @name vs.ui.Picker#addSlot
   * @function
   *
   * @param {Object} values The slot data
   * @param {string} style The slot style
   * @param {string} defaultValue The default value to set
   */
  addSlot: function (values, style, defaultValue)
  {
    if (!style) { style = ''; }

    var obj = {}
    obj.values = values;
    obj.style = style;
    obj.defaultValue = defaultValue;
    
    this._data.push (obj);
    
    this._render_a_slot (this._data.length - 1);
  },
  
  /**
   * Returns slots selected value.
   *
   * @public
   *
   * @name vs.ui.Picker#getSelectedValues
   * @function
   *
   * @return {Object} {keys, values}
   */
  getSelectedValues: function ()
  {
    if (this._current_values) { return this._current_values; }
    
    var index, count, i, l, elem, slotMaxScroll;
    
    this._selected_keys = [];
    this._selected_values = [];

    for (i = 0; i < this._slots_elements.length; i++)
    {
      elem = this._slots_elements[i];
      if (!elem)
      { continue; }
      // Remove any residual animation
      elem.removeEventListener (vs.TRANSITION_END, this, false);
      elem.style.setProperty (vs.TRANSITION_DURATION, '0');

      slotMaxScroll = this.getSlotMaxScroll (elem);
      
      if (elem.slotYPosition > 0)
      {
        this._setPosition (i, 0);
      }
      else if (elem.slotYPosition <  slotMaxScroll)
      {
        this._setPosition (i, slotMaxScroll);
      }

      index = -Math.round (elem.slotYPosition / this._cell_height);

      count = 0;
      for (l in this._data[i].values)
      {
        if (count == index)
        {
          this._selected_keys.push (l);
          this._selected_values.push (this._data[i].values[l]);
          break;
        }
        
        count++;
      }
    }

    this._current_values =
      { 'keys': this._selected_keys, 'values': this._selected_values };
    return this._current_values;
  },

  /**
   * Returns slots selected value.
   *
   * @private
   * @function
   *
   * @return {Object} {keys, values}
   */
  _getSelectedValues: function ()
  {
    if (this._current_values) { return this._current_values; }
    
    var index, count, i, l, elem;

    this._selected_keys = [];
    this._selected_values = [];

    for (i = 0; i < this._slots_elements.length; i++)
    {
      elem = this._slots_elements[i];
      if (!elem) { continue; }

       index = -Math.round (elem.slotYPosition / this._cell_height);

      count = 0;
      for (l in this._data[i].values)
      {
        if (count == index)
        {
          this._selected_keys.push (l);
          this._selected_values.push (this._data[i].values[l]);
          break;
        }
        
        count++;
      }
    }

    this._current_values =
      { 'keys': this._selected_keys, 'values': this._selected_values };
    return this._current_values;
  },

  /**
   * Scroll a given slot to a set value
   *
   * @name vs.ui.Picker#scrollToValue
   * @function
   *
   * @param {number} slot the slot number (number starting from 0)
   * @param {string} value the value to set
   * @return {boolean} returns true if the value was set. False otherwise.
   */
  scrollToValue: function (slot, value)
  {
    var yPos, count, i, elem = this._slots_elements[slot],
      slot_data = this._data[slot];

    if (!elem) { return false; }
    if (!slot_data) { return false; }
    
    elem.removeEventListener (vs.TRANSITION_END, this, false);
    elem.style.setProperty (vs.TRANSITION_DURATION, '0');
    
    count = 0;
    for (i in slot_data.values)
    {
      if (i == value)
      {
        yPos = count * this._cell_height;
        this._setPosition (slot, yPos);
        return true;
      }
      
      count -= 1;
    }
    return false
  },
  
  /*****************************************************************
   *              private general methodes
   ****************************************************************/

  /**
   * Rolling slots
   *
   * @private
   * @function
   */
  _setPosition: function (slot, pos)
  {
    delete (this._current_values);
    var elem = this._slots_elements [slot];
    elem.slotYPosition = pos;

    if (SUPPORT_3D_TRANSFORM)
      setElementTransform (elem, 'translate3d(0,' + pos + 'px,0)');
    else
      setElementTransform (elem, 'translate(0,' + pos + 'px)');
  },
  
  /**
   * Rolling slots
   *
   * @private
   * @function
   */
  _scrollTo: function (slotNum, dest, runtime)
  {
    var slot_elem = this._slots_elements[slotNum], slotMaxScroll;
    slot_elem.style.setProperty (vs.TRANSITION_DURATION, runtime ? runtime + 'ms': '100ms');
    this._setPosition (slotNum, dest ? dest : 0);

    slotMaxScroll = this.getSlotMaxScroll (slot_elem);
    
    // If we are outside of the boundaries go back to the sheepfold
    if (slot_elem.slotYPosition > 0 ||
        slot_elem.slotYPosition < slotMaxScroll)
    {
      slot_elem.addEventListener (vs.TRANSITION_END, this, false);
    }
    else
    {
      if (this._delegate && this._delegate.pickerViewSelectRow)
      {
        this._delegate.pickerViewSelectRow (this);
      }
      this.propagate ('change', this._getSelectedValues ());
      this.propertyChange ();
    }
  },
  
  /*****************************************************************
   *              Events managements
   ****************************************************************/

  /**
   * Main event handler
   *
   * @private
   * @function
   */
  handleEvent: function (e)
  {
    if (this._mode === Picker.MODE_ANDROID)
    {
      this._buttonSelected (e);
    }
    else switch (e.type)
    {
      case core.POINTER_START:
        this._scrollStart (e);
       break;

      case core.POINTER_MOVE:
        this._scrollMove (e);
       console.log (e);
      break;

      case core.POINTER_END:
        this._scrollEnd (e);
      break;

      case vs.TRANSITION_END:
        this._backWithinBoundaries (e);
      break;
    }
  },

  /**
   * @protected
   * @function
   */
  _scrollStart: function (e)
  {
    e.preventDefault ();
    e.stopPropagation ();
    
    var point = core.EVENT_SUPPORT_TOUCH ? e.targetTouches[0]: e;
    this._active_slot = undefined;

    var css = this._getComputedStyle (this._frame_view);
    this._frame_border_width = css ? parseInt (css.getPropertyValue ('border-left-width')) : 0;

    switch (this._mode)
    {
      case Picker.MODE_IOS:
      case Picker.MODE_SYMBIAN:
      case Picker.MODE_BLACK_BERRY:
        var delta = 0;
        // Find the clicked slot
        var rec = util.getBoundingClientRect (this._slots_view);
        if (this._mode == Picker.MODE_BLACK_BERRY) { delta = 8; }
        
        // Clicked position
        var xPos = point.clientX - rec.left - this._frame_border_width - delta; 
        
        // Find tapped slot
        var slot = 0;
        for (var i = 0; i < this._slots_elements.length; i++)
        {
          slot += this._slots_elements[i].offsetWidth;
          
          if (xPos < slot)
          {
            this._active_slot = i;
            break;
          }
        }
      break;

      case Picker.MODE_WP7:
        this._active_slot = e.currentTarget.index;
        util.addClassName ("dragging");
      break;
    }
    
    if (typeof this._active_slot === "undefined")
    { return; }

    // If slot is readonly do nothing
    if (this._data[this._active_slot].style.match('readonly'))
    {
      document.removeEventListener (core.POINTER_MOVE, this, true);
      document.removeEventListener (core.POINTER_END, this, true);
      return false;
    }
    
    var slot_elem = this._slots_elements[this._active_slot];
    
    slot_elem.slotMaxScroll = this.getSlotMaxScroll (slot_elem);

    slot_elem.removeEventListener (vs.TRANSITION_END, this, false);  // Remove transition event (if any)
    slot_elem.style.setProperty (vs.TRANSITION_DURATION, '0');   // Remove any residual transition
    
    // Stop and hold slot position
    if (SUPPORT_3D_TRANSFORM)
    {
      var theTransform = getElementTransform (slot_elem);
      theTransform = new vs.CSSMatrix(theTransform).m42;
      if (theTransform != slot_elem.slotYPosition)
      {
        this._setPosition (this._active_slot, theTransform);
      }
    }
    
    this.startY = point.clientY;
    this.scrollStartY = slot_elem.slotYPosition;
    this.scrollStartTime = e.timeStamp;

    document.addEventListener (core.POINTER_MOVE, this, true);
    document.addEventListener (core.POINTER_END, this, true);
    
    switch (this._mode)
    {
      case Picker.MODE_WP7:
      case Picker.MODE_BLACK_BERRY:
        if (this.__timer)
        {
          clearTimeout (this.__timer);
          this.__timer = 0;
        }
        
        if (this.__elem_to_hide && this.__elem_to_hide != slot_elem)
        {
          util.removeClassName (this.__elem_to_hide.parentElement, "visible");
          this.__elem_to_hide = null;
        }
        util.addClassName (slot_elem.parentElement, "visible");
      break;
    }    

    return true;
  },

  /**
   * @protected
   * @function
   */
  _scrollMove: function (e)
  {
    e.preventDefault ();
    e.stopPropagation ();

    var point = core.EVENT_SUPPORT_TOUCH ? e.targetTouches[0]: e;
    var topDelta = point.clientY - this.startY;
    var slot_elem = this._slots_elements[this._active_slot];

    if (slot_elem.slotYPosition > 0 ||
        slot_elem.slotYPosition < slot_elem.slotMaxScroll)
    {
      topDelta /= 2;
    }
    
    this._setPosition (this._active_slot, slot_elem.slotYPosition + topDelta);
    this.startY = point.clientY;

    // Prevent slingshot effect
    if (e.timeStamp - this.scrollStartTime > 80)
    {
      this.scrollStartY = slot_elem.slotYPosition;
      this.scrollStartTime = e.timeStamp;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scrollEnd: function (e)
  {
    document.removeEventListener(core.POINTER_MOVE, this, true);
    document.removeEventListener(core.POINTER_END, this, true);
    
    var elem = this._slots_elements[this._active_slot], scrollDist,
      scrollDur, newDur, newPos, self = this;
    if (!elem) { return; }

    switch (this._mode)
    {
//      case Picker.MODE_BLACK_BERRY:
//        this.__elem_to_hide = elem;
//      break;
  
      case Picker.MODE_BLACK_BERRY:
      case Picker.MODE_WP7:
        if (elem.parentElement)
        {
          this.__elem_to_hide = elem;
          this.__timer = setTimeout (function ()
          {
            util.removeClassName (self.__elem_to_hide.parentElement, "visible");
            self.__elem_to_hide = null;
            self.removeClassName ("dragging");
          }, 1000);
        }
      break;
    }    

    // If we are outside of the boundaries, let's go back to the sheepfold
    if (elem.slotYPosition > 0 || elem.slotYPosition < elem.slotMaxScroll)
    {
      this._scrollTo 
        (this._active_slot, elem.slotYPosition > 0 ? 0 : elem.slotMaxScroll);
      return false;
    }

    // Lame formula to calculate a fake deceleration
    scrollDist = elem.slotYPosition - this.scrollStartY;

    // The drag session was too short
    if (scrollDist < this._cell_height / 1.5 && 
        scrollDist > -this._cell_height / 1.5)
    {
      if (elem.slotYPosition % this._cell_height)
      {
        this._scrollTo 
          (this._active_slot,
          Math.round(elem.slotYPosition / this._cell_height) * this._cell_height, 100);
      }

      return false;
    }

    scrollDur = e.timeStamp - this.scrollStartTime;

    newDur = (2 * scrollDist / scrollDur) / this._friction;
    scrollDist = (this._friction / 2) * (newDur * newDur);
    
    if (newDur < 0)
    {
      newDur = -newDur;
      scrollDist = -scrollDist;
    }

    newPos = elem.slotYPosition + scrollDist;
 
    if (newPos > 0)
    {
      // Prevent the slot to be dragged outside the visible area (top margin)
      newPos /= 2;
      newDur /= 3;

      if (newPos > this.view.clientHeight / 4)
      {
        newPos = this.view.clientHeight / 4;
      }
    }
    else if (newPos < elem.slotMaxScroll)
    {
      // Prevent the slot to be dragged outside the visible area (bottom margin)
      newPos = (newPos - elem.slotMaxScroll) / 2 + elem.slotMaxScroll;
      newDur /= 3;
      
      if (newPos < elem.slotMaxScroll - this.view.clientHeight / 4)
      {
        newPos = elem.slotMaxScroll - this.view.clientHeight / 4;
      }
    }
    else
    {
      newPos = Math.round (newPos / this._cell_height) * this._cell_height;
    }

    this._scrollTo
      (this._active_slot, Math.round (newPos), Math.round (newDur));
 
    return true;
  },

  /**
   * @protected
   * @function
   */
  getSlotMaxScroll : function (ul)
  {
    switch (this._mode)
    {
      case Picker.MODE_IOS:
        return this.view.clientHeight - ul.clientHeight - 86;
      break;
      
      case Picker.MODE_SYMBIAN:
        return this.view.clientHeight - ul.clientHeight - 80;
      break;
      
      case Picker.MODE_BLACK_BERRY:
        return this.view.clientHeight - ul.clientHeight - 93;
      break;
      
      case Picker.MODE_WP7:
        return this.view.clientHeight - ul.clientHeight - 103;
      break;
      
      case Picker.MODE_ANDROID:
        return this.view.clientHeight - ul.clientHeight - 121;
      break;
    }
    
    return 0;
  },
  
  /**
   * @protected
   * @function
   */
  _backWithinBoundaries: function (e)
  {
    var elem = e.target;
    elem.removeEventListener (vs.TRANSITION_END, this, false);
    
    slotMaxScroll = this.getSlotMaxScroll (elem);

    this._scrollTo (elem.slotPosition, elem.slotYPosition > 0 ? 0 : slotMaxScroll, 150);
    
    return false;
  }
};
util.extendClass (Picker, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Picker, {
  'delegate': {
    /** 
     * Set the delegate.
     * It should implements following methods
     *  <ul>
     *    <li/>pickerViewSelectRow : function (vs.ui.Picker the view)
     *  </ul>
     * @name vs.ui.Picker#delegate 
     * @type {Object}
     */ 
    set : function (v)
    {
      this._delegate = v;
    }
  },
  
  'data': {
    /** 
     * Sets the Picker datas
     * 
     * Data is a array of object <values, type, default_value>:
     * <ul>
     * <li/>Values is in the form of: < key: value >. Keys are the identifiers
     * that won’t be shown in the picker.<br/>
     *
     * <li/>Styles is a list of space separated predefined styles to be applied
     * to the slot. The available values are:
     * <ul>
     *  <li />right, align text inside the slot to the right;
     *  <li />readonly, the slot can’t be spun;
     *  <li />shrink, shrink the slot width to the minimum possible.
     * </ul>
     * 
     * <li/>Default value, a value include in values field
     * </ul>
     *
     * @example
     *  var sizePicker = new vs.ui.Picker ();
     *  
     *  sizePicker.data = [
     *     {values: vs.ui.Picker.NUMBERS, style: 'right shrink'},
     *     {values: vs.ui.Picker.NUMBERS, style: 'right shrink'},
     *     {values: vs.ui.Picker.NUMBERS, style: 'right shrink'}];
     * 
     * @name vs.ui.Picker#data 
     * @type {boolean|number}
     */ 
    set : function (v)
    {
      var data, values, style, defaultValue, i;
      if (!util.isArray (v))
      { return; }
      
      this.removeAllSlots ();
      
      for (i = 0; i < v.length; i++)
      {
        data = v [i];
        values = data.values
        style = data.style
        defaultValue = data.defaultValue
        
        if (!values) { continue; }
        
        this.addSlot (values, style, defaultValue);
      }
    }
  },
  
  'selectedKeys': {
    /** 
     * Get the selected slot keys
     * @name vs.ui.Picker#selectedKeys 
     * @type {Array}
     */ 
    get : function ()
    {
      if (!this._current_values)
      {
        this.getSelectedValues ();
      }
      return this._selected_keys;
    }
  },
  
  'selectedValues': {
    /** 
     * Get the selected slot values
     * @name vs.ui.Picker#selectedValues 
     * @type {Array}
     */ 
    get : function ()
    {
      if (!this._current_values)
      {
        this.getSelectedValues ();
      }
      return this._selected_values;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Picker = Picker;
