var TodoView = vs.core.createClass ({

  parent: vs.ui.AbstractListItem,
  
  properties : { model: vs.core.Object.PROPERTY_IN_OUT },
  
  initComponent : function ()
  {
    this._super ();
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    
    var config = {};
    config.node_ref = this.id + "#contentView";
    this.contentView = new vs.ui.TextLabel (config);
    this.contentView.init ();
    this.add (this.contentView);
    
    config.node_ref = this.id + "#checkmarkView";
    this.checkmarkView = new vs.ui.ImageView (config);      
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
