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
 

var ListItem = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.AbstractListItem,
  
  template: "<li><p>${title}</p><p>${info}</p></li>",
  
  initComponent: function () {
    this._super ();
    
    var size = this.size;

    this.open_animation = vs.ext.fx.createTransition (this, 'size', {
      duration: 300,
      pace: vs.ext.fx.Pace.getEaseInPace (),
      trajectory: new vs.ext.fx.Vector2D ().init ()
    });
    
    this.open_animation.delegate = this;

    this.close_animation = vs.ext.fx.createTransition (this, 'size', {
      duration: 300,
      pace: vs.ext.fx.Pace.getEaseInPace (),
      trajectory: new vs.ext.fx.Vector2D ().init ()
    });
  },
  
  _updateAnimHeight : function () {
    var 
      p = this.view.children.item (1),
      maxHeight = 150,
      width = this.view.offsetWidth;
      
    if (p) {
      maxHeight = p.offsetHeight + 40;
    }
    
    // Update animation's trajectories
    this.open_animation.trajectory.values = [[width, 40], [width, maxHeight]];
    this.close_animation.trajectory.values = [[width, maxHeight], [width, 40]];
  },
  
  didSelect: function () {
    // close the previous item
    if (ListItem.previousSelected) {
      ListItem.previousSelected.close_animation.start ();
      ListItem.previousSelected.removeClassName ('selected');
    }
    
    if (ListItem.previousSelected == this) {
      ListItem.previousSelected = null;
      var list = this.__parent;
      vs.scheduleAction (function () { list.refresh (); }, 400);
      return;
    }
    
    // open the item
    this._updateAnimHeight ();
    this.open_animation.start ();
    ListItem.previousSelected = this;
    this.addClassName ('selected');
  },
  
  taskDidEnd : function () {
    console.log ("taskDidEnd");
    this.__parent.refresh ();
  }
});

ListItem.previousSelected = null;