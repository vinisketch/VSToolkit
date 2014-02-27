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
  
  mode: 'tick', //"text"

  applicationStarted : function (event) {
    this.layout = "horizontal";
    
    this.area = new vs.ui.TextArea ().init ();
    this.add (this.area);

    this.label = new vs.ui.TextLabel ().init ();
    this.add (this.label);
    
    this.area.bind ("change", this, function () {
      this.label.text = this.area.value;
    });
        
    this.initAnimation ();
  },
  
  initAnimation : function ()
  {
    var options = {
      trajectory: new StringTrajectory ({model:this.mode}).init (),
      duration: 1000
    };
  
    vs.ext.fx.attachTransition (this.label, "text", options);
  }
});

function loadApplication () {
  new Animations ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}