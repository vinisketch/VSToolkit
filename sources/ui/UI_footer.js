util.defineProperty (document, 'preventScroll', {
  get : function ()
  {
    return document._preventScroll;
  },
  
  set : function (preventScroll)
  {
    document._preventScroll = preventScroll;
    if (preventScroll)
    {
      // for android
      document.addEventListener ("touchstart", preventBehavior, false);
      // for android and other
      document.addEventListener ("touchmove", preventBehavior, false);
      document.addEventListener ("scroll", preventBehavior, false);
      window.scrollTo (0, 0);
    }
    else
    {
      // for android
      document.removeEventListener ("touchstart", preventBehavior, false);
      // for android and other
      document.removeEventListener ("touchmove", preventBehavior, false);
      document.removeEventListener ("scroll", preventBehavior, false);
    }
  }
});

})(window);