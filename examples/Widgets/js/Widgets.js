var Widgets = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.list = new vs.ui.List ({id: 'widgets_list'}).init ();
    this.add (this.list);
    this.list.model = [
      {title: 'Button'},
      {title: 'Progress&Slider'}
    ];
    
    this.list.bind ('itemselect', this);
  
    this.panels = {};
    var panel = this.initButtonsPanel ();
    this.add (panel);
    panel.hide ();
    panel.bind ('close', this);
    this.panels.Button = panel;

    var panel = this.initButtonsProgressSlider ();
    this.add (panel);
    panel.hide ();
    panel.bind ('close', this);
    this.panels['Progress&Slider'] = panel;
  },
  
  notify : function (e) {
    if (e.type == 'close') {
      if (this.current_panel) {
        this.current_panel.hide ();
        this.current_panel = null;
      }
      this.list.show ();
    }
    else if (e.type == 'itemselect') {
      this.current_panel = this.panels [e.data.item.title];
      this.list.hide ();
      this.current_panel.show ();
    }
  },
  
  buildGenericPanel : function () {
    var view = new vs.ui.View ().init ();
    view.addClassName ('panel');
    view.notify = function () { 
      this.propagate ('close');
    };
    
    var button = new vs.ui.Button ({
      position:[10, 10], text: "✖", size:[30, 30]
    }).init ();
    button.addClassName ("close");
    view.add (button);
    button.bind ('select', view);
    
    return view;
  },
  
  initButtonsPanel : function () {
    var view = this.buildGenericPanel ();
    
    var button = new vs.ui.Button ({
      position:[20, 50], text: "hello", size:[130, 43]
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[170, 50], text: "hello", size:[130, 43],
      style: vs.ui.Button.GREEN_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[20, 110], text: "hello", size:[130, 43],
      style: vs.ui.Button.GREY_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[170, 110], text: "hello", size:[130, 43],
      style: vs.ui.Button.RED_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[20, 170], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_TYPE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[20, 220], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_BACK_TYPE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[20, 270], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_FORWARD_TYPE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[120, 170], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[120, 220], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[120, 270], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
      style: vs.ui.Button.BLACK_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[220, 170], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_TYPE,
      style: vs.ui.Button.SILVER_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[220, 220], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      style: vs.ui.Button.SILVER_STYLE
    }).init ();
    view.add (button);
  
    button = new vs.ui.Button ({
      position:[220, 270], text: "hello", size:[70, 30],
      type: vs.ui.Button.NAVIGATION_FORWARD_TYPE,
      style: vs.ui.Button.SILVER_STYLE
    }).init ();
    view.add (button);
    
    return view;
  },
  
  initButtonsProgressSlider: function () {
    var view = this.buildGenericPanel ();
    
    var progress1 =
      new vs.ui.ProgressBar ({position:[20, 50], size:[280, 10]}).init ();
  
    var progress2 =
      new vs.ui.ProgressBar ({position:[20, 80], size:[280, 10]}).init ();
    progress2.indeterminate = true;
  
    var progress3 =
      new vs.ui.ProgressBar ({position:[20, 110], size:[100, 10], 
      range: [50, 80]}).init ();
  
    view.add (progress1);
    view.add (progress2);
    view.add (progress3);
    
    var slider = new vs.ui.Slider ({position:[20, 150], size:[280, 10]}).init ();
    view.add (slider);

    slider.bind ('continuous_change', this, function (e) {progress1.index = e.data;});
  
    slider = new vs.ui.Slider ({position:[50, 200], size:[10, 100], 
      orientation:vs.ui.Slider.VERTICAL, range: [50, 60]}).init ();
    view.add (slider);
  
    slider.bind ('continuous_change', this, function (e) {progress3.index = e.data;});

    return view;
  }
});

function loadApplication () {
  new Widgets ({id:"widgets"}).init ();

  vs.ui.Application.start ();
}
