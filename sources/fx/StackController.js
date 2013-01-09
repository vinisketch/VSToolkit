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
 *  The vs.fx.StackController class <br />
 * 
 *  @see vs.fx.SlideController
 *  @see vs.fx.CardController
 *
 *  @extends vs.fx.Controller
 *  @class
 *  The vs.fx.StackController class <br />
 *  This an abstract layer controller and it should no be instanciated.
 *  Use {@link vs.fx.SliderController} or {@link vs.fx.CardController} layers.
 *  @abstract
 * 
 *  @author David Thevenin
 * @name vs.fx.StackController
 *
 *  @constructor
 *   Creates a new vs.fx.StackController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.fx.View will be inserted. 
 *     ['children' by default]
 */
function StackController (owner)
{
  this.parent = Controller;
  this.parent (owner);
  this.constructor = StackController;
  
  if (!arguments.length) return;

  this._fsm.addInput (StackController.NEXT);
  this._fsm.addInput (StackController.PRED);
  this._fsm.addInput (StackController.FIRST);

  this._states_array = new Array ();
}

/**
 * The duration of the animation between two views
 * @name vs.fx.StackController.ANIMATION_DURATION
 */
StackController.ANIMATION_DURATION = 350;

/**
 * @private
 * @name vs.fx.StackController.NEXT
 * @const
 */
StackController.NEXT = 'next';

/**
 * @private
 * @name vs.fx.StackController.PRED
 * @const
 */
StackController.PRED = 'pred';

/**
 * @private
 * @name vs.fx.StackController.FIRST
 * @const
 */
StackController.FIRST = 'first';

StackController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/

  /**
   * @protected
   * @function
   */
  _is_tactile : false,

  /**
   * @protected
   * @function
   */
  _owner_handler_event_extended : false,

  /**
   * @protected
   * @function
   */
  _owner_handler_event : null,

  /**
   * @protected
   * @function
   */
  _animation_duration: StackController.ANIMATION_DURATION, 
  
  /**
   * @protected
   * @function
   */
  _last_comp_id : null,
  
  /**
   * @protected
   * @function
   */
  _states_array : null,
  
  /**
   * @protected
   * @type {number}
   */
  __nb_panels : 0,

  /**
   *
   * @protected
   * @type {Array}
   */
  _view_size: null,
  
/********************************************************************

********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    delete (this._states_array);
    
    Controller.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    Controller.prototype.initComponent.call (this);
    
    this.isTactile = this._is_tactile;
    this._updateViewSize ();
  },
  

/********************************************************************

********************************************************************/

  /**
   *  Add a child component to the Slider Manager
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  The component instantiation is a lazy algorithm. The component will
   *  be instantiated and add into the DOM tree only when it has to be show
   *  to the user.
   *  <p>
   *  @example
   *  var myController = new vs.fx.StackController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.StackController#push
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the component.
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, extension, bindings)
  {
    if (!comp) { return; }
    if (!data) { data = {}; }
    
    var state_id = Controller.prototype.push.call
      (this, comp, data, extension, bindings);
    if (!state_id) { return; }
    
    this._states_array.push (state_id);
    this.__nb_panels ++; 

    // first item
    if (this.__nb_panels === 1)
    {
      this.initialComponent = state_id;
      this._last_comp_id = state_id;

      return state_id;
    }
    
    this.addTransition (this._last_comp_id, state_id, StackController.NEXT);
    this.addTransition (state_id, this._last_comp_id, StackController.PRED);
    this.addTransition 
      (state_id, this._initial_component, StackController.FIRST);
    
    // create the second view 
    if (this._last_comp_id === this._initial_state)
    {
      state = this._fsm._list_of_state [state_id];
      if (!state)
      {
        console.error ("Unknown error in vs.fx.StackController.push");
        return;
      }
      if (!state.comp)
      {
        state.comp = this._owner.createAndAddComponent
          (state.comp_name, state.init_data, extension);
          
        state.comp.configure (state.init_data);
        state.comp.setStyle ('position', 'absolute');
        if (state.comp && state.comp.propertiesDidChange) 
        { 
          state.comp.propertiesDidChange ();
        }
        state.comp.propertyChange ();
      }
      
      state.comp.show ();
    }
    
    this._last_comp_id = state_id;
    return state_id;
  },
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {},

  /**
   *  Remove a child component to the Slider Manager
   *  <p>
   *  The component can be specified as an Object or an id.
   *  <p>
   *  @example
   *  myComp.layer.remove (myComp);
   *  myComp.layer.remove (myComp.id);
   *
   * @name vs.fx.StackController#remove
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component id
   */
  remove : function (comp)
  {
    if (!comp) { return; }
    
    var state_id = null;
    if (util.isString (comp))
    { state_id = comp; }
    else if (!util.isString (comp))
    { state_id = comp.id; }
    
    var pos = this._states_array.findItem (state_id);
    if (pos === -1) { return; }
    
    this._fsm.removeTransitionTo (state_id, StackController.NEXT);
    this._fsm.removeTransitionFrom (state_id, StackController.PRED);
    this._fsm.removeTransitionFrom (state_id, StackController.FIRST);

    this._states_array.remove (pos);

    this.__nb_panels --; 
    var state = this._fsm._list_of_state [state_id];
    
    if (pos === 0 && this.__nb_panels > 0)
    {
      this._initial_component = this._states_array [0];
      
      // re configure all to FIRST transition
      for (var state_id_temp in this._states_array)
      {
        if (state_id_temp === state_id) { continue; }
        if (state_id_temp === this._initial_component) { continue; }

        this._fsm.removeTransitionFrom (state_id_temp, StackController.FIRST);
        this.addTransition
          (state_id_temp, this._initial_component, StackController.FIRST);
      }
    }
    if (this.__nb_panels === 0)
    {
      this._initial_component = undefined;
      this._fsm._current_state = undefined;
    }
    
    if (this._initial_component)
    {
      if (this._fsm._current_state === state_id)
      {
        if (pos === 0)
        {
          this._fsm.goTo (this._initial_component);
        }
        else
        {
          if (pos === this._states_array.length) { pos --; }
          this._fsm.goTo (this._states_array [pos]);
        }
      }
      else
      {
        this._fsm.goTo (this._fsm._current_state);
      }
    }
    Controller.prototype.remove.call (this, comp);
  },

  /**
   * @protected
   * @function
   *
   * @param {number} orientation = {0, 180, -90, 90}
   */
  orientationDidChange: function (orientation)
  { 
    this._updateViewSize ();
  },

/*********************************************************
 *                  Event management
 *********************************************************/
  
  /**
   * Go to the view specified by its id if it exist.
   *
   * @name vs.fx.StackController#goToViewId
   * @function
   * 
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToViewId : function (id, instant)
  {
    var pos = this._states_array.findItem (id);
    if (pos === -1) { return false; }
    
    this.goToViewAt (pos, instant);
  },

  /**
   *  Go to the view specified by its position (index start at 0)
   *
   * @name vs.fx.StackController#goToViewAt
   * @function
   *
   * @param {number} index The component index
   */
  goToViewAt : function (pos, instant)
  {
    if (pos < 0) { return false; }
    if (pos > this._states_array.length) { return false; }
    
    var current_pos = this._states_array.findItem (this._fsm._current_state);
    if (current_pos === pos) { return true; }
    
    if (pos > current_pos)
    {
      while (current_pos < pos - 1)
      {
        this._fsm.fsmNotify (StackController.NEXT, null, true);
        current_pos ++;
      }
      return this._fsm.fsmNotify (StackController.NEXT, null, instant);
    }
    else
    {
      while (pos + 1 < current_pos )
      {
        this._fsm.fsmNotify (StackController.PRED, null, true);
        current_pos --;
      }
      return this._fsm.fsmNotify (StackController.PRED, null, instant);
    }
  },

  /**
   * Go to the next view if it exist.
   *
   * @name vs.fx.StackController#goToNextView
   * @function
   * 
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToNextView : function (instant)
  {
    return this._fsm.fsmNotify (StackController.NEXT, null, instant);
  },

  /**
   * Go to the previous view if it exist.
   *
   * @name vs.fx.StackController#goToPreviousView
   * @function
   * 
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToPreviousView : function (instant)
  {
    return this._fsm.fsmNotify (StackController.PRED, null, instant);
  },

  /**
   * Go to the first view
   *
   * @name vs.fx.StackController#goToFirstView
   * @function
   * 
   * @return true if the transition is possible
   */
  goToFirstView : function (instant)
  {
    return this._fsm.fsmNotify (StackController.FIRST, null, instant);
  },

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {}
};
util.extendClass (StackController, Controller);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (StackController, {

  'viewSize': {
   /** 
     * Getter|Setter for view size.
     * @name vs.fx.StackController#viewSize 
     *
     * @type {Array.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      
      if (!this._view_size)
      { this._view_size = []; }
      
      this._view_size [0] = v [0];
      this._view_size [1] = v [1];
      
      this._updateViewSize ();
    },
  
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (!this._view_size)
      {
        return this._owner.size;
      }
      return this._view_size.slice ();
    }
  },
  'isTactile': {
    /** 
     * Getter|Setter for the tab bar style
     * @name vs.fx.StackController#isTactile 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      {
        this._is_tactile = true;
        if (!this._owner || !this._owner.view) return;
  
        if (!this._owner_handler_event_extended)
        {
          this._owner.view.addEventListener (core.POINTER_START, this._owner, false);
          this._owner_handler_event = this._owner.handleEvent;
          this._owner.handleEvent = this.handleEvent;
        }
        this._owner_handler_event_extended = true;
      }
      else
      {
        this._is_tactile = false;
        if (!this._owner || !this._owner.view) return;
        
        if (this._owner_handler_event_extended)
        {
          this._owner.view.removeEventListener (core.POINTER_START, this._owner, false);
          this._owner.handleEvent = this._owner_handler_event;
          
          this._owner_handler_event_extended = false;
        }
      }
    },
  
    /** 
     * @ignore
     * @return {boolean}
     */ 
    get : function ()
    {
      return this._is_tactile;
    }
  },
  'animationDuration': {
    /** 
     * Set the animation/transition temporisation (in millisecond)
     * @name vs.fx.StackController#animationDuration 
     * @type {number}
     */ 
    set : function (time)
    {
      if (!time) { time = 0; }
      if (!util.isNumber (time)) { return };
      
      this._animation_duration = time;
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.StackController = StackController;
