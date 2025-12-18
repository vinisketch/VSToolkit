var BookReader = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,
  
  applicationStarted : function (event)
  {
    this.controller = new PageFlipController (this);
    this.controller.init ();
    
    this.controller.renderingModel = PageFlipAnimation.FLIP_VERTICAL;
    this.controller.setPageSize (800, 700);
    this.controller.isTactile = true;
    
    var pages = this.view.querySelectorAll (".page");
    for (var i = 0; i < pages.length; i++)
    {
      var view = new vs_ui.View ({node: pages [i]}).init ();
      this.add (view);
      this.controller.push (view);
      
//      if (!i) this.controller.initialComponent = view.id;
    }
    
//    this.controller.goToNextView ();
  },
  
});

function loadApplication ()
{
  window.app = new BookReader ({id:"bookreader"}).init ();

  vs_ui.Application.start ();
}
