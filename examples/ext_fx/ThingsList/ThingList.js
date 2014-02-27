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

var info_pasquale = "Pasquale is a masculine Italian given name and a surname found all over Italy. It is a cognate of the French name Pascal, the Spanish Pascual, the Portuguese Pascoal and the Catalan Pasqual. Pasquale derives from the Latin paschalis or pashalis, which means \"relating to Easter\", from Latin pascha (\"Easter\"), Greek Πάσχα, Aramaic pasḥā, in turn from the Hebrew פֶּסַח, which means \"to be born on, or to be associated with, Passover day\". Since the Hebrew holiday Passover coincides closely with the later Christian holiday of Easter, the Latin word came to be used for both occasions."
var info_bar = "Part of the new wave of more eclectic and sophisticated gay hangouts that have steadily been gaining in prevalence and popularity in the Castro, the dapper and convivial Blackbird Bar (2124 Market St., 415-503-0630) is along the hip Church Street corridor (right at the intersection with Market Street). ";
var info_design = "The Shape of Design is an odd little design book. Instead of talking about typography, grids, or logos, it focuses on storytelling, co-dependency, and craft. It tries to supplement the abundance of technical talk and how-to elsewhere by elevating why great work is done. "

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
    var nav_bar = new vs.ui.NavigationBar ({ style: 'black' }).init ();
    this.add (nav_bar);

    nav_bar.add (new vs.ui.TextLabel ({
      template: '<div class="title"></div>',
      text: 'ThingList'
    }).init ());

    var button = new vs.ui.Button ({
      template: '<span class="settings"></span>'
    }).init ();
    nav_bar.add (button);
    
    button.bind ('select', this, this.openSettings);
  },
  
  buildList : function () {
    var list_view = new vs.ui.List ({id: "thelist", scroll: true}).init ();
    this.add (list_view);
    
    list_view.setItemTemplate (ListItem);
    
    list_view.model = [
      {title: 'Pasquale', info: info_pasquale},
      {title: 'Blackbird Bar', info: info_bar},
      {title: 'The Shape of Design', info: info_design},
      {title: 'Pasquale', info: info_pasquale},
      {title: 'Blackbird Bar', info: info_bar},
      {title: 'The Shape of Design', info: info_design},
      {title: 'Pasquale', info: info_pasquale},
      {title: 'Blackbird Bar', info: info_bar},
      {title: 'The Shape of Design', info: info_design},
      {title: 'Pasquale', info: info_pasquale},
      {title: 'Blackbird Bar', info: info_bar},
      {title: 'The Shape of Design', info: info_design}
    ];
    
    var size = this.size;

    // Hide list animation
    this.hide_list_anim = vs.ext.fx.createTransition (list_view, 'translation', {
      duration: 300,
      pace: vs.ext.fx.Pace.getEaseInPace (),
      trajectory: new vs.ext.fx.Vector2D ({ values: [[0,0], [0, size[1]]] }).init ()
    });

    // Show list animation
    this.show_list_anim = vs.ext.fx.createTransition (list_view, 'translation', {
      duration: 300,
      pace: vs.ext.fx.Pace.getEaseInPace (),
      trajectory: new vs.ext.fx.Vector2D ({ values: [[0, size[1]], [0,0]] }).init ()
    });
  }
});

function loadApplication () {
  new ThingList ({id:"thinglist", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}