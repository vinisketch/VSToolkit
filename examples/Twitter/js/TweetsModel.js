var TweetModel = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Model,

  properties : {
    'img' : vs_core.VSObject.PROPERTY_IN_OUT,
    'text' : vs_core.VSObject.PROPERTY_IN_OUT,
    'author' : vs_core.VSObject.PROPERTY_IN_OUT
  }
});

var TweetsModel = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Array,

  parseTimeline : function (timeline)
  {
    if (!timeline) return;

    this._data = [];

    var results = timeline._data;
    for (var i = 0; i < results.length; i++)
    {
      var data = results [i];
      var tweet = new TweetModel (
        {
          img: data.user.profile_image_url,
          text: data.text,
          author: data.user.screen_name
        }).init ();
      this._data.push (tweet);
    }

    this.change ();
  },

  parseSearchResult : function (search_result)
  {
    if (!search_result) return;

    this._data = [];

    var results = search_result._results;
    for (var i = 0; i < results.length; i++)
    {
      var data = results [i];
      var tweet = new TweetModel (
        {
          img: data.profile_image_url,
          text: data.text,
          author: data.from_user
        }).init ();
      this._data.push (tweet);
    }

    this.change ();
  }
});
