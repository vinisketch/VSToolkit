var Animations = vs.core.createClass ({

  parent: vs.ui.Application,

  animations : [
  'Bounce', 'Shake', 'Swing', 'Pulse', 'FlipInX', 'FlipOutX',
  'FlipInY', 'FlipOutY', 'FadeInDown', 'FadeOutDown','FadeInUp',
  'FadeOutUp', 'FadeInLeft', 'FadeOutLeft'
  ],

  applicationStarted : function (event) {
    var viewToAnimate = new vs.ui.View ({id: 'view_to_animate'}).init ();
    this.add (viewToAnimate);
    
    for (var i = 0; i < this.animations.length; i++) {
      var anim_name = this.animations [i];
      var button = new vs.ui.Button ({text:anim_name, type:vs.ui.Button.NAVIGATION_TYPE}).init ();
      this.add (button, 'buttons');
      
      button.bind ('select', this, (function (anim) {
        return function () { anim.process (viewToAnimate); };
      } (vs.ext.fx.Animation [anim_name])));
    }
  }
});

function loadApplication () {
  new Animations ({id:"animations"}).init ();

  vs.ui.Application.start ();
}
