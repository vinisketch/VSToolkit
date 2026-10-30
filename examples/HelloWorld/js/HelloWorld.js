var HelloWorld = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,

  applicationStarted : function (event)
  {
    var hello = new vs_ui.TextLabel ({id:'hello', text:'Hello World'});
    hello.init ();
    this.add (hello);

    var animation = new vs_ui.Animation (['rotate', '720deg'], ['scale', '1']);
    animation.origin = [50, 50];
    animation.duration = '2s';
    animation.timing = vs_ui.Animation.EASE;
    animation.addKeyFrame (0, ['0deg', 0]);
    
    animation.process (hello);
  }
});

function loadApplication ()
{
  new HelloWorld ({id:"helloworld", layout:vs_ui.View.ABSOLUTE_LAYOUT}).init ();

  vs_ui.Application.start ();
}
