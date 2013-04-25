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
    else vs.scheduleAction (function () {
      callback ({currentTarget: comp.view});
    });

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
    else vs.scheduleAction (function () {
      callback ({currentTarget: comp.view});
    });

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
    var self = this;
    vs.scheduleAction (function () {self.process (param);});
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
