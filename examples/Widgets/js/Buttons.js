function initButtonsPanel () {
  var view = buildPanel();
  
  var button = new vs.ui.Button ({
    position:[20, 10], text: "hello"
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[170, 10], text: "hello",
    style: vs.ui.Button.GREEN_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[20, 70], text: "hello",
    style: vs.ui.Button.GREY_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[170, 70], text: "hello",
    style: vs.ui.Button.RED_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[20, 130], text: "hello",
    type: vs.ui.Button.NAVIGATION_TYPE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[20, 170], text: "Back",
    type: vs.ui.Button.NAVIGATION_BACK_TYPE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[20, 220], text: "Forward",
    type: vs.ui.Button.NAVIGATION_FORWARD_TYPE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[120, 130], text: "hello",
    type: vs.ui.Button.NAVIGATION_TYPE,
    style: vs.ui.Button.BLACK_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[120, 170], text: "Back",
    type: vs.ui.Button.NAVIGATION_BACK_TYPE,
    style: vs.ui.Button.BLACK_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[120, 220], text: "Forward",
    type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
    style: vs.ui.Button.BLACK_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[220, 130], text: "hello",
    type: vs.ui.Button.NAVIGATION_TYPE,
    style: vs.ui.Button.SILVER_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[220, 170], text: "Back",
    type: vs.ui.Button.NAVIGATION_BACK_TYPE,
    style: vs.ui.Button.SILVER_STYLE
  }).init ();
  view.add (button);

  button = new vs.ui.Button ({
    position:[220, 220], text: "Forward",
    type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
    style: vs.ui.Button.SILVER_STYLE
  }).init ();
  view.add (button);
  
  button = new vs.ui.SegmentedButton ({
    position:[20, 260], size:[150, 42],
    isToggleButtons: false,
    items: ['1', '2', '3']
  }).init ();
  view.add (button);
  
  button = new vs.ui.SegmentedButton ({
    position:[200, 260], size:[150, 42],
    items: ['1', '2', '3'],
    selectedIndex : 0
  }).init ();
  view.add (button);
  
  button = new vs.ui.SegmentedButton ({
    position:[20, 310], size:[150, 28],
    isToggleButtons: false,
    type: vs.ui.SegmentedButton.BAR_TYPE,
    items: ['1', '2', '3']
  }).init ();
  view.add (button);
  
  button = new vs.ui.SegmentedButton ({
    position:[200, 310], size:[150, 28],
    type: vs.ui.SegmentedButton.BAR_TYPE,
    items: ['1', '2', '3'],
    selectedIndex : 0
  }).init ();
  view.add (button);
  
  button = new vs.ui.SegmentedButton ({
    position:[20, 340], size:[50, 130],
    items: ['1', '2', '3'],
    isToggleButtons: false,
    orientation: vs.ui.SegmentedButton.VERTICAL
  }).init ();
  view.add (button);

  button = new vs.ui.SegmentedButton ({
    position:[80, 340], size:[30, 80],
    items: ['1', '2', '3'],
    isToggleButtons: false,
    type: vs.ui.SegmentedButton.BAR_TYPE,
    orientation: vs.ui.SegmentedButton.VERTICAL
  }).init ();
  view.add (button);

  button = new vs.ui.SegmentedButton ({
    position:[150, 340], size:[50, 130],
    items: ['1', '2', '3'],
    selectedIndex : 0,
    orientation: vs.ui.SegmentedButton.VERTICAL
  }).init ();
  view.add (button);

  button = new vs.ui.SegmentedButton ({
    position:[210, 340], size:[30, 80],
    items: ['1', '2', '3'],
    selectedIndex : 0,
    type: vs.ui.SegmentedButton.BAR_TYPE,
    orientation: vs.ui.SegmentedButton.VERTICAL
  }).init ();
  view.add (button);

 return view;
}
