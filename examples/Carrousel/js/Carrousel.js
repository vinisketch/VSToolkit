var CarrouselBook = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,
  
  applicationStarted : function (event) {
    this.carrouselView = new CarrouselView ().init ();
    this.add (this.carrouselView);
  }
});

function loadApplication ()
{
  new CarrouselBook ({id:"carrouselBook"}).init ();

  vs.ui.Application.start ();
}
