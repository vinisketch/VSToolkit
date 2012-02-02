var Animations = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function ()
  {
    this._super ();
    
    this.item1 = new vs.ui.TextLabel ({id: 'item1', text: '1'});
    this.item1.init ();
    this.add (this.item1);
    
    this.item2 = new vs.ui.TextLabel ({id: 'item2', text: '2'});
    this.item2.init ();
    this.add (this.item2);
    
    this.item3 = new vs.ui.TextLabel ({id: 'item3', text: '3'});
    this.item3.init ();
    this.add (this.item3);
    
    this.item4 = new vs.ui.TextLabel ({id: 'item4', text: '4'});
    this.item4.init ();
    this.add (this.item4);
    
    this.item5 = new vs.ui.TextLabel ({id: 'item5', text: '5'});
    this.item5.init ();
    this.add (this.item5);
    
    this.item6 = new vs.ui.TextLabel ({id: 'item6', text: '6'});
    this.item6.init ();
    this.add (this.item6);
    
    this.item7 = new vs.ui.TextLabel ({id: 'item7', text: '7'});
    this.item7.init ();
    this.add (this.item7);
    
    this.item8 = new vs.ui.TextLabel ({id: 'item8', text: '8'});
    this.item8.init ();
    this.add (this.item8);
    
    this.item9 = new vs.ui.TextLabel ({id: 'item9', text: '9'});
    this.item9.init ();
    this.add (this.item9);   
  },

  applicationStarted : function (event)
  {
    var translation = new vs.fx.TranslateAnimation (260, 0, 0);
    translation.duration = '3s';
    translation.timing = vs.fx.Animation.EASE;
    translation.process (this.item1);

    translation.timing = vs.fx.Animation.EASE_IN;
    this.item2.animate (translation); // other API to apply animation

    // other API to apply animation
    this.item3.animate (
      [['translate', '260px,0,0']], 
      {duration: '3s', timing : vs.fx.Animation.EASE_OUT}); 

    translation.timing = vs.fx.Animation.EASE_IN_OUT;
    translation.process (this.item4);
    
    translation.x = 130; // reconfigure some parameter
    translation.process (this.item5);
    
    // Rotation
    var rotation = new vs.fx.RotateAnimation (720);
    rotation.duration = '3s';
    rotation.timing = vs.fx.Animation.EASE;
    rotation.process (this.item6);
    
    // Generic animation on one property
    var animation = new vs.fx.Animation (['translate', '260px,0,0']);
    animation.duration = '3s';
    animation.timing = vs.fx.Animation.EASE;
    animation.process (this.item7);
    
    // Generic animation with multiple animated properties
    animation = new vs.fx.Animation (['translate', '260px,0,0'], ['rotate', '360deg'], ['background-color', 'violet']);
    animation.duration = '3s';
    animation.timing = vs.fx.Animation.EASE;
    animation.process (this.item8);
    
    // Complex animation
    animation = new vs.fx.Animation (['translateX','260px'],['translateY','0px'],['rotate', '0deg'],['opacity', '1'], ['scale', '1.5']);
    animation.duration = '3s';
    animation.origin = [50, 100];
    animation.timing = vs.fx.Animation.LINEAR;
    animation.addKeyFrame (0, ['0px', '0px', '0deg', 1, 1]);
    animation.addKeyFrame (50, ['130px', '50px', '90deg', 0.5, 0.7]);

    animation.process (this.item9);    
  }
});

function loadApplication ()
{
  new Animations ({id:"animations"}).init ();

  vs.ui.Application.start ();
}
