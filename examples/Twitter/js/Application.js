
var TheApplication = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,
  
  applicationStarted : function (event)
  {
    this.data = new vs.core.RestStorage ().init ();
    this.data.url = "https://twitter.com/";
    
    this.userTimeline = new vs.core.Array ({id : 'd_thevenin'});
    this.userTimeline.init ();    
    
    this.data.registerModel ("statuses/user_timeline", this.userTimeline);

    this.buildMainView ();
    
    this.menu = new MenuPanel ({id: 'MenuPanel'}).init ();
    this.add (this.menu);
    this.menu.hide ();

    this.menu.bind ('selectitem', this, this.openCloseMenu);
    
    this.data.load ();
  },
  
  buildMainView : function ()
  {
    this.mainView = new vs.ui.View ().init ();
    this.add (this.mainView);
    this.mainView.setStyles ({width: '100%', height: '100%'});
    
    this.navBar = new vs.ui.NavigationBar ().init ();
    this.mainView.add (this.navBar);
    
    var button = new vs.ui.Button ({
      type: vs.ui.Button.NAVIGATION_TYPE,
      text: 'settings'
    }).init ();
    this.navBar.add (button);
    button.position  = [6, 6];
    
    button.bind ('select', this, this.openCloseMenu);
    
    this.list = new vs.ui.List ({id: 'tweets', scroll: true}).init ();
    this.mainView.add (this.list);
    
    this.list.setItemTemplate (TweetView);
    this.list.model = this.userTimeline;
  },
  
  openCloseMenu : function (e)
  {
    if (this.menu.visible) this.menu.hide ();
    else this.menu.show ();
    
    if (e && e.type == 'selectitem')
    {
      this.userTimeline._id = e.data;
      this.data.load ();
    }
  },
});

function loadApplication ()
{
  new TheApplication ({id:"carrouselBook"}).init ();

  vs.ui.Application.start ();
}
