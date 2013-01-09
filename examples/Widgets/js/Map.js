function initMapPanel () {
  var view = buildPanel();
  view.layout = vs.ui.View.VERICAL_LAYOUT;
  
  var map = new vs.ext.ui.GMap ().init ();
  view.add (map);

  return view;
}
