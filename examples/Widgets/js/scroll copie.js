var Scroll = vs_core.createClass ({

  parent: vs_ui.Application,

  applicationStarted : function (event) {
    this.layout = vs_ui.View.ABSOLUTE_LAYOUT;
    
    var scrollView = new vs_ui.ScrollView ({
      size : [300, 300],
      position: [0, 0],
      scroll: vs_ui.ScrollView.NO_SCROLL,
      layout : vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
    this.add (scrollView);

    var image = new vs_ui.ImageView ({
      position: [0, 0],
      size : [3008, 2000],
      src: "http://z.about.com/d/cameras/1/0/u/1/bigcat.JPG"
    }).init ();
    scrollView.add (image);
    
    window.s = scrollView;
    
    setTimeout (function () {
      scrollView.refresh ();
    }, 100);

    scrollView = new vs_ui.ScrollView ({
      size : [300, 300],
      position: [300, 00],
      scroll: vs_ui.ScrollView.HORIZONTAL_SCROLL,
      layout : vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
    this.add (scrollView);

    var image = new vs_ui.ImageView ({
      position: [0, 0],
      size : [3008, 2000],
      src: "http://z.about.com/d/cameras/1/0/u/1/bigcat.JPG"
    }).init ();
    scrollView.add (image);
    scrollView.refresh ();

    scrollView = new vs_ui.ScrollView ({
      size : [300, 300],
      position: [0, 300],
      scroll: vs_ui.ScrollView.VERTICAL_SCROLL,
      layout : vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
    this.add (scrollView);

    var image = new vs_ui.ImageView ({
      position: [0, 0],
      size : [3008, 2000],
      src: "http://z.about.com/d/cameras/1/0/u/1/bigcat.JPG"
    }).init ();
    scrollView.add (image);
    scrollView.refresh ();

    scrollView = new vs_ui.ScrollView ({
      size : [300, 300],
      position: [300, 300],
      scroll: vs_ui.ScrollView.SCROLL,
      layout : vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
    this.add (scrollView);

    var image = new vs_ui.ImageView ({
      position: [0, 0],
      size : [3008, 2000],
      src: "http://z.about.com/d/cameras/1/0/u/1/bigcat.JPG"
    }).init ();
    scrollView.add (image);
    scrollView.refresh ();





    scrollView = new vs_ui.ScrollView ({
      size : [300, 300],
      position: [600, 0],
      pinch : vs_ui.ScrollView.ROTATION_AND_SCALE,
      layout : vs_ui.View.ABSOLUTE_LAYOUT
    }).init ();
    this.add (scrollView);

    button = new vs_ui.Button ({
      position:[120, 130], text: "hello",
      type: vs_ui.Button.NAVIGATION_TYPE,
      style: vs_ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

    button = new vs_ui.Button ({
      position:[120, 170], text: "Back",
      type: vs_ui.Button.NAVIGATION_BACK_TYPE,
      style: vs_ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

    button = new vs_ui.Button ({
      position:[120, 220], text: "Forward",
      type: vs_ui.Button.NAVIGATION_FORWARD_TYPE,
      style: vs_ui.Button.BLACK_STYLE
    }).init ();
    scrollView.add (button);

  },
  
   
  notify : function (e) {
    var self = this;
  }
});

function loadApplication () {
  new Scroll ({id:"widgets"}).init ();

  vs_ui.Application.start ();
}
