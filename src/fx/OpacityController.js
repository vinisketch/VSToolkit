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
  extendClass, defineClassProperty
} from 'vs_utils';
import { OpacityAnimation } from 'vs_ui';

import StackController from './StackController';

/**
 *  The vs.fx.OpacityController class <br />
 *  @class
 *  This layer manage a list of children using a card layout.
 *  <p />
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the slider is horizontal, but you can change it using the 
 *  property "orientation".
 *  <p />
 *  The following example shows a typical example with panels
 *  (components 1 to 3).
 *
 *  <pre style="font-family:courier">
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡(1)ˉˉˉ⎤    ⎢ ⎡(2)ˉˉˉ⎤  ⎢
 *   ⎟      ⎢    ⎢ ⎢⎡(3)ˉ⎢ˉ⎤⎢
 *   ⎟      ⎢    ⎢ ⎢⎢    ⎢ ⎢⎢
 *   ⎟      ⎢    ⎢ ⎢⎢    ⎢ ⎢⎢
 *   ⎣______⎦    ⎢ ⎣______⎦ ⎢⎢
 *                ⎢   ⎣_______⎦⎢
 *                ⎣_____________⎦
 *
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡(2)ˉˉˉ⎤    ⎢ ⎡(3)ˉˉˉ⎤  ⎢
 *   ⎢⎡(1)ˉ⎢ˉ⎤ ⎢ ⎢       ⎢  ⎢
 *   ⎢⎢    ⎢ ⎢ ⎢ ⎢       ⎢  ⎢
 *   ⎢⎢    ⎢ ⎢ ⎢ ⎢       ⎢  ⎢
 *   ⎣______⎦ ⎢ ⎢ ⎣______⎦   ⎢
 *     ⎣______⎦  ⎢             ⎢
 *                ⎣_____________⎦
 *
 *
 *  (*) : device screen
 *  (1, ...,3) : components managed by the CardLayer
 *
 *   </pre>
 *
 *  <p>
 *  Delegate:
 *  <ul>
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller), Called when the view
 *        changed
 *  </ul>
 *  <p>
 *  @example
 *  theApplicatioin.layer = new vs.fx.OpacityController (myComp);
 *
 *  myComp.layer.push ('APanel', {id: '1', data: {...}});
 *  myComp.layer.push ('APanel', {id: '2', data: {...}});
 *  myComp.layer.push ('APanel', {id: '3', data: {...}});
 *  myComp.layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.OpacityController
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.View.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 */
function OpacityController (owner, extension)
{
  this.parent = StackController;
  this.parent (owner, extension);
  this.constructor = OpacityController;

  this.animationDuration = OpacityController.ANIMATION_DURATION;
}

/** @private */
OpacityController._opacity_animation = new OpacityAnimation (1);
OpacityController._opacity_animation.init ();
OpacityController._opacity_animation.durations = "0.2s";

/**
 * The duration of the animation between two views
 * @name vs.fx.OpacityController.ANIMATION_DURATION
 */
OpacityController.ANIMATION_DURATION = 500;

OpacityController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/

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
   *  var myComp = new MyComp (conf);
   *  myComp.layer = new vs.fx.StackController (myComp, 'children');
   *  myComp.layer.push ('AComponent1', data1);
   *  myComp.layer.push ('AComponent1', data2);
   *  myComp.layer.push ('AComponent2', data3);
   *
   * @name vs.fx.OpacityController#push
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the component.
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, bindings)
  {
    if (!comp) { return; }
    
    if (!isString (comp))
    {
      var index = this._states_array.length;
      comp.position = [0, 0];
      comp.setStyle ('z-index', 1000 - index);
    }
    StackController.prototype.push.call (this, comp, data, bindings);
  },
  
/*********************************************************
 *                  Event management
 *********************************************************/
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   * @private
   *
   * @name vs.fx.OpacityController#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   */
  goTo : function (state_id, output, event)
  {
    var state_to, index = this._states_array.indexOf (state_id), 
      state_from = this._list_of_state [this._current_state];
    // manage output
    // TODO WARNING
    StackController.prototype.goTo.call (this, state_id, output, event);
    if (!state_id) { return; }

//    this.owner.animationDuration = this._animation_duration;

    state_to = this._list_of_state [this._current_state];
    state_to.comp.setStyle ('position', 'absolute');
    state_to.comp.position = [0, 0];
    state_to.comp.setStyle ('z-index', 1000 - index);
        
    function initState (index)
    {
      var state_id = this._states_array [index],
          state = this._list_of_state [state_id];
      
      if (!state) { return; }

      if (!state.comp)
      {
        state.comp = this.owner.createAndAddComponent
          (state.comp_name, state.init_data, state.extension);
          
        state.comp.configure (state.init_data);
        state.comp.setStyle ('position', 'absolute');
        if (state.comp && state.comp.propertiesDidChange) 
        { 
          state.comp.propertiesDidChange ();
        }
        state.comp.propertyChange ();
      }
      if (state.view)
      {
        __setPos (state.view, 0, 0);
      }
      else
      {
        state.comp.position = [0, 0];
      }
      state.comp.show ();
      state.comp.setStyle ('z-index', 1000 - index);
    }
    
    /// left/top component 
    if (index > 0) { initState.call (this, index - 1); }

    /// right/bottom component 
    if (index < this._states_array.length - 1)
    { initState.call (this, index + 1); }
     
    if (event && event.on === StackController.NEXT && state_from)
    {
      OpacityController._opacity_animation.value = 0;
      OpacityController._opacity_animation.process (state_from.comp);
    }
    else if (event && event.on === StackController.PRED && state_to)
    {
      OpacityController._opacity_animation.value = 1;
      OpacityController._opacity_animation.process (state_to.comp);
    }

    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (isFunction (clb))
      {
        clb.call (this.owner, event);
      }
      else if (isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
  }
};
extendClass (OpacityController, StackController);

/********************************************************************
                  Define class properties
********************************************************************/

defineClassProperty (OpacityController, "animationDuration", {
  /** 
   * Set the animation/transition temporisation (in millisecond)
   * @name vs.fx.OpacityController#animationDuration 
   * @type {number}
   */ 
  set : function (time)
  {
    if (!time) { time = 0; }
    if (!isNumber (time)) { return };
    
    this._animation_duration = time;
    OpacityController._opacity_animation.durations = time / 1000 + "s";
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default OpacityController;
