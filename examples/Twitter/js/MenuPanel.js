var MenuPanel = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,

  template: "\
<div class=\"vs_ui_menu_panel\" x-hag-hole=\"children\"> \
  <div class=\"vs_ui_list\" x-hag-ref=\"list\"> \
    <ul x-hag-hole=\"item_children\"></ul> \
  </div> \
</div>",

  // build the flip view
  initComponent : function (event) {
    this._super ();
    this.list = new vs.ui.List ({node_ref:  this.id + '#list'}).init ();
    this.list.model = [
      {title: 'd_thevenin'},
      {title: 'julien_igel'},
      {title: 'robinberjon'}];

    this.showAnimmation = vs.fx.Animation.SlideInLeft;
    this.hideAnimmation = vs.fx.Animation.SlideOutLeft;

    this.list.bind ('itemselect', this);
  },

  notify : function (e) {
    this.propagate ('selectitem', e.data.item.title);
  }

});
