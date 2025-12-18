var Todo = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Model,
  
  /** Properties definition */
  properties: {
    content: vs_core.VSObject.PROPERTY_IN_OUT,
    done: vs_core.VSObject.PROPERTY_IN_OUT,
    date: vs_core.VSObject.PROPERTY_OUT
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
