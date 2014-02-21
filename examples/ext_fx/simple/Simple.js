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

var Simple = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event) {
  
    var chrono = new vs.ext.fx.Chronometer ().init ();
    var traj = new vs.ext.fx.Vector2D ({values: [[100, 100], [215, 50]]}).init ();
    var view = new vs.ui.View ({id: "my_view"}).init ();   
    
    // connect your component within the default dataflow
    chrono.connect ("tick").to (traj, "tick")
      .connect ("out").to (view, "size");

    // build the default dataflow
    this.buildDataflow ();
    
    // start the animation
    chrono.start ();
  }
});

function loadApplication () {
  new Simple ({id:"simple", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}
