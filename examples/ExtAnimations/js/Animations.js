var Animations = vs.core.createClass ({

  parent: vs.ui.Application,

  animations : [
    {text: 'Bounce', anim: vs.ext.fx.Animation.Bounce},
    {text: 'Shake', anim: vs.ext.fx.Animation.Shake},
    {text: 'Swing', anim: vs.ext.fx.Animation.Swing},
    {text: 'Pulse', anim: vs.ext.fx.Animation.Pulse},
    {text: 'FlipInX', anim: vs.ext.fx.Animation.FlipInX},
    {text: 'FlipOutX', anim: vs.ext.fx.Animation.FlipOutX},
    {text: 'FlipInY', anim: vs.ext.fx.Animation.FlipInY},
    {text: 'FlipOutY', anim: vs.ext.fx.Animation.FlipOutY},
    {text: 'FadeInDown', anim: vs.ext.fx.Animation.FadeInDown},
    {text: 'FadeOutDown', anim: vs.ext.fx.Animation.FadeOutDown},
    {text: 'FadeInUp', anim: vs.ext.fx.Animation.FadeInUp},
    {text: 'FadeOutUp', anim: vs.ext.fx.Animation.FadeOutUp},
    {text: 'FadeInLeft', anim: vs.ext.fx.Animation.FadeInLeft},
    {text: 'FadeOutLeft', anim: vs.ext.fx.Animation.FadeOutLeft}
  ],

  applicationStarted : function (event)
  {
    var viewToAnimate = new vs.ui.View ({id: 'view_to_animate'}).init ();
    this.add (viewToAnimate);
    
    for (var i = 0; i < this.animations.length; i++)
    {
      var data = this.animations [i];
      var button = new vs.ui.Button ({text:data.text, type:vs.ui.Button.NAVIGATION_TYPE}).init ();
      this.add (button, 'buttons');
      
      button.bind ('select', this, (function (anim)
      {
        return function () { anim.process (viewToAnimate); };
      }(data.anim)));
    }
  }
});

function loadApplication ()
{
  new Animations ({id:"animations"}).init ();

  vs.ui.Application.start ();
}
