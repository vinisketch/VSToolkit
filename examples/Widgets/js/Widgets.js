var Widgets = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.splitView = new vs.ui.SplitView ({
      mode: vs.ui.SplitView.TABLET_MODE
    }).init ();
    this.leftView = new vs.ui.View ().init ();
    this.rightView = new vs.ui.View ().init ();
    this.add (this.splitView);
    this.splitView.add (this.leftView, 'left_panel');
    this.splitView.add (this.rightView, 'main_panel');
    
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    
    this.panelsIndexes = [];
    
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
      hasArrow: true
    }).init ();
    this.mainList.setStyle ('bottom', '0px');
    var mainState = this.leftController.push (this.mainList);
    this.leftController.configureNavigationBarState (this.mainList.id, []);
    this.leftController.initialComponent = this.mainList.id;
 
    this.mainList.model = [
      {title: 'UI Components'},
      {title: 'Animation'},
      {title: 'Map'}
    ];
    
    this.mainList.bind ('itemselect', this);
    
    this.widgetList = new vs.ui.List ({position:[0, 44]}).init ();
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
      {title: 'Block List'}
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

    stateId = controller.push (initBlockList ());
    this.panelsIndexes.push ('Map');
  },
  
  notify : function (e) {
    var self = this;
    
    if (e.type == 'select' && e.src == this.backButton) {
      this.leftController.notify ({type: 'back'});
    }
    else if (e.type == 'itemselect' && e.src == this.mainList) {
      this.leftController.notify ({type: e.data.item.title});
    }
    else if (e.type == 'itemselect' && e.src == this.widgetList) {
      this.mainController.goToViewAt (
        this.panelsIndexes.indexOf (e.data.item.title), function () {
          self.splitView.showMainView ();
        }, false
      );     
    }
  }
});

function buildPanel () {
  var view = new vs.ui.View ({
    layout:vs.ui.View.ABSOLUTE_LAYOUT,
    position: [0, 44]  
  }).init ();
  view.addClassName ('panel');  
  return view;
};

function loadApplication () {
  new Widgets ({id:"widgets"}).init ();

  vs.ui.Application.start ();
}
