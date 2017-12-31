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

import vs_core from 'vs_core';
import {
  isNumber, isString, isFunction,
  free, clone,
  extendClass, defineClassProperties
} from 'vs_utils';

/**
 *  The Generic vs.fx.Controller class
 *
 *  @see vs.fx.SwipeController
 *  @see vs.fx.CardController
 *  @see vs.fx.NavigationController
 *  @extends vs.core.EventSource
 *
 *  @class
 *  This class can be used to implement your custom GUI controller.
 *  <p/>
 *  Before developing your own controller you can try the SwipeController
 *  or the NavigationController witch match most situations.
 *
 *  <p>
 *  Delegate:
 *  <ul>
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller),
 *         Called when the view changed
 *    <li/>controllerAnimationDidEnd : function (from vs.ui.View, to vs.ui.View, controller), Called just after 
 *         the animation ended
 *  </ul>
 *  <p>
 *  Example:
 *  <pre class="code">
 * 
 *   // 1 create and init the controller
 *   this.controller = new vs.fx.Controller (this);
 *   this.controller.init ();
 *   
 *   // 2.1 put a first view into the controller
 *   this.controller.add (this.firstView);
 *   // 2.2 set the first view as the initial view
 *   this.controller.initialComponent = this.firstView.id;
 *  
 *   // 3.1 create, configure and put the second view into the controller
 *   var comp = this.createAndAddComponent ('PanelOne');
 *   comp.position = [0, 44];
 *   comp.translation = [320, 0];
 *   this.controller.add (comp);
 *   
 *   // 3.2 declare transitions (with animations) between states
 *   // translateOutLeft is play on firstView when we leave the firstView
 *   // translateInRight is play on comp when we enter into comp
 *   this.controller.addTransition (this.firstView.id, comp.id, 'goToOne',
 *                                  translateOutLeft, translateInRight);
 *   this.controller.addTransition (comp.id, this.firstView.id, 'back',
 *                                  translateOutRight, translateInLeft);
 *  
 *   // 4 create, configure and put the third view into the controller
 *   comp = this.createAndAddComponent ('PanelTwo');
 *   comp.position = [0, 44];
 *   comp.translation = [320, 0];
 *   this.controller.add (comp);
 *   
 *   this.controller.addTransition (this.firstView.id, comp.id, 'goToTwo',
 *                                  translateOutLeft, translateInRight);
 *   this.controller.addTransition (comp.id, this.firstView.id, 'back',
 *                                  translateOutRight, translateInLeft);
 *  
 *   // 5 create, configure and put the fourth view into the controller
 *   var comp = this.createAndAddComponent ('PanelThree');
 *   comp.position = [0, 44];
 *   comp.translation = [320, 0];
 *   this.controller.add (comp);
 *   
 *   this.controller.addTransition (this.firstView.id, comp.id, 'goToThree',
 *                                  translateOutLeft, translateInRight);
 *   this.controller.addTransition (comp.id, this.firstView.id, 'back',
 *                                  translateOutRight, translateInLeft);
 *  
 *  </pre>
 *  @author David Thevenin
 * @name vs.fx.Controller
 *
 *  @constructor
 *   Creates a new vs.fx.Controller.
 *
 * @param {vs.ui.View} owner the View using this controller [mandatory]
 */
function Controller (owner)
{
  this.parent = vs_core.EventSource;
  this.parent ();
  this.constructor = Controller;

  if (owner)
  {
    this._fsm = new vs_core.Fsm (this);
  
    // fsm goTo surcharge
    this._fsm.goTo = this.goTo;
    this._owner = owner;
  }
}

Controller.prototype = {

   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

   /**
   * @protected
   * @type {Object}
   */
  _owner: null,

   /**
   * @protected
   * @type {vs.core.Fsm}
   */
  _fsm: null,

   /**
   * @protected
   * @type {String}
   */
  _initial_component: null,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this._owner)
    {
      this._owner.__controller__ = undefined;
      
      this._owner.remove = this._owner._ab_controller_remove;
      this._owner._ab_controller_remove = undefined;
    }
    
    this._delegate = undefined;

    free (this._fsm);
    vs_core.EventSource.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    vs_core.EventSource.prototype.initComponent.call (this);

    if (this._fsm) this._fsm.init ();
    
    if (!this._owner)
    {
      console.error ("Invalid vs.fx.Controller, owner is null vs.fx.Controller.id = '" + this._id + "'");
      return;
    }
    if (this._owner.__controller__)
    {
      console.error ("The owner already use a controller");
      return;
    }
    this._owner.__controller__ = this;
    
    this._owner._ab_controller_remove = this._owner.remove;
    this._owner.remove = this.ab_controller_remove;
  },
  

/*********************************************************
 *                 behavior update
 *********************************************************/
  
  /**
   * @protected
   * @function
   */
  ab_controller_remove : function (child)
  {
    if (!child) { return; }
    
    state = this.__controller__._fsm._list_of_state [child.id];
    if (state)
    {
      this.__controller__.remove (child);
    }
    else
    {
      this._ab_controller_remove (child);
    }
    // XXX should remove the component from the FSM etc...
  },

/*********************************************************
 *                  State Management
 *********************************************************/
 
  /**
   *  Return true if the state already exists
   *
   * @name vs.fx.Controller#isStateExit
   * @function
   * 
   * @return boolean
   */
  isStateExit : function (id)
  {
    if (!this._fsm) return false;
    
    if (this._fsm._list_of_state [id])
    { return true; }
    
    return false;
  },
 
  /**
   * @private
   * @function
   * @deprecated
   */
  add : function (comp, data, extension, bindings)
  {
    console.warn ('vs.fx.Controller.add is deprecated. Use vs.fx.Controller.push'); 
    return this.push (comp, data, extension, bindings);
  },

  /**
   *  Add the a child component to the Controller Manager
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  The component instantiation is a lazy algorithm. The component will
   *  be instantiated and add into the DOM tree only when it has to be show
   *  to the user.
   *  <p>
   *  @example
   *  var myComp = new MyComp (conf);
   *  myComp.layer = new vs.fx.Controller (myComp);
   *  myComp.layer.push ('AComponent1', data1);
   *  myComp.layer.push ('AComponent1', data2);
   *  myComp.layer.push ('AComponent2', data3);
   *
   * @name vs.fx.Controller#push
   * @function
   *
   * @param {String | vs.ui.View} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} config Configuration structure need to build the 
   *     component [optional]
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, extension, bindings)
  {
    if (!comp || !this._fsm) { return; }
    if (!data) { data = {}; }
    
    var state_id = null, binding, i, state;
    if (isString (comp) && data.id)
    { state_id = data.id; }
    else if (!isString (comp) && comp.id)
    { state_id = comp.id; }
    else { state_id = vs_core.createId (); }
    
    if (this.isStateExit (state_id))
    { return; }
    
    this._fsm.addState (state_id);
    state = this._fsm._list_of_state [state_id];
    state.bindings = {};
    
    if (bindings && bindings.length)
    {
      for (i = 0; i < bindings.length; i++)
      {
        binding = bindings [i];
        if (!binding || binding.length !== 3)
        {
          console.warn ('vs.fx.Controller.push: invalid binding information');
          continue;
        }
        this.componentBind (state_id, binding[0], binding[1], binding[2]);
      }
    }
    
    this.setStateComponentInformation (state_id, comp, extension, data);
    
    return state_id;
  },

  /**
   *  Remove a child component to the Slider Manager
   *  <p>
   *  The component can be specified as an Object or an id.
   *  <p>
   *  @example
   *  layer.remove (myComp);
   *  layer.remove (myComp.id);
   *
   * @name vs.fx.Controller#remove
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component id
   */
  remove : function (comp)
  {
    if (!comp || !this._owner || !this._fsm) { return; }
    
    var state_id = null;
    if (isString (comp))
    { state_id = comp; }
    else if (!isString (comp))
    { state_id = comp.id; }
    
    var state = this._fsm._list_of_state [state_id];
    if (state && state.comp)
    {
      this._owner._ab_controller_remove (state.comp);
    }
    this._fsm.removeState (state_id);
  },

  /**
   * Set the component associated to a state
   *
   * @name vs.fx.Controller#setStateComponentInformation
   * @function
   *
   * @private
   * @param {String} state_id the state's name 
   * @param {{String | vs.ui.View}} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} init_data Optional data for the component 
   *                   constructor [optional]
   */
  setStateComponentInformation : function (state_id, comp, extension, init_data)
  {
    if (!state_id || !this._fsm || !this._fsm.existState (state_id)) { return; }
    if (!comp || !this._owner) { return; }
    
    if (!init_data) { init_data = {}; }
    else { init_data = clone (init_data); }
    
    var state = this._fsm._list_of_state [state_id];
    state.init_data = init_data;
    
    if (isString (comp))
    {
      state.comp_name = comp;
      state.comp = undefined;
    }
    else
    {
      state.comp_name = "";
      state.comp = comp;
      if (!this._owner.isChild (comp))
      {
        this._owner.add (comp, extension);
      }
    }
  },

/*********************************************************
 *                  Animation setting
 *********************************************************/

  /**
   *   Add a new transition from the view "from" to the view "to".
   *
   * @name vs.fx.Controller#addTransition
   * @function
   *
   * @param {String} from State from (component id)
   * @param {String} to State to (component id)
   * @param {String} on the input event name which cause the crossing of 
   *      transition
   * @param {vs.fx.Animation} animation_out the animation when exit from the
   *         state from. [optional]
   * @param {vs.fx.Animation} animation_in the animation when enter in the
   *         state to. [optional]
   */
  addTransition : function (from, to, on, animation_out, animation_in)
  {
    var key, t;
        
    if (!from || !this._fsm || !this._fsm.existState (from)) { return; }
    if (!to || !this._fsm.existState (to)) { return; }
    if (!on) { return; }
    
    if (!this._fsm.existInput (on))
    {
      this._fsm.addInput (on);
    }
    
    this._fsm.addTransition (from, to, on);

    for (key in this._fsm._list_of_state [from].transitionEvents)
    {
      t = this._fsm._list_of_state [from].transitionEvents [key];
      if (t.to !== to) { continue; }
      
      t.animation_out = animation_out;
      t.animation_in = animation_in;
    }
  },
  
  /**
   *  @private
   */
  _animateComponents :
    function (fromComp, toComp, animationOut, animationIn, animation_clb, instant)
  {
    var self = this, callback = function ()
    {
      try
      {
        if (animation_clb)
        {
          animation_clb.call (self._owner);
        }
        if (self._delegate && self._delegate.animationDidEnd)
        {
          console.warn ("animationDidEnd is deprecated. Please use 'controllerAnimationDidEnd'.");
          self._delegate.animationDidEnd (self);
        }
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
      }
      catch (e) {
        if (e.stack) console.log (e.stack);
        console.error (e); 
      }
    },
    runAnimation = function ()
    {
      try
      {
        toComp.show ();
        if (!animationIn && !animationOut)
        {
          callback.call (self);
          return;
        }
        if (instant)
        {
          if (animationIn)
          {
            var inDurations = animationIn.durations;
            animationIn.durations = '0s';
          }
          if (animationOut)
          {
            var outDurations = animationOut.durations;
            animationOut.durations = '0s';
          }
        }
        if (animationIn && !animationOut)
        {
          animationIn.process (toComp, callback, self);
        }
        else if (!animationIn && animationOut)
        {
          animationOut.process (fromComp, callback, self);
        }
        else
        {
          if (animationIn) animationIn.process (toComp, callback, self);
          if (animationOut) animationOut.process (fromComp); 
        }
        if (instant)
        {
          if (animationIn) animationIn.durations = inDurations;
          if (animationOut) animationOut.durations = outDurations;
        }
      }
      catch (e) {
        if (e.stack) console.log (e.stack);
        console.error (e);
      }
    };
    vs.scheduleAction (function () {runAnimation ();});
  },


/*********************************************************
 *                 Component Event management
 *********************************************************/
 
  /**
   *  The event bind method to listen events
   *  <p>
   *  When you want listen an event generated by a component, you can
   *  bind your object (the observer) to this object using 'componentBind' 
   *  method.
   *
   * @name vs.fx.Controller#componentBind
   * @function
   *
   * @param {string} comp_id the component id [mandatory]
   * @param {string} spec the event specification [mandatory]
   * @param {vs.core.Object} obj the object interested to catch the event [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   */
  componentBind: function (comp_id, event, obj, func)
  {
    if (!this._fsm) return;
    
    var state = this._fsm._list_of_state [comp_id], a;
    
    if (!state) { return; }
    
    a = state.bindings [event];
    if (!a)
    {
      a = [];
      state.bindings [event] = a;
    }
    
    a.push ([obj, func]);
    if (comp_id === this._current_state)
    {
      state.comp.bind (event, obj, func);
    }
  },
  
  /**
   * @protected
   * @function
   */
  refresh: function ()
  {},

/*********************************************************
 *                 FSM management
 *********************************************************/
 
  /**
   * returns the currents state_id which is the current visible
   * component id.
   *
   * @name vs.fx.Controller#getCurrentState
   * @function
   *
   * @return {string} the current state id
   */
  getCurrentState : function ()
  {
    if (!this._fsm) return;
    
    return this._fsm._current_state;
  },
 
  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
  },

  /**
   * @protected
   * @function
   */
  _beforeStateEnter : function (state, data)
  {
    if (!state || !(state.comp_name || state.comp)) { return; }
    
    var spec, events, i, key, e, new_data;
  
    ////////////////////////////////////////////////////
    // 1) build the component if its need
    if (!state.comp)
    {
      state.comp = this._owner.createAndAddComponent
        (state.comp_name, state.init_data, state.extension);
        
      state.comp.configure (state.init_data);
      if (state.comp && state.comp.propertiesDidChange) 
      { 
        state.comp.propertiesDidChange ();
      }
      state.comp.propertyChange ();
      this.configureNewComponent (state.comp);
    }
    
    ////////////////////////////////////////////////////
    // 2) data adaptation and init
    new_data = data;
    // 2.1) data adaptation
    if (state.data_adaptation_func)
    {
      new_data = state.data_adaptation_func (data);
    }
    // 2.2) component data init
    if (new_data)
    {
      // 2.2.1) set data
      for (key in new_data)
      {
        if (!state.comp.__lookupSetter__ (key) &&
            !state.comp.hasOwnProperty (key))
        {
          continue;
        }
        state.comp [key] = new_data [key];
      }
      
      // 2.2.1) dataflow propagation
      state.comp.propertyChange ();
    }
    
    ////////////////////////////////////////////////////
    // 3) events binding
    for (spec in state.bindings)
    {
      events = state.bindings [spec];
      if (!events) { continue; }
      
      for (i = 0; i < events.length; i ++)
      {
        e = events [i];
        if (!e) { continue; }
        if (e[1]) { state.comp.bind (spec, e[0], e[1]); }
        else { state.comp.bind (spec, e[0]); }
      }
    }
  },

  /**
   * @protected
   * @function
   */
  _beforeStateExit : function (state)
  {
    if (!state || !state.comp) { return; }
    
    var spec, events, i, e;
      
    ////////////////////////////////////////////////////
    // 1) events unbinding
    for (spec in state.bindings)
    {
      events = state.bindings [spec];
      if (!events) { continue; }
      
      for (i = 0; i < events.length; i ++)
      {
        e = events [i];
        if (!e) { continue; }
        if (e[1]) { state.comp.unbind (spec, e[0], e[1]); }
        else { state.comp.bind (spec, e[0]); }
      }
    }
  },

  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.fx.Controller#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   * @param {Boolean} instant make the transition visualy instantly [Optional]
   * @return {Boolean} is the transition was reached or not
   */
  goTo : function (state_id, output, event, instant)
  {
    // manage output
    // TODO WARNING
    var state_from, state_to, transition = null;
    
    if (!state_id || !this._list_of_state [state_id])
    {
      console.warn ("vs.fx.Controller.goTo unknown State id:" + state_id);
      return false;
    }

    // hide old states view
    if (this._current_state)
    {
      if (event)
      {
        transition =
          this._list_of_state [this._current_state].transitionEvents [event.on];
      }
      state_from = this._list_of_state [this._current_state];
      this.owner._beforeStateExit (state_from);
    }
    
    ///
    this._current_state = state_id;
    
    // show new states view
    state_to = this._list_of_state [this._current_state];
    this.owner._beforeStateEnter (state_to, event?event.data:null);
    
    if (state_from && state_from.comp && state_from.comp.viewWillDisappear)
    {
      state_from.comp.viewWillDisappear ();
    }
    if (state_to.comp.viewWillAppear)
    {
      state_to.comp.viewWillAppear ();
    }
    
    if (transition)
    {
      this.owner._animateComponents (
        state_from.comp, state_to.comp,
        transition.animation_out, transition.animation_in,
        null, instant);
    }
    else
    {
      state_to.comp.show ();
    }
    
    if (this.owner._delegate && this.owner._delegate.controllerViewWillChange)
    {
      if (state_from)
      {
        this.owner._delegate.controllerViewWillChange
          (state_from.comp, state_to.comp, this.owner);
      }
      else
      {
        this.owner._delegate.controllerViewWillChange
          (null, state_to.comp, this.owner);
      }
    }

    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (isFunction (clb))
      {
        clb.call (this._owner, event);
      }
      else if (isString (clb))
      {
        this._owner [this._output_action [output]] (event);
      }
    }
    
    return true;
  },

  /**
   * @protected
   * @function
   */
  notify : function (event, instant)
  {
    if (!this._fsm || !event || !event.type) { return; }
    this._fsm.fsmNotify (event.type, event.data, instant);
  },

/*********************************************************
 *                  Controller clear
 *********************************************************/

  /**
   * Clear the vs.fx.Controller.
   * All state, event and binding are deleted
   *
   * @name vs.fx.Controller#clear
   * @function
   */
  clear : function ()
  {
    if (!this._fsm) return;
    
    this._fsm.clear ();
  }
};
extendClass(Controller, vs_core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

defineClassProperties (Controller, {
  'initialComponent': {
    /*****************************************************************
     *     Properties declaration
     ****************************************************************/
  
    /**
     * Define the initiale component
     * Generate a exception if the component was not already registered
     *
     * @name vs.fx.Controller#initialComponent 
     * @param {string} state_id the state
     */
    set : function (comp_id)
    {
      if (!this._fsm || !comp_id)
      {
        this._initial_component = undefined;
        return;
      }
     
      if (!this._fsm.existState (comp_id)) { return; }
  
      // set initial state and go to it   
      this._initial_component = comp_id;
      this._fsm.initialState = comp_id;
      
      this._fsm.goTo (comp_id);
    },
    
    /**
     * @ignore
     */
    get : function ()
    {
      return this._initial_component;
    }
  },
  'delegate': {
  
    /** 
     * Set the delegate.
     * It should implements following methods
     * <ul>
     *   <li/>controllerViewWillChange :function
     *           (from vs.ui.View, to vs.ui.View, controller),
     *           Called when the view changed
     *   <li/>controllerAnimationDidEnd : function
     *           (from vs.ui.View, to vs.ui.View, controller), Called just after 
     *         the animation ended
     * </ul>
     *
     * @name vs.fx.Controller#delegate 
     * @type {Object}
     */ 
    set : function (v)
    {
      this._delegate = v;
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default Controller;
