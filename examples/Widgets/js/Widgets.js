var Widgets = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.list = new vs.ui.List ({id: 'widgets_list'}).init ();
    this.add (this.list);
    this.list.model = [
      {title: 'Button'},
      {title: 'Progress&Slider'},
      {title: 'Tab list'}
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
    
    var panel = this.initTabList ();
    this.add (panel);
    panel.hide ();
    panel.bind ('close', this);
    this.panels ['Tab list'] = panel; 
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
    var view = new vs.ui.View ({layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
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
    
    button = new vs.ui.SegmentedButton ({
      position:[20, 320], size:[150, 42],
      isToggleButton: false,
      items: ['1', '2', '3']
    }).init ();
    view.add (button);
    
    button = new vs.ui.SegmentedButton ({
      position:[200, 320], size:[150, 42],
      items: ['1', '2', '3'],
      selectedIndex : 0
    }).init ();
    view.add (button);
    
    button = new vs.ui.SegmentedButton ({
      position:[20, 370], size:[150, 28],
      isToggleButton: false,
      type: vs.ui.SegmentedButton.BAR_TYPE,
      items: ['1', '2', '3']
    }).init ();
    view.add (button);
    
    button = new vs.ui.SegmentedButton ({
      position:[200, 370], size:[150, 28],
      type: vs.ui.SegmentedButton.BAR_TYPE,
      items: ['1', '2', '3'],
      selectedIndex : 0
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
  },
  
  initTabList : function () {
    var view = this.buildGenericPanel ();
    view.addClassName ('tab_list');

    var listItems = new vs.ui.List ({
      id: 'list_items',
      scroll: true,
      type: vs.ui.List.TAB_LIST
    });
    listItems.init ();
    view.add (listItems);
        
    // Set the data list items
    listItems.data = [
      'a',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'b',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'c',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      'd',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'e',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'f',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'g',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      'h',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      'i',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'j',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'k',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'l',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'm',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      'n',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'o',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'p',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'q',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      'r',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      's',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      't',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'u',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'v',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'w',
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      {title: 'Strange image', url: "resources/image1.jpeg"},
      'x',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'y',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
      'z',
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"},
    ];
    
    return view;
  }

});

function loadApplication () {
  new Widgets ({id:"widgets"}).init ();

  vs.ui.Application.start ();
}
