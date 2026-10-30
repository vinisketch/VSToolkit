

var TimeLine = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Array,

  properties : {
    'screen_name' : vs_core.VSObject.PROPERTY_IN_OUT,
    'count' : vs_core.VSObject.PROPERTY_IN
  }
});


var SearchResult = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Array,

  properties : {
    'q' : vs_core.VSObject.PROPERTY_IN,
    'count' : vs_core.VSObject.PROPERTY_IN,
    'results' : vs_core.VSObject.PROPERTY_OUT
  }
});

var TheApplication = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,

  defaultUserName : 'd_thevenin',

  constructor: function (config)
  {
    this._super (config);
    this.tweets = new TweetsModel ().init ();

    this.data = new vs_core.RestStorage ({
      url : "https://api.twitter.com/1/",
      mode : vs_core.RestStorage.JSONP
    }).init ();

    this.userTimeline = new TimeLine ({
      screen_name : this.defaultUserName,
      count: 20
    }).init ();

    this.data.registerModel ("statuses/user_timeline", this.userTimeline);
    this.data.bind ('load', this, this.timelineResult);

    this.twitterSearch = new vs_core.RestStorage ({
      url : "http://search.twitter.com/",
      mode : vs_core.RestStorage.JSONP
    }).init ();

    this.searchData = new SearchResult ({ count: 20 }).init ();

    this.twitterSearch.registerModel ("search", this.searchData);
    this.twitterSearch.bind ('load', this, this.searchResult);
  },

  searchListener : function (event)
  {
    this.searchData.q = event.data;
    this.twitterSearch.load ();
  },

  searchResult : function ()
  {
    this.tweets.parseSearchResult (this.searchData);
  },

  timelineResult : function ()
  {
    console.log (this.userTimeline);
    this.tweets.parseTimeline (this.userTimeline);
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
    this.mainView = new vs_ui.View ().init ();
    this.add (this.mainView);
    this.mainView.setStyles ({width: '100%', height: '100%'});

    this.navBar = new vs_ui.NavigationBar ().init ();
    this.mainView.add (this.navBar);

    var button = new vs_ui.Button ({
      type: vs_ui.Button.NAVIGATION_TYPE,
      text: 'Accounts',
      position : [6, 6]
    }).init ();
    this.navBar.add (button);

    button.bind ('select', this, this.openCloseMenu);

    var searchField = new vs_ui.InputField ({
      type: vs_ui.InputField.SEARCH,
      id: 'twitter_search',
      placeholder: 'search',
      magnet: 4
    }).init ();
    this.navBar.add (searchField);

    searchField.bind ('change', this, this.searchListener);

    this.list = new vs_ui.List ({id: 'tweets', scroll: true}).init ();
    this.mainView.add (this.list);

    this.list.setItemTemplate (TweetView);
    this.list.model = this.tweets;
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

  vs_ui.Application.start ();
}
