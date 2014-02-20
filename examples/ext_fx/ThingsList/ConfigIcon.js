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
 
var ConfigIcon = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  template:
"<div class=\"icon\"> \
  <div class=\"img ${type}\"></div> \
  <p class=\"title\">${name}</p> \
</div>",
  
  initComponent: function () {
    this._super ();
    
    this.img = new vs.ui.View ({
      node: this.view.querySelector ('div'),
      minScale: 0,
      scaling: 0,
    }).init ();
    
    this.title = new vs.ui.View ({
      node: this.view.querySelector ('.title'),
      minScale: 0,
      scaling: 0
    }).init ();
  }
});
