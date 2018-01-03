function launchTest (test_view)
{
  var index = 62;
  var progress1 = new vs_ui.ProgressBar ({
    position:[50, 50], size:[300, 10], index: index
  });
  progress1.init ();

  var progress2 = new vs_ui.ProgressBar ({
    position:[50, 80],
    size:[300, 10]
  });
  progress2.init ();
  progress2.indeterminate = true;

  var progress3 = new vs_ui.ProgressBar ({position:[50, 110], size:[100, 10], 
    range: [50, 80], index: index});
  progress3.init ();

  test_view.appendChild (progress1.view);
  test_view.appendChild (progress2.view);
  test_view.appendChild (progress3.view);

  function updateProgress ()
  {
    progress1.index = index;
    progress3.index = index;
    index += 0.1;
    if (index > 100) index = 0;
  }
  
  vs_core.scheduleAction (function () {setInterval (updateProgress, 10)}, 1000);
}
