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
