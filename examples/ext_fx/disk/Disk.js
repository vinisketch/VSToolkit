/**
 * Copyright (C) 2009-2013. David Thevenin, ViniSketch (c), and 
 * contributors. All rights reserved
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * This demo is based ond the Zanimo demo Circles: http://zanimo.us/
 * Credits @peutetre https://github.com/peutetre/Zanimo
 */

var DisksAnimation = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event) {
    window.app = this;
 
    this.disk0 = new vs.ui.View ({id: "disk0"}).init ();
    this.disk1 = new vs.ui.View ({id: "disk1"}).init ();
    this.disk2 = new vs.ui.View ({id: "disk2"}).init ();

    this.createSeqAnimation ();
    
    // click or tap to pause/restart the animation
    this.bind (vs.core.POINTER_START, this, function () {
      switch (this.anim.state) {
        case vs.core.Task.STARTED:
          this.anim.pause ();
        break;
        
        case vs.core.Task.PAUSED:
        case vs.core.Task.STOPPED:
          this.anim.start ();
        break;
      }
    });
  },

   createAnime : function (item, duration) {
  
    // generate random trajectory
    function generateTrajectory () {
      var values = [], i = 0;

      values = [0, 190, 70, -45, -125, -60, 0, 45, 0]
//       values.push (0);
//       for (; i < 5; i++) {
//         values.push (Math.floor (Math.random () * 360 - 180));
//       }
//       values.push (0);
      return new vs.ext.fx.Vector1D ({values: values}).init ();
    }

    var dur = duration + Math.ceil (Math.random () * duration);
    
    var anim = vs.ext.fx.createTransition (item, 'rotation', {
      duration: dur,
      pace: vs.ext.fx.Pace.getEaseInOutPace (),
      repeat: 1,
      trajectory: generateTrajectory ()
    });

    return anim;
  },
  
  deletePreviousAnim : function () {
    if (this.anim) {
      this.anim.stop ();
      vs.util.free (this.anim);
      this.anim = undefined;
    }
  },
  
  createParAnimation : function () {
    this.deletePreviousAnim ();
    
    this.anim = vs.par (
      this.createAnime (this.disk0, 6000),
      this.createAnime (this.disk1, 6000),
      this.createAnime (this.disk2, 6000)
    );
    
    this.anim.start ();
  },
  
  createSeqAnimation : function () {
    this.deletePreviousAnim ();
    
    this.anim = vs.seq (
      this.createAnime (this.disk0, 2000),
      this.createAnime (this.disk1, 2000),
      this.createAnime (this.disk2, 2000)
    );  
    
    this.anim.start ();
  }
});

function loadApplication () {
  new DisksAnimation ({id:"disks", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}

window.addEventListener ("message", receiveMessage, false);

function receiveMessage (event)
{
  var message = event.data;
  if (message == "start") window.app.anim.start ();
  else if (message == "pause") window.app.anim.pause ();
  else if (message == "seq_anim") window.app.createSeqAnimation ();
  else if (message == "par_anim") window.app.createParAnimation ();
}