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

var List = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,
  
  settings_open: false,

  applicationStarted : function (event) {
    this.buildList ();
    
    window.app = this;
  },
      
  buildList : function () {
    this.list_view = new vs.ui.List ().init ();
    this.add (this.list_view);
    
    this.list_view.addClassName ('thelist');
    this.list_view.setItemTemplate (ListItem);
    
    this.list_view.model = [
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
  }
});

function loadApplication () {
  new List ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();
  vs.ui.Application.start ();
}