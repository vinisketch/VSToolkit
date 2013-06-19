var Scroll = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    
    scrollView = new MyView ({
      id:'myScroll',
      size : [600, 600],
      position: [000, 0],
      layout : vs.ui.View.ABSOLUTE_LAYOUT
    }).init ();
    this.add (scrollView);

    button = new vs.ui.Button ({
      position:[220, 130], text: "hello",
      type: vs.ui.Button.NAVIGATION_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

    button = new vs.ui.Button ({
      position:[220, 170], text: "Back",
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

    button = new vs.ui.Button ({
      position:[320, 220], text: "Forward",
      type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

  },
  
   
  notify : function (e) {
    var self = this;
  }
});

function loadApplication () {
  new Scroll ({id:"widgets"}).init ();

  vs.ui.Application.start ();
}



var MyView = vs.core.createClass ({

  parent: vs.ui.View,
  
  constructor : function (config)
  {
    this._super (config);
    
    this._binding_ = false;
  },
  
  initComponent : function ()
  {
    this._super ();
    
    this.view.addEventListener (vs.core.POINTER_START, this);
    this.__pointers = {};
    vs.util.setElementTransformOrigin (this.view, '0px 0px');
  },
  
  /**
   * @private
   * @function
   */
  handleEvent : function (e)
  {
    switch (e.type)
    {
      case vs.core.POINTER_START:
        this.pointerStart (e);
        break;
      case vs.core.POINTER_MOVE:
        this.pointerMove (e);
        break;
      case vs.core.POINTER_CANCEL:
      case vs.core.POINTER_END:
        this.pointerEnd (e);
        break;
      case 'gesturestart':
        this.gestureStart (e);
        break;
      case 'gesturechange':
        this.gestureChange (e);
        break;
      case 'gestureend':
      case 'gesturecancel':
        this.gestureEnd (e);
        break;
      case 'webkitTransitionEnd':
        this._scroll_transition_end ();
        break;
      case 'orientationchange':
      case 'resize':
        this.refresh ();
        break;
      case 'DOMSubtreeModified':
        this.onDOMModified (e);
        break;
     }
    return false;
  },
  
  /**
   * calculate the angle between two points
   * @param   object  pos1 { x: int, y: int }
   * @param   object  pos2 { x: int, y: int }
   */
  getAngle : function ( pos1, pos2 )
  {
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI;
  },
  
  /**
   * calculate the distance between two points
   * @param   object  pos1 { x: int, y: int }
   * @param   object  pos2 { x: int, y: int }
   */
  getDistance : function ( pos1, pos2 )
  {
      var x = pos2.x - pos1.x, y = pos2.y - pos1.y;
      return Math.sqrt((x * x) + (y * y));
  },

  /**
   * count the number of fingers in the event
   * when no fingers are detected, one finger is returned (mouse pointer)
   * @param  event
   * @return int  fingers
   */
  countPointers : function ( event )
  {
    // there is a bug on android (until v4?) that touches is always 1,
    // so no multitouch is supported, e.g. no, zoom and rotation...
    return event.touches ? event.touches.length : 1;
  },
  
  getTransform : function ()
  {
  
  },
  
  __update_debug : function (pointers, clear, angle)
  {
    // remove debug info
    if (clear)
    {
      if (!this._debugs) return;
      for (var key in this._debugs)
      {
        var div = this._debugs [key];
        div.parentElement.removeChild (div);
      }
      delete (this._debugs);
      return;
    }
    if (!this._debugs) this._debugs = {};
    
    var x = 0, y = 0 , nb_pointer = 0;
    for (var key in pointers)
    {
      var pointer = pointers [key];
      var div = this._debugs [key];
      if (!div)
      {
        div = document.createElement ('div');
        div.className = '__debug__pointer';
        this._debugs [key] = div;
        this.view.parentElement.insertBefore (div, this.view);
      }
      vs.util.setElementPos (div, pointer.x - 15, pointer.y - 15);
      
      x += pointer.x;
      y += pointer.y;
      nb_pointer ++;
    }
    
    var barycentre = this._debugs ['barycentre'];
    if (!barycentre)
    {
      barycentre = document.createElement ('div');
      barycentre.className = '__debug__barycentre';
      this._debugs ['barycentre'] = barycentre;
      this.view.parentElement.insertBefore (barycentre, this.view);
    }
    vs.util.setElementPos (barycentre, x / nb_pointer - 10, y / nb_pointer - 10);
    if (vs.util.isNumber (angle)) barycentre.innerHTML = Math.floor (angle);
    else barycentre.innerHTML = "";
    
    // remove old pointers trace
    for (var key in this._debugs)
    {
      if (key === 'barycentre') continue;
      
      var div = this._debugs [key];
      if (!pointers [key])
      {
        div.parentElement.removeChild (div);
        delete (this._debugs [key]);
      }
    }
  },
  
  getBarycenter : function (pointers)
  {
    var x = 0, y = 0, nb_pointer = 0;
    for (var key in pointers)
    {
      var pointer = pointers [key];
      
      x += pointer.x;
      y += pointer.y;
      nb_pointer ++;
    }
    
    return {x: x / nb_pointer, y: y / nb_pointer};
  },
   
  getPointersData : function (event)
  {
    var result = {};
    
    if (!vs.core.EVENT_SUPPORT_TOUCH)
    {
      result ['_default_'] = {x: event.pageX, y: event.pageY, z: 0};
    }
    else
    {
      var touches = event.touches;
      for (var i = 0; i < touches.length; i ++)
      {
        var pointer = touches [i];
        result [pointer.identifier] = {x: pointer.pageX, y: pointer.pageY, z: 0};
      }
    }
    return result;
  },
    
  pointerStart: function (e)
  {
    var matrix, len, origin_str, bx = 0, by = 0;
        
    this._start = this.getPointersData (e);
    var count = this.countPointers (e);
    
    if (!this._binding_)
    {

      document.addEventListener (vs.core.POINTER_MOVE, this);
      document.addEventListener (vs.core.POINTER_END, this);
      document.addEventListener (vs.core.POINTER_CANCEL, this);
      this._binding_ = true;
    }
    
    // set the barycentre of the new transformation
    var barycentre = this.getBarycenter (this._start);
//    barycentre = this.getProjection (barycentre);
    this.setNewTransformOrigin (barycentre);
  
    if (count === 2) // pinch
    {
      var touches = event.touches;
      var args = [];
      for (var i = 0; i < touches.length; i ++)
      {
        args.push (this._start [touches[i].identifier]);
      }
      this._start_angle = this.getAngle.apply (this, args);
    }
    else this._start_angle = undefined;
    this.__update_debug (this._start, false, this._start_angle);
  },
  
  calculateTranslate: function (start_pointers, end_pointers)
  {
    for (var key in start_pointers) {
      var pointer_s = start_pointers [key];
      var pointer_e = end_pointers [key];
      if (!pointer_e) continue;
      
      return {
        x: pointer_e.x - pointer_s.x,
        y: pointer_e.y - pointer_s.y,
        z: pointer_e.z - pointer_s.z
      };
    }
    
    return {x: 0, y: 0, z: 0}
  },
  
  pointerMove: function (e)
  {
    var count = this.countPointers (e), angle;

    this._move = this.getPointersData (e);

    if (count === 1) // drag
    {
      var dist = this.calculateTranslate (this._start, this._move);

      this.translation = [dist.x, dist.y];
    }
    else if (count === 2) // pinch
    {
      var touches = event.touches;
      var args = [];
      for (var i = 0; i < touches.length; i ++)
      {
        args.push (this._move [touches[i].identifier]);
      }
      angle = this._start_angle - this.getAngle.apply (this, args);

      this.rotation = -angle;
      //console.log (this._start_angle - angle);

//       this.getTransform (this._start, this._move);
    }
    this.__update_debug (this._move, false, angle);
  },

  
  pointerEnd: function (e)
  {
    var matrix, len, origin_str, bx = 0, by = 0;
    
    var count = this.countPointers (e);

    if (this._binding_ && (!vs.core.EVENT_SUPPORT_TOUCH || count === 0))
    {
      document.removeEventListener (vs.core.POINTER_MOVE, this);
      document.removeEventListener (vs.core.POINTER_END, this);
      document.removeEventListener (vs.core.POINTER_CANCEL, this);
      this._binding_ = false;
      
      this._start_angle = undefined;
      
     this.__update_debug (null, true);
    }
  }

});
