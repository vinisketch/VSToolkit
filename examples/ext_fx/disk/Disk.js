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
 */

var Animations = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event) {
  
    // generate random trajectory
    function generateTrajectory () {
      //[0, 190, 70, -45, -125, -60, 0, 45, 0]
      var values = [], i = 0;
      values.push (0);
      for (; i < 5; i++) {
        values.push (Math.floor (Math.random () * 360 - 180));
      }
      values.push (0);
      return new vs.ext.fx.Vector1D ({values: values}).init ();
    }

    function createAnime (id) {
    
      var item = new vs.ui.View ({id: id}).init ();
      var dur = 3000 + Math.ceil (Math.random () * 3000);
      
      var anim = vs.ext.fx.animateTransition (item, 'rotation', {
        duration: dur,
        pace: vs.ext.fx.Pace.getEaseInOutPace (),
        repeat: 5,
        trajectory: generateTrajectory ()
      });

      return anim;
    }
    
//    var anim = vs.seq (
    var anim = vs.par (
      createAnime ("disk0"),
      createAnime ("disk1"),
      createAnime ("disk2")
    );
    anim.start ();
    
    // click or tap to pause/restart the animation
    this.bind (vs.core.POINTER_START, this, function () {
      switch (anim.state) {
        case vs.core.Task.STARTED:
          anim.pause ();
        break;
        
        case vs.core.Task.PAUSED:
        case vs.core.Task.STOPPED:
          anim.start ();
        break;
        
      }
    });
  },
});

function loadApplication () {
  new Animations ({id:"disks", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}
