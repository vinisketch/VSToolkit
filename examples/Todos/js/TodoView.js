var TodoView = vs_core.createClass ({

  parent: vs_ui.AbstractListItem,
  
  properties : { model: vs_core.VSObject.PROPERTY_IN_OUT },
  
  initComponent : function ()
  {
    this._super ();
    this.layout = vs_ui.View.ABSOLUTE_LAYOUT;
    
    var config = {};
    config.node_ref = this.id + "#contentView";
    this.contentView = new vs_ui.TextLabel (config);
    this.contentView.init ();
    this.add (this.contentView);
    
    config.node_ref = this.id + "#checkmarkView";
    this.checkmarkView = new vs_ui.ImageView (config);      
    this.checkmarkView.init ();
    this.add (this.checkmarkView);
  },
  
  didSelect : function ()
  {
    this._model.done = !this._model.done;
    this.checkmarkView.visible = this._model.done;
    TodoApp.localStorage.save ();
  },
 
  propertiesDidChange : function ()
  {
    this.contentView.text = this._model.content;
    this.checkmarkView.visible = this._model.done;
  }
});
