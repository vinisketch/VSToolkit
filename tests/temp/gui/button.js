function launchTest (parent_view)
{
  var button1 = new vs.ui.Button ({
    position:[50, 50], text: "hello", size:[130, 43]
  });
  button1.init ();

  var button2 = new vs.ui.Button ({
    position:[200, 50], text: "hello", size:[130, 43],
    style: vs.ui.Button.GREEN_STYLE
  });
  button2.init ();

  var button3 = new vs.ui.Button ({
    position:[50, 110], text: "hello", size:[130, 43],
    style: vs.ui.Button.GREY_STYLE
  });
  button3.init ();

  var button4 = new vs.ui.Button ({
    position:[200, 110], text: "hello", size:[130, 43],
    style: vs.ui.Button.RED_STYLE
  });
  button4.init ();

  var button5 = new vs.ui.Button ({
    position:[50, 170], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_TYPE
  });
  button5.init ();

  var button6 = new vs.ui.Button ({
    position:[50, 220], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_BACK_TYPE
  });
  button6.init ();

  var button7 = new vs.ui.Button ({
    position:[50, 270], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_FORWARD_TYPE
  });
  button7.init ();

  var button8 = new vs.ui.Button ({
    position:[150, 170], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_TYPE,
    style: vs.ui.Button.BLACK_STYLE
  });
  button8.init ();

  var button9 = new vs.ui.Button ({
    position:[150, 220], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_BACK_TYPE,
    style: vs.ui.Button.BLACK_STYLE
  });
  button9.init ();

  var button10 = new vs.ui.Button ({
    position:[150, 270], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
    style: vs.ui.Button.BLACK_STYLE
  });
  button10.init ();

  var button11 = new vs.ui.Button ({
    position:[250, 170], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_TYPE,
    style: vs.ui.Button.SILVER_STYLE
  });
  button11.init ();

  var button12 = new vs.ui.Button ({
    position:[250, 220], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_BACK_TYPE,
    style: vs.ui.Button.SILVER_STYLE
  });
  button12.init ();

  var button13 = new vs.ui.Button ({
    position:[250, 270], text: "hello", size:[70, 30],
    type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
    style: vs.ui.Button.SILVER_STYLE
  });
  button13.init ();

  parent_view.appendChild (button1.view);
  parent_view.appendChild (button2.view);
  parent_view.appendChild (button3.view);
  parent_view.appendChild (button4.view);
  parent_view.appendChild (button5.view);
  parent_view.appendChild (button6.view);
  parent_view.appendChild (button7.view);
  parent_view.appendChild (button8.view);
  parent_view.appendChild (button9.view);
  parent_view.appendChild (button10.view);
  parent_view.appendChild (button11.view);
  parent_view.appendChild (button12.view);
  parent_view.appendChild (button13.view);
}
