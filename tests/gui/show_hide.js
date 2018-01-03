function launchTest (test_view)
{
  var view0 = new vs_ui.View ({
    position:[00, 00],
    size:[400, 500],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  
  test_view.appendChild (view0.view);

  var view1 = new vs_ui.View ({
    position:[20, 10],
    size:[100, 100],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  view1.setStyle ('background-color', 'red');
  
  view0.add (view1);

  var view2 = new vs_ui.View ({
    position:[20, 130],
    size:[100, 100],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  view2.setStyle ('background-color', 'blue');
  
  view0.add (view2);
  
  var view3 = new vs_ui.View ({
    position:[20, 250],
    size:[100, 100],
    layout: vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
  view3.setStyle ('background-color', 'green');
  
  view0.add (view3);
  
  
  
  view2.setHideAnimation ([['translate', '500px,0,0'], ['opacity', '0']], {
    duration: '30s'
  });  
  view2.setShowAnimation ([['translate', '0,0,0'], ['opacity', '1']]);  
  
  view3.setHideAnimation ([['translate', '200px,0,0'], ['opacity', '0.5']], {
    duration: '6s'
  }, function () {
    view3.view.style.removeProperty ('display');
  });  
  view3.setShowAnimation ([['translate', '0,0,0'], ['rotate', '-90deg'], ['opacity', '1']], {
    duration: '4s'
  });  
  
  vs_core.scheduleAction (function () {view1.hide ();}, 500);
  vs_core.scheduleAction (function () {view1.show ();}, 1500);

  vs_core.scheduleAction (function () {view2.hide ();}, 800);
  vs_core.scheduleAction (function () {view2.show ();}, 4000);
//   
  vs_core.scheduleAction (function () {view3.hide ();}, 800);
  vs_core.scheduleAction (function () {view3.show ();}, 4000);
  vs_core.scheduleAction (function () {view3.hide ();}, 6000);
  
}
