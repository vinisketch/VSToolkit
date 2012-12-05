var HelloWorld = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event)
  {
    var hello = new vs.ui.TextLabel ({id:'hello', text:'Hello World'});
    hello.init ();
    this.add (hello);

    var animation = new vs.fx.Animation (['rotate', '720deg'], ['scale', '1']);
    animation.duration = '2s';
    animation.timing = vs.fx.Animation.EASE;
    animation.addKeyFrame (0, ['0deg', 0]);
    
    animation.process (hello);
  }
});

function loadApplication ()
{
  new HelloWorld ({id:"helloworld", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}
