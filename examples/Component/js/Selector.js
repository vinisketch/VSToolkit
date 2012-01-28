var Selector = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  properties : {
    items : "barSegmentedButton2#items",
    text : "textlabel1#text"
  },

  initComponent : function ()
  {
    this._super ();
        
    var config = {};
    
    config.node_ref = this.id + "#barSegmentedButton2";
    config.type = "bar";
    this.barSegmentedButton2 = new vs.ui.SegmentedButton (config);
    this.barSegmentedButton2.init ();
    this.add (this.barSegmentedButton2);
        
    config.node_ref = this.id + "#textlabel1";
    this.textlabel1 = new vs.ui.TextLabel (config);
    this.textlabel1.init ();    
    this.add (this.textlabel1);
  }
});