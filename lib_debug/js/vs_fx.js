/** @license
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

(function (window, undefined) {

var document = window.document;

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
var ANIMATION_END = "animationend";

/** 
 * The vs.TRANSITION_END event is fired when a CSS transition has completed
 * @name vs.TRANSITION_END
 * @type {String}
 * @const
 */ 
var TRANSITION_END = "transitionend";

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
  ANIMATION_END = "Mozanimationend";
  TRANSITION_END = "Moztransitionend";
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
 * @private
 * @const
 */
var AnimationWidthRegExp = new RegExp (/\$width/g);
/**
 * @private
 * @const
 */
var AnimationHeightRegExp = new RegExp (/\$height/g);
/**
 * @private
 * @const
 */
var AnimationXRegExp = new RegExp (/\$x/g);
/**
 * @private
 * @const
 */
var AnimationYRegExp = new RegExp (/\$y/g);
/**
 * @private
 * @const
 */
var AnimationVariableRegExp = new RegExp (/\$\{([\w]+)\}/g);

/**
 *  Cancel a playing animation
 * @name vs.fx.cancelAnimation
 * @param {String} id the animation id return par vs.fx.Animation.process ();
 */
function cancelAnimation (anim_id)
{
  if (!anim_id) { return false; }
  var anim_name, cssAnimation, anim_id, data;

  data = Animation.__css_animations [anim_id];
  if (data && data.length === 2)
  {
    if (!data[1] || !data[1].getStyle || !data [0]) { return false; }

    anim_name = data[1].getStyle (ANIMATION_NAME);
    if (!anim_name) { return false; }

    anim_name = anim_name.replace (anim_id, '');
    data[1].setStyle (ANIMATION_NAME, anim_name);

    try {
      document.getElementsByTagName("head")[0].removeChild (data [0]);
    }
    catch (e)
    {
      console.error (e);
      return false;
    }
    delete (Animation.__css_animations [anim_id]);
  }
  else { return false; }

  return true;
}

/**
 *  @private
 *
 * @param {vs.fx.View} comp the component the view will be animated
 * @param {vs.fx.Animation} animation the animation
 * @param {Function} clb an optional callback to call at the end of animation
 * @param {Object} ctx an optional execution context associated to the clb
 * @return {String} return the identifier of the animation process. You can
 *       use it to stop the animation for instance.
 */
var procesAnimation = function (comp, animation, clb, ctx)
{
  if (!animation || !comp || !comp.view)
  {
    console.error ('procesAnimation: invalid component parameter!');
    return;
  }

  function isComplexAnimation ()
  {
    if (animation.keyFrames ['0%']) { return true; }
    return false;
  }

  var initWithParameters, parseValue, applySimpleAnimation, applyStyleTo,
    runComplexAnimation, applyComplexAnimation,
    cssAnimation, anim_id = core.createId (),
    isComplex = isComplexAnimation (),
    forceCallback = false;

  initWithParameters = function ()
  {
    var property;
    if (isComplex)
    { property = ANIMATION_DURATION; }
    else { property = TRANSITION_DURATION; }

    if (util.isArray (animation.origin) && animation.origin.length === 2)
    {
      var value = animation.origin [0] + '% ' + animation.origin [1] + '%';
      comp.setStyle (TRANSFORM_ORIGIN, value);
    }

    if (util.isString (animation.durations))
    {
      comp.setStyle (property, animation.durations);
    }
    else if (util.isArray (animation.durations))
    {
      comp.setStyle (property, animation.durations.join (', '));
    }
    else
    {
      comp.setStyle (property, Animation.DEFAULT_DURATION);
    }

    if (isComplex) { property = ANIMATION_DELAY; }
    else { property = TRANSITION_DELAY; }

    if (util.isNumber (animation.delay))
    {
      comp.setStyle (property, animation.delay + 'ms');
    }
    else
    { comp.setStyle (property, '0'); }

    if (isComplex) property = ANIMATION_TIMING_FUNC;
    else property = TRANSITION_TIMING_FUNC;

    if (util.isString (animation.timings))
    {
      comp.setStyle (property, animation.timings);
    }
    else if (util.isArray (animation.timings))
    {
      comp.setStyle (property, animation.timings.join (', '));
    }
    else
    {
      comp.setStyle (property, Animation.EASE);
    }

    if (isComplex)
    {
      if (animation.iterationCount === 'infinite')
      {
        comp.setStyle (ITERATION_COUNT, 'infinite');
      }
      else if (!animation.iterationCount ||
               !util.isNumber (animation.iterationCount))
      {
        comp.setStyle (ITERATION_COUNT, '1');
      }
      else
      {
        comp.setStyle (ITERATION_COUNT, animation.iterationCount);
      }
    }
  };

  parseValue = function (v, data)
  {
    var matches, i, props = [], prop;

    if (util.isNumber (v)) { return v; }

    if (util.isString (v))
    {
      v = v.replace (AnimationWidthRegExp, comp.size [0] + 'px');
      v = v.replace (AnimationHeightRegExp, comp.size [1] + 'px');
      v = v.replace (AnimationXRegExp, comp.position [0] + 'px');
      v = v.replace (AnimationYRegExp, comp.position [1] + 'px');

      var matches = AnimationVariableRegExp.exec (v);
      while (matches && matches.length === 2)
      {
        props.push (matches [1]);
        matches = AnimationVariableRegExp.exec (v);
      }
      for (var i = 0; i < props.length; i++)
      {
        prop = props [i];
        if (typeof data[prop] !== 'undefined')
        { v = v.replace ('${' + prop + '}', data[prop]); }
        else if (typeof animation[prop] !== 'undefined')
        { v = v.replace ('${' + prop + '}', animation[prop]); }
      }

      return v;
    }

    console.warn
      ("vs.fx.Animation._parseValue. Unknown value's type: " + v);
    return 0;
  };

  applySimpleAnimation = function ()
  {
    initWithParameters ();
    var callback, i, self = this, dur;

    callback = function (event)
    {
      // do nothing if that event just bubbled from our target's sub-tree
      if (event.currentTarget !== comp.view) { return; }

      if (!forceCallback)
        comp.view.removeEventListener (TRANSITION_END, callback, false);

      // clear transition parameters
      comp.view.style.removeProperty (TRANSITION_DURATION);
      comp.view.style.removeProperty (TRANSITION_DELAY);

      if (animation.delegate && animation.delegate.taskDidEnd)
      { animation.delegate.taskDidEnd (animation); }

      if (clb) { clb.call (ctx?ctx:self); }
    }

    // if durations is egal to 0, no event is generated a the end.
    // Then use a small time
    dur = parseFloat (comp.view.style.getPropertyValue (TRANSITION_DURATION));
    if (dur === 0) forceCallback = true;

    if (!forceCallback)
      comp.view.addEventListener (TRANSITION_END, callback, false);
     else setTimeout (function () {
      callback ({currentTarget: comp.view});
    }, 0);

    applyStyleTo ();
  };

  applyStyleTo = function ()
  {
    var data = (animation.keyFrames['100%'])?
      animation.keyFrames['100%']:animation, transform = '',
      property, properties = [], value;

    if (data) for (i = 0; i < animation.properties.length; i++)
    {
      property = animation.properties [i];
      value = parseValue (animation.values [i], data);
      if (property === 'rotate')
      { transform += 'rotate(' + value + ') '; property = TRANSFORM;}
      else if (property === 'skew')
      { transform += 'skew(' + value + ') '; property = TRANSFORM;}
      else if (SUPPORT_3D_TRANSFORM && property === 'translate')
      { transform += 'translate3d(' + value + ') '; property = TRANSFORM;}
      else if (property === 'translate')
      { transform += 'translate(' + value + ') '; property = TRANSFORM;}
      else if (property === 'translateX')
      { transform += 'translateX(' + value + ') '; property = TRANSFORM;}
      else if (property === 'translateY')
      { transform += 'translateY(' + value + ') '; property = TRANSFORM;}
      else if (property === 'rotateX')
      { transform += 'rotateX(' + value + ') '; property = TRANSFORM;}
      else if (property === 'rotateY')
      { transform += 'rotateY(' + value + ') '; property = TRANSFORM;}
      else if (property === 'scale')
      { transform += 'scale(' + value + ') '; property = TRANSFORM;}
      else
      { comp.setStyle (property, value); }

      if (properties.indexOf (property) == -1) properties.push (property);
    }
    if (transform)
    {
      var matrix = comp.getCTM ();
      transform = matrix.toString () + ' ' + transform;
      setElementTransform (comp.view, transform);
    }

    comp.setStyle (TRANSITION_PROPERTY, properties.join (','));
  }

  runComplexAnimation = function ()
  {
    initWithParameters ();

    var i, callback, value, anim_name, dur,

    callback = function (event)
    {
      // do nothing if that event just bubbled from our target's sub-tree
      if (event.currentTarget !== comp.view) { return; }

      if (!forceCallback)
        comp.view.removeEventListener (ANIMATION_END, callback, false);

      // apply the last state
      if (isComplex) { applyStyleTo (); }

      // clear animations parameters
      comp.view.style.removeProperty (ANIMATION_DURATION);
      comp.view.style.removeProperty (ANIMATION_DELAY);

      // clean the animation
      anim_name = comp.getStyle (ANIMATION_NAME);
      if (anim_name)
      {
        anim_name = anim_name.replace (anim_id, '');
        comp.setStyle (ANIMATION_NAME, anim_name);
      }

      try
      {
        data = Animation.__css_animations [anim_id];
        if (data && data.length === 2)
        {
          document.getElementsByTagName("head")[0].removeChild (data [0]);
          delete (Animation.__css_animations [anim_id]);
        }
      }
      catch (e)
      {
        console.error (e);
        return false;
      }

      if (animation.delegate && animation.delegate.taskDidStop)
      { animation.delegate.taskDidEnd (animation); }

      if (clb) { clb.call (ctx?ctx:self); }
    }

    // if durations is egal to 0, no event is generated a the end.
    // Then use a small time
    dur = parseFloat (comp.view.style.getPropertyValue (ANIMATION_DURATION));
    if (dur === 0) forceCallback = true;

    if (!forceCallback)
      comp.view.addEventListener (ANIMATION_END, callback, false);
    else setTimeout (function () {
      callback ({currentTarget: comp.view});
    }, 0);

    anim_name = comp.getStyle (ANIMATION_NAME);

    if (!anim_name) { anim_name = anim_id; }
    else { anim_name += ', ' + anim_id; }

    comp.setStyle (ANIMATION_NAME, anim_name);
  }

  applyComplexAnimation = function ()
  {
    var data, key, style, i, property, transform, value,
    cssAnimation = document.createElement('style');
    cssAnimation.type = 'text/css';

    var rules_str = '';
    for (key in animation.keyFrames)
    {
      transform = '';
      data = animation.keyFrames [key];
      style = '';
      if (util.isArray (data))
      {
        for (var i = 0; i < data.length; i++)
        {
          value = data [i];
          if (value == null || typeof value == 'undefined') continue;
          value = parseValue (value, animation);
          property = animation.properties [i];
          if (!property) { continue; }
          if (property === 'rotate')
          { transform += 'rotate(' + value + ') '; }
          else if (property === 'skew')
          { transform += 'skew(' + value + ') '; }
          else if (SUPPORT_3D_TRANSFORM && property === 'translate')
          { transform += 'translate3d(' + value + ') '; }
          else if (property === 'translate')
          { transform += 'translate(' + value + ') '; }
          else if (property === 'translateX')
          { transform += 'translateX(' + value + ') '; }
          else if (property === 'translateY')
          { transform += 'translateY(' + value + ') '; }
          else if (property === 'rotateX')
          { transform += 'rotateX(' + value + ') '; }
          else if (property === 'rotateY')
          { transform += 'rotateY(' + value + ') '; }
          else if (property === 'scale')
          { transform += 'scale(' + value + ') '; }
          else if (property === 'perspective')
          { transform += 'perspective(' + value + ') '; }
          else
          { style += property + ':' + value + ';'; }
        }
      }
      else
      {
        for (i = 0; i < animation.properties.length; i++)
        {
          value = parseValue (animation.values [i], data);
          property = animation.properties [i];
          if (!property) { continue; }
          if (property === 'rotate')
          { transform += 'rotate(' + value + ') '; }
          else if (property === 'skew')
          { transform += 'skew(' + value + ') '; }
          else if (SUPPORT_3D_TRANSFORM && property === 'translate')
          { transform += 'translate3d(' + value + ') '; }
          else if (property === 'translate')
          { transform += 'translate(' + value + ') '; }
          else if (property === 'translateX')
          { transform += 'translateX(' + value + ') '; }
          else if (property === 'translateY')
          { transform += 'translateY(' + value + ') '; }
          else if (property === 'rotateX')
          { transform += 'rotateX(' + value + ') '; }
          else if (property === 'rotateY')
          { transform += 'rotateY(' + value + ') '; }
          else if (property === 'scale')
          { transform += 'scale(' + value + ') '; }
          else if (property === 'perspective')
          { transform += 'perspective(' + value + ') '; }
          else
          { style += property + ':' + value + ';'; }
        }
      }
      if (transform)
      {
        var matrix = comp.getCTM ();
        transform = matrix.toString () + ' ' + transform;
        style += TRANSFORM + ': ' + transform + ';';
      }

      rules_str += key + ' { ' + style + ' } ';
    }

    var rules = document.createTextNode
      ('@' + KEY_FRAMES + ' ' + anim_id + ' { ' + rules_str + ' }');

    cssAnimation.appendChild (rules);
    document.getElementsByTagName("head")[0].appendChild(cssAnimation);

    Animation.__css_animations [anim_id] = [cssAnimation, comp];

    runComplexAnimation ();
  }

  if (isComplex) { applyComplexAnimation (); }
  else { applySimpleAnimation (); }

  return anim_id;
};

/**
 *  @class
 *  An vs.fx.Animation object, contains information for animate a vs.fx.View
 *  component.
 *  <p>
 *  It specifies the css properties to animate and the values for each
 *  properties.
 *  You can define one transformation or a set of transformation
 *  for your animation. In case of multiple transformation the developer
 *  an specify a duration for each transformation.
 *  <p>
 *  <u>Predefined animations</u>: {@link vs.fx.TranslateAnimation},
 *  {@link vs.fx.RotateAnimation}, {@link vs.fx.RotateXYZAnimation},
 *  {@link vs.fx.ScaleAnimation}, {@link vs.fx.SkewAnimation}
 *
 *  @see vs.fx.TranslateAnimation
 *  @see vs.fx.RotateAnimation
 *  @see vs.fx.RotateXYZAnimation
 *  @see vs.fx.ScaleAnimation
 *  @see vs.fx.SkewAnimation
 *
 *  @example
 *  // animate with a constant
 *  a = new vs.fx.Animation (['rotate', '30deg']);​
 *  a.process (comp);
 *
 *  // animate with a predefined variable
 *  a = new vs.fx.Animation (['translate', '$width']);​
 *  a.process (comp);
 *
 *  // animate with a generic variable
 *  a = new vs.fx.Animation (['rotate', '${r}deg']);​
 *  a.r = 50;
 *  a.process (comp);
 *
 * @example
 * // example of multiple transformations an durations
 * // define a animation with two transformations
 * animation = new vs.fx.Animation ([‘width’, '100px'], ['opacity', '0'])
 * // set duration for each
 * animation.durations = ['1s', '2s'];
 *
 * @example
 * // Defining a complex animation with key frames"
 * var translate = new vs.fx.TranslateAnimation (130, 150);
 * translate.durations = '3s';
 * translate.iterationCount = 3;
 *
 * translate.addKeyFrame ('from', {x:0, y: 0, z:0});
 * translate.addKeyFrame (20, {x:50, y: 0, z: 0});
 * translate.addKeyFrame (40, {x:50, y: 50, z: 0});
 *
 * translate.process (myObject);
 *
 *  @author David Thevenin
 * @name vs.fx.Animation
 *  @extends vs.core.Task
 *
 *  @constructor
 *  Main constructor
 *
 * @param {Array.<string>} animations The array of <property, value> to animate
*/
function Animation (animations)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = Animation;

  if (arguments.length)
  {
    this.setAnimations (arguments);
    this.keyFrames ['100%'] = this;
  }
};

/**
 * @private
 */
Animation.__css_animations = {};

Animation.DEFAULT_DURATION = '0.3s';
Animation.DEFAULT_TIMING = Animation.EASE;

Animation.prototype = {

  /**
   * The css properties to animate
   * @type {Array.<string>}
   * @name vs.fx.Animation#properties
   */
  properties: null,

  /**
   * The css values for each properties
   * @type {Array.<string>}
   * @name vs.fx.Animation#values
   */
  values: null,

  /**
   * The duration for each transformation. For setting only one duration,
   * use a string (ex anim.duration = '3s')
   * @type Array.<string>
   * @name vs.fx.Animation#durations
   */
  durations: null,

  /**
   * Specifies how the intermediate values used during a transition are
   * calculated. <p />Use the constants to specify preset points of the curve:
   * ({@link vs.fx.Animation.EASE},
   * {@link vs.fx.Animation.LINEAR}, {@link vs.fx.Animation.EASE_IN},
   * {@link vs.fx.Animation.EASE_OUT}, {@link vs.fx.Animation.EASE_IN_OUT})
   * or the cubic-bezier function to specify your own points.
   * <p />
   * Specifies a cubic Bézier curve : cubic-bezier(P1x,P1y,P2x,P2y) <br />
   * Parameters: <br />
   * - First point in the Bézier curve : P1x, P1y <br />
   * - Second point in the Bézier curve : P2x, P2y <br />
   *
   * @type Array.<string>
   * @name vs.fx.Animation#timings
   */
  timings: null,

  /**
   * Specifies the number of times an animation iterates.
   * The transformations establishes the origin for transforms applied to
   * your component with respect to its border box. By default the value
   * is 50%, 50%.
   * <p>The values is express as an array of percentages of the element’s size,
   * origin [0] => pos X, origin [1] => pos Y
   * @type {Array.<int>}
   * @name vs.fx.Animation#origin
   */
  origin: null,

  /**
   * Sets the origin for the transformations
   * By default it is set to 1.
   * For infinite interation, use 'infinite' value.
   * @type number | 'infinite'
   * @name vs.fx.Animation#iterationCount
   */
  iterationCount: 1,

  /**
   * The time to begin executing an animation after it is applied. <br/>
   * If 0, the animation executes as soon as it is applied. <br/>
   * If positive, it specifies an offset from the moment the animation is
   * applied, and the animation delays execution by that offset. <br/>
   * If negative, the animation executes the moment the property changes but
   * appears to begin at the specified negative offset—that is, begins part-way
   * through the animation. <br/>
   * The unit is milliseconds.  <br/>
   * By default it is set to 0.
   * @type number
   * @name vs.fx.Animation#delay
   */
  delay: 0,

  /**
   * @private
   * @type Object
   * @name vs.fx.Animation#keyFrames
   */
  keyFrames: null,

  /**
   *  Defines the properties to animate.
   *  <p>
   *  When you call the method you redefines your animation, and all
   *  animation options are set to default value.
   *
   * @example
   * // define a animation with two transformations
   * animation = new vs.fx.Animation ()
   * animation.setAnimations ([[‘width’, '100px'], ['opacity', '0']]);
   *
   * @name vs.fx.Animation#setAnimations
   * @function
   * @param {Array.<Array>} animations The array of [property, value]
   *         to animate
   */
  setAnimations : function (animations)
  {
    var i, prop, value, option;

    this.properties = [];
    this.values = [];
    this.timings = [];
    this.keyFrames = {};
    this.origin = null;
    this.durations = null;
    this.timings = null;

    for (i = 0 ; i < animations.length; i++)
    {
      option = animations [i];
      if (!util.isArray (option) || option.length !== 2)
      {
        console.warn ('vs.fx.Animation, invalid animations');
        continue;
      }
      prop = option [0]; value = option [1];
      if (!util.isString (prop) || !util.isString (value))
      {
        console.warn ('vs.fx.Animation, invalid constructor argument option: [' +
          prop + ', ' + value + ']');
        continue;
      }

      this.properties.push (prop);
      this.values.push (value);
    }
  },

  /**
   *  Add an animation Key frames.
   *  By default an animation does not have key frames. But you can
   *  define a complexe animation with key frames.
   *  <br />
   *  You have to define at least two key frames 'from' and 'to'.
   *  Other frames are define as percentage value of the animation.
   *  <p />
   *  @example
   *  var translate = new vs.fx.TranslateAnimation (130, 150);
   *
   *  translate.addKeyFrame ('from', {x:0, y: 0, z:0});
   *  translate.addKeyFrame (20, {x:50, y: 0, z: 0});
   *  translate.addKeyFrame (40, {x:50, y: 50, z: 0});
   *
   *  @example
   *  var translate = new vs.fx.Animation (['translateY','100px'],['opacity', '0']);
   *
   *  translate.addKeyFrame ('from', ['0px', '1']);
   *  translate.addKeyFrame (20, ['50px', '1']);
   *  translate.addKeyFrame (40, ['80px', '1']);
   *
   * @name vs.fx.Animation#addKeyFrame
   * @function
   * @param {string | number} pos The percentage value of animation
   * @param {Object | Array} values the object containing values for
   *         the animation
   */
  addKeyFrame : function (pos, values)
  {
    if (!values) { return; }
    if (pos === 'from')
    {
      this.keyFrames ['0%'] = values;
      return;
    }
    if (pos === 'to')
    {
      this.keyFrames ['100%'] = values;
      return;
    }
    if (!util.isNumber (pos) || pos < 0 || pos > 100) { return; }

    this.keyFrames [pos+'%'] = values;
  },

  /**
   *  Use this function for animate your graphic object.
   *  <p>
   *  You can set a callback function that will be call at the end of animation.
   *  Associated to the callback you can defined a runtime context. This context
   *  could be a object.
   *
   *  @example
   *  obj.prototype.endAnimation = function (event)
   *  { ... }
   *
   *  obj.prototype.animate = function ()
   *  {
   *    myAnimation.process (a_gui_object, this.endAnimation, this);
   *  }
   *
   * @name vs.fx.Animation#process
   * @function
   * @param {vs.fx.View} comp The component the view will be animated
   * @param {Function} clb an optional callback to call at the end of animation
   * @param {Object} ctx an optional execution context associated to the
   *          callback
   * @return {String} return the identifier of the animation process. You can
   *       use it to stop the animation for instance.
   */
  process : function (comp, clb, ctx)
  {
    return procesAnimation (comp, this, clb, ctx);
  },

/********************************************************************
                  Task implementation
********************************************************************/

  /**
   *  Clone the current animation.
   *
   * @name vs.fx.Animation#clone
   * @function
   * @return {vs.fx.Animation} the clone animation
   */
  clone: function ()
  {
    var anim = new Animation (), key, data;
    anim.keyFrames = {};
    anim.keyFrames ['100%'] = anim;

    if (this.properties)
    { anim.properties = this.properties.slice (); }
    else { anim.properties = []; }
    if (this.values)
    { anim.values = this.values.slice (); }
    else { anim.values = []; }
    if (this.durations)
    { anim.durations = this.durations; }
    if (this.timings)
    { anim.timings = this.timings.slice (); }
    else { anim.timings = []; }
    if (this.origin)
    { anim.origin = this.origin.slice (); }
    if (this.keyFrames)
    {
      for (key in this.keyFrames)
      {
        if (key === '100%') { continue; }
        data = this.keyFrames [key];
        if (util.isArray (data)) { anim.keyFrames [key] = data.slice (); }
        else { anim.keyFrames [key] = vs.util.clone (data); }
      }
    }

    anim.iterationCount = this.iterationCount;
    anim.delay = this.delay;

    return anim;
  },

/********************************************************************
                  Task implementation
********************************************************************/

  /**
   *  Starts the task
   *
   * @name vs.fx.Animation#start
   * @function
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start: function (param)
  {
    this.process (param);
  }
};
util.extendClass (Animation, core.Task);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Animation, {
  'duration': {
    /**
     * Getter/Setter for animation duration
     * @name vs.fx.Animation#duration
     *
     * @type {String}
     */
    set : function (v)
    {
      if (!v) { return; }

      this.durations = [v];
    },

    /**
     * @ignore
     */
    get : function ()
    {
      if (this.durations && this.durations.length)
      { return this.durations [0]; }
      else
      { return Animation.DEFAULT_DURATION; }
    },
  },
  'timing': {
    /**
     * Getter/Setter for animation timing
     * @name vs.fx.Animation#timing
     *
     * @type {String}
     */
    set : function (v)
    {
      if (!v) { return; }

      this.timings = [v];
    },

    /**
     * @ignore
     */
    get : function ()
    {
      if (this.timings && this.timings.length)
      { return this.timings [0]; }
      else
      { return Animation.EASE; }
    }
  }
});

/*************************************************************
                Timing Function
*************************************************************/

/**
 * The ease timing function
 * Equivalent to cubic-bezier(0.25, 0.1, 0.25, 1.0)
 * @name vs.fx.Animation.EASE
 * @const
 */
Animation.EASE = 'ease'

/**
 * The linear timing function
 * Equivalent to cubic-bezier(0.0, 0.0, 1.0, 1.0)
 * @name vs.fx.Animation.LINEAR
 * @const
 */
Animation.LINEAR = 'linear'

/**
 * The ease in timing function
 * Equivalent to cubic-bezier(0.42, 0, 1.0, 1.0)
 * @name vs.fx.Animation.EASE_IN
 * @const
 */
Animation.EASE_IN = 'ease-in'

/**
 * The ease out timing function
 * Equivalent to cubic-bezier(0, 0, 0.58, 1.0)
 * @name vs.fx.Animation.EASE_OUT
 * @const
 */
Animation.EASE_OUT = 'ease-out'

/**
 * The ease in out timing function
 * Equivalent to cubic-bezier(0.42, 0, 0.58, 1.0)
 * @name vs.fx.Animation.EASE_IN_OUT
 * @const
 */
Animation.EASE_IN_OUT = 'ease-in-out'

/*************************************************************
                Specifics animations
*************************************************************/

/**
 *  @class
 *  Animation for translate a object view over x, y, and z axes.
 *  <p>
 *
 *  @example
 *  // declare the animation
 *  var translate = new vs.fx.TranslateAnimation (50, 50, 0);
 *  translate.process (comp);
 *
 *  // reconfigure the animation
 *  translate.x = 40;
 *  translate.y = 140;
 *  translate.process (comp);
 *
 *  @author David Thevenin
 * @name vs.fx.TranslateAnimation
 *
 *  @constructor
 *  Main constructor
 *  @extends vs.fx.Animation
 *
 * @param {number} x The translation value along the X axis
 * @param {number} y The translation value along the Y axis
 * @param {number} z The translation value along the Z axis if 3d css transform is possible
*/
TranslateAnimation = function (x, y, z)
{
  this.parent = Animation;
  if (!arguments.length)
  {
    this.parent ();
  }
  else
  {
    if (SUPPORT_3D_TRANSFORM)
      this.parent (['translate', '${x}px,${y}px,${z}px']);
    else
      this.parent (['translate', '${x}px,${y}px']);

    if (util.isNumber (x)) { this.x = x; }
    if (util.isNumber (y)) { this.y = y; }
    if (util.isNumber (z)) { this.z = z; }
  }
  this.constructor = TranslateAnimation;
}

TranslateAnimation.prototype = {

  /**
   * The translation value along the X axis
   * @public
   * @type {number}
   * @name vs.fx.TranslateAnimation#x
   */
  x: 0,

  /**
   * The translation value along the Y axis
   * @public
   * @type {number}
   * @name vs.fx.TranslateAnimation#y
   */
  y: 0,

  /**
   * The translation value along the Z axis
   * @public
   * @type {number}
   * @name vs.fx.TranslateAnimation#z
   */
  z: 0
};
util.extendClass (TranslateAnimation, Animation);

/**
 *  @class
 *  Rotate your object any number of degrees along the Z axis.
 *  <p>
 *
 *  @example
 *  // declare the animation
 *  var rotation = new vs.fx.RotateAnimation (50);
 *  rotation.process (comp);
 *
 *  // reconfigure the animation
 *  rotation.deg = 40;
 *  rotation.process (comp);
 *
 *  @author David Thevenin
 * @name vs.fx.RotateAnimation
 *
 *  @constructor
 *  Main constructor
 *  @extends vs.fx.Animation
 *
 * @param {number} deg The rotation value along the Z axis
*/
RotateAnimation = function (deg)
{
  this.parent = Animation;
  if (!arguments.length)
  {
    this.parent ();
  }
  else
  {
    this.parent (['rotate', '${deg}deg']);

    if (util.isNumber (deg)) { this.deg = deg; }
  }
  this.constructor = RotateAnimation;
}

RotateAnimation.prototype = {

  /**
   * The rotation value along the Z axis
   * @public
   * @type {number}
   * @name vs.fx.RotateAnimation#deg
   */
  deg: 0
};
util.extendClass (RotateAnimation, Animation);

/**
 *  @class
 *  Rotate your object any number of degrees over the X, Y and Z axes.
 *  <p>
 *
 *  @example
 *  // declare the animation
 *  var rotation = new vs.fx.RotateXYZAnimation (50, 50, 10);
 *  rotation.process (comp);
 *
 *  @author David Thevenin
 * @name vs.fx.RotateXYZAnimation
 *
 *  @constructor
 *  Main constructor
 *  @extends vs.fx.Animation
 *
 * @param {number} degX The rotation value along the X axis
 * @param {number} degY The rotation value along the Y axis
 * @param {number} degZ The rotation value along the Z axis
*/
RotateXYZAnimation = function (degX, degY, degZ)
{
  this.parent = Animation;
  if (!arguments.length)
  {
    this.parent ();
  }
  else
  {
    this.parent (['rotateX', '${degX}deg'],
      ['rotateY', '${degY}deg'], ['rotate' ,'${degZ}deg']);

    if (util.isNumber (degX)) { this.degX = degX; }
    if (util.isNumber (degY)) { this.degY = degY; }
    if (util.isNumber (degZ)) { this.degZ = degZ; }
  }
  this.constructor = RotateXYZAnimation;
}

RotateXYZAnimation.prototype = {

  /**
   * The rotation value along the X axis
   * @public
   * @type {number}
   * @name vs.fx.RotateXYZAnimation#degX
   */
  degX: 0,

  /**
   * The rotation value along the Y axis
   * @public
   * @type {number}
   * @name vs.fx.RotateXYZAnimation#degY
   */
  degY: 0,

  /**
   * The rotation value along the Z axis
   * @public
   * @type {number}
   * @name vs.fx.RotateXYZAnimation#degZ
   */
  degZ: 0
};
util.extendClass (RotateXYZAnimation, Animation);

/**
 *  @class
 *  Scale your object over the X and Y axes
 *  <p>
 *  If the second parameter is not provided, it is takes a value equal to
 *  the first.
 *
 *  @example
 *  // declare the animation
 *  var scale = new vs.fx.ScaleAnimation (0.5, 1);
 *  scale.process (comp);
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *  @extends vs.fx.Animation
 *
 * @name vs.fx.ScaleAnimation
 * @param {number} sx The scale value along the X axis
 * @param {number} sy The scale value along the Y axis
 * @param {number} sz The scale value along the Z axis
*/
ScaleAnimation = function (sx, sy, sz)
{
  this.parent = Animation;
  if (!arguments.length)
  {
    this.parent ();
  }
  else
  {
    if (!util.isNumber (sy) && !util.isNumber (sy))
    {
      // scale on X and Y axies
      this.parent (['scale', '${sx}']);
      this.sx = sx;
      this.sy = sx;
    }
    else
    {
      this.parent (
        ['scaleX', '${sx}'], ['scaleY', '${sy}'], ['scaleZ' ,'${sz}']
      );

      if (util.isNumber (sx)) { this.sx = sx; }
      if (util.isNumber (sy)) { this.sy = sy; }
      if (util.isNumber (sz)) { this.sz = sz; }
    }
  }
  this.constructor = ScaleAnimation;
}

ScaleAnimation.prototype = {

  /**
   * The scale value along the X axis
   * @public
   * @type {number}
   * @name vs.fx.ScaleAnimation#sx
   */
  sx: 1,

  /**
   * The scale value along the Y axis
   * @public
   * @type {number}
   * @name vs.fx.ScaleAnimation#sy
   */
  sy: 1,

  /**
   * The scale value along the Z axis
   * @public
   * @type {number}
   * @name vs.fx.ScaleAnimation#sz
   */
  sz: 1
};
util.extendClass (ScaleAnimation, Animation);


/**
 *  @class
 *  Skew your object over the X and Y axes
 *  <p>
 *  If the second parameter is not provided, it is takes a value equal to
 *  the first.
 *
 *  @example
 *  // declare the animation
 *  var scale = new vs.fx.SkewAnimation (0.5, 1);
 *  scale.process (comp);
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *  @extends vs.fx.Animation
 * @name vs.fx.SkewAnimation
 *
 * @param {number} x The scale value along the X axis
 * @param {number} y The scale value along the Y axis
*/
SkewAnimation = function (ax, ay)
{
  this.parent = Animation;
  if (!arguments.length)
  {
    this.parent ();
  }
  else
  {
    this.parent (['skew', '${ax}deg,${ay}deg']);

    if (util.isNumber (ax)) { this.ax = ax; }
    if (util.isNumber (ay)) { this.ay = ay; }
  }
  this.constructor = SkewAnimation;
}

SkewAnimation.prototype = {

  /**
   * Specifies a skew transformation along the X axis by the given angle.
   * @public
   * @type {number}
   * @name vs.fx.SkewAnimation#ax
   */
  ax: 0,

  /**
   *Specifies a skew transformation along the X axis by the given angle.
   * @public
   * @type {number}
   * @name vs.fx.SkewAnimation#ay
   */
  ay: 0
};
util.extendClass (SkewAnimation, Animation);

/**
 *  @class
 *  Animate the object' opacity
 *
 *  @example
 *  // declare the pulseo opacity animation
 *  var pulse = new vs.fx.OpacityAnimation (1);
 *  pulse.addKeyFrame ('from', {value: 1});
 *  pulse.addKeyFrame (12, {value: 0.5});
 *  pulse.addKeyFrame (25, {value: 1});
 *  pulse.addKeyFrame (37, {value: 0.5});
 *  pulse.addKeyFrame (50, {value: 1});
 *  pulse.addKeyFrame (62, {value: 0.5});
 *  pulse.addKeyFrame (75, {value: 1});
 *  pulse.addKeyFrame (87, {value: 0.5});
 *  pulse.durations = '7s';
 *  pulse.timings = vs.fx.Animation.LINEAR;
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *  @extends vs.fx.Animation
 * @name vs.fx.OpacityAnimation
 *
 * @param {number} value The opacity value
*/
OpacityAnimation = function (value)
{
  this.parent = Animation;
  if (!arguments.length)
  {
    this.parent ();
  }
  else
  {
    this.parent (['opacity', '${value}']);

    if (util.isNumber (value)) { this.value = value; }
  }
  this.constructor = OpacityAnimation;
}

OpacityAnimation.prototype = {

  /**
   * Specifies the opacity value
   * @public
   * @name vs.fx.OpacityAnimation#value
   * @type {number}
   */
  value: 1
};
util.extendClass (OpacityAnimation, Animation);

/*************************************************************
                Predefined animation
*************************************************************/

/**
 *  Slide a object to right.
 * @name vs.fx.Animation.SlideOutRight
 *  @type vs.fx.Animation
 */
Animation.SlideOutRight = new Animation (['translateX', '$width']);
Animation.SlideOutRight.addKeyFrame (0, ['0px']);
/**
 *  Slide a object to left.
 * @name vs.fx.Animation.SlideOutLeft
 *  @type vs.fx.Animation
 */
Animation.SlideOutLeft = new Animation (['translateX', '-$width']);
Animation.SlideOutLeft.addKeyFrame (0, ['0px']);

/**
 *  Slide a object to top.
 * @name vs.fx.Animation.SlideOutTop
 *  @type vs.fx.Animation
 */
Animation.SlideOutTop = new Animation (['translateY', '-$height']);
Animation.SlideOutTop.addKeyFrame (0, ['0px']);

/**
 *  Slide a object to left.
 * @name vs.fx.Animation.SlideOutBottom
 *  @type vs.fx.Animation
 */
Animation.SlideOutBottom = new Animation (['translateY', '$height']);
Animation.SlideOutBottom.addKeyFrame (0, ['0px']);

/**
 *  Slide a object to right.
 * @name vs.fx.Animation.SlideInRight
 *  @type vs.fx.Animation
 */
Animation.SlideInRight = new Animation (['translateX', '0px']);
Animation.SlideInRight.addKeyFrame (0, ['$width']);

/**
 *  Slide a object to left.
 * @name vs.fx.Animation.SlideInLeft
 *  @type vs.fx.Animation
 */
Animation.SlideInLeft = new Animation (['translateX', '0px']);
Animation.SlideInLeft.addKeyFrame (0, ['-$width']);

/**
 *  Slide a object to top.
 * @name vs.fx.Animation.SlideInTop
 *  @type vs.fx.Animation
 */
Animation.SlideInTop = new Animation (['translateY', '0px']);
Animation.SlideInTop.addKeyFrame (0, ['-$height']);

/**
 *  Slide a object to left.
 * @name vs.fx.Animation.SlideInBottom
 *  @type vs.fx.Animation
 */
Animation.SlideInBottom = new Animation (['translateY', '0px']);
Animation.SlideInBottom.addKeyFrame (0, ['$height']);

/**
 *  Fade in an object.
 * @name vs.fx.Animation.FadeIn
 *  @type vs.fx.Animation
 */
Animation.FadeIn = new Animation (['opacity', '1']);
Animation.FadeIn.addKeyFrame (0, ['0']);

/**
 *  Fade out an object.
 * @name vs.fx.Animation.FadeOut
 *  @type vs.fx.Animation
 */
Animation.FadeOut = new Animation (['opacity', '0']);
Animation.FadeOut.addKeyFrame (0, ['1']);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.Animation = Animation;
fx.cancelAnimation = cancelAnimation;
fx.TranslateAnimation = TranslateAnimation;
fx.RotateAnimation = RotateAnimation;
fx.RotateXYZAnimation = RotateXYZAnimation;
fx.ScaleAnimation = ScaleAnimation;
fx.SkewAnimation = SkewAnimation;
fx.OpacityAnimation = OpacityAnimation;
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
 *  The Generic vs.fx.Controller class
 *
 *  @see vs.fx.SlideController
 *  @see vs.fx.CardController
 *  @see vs.fx.NavigationController
 *  @extends vs.core.EventSource
 *
 *  @class
 *  This class can be used to implement your custom GUI controller.
 *  <p/>
 *  Before developing your own controller you can try the SlideController
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
  this.parent = core.EventSource;
  this.parent ();
  this.constructor = Controller;

  if (owner)
  {
    this._fsm = new core.Fsm (this);
  
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

    util.free (this._fsm);
    core.EventSource.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    core.EventSource.prototype.initComponent.call (this);

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
    if (util.isString (comp) && data.id)
    { state_id = data.id; }
    else if (!util.isString (comp) && comp.id)
    { state_id = comp.id; }
    else { state_id = core.createId (); }
    
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
    if (util.isString (comp))
    { state_id = comp; }
    else if (!util.isString (comp))
    { state_id = comp.id; }
    
    var state = this._fsm._list_of_state [state_id];
    if (state && state.comp)
    {
      this._owner._ab_controller_remove (state.comp);
    }
    this._fsm.removeState (state_id);
  },

  /**
   *  @private
   *
   *   set the component associated to a state
   *
   * @name vs.fx.Controller#setStateComponentInformation
   * @function
   *
   * @param {String} state_id the state's name 
   * @param {String | vs.ui.View} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} init_data Optional data for the component 
   *                   constructor [optional]
   */
  setStateComponentInformation : function (state_id, comp, extension, init_data)
  {
    if (!state_id || !this._fsm || !this._fsm.existState (state_id)) { return; }
    if (!comp || !this._owner) { return; }
    
    if (!init_data) { init_data = {}; }
    else { init_data = util.clone (init_data); }
    
    var state = this._fsm._list_of_state [state_id];
    state.init_data = init_data;
    
    if (util.isString (comp))
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
      } catch (e) { console.error (e); }
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
      catch (e) { console.error (e); }
    };
    setTimeout (function () {runAnimation ();}, 0);
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
    
    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (clb instanceof Function)
      {
        clb.call (this._owner, event);
      }
      else if (util.isString (clb))
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
util.extendClass (Controller, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Controller, {
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
fx.Controller = Controller;
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
   * @param {String} id The state id (component id)
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   */
  goToViewId : function (id, clb, instant)
  {
    var pos = this._states_array.findItem (id);
    if (pos === -1) { return false; }
    
    this.goToViewAt (pos, clb, instant);
  },

  /**
   *  Go to the view specified by its position (index start at 0)
   *
   * @name vs.fx.StackController#goToViewAt
   * @function
   *
   * @param {number} index The component index
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   */
  goToViewAt : function (pos, clb, instant)
  {
    if (pos < 0) { return false; }
    if (pos > this._states_array.length) { return false; }
    
    var current_pos = this._states_array.findItem (this._fsm._current_state);
    if (current_pos === pos) { return true; }
    
    var state_from = this._fsm._list_of_state [this._fsm._current_state];
    if (pos > current_pos)
    {
      while (current_pos < pos - 1)
      {
        this._fsm.fsmNotify (StackController.NEXT, null, true);
        current_pos ++;
      }
      this._fsm.fsmNotify (StackController.NEXT, null, true);
      
      var state_to = this._fsm._list_of_state [this._fsm._current_state];
      this._stackAnimateComponents (1, state_from.comp, state_to.comp, clb, instant);
    }
    else
    {
      while (pos + 1 < current_pos )
      {
        this._fsm.fsmNotify (StackController.PRED, null, true);
        current_pos --;
      }
      this._fsm.fsmNotify (StackController.PRED, null, true);

      var state_to = this._fsm._list_of_state [this._fsm._current_state];
      this._stackAnimateComponents (-1, state_from.comp, state_to.comp, clb, instant);
    }
  },

  /**
   *  @protected
   */
  _stackAnimateComponents : function (order, fromComp, toComp, clb, instant)
  {},
  
  /**
   *  @protected
   *  do nothing, will be managed by _stackAnimateComponents
   */
  _animateComponents :
    function (fromComp, toComp, animationOut, animationIn, animation_clb, instant)
  {},
  
  /**
   * Go to the next view if it exist.
   *
   * @name vs.fx.StackController#goToNextView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToNextView : function (clb, instant)
  {
    var state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.fsmNotify (StackController.NEXT, null, true),
      state_to = this._fsm._list_of_state [this._fsm._current_state];

    if (r) this._stackAnimateComponents (1, state_from.comp, state_to.comp, clb, instant);
    return r;
  },

  /**
   * Go to the previous view if it exist.
   *
   * @name vs.fx.StackController#goToPreviousView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToPreviousView : function (clb, instant)
  {
    var state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.fsmNotify (StackController.PRED, null, true),
      state_to = this._fsm._list_of_state [this._fsm._current_state];

    if (r) this._stackAnimateComponents (-1, state_from.comp, state_to.comp, clb, instant);
    return r;
  },

  /**
   * Go to the first view
   *
   * @name vs.fx.StackController#goToFirstView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible
   */
  goToFirstView : function (clb, instant)
  {
    var state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.fsmNotify (StackController.FIRST, null, true),
      state_to = this._fsm._list_of_state [this._fsm._current_state];

    if (r) this._stackAnimateComponents (-1, state_from.comp, state_to.comp, clb, instant);
    return r;
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
          vs.addPointerListener (this._owner.view, core.POINTER_START, this._owner, false);
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
          vs.removePointerListener (this._owner.view, core.POINTER_START, this._owner, false);
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
 *  The vs.fx.SlideController class <br />
 *  This layer manage a list of children using a horizontal layout.
 *
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the slider is horizontal, but you can change it using the 
 *  property "orientation".
 *  <p />
 *  The following example shows a typical example with panels
 *  (components 1 to 4) that are shows sequentially according user touch slide.
 *
 *  <pre>
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡ˉˉˉˉˉˉ⎤    ⎢ ⎡ˉˉˉˉˉˉ⎤ ⎢   ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟      ⎢    ⎢ ⎢      ⎢ ⎢   ⎟      ⎢   ⎟      ⎢
 *   ⎟  (1) ⎢    ⎢ ⎢  (2) ⎢ ⎢   ⎟  (3) ⎢   ⎟  (4) ⎢
 *   ⎟      ⎢    ⎢ ⎢      ⎢ ⎢   ⎟      ⎢   ⎟      ⎢
 *   ⎣______⎦    ⎢ ⎣______⎦ ⎢   ⎣______⎦   ⎣______⎦
 *                ⎣____________⎦
 *
 *
 *  (*) : device screen
 *  (1, ... ,4) : components managed by the SliderLayer
 *
 *   </pre>
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
 *  @example
 *  var layer = new vs.fx.SlideController (myComp);
 *
 *  layer.push ('APanel', {id: '1', data: {...}});
 *  layer.push ('APanel', {id: '2', data: {...}});
 *  layer.push ('APanel', {id: '3', data: {...}});
 *  layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.SlideController
 *  @class
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.fx.SlideController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 */
var SlideController = vs.core.createClass ({

  parent: vs.fx.StackController,
  
  /********************************************************************
                    protected members declarations
  ********************************************************************/
  /**
   *
   * @protected
   * @type {number}
   */
  _delta : 0,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : 0,
    
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_out_left : null,
  
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_out_right : null,
    
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_in : null,

  /**
   *
   * @protected
   * @type {number}
   */
  _animation_mode : 0,

  /********************************************************************
                    Define class properties
  ********************************************************************/

  properties: {
    'orientation': {
      /** 
       * Getter|Setter for page slide orientation. It can take the value
       * vs.fx.SlideController.HORIZONTAL or vs.fx.SlideController.VERTICAL.
       * By default the slider is horizontal.
       * @name vs.fx.SlideController#orientation 
       * @type String
       */ 
      set : function (v)
      {
        var state, state_id, i = 0, pos = 0;
      
        if (v !== SlideController.HORIZONTAL &&
            v !== SlideController.VERTICAL) { return; }
      
        this._orientation = v;
        this._updateViewSize ();
      },
  
      /** 
       * @ignore
       * @return {String}
       */ 
      get : function ()
      {
        return this._orientation;
      }
    },
    
    'animationDuration': {
      /** 
       * Set the animation/transition temporisation (in millisecond)
       * @name vs.fx.SlideController#animationDuration 
       * @type {number}
       */ 
      set : function (v)
      {
        if (!v) { v = 0; }
        if (!util.isNumber (v)) { return };
      
        this._animation_duration = v;
        this._transition_out_left.duration = this._animation_duration + 'ms';
        this._transition_out_right.duration = this._animation_duration + 'ms';
        this._transition_in.duration = this._animation_duration + 'ms';
      }
    },
    
    'animationMode': {
      /** 
       * Set XXX
       * @name vs.fx.SlideController#animationMode 
       * @type {number}
       */ 
      set : function (v)
      {
        if (!v) { v = 0; }
        if (v !== SlideController.POURCENTAGE &&
            v !== SlideController.PIXEL) return;
        if (this._animation_mode === v) return;
        
        this._animation_mode = v;
        
        util.free (this._transition_out_right);
        util.free (this._transition_out_left);
        
        this._setUpAnimations ();
        this._updateViewSize ();
      }
    }
  },

  constructor : function (owner)
  {
    this._super (owner);
    
    this._orientation = SlideController.HORIZONTAL;

    if (!arguments.length) return;
  
    this._setUpAnimations ();
    this._transition_in = new Animation (['translate', '0,0,0']);
 
    this.animationDuration = SlideController.ANIMATION_DURATION;
  },

  /*********************************************************
   *                 behavior update
   *********************************************************/
  /**
   * @protected
   * @function
   */
  _setUpAnimations : function ()
  {
    switch (this._animation_mode)
    {
      case SlideController.POURCENTAGE:
        this._transition_out_left = new Animation (['translate', '${x}%,${y}%,0']);
        this._transition_out_right = new Animation (['translate', '${x}%,${y}%,0']);
      break;

      case SlideController.PIXEL:
        this._transition_out_left = new Animation (['translate', '${x}px,${y}px,0']);
        this._transition_out_right = new Animation (['translate', '${x}px,${y}px,0']);
      break;
    }

    this._transition_out_left.x = 0;
    this._transition_out_left.y = 0;
    this._transition_out_left.duration = this._animation_duration + 'ms';
    this._transition_out_right.duration = this._animation_duration + 'ms';
  },
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {
    var i, state_id, state, transform, delta, size;
    switch (this._animation_mode)
    {
      case SlideController.POURCENTAGE:
        delta = 100;
        delta_str = delta + "%";
      break;

      case SlideController.PIXEL:
        size = this._owner.size;
        
        if (this._orientation === SlideController.HORIZONTAL)
        {
          delta = size [0];
        }
        else if (this._orientation === SlideController.VERTICAL)
        {
          delta = size [1];
        }
        delta_str = delta + "px";
      break;
    }

    if (this._orientation === SlideController.HORIZONTAL)
    {
      this._transition_out_left.x = -delta;
      this._transition_out_left.y = 0;
      this._transition_out_right.x = delta;
      this._transition_out_right.y = 0;
    }
    else if (this._orientation === SlideController.VERTICAL)
    {
      this._transition_out_left.x = 0;
      this._transition_out_left.y = -delta;
      this._transition_out_right.x = 0;
      this._transition_out_right.y = delta;
    }
    
    // define transformation for view before current one
    if (this._orientation === SlideController.HORIZONTAL)
    {
      transform = "translate3D(-" + delta_str + ",0,0)";
    }
    else if (this._orientation === SlideController.VERTICAL)
    {
      transform = "translate3D(0,-" + delta_str + ",0)";
    }
    
    for (i = 0; i < this._states_array.length; i++)
    {
      state_id = this._states_array [i];
      state = this._fsm._list_of_state [state_id];
      
      if (!state || !state.comp) { continue; }
      
      if (this._fsm._current_state === state_id)
      {
        // define transformation for view after current one
        if (this._orientation === SlideController.HORIZONTAL)
        {
          transform = "translate3D(" + delta_str + ",0,0)";
        }
        else if (this._orientation === SlideController.VERTICAL)
        {
          transform = "translate3D(0," + delta_str + ",0)";
        }
        
        // set no transformation for the current one
        state.comp.view.style.webkitTransitionDuration = '0';
        setElementTransform (state.comp.view, "translate3D(0,0,0)");
        continue;
      }
      
      state.comp.view.style.webkitTransitionDuration = '0';
      setElementTransform (state.comp.view, transform);
    } 
  },
  
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
   *  var myController = new vs.fx.SlideController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.SlideController#push
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
    
    // create the second view 
    state = this._fsm._list_of_state [state_id];
    if (!state)
    {
      console.error ("Unknown error in vs.fx.StackController.push");
      return;
    }
    if (this._last_comp_id === this._initial_component)
    {
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
      state.comp.setStyle ('z-index', this.__nb_panels);
      this.configureNewComponent (state.comp);
    }
    else
    {
      if (state.comp)
      {
        state.comp.setStyle ('z-index', this.__nb_panels);
        this.configureNewComponent (state.comp);
      }
    }
    
    this._last_comp_id = state_id;
    return state_id;
  },
  
  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
    var transform, delta_str, size;
          
    switch (this._animation_mode)
    {
      case SlideController.POURCENTAGE:
        delta_str = "100%";
      break;

      case SlideController.PIXEL:
        size = this._owner.size;
        
        if (this._orientation === SlideController.HORIZONTAL)
        {
          delta_str = size [0] + "px";
        }
        else if (this._orientation === SlideController.VERTICAL)
        {
          delta_str = size [1] + "px";
        }
      break;
    }

    if (this._orientation === SlideController.HORIZONTAL)
    {
      transform = "translate3D(" + delta_str + ",0,0)";
    }
    else if (this._orientation === SlideController.VERTICAL)
    {
      transform = "translate3D(0," + delta_str + ",0)";
    }

    comp.view.style.webkitTransitionDuration = '0';
    setElementTransform (comp.view, transform);
    comp.hide ();
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
    var t_ok = false, size = this.size,
      duration = this.__controller__._animation_duration;
          
    if (event.type === core.POINTER_START)
    {
      if (this.__controller__._orientation === SlideController.HORIZONTAL)
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

      vs.addPointerListener (document, core.POINTER_END, this, true);
      vs.addPointerListener (document, core.POINTER_MOVE, this, true);
      
      this.animationDuration = 0;
      this.__delta = 0;
    }
    else if (event.type === core.POINTER_MOVE)
    {
      event.preventDefault ();
      if (this.__controller__._orientation === SlideController.HORIZONTAL)
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientX - this.__pos; }
        else
        {  this.__delta = event.clientX - this.__pos; }
      }
      else
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        {  this.__delta = event.clientY - this.__pos; }
      }  
    }
    else if (event.type === core.POINTER_END)
    {
      if (this.__delta > 50)
      {
        t_ok = this.__controller__.goToPreviousView ();
      }
      else if (this.__delta < -50)
      {
        t_ok = this.__controller__.goToNextView ();
      }
      if (!t_ok)
      {
        if (this.__controller__._orientation === SlideController.HORIZONTAL)
        {
          duration = Math.floor (duration * this.__delta / size [0]);
          this.animationDuration = duration;
        }
        else
        {
          duration = Math.floor (duration * this.__delta / size [1]);
          this.animationDuration = duration;
        }
      }
      vs.removePointerListener (document, core.POINTER_END, this, true);
      vs.removePointerListener (document, core.POINTER_MOVE, this, true);
    }
  },
  
  /**
   * @protected
   * @function
   */
  refresh: function ()
  {
    StackController.prototype.refresh.call (this);
    this._updateViewSize ();
  },
  
  /**
   *  @protected
   */
  _stackAnimateComponents : function (order, fromComp, toComp, clb, instant)
  {
    var animationIn = this._transition_in, animationOut,
      setPosition, durations_tmp;
    if (order > 0)
    {
      setPosition = this._transition_out_right;
      animationOut = this._transition_out_left;
    }
    else
    {
      setPosition = this._transition_out_left;
      animationOut = this._transition_out_right;
    }
    
    durations_tmp = setPosition.durations;
    setPosition.durations = '0s';
    
    var self = this, callback = function ()
    {
      fromComp.hide ();
      try
      {
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
        if (clb) clb.call (self._owner);
      } catch (e) { console.error (e); }
    },
    
    runAnimation = function ()
    {
      setPosition.durations = durations_tmp;
      try
      {
        toComp.show ();
        toComp.refresh ();
        setTimeout (function () {
          if (instant)
          {
            var inDurations = animationIn.durations;
            animationIn.durations = '0s';
            var outDurations = animationOut.durations;
            animationOut.durations = '0s';
          }
          animationIn.process (toComp, callback, self);
          animationOut.process (fromComp); 

          if (instant)
          {
            animationIn.durations = inDurations;
            animationOut.durations = outDurations;
          }
        }, 0);
      }
      catch (e) { console.error (e); }
    };
    setPosition.process (toComp, function () {
      setTimeout (function () {runAnimation ();}, 0);
    });
  } 
});

/**
 * The duration of the animation between two views
 *
 * @name vs.fx.SlideController.ANIMATION_DURATION
 */
SlideController.ANIMATION_DURATION = 300;

/**
 * Horizontal slide (defaut)
 *
 * @name vs.fx.SlideController.HORIZONTAL
 * @const
 */
SlideController.HORIZONTAL = 0;

/**
 * Vertical slide
 *
 * @name vs.fx.SlideController.VERTICAL
 * @const
 */
SlideController.VERTICAL = 1;


/**
 * Horizontal slide (defaut)
 *
 * @name vs.fx.SlideController.POURCENTAGE
 * @const
 */
SlideController.POURCENTAGE = 0;

/**
 * Vertical slide
 *
 * @name vs.fx.SlideController.PIXEL
 * @const
 */
SlideController.PIXEL = 1;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.SlideController = SlideController;
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
 *  The vs.fx.NavigationController class implements a controller for navigating
 *  on hierarchical contents.
 *
 *  @extends vs.fx.Controller
 *
 *  @class
 *  The vs.fx.NavigationController class implements a controller for navigating
 *  on hierarchical contents.
 *  <p/>
 *  The controller shows a first view (the initialComponent) and allows to
 *  navigate from this first view to a second view and a third ... and back
 *  to the previous one til the first view.
 *  <p/>
 *  The next picture shows a example of hierarchical contents navigation.
 *
 *  <pre>                 
 *                
 *   ⎡ˉˉˉˉˉˉ⎤    ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟      ⎢__> ⎢      ⎢__>⎟      ⎢ 
 *   ⎟  (1) ⎢    ⎢  (2) ⎢   ⎟  (3) ⎢
 *   ⎟      ⎢<__ ⎢      ⎢<__⎟      ⎢
 *   ⎣______⎦    ⎣______⎦   ⎣______⎦
 *        | |   
 *        | |    ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *        | ⎣__>⎢      ⎢-->⎟      ⎢
 *        | |    ⎢  (4) ⎢   ⎟  (5) ⎢ 
 *        | |<___⎢      ⎢<__⎟      ⎢
 *        |      ⎣______⎦   ⎣______
 *        |            |   
 *        |            |    ⎡ˉˉˉˉˉˉ⎤
 *        |            ⎣__>⎢      ⎢
 *        |            |    ⎢  (6) ⎢
 *        |            |<___⎢      ⎢
 *        |                 ⎣______⎦
 *        |   
 *        |    ⎡ˉˉˉˉˉˉ⎤
 *        ⎣__>⎢      ⎢
 *        |    ⎢  (7) ⎢
 *        |<___⎢      ⎢
 *             ⎣______⎦
 *
 * 
 *  (1, ... ,7) : component's views managed by the SliderLayer
 *
 *  </pre>
 *  The controller can manage a navigation bar during the user navigates.
 *  For instance it can hides or shows components (button, label, ...) and/or
 *  reconfigurate them. (for instance change the text value of a label.
 *  <p/>
 *  Example:
 *  <pre class='code'>
 *  this.controller = new vs.fx.NavigationController (this, this.navBar);
 *  this.controller.init ();
 *  
 *  // 1.1 put the first view into the controller
 *  this.controller.push (this.firstView);
 *  // 1.2 configure the navigation bar for the first view (nothing)
 *  this.controller.configureNavigationBarState (this.firstView.id, []);
 *  // 1.3 finally configure the first view as the initial component
 *  this.controller.initialComponent = this.firstView.id;
 *  
 *  var backId = this.navBar.backButton.id;
 *  var titleId = this.navBar.title.id;
 *
 *  // 2.1 set the second view, with parameters
 *  var id = this.controller.push ('PanelOne', {position: [0, 44]});
 *  // 2.2 configure the navigation bar to show the back button, the title
 *  //  and set the text title
 *  this.controller.configureNavigationBarState
 *    (id, [{comp: backId}, 
 *          {comp: titleId, properties: {text: 'Panel One'}}]);    
 *  // 2.3 configure the transition between the first and second view
 *  this.controller.configureTransition (this.firstView.id, id, 'goToOne');
 *  
 *  // 3 set the third view
 *  id = this.controller.push ('PanelTwo', {position: [0, 44]});
 *  this.controller.configureNavigationBarState
 *    (id, [{comp: backId}, 
 *          {comp: titleId, properties: {text: 'Panel Two'}}]);    
 *  this.controller.configureTransition (this.firstView.id, id, 'goToTwo');
 *  
 *  // 3 set the last view
 *  id = this.controller.push ('PanelThree', {position: [0, 44]});
 *  this.controller.configureNavigationBarState
 *    (id, [{comp: backId}, 
 *          {comp: titleId, properties: {text: 'Panel Three'}}]);    
 *  this.controller.configureTransition (this.firstView.id, id, 'goToThree');
 * 
 *  </pre>
 * 
 *  @author David Thevenin
 * @name vs.fx.NavigationController
 *
 *  @constructor
 *   Creates a new vs.fx.NavigationController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 * @param {number} animationType Select the animation use during transition. 
 *     [optional]
 */
function NavigationController (owner, navBar, type)
{
  this.parent = Controller;
  this.parent (owner);
  this.constructor = NavigationController;
  
  if (!arguments.length) return;
  
  if (type == NavigationController.NO_ANIMATION ||
      type == NavigationController.CARD_ANIMATION ||
      type == NavigationController.SLIDE_ANIMATION)
  { this._animation_type = type; }
  
  else
  { this._animation_type = NavigationController.DEFAULT_ANIMATION; }
     
  this.setNavigationBar (navBar);
  
  this.__nav_bar_states = {};
}

/**
 *  There is no animation during transition between two views.
 *  <br />
 *  If the platform you are targeting does not support animations or
 *  does not support accelerated animations, you should use this
 *  configuration.
 *
 * @name vs.fx.NavigationController.NO_ANIMATION
 */
NavigationController.NO_ANIMATION = 0;

/**
 * There is card animation during transition between two views.
 *
 * @name vs.fx.NavigationController.CARD_ANIMATION
 */
NavigationController.CARD_ANIMATION = 1;

/**
 * There is slide animation during transition between two views.
 *  <br />
 *  This is the default configuration
 *
 * @name vs.fx.NavigationController.SLIDE_ANIMATION
 */
NavigationController.SLIDE_ANIMATION = 2;

/**
 * Select the default animation configuration (Slide animations)
 *
 * @name vs.fx.NavigationController.DEFAULT_ANIMATION
 */
NavigationController.DEFAULT_ANIMATION = 
  NavigationController.SLIDE_ANIMATION;

/**
 * @private
 */
NavigationController.BACK = 'back';

NavigationController.prototype = {

  /**
   * @protected
   * @function
   */
  _nav_bar : null,

  /**
   * @protected
   * @function
   */
  __nav_bar_states : null,

  /**
   * @protected
   * @function
   */
  _animation_type : NavigationController.DEFAULT_ANIMATION,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    Controller.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    Controller.prototype.initComponent.call (this);
   
    var size = this._owner.size;
    

    this.__translate_in_right = new TranslateAnimation (0);
    this.__translate_out_right = new Animation (['translate', '100%,0,0']);
    this.__translate_out_left = new Animation (['translate', '-100%,0,0']);
    this.__translate_in_left = new TranslateAnimation (0);
  },

  /**
   *  Defines the Navigation Bar
   *
   * @name vs.fx.NavigationController#setNavigationBar
   * @function
   *
   * @param {vs.ui.NavigationBar} navBar the ab bar
   */
  setNavigationBar : function (navBar)
  {
    if (!navBar || !navBar instanceof ui.NavigationBar) { return; }
    
    this._nav_bar = navBar;
  },
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {},
  
  /**
   *  Add the a child component to the Navigation Controller
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
   *  myComp.controller = new vs.fx.NavigationController (myComp);
   *
   *  // push a component name (the component will be instanciated when needs)
   *  myComp.controller.push ('AComponent1', {id: 'comp1'});
   *
   *  // instanciate a component and push it 
   *  var comp2 = myComp.createAndAddComponent ('AComponent1', {id: 'comp2'});
   *  myComp.controller.push (comp2);
   *
   *  // create a button object and push it
   *  var comp3 = new vs.ui.Button ({id: 'comp3', text: 'hello'});
   *  myComp.controller.push (comp3);
   *  myComp.controller.initComponent = comp2.id;
   *
   * @name vs.fx.NavigationController#push
   * @function
   *
   * @param {String | vs.ui.View} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} config Configuration structure need to build the 
   *     component [optional]
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, bindings)
  {
    if (!comp) { return; }
    if (!data) { data = {}; }
    
    var size, state_id =
      Controller.prototype.push.call (this, comp, data, null, bindings);
    if (!state_id) { return; }

    var state = this._fsm._list_of_state [state_id];
    if (state && state.comp)
    {
      this.configureNewComponent (state.comp);
    }

    return state_id;
  },
  
  /**
   *
   * @param {String} state The state (component id)  
   * @param {Array} configurations configuration parameters 
   *     Structure have to follow : [{comp: vs.core.Object|String, properties:{prop_name: value}}
   *
   * @name vs.fx.NavigationController#configureNavigationBarState
   * @function
   */
  configureNavigationBarState : function (state_id, configurations)
  {
    var state = this._fsm._list_of_state [state_id], comp, i, l, conf,
      components = [], state_conf = {};
    if (!state || !configurations)
    { return; }
    
    for (i = 0, l = configurations.length; i < l; i++)
    {
      conf = configurations [i];
      if (!conf) { continue; }
      
      comp = conf.comp;
      if (!comp) { continue; }
      
      // component is specified by an id
      if (util.isString (comp))
      { comp = core.Object._obs [comp]; }
      
      if (!comp instanceof vs.ui.View)
      { continue; }
      
      components.push (comp);
      if (conf.properties)
      {
        state_conf [comp.id] = conf.properties;
      }
    }
    
    this.__nav_bar_states [state_id] = state_conf;
    if (this._nav_bar)
    {
      this._nav_bar.setStateItems (state_id, components);
    }
  },
  
  /**
   *   Add a new transition from the state "from" to the state "to".
   *   The states have to be already specified.
   *
   * @name vs.fx.NavigationController#configureTransition
   * @function
   *
   * @param {string} from State from
   * @param {string} to State to
   * @param {string} on input lexem which cause the crossing of transition
   * @param {string} output optional ouput lexem that will be produce by the 
   *                  transition
   * @param {string} anim optional animation name
   */
  configureTransition : function (from, to, on)
  {
    if (!from || !this._fsm.existState (from)) { return; }
    if (!to || !this._fsm.existState (to)) { return; }
    if (!on) { return; }
    
    if (!this._fsm.existInput (on)) { this._fsm.addInput (on); }
    
    if (this._animation_type === NavigationController.SLIDE_ANIMATION)
    {
      this.addTransition (from, to, on,
        this.__translate_out_left, this.__translate_in_right);
        
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, this.__translate_in_left);

      this.__translate_in_left.duration = "300ms" 
      this.__translate_out_left.duration = "300ms" 
      this.__translate_in_right.duration = "300ms" 
      this.__translate_out_right.duration = "300ms" 
    }
    else if (this._animation_type === NavigationController.CARD_ANIMATION)
    {
      this.addTransition (from, to, on,
        null, this.__translate_in_right);
                
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, null);

      this.__translate_in_right.duration = "300ms" 
      this.__translate_out_right.duration = "300ms" 
    }
    else // no animation
    {
      this.addTransition (from, to, on,
        null, this.__translate_in_right);
                
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, null);

      this.__translate_in_right.duration = "0" 
      this.__translate_out_right.duration = "0" 
    }
  },
  

  /*********************************************************
   *                 FSM management
   *********************************************************/

  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
    var animation = this.__translate_out_right,
      duration = animation.duration;
    
    // apply the transformation without animation (duration = 0s)
    animation.duration = '0s';
    
    animation.process (comp, function () {
      animation.duration = duration;
    });
  },

  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.fx.NavigationController#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   */
  goTo : function (state_id, output, event, instant)
  {
    var ok = 
      Controller.prototype.goTo.call (this, state_id, output, event, instant);
 
    if (ok && this.owner._nav_bar)
    {
      this.owner._nav_bar.changeState
        (state_id, this.owner.__nav_bar_states [state_id]);
    }
  },
  
  /**
   *  @protected
   *  do nothing, will be managed by _stackAnimateComponents
   */
  _animateComponents : fx.Controller.prototype._animateComponents
};
util.extendClass (NavigationController, StackController);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (NavigationController, {
  'viewSize': {
   /** 
     * Getter|Setter for view size.
     * @name vs.fx.NavigationController#viewSize 
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
  'initialComponent': {
    /**
     *  Define the initiale component
     *  Generate a exception if the component was not already registered
     *
     * @name vs.fx.NavigationController#initialComponent 
     * @param {string} state_id the state
     */
    set : function (comp_id)
    {
      if (!comp_id)
      {
        this._initial_component = undefined;
        return;
      }
      
      if (!this._fsm.existState (comp_id)) { return; }
  
      // set initial state and go to it   
      this._initial_component = comp_id;
      this._fsm.initialState = comp_id;
      
      this._fsm.goTo (comp_id);
      var state = this._fsm._list_of_state [comp_id],
        animation = this.__translate_in_right,
        duration = animation.duration;
          
      if (state && state.comp)
      {
        // apply the transformation without animation (duration = 0s)
        animation.duration = '0s';
    
        animation.process (state.comp, function () {
          animation.duration = duration;
        });
      }
    },
    
    /**
     * @ignore
     */
    get : function ()
    {
      return this._initial_component;
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.NavigationController = NavigationController;
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
 *  The vs.fx.CardController class <br />
 *  @class
 *  This layer manage a list of children using a card style animation.
 *  <p />
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the card slide to left out. You can change it using the 
 *  property "direction". You can configure it with four directions:
 *  <ul>
 *    <li>vs.fx.CardController.LEFT_OUT
 *    <li>vs.fx.CardController.RIGHT_OUT
 *    <li>vs.fx.CardController.TOP_OUT
 *    <li>vs.fx.CardController.BOTTOM_OUT
 *  </ul>
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
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller),
 *         Called when the view changed
 *    <li/>controllerAnimationDidEnd : function (from vs.ui.View, to vs.ui.View, controller), Called just after 
 *         the animation ended
 *  </ul>
 *  <p>
 *  @example
 *  var myController = new vs.fx.CardController (myComp);
 *  myLayer.init ();
 *
 *  myController.push ('APanel', {id: '1', data: {...}});
 *  myController.push ('APanel', {id: '2', data: {...}});
 *  myController.push ('APanel', {id: '3', data: {...}});
 *  myController.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.CardController
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.fx.CardController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 */
var CardController = vs.core.createClass ({

  parent: vs.fx.StackController,

  /********************************************************************
                    protected members declarations
  ********************************************************************/
  
  /**
   *
   * @protected
   * @type {number}
   */
  _direction : 0,

  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_out : null,
  
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_in : null,  

  /********************************************************************
                    Define class properties
  ********************************************************************/

  properties : {

    'direction': {
      /** 
       * Getter|Setter Card slide direction 
       * @name vs.fx.CardController#direction 
       * @type String
       */ 
      set : function (v)
      {
        var state, state_id, i = 0, pos = 0, index, transform = '';
      
        if (v !== CardController.LEFT_OUT &&
            v !== CardController.RIGHT_OUT &&
            v !== CardController.BOTTOM_OUT &&
            v !== CardController.TOP_OUT) { return; }
      
        this._direction = v;
        this._updateViewSize ();
      },
  
      /** 
       * @ignore
       * @return {String}
       */ 
      get : function ()
      {
        return this._direction;
      }
    },

    'animationDuration': {
      /** 
       * Set the animation/transition temporisation (in millisecond)
       * @name vs.fx.CardController#animationDuration 
       * @type {number}
       */ 
      set : function (v)
      {
        if (!v) { v = 0; }
        if (!util.isNumber (v)) { return };
      
        this._animation_duration = v;
        if (this._transition_out)
          this._transition_out.duration = this._animation_duration + 'ms';
        if (this._transition_in)
          this._transition_in.duration = this._animation_duration + 'ms';
      }
    }
  },
  
  constructor : function (owner)
  {
    this._super (owner);

    if (owner)
    {
      this._transition_out = new Animation (['translate', '${x}%,${y}%,0']);
      this._transition_out.x = 0;
      this._transition_out.y = 0;
      
      this._transition_in = new Animation (['translate', '${x}%,${y}%,0']);
      this._transition_in.x = 0;
      this._transition_in.y = 0;
  
      this.animationDuration = CardController.ANIMATION_DURATION;
    }

    this._direction = CardController.RIGHT_OUT;
  },

  /*********************************************************
   *                behavior update
   *********************************************************/
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {
    if (!this._transition_out) return;
    
    if (this._direction === CardController.LEFT_OUT)
    {
      this._transition_out.x = -100;
      this._transition_out.y = 0;
    }
    else if (this._direction === CardController.RIGHT_OUT)
    {
      this._transition_out.x = 100;
      this._transition_out.y = 0;
    }
    else if (this._direction === CardController.BOTTOM_OUT)
    {
      this._transition_out.x = 0;
      this._transition_out.y = 100;
    }
    else
    {
      this._transition_out.x = 0;
      this._transition_out.y = -100;
    }
  },

  /*********************************************************
   *                  Event management
   *********************************************************/

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
   *  var myController = new vs.fx.CardController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.CardController#push
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
   
    // create the second view 
    state = this._fsm._list_of_state [state_id];
    if (!state)
    {
      console.error ("Unknown error in vs.fx.CardController.push");
      return;
    }
    if (this._last_comp_id === this._initial_component)
    {
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
      state.comp.setStyle ('z-index', this.__nb_panels);
      this.configureNewComponent (state.comp);
    }
    else
    {
      if (state.comp)
      {
        state.comp.setStyle ('z-index', this.__nb_panels);
        this.configureNewComponent (state.comp);
      }
    }
    
    this._last_comp_id = state_id;
    return state_id;
  },
  
  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
    var transform;
    
    if (SUPPORT_3D_TRANSFORM) transform = "translate3d";
    else transform = "translate";
    if (this._direction === CardController.LEFT_OUT)
    {
      transform += "(-100%,0";
    }
    else if (this._direction === CardController.RIGHT_OUT)
    {
      transform += "(100%,0";
    }
    else if (this._direction === CardController.BOTTOM_OUT)
    {
      transform += "(0,100%";
    }
    else
    {
      transform += "(0,-100%";
    }
    if (SUPPORT_3D_TRANSFORM) transform += ",0)";
    else transform += ")";

    comp.view.style.webkitTransitionDuration = '0';
    setElementTransform (comp.view, transform);
  },

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var t_ok = false, state, state_before_id, state_before, transform, index;
    
    if (event.type === core.POINTER_START)
    {
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.RIGHT_OUT)
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

      vs.addPointerListener (document, core.POINTER_END, this, true);
      vs.addPointerListener (document, core.POINTER_MOVE, this, true);
    }
    else if (event.type === core.POINTER_MOVE)
    {
      event.preventDefault ();
      state = this.__controller__._fsm._list_of_state 
        [this.__controller__._fsm._current_state];
      index = this.__controller__._states_array.indexOf 
        (this.__controller__._fsm._current_state)
      
      if (index > 0)
      { state_before_id = this.__controller__._states_array [index-1]; }
      
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.RIGHT_OUT)
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
        { this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        { this.__delta = event.clientY - this.__pos; }
      
        if (SUPPORT_3D_TRANSFORM)
        { transform = "translate3d(0px,"+this.__delta+"px,0)"; }
        else transform = "translate(0px,"+this.__delta+"px)";
      }
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.TOP_OUT)
      {
        if (this.__delta < 0)
        {
          state.comp.view.style.webkitTransitionDuration = 0;
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before =
            this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__controller__._direction === CardController.LEFT_OUT ||
                this.__controller__._direction === CardController.RIGHT_OUT)
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
      else
      {
        if (this.__delta > 0)
        {
          state.comp.view.style.webkitTransitionDuration = 0;
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__controller__._direction === CardController.LEFT_OUT ||
                this.__controller__._direction === CardController.RIGHT_OUT)
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+(this._size[0]+this.__delta)+"px,0px,0)";
              }
              else transform = 
                "translate("+(this._size[0]+this.__delta)+"px,0px)";
            }
            else
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,"+(this._size[1]+this.__delta)+"px,0)";
              }
              else transform = 
                "translate(0px,"+(this._size[1]+this.__delta)+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration = 0;
            setElementTransform (state_before.comp.view, transform);
          }
        }
      }
    }
    else if (event.type === core.POINTER_END)
    {
      state = this.__controller__._fsm._list_of_state   
        [this.__controller__._fsm._current_state];
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.TOP_OUT)
      {
        if (this.__delta > 50)
        {
          t_ok = this.__controller__.goToPreviousView ();
        }
        else if (this.__delta < -50)
        {
          t_ok = this.__controller__.goToNextView ();
        }
      }
      else
      {
        if (this.__delta > 50)
        {
          t_ok = this.__controller__.goToNextView ();
        }
        else if (this.__delta < -50)
        {
          t_ok = this.__controller__.goToPreviousView ();
        }
      }
      if (!t_ok)
      {
        index = this.__controller__._states_array.indexOf (this.__controller__._fsm._current_state)
        
        if (index > 0)
        { state_before_id = this.__controller__._states_array [index-1]; }
        
        if ((this.__controller__._direction === CardController.LEFT_OUT ||
            this.__controller__._direction === CardController.TOP_OUT) &&
            this.__delta < 0)
        {
          if (SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__controller__._animation_duration + 'ms';
          setElementTransform (state.comp.view, transform);
        }
        else if ((this.__controller__._direction === CardController.RIGHT_OUT ||
            this.__controller__._direction === CardController.BOTTOM_OUT) &&
            this.__delta > 0)
        {
          if (SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__controller__._animation_duration + 'ms';
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (SUPPORT_3D_TRANSFORM) transform = "translate3d";
            else transform = "translate";

            if (this.__controller__._direction === CardController.LEFT_OUT)
            {
              transform = "(-100%,0px"; 
            }
            else if (this.__controller__._direction === CardController.RIGHT_OUT)
            {
              transform = "(100%,0px"; 
            }
            else if (this.__controller__._direction === CardController.BOTTOM_OUT)
            {
              transform = "(0px,100%"; 
            }
            else
            {
              transform = "(0px,-100%"; 
            }    
            if (SUPPORT_3D_TRANSFORM) transform += ",0)";
            else transform += ")";

            state_before.comp.view.style.webkitTransitionDuration =
              this.__controller__._animation_duration + 'ms';
            setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      vs.removePointerListener (document, core.POINTER_END, this, true);
      vs.removePointerListener (document, core.POINTER_MOVE, this, true);
    }
  },
  
  /**
   *  @protected
   */
  _stackAnimateComponents : function (order, fromComp, toComp, clb, instant)
  {
    var animation, setInitialPosAnimation, durations_tmp,
      compToAnimate;

    if (order > 0)
    {
      animation = this._transition_in;
      compToAnimate = toComp;
    }
    else
    {
      animation = this._transition_out;
      setInitialPosAnimation = this._transition_in;
      compToAnimate = fromComp;
    }

    if (setInitialPosAnimation)
    {
      durations_tmp = setInitialPosAnimation.durations;
      setInitialPosAnimation.durations = '0s';
    }
    var self = this, callback = function ()
    {
      fromComp.hide ();
      try
      {
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
        if (clb) clb.call (this.owner);
      } catch (e) { console.error (e); }
    },
    
    runAnimation = function ()
    {
      if (setInitialPosAnimation)
        setInitialPosAnimation.durations = durations_tmp;
      try
      {
        toComp.show ();
        if (instant)
        {
          var inDurations = animation.durations;
          animation.durations = '0s';
        }
        animation.process (compToAnimate, callback, self);

        if (instant)
        {
          animation.durations = inDurations;
        }
      }
      catch (e) { console.error (e); }
    };
    if (setInitialPosAnimation) setInitialPosAnimation.process (toComp, function () {
      setTimeout (function () {runAnimation ();}, 0);
    });
    else runAnimation ();
  } 
});

