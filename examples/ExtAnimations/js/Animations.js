var Animations = vs_core.createClass ({

  parent: vs_ui.Application,

  animations : [
  'Bounce', 'Shake', 'Swing', 'Pulse', 'FlipInX', 'FlipOutX',
  'FlipInY', 'FlipOutY', 'FadeInDown', 'FadeOutDown','FadeInUp',
  'FadeOutUp', 'FadeInLeft', 'FadeOutLeft'
  ],

  applicationStarted : function (event) {
    var viewToAnimate = new vs_ui.View ({id: 'view_to_animate'}).init ();
    this.add (viewToAnimate);
    
    for (var i = 0; i < this.animations.length; i++) {
      var anim_name = this.animations [i];
      var button = new vs_ui.Button ({text:anim_name, type:vs_ui.Button.NAVIGATION_TYPE}).init ();
      this.add (button, 'buttons');
      
      button.bind ('select', this, (function (anim) {
        return function () { anim.process (viewToAnimate); };
      } (vs.ext.fx.Animation [anim_name])));
    }
  }
});

function loadApplication () {
  new Animations ({id:"animations"}).init ();

  vs_ui.Application.start ();
}
