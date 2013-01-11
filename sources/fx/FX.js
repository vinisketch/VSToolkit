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
/** @private */
var vs = window.vs,
  util = vs.util,
  core = vs.core,
  ui = vs.ui,
  fx = vs.fx,
  setElementTransform = util.setElementTransform,
  getElementTransform = util.getElementTransform,
  SUPPORT_3D_TRANSFORM = vs.SUPPORT_3D_TRANSFORM;

if (util.vsTestStyle.webkitTransform !== undefined)
{
  var ANIMATION_DURATION = "-webkit-animation-duration";
  var ANIMATION_DELAY = "-webkit-animation-delay";
  var ANIMATION_NAME = "-webkit-animation-name";
  var ANIMATION_END = "webkitAnimationEnd";
  var ANIMATION_TIMING_FUNC = "-webkit-animation-timing-function";
  
  var TRANSITION_DURATION = "-webkit-transition-duration";
  var TRANSITION_DELAY = "-webkit-transition-delay";
  var TRANSITION_END = "webkitTransitionEnd";
  var TRANSITION_TIMING_FUNC = "-webkit-transition-timing-function";
  var TRANSITION_PROPERTY = "-webkit-transition-property";
  
  var TRANSFORM_ORIGIN = "-webkit-transform-origin";
  var ITERATION_COUNT = "-webkit-animation-iteration-count";
  var TRANSFORM = "-webkit-transform";
  var KEY_FRAMES = "-webkit-keyframes";
}  
else if (util.vsTestStyle.msTransform !== undefined)
{
  var ANIMATION_DURATION = "-ms-animation-duration";
  var ANIMATION_DELAY = "-ms-animation-delay";
  var ANIMATION_NAME = "-ms-animation-name";
  var ANIMATION_END = "msAnimationEnd";
  var ANIMATION_TIMING_FUNC = "-ms-animation-timing-function";
  
  var TRANSITION_DURATION = "-ms-transition-duration";
  var TRANSITION_DELAY = "-ms-transition-delay";
  var TRANSITION_END = "msTransitionEnd";
  var TRANSITION_TIMING_FUNC = "-ms-transition-timing-function";
  var TRANSITION_PROPERTY = "-ms-transition-property";
  
  var TRANSFORM_ORIGIN = "-ms-transform-origin";
  var ITERATION_COUNT = "-ms-animation-iteration-count";
  var TRANSFORM = "-ms-transform";
  var KEY_FRAMES = "-ms-keyframes";
}  
else if (util.vsTestStyle.MozTransform !== undefined)
{
  var ANIMATION_DURATION = "-moz-animation-duration";
  var ANIMATION_DELAY = "-moz-animation-delay";
  var ANIMATION_NAME = "-moz-animation-name";
  var ANIMATION_END = "animationend";
  var ANIMATION_TIMING_FUNC = "-moz-animation-timing-function";
  
  var TRANSITION_DURATION = "-moz-transition-duration";
  var TRANSITION_DELAY = "-moz-transition-delay";
  var TRANSITION_END = "transitionend";
  var TRANSITION_TIMING_FUNC = "-moz-transition-timing-function";
  var TRANSITION_PROPERTY = "-moz-transition-property";
  
  var TRANSFORM_ORIGIN = "-moz-transform-origin";
  var ITERATION_COUNT = "-moz-animation-iteration-count";
  var TRANSFORM = "-moz-transform";
  var KEY_FRAMES = "-moz-keyframes";
}  
else
{
  var ANIMATION_DURATION = "animation-duration";
  var ANIMATION_DELAY = "animation-delay";
  var ANIMATION_NAME = "animation-name";
  var ANIMATION_END = "animationEnd";
  var ANIMATION_TIMING_FUNC = "animation-timing-function";
  
  var TRANSITION_DURATION = "transition-duration";
  var TRANSITION_DELAY = "transition-delay";
  var TRANSITION_END = "transitionEnd";
  var TRANSITION_TIMING_FUNC = "transition-timing-function";
  var TRANSITION_PROPERTY = "transition-property";
  
  var TRANSFORM_ORIGIN = "transform-origin";
  var ITERATION_COUNT = "animation-iteration-count";
  var TRANSFORM = "transform";
  var KEY_FRAMES = "keyframes";
}  
