var CarrouselBook = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,
  
  applicationStarted : function (event) {
    this.carrouselView = new CarrouselView ().init ();
    this.add (this.carrouselView);
  }
});

function loadApplication ()
{
  new CarrouselBook ({id:"carrouselBook"}).init ();

  vs_ui.Application.start ();
}
