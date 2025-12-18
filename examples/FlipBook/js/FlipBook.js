var FlipBook = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,
  
  applicationStarted : function (event) {
    this.flipView = new FlipView ().init ();
    this.add (this.flipView);
  }
});

function loadApplication ()
{
  new FlipBook ({id:"flipBook"}).init ();

  vs_ui.Application.start ();
}
