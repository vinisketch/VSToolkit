function launchTest (test_view)
{
  var item1 = new vs_ui.TextLabel ({
    id: 'item1',
    text: 1,
    position:[50, 50],
    size:[200, 200]
  }).init ();
  test_view.appendChild (item1.view);
  item1.setStyle ('background-color', 'red');
  item1.setStyle ('color', 'white');
  item1.setStyle ('text-align', 'center');
  item1.setStyle ('-webkit-transform-origin', '50% 50%');

  var item2 = new vs_ui.TextLabel ({
    id: 'item2',
    text: 2,
    position:[50, 300],
    size:[40, 100]
  }).init ();
  test_view.appendChild (item2.view);
  item2.setStyle ('background-color', 'blue');
  item2.setStyle ('color', 'white');
  item2.setStyle ('text-align', 'center');
  item2.setStyle ('min-width', '40px');
  item2.setStyle ('-webkit-transform-origin', '50% 50%');

  var rotate1 = new vs_ui.RotateXYZAnimation (30, 50, 100);
  var rotate2 = new vs_ui.RotateXYZAnimation (0,0,-100);
  var rotate3 = new vs_ui.RotateXYZAnimation (0,0,0);
  var scale = new vs_ui.ScaleAnimation (2, 0.5, 1);
  scale.durations = rotate1.durations =
    rotate2.durations = rotate3.durations = '2s';
  scale.additive = rotate1.additive =
    rotate2.additive = rotate3.additive = true;

  var group1 = vs_core.par ([rotate1, item1]);
  var group2 = vs_core.seq (group1, [rotate2, item2]);
  var group3 = vs_core.seq (group2, vs_core.par ([rotate3, item1], [rotate3, item2]));
  group3.start ();
}
