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
