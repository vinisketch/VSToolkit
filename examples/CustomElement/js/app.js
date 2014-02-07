

function loadApplication () {

  document.body.appendChild (document.createElement ("vs-switch"));
  
  vs._default_df_.connect ("slider1", "value", "label_slider1", "text");
  vs._default_df_.build ();
}

function testEventRadio (event) {
  console.log (event);
}

function testEventButton (event) {
  console.log (event);
}

function testEventSwitch (event) {
  console.log (event.data);
}