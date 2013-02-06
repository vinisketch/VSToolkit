function initMapPanel () {
  var infoWindow =
    "<div class=\"gmap_info\">\
      <div>1:{title}</div>\
      <div class=\"subtitle\">2:{subtitle}</div>\
    </div>";      

  var view = buildPanel();
  view.layout = vs.ui.View.ABSOLUTE_LAYOUT;

  var searchField = new vs.ui.InputField ({
    type: vs.ui.InputField.SEARCH
  }).init ();
  view.add (searchField);
  searchField.setStyle ("margin", '5px');
  searchField.enable = false;
  
  var map = new vs.ext.ui.GMap ({
    zoomControl: true,
    streetViewControl: true
  }).init ();
  view.add (map);
  map.setAnnotationTemplate ('annotationTemplate', null, infoWindow);

  gSearsh = new vs.data.GoogleSearch ().init ();
  view.add (gSearsh);
  gSearsh.setSearchEngine (vs.data.GoogleSearch.LOCAL_SEARCH_ENGINE);
    
  var configureEvent = function ()
  {
    searchField.enable = true;
    searchField.bind ('change', view);
  }

  // wait for map ready to configure
  if (map.isReady ())
    configureEvent ();
  else
    map.bind ('mapload', this, configureEvent);    

  view.notify = function (event)
  {
    gSearsh.addressToGPSCoordinate (event.src.value, function (pos) {
      map.center = pos;
      map.removeAnnotation ('annot_id');
      map.addAnnotation ("annot_id", pos[0], pos[1], {
        title: event.src.value,
        subtitle: JSON.stringify (pos)
      }, 'annotationTemplate');

    }, this);
  } 
  
  return view;
}

