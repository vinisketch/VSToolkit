function BuildImageCanvas (name, image) {
  var view = new vs_ui.View ().init ();
  var label = new vs_ui.TextLabel ({text: name}).init ();
  
  view.add (label);
  view.add (image);
  
  return view;
};


function initImages () {
  var view = buildPanel('demos_images');
  view.layout = vs_ui.View.FLOW_LAYOUT;
  
  var image_url = 
    "http://graphics8.nytimes.com/images/2009/06/11/business/11basics.600.jpg";
  
  var image = new vs_ui.ImageView ({
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("Simple Image", image));

  var image = new vs_ui.ScrollImageView ({
    stretch: vs_ui.ScrollImageView.STRETCH_NONE,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_NONE", image));

  var image = new vs_ui.ScrollImageView ({
    stretch: vs_ui.ScrollImageView.STRETCH_FILL,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_FILL", image));

  var image = new vs_ui.ScrollImageView ({
    stretch: vs_ui.ScrollImageView.STRETCH_UNIFORM,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_UNIFORM", image));

  var image = new vs_ui.ScrollImageView ({
    stretch: vs_ui.ScrollImageView.STRETCH_UNIFORM_FILL,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_UNIFORM_FILL", image));

  return view;
}

