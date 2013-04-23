var DetailView = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.ScrollView,
  
  properties : {
    title: vs.core.Object.PROPERTY_IN,
    description: vs.core.Object.PROPERTY_IN
  },

  initComponent : function ()
  {
    this._super ();
    
    this.scroll = vs.ui.ScrollView.VERTICAL_SCROLL;
    this.addClassName ('DetailView page');

    this.titleView = new vs.ui.TextLabel ({id:'title_view'});
    this.titleView.init ();
    this.add (this.titleView);
    
    this.contentView = new vs.ui.TextLabel ({id:'content_view'});
    this.contentView.init ();
    this.add (this.contentView);
  },

  propertiesDidChange : function ()
  {
    this.titleView.text = this._title;
    this.contentView.view.innerHTML = this._description;
    
    var maxWidth = this.size [0] - 20;
    // deactivate all links
    var links = this.contentView.view.querySelectorAll ('a')
    for (var i = 0; i < links.length; i++) { links [i].href = '#'; }
    
    // resize images
    var images = this.contentView.view.querySelectorAll ('img')
    for (var i = 0; i < images.length; i++)
    {
      var image = images [i];
      if (image.width > maxWidth)
      {
        var s = maxWidth / image.width;
        image.width = maxWidth;
        image.height = image.height * s;
      }
    }
    
    this.refresh ();
  }
});
