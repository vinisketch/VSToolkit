function initAnimations () {
  var view = buildPanel ();
  
  var animations = [
    'Bounce', 'Shake', 'Swing', 'Pulse', 'FlipInX', 'FlipOutX',
    'FlipInY', 'FlipOutY', 'FadeInDown', 'FadeOutDown','FadeInUp',
    'FadeOutUp', 'FadeInLeft', 'FadeOutLeft'
  ];

  var viewToAnimate = new vs.ui.View ({id: 'view_to_animate'}).init ();
  view.add (viewToAnimate);
  viewToAnimate.translate (-50, 0);
  
  var buttons = new vs.ui.View ({
    id: 'buttons',
    layout : vs.ui.View.FLOW_LAYOUT
  }).init ();
  view.add (buttons);
  
  for (var i = 0; i < animations.length; i++) {
    var anim_name = animations [i];
    var button = new vs.ui.Button ({text:anim_name, type:vs.ui.Button.NAVIGATION_TYPE}).init ();
    buttons.add (button);
    
    button.bind ('select', this, (function (anim) {
      return function () { anim.process (viewToAnimate); };
    } (vs.ext.fx.Animation [anim_name])));
  }

  return view;
}

