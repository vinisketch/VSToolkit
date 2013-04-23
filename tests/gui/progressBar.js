function launchTest (test_view)
{
  var progress1 = new vs.ui.ProgressBar ({position:[50, 50], size:[300, 10]});
  progress1.init ();

  var progress2 = new vs.ui.ProgressBar ({position:[50, 80], size:[300, 10]});
  progress2.init ();
  progress2.indeterminate = true;

  var progress3 = new vs.ui.ProgressBar ({position:[50, 110], size:[100, 10], 
    range: [50, 80]});
  progress3.init ();

  test_view.appendChild (progress1.view);
  test_view.appendChild (progress2.view);
  test_view.appendChild (progress3.view);

  var index = 0;
  function updateProgress ()
  {
    progress1.index = index;
    progress3.index = index;
    index += 0.1;
    if (index > 100) index = 0;
  }
  
  setInterval (updateProgress, 10);
}
