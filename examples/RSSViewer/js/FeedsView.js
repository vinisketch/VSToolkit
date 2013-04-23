var FeedsView = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  initComponent : function ()
  {
    this._super ();
    this.addClassName ('FeedsView page');
    this.layout = vs.ui.View.FLOW_LAYOUT; 
    
    for (var i = 0; i < FeedsView.feeds.length; i++)
    {
      var data = FeedsView.feeds [i];
      var button = this.createButton (data);
      this.add (button);
    }
  },
  
  createButton : function (data)
  {
    var button = new vs.ui.Button ({template_ref: 'feed_button'});
    button.init ();
    button.view.src = data.image;
    button.url = data.url;
    
    button.bind ('select', this);
    
    return button;
  },

  notify : function (event)
  {
    this.propagate ('view_feed', event.src.url);
  }
});

FeedsView.feeds = [
  {
    name: 'ArsTechnica',
    url: 'http://feeds.arstechnica.com/arstechnica/index/',
    image: 'http://static.arstechnica.net//public/v6/styles/light/images/masthead/logo.png', 
  },

  {
    name: 'TechCrunch',
    url: 'http://feeds.feedburner.com/TechCrunch/',
    image: 'http://s2.wp.com/wp-content/themes/vip/tctechcrunch2/images/logos/green.png', 
  },

  {
    name: 'Engaget',
    url: 'http://www.engadget.com/rss.xml',
    image: 'http://www.blogsmithmedia.com/www.engadget.com/media/engadget_logo.png', 
  },

  {
    name: 'Hacker News',
    url: 'http://news.ycombinator.com/rss',
    image: 'http://www.ycombinator.com/images/yc500.gif', 
  }
];