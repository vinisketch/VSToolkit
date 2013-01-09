function initButtonsProgressSlider () {
  var view = buildPanel　();
  
  var progress1 =
    new vs.ui.ProgressBar ({position:[20, 50], size:[280, 10]}).init ();

  var progress2 =
    new vs.ui.ProgressBar ({position:[20, 80], size:[280, 10]}).init ();
  progress2.indeterminate = true;

  var progress3 =
    new vs.ui.ProgressBar ({position:[20, 110], size:[100, 10], 
    range: [50, 80]}).init ();

  view.add (progress1);
  view.add (progress2);
  view.add (progress3);
  
  var slider = new vs.ui.Slider ({position:[20, 150], size:[280, 10]}).init ();
  view.add (slider);

  slider.bind ('continuous_change', this, function (e) {progress1.index = e.data;});

  slider = new vs.ui.Slider ({position:[50, 200], size:[10, 100], 
    orientation:vs.ui.Slider.VERTICAL, range: [50, 60]}).init ();
  view.add (slider);

  slider.bind ('continuous_change', this, function (e) {progress3.index = e.data;});

  return view;
}
