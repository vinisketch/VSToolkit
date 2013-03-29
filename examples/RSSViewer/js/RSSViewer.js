var RSSViewer = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function ()
  {
    this._super ();

    // main view
    this.navBar = new vs.ui.NavigationBar ();
    this.navBar.init ();
    this.add (this.navBar);

    this.backButton = new vs.ui.Button ({
      id:'back_button', text:'back',
      type : vs.ui.Button.NAVIGATION_BACK_TYPE
    }).init ();
    this.navBar.add (this.backButton);

    // Feeds View
    this.feedsView = new FeedsView({id:'feeds_view'}).init ();

    // Feeds View
    this.feedItems = new vs.ui.List ({
      id:'feed_items',
      hasArrow : true,
      scroll : true
    }).init ();
    this.feedItems.addClassName ('page');
    this.add (this.feedItems);

    // Detail View
    this.detailView = new DetailView ({id:'detail_view'}).init ();
    this.add (this.detailView);


    // RSS Request
    this.rssRequest = new vs.data.RSSRequester ().init ();
    this.rssRequest.bind ('rssload', this);
    this.rssRequest.bind ('rssloaderror', this);

    // Views controller
    this.controller = new vs.fx.NavigationController (this, this.navBar);
    this.controller.init ();

    this.controller.push (this.feedsView);
    this.controller.initialComponent = this.feedsView.id;
    this.controller.configureNavigationBarState (this.feedsView.id, []);

    this.controller.push (this.feedItems);
    this.controller.configureNavigationBarState
      (this.feedItems.id, [{comp: 'back_button'}]);
    this.controller.configureTransition
      (this.feedsView.id, this.feedItems.id, 'goToFeed');

    this.controller.push (this.detailView);
    this.controller.configureNavigationBarState
      (this.detailView.id, [{comp: 'back_button'}]);
    this.controller.configureTransition
      (this.feedItems.id, this.detailView.id, 'goToDetail');

    this.backButton.bind ('select', this);
    this.feedsView.bind ('view_feed', this);
    this.feedItems.bind ('itemselect', this);

    this.feedItems.layout = vs.ui.View.VERTICAL_LAYOUT;
  },

  applicationStarted : function (event)
  {
  },

  notify : function (event)
  {
    if (event.type == 'view_feed')
    {
      this.rssRequest.url = event.data;
      this.rssRequest.loadRSS ();
    }
    else if (event.type == 'rssload')
    {
      this.feedItems.data = this.rssRequest.items;
      this.feedItems.refresh ();
      this.controller.notify ({type: 'goToFeed'});
    }
    else if (event.type == 'itemselect')
    {
      var item = event.data.item;
      this.detailView.title = item.title;
      this.detailView.description = item.description;
      this.detailView.propertiesDidChange ();
      this.controller.notify ({type: 'goToDetail'});
    }
    else if (event.type == 'select')
    {
      this.controller.notify ({type: 'back'});
    }
  }
});

function loadApplication ()
{
  new RSSViewer ({id:"rss_viewer", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}
