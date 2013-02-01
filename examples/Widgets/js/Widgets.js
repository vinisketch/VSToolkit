var Widgets = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.splitView = new vs.ui.SplitView ({
      mode: vs.ui.SplitView.TABLET_MODE
    }).init ();
    this.leftView = new vs.ui.View ().init ();
    this.rightView = new vs.ui.View ().init ();
    this.add (this.splitView);
    this.splitView.add (this.leftView, 'second_panel');
    this.splitView.add (this.rightView, 'main_panel');
    
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    
    this.panelsIndexes = [];
    
    this.setupSplitViewMode ();
    this.setupMainNavigation ();
    this.setupWidgetsPanels ();
    
    window.splitView = this.splitView;
  },
  
  setupMainNavigation : function (event) {
    this.navBar = new vs.ui.NavigationBar ().init ();
    this.leftView.add (this.navBar);
    this.leftView.layout = vs.ui.View.ABSOLUTE_LAYOUT;

    this.backButton = new vs.ui.Button ({
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      text: "Back",
      position: [8, 6]
    }).init ();
    this.backButton.bind ('select', this);
    this.navBar.add (this.backButton);
    var backId = this.backButton.id;
  
    this.leftController = new vs.fx.NavigationController (this.leftView, this.navBar);
    this.leftController.init ();

    this.mainList = new vs.ui.List ({
      position:[0, 44],
      hasArrow: true,
      scroll: true
    }).init ();
    this.mainList.setStyle ('bottom', '0px');
    var mainState = this.leftController.push (this.mainList);
    this.leftController.configureNavigationBarState (this.mainList.id, []);
    this.leftController.initialComponent = this.mainList.id;
 
    this.mainList.model = [
      {title: 'UI Components'},
      {title: 'Animations'},
      {title: 'Transformations'},
      {title: 'Pointer&Gesture'}
    ];
    
    this.mainList.bind ('itemselect', this);
    
    this.widgetList = new vs.ui.List ({
      position:[0, 44],
      scroll: true
    }).init ();
    this.widgetList.setStyle ('bottom', '0px');
    var id = this.leftController.push (this.widgetList);
    this.leftController.configureNavigationBarState (id, [{comp: backId}]);
    this.leftController.configureTransition (mainState, id, 'UI Components');
 
    this.widgetList.model = [
      {title: 'Button'},
      {title: 'Fields and Combobox'},
      {title: 'Pickers'},
      {title: 'Selectors'},
      {title: 'Progress&Slider'},
      {title: 'List'},
      {title: 'Tab List'},
      {title: 'Block List'},
      {title: 'Images'},
      {title: 'Map'}
    ];
    
    this.widgetList.bind ('itemselect', this);
  },
  
  setupWidgetsPanels : function (event) {
    var navBar = new vs.ui.NavigationBar ().init ();
    this.rightView.add (navBar);

    var controller = new vs.fx.SlideController (this.rightView);
    this.mainController = controller;
    controller.init ();
     
    var stateId = controller.push (initButtonsPanel ());
    this.panelsIndexes.push ('Button');

    controller.push (initFieldsPanel ());
    this.panelsIndexes.push ('Fields and Combobox');

    stateId = controller.push (initPickersPanel ());
    this.panelsIndexes.push ('Pickers');
    
    stateId = controller.push (initSelectorsPanel ());
    this.panelsIndexes.push ('Selectors');
    
    stateId = controller.push (initButtonsProgressSlider ());
    this.panelsIndexes.push ('Progress&Slider');
    
    stateId = controller.push (initStandardList ());
    this.panelsIndexes.push ('List'); 

    stateId = controller.push (initTabList ());
    this.panelsIndexes.push ('Tab List'); 

    stateId = controller.push (initBlockList ());
    this.panelsIndexes.push ('Block List'); 

    stateId = controller.push (initImages ());
    this.panelsIndexes.push ('Images');

    stateId = controller.push (initMapPanel ());
    this.panelsIndexes.push ('Map');

    stateId = controller.push (initAnimations ());
    this.panelsIndexes.push ('Animations');

    stateId = controller.push (initTransformations ());
    this.panelsIndexes.push ('Transformations');

    stateId = controller.push (initPointerGesture ());
    this.panelsIndexes.push ('Pointer&Gesture');

    navBar.add (this.mainBackButton);
    navBar.add (this.menuButton);
  },
  
  setupSplitViewMode : function ()
  {
    this.mainBackButton = new vs.ui.Button ({
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      text: "Back",
      position: [8, 6]
    }).init ();
    
    this.splitView.hideMainPanelButton = this.mainBackButton;
   
    this.menuButton = new vs.ui.Button ({
      type: vs.ui.Button.NAVIGATION_TYPE,
      text: "=",
      position: [8, 6]
    }).init ();
     
    this.splitView.showPopOverButton = this.menuButton;
  
    if (window.deviceConfiguration.screenSize === vs.core.DeviceConfiguration.SS_4_INCH)
      this.splitView.mode = vs.ui.SplitView.MOBILE_MODE;
    else
      this.splitView.mode = vs.ui.SplitView.TABLET_MODE;
  },

  notify : function (e) {
    var self = this;
    
    if (e.type == 'select' && e.src == this.backButton) {
      this.leftController.notify ({type: 'back'});
    }
    else if (e.type == 'itemselect' && e.src == this.mainList) {
      var msg = e.data.item.title;
      if (msg === "Animations" || msg === "Transformations" || msg === "Pointer&Gesture")
      {
        if (this.splitView.mode == vs.ui.SplitView.TABLET_MODE) {
          this.mainController.goToViewAt (this.panelsIndexes.indexOf (msg));
        }
        else {
          this.mainController.goToViewAt (this.panelsIndexes.indexOf (msg), null, true);
          this.splitView.showMainView ();
        }
      }
      else {
        this.leftController.notify ({type: msg});
        this.widgetList.refresh ();
      }
    }
    else if (e.type == 'itemselect' && e.src == this.widgetList) {
      if (this.splitView.mode == vs.ui.SplitView.TABLET_MODE) {
        this.mainController.goToViewAt (
          this.panelsIndexes.indexOf (e.data.item.title), null, false
        ); 
      }
      else {
        this.mainController.goToViewAt (
          this.panelsIndexes.indexOf (e.data.item.title), null, true
        ); 
        this.splitView.showMainView ();
      }    
    }
  }
});

function buildPanel (id) {
  var view = new vs.ui.View ({
    id: id,
    layout:vs.ui.View.ABSOLUTE_LAYOUT
  }).init ();
  view.addClassName ('panel');  
  return view;
};

function loadApplication () {
  new Widgets ({id:"widgets"}).init ();

  vs.ui.Application.start ();
}
