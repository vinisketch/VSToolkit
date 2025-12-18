var ListItem = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.View,
  
  properties : {
    url : "image#src",
    title : "label#text"
  },

  initComponent : function ()
  {
    this._super ();
        
    var config = {};
    
    this.image = new vs_ui.ImageView ({node_ref: this.id + "#image"});
    this.image.init ();
    this.add (this.image);
        
    this.label = new vs_ui.TextLabel ({node_ref: this.id + "#textlabel"});
    this.label.init ();    
    this.add (this.label);
  }
});