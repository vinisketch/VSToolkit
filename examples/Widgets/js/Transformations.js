function initTransformations () {
  var view = buildPanel ();
  view.layout = vs_ui.View.VERTICAL_LAYOUT;
  view.setStyle ('padding', '20px');
  
  var viewToAnimate = new vs_ui.View ({id: 'view_to_transform'}).init ();
  view.add (viewToAnimate);
  viewToAnimate.translate (-50, 0);
  viewToAnimate.transformOrigin = [50, 50];
  
  view.add (new vs_ui.TextLabel ({text:'Rotation:'}).init ());

  var slider = new vs_ui.Slider ({
    size:[280, 10],
    range: [0, 360]
  }).init ();
  view.add (slider);
  slider.setStyle ('margin-bottom', '50px');

  slider.connect ("value").to (viewToAnimate, "rotation");

  view.add (new vs_ui.TextLabel ({text:'Scale:'}).init ());

  var slider = new vs_ui.Slider ({
    size:[280, 10],
    value: 1,
    range: [0, 3]
  }).init ();
  view.add (slider);

  slider.connect ("value").to (viewToAnimate, "scaling");
  return view;
}

