/** @license
  Copyright (C) 2009-2018. David Thevenin, ViniSketch SARL (c), and 
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
import { CSS_VENDOR } from 'vs_utils';

import {
  Animation,
  cancelAnimation,
  TranslateAnimation,
  RotateAnimation,
  RotateXYZAnimation,
  ScaleAnimation,
  SkewAnimation,
  OpacityAnimation
} from './Animation';
import CardController from './CardController';
import Controller from './Controller';
import CubicController from './CubicController';
import NavigationController from './NavigationController';
import OpacityController from './OpacityController';
import SlideController from './SlideController';
import StackController from './StackController';
import SwipeController from './SwipeController';

/********************************************************************
                   
*********************************************************************/

function createProperty (name)
{
  if (!CSS_VENDOR) return name;
  return '-' + CSS_VENDOR.toLowerCase () + '-' + name;
}

/** 
 * CSS property specifies the length of time that an animation should take to
 * complete one cycle
 * @name vs.ANIMATION_DURATION
 * @type {String}
 * @const
 */ 
var ANIMATION_DURATION = createProperty ("animation-duration");

/** 
 * CSS property specifies when the animation should start. This lets the
 * animation sequence begin some time after it's applied to an element
 * @name vs.ANIMATION_DELAY
 * @type {String}
 * @const
 */ 
var ANIMATION_DELAY = createProperty ("animation-delay");

/** 
 * CSS property specifies a list of animations that should be applied to the
 * selected element.
 * @name vs.ANIMATION_NAME
 * @type {String}
 * @const
 */ 
var ANIMATION_NAME = createProperty ("animation-name");

/** 
 * CSS property specifies how a CSS animation should progress over the duration
 * of each cycle
 * @name vs.ANIMATION_TIMING_FUNC
 * @type {String}
 * @const
 */ 
var ANIMATION_TIMING_FUNC = createProperty ("animation-timing-function");

/** 
 * CSS property specifies how a CSS animation should apply styles to its target
 * before and after it is executing.
 * @name vs.ANIMATION_FILL_MODE
 * @type {String}
 */ 
var ANIMATION_FILL_MODE = createProperty ("animation-fill-mode");


/** 
 * CSS property specifies the number of seconds or milliseconds a transition
 * animation should take to complete
 * @name vs.TRANSITION_DURATION
 * @type {String}
 * @const
 */ 
var TRANSITION_DURATION = createProperty ("transition-duration");

/** 
 * CSS property specifies the length of time that an animation should take to
 * complete one cycle
 * @name vs.TRANSITION_DELAY
 * @type {String}
 * @const
 */ 
var TRANSITION_DELAY = createProperty ("transition-delay");

/** 
 * CSS property specifies the amount of time to wait between a change bein
 * requested to a property that is to be transitioned and the start of the
 * transition effect
 * @name vs.TRANSITION_TIMING_FUNC
 * @type {String}
 * @const
 */ 
var TRANSITION_TIMING_FUNC = createProperty ("transition-timing-function");

/** 
 * CSS property is used to specify the names of CSS properties to which a
 * transition effect should be applied
 * @name vs.TRANSITION_PROPERTY
 * @type {String}
 * @const
 */ 
var TRANSITION_PROPERTY = createProperty ("transition-property");


/** 
 * CSS property lets you modify the origin for transformations of an element.
 * @name vs.TRANSFORM_ORIGIN
 * @type {String}
 * @const
 */ 
var TRANSFORM_ORIGIN = createProperty ("transform-origin");

/** 
 * CSS property defines the number of times an animation cycle should be played
 * before stopping
 * @name vs.ITERATION_COUNT
 * @type {String}
 * @const
 */ 
var ITERATION_COUNT = createProperty ("animation-iteration-count");

/** 
 * CSS property lets you modify the coordinate space of the CSS visual
 * formatting model
 * @name vs.TRANSFORM
 * @type {String}
 * @const
 */ 
var TRANSFORM = createProperty ("transform");

/** 
 * CSS at-rule lets authors control the intermediate steps in a CSS animation
 * sequence
 * @name vs.KEY_FRAMES
 * @type {String}
 * @const
 */ 
var KEY_FRAMES = createProperty ("keyframes");


/** 
 * The vs.ANIMATION_END event is fired when a CSS animation has completed.
 * @name vs.ANIMATION_END
 * @type {String}
 */ 
var ANIMATION_END = "animationend";

/** 
 * The vs.TRANSITION_END event is fired when a CSS transition has completed
 * @name vs.TRANSITION_END
 * @type {String}
 */ 
var TRANSITION_END = "transitionend";

if (CSS_VENDOR === 'webkit')
{
  ANIMATION_END = "webkitAnimationEnd";
  TRANSITION_END = "webkitTransitionEnd";
}  
else if (CSS_VENDOR === 'ms')
{
  ANIMATION_END = "msAnimationEnd";
  TRANSITION_END = "msTransitionEnd";
}  
else if (CSS_VENDOR === 'moz')
{
  ANIMATION_END = "Mozanimationend";
  TRANSITION_END = "Moztransitionend";
}

export {
  ANIMATION_DURATION,
  ANIMATION_DELAY,
  ANIMATION_NAME,
  ANIMATION_TIMING_FUNC,
  ANIMATION_FILL_MODE,

  TRANSITION_DURATION,
  TRANSITION_PROPERTY,
  TRANSITION_DELAY,
  TRANSITION_TIMING_FUNC,

  TRANSFORM_ORIGIN,
  ITERATION_COUNT,
  TRANSFORM,
  KEY_FRAMES,

  ANIMATION_END,
  TRANSITION_END,

  Animation,
  cancelAnimation,
  TranslateAnimation,
  RotateAnimation,
  RotateXYZAnimation,
  ScaleAnimation,
  SkewAnimation,
  OpacityAnimation,

  CardController,
  Controller,
  CubicController,
  NavigationController,
  OpacityController,
  SlideController,
  StackController,
  SwipeController
};
