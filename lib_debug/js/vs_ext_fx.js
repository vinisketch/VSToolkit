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
  ext = vs.ext,
  ext_ui = ext.ui,
  ext_fx = ext.fx;

var exports = vs.ext.fx;


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
  
  Animations are inspired by http://daneden.me/animate 
  Copyright (c) 2011 Dan Eden
*/

/*************************************************************
                Predefined animation
*************************************************************/

/**
 *  Animation namespace
 *  @namespace
 *  @name vs.ext.fx.Animation
 */
var Animation = {};

/**
 *  Slide a object to right.
 *  @name Bounce
 *  @memberOf vs.ext.fx.Animation
 *  @type vs.fx.Animation
 */
var Bounce = new fx.Animation (['translateY', '0px']);
Bounce.addKeyFrame (0, ['0px']);
Bounce.addKeyFrame (20, ['0px']);
Bounce.addKeyFrame (40, ['-30px']);
Bounce.addKeyFrame (50, ['0px']);
Bounce.addKeyFrame (60, ['-15px']);
Bounce.addKeyFrame (80, ['0px']);
Bounce.duration = '1s';

/**
 *  Slide a object to right.
 *  @memberOf vs.ext.fx.Animation
 *  @type vs.fx.Animation
 */
var Shake = new fx.Animation (['translateX', '0px']);
Shake.addKeyFrame (0, ['0px']);
Shake.addKeyFrame (10, ['-10px']);
Shake.addKeyFrame (20, ['10px']);
Shake.addKeyFrame (30, ['-10px']);
Shake.addKeyFrame (40, ['10px']);
Shake.addKeyFrame (50, ['-10px']);
Shake.addKeyFrame (60, ['10px']);
Shake.addKeyFrame (70, ['-10px']);
Shake.addKeyFrame (80, ['10px']);
Shake.addKeyFrame (90, ['0px']);
Shake.duration = '1s';

/**
 *  Swing
 * @name vs.ext.fx.Animation.Swing
 *  @type vs.fx.Animation
 */
var Swing = new fx.Animation (['rotate', '0deg']);
Swing.addKeyFrame (0, ['0deg']);
Swing.addKeyFrame (20, ['15deg']);
Swing.addKeyFrame (40, ['-10deg']);
Swing.addKeyFrame (60, ['5deg']);
Swing.addKeyFrame (80, ['-5deg']);
Swing.duration = '1s';
Swing.origin = [50, 0];

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.Pulse
 *  @type vs.fx.Animation
 */
var Pulse = new fx.Animation (['scale', '1']);
Pulse.addKeyFrame (0, ['1']);
Pulse.addKeyFrame (50, ['1.1']);
Pulse.addKeyFrame (80, ['0.97']);
Pulse.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipInX
 *  @type vs.fx.Animation
 */
var FlipInX = new fx.Animation (['perspective', '400px'], ['rotateX', '0deg'], ['opacity', '1']);
FlipInX.addKeyFrame (0, ['400px','90deg','0']);
FlipInX.addKeyFrame (40, ['400px','-10deg']);
FlipInX.addKeyFrame (70, ['400px','10deg']);
FlipInX.duration = '1s';


/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipOutX
 *  @type vs.fx.Animation
 */
var FlipOutX = new fx.Animation (['perspective', '400px'], ['rotateX', '90deg'], ['opacity', '0']);
FlipOutX.addKeyFrame (0, ['400px','0deg','1']);
FlipOutX.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipInY
 *  @type vs.fx.Animation
 */
var FlipInY = new fx.Animation (['perspective', '400px'], ['rotateY', '0deg'], ['opacity', '1']);
FlipInY.addKeyFrame (0, ['400px','90deg','0']);
FlipInY.addKeyFrame (40, ['400px','-10deg']);
FlipInY.addKeyFrame (70, ['400px','10deg']);
FlipInY.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipOutY
 *  @type vs.fx.Animation
 */
var FlipOutY = new fx.Animation (['perspective', '400px'], ['rotateY', '90deg'], ['opacity', '0']);
FlipOutY.addKeyFrame (0, ['400px','0deg','1']);
FlipOutY.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeInUp
 *  @type vs.fx.Animation
 */
var FadeInUp = new fx.Animation (['translateY', '0px'], ['opacity', '1']);
FadeInUp.addKeyFrame (0, ['20px','0']);
FadeInUp.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeOutUp
 *  @type vs.fx.Animation
 */
var FadeOutUp = new fx.Animation (['translateY', '-20px'], ['opacity', '0']);
FadeOutUp.addKeyFrame (0, ['0px','1']);
FadeOutUp.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeInDown
 *  @type vs.fx.Animation
 */
var FadeInDown = new fx.Animation (['translateY', '0px'], ['opacity', '1']);
FadeInDown.addKeyFrame (0, ['-20px','0']);
FadeInDown.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeOutDown
 *  @type vs.fx.Animation
 */
var FadeOutDown = new fx.Animation (['translateY', '20px'], ['opacity', '0']);
FadeOutDown.addKeyFrame (0, ['0px','1']);
FadeOutDown.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeInLeft
 *  @type vs.fx.Animation
 */
var FadeInLeft = new fx.Animation (['translateX', '0px'], ['opacity', '1']);
FadeInLeft.addKeyFrame (0, ['-20px','0']);
FadeInLeft.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeOutLeft
 *  @type vs.fx.Animation
 */
var FadeOutLeft = new fx.Animation (['translateX', '20px'], ['opacity', '0']);
FadeOutLeft.addKeyFrame (0, ['0px','1']);
FadeOutLeft.duration = '1s';

/********************************************************************
                      Export
*********************************************************************/
/** private */
util.extend (Animation, {
  Bounce:     Bounce,
  Shake:      Shake,
  Swing:      Swing,
  Pulse:      Pulse,
  FlipInX:    FlipInX,
  FlipOutX:   FlipOutX,
  FlipInY:    FlipInY,
  FlipOutY:   FlipOutY,
  FadeInUp:    FadeInUp,
  FadeOutUp:   FadeOutUp,
  FadeInDown:    FadeInDown,
  FadeOutDown:   FadeOutDown,
  FadeInLeft:    FadeInLeft,
  FadeOutLeft:   FadeOutLeft
});
// port of webkit cubic bezier handling by http://www.netzgesta.de/dev/
/*!
 *  Copyright (c) 2006 Apple Computer, Inc. All rights reserved.
 *  
 *  Redistribution and use in source and binary forms, with or without 
 *  modification, are permitted provided that the following conditions are met:
 *  
 *  1. Redistributions of source code must retain the above copyright notice, 
 *  this list of conditions and the following disclaimer.
 *  
 *  2. Redistributions in binary form must reproduce the above copyright notice, 
 *  this list of conditions and the following disclaimer in the documentation 
 *  and/or other materials provided with the distribution.
 *  
 *  3. Neither the name of the copyright holder(s) nor the names of any 
 *  contributors may be used to endorse or promote products derived from 
 *  this software without specific prior written permission.
 *  
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE 
 *  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON 
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function CubicBezier (t,p1x,p1y,p2x,p2y)
{
  var ax=0,bx=0,cx=0,ay=0,by=0,cy=0,epsilon=1.0/200.0;
  function sampleCurveX(t) {return ((ax*t+bx)*t+cx)*t;};
  function sampleCurveY(t) {return ((ay*t+by)*t+cy)*t;};
  function sampleCurveDerivativeX(t) {return (3.0*ax*t+2.0*bx)*t+cx;};
  function solve(x) {return sampleCurveY(solveCurveX(x));};
  function fabs(n) {if(n>=0) {return n;}else {return 0-n;}};
  
  function solveCurveX (x)
  {
    var t0,t1,t2,x2,d2,i;
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = sampleCurveX (t2) - x;
      if (fabs (x2) < epsilon) return t2;
      d2 = sampleCurveDerivativeX (t2);
      if (fabs (d2) < 1e-6) break;
      t2 = t2 - x2 / d2;
    }
    t0=0.0; t1=1.0; t2=x;
    if (t2 < t0) return t0;
    if (t2 > t1) return t1;
    while (t0 < t1) {
      x2 = sampleCurveX(t2);
      if (fabs(x2-x)<epsilon) return t2;
      if (x > x2) {t0=t2;}
      else {t1=t2;}
      t2 = (t1 - t0) * 0.5 + t0;
    }
    return t2; // Failure.
  };
  cx = 3.0 * p1x;
  bx = 3.0 * (p2x - p1x) - cx;
  ax = 1.0 - cx - bx;
  cy = 3.0 * p1y;
  by = 3.0 * (p2y - p1y) - cy;
  ay = 1.0 - cy - by;
  
  return solve (t);
}

/**
 *  generateCubicBezierFunction(x1, y1, x2, y2) -> Function
 *
 *  Generates a transition easing function that is compatible
 *  with WebKit's CSS transitions `-webkit-transition-timing-function`
 *  CSS property.
 *
 *  The W3C has more information about 
 *  <a href="http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag">
 *  CSS3 transition timing functions</a>.
 **/
function generateCubicBezierFunction (x1, y1, x2, y2) {
  return (function(pos) {return CubicBezier (pos,x1,y1,x2,y2);});
}
/**
 *  The vs.ext.fx.Chronometer class
 *
 *  @extends vs.core.Task
 *  @class
 *  vs.ext.fx.Chronometer is a periodical signal (tick) generator, that produces
 *  values from 0 to 1 when is started;<br />
 *  That element is a vs.core.Task then it can be started, stopped, paused and
 * it is compatible with de PAR / SEQ scheduling.
 *  <br />
 *  <hr />
 *  Input properties:
 *  <ul>
 *  <li>duration: the chronometer duration in ms [default value = 300] [value >= 0]
 *  <li>begin: delay for generating the first tick. If begin > duration * repeat
 *   the chronometer will never generate a tick! [default value = 0] [value >= 0]
 *  <li>steps: number of tick generated. If step = 0, the chronometer generates
 *     a tick at each frame [default value = 0] [steps = 0 || steps >= 2]
 *  <li>repeat: number of chronometer repeat [default value = 1] [repeat >= 1]
 *  </ul>
 *  <hr />
 *  Output property
 *  <ul>
 *  <li>tick: tick out from [0,1]
 *  </ul>
 *
 *  @example
 *  // A "normal" chronometer during 1s
 *  var c1 = new Chronometer ({
 *    duration: 1000
 *  }).init ();
 *
 *  // A discret chronometer generating 10 ticks during 300 ms, that means one tick
 *  // every 30ms.
 *  var c2 = new Chronometer ({
 *    duration: 300,
 *    steps : 10
 *  }).init ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Creates a new vs.ext.fx.Chronometer.
 *
 * @name vs.ext.fx.Chronometer
 *
 * @param {Object} config the configuration structure [optional]
 */