/**
 * The duration of the animation between two views
 * @name vs.fx.CardController.ANIMATION_DURATION
 */
CardController.ANIMATION_DURATION = 300;

/**
 * Left out card slide
 * @name vs.fx.CardController.LEFT_OUT
 * @const
 */
CardController.LEFT_OUT = 0;

/**
 * Right out card slide (defaut)
 * @name vs.fx.CardController.RIGHT_OUT
 * @const
 */
CardController.RIGHT_OUT = 1;

/**
 * Top out card slide
 * @name vs.fx.CardController.TOP_OUT
 * @const
 */
CardController.TOP_OUT = 2;

/**
 * Bottom out card slide
 * @name vs.fx.CardController.BOTTOM_OUT
 * @const
 */
CardController.BOTTOM_OUT = 3;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.CardController = CardController;
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
    
    if (!util.isString (comp))
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
    
    if (event.type === core.POINTER_START)
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

      vs.addPointerListener (document, core.POINTER_END, this, true);
      vs.addPointerListener (document, core.POINTER_MOVE, this, true);
      
      this.animationDuration = 0;
    }
    else if (event.type === core.POINTER_MOVE)
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
    else if (event.type === core.POINTER_END)
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
      vs.removePointerListener (document, core.POINTER_END, this, true);
      vs.removePointerListener (document, core.POINTER_MOVE, this, true);
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
      if (clb instanceof Function)
      {
        clb.call (this.owner, event);
      }
      else if (util.isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
  }
};
util.extendClass (CubicController, StackController);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.CubicController = CubicController;
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
    
    if (!util.isString (comp))
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
      if (clb instanceof Function)
      {
        clb.call (this.owner, event);
      }
      else if (util.isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
  }
};
util.extendClass (OpacityController, StackController);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (OpacityController, "animationDuration", {
  /** 
   * Set the animation/transition temporisation (in millisecond)
   * @name vs.fx.OpacityController#animationDuration 
   * @type {number}
   */ 
  set : function (time)
  {
    if (!time) { time = 0; }
    if (!util.isNumber (time)) { return };
    
    this._animation_duration = time;
    OpacityController._opacity_animation.durations = time / 1000 + "s";
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.OpacityController = OpacityController;

})(window);