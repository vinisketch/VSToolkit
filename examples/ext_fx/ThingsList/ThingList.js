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
 
var ThingList = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,
  
  settings_open: false,

  applicationStarted : function (event) {
    this.buildNavBar ();
    
    this.config_panel = new ConfigPanel ().init ();
    this.add (this.config_panel);
    this.config_panel.hide ();
    
    this.buildList ();;
  },
  
  openSettings: function () {    
    if (this.settings_open) {
      this.show_list_anim.start ();
      this.config_panel.hide ();
    }
    else {
      this.hide_list_anim.start ();
      this.config_panel.show ();
    }    
    this.settings_open = !this.settings_open;
  },
  
  buildNavBar : function () {
    this.nav_bar = new vs.ui.NavigationBar ({
      style: 'black'
    }).init ();
    this.add (this.nav_bar);
    
    var title = new vs.ui.TextLabel ({
      template: '<div class="title"></div>',
      text: 'ThingList'
    }).init ();
    this.nav_bar.add (title);

    var button = new vs.ui.Button ({
      template: '<span class="settings"></span>'
    }).init ();
    this.nav_bar.add (button);
    
    button.bind ('select', this, this.openSettings);
  },
  
  buildList : function () {
    this.list_view = new vs.ui.List ({
      hasArrow: true
    }).init ();
    this.add (this.list_view);
    this.list_view.addClassName ('thethinglist');
    
    this.list_view.model = [
      {title: 'Pasquale'},
      {title: 'Blackbird Bar'},
      {title: 'The Shape of Design'},
      {title: 'Pasquale'},
      {title: 'Blackbird Bar'},
      {title: 'The Shape of Design'},
      {title: 'Pasquale'},
      {title: 'Blackbird Bar'},
      {title: 'The Shape of Design'},
      {title: 'Pasquale'},
      {title: 'Blackbird Bar'},
      {title: 'The Shape of Design'}
    ];
    
    var size = this.size;

    // Hide list animation
    this.hide_list_anim = vs.ext.fx.animateTransition (this.list_view, 'translation', {
      duration: 300,
      pace: vs.ext.fx.Pace.getEaseInPace (),
      trajectory: new vs.ext.fx.Vector2D ({ values: [[0,0], [0, size[1]]] }).init ()
    });

    // Show list animation
    this.show_list_anim = vs.ext.fx.animateTransition (this.list_view, 'translation', {
      duration: 300,
      pace: vs.ext.fx.Pace.getEaseInPace (),
      trajectory: new vs.ext.fx.Vector2D ({ values: [[0, size[1]], [0,0]] }).init ()
    });
  }
});

function loadApplication () {
  new ThingList ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}