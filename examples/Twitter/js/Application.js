

var TimeLine = vs.core.createClass ({

  /** parent class */
  parent: vs.core.Array,

  properties : {
    'screen_name' : vs.core.Object.PROPERTY_IN_OUT,
    'count' : vs.core.Object.PROPERTY_IN_OUT
  }
});

var TheApplication = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  defaultUserName : 'd_thevenin',

  constructor: function (config)
  {
    this._super (config);

    this.data = new vs.core.RestStorage ({
      url : "https://api.twitter.com/1/",
      mode : vs.core.RestStorage.JSONP
    }).init ();

    this.userTimeline = new TimeLine ({
      screen_name : this.defaultUserName,
      count: 20
    }).init ();

    this.data.registerModel ("statuses/user_timeline", this.userTimeline);
  },

  applicationStarted : function (event)
  {
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
      text: 'settings',
      position : [6, 6]
    }).init ();
    this.navBar.add (button);

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
      this.userTimeline.screen_name = e.data;
      this.data.load ();
    }
  },
});

function loadApplication ()
{
  new TheApplication ({id:"twitter"}).init ();

  vs.ui.Application.start ();
}
