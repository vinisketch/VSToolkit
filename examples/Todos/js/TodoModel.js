var Todo = vs.core.createClass ({

  /** parent class */
  parent: vs.core.Model,
  
  /** Properties definition */
  properties: {
    content: vs.core.Object.PROPERTY_IN_OUT,
    done: vs.core.Object.PROPERTY_IN_OUT,
    date: vs.core.Object.PROPERTY_OUT
  },
  
  constructor : function (config)
  {
    this._super (config);
    console.log ('Todo - constructor');
  },
  
  destructor : function ()
  {
    console.log ('Todo - destructor');
    this._super ();
  },
  
  /** initialization */
  initComponent : function ()
  {
    this._super ();
    this._date = new Date ();
    this._done = false;
  }
});
