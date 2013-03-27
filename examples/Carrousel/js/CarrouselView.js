var CarrouselView = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  _current_rotation: -90,
  
  // build the flip view
  initComponent : function (event) {
    this._super ();
    
    this.addClassName ('carrouselView');
    
    var size = 150, marge = 20; i = 0;
    var nb_images = 100;
	  var posterAngle = 360 / 15;
    var base_url  = "http://tympanus.net/Tutorials/SlidingPanelPhotowallGallery/thumbs/";
    for (; i < 20; i++) {
      var url = base_url + ((i % 36) + 1) + ".jpg";
      var image = new vs.ui.ImageView ({
        size:[size, size],
        src: url
      }).init ();
      this.add (image);
      image.addClassName ('image');

      var transform = 'rotateY('+ (posterAngle * i - 180) + 'deg) translateZ(-500px)';
		  image.view.style.webkitTransform = transform;
    }
    for (; i < 40; i++) {
      var url = base_url + ((i % 36) + 1) + ".jpg";
      var image = new vs.ui.ImageView ({
        size:[size, size],
        position: [0, (size + marge)],
        src: url
      }).init ();
      this.add (image);
      image.addClassName ('image');

      var transform = 'rotateY('+ (posterAngle * i - 180) + 'deg) translateZ(-500px)';
		  image.view.style.webkitTransform = transform;
    }
    for (; i < 60; i++) {
      var url = base_url + ((i % 36) + 1) + ".jpg";
      var image = new vs.ui.ImageView ({
        size:[size, size],
        position: [0, 2 * (size + marge)],
        src: url
      }).init ();
      this.add (image);
      image.addClassName ('image');

      var transform = 'rotateY('+ (posterAngle * i - 180) + 'deg) translateZ(-500px)';
		  image.view.style.webkitTransform = transform;
    }
    document.addEventListener (vs.core.POINTER_START, this);
  },
  
  handleEvent: function (e)
  {
    // by default cancel any default behavior to avoid scroll for instance
    e.preventDefault ();
        
    switch (e.type)
    {
      case vs.core.POINTER_START:
        // prevent multi touch events
        if (vs.core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }

        // we keep the event
        e.stopPropagation ();
        
        this.__start_x = vs.core.EVENT_SUPPORT_TOUCH ?
          e.touches[0].pageX : e.pageX;
          
        document.addEventListener (vs.core.POINTER_END, this);
        document.addEventListener (vs.core.POINTER_MOVE, this);
        this.view.style.WebkitTransitionDuration = "0";

        return false;
      break;

      case vs.core.POINTER_MOVE:
       // prevent multi touch events
        if (vs.core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }

        this.__rotation =  this._current_rotation - (
          (vs.core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX) - this.__start_x) / 8;
 
        if (this.__rotation < -120) this.__rotation = -120;
        if (this.__rotation > -30) this.__rotation = -30

        this.view.style.webkitTransform =
          "rotateY(" + this.__rotation + "deg)";

        return false;
      break;

      case vs.core.POINTER_END:
        // we keep the event
        e.stopPropagation ();
        
        this._current_rotation = this.__rotation;
        
        document.removeEventListener (vs.core.POINTER_END, this);
        document.removeEventListener (vs.core.POINTER_MOVE, this);
        
        return false;
      break;
    }
  }
});