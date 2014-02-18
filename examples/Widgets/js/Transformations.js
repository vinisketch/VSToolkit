function initTransformations () {
  var view = buildPanel ();
  view.layout = vs.ui.View.VERTICAL_LAYOUT;
  view.setStyle ('padding', '20px');
  
  var viewToAnimate = new vs.ui.View ({id: 'view_to_transform'}).init ();
  view.add (viewToAnimate);
  viewToAnimate.translate (-50, 0);
  viewToAnimate.transformOrigin = [50, 50];
  
  view.add (new vs.ui.TextLabel ({text:'Rotation:'}).init ());

  var slider = new vs.ui.Slider ({
    size:[280, 10],
    range: [0, 360]
  }).init ();
  view.add (slider);
  slider.setStyle ('margin-bottom', '50px');

  slider.connect ("value").to (viewToAnimate, "rotation");

  view.add (new vs.ui.TextLabel ({text:'Scale:'}).init ());

  var slider = new vs.ui.Slider ({
    size:[280, 10],
    value: 1,
    range: [0, 3]
  }).init ();
  view.add (slider);

  slider.connect ("value").to (viewToAnimate, "scaling");
  return view;
}

