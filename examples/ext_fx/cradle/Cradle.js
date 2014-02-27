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

var Boulier = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event) {
  
    this.ball1 = new vs.ui.View ({
      id:'ball1',
      transformOrigin : [25, -200]
    }).init ();

    this.ball2 = new vs.ui.View ({
      id:'ball4',
      transformOrigin : [25, -200]
    }).init ();

    function getPace () { return new vs.ext.fx.Pace ({
        timing: vs.ext.fx.generateCubicBezierFunction (.43,.75,.67,.22)
      }).init ();
    };

    this.anim1 = vs.ext.fx.createTransition (this.ball1, 'rotation', {
      duration: 600,
      pace: getPace (),
      trajectory: new vs.ext.fx.Vector1D ({ values: [0, 40, 0] }).init ()
    });
    
    this.anim2 = vs.ext.fx.createTransition (this.ball2, 'rotation', {
      duration: 600,
      pace: getPace (),
      trajectory: new vs.ext.fx.Vector1D ({ values: [0, -40, 0] }).init ()
    });
    
    var seq = window.anim = vs.seq (this.anim1, this.anim2);
    seq.delegate = { taskDidEnd: function () {seq.start ();} }
    seq.start ();
  },
});

function loadApplication () {
  new Boulier ({id:"cradle", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}

window.addEventListener ("message", receiveMessage, false);

function receiveMessage (event)
{
  var message = event.data;
  if (message == "start") window.anim.start ();
  else if (message == "pause") window.anim.pause ();
}