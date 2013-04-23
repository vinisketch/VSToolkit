function launchTest (parent_view)
{
  var button1 = new vs.ui.Button ({
    position:[50, 20], text: "Bounce", size:[130, 43]
  });
  button1.init ();

  var button2 = new vs.ui.Button ({
    position:[200, 20], text: "Shake", size:[130, 43]
  });
  button2.init ();

  var button3 = new vs.ui.Button ({
    position:[50, 430], text: "Swing", size:[130, 43]
  });
  button3.init ();

  var button21 = new vs.ui.Button ({
    position:[200, 430], text: "Pulse", size:[130, 43]
  });
  button21.init ();

  var button22 = new vs.ui.Button ({
    position:[200, 80], text: "FlipInX", size:[130, 100]
  });
  button22.init ();

  var button23 = new vs.ui.Button ({
    position:[50, 80], text: "FlipOutX", size:[130, 100]
  });
  button23.init ();

  var button31 = new vs.ui.Button ({
    position:[50, 200], text: "FlipInY", size:[130, 43]
  });
  button31.init ();

  var button32 = new vs.ui.Button ({
    position:[200, 200], text: "FlipOutY", size:[130, 43]
  });
  button32.init ();

  var button33 = new vs.ui.Button ({
    position:[50, 380], text: "FadeInDown", size:[130, 43]
  });
  button33.init ();

  var button41 = new vs.ui.Button ({
    position:[50, 250], text: "FlipInUp", size:[130, 43]
  });
  button41.init ();

  var button42 = new vs.ui.Button ({
    position:[200, 250], text: "FlipOutUp", size:[130, 43]
  });
  button42.init ();

  var button43 = new vs.ui.Button ({
    position:[200, 360], text: "FadeOutDown", size:[130, 43]
  });
  button43.init ();

  var button51 = new vs.ui.Button ({
    position:[50, 310], text: "FadeInLeft", size:[130, 43]
  });
  button51.init ();

  var button52 = new vs.ui.Button ({
    position:[200, 310], text: "FadeOutLeft", size:[130, 43]
  });
  button52.init ();
  
  parent_view.appendChild (button1.view);
  parent_view.appendChild (button2.view);
  parent_view.appendChild (button3.view);
  parent_view.appendChild (button21.view);
  parent_view.appendChild (button22.view);
  parent_view.appendChild (button23.view);
  parent_view.appendChild (button31.view);
  parent_view.appendChild (button32.view);
  parent_view.appendChild (button33.view);
  parent_view.appendChild (button41.view);
  parent_view.appendChild (button42.view);
  parent_view.appendChild (button43.view);
  parent_view.appendChild (button51.view);
  parent_view.appendChild (button52.view);
  
  function runAnim () {
    vs.ext.fx.Animation.Bounce.process (button1);
    vs.ext.fx.Animation.Shake.process (button2);
    vs.ext.fx.Animation.Swing.process (button3);
    vs.ext.fx.Animation.Pulse.process (button21);
    vs.ext.fx.Animation.FlipInX.process (button22);
    vs.ext.fx.Animation.FlipOutX.process (button23);
  
    vs.ext.fx.Animation.FlipInY.process (button31);
    vs.ext.fx.Animation.FlipOutY.process (button32);
  
    vs.ext.fx.Animation.FadeInUp.process (button41);
    vs.ext.fx.Animation.FadeOutUp.process (button42);
  
    vs.ext.fx.Animation.FadeInDown.process (button33);
    vs.ext.fx.Animation.FadeOutDown.process (button43);
  
    vs.ext.fx.Animation.FadeInLeft.process (button51);
    vs.ext.fx.Animation.FadeOutLeft.process (button52);
  }
  setInterval (runAnim, 1500);
  runAnim ();
}
