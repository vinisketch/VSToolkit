var Cooliris = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,
  
  __scroll_start: 0,

  applicationStarted : function (event)
  {
    var size = 120, marge = 20;
    this.list_images = this.view.firstElementChild;
    this.view.addEventListener (vs.core.POINTER_START, this);
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    var nb_images = 500;
    for (var i = 0; i < nb_images; i++)
    {
      path  = "http://tympanus.net/Tutorials/SlidingPanelPhotowallGallery/thumbs/";
      path += (i % 36) + 1 + ".jpg";
      var image = new vs.ui.ImageView ({
        size:[size, size],
        position: [Math.floor (i / 5) * (size + marge), (i % 5) * (size + marge)],
        src: path
      }).init ();
      this.add (image, 'images');
    }
    vs.util.setElementSize (this.list_images, (nb_images / 5) * (size + marge), 450);
    this.__max_scroll = (nb_images / 5) * (size + marge) - 1024;
    this.view.style.webkitTransition = '0.2s ease-in';
  },
  
  handleEvent : function (e)
  {
    if (e.type === vs.core.POINTER_START)
    {
      // prevent multi touch events
      if (vs.core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }
      e.stopPropagation ();
      e.preventDefault();

      this.__touch_start =
        vs.core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX;
      this._last_pos = this.__touch_start;
      this.__delta = 0;
      
      var p = ((450 - this.__scroll_start) / this.__max_scroll) * 100;
      var p = ((this.__scroll_start + this.__touch_start) / this.__max_scroll) * 100;
      var origin_str = this.__touch_start + 'px 220px';
      this.view.style ['-webkit-transform-origin'] = origin_str;
      
      
      this.__scroll_start_time = e.timeStamp;
      this.list_images.style.webkitTransition = '0';
      document.addEventListener (vs.core.POINTER_MOVE, this, true);
      document.addEventListener (vs.core.POINTER_END, this, true);

      this.transformView (this.__scroll_start, 10);
    }
    else if (e.type === vs.core.POINTER_MOVE)
    {
      e.stopPropagation ();
      e.preventDefault ();

      var pageX = vs.core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX;
      this.__delta = pageX - this.__touch_start;  

      var newPos = this.__scroll_start + this.__delta;
      var dx = this._last_pos - pageX;
      this.transformView (newPos, (dx > 0)?10:-10);
      
      this._last_pos = pageX;
    }
    else if (e.type === vs.core.POINTER_END)
    {
      this.__scroll_start += this.__delta;
      if (this.__scroll_start < -this.__max_scroll)
      {
        this.__scroll_start = -this.__max_scroll;
        this.list_images.style.webkitTransition = '0.3s ease-out';
      }
      else if (this.__scroll_start > 0)
      {
        this.__scroll_start = 0;
        this.list_images.style.webkitTransition = '0.3s ease-out';
      }
      else
      {
        var time = e.timeStamp - this.__scroll_start_time;
        if (time < 250)
        {
          ///  this._momentum * 2;
          if (this.__delta)
          { pos = this.__scroll_start + this.__delta * 2; }
          else
          { pos = this.__scroll_start; }
          
          if ( pos > 0) // min position
          {
            pos = 0;
          }
          else if ( pos < -this.__max_scroll) // maximum position
          {
            pos = -this.__max_scroll;
          }
          
          this.__scroll_start = pos;
          
          // animate the list
          this.list_images.style.webkitTransition = '0.3s ease-out';
        }
      }
      this.view.style.webkitTransition = '0.5s ease-out';
      this.transformView (this.__scroll_start, 0);
      
      document.removeEventListener (vs.core.POINTER_MOVE, this, true);
      document.removeEventListener (vs.core.POINTER_END, this, true);
    }
  },
  
  transformView : function (pos, deg)
  {
    vs.util.setElementTransform
       (this.list_images, 'translate3d(' + pos + 'px,0,0)');

    vs.util.setElementTransform
      (this.view, ' perspective(400) rotateY(' + deg + 'deg) ');
  }
});

function loadApplication ()
{
  new Cooliris ({id:"cooloris"}).init ();

  vs.ui.Application.start ();
}
