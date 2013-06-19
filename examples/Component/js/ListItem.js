var ListItem = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  properties : {
    url : "image#src",
    title : "label#text"
  },

  initComponent : function ()
  {
    this._super ();
        
    var config = {};
    
    config.node_ref = this.id + "#image";
    this.image = new vs.ui.ImageView (config);
    this.image.init ();
    this.add (this.image);
        
    config.node_ref = this.id + "#textlabel";
    this.label = new vs.ui.TextLabel (config);
    this.label.init ();    
    this.add (this.label);
  }
});