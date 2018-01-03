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
        vs_core.scheduleAction (_start.bind (this), begin);
        return;
      }
    
      // manage ended chronometer before started
      if (-begin > this._repeat * this._duration)
      {
        this.__setTick (1);
        this.propagateChange ('tick');
        if (this.__clb) this.__clb (this._tick);

        if (this.delegate && this.delegate.taskDidEnd) {
          try {
            this.delegate.taskDidEnd (this);
          }
          catch (e) {
            if (e.stack) console.log (e.stack)
            console.error (e);
          }
        }
      
        return;
      }
    
      this.__time_decl = -begin % this._duration;
      var r_dec = Math.floor (-begin / this._duration);
      
      this.__repeat_dur = this._repeat - r_dec;
      this.__param = param;
    }
    
    _start.call (this);

    if (this.delegate && this.delegate.taskDidStart) {
      try {
        this.delegate.taskDidStart (this);
      }
      catch (e) {
        if (e.stack) console.log (e.stack)
        console.error (e);
      }
    }
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
        vs_core.scheduleAction (this._start_clock.bind (this), vs.ON_NEXT_FRAME);
      }
      else
      {
        this._state = vs.core.Task.STOPPED;
        if (this.delegate && this.delegate.taskDidEnd) {
          try {
            this.delegate.taskDidEnd (this);
          }
          catch (e) {
            if (e.stack) console.log (e.stack)
            console.error (e);
          }
        }
      }
    }
    else {
      // schedule a new tick
      vs_core.scheduleAction (this._clock.bind (this), vs.ON_NEXT_FRAME);
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
      vs_core.scheduleAction (this._clock.bind (this));
      return;
    }
    
    this.__start_time = Date.now () - this.__time_decl; this.__time_decl = 0
    this.__end_time = this.__start_time + this._duration;
    
    if (vs.util.isFunction (this.__param)) this.__clb = this.__param;

    this._state = vs.core.Task.STARTED;
    this.__setTick (0);
    this.propagateChange ('tick');
    if (this.__clb) this.__clb (this._tick);
    
    vs_core.scheduleAction (this._clock.bind (this));
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
        vs_core.scheduleAction (this._start_steps.bind (this), vs.ON_NEXT_FRAME);
      }
      else
      {
        this._state = vs.core.Task.STOPPED;
        if (this.delegate && this.delegate.taskDidEnd) {
          try {
            this.delegate.taskDidEnd (this);
          }
          catch (e) {
            if (e.stack) console.log (e.stack)
            console.error (e);
          }
        }
      }
    }
    else {
      this.__setTick (step / (this._steps - 1));
      this.propagateChange ('tick');
      if (this.__clb) this.__clb (this._tick);
      var step_dur = this._duration / this._steps
      vs_core.scheduleAction (this._step.bind (this), step_dur);
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
      vs_core.scheduleAction (this._step.bind (this));
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
    
    vs_core.scheduleAction (this._step.bind (this), step_dur);
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

    this.__setTick (0);
    this.propagateChange ('tick');
    if (this.__clb) this.__clb (this._tick);

    if (this.delegate && this.delegate.taskDidStop) {
      try {
        this.delegate.taskDidStop (this);
      }
      catch (e) {
        if (e.stack) console.log (e.stack)
        console.error (e);
      }
    }
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

    if (this.delegate && this.delegate.taskDidPause) {
      try {
        this.delegate.taskDidPause (this);
      }
      catch (e) {
        if (e.stack) console.log (e.stack)
        console.error (e);
      }
    }
  }
});
