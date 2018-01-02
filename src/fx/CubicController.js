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
import { addPointerListener, removePointerListener } from 'vs_gesture';
import {
  isFunction, isString, isNumber, extendClass,
  setElementTransform, SUPPORT_3D_TRANSFORM
} from 'vs_utils';

import StackController from './StackController';
import { RotateXYZAnimation } from './Animation';

/**
 *  The vs.fx.CubicController class <br />
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
 *  theApplicatioin.layer = new vs.fx.CubicController (myComp);
 *
 *  myComp.layer.push ('APanel', {id: '1', data: {...}});
 *  myComp.layer.push ('APanel', {id: '2', data: {...}});
 *  myComp.layer.push ('APanel', {id: '3', data: {...}});
 *  myComp.layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
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
function CubicController (owner, extension)
{
  this.parent = StackController;
  this.parent (owner, extension);
  this.constructor = CubicController;
  
  if (owner) owner.setStyle ('-webkit-transform-style', 'preserve-3d');
  
/********************************************************************
                  setter and getter declarations
********************************************************************/
}

CubicController._translate_animation = new RotateXYZAnimation (-90,0,0);
CubicController._translate_animation.init ();
CubicController._translate_animation.addKeyFrame ('from', {degX:0});
CubicController._translate_animation.addKeyFrame (50, {degX:-92});
CubicController._translate_animation.addKeyFrame (70, {degX:-84});
CubicController._translate_animation.addKeyFrame (80, {degX:-90});
CubicController._translate_animation.addKeyFrame (95, {degX:-88});
CubicController._translate_animation.durations = "2s";

/**
 * Horizontal slide (defaut)
 * @const
 */
CubicController.HORIZONTAL = 0;

/**
 * Vertical slide
 * @const
 */
CubicController.VERTICAL = 1;


CubicController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/
  
  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : CubicController.HORIZONTAL,

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
   * @name vs.fx.CubicController#push
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
    return StackController.prototype.push.call
      (this, comp, data, bindings);
  },
  
/*********************************************************
 *                  Event management
 *********************************************************/
  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var t_ok = false, state, state_before_id, state_before, transform, index;
    
    if (event.type === vs_core.POINTER_START)
    {
      if (this.__layer._orientation === CubicController.HORIZONTAL)
      {
        if (event.changedTouches)
        {  this.__pos = event.changedTouches[0].clientX; }
        else
        {  this.__pos = event.clientX; }
      }
      else
      {
        if (event.changedTouches)
        {  this.__pos = event.changedTouches[0].clientY; }
        else
        {  this.__pos = event.clientY; }
      }

      addPointerListener(document, vs_core.POINTER_END, this, true);
      addPointerListener(document, vs_core.POINTER_MOVE, this, true);
      
      this.animationDuration = 0;
    }
    else if (event.type === vs_core.POINTER_MOVE)
    {
      event.preventDefault ();
      state = this.__layer._list_of_state [this.__layer._current_state];
      index = this.__layer._states_array.indexOf (this.__layer._current_state)
      
      if (index > 0) { state_before_id = this.__layer._states_array [index-1]; }
      
      if (this.__layer._orientation === CubicController.HORIZONTAL)
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientX - this.__pos; }
        else
        {  this.__delta = event.clientX - this.__pos; }
      
        if (SUPPORT_3D_TRANSFORM)
        { transform = "translate3d("+this.__delta+"px,0px,0)"; }
        else transform = "translate("+this.__delta+"px,0px)";
      }
      else
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        {  this.__delta = event.clientY - this.__pos; }
      
        if (SUPPORT_3D_TRANSFORM)
        { transform = "translate3d(0px,"+this.__delta+"px,0)"; }
        else transform = "translate(0px,"+this.__delta+"px)";
      }  
      if (this.__delta < 0)
      {
        state.comp.view.style.webkitTransitionDuration = 0;
        setElementTransform (state.comp.view, transform);
      }
      else if (state_before_id)
      {
        state_before = this.__layer._list_of_state [state_before_id];
        if (state_before && state_before.comp)
        {
          if (this.__layer._orientation === CubicController.HORIZONTAL)
          {
            if (SUPPORT_3D_TRANSFORM)
            {
              transform = 
                "translate3d("+(this.__delta-this._size[0])+"px,0px,0)";
            }
            else transform = 
              "translate("+(this.__delta-this._size[0])+"px,0px)";
          }
          else
          {
            if (SUPPORT_3D_TRANSFORM)
            {
              transform = 
                "translate3d(0px,"+(this.__delta-this._size[1])+"px,0)";
            }
            else transform = 
              "translate(0px,"+(this.__delta-this._size[1])+"px)";
          }  
          state_before.comp.view.style.webkitTransitionDuration = 0;
          setElementTransform (state_before.comp.view, transform);
        }
      }
    }
    else if (event.type === vs_core.POINTER_END)
    {
      state = this.__layer._list_of_state [this.__layer._current_state];
      if (this.__delta > 50)
      {
        t_ok = this.__layer.goToPreviousView ();
      }
      else if (this.__delta < -50)
      {
        t_ok = this.__layer.goToNextView ();
      }
      if (!t_ok)
      {
        index = this.__layer._states_array.indexOf (this.__layer._current_state)
        
        if (index > 0)
        { state_before_id = this.__layer._states_array [index-1]; }
        
        if (this.__delta < 0)
        {
          if (SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__layer._animation_duration + 'ms';
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__layer._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__layer._orientation === CubicController.HORIZONTAL)
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+this._size[0]+"px,0px,0)";
              }
              else transform = 
                "translate("+this._size[0]+"px,0px)";
            }
            else
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,-"+this._size[1]+"px,0)";
              }
              else transform = 
                "translate(0px,-"+this._size[1]+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration =
              this.__layer._animation_duration + 'ms';
            setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      removePointerListener(document, vs_core.POINTER_END, this, true);
      removePointerListener(document, vs_core.POINTER_MOVE, this, true);
    }
  },
  
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.fx.CubicController#goTo
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

    this.owner.animationDuration = this._animation_duration;

    state_to = this._list_of_state [this._current_state];
    state_to.comp.setStyle ('position', 'absolute');
    state_to.comp.position = [0, 0];
    state_to.comp.setStyle ('z-index', 1000 - index);
    
    if (state_from && state_to)
    {
      state_from.comp.setStyle ('-webkit-transform', 'scale3d(.835,.835,.835) translateZ(200px)');
      
      state_to.comp.setStyle ('-webkit-transform', 'scale3d(.835,.835,.835) rotateX(90deg) translateZ(200px)');
    }

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
        state.comp.style ('position', 'absolute');
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
      state.comp.style ('z-index', 1000 - index);
    }
    
    /// left/top component 
    if (index > 0) { initState.call (this, index - 1); }

    /// right/bottom component 
    if (index < this._states_array.length - 1)
    { initState.call (this, index + 1); }
     
    if (event && event.on === StackController.NEXT && state_from)
    {
      if (this._orientation === CubicController.HORIZONTAL)
      {
        CubicController._translate_animation.process (this.owner);
      }
      else
      {
        CubicController._translate_animation.process (this.owner);
      }
    }
    else if (event && event.on === StackController.PRED && state_to)
    {
      CubicController._translate_animation.x = 0;
      CubicController._translate_animation.y = 0;
      CubicController._translate_animation.process (state_to.comp);
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
extendClass (CubicController, StackController);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default CubicController;
