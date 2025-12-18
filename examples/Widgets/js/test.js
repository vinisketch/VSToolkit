var Scroll = vs_core.createClass ({

  parent: vs_ui.Application,
  
   applicationStarted : function (event) {
    var view = this;
    view.layout = vs_ui.View.VERTICAL_LAYOUT;
    view.setStyle ('padding', '20px');

    var viewToAnimate = new vs_ui.View ({id: 'view_to_transform'}).init ();
    view.add (viewToAnimate);
    viewToAnimate.translate (-50, 0);

    view.add (new vs_ui.TextLabel ({text:'Rotation:'}).init ());

    var slider = new vs_ui.Slider ({
      size:[280, 10],
      range: [0, 360]
    }).init ();
    view.add (slider);
    slider.setStyle ('margin-bottom', '50px');

    slider.bind ('continuous_change', this, function (e) {viewToAnimate.rotation = e.data;});

    view.add (new vs_ui.TextLabel ({text:'Scale:'}).init ());

    var slider = new vs_ui.Slider ({
      size:[280, 10],
      value: 1,
      range: [0, 3]
    }).init ();
    view.add (slider);

    slider.bind ('continuous_change', this, function (e) {viewToAnimate.scaling = e.data;});
  }
});

function loadApplication () {
  new Scroll ({id:"widgets"}).init ();

  vs_ui.Application.start ();
}
