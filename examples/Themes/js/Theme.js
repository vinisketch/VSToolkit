var Widgets = vs_core.createClass ({

  parent: vs_ui.Application,

  applicationStarted : function (event) {
  
    initNavBar (this);
    initInput (this);
    initSwitch (this);
    initSelector (this);
    initSliderProgress (this);
  }
});

var app;
function loadApplication () {
  app = new Widgets ({id:"theme"}).init ();

  vs_ui.Application.start ();
}

function initNavBar (app) {

  var navBar = new vs_ui.NavigationBar ().init ();
  app.add (navBar);

  this.label = new vs_ui.TextLabel ({
    text: "Themes demo",
    magnet: 5
  }).init ();
  navBar.add (label);
}

function initInput (app) {

  var view = new vs_ui.View ({
    id: "first_view",
    layout: "vertical"
  }).init ();
  app.add (view);

  var combo = new vs_ui.ComboBox ({
    data: ['value 1', 'value 2', 'value 3', 'value 4'],
    size: [150, 43]
  }).init ();
  view.add (combo);

  var area = new vs_ui.TextArea ({
  }).init ();
  view.add (area);

  var textField = new vs_ui.InputField ({
    type: vs_ui.InputField.TEXT
  }).init ();
  view.add (textField);

  var searchField = new vs_ui.InputField ({
    type: vs_ui.InputField.SEARCH
  }).init ();
  view.add (searchField);
}

function initSwitch (app) {

  var viewBis = new vs_ui.View ({
    id: "second_view",
    layout: "horizontal"
  }).init ();
  app.add (viewBis);

  var switch1 = new vs_ui.Switch ().init ();
  viewBis.add (switch1);

  var switch2 = new vs_ui.Switch ({
    textOn : 'ON',
    textOff : 'OFF',
    size: [80, 28]
  }).init ();
  viewBis.add (switch2);

  var switch3 = new vs_ui.Switch ({
    textOn : 'I',
    textOff : 'O',
    size: [50, 28]
  }).init ();
  viewBis.add (switch3);
}


function initSelector (app) {

  var radio = new vs_ui.RadioButton ({
    data: ['value 1', 'value 2']
  }).init ();
  app.add (radio);

  var check = new vs_ui.CheckBox ({
    data: ['value 1', 'value 2']
  }).init ();
  app.add (check);
}


function initSliderProgress (app) {

  var slider = new vs_ui.Slider ({size:[290, 10]}).init ();
  app.add (slider);
  slider.setStyle ("margin", "15px");


  var progress = new vs_ui.ProgressBar ().init ();
  app.add (progress);

  progress.setStyle ("margin", "15px");
  
  container.get(DEFAULT_DATAFLOW).connect (slider, "value", progress, "index");
  container.get(DEFAULT_DATAFLOW).build ();
}

var previous;
function setTheme (name) {
  if (previous) {
    previous.parentElement.removeChild (previous);
    previous = null;
  }
  previous = vs_utils.importFile (
    "../../lib/css/vs_ui_" + name + ".css",
    document,
    function () {
      app.refresh ();
    },
    "css"
  );
}

setTheme ("holo_light");

window.addEventListener("message", receiveMessage, false);
var message_reg = /changetheme#(\w+)/;

function receiveMessage (event)
{
  var message = event.data;
  var result = message_reg.exec (message);
  if (!result || result.length !== 2) return;
  
  setTheme (result[1]);
}