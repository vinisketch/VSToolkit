var Widgets = vs.core.createClass ({

  parent: vs.ui.Application,

  applicationStarted : function (event) {
    this.layout = vs.ui.View.ABSOLUTE_LAYOUT;
    
    this.navBar = new vs.ui.NavigationBar ().init ();
    this.add (this.navBar);

    this.backButton = new vs.ui.Button ({
      type: vs.ui.Button.NAVIGATION_BACK_TYPE,
      text: "Back",
      position: [8, 6]
    }).init ();
    this.backButton.bind ('select', this);
    this.navBar.add (this.backButton);
    var backId = this.backButton.id;
  
    this.controller = new vs.fx.NavigationController (this, this.navBar);
    this.controller.init ();
 
    this.list = new vs.ui.List ({id: 'widgets_list'}).init ();
    var mainState = this.controller.push (this.list);
    
   //    this.controller.configureNavigationBarState (this.list.id, []);
    this.controller.initialComponent = this.list.id;
 
     this.list.model = [
      {title: 'Button'},
      {title: 'Fields and Combobox'},
      {title: 'Pickers'},
      {title: 'Selectors'},
      {title: 'Progress&Slider'},
      {title: 'List'},
      {title: 'Tab List'},
      {title: 'Block List'},
      {title: 'Map'}
    ];
    
    this.list.bind ('itemselect', this);
  
    var panel = initButtonsPanel ();
    var stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Button',vs.fx.NavigationController.CARD_ANIMATION);

    var panel = initFieldsPanel ();
    this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Fields and Combobox',vs.fx.NavigationController.CARD_ANIMATION);

    var panel = initPickersPanel ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Pickers');
    
    var panel = initSelectorsPanel ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Selectors');
    
    var panel = initButtonsProgressSlider ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Progress&Slider');
    
    var panel = initStandardList ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'List'); 

    var panel = initTabList ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Tab List'); 

    var panel = initBlockList ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Block List'); 

    var panel = initMapPanel ();
    stateId = this.controller.push (panel);
    this.controller.configureNavigationBarState (stateId, [{comp: backId}]);
    this.controller.configureTransition (mainState, stateId, 'Map'); 
  },
  
  notify : function (e) {
    if (e.type == 'select') {
      this.controller.notify ({type: 'back'});
    }
    else if (e.type == 'itemselect') {
      this.controller.notify ({type: e.data.item.title});
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
