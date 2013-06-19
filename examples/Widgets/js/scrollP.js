var Scroll = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    

//     var view = new MyView ({
//       position: [50, 50],
//       layout : vs.ui.View.ABSOLUTE_LAYOUT
//     }).init ();
//     this.add (view);
//     view.setStyle ('background', 'yellow');
    
    var view = this;
    
    var scrollView = new MyView ({
      id:'myScroll1',
      size: [300, 200],
      position: [50, 50]
    }).init ();
    scrollView.setStyle ('background', 'blue');
    view.add (scrollView);
  
    var image_url = 
      "http://graphics8.nytimes.com/images/2009/06/11/business/11basics.600.jpg"
    
    var image = new vs.ui.ImageView ({
      src: image_url,
      size: [300, 200]
    }).init ();
//    scrollView.add (image);

    scrollView = new MyView ({
      id:'myScroll2',
      size: [400, 300],
      position: [50, 350],
      layout : vs.ui.View.ABSOLUTE_LAYOUT
    }).init ();
    view.add (scrollView);
    scrollView.setStyle ('background', 'green');
  
    button = new vs.ui.Button ({
      position:[100, 100], text: "hello",
      type: vs.ui.Button.NAVIGATION_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

    button = new vs.ui.Button ({
      position:[100, 150], text: "Back",
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

    button = new vs.ui.Button ({
      position:[200, 150], text: "Forward",
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
    
    vs.addPointerListener (this.view, vs.POINTER_START, this);
    vs.addPointerListener (this.view, vs.GESTURE_START, this);
    this.__pointers = {};
    vs.util.setElementTransformOrigin (this.view, '0px 0px');
  },
  
  /**
   * @private
   * @function
   */
  handleEvent : function (e)
  {
    e.stopPropagation ();
    e.preventDefault ();
    
    switch (e.type)
    {
      case vs.POINTER_START:
        this.pointerStart (e);
        break;

      case vs.POINTER_MOVE:
        this.pointerMove (e);
        break;

      case vs.POINTER_END:
        this.pointerEnd (e);
        break;

      case vs.GESTURE_START:
        this.gestureStart (e);
        break;
        
      case vs.GESTURE_CHANGE:
        this.gestureChange (e);
        break;
        
      case vs.GESTURE_END:
        this.gestureEnd (e);
        break;
     }
    return false;
  },

  pointerStart: function (e)
  {
    if (e.targetPointerList.length === 1 && !this._binding_)
    {
      vs.addPointerListener (document, vs.POINTER_MOVE, this);
      vs.addPointerListener (document, vs.POINTER_END, this);
      this._binding_ = true;
      var pointer = e.targetPointerList [0];
      
      this._start_pos = [pointer.pageX, pointer.pageY];
      this.setNewTransformOrigin ({x: 0, y: 0});
    }
    else if (this._binding)
    {
      vs.removePointerListener (document, vs.POINTER_MOVE, this);
      vs.removePointerListener (document, vs.POINTER_END, this);
      this._binding_ = false;
    }
  },

  pointerMove: function (e)
  {
    if (e.targetPointerList.length !== 1) return;
    var pointer = e.targetPointerList [0];
    
//     console.log ('>>>>>>>>');
//     console.log ('id: ' + this.id);
//     console.log ('target id: ' + pointer.target.getAttribute ('id'));
//     console.log ('<<<<<<<<< ');

    this.translation = [
      pointer.pageX - this._start_pos [0], 
      pointer.pageY - this._start_pos [1]
    ];

    this.__update_debug (e.targetPointerList, e.changedPointerList, false);
  },

  pointerEnd: function (e)
  {
    if (this._binding_)
    {
      vs.removePointerListener (document, vs.POINTER_MOVE, this);
      vs.removePointerListener (document, vs.POINTER_END, this);
      this._binding_ = false;
    }
    this.__update_debug (null, null, true);
  },

  gestureStart : function (e)
  {
    vs.addPointerListener (document, vs.GESTURE_CHANGE, this);
    vs.addPointerListener (document, vs.GESTURE_END, this);
    this.setNewTransformOrigin (e.centroid);

    this.__update_debug (e.targetPointerList, e.changedPointerList, false, e.rotation);
  },

  gestureChange : function (e)
  {
    this.__update_debug (e.targetPointerList, e.changedPointerList, false, e.rotation);
    
    this.scaling = e.scale;
    this.rotation = e.rotation;
    this.translation = e.translation;
  },

  gestureEnd : function (e)
  {
    this.__update_debug (null, null, true);
    vs.removePointerListener (document, vs.GESTURE_CHANGE, this);
  },
    
  __update_debug : function (pointers, pointersToRemove, clear, angle)
  {
    // remove debug info
    if (clear)
    {
      if (!this._debugs) return;
      for (var key in this._debugs)
      {
        var div = this._debugs [key];
        document.body.removeChild (div);
      }
      this._debugs = {};
      return;
    }
    if (!this._debugs) this._debugs = {};
    
    var x = 0, y = 0 , nb_pointer = pointers.length, _pointers_ = {};
    for (var index = 0; index < nb_pointer; index++)
    {
      var pointer = pointers [index];
      var div = this._debugs [pointer.identifier];
      if (!div)
      {
        div = document.createElement ('div');
        div.className = '__debug__pointer';
        this._debugs [pointer.identifier] = div;
        document.body.appendChild (div, this.view);
      }
      vs.util.setElementPos (div, pointer.pageX - 15, pointer.pageY - 15);
      _pointers_ [pointer.identifier] = true;
     
      x += pointer.pageX;
      y += pointer.pageY;
    }
    
    var centroid = this._debugs ['centroid'];
    if (!centroid)
    {
      centroid = document.createElement ('div');
      centroid.className = '__debug__centroid';
      this._debugs ['centroid'] = centroid;
      document.body.appendChild (centroid, this.view);
    }
    vs.util.setElementPos (centroid, x / nb_pointer - 10, y / nb_pointer - 10);
    if (vs.util.isNumber (angle)) centroid.innerHTML = Math.floor (angle);
    else centroid.innerHTML = "";
    
    // remove old pointers trace
    for (var index = 0; index < pointersToRemove.length; index++)
    {
      var pointer = pointersToRemove [index];
      if (_pointers_ [pointer.identifier]) return;
      
      var div = this._debugs [pointer.identifier];
      if (div)
      {
        document.body.removeChild (div);
        delete (this._debugs [pointer.identifier]);
      }
    }
  }
});
