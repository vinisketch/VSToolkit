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
 
var ConfigPanel = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  template:
'<div class="config_panel"> \
  <p class="title">Filter By:</p> \
  <div x-hag-hole="children"></div>\
</div>',

  initComponent: function () {
    this._super ();
        
    var items = [
      {type:'film', name: 'Film'}, {type:'book', name: 'Book'},
      {type:'music', name: 'Music'}, {type:'idea', name: 'Idea'},
      {type:'place', name: 'Place'}, {type:'product', name: 'Product'},
      {type:'bar', name: 'Bar'}, {type:'person', name: 'Person'},
      {type:'food', name: 'Food'}
    ], item_view, item;
    
    var x = 0; y = 0, cx = 0, cy = 0, icons = [];
    for (var i = 0; i < items.length; i++)
    {
      item = items[i];
      this [item.type + '_icon'] = item_view = new ConfigIcon (item).init ();
      this.add (item_view);
      
      x = (i % 3) * 100; cx += x;
      y = 20 + Math.floor (i/3) * 130; cy += y
      item_view.position = [x, y];
      icons.push (item_view);
    };
    
    this.cx = Math.ceil (cx / items.length);
    this.cy = Math.ceil (cy / items.length);
  },
  
  viewDidAdd: function () {
  
    var anims = [], anims_invert = [];
    var properties = ['translation', 'scaling'];
    
    // animations configuration
    for (var i = 0; i < icons.length; i++)
    {
      window.icon = icon = icons[i];
      var
        pos = icon.position,
        vector = [this.cx - pos [0], this.cy - pos [1]];
                
      icon.title.translation = vector;
       
      // show icon title animation
      anims.push (vs.ext.fx.animateTransitionBis (icon.title, properties, properties, {
        duration: 800,
        pace: vs.ext.fx.Pace.getEaseInPace (),
        trajectory: new AnimVector ({
          translations: [vector, [0, 0]],
          scalings: [0, 1]
        }).init ()
      }));

      // hide icon title animation
      anims_invert.push (vs.ext.fx.animateTransitionBis (icon.title, properties, properties, {
        duration: 600,
        pace: vs.ext.fx.Pace.getEaseInPace (),
        trajectory: new AnimVector ({
          translations: [[0, 0], vector],
          scalings: [1, 0]
        }).init ()
      }));

      var start = Math.floor (i/3) * 250;
      // show icon image animation
      anims.push (vs.ext.fx.createTransition (icon.img, 'scaling', {
        begin: start,
        duration: 300,
        pace: vs.ext.fx.Pace.getEaseInPace (),
        trajectory: new vs.ext.fx.Vector1D ({
          values: [0, 1]
        }).init ()
      }));
      
      // hide icon image animation
      anims_invert.push (vs.ext.fx.createTransition (icon.img, 'scaling', {
        begin: start,
        duration: 300,
        pace: vs.ext.fx.Pace.getEaseInPace (),
        trajectory: new vs.ext.fx.Vector1D ({
          values: [1, 0]
        }).init ()
      }));
    };
    this.anim_show = vs.par.apply (this, anims);
    this.anim_hide = vs.par.apply (this, anims_invert);
  },
  
  show : function () {
    this._visible = true;
    this.anim_hide.stop ();
    this.anim_show.start ();
  },

  hide : function () {
    this._visible = false;
    this.anim_show.stop ();
    this.anim_hide.start ();
  }
});