var Chronometer = vs.core.createClass ({

  parent: vs.core.Task,

  /** @protected */
  _duration: 300,
  /** @protected */
  _begin: 0,
  /** @protected */
  _steps: 0,
  /** @protected */
  _repeat: 1,
  /** @protected */
  _pace: null,
  /** @protected */
  _tick: 0,
  /** @protected */
  __time_decl: 0,
  /** @protected */
  __pause_time: 0,
  /** @protected */
  __end_time: 0,
  
  properties: {

    /**
     * set chronometer duration
     * @name vs.ext.fx.Chronometer#duration
     *
     * @type number
     */
    duration: vs.core.Object.PROPERTY_IN,

    /**
     * set chronometer begin
     * @name vs.ext.fx.Chronometer#begin
     *
     * @type number
     */
    begin: vs.core.Object.PROPERTY_IN,

    /**
     * set chronometer steps
     * @name vs.ext.fx.Chronometer#steps
     *
     * @type number
     */
    steps: {
      set: function (v) {
        if (!v) {
          this._step = 0;
          return;
        }
        if (!vs.util.isNumber (v)) return;
        if (v < 2) return;
        this._steps = parseInt (v, 10);
      }
    },

    /**
     * set chronometer repeat
     * @name vs.ext.fx.Chronometer#repeat
     *
     * @type number
     */
    repeat: vs.core.Object.PROPERTY_IN,

    /**
     * set chronometer pace
     * @name vs.ext.fx.Chronometer#pace
     *
     * @type vs.ext.fx.Pace
     */
    pace: vs.core.Object.PROPERTY_IN,

    /**
     * set input tick
     * @name vs.ext.fx.Chronometer#tickIn
     *
     * @type number
     */
    tick: vs.core.Object.PROPERTY_OUT
  },
  
  initComponent: function (event)
  {
    this._state = vs.core.Task.STOPPED;
    this._super ();
  },
  
  /**
   *  Starts the task
   *
   * @name vs.core.Task#start
   * @function
   *
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start: function (param)
  {
    if (this._state === vs.core.Task.STARTED) return;

    // schedule a chronometer cycle
    function _start ()
    {
      if (this._steps === 0) this._start_clock ();
      else this._start_steps ();
    }
    
    if (this._state === vs.core.Task.STOPPED)
    {
      var begin = this._begin || 0;
      this.__time_decl = 0;
      this.__pause_time = 0;
    
      // manage delayed chronometer
      if (begin > 0)
      {
        vs.scheduleAction (_start.bind (this), begin);
        return;
      }
    
      // manage ended chronometer before started
      if (-begin > this._repeat * this._duration)
      {
        this.__setTick (1);
        this.propagateChange ('tick');
        if (this.__clb) this.__clb (this._tick);

        if (this.delegate && this.delegate.taskDidEnd)
        { this.delegate.taskDidEnd (this); }
      
        return;
      }
    
      this.__time_decl = -begin % this._duration;
      var r_dec = Math.floor (-begin / this._duration);
      
      this.__repeat_dur = this._repeat - r_dec;
      this.__param = param;
    }
    
    _start.call (this);

    if (this.delegate && this.delegate.taskDidStart)
    { this.delegate.taskDidStart (this); }
  },
  
  __setTick : function (v) {
    if (this._pace && this._pace._timing) {
      this._tick = this._pace._timing (v);
    }
    else this._tick = v;
  },

  /**
   * @function
   * @private
   */
  _clock : function ()
  {
    if (this._state !== vs.core.Task.STARTED) return;
    
    var currTime = Date.now ();
    
    if (currTime >= this.__end_time)
    {
      this.__setTick (1);
      this.propagateChange ('tick');
      if (this.__clb) this.__clb (this._tick);
      if (this.__repeat_dur > 1)
      {
        this.__repeat_dur --;
        // schedule a new chronometer cycle
        vs.scheduleAction (this._start_clock.bind (this), vs.ON_NEXT_FRAME);
      }
      else
      {
        this._state = vs.core.Task.STOPPED;
        if (this.delegate && this.delegate.taskDidEnd)
        { this.delegate.taskDidEnd (this); }
      }
    }
    else {
      // schedule a new tick
      vs.scheduleAction (this._clock.bind (this), vs.ON_NEXT_FRAME);
      this.__setTick ((currTime - this.__start_time) / this._duration);
      this.propagateChange ('tick');
      if (this.__clb) this.__clb (this._tick);
    }
  },

  /**
   * @function
   * @private
   */
  _start_clock: function ()
  {
    if (this._state === vs.core.Task.PAUSED)
    {
      var pause_dur = Date.now () - this.__pause_time;
      this.__start_time += pause_dur;
      this.__end_time += pause_dur;
      this._state = vs.core.Task.STARTED;
      vs.scheduleAction (this._clock.bind (this));
      return;
    }
    
    this.__start_time = Date.now () - this.__time_decl; this.__time_decl = 0
    this.__end_time = this.__start_time + this._duration;
    
    if (vs.util.isFunction (this.__param)) this.__clb = this.__param;

    this._state = vs.core.Task.STARTED;
    this.__setTick (0);
    this.propagateChange ('tick');
    if (this.__clb) this.__clb (this._tick);
    
    vs.scheduleAction (this._clock.bind (this));
  },

  /**
   * @function
   * @private
   */
  _step : function ()
  {
    if (this._state !== vs.core.Task.STARTED) return;
    
    var step = (this._steps - this.__steps)
    this.__steps --;

    if (step === this._steps)
    {
      this.__setTick (1);
      this.propagateChange ('tick');
      if (this.__clb) this.__clb (this._tick);
      if (this.__repeat_dur > 1)
      {
        this.__repeat_dur --;
        vs.scheduleAction (this._start_steps.bind (this), vs.ON_NEXT_FRAME);
      }
      else
      {
        this._state = vs.core.Task.STOPPED;
        if (this.delegate && this.delegate.taskDidEnd)
        { this.delegate.taskDidEnd (this); }
      }
    }
    else {
      this.__setTick (step / (this._steps - 1));
      this.propagateChange ('tick');
      if (this.__clb) this.__clb (this._tick);
      var step_dur = this._duration / this._steps
      vs.scheduleAction (this._step.bind (this), step_dur);
    }
  },
  
  /**
   * @function
   * @private
   */
  _start_steps: function ()
  {
    // step chronometer implement a simplistic time management and pause.
    if (this._state === vs.core.Task.PAUSED)
    {
      this._state = vs.core.Task.STARTED;
      vs.scheduleAction (this._step.bind (this));
      return;
    }

    if (vs.util.isFunction (this.__param)) this.__clb = this.__param;

    this._state = vs.core.Task.STARTED;
    this.__setTick (0);
    this.propagateChange ('tick');
    if (this.__clb) this.__clb (this._tick);
    
    var step_dur = this._duration / this._steps;
    this.__steps = this._steps - 1 - Math.floor (this.__time_decl / step_dur);
    this.__time_decl = 0;
    
    vs.scheduleAction (this._step.bind (this), step_dur);
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the TaskDelegate.taskDidStop
   *  if it declared.
   *
   * @name vs.core.Task#stop
   * @function
   */
  stop: function ()
  {
    this._state = vs.core.Task.STOPPED;
    this.__pause_time = 0;

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the TaskDelegate.taskDidPause
   *  if it declared.
   *
   * @name vs.core.Task#pause
   * @function
   */
  pause: function ()
  {
    if (!this._state === vs.core.Task.STARTED) return;
    this._state = vs.core.Task.PAUSED;
    this.__pause_time = Date.now ();

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }
  }
});
/**
 *  The vs.ext.fx.Pace class
 *
 *  @extends vs.core.Object
 *  @class
 *  vs.ext.fx.Pace class has one input in, one output out, and implements a
 *  function in the range [0,1] to [0,1].<br/>
 *  It's an useful element to use with the Chronometer for changing its output.
 *
 *  <br /> Inputs
 *  <ul>
 *  <li>timing: the function in the range [0,1] to [0,1]
 *  <li>tickIn: tick input from [0,1]
 *  </ul>
 *  <br /> Output
 *  <ul>
 *  <li>tickOut: tick input from [0,1]
 *  </ul>
 *
 *  @example
 *  // my identity pace
 *  var myIdPace = new Pace ({
 *    timing: function (v) { return v; }
 *  }).init ();
 *
 *  // my ease in pace
 *  var myPace = new Pace ({
 *    timing: vs.ext.fx.generateCubicBezierFunction (0.42, 0.0, 1.0, 1.0)
 *  }).init ();
 *
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ext.fx.Pace.
 *
 * @name vs.ext.fx.Pace
 *
 * @param {Object} config the configuration structure [optional]
 */
var Pace = vs.core.createClass ({

  /** @protected */
  _timing : function (i) {return i;},
  /** @protected */
  _tick_in : 0,
  /** @protected */
  _tick_out : 0,

  properties : {
    /**
     * set transform function
     * @name vs.ext.fx.Pace#timing
     *
     * @type Function
     */
    timing: vs.core.Object.PROPERTY_IN,

    /**
     * set input tick
     * @name vs.ext.fx.Pace#tickIn
     *
     * @type number
     */
    tickIn: vs.core.Object.PROPERTY_IN,

    /**
     * get the transformed tick
     * @name vs.ext.fx.Pace#tickOut
     *
     * @type number
     */
    tickOut: vs.core.Object.PROPERTY_OUT
  },

  /**
   * initComponent
   * @protected
   *
   * @name vs.ext.fx.Pace#initComponent
   * @function
   */
  initComponent: function () {
    this._super ();

    if (this._timing) {
      this._tick_out = this._timing (this._tick_in);
    }
    else {
      this._tick_out = this._tick_in;
    }
  },

  /**
   * propertiesDidChange
   * @protected
   *
   * @name vs.ext.fx.Pace#propertiesDidChange
   * @function
   */
  propertiesDidChange : function () {
    if (this._timing) {
      this._tick_out = this._timing (this._tick_in);
    }
    else {
      this._tick_out = this._tick_in;
    }
    
    this.propagateChange ('tickOut');
  }
});

/******************************************************************************
          Default timing functions
******************************************************************************/

/**
 *  Returns an EaseIn Pace object
 *
 *  @function
 *  @name vs.ext.fx.Pace.getEaseInPace
 *
 * @return {vs.ext.fx.Pace} the pace object
 */
Pace.getEaseInPace = function () {
  return new Pace ({
    timing: generateCubicBezierFunction (0.42, 0.0, 1.0, 1.0)
  }).init ();
}

/**
 *  Returns an EaseOut Pace object
 *
 *  @function
 *  @name vs.ext.fx.Pace.getEaseOutPace
 *
 * @return {vs.ext.fx.Pace} the pace object
 */
Pace.getEaseOutPace = function () {
  return new Pace ({
    timing: generateCubicBezierFunction (0.0, 0.0, 0.58, 1.0)
  }).init ();
}

/**
 *  Returns an EaseInOut Pace object
 *
 *  @function
 *  @name vs.ext.fx.Pace.getEaseInOutPace
 *
 * @return {vs.ext.fx.Pace} the pace object
 */
Pace.getEaseInOutPace = function () {
  return new Pace ({
    timing: generateCubicBezierFunction (0.42, 0.0, 0.58, 1.0)
  }).init ();
}

/**
 *  Returns an easeOutIn Pace object
 *
 *  @function
 *  @name vs.ext.fx.Pace.getEaseOutInPace
 *
 * @return {vs.ext.fx.Pace} the pace object
 */
Pace.getEaseOutInPace = function () {
  return new Pace ({
    timing: generateCubicBezierFunction (0.0, 0.42, 1.0, 0.58)
  }).init ();
}

/**
 *  Returns an linear Pace object, than means timing function is 
 *  an identity function
 *
 *  @function
 *  @name vs.ext.fx.Pace.getLinearPace
 *
 * @return {vs.ext.fx.Pace} the pace object
 */
Pace.getLinearPace = function () { return new Pace ().init (); }

/**
 *  Returns an invert linear Pace object, than means timing function is 
 *  an tickOut = 1-tickIn function
 *
 *  @function
 *  @name vs.ext.fx.Pace.getInvertLinearPace
 *
 * @return {vs.ext.fx.Pace} the pace object
 */
Pace.getInvertLinearPace = function () {
  return new Pace ({
    timing: function (t) { return 1 - t; }
  }).init ();
}
/**
 *  The vs.ext.fx.Trajectory class
 *
 *  @extends vs.core.Object
 *  @class
 *  vs.ext.fx.Trajectory is a class with one input in, and any number of outputs.
 *  <br />It implements a parametric function in the input domain [0,1].<br />
 *  Trajectories is the element that will allow the developer to animate any
 *  kind of property/value (instead of CSS animation) and control how change
 *  this value.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ext.fx.Trajectory.
 *
 * @name vs.ext.fx.Trajectory
 *
 * @param {Object} config the configuration structure [optional]
 */
var Trajectory = vs.core.createClass ({

  /** @protected */
  _calcule_mode : 0,
  
  /********************************************************************
                    Define class properties
  ********************************************************************/
  properties : {
    calculeMode: vs.core.Object.PROPERTY_IN,
    tick: vs.core.Object.PROPERTY_IN
  },

  initComponent: function () {
    this._super ();

    this.propertiesDidChange ();
  },
  
  /**
   * compute
   * @protected
   *
   * @name vs.ext.fx.Trajectory#compute
   * @function
   */
  compute: function () {
    return false;
  },

  /**
   * propertiesDidChange
   * @protected
   *
   * @name vs.ext.fx.Trajectory#propertiesDidChange
   * @function
   */
  propertiesDidChange: function ()
  {
    if (this.compute ()) this.propagateChange ('out');
  }
});

/**
 *  The vs.ext.fx.Vector1D class
 *
 *  @extends vs.ext.fx.Trajectory
 *  @class
 *  vs.ext.fx.Vector1D integer or float piecewise linear function interpolator.<br />
 *  The values property is an 1D array that specifies how the output property out
 *  will change
 *
 *  @example
 *  // the out property will change uniformly from 0 to 200.
 *  var traj1 = new Vector1D ({values: [0, 200]}).init ();
 *
 *  // the out property will change from 0 to 700, but through
 *  // 200, then go back to 90 value to finish at 700.
 *  var traj2 = new Vector1D ({values: [0, 200, 90, 700]}).init ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ext.fx.Vector1D.
 *
 * @name vs.ext.fx.Vector1D
 *
 * @param {Object} config the configuration structure [optional]
 */
var Vector1D = vs.core.createClass ({

  parent: Trajectory,
  
  /** @protected */
  _values: null,
  /** @protected */
  _out: 0,
  
  /********************************************************************
                    Define class properties
  ********************************************************************/
  properties : {
    /**
     * set domain values
     * @name vs.ext.fx.Vector1D#values
     *
     * @type Array<number>
     */
    values: {
      set: function (v)
      {
        if (!vs.util.isArray (v)) return;
        if (v.length < 1) return;
        
        this._values = v.slice ();
      }
    },
    
    /**
     * get trajectory output
     * @name vs.ext.fx.Vector1D#out
     *
     * @type number
     */
    out: vs.core.Object.PROPERTY_OUT
  },
  
  /**
   * constructor
   * @protected
   *
   * @name vs.ext.fx.Vector1D#constructor
   * @function
   */
  constructor : function (config)
  {
    this._super (config);
    this._values = [];
  },
  
  /**
   * compute
   * @protected
   *
   * @name vs.ext.fx.Vector1D#compute
   * @function
   */
  compute: function ()
  {
    if (!vs.util.isNumber (this._tick)) return false;

    var
      nb_values = this._values.length - 1, // int [0, n]
      ti = this._tick * nb_values, // float [0, n]
      index = Math.floor (ti), // int [0, n]
      d = ti - index; // float [0, 1]
      
    if (this._tick === 0) this._out = this._values [0];
    else if (this._tick === 1) this._out = this._values [nb_values];
    else
    {
      var v1 = this._values [index];
      var v2 = this._values [index + 1];
      this._out = v1 + (v2 - v1) * d;
    }
    
    return true;
  }
});

/**
 *  The vs.ext.fx.Vector2D class
 *
 *  @extends vs.ext.fx.Trajectory
 *  @class
 *  vs.ext.fx.Vector2D is integer or float piecewise linear function interpolator.
 *  The out property is an array with two values.<br />
 *  The values property is an 2D array that specifies how the output property out
 *  will change.
 *
 *  @example
 *  // the out property will change uniformly from [0, 0] to [100, 50].
 *  var traj1 = new Vector2D ({values: [[0,0], [100, 50]]}).init ()
 *
 *  // the out property will change from [0,0] to [0,0], but through
 *  // [220, -55] and [200, 50] points.
 *  var traj2 = new Vector2D ({values: [[0,0], [220, -55], [200, 50], [0, 0]]}).init ()
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ext.fx.Vector2D.
 *
 * @name vs.ext.fx.Vector2D
 *
 * @param {Object} config the configuration structure [optional]
 */
var Vector2D = vs.core.createClass ({

  parent: Trajectory,
  
  /** @protected */
  _values: null,
  /** @protected */
  _out: 0,
  
  /********************************************************************
                    Define class properties
  ********************************************************************/
  properties : {
    /**
     * set domain values
     * @name vs.ext.fx.Vector2D#values
     *
     * @type Array<number>
     */
    values: {
      set: function (v)
      {
        if (!vs.util.isArray (v)) return;
        if (v.length < 1) return;
        
        this._values = v.slice ();
      }
    },
    
    /**
     * get trajectory output
     * @name vs.ext.fx.Vector2D#out
     *
     * @type Array<number>
     */
    out: vs.core.Object.PROPERTY_OUT
  },
  
  /**
   * constructor
   * @protected
   *
   * @name vs.ext.fx.Vector2D#constructor
   * @function
   */
  constructor : function (config)
  {
    this._super (config);
    this._values = [];
  },
  
  /**
   * compute
   * @protected
   *
   * @name vs.ext.fx.Vector2D#compute
   * @function
   */
  compute: function ()
  {
    if (!vs.util.isNumber (this._tick)) return false;
    
    var
      nb_values = this._values.length - 1, // int [0, n]
      ti = this._tick * nb_values, // float [0, n]
      index = Math.floor (ti), // int [0, n]
      d = ti - index; // float [0, 1]
      
    if (this._tick === 0) this._out = this._values [0];
    else if (this._tick === 1) this._out = this._values [nb_values];
    else
    {
      var v1 = this._values [index];
      var v2 = this._values [index + 1];
      this._out = [
        v1[0] + (v2[0] - v1[0]) * d,
        v1[1] + (v2[1] - v1[1]) * d
      ]
    }
    
    return true;
  }
});

/**
 *  The vs.ext.fx.Circular2D class
 *
 *  @extends vs.ext.fx.Trajectory
 *  @class
 *  vs.ext.fx.Circular2D is arc function, a two dimensionnal trajectory,
 *  that generate points coordinate on an arc<br />
 *  <ul>
 *  <li>Center is the center of the circle
 *  <li>Values are the start and end angles
 *  </ul>
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ext.fx.Circular2D.
 *
 * @name vs.ext.fx.Circular2D
 *
 * @param {Object} config the configuration structure [optional]
 */
var Circular2D = vs.core.createClass ({

  parent: Trajectory,
  
  /** @protected */
  _center: null,
  /** @protected */
  _values: null,
  /** @protected */
  _out: 0,
  
  /********************************************************************
                    Define class properties
  ********************************************************************/
  properties : {
    /**
     * set center of the circle
     * @name vs.ext.fx.Circular2D#center
     *
     * @type Array<number>
     */
    center: {
      set: function (v)
      {
        if (!vs.util.isArray (v)) return;
        if (v.length !== 2) return;
        
        this._center = v.slice ();
      }
    },
    
    /**
     * set the possible angles
     * @name vs.ext.fx.Circular2D#values
     *
     * @type Array<number>
     */
    values: {
      set: function (v)
      {
        if (!vs.util.isArray (v)) return;
        if (v.length < 1) return;
        
        this._values = v.slice ();
      }
    },
    
    /**
     * get trajectory output
     * @name vs.ext.fx.Circular2D#out
     *
     * @type Array<number>
     */
    out: vs.core.Object.PROPERTY_OUT
  },
  
  /**
   * constructor
   * @protected
   *
   * @name vs.ext.fx.Circular2D#constructor
   * @function
   */
  constructor : function (config)
  {
    this._super (config);
    this._values = [0, 0];
    this._center = [0, 0];
  },
  
  /**
   * compute
   * @protected
   *
   * @name vs.ext.fx.Circular2D#compute
   * @function
   */
  compute: function ()
  {
    if (!vs.util.isNumber (this._tick)) return false;
    
    var
      angle, values = this._values, 
      nb_values = values.length - 1, // int [0, n]
      ti = this._tick * nb_values, // float [0, n]
      index = Math.floor (ti), // int [0, n]
      d = ti - index; // float [0, 1]
      
    if (this._tick === 0) angle = values [0];
    else if (this._tick === 1) angle = values [nb_values];
    else
    {
      var v1 = values [index];
      var v2 = values [index + 1];
      angle = v1 + (v2 - v1) * d;
    }

    var 
      cx = this._center [0],
      cy = this._center [1],
      radius = Math.sqrt (cx * cx + cy * cy);
    
    // Deg => Grad
    angle = 2 * Math.PI * angle / 180;
    var x = radius * Math.cos (angle) + cx,
      x = Math.round(x * 1000) / 1000;
    var y = radius * Math.sin (angle) + cy,
      y = Math.round(y * 1000) / 1000;
        
    this._out = [x, y];
    
    return true;
  }
});
/******************************************************************************
          
******************************************************************************/

var AnimationDefaultOption = {
  duration: 300,
  begin: 0,
  pace: Pace.getLinearPace (),
  steps: 0,
  repeat: 1,
  startClb: null,
  endClb: null
}

/******************************************************************************
          
******************************************************************************/

/**
 *  animateTransition (obj, property, options)
 *
 *  Instruments a object property with an animation
 *  When the property is change, instead of XXX
 *
 *  @param obj {Object} 
 *  @param property {String} the property name to instrument
 *  @param options {Object} Animation options [optional]
**/
var animateTransition = function (obj, property, options)
{
  var animOptions = vs.util.clone (AnimationDefaultOption);
  if (options) {
    for (var key in options) animOptions [key] = options [key];
  }
  
  var chrono = new Chronometer (animOptions).init ();
  var pace = animOptions.pace;
  var traj = animOptions.trajectory;

  chrono.__clb = function (i) {
  
    pace._tick_i = i;
    if (pace._timing) {
      pace._tick_out = pace._timing (i);
    }
    else {
      pace._tick_out = pace._tick_in;
    }
    
    traj._tick = pace._tick_out;
    if (traj.compute ()) {
      obj [property] = traj._out;
      obj.propertyChange ();
    }
  }
  
  return chrono;
}

var animateTransitionBis = function (obj, srcs, targets, options)
{
  if (!vs.util.isArray (srcs) || !vs.util.isArray (targets)) return;
  if (srcs.length !== targets.length) return;
  
  var animOptions = vs.util.clone (AnimationDefaultOption);
  if (options) {
    for (var key in options) animOptions [key] = options [key];
  }
  
  var chrono = new Chronometer (animOptions).init ();
  var pace = animOptions.pace;
  var traj = animOptions.trajectory;

  chrono.__clb = function (i) {
    pace.tickIn = i;
    pace.propertiesDidChange ();
    
    traj.tick = pace.tickOut;
    traj.propertiesDidChange ();
    
    for (var i = 0; i < srcs.length; i++) { obj [targets[i]] = traj [srcs[i]]; }
    obj.propertyChange ();
  }
  
  return chrono;
}

function attachTransitionAnimation (comp, property, options)
{
  var animOptions = vs.util.clone (AnimationDefaultOption);
  if (options) {
    for (var key in options)
      animOptions [key] = options [key];
  }
  
  var
    chrono = new Chronometer (animOptions).init (),
    pace = animOptions.pace,
    traj = animOptions.trajectory,
    _property = '_' + vs.util.underscore (property),
    set_function;
    
  if (!traj) throw new Error ("Error StringTrajectory");

  chrono.__clb = function (i) {
  
    pace._tick_i = i;
    if (pace._timing) {
      pace._tick_out = pace._timing (i);
    }
    else {
      pace._tick_out = pace._tick_in;
    }
    
    traj._tick = pace._tick_out;
    if (traj.compute ()) {
      set_function.call (comp, traj._out);
      comp.propertyChange ();
    }
  }
    
  var desc = comp.getPropertyDescriptor (property);
  if (!desc || !desc.set) throw new Error ("Error StringTrajectory");
  set_function = desc.set;
  
  function descriptorInstrument ()
  {
    var instrumentedDesc = {};
    if (desc.get) instrumentedDesc.get = desc.get;

    instrumentedDesc.set = function (v) {
      traj.values = [this [_property], v];
      chrono.start ();
    }
    
    instrumentedDesc.configurable = desc.configurable;
    instrumentedDesc.enumerable = desc.enumerable;

    Object.defineProperty (comp, "__trans_anim_" + property, desc);
    Object.defineProperty (comp, property, instrumentedDesc);
  }
  
  removeTransitionAnimation (comp, property);
  descriptorInstrument ();
}

function removeTransitionAnimation (comp, property)
{
  var desc = comp.getPropertyDescriptor ("__trans_anim_" + property);
  if (desc) {
    Object.defineProperty (comp, property, desc);
    delete (comp ["__trans_anim_" + property]);
  }
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.util.extend (exports, {
  Animation:                     Animation,
  Trajectory:                    Trajectory,
  Vector1D:                      Vector1D,
  Vector2D:                      Vector2D,
  Circular2D:                    Circular2D,
  Pace:                          Pace,
  Chronometer:                   Chronometer,
  generateCubicBezierFunction:   generateCubicBezierFunction,
  animateTransition:             animateTransition,
  animateTransitionBis:          animateTransitionBis,
  animateTransitionBis:          animateTransitionBis,
  attachTransitionAnimation:     attachTransitionAnimation,
  removeTransitionAnimation:     removeTransitionAnimation
});

})(window);