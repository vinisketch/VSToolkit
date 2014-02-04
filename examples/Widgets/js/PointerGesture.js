function initPointerGesture () {

  var view = buildPanel('demos_gesture');
  view.layout = vs.ui.View.ABSOLUTE_LAYOUT;

  var scrollView = new MyView ({
    id:'myScroll',
    size: [300, 200],
    position: [50, 50]
  }).init ();
  view.add (scrollView);
  
  var image_url = 
    "http://graphics8.nytimes.com/images/2009/06/11/business/11basics.600.jpg"
    
  var image = new vs.ui.ImageView ({
    src: image_url,
    size: [300, 200]
  }).init ();
  scrollView.add (image);

  scrollView = new MyView ({
    id:'myScroll',
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
  
  return view;
};

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

    this.addPointerRecognizer (new vs.ui.DragRecognizer (this));
    this.addPointerRecognizer (new vs.ui.PinchRecognizer (this));
    this.addPointerRecognizer (new vs.ui.RotationRecognizer (this));
  },
  
  didPinchChange : function (scale, e) {
    this.scaling = scale;
    //this.__update_debug (e.pointerList, e.changedPointerList, false);
  },

  didPinchStart : function (scale, e) {
    this.flushTransformStack ();
  },

  didPinchEnd : function (scale, e) {
    this.flushTransformStack ();
  },

  didRotationChange : function (rotation, e) {
    this.rotation = rotation;
    //this.__update_debug (e.pointerList, e.changedPointerList, false, rotation);
  },

  didDrag : function (drag_info, e) {
    this.translation = [drag_info.dx, drag_info.dy];
    //this.__update_debug (e.pointerList, e.changedPointerList, false);
  },

  didDragStart : function (e) {
    // save drag translation
    this.flushTransformStack ();
    //this.__update_debug (null, null, true);
  },

  didDragEnd : function (e) {
    // save drag translation
    this.flushTransformStack ();
    //this.__update_debug (null, null, true);
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
        div.parentElement.removeChild (div);
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
