function BuildImageCanvas (name, image) {
  var view = new vs.ui.View ().init ();
  var label = new vs.ui.TextLabel ({text: name}).init ();
  
  view.add (label);
  view.add (image);
  
  return view;
};


function initImages () {
  var view = buildPanel('demos_images');
  view.layout = vs.ui.View.FLOW_LAYOUT;
  
  var image_url = 
    "http://graphics8.nytimes.com/images/2009/06/11/business/11basics.600.jpg";
  
  var image = new vs.ui.ImageView ({
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("Simple Image", image));

  var image = new vs.ui.ScrollImageView ({
    stretch: vs.ui.ScrollImageView.STRETCH_NONE,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_NONE", image));

  var image = new vs.ui.ScrollImageView ({
    stretch: vs.ui.ScrollImageView.STRETCH_FILL,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_FILL", image));

  var image = new vs.ui.ScrollImageView ({
    stretch: vs.ui.ScrollImageView.STRETCH_UNIFORM,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_UNIFORM", image));

  var image = new vs.ui.ScrollImageView ({
    stretch: vs.ui.ScrollImageView.STRETCH_UNIFORM_FILL,
    src: image_url
  }).init ();
  view.add (BuildImageCanvas ("ScrollImage: STRETCH_UNIFORM_FILL", image));

  return view;
}

