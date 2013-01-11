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
  
vs.CSS_VENDOR

function createProperty (name)
{
  if (!vs.CSS_VENDOR) return name;
  return '-' + vs.CSS_VENDOR.toLowerCase () + '-' + name;
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
 * @const
 */ 
var ANIMATION_END = "animationEnd";

/** 
 * The vs.TRANSITION_END event is fired when a CSS transition has completed
 * @name vs.TRANSITION_END
 * @type {String}
 * @const
 */ 
var TRANSITION_END = "transitionEnd";

if (vs.CSS_VENDOR === 'webkit')
{
  ANIMATION_END = "webkitAnimationEnd";
  TRANSITION_END = "webkitTransitionEnd";
}  
else if (vs.CSS_VENDOR === 'ms')
{
  ANIMATION_END = "msAnimationEnd";
  TRANSITION_END = "msTransitionEnd";
}  
else if (vs.CSS_VENDOR === 'moz')
{
  ANIMATION_END = "animationend";
  TRANSITION_END = "transitionend";
}

util.extend (vs, {
  ANIMATION_DURATION:        ANIMATION_DURATION,
  ANIMATION_DELAY:           ANIMATION_DELAY,
  ANIMATION_NAME:            ANIMATION_NAME,
  ANIMATION_TIMING_FUNC:     ANIMATION_TIMING_FUNC,

  TRANSITION_DURATION:       TRANSITION_DURATION,
  TRANSITION_PROPERTY:       TRANSITION_PROPERTY,
  TRANSITION_DELAY:          TRANSITION_DELAY,
  TRANSITION_TIMING_FUNC:    TRANSITION_TIMING_FUNC,

  TRANSFORM_ORIGIN:          TRANSFORM_ORIGIN,
  ITERATION_COUNT:           ITERATION_COUNT,
  TRANSFORM:                 TRANSFORM,
  KEY_FRAMES:                KEY_FRAMES,

  ANIMATION_END:             ANIMATION_END,
  TRANSITION_END:            TRANSITION_END
});
