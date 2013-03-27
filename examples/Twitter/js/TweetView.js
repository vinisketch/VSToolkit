var TweetView = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,

  properties : {
    user : {
      set: function (v) {
        if (v && v.profile_image_url)
          this.img = v.profile_image_url;
        if (v && v.screen_name)
          this.author = v.screen_name;
      }
    },

    profile_image_url : {
      set: function (v) { this.img = v ; }
    }
  },

  template: "\
<div class=\"tweet_item\" x-hag-hole=\"children\"> \
  <img src=\"${img}\"></img> \
  <span>${author}</span><br />\
  <span>${text}</span>\
</div>",

});
