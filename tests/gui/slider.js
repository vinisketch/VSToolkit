function launchTest (test_view)
{
  var slider = new vs.ui.Slider ({position:[50, 50], size:[300, 10], value: 64});
  slider.init ();

  test_view.appendChild (slider.view);
  slider.refresh ();

  var label1 = new vs.ui.TextLabel ({position:[50, 10], text: '64'});
  label1.init ();
  test_view.appendChild (label1.view);
  
  slider.bind ('continuous_change', this,
    function (e) {label1.text = Math.floor (e.data);});

  slider = new vs.ui.Slider ({position:[50, 100], size:[10, 100], value: 56, 
    orientation:vs.ui.Slider.VERTICAL, range: [50, 60]});
  slider.init ();

  test_view.appendChild (slider.view);
  slider.refresh ();
  
  var label2 = new vs.ui.TextLabel ({position:[100, 100], text: '56'});
  label2.init ();
  test_view.appendChild (label2.view);
  
  slider.bind ('continuous_change', this,
    function (e) {label2.text = Math.floor (e.data);});
}
