function launchTest (test_view)
{
  var view0 = new vs_ui.View ({
    position:[0, 0],
    size:[400, 500],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  
  test_view.appendChild (view0.view);

  var view1 = new vs_ui.View ({
    position:[0, 10],
    size:[300, 400],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  view1.setStyle ('background-color', 'red');
  
  view0.add (view1);

  var view2 = new vs_ui.View ({
    position:[20, 50],
    size:[230, 210],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  view2.setStyle ('background-color', 'blue');
  
  view1.add (view2);

  var view3 = new vs_ui.View ({
    position:[30, 100],
    size:[200, 100],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  view3.setStyle ('background-color', 'yellow');
  
  view2.add (view3);

  var progress = new vs_ui.ProgressBar ({
    position:[50, 10],
    size:[100, 10]
  }).init ();

  view3.add (progress);

  var button = new vs_ui.Button ({
    position:[50, 40],
    text: 'Huhh'
  }).init ();

  view3.add (button);
  
  view1.magnet = 5;
  view2.magnet = 2;
  view3.magnet = 4;
  button.magnet = 3;
  progress.magnet = 1;
}
