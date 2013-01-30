function initButtonsProgressSlider () {
  var view = buildPanel　();
  view.layout = vs.ui.View.VERTICAL_LAYOUT;
  
  view.setStyles ({margin: "10px"});
  
  // All children have a margin
  view.addCssRule ('>*', "margin: 15px");

  var progress1 =
    new vs.ui.ProgressBar ({size:[280, 10]}).init ();

  var progress2 =
    new vs.ui.ProgressBar ({size:[280, 10]}).init ();
  progress2.indeterminate = true;

  var progress3 =
    new vs.ui.ProgressBar ({
      size:[100, 10], 
      range: [50, 80]
    }).init ();

  view.add (progress1);
  view.add (progress2);
  view.add (progress3);
  
  var slider = new vs.ui.Slider ({size:[280, 10]}).init ();
  view.add (slider);

  slider.bind ('continuous_change', this, function (e) {progress1.index = e.data;});

  slider = new vs.ui.Slider ({ size:[10, 100], 
    orientation:vs.ui.Slider.VERTICAL, range: [50, 60]}).init ();
  view.add (slider);

  slider.bind ('continuous_change', this, function (e) {progress3.index = e.data;});

  return view;
}
