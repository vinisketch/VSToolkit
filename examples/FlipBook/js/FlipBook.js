var FlipBook = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,
  
  applicationStarted : function (event) {
    this.flipView = new FlipView ().init ();
    this.add (this.flipView);
  }
});

function loadApplication ()
{
  new FlipBook ({id:"flipBook"}).init ();

  vs.ui.Application.start ();
}
