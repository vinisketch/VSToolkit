var Scroll = vs.core.createClass ({

  parent: vs.ui.Application,
  
   applicationStarted : function (event) {
    this.splitView = new vs.ui.SplitView ({
//      secondPanelPosition: vs.ui.SplitView.RIGHT
    }).init ();
    this.navView = new vs.ui.View ().init ();
    this.mainView = new vs.ui.View ().init ();
    this.add (this.splitView);
    this.splitView.add (this.navView, 'second_panel');
    this.splitView.add (this.mainView, 'main_panel');
    
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    
    this.panelsIndexes = [];
    
    this.setupSplitViewMode ();
    this.setupNavigation ();
    this.setupWidgetsPanels ();
  },
  
  setupNavigation : function (event) {
    this.navBar = new vs.ui.NavigationBar ().init ();
    this.navView.add (this.navBar);
    this.navView.layout = vs.ui.View.ABSOLUTE_LAYOUT;

    this.leftController = new vs.fx.NavigationController (this.navView, this.navBar);
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
  },
  
  orientationWillChange : function ()
  {
    console.log ('orientationWillChange');
  },

  setupSplitViewMode : function ()
  {
    this.backButton = new vs.ui.Button ({
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      text: "Back",
      position: [8, 6]
    }).init ();
    
    this.splitView.hideMainPanelButton = this.backButton;
   
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
  
  setupWidgetsPanels : function (event) {
    var navBar = new vs.ui.NavigationBar ().init ();
    this.mainView.add (navBar);

    
    navBar.add (this.backButton);
    navBar.add (this.menuButton);
  },
  
  notify : function (e) {
    var self = this;
    
    if (e.type == 'itemselect' && e.src == this.mainList) {
      this.splitView.showMainView ();
    }
  }
});

function loadApplication () {
  new Scroll ({id:"widgets"}).init ();

  vs.ui.Application.start ();
}
