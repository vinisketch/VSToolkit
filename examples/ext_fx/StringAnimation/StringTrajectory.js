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

var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', ' ', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0','!','¿','?','-','+','.',',',"'",'"','ç','ñ','à','á','è','é','ì','í','ò','ó','ù','ú','À','Á','È','É','Ì','Í','Ò','Ó','Ù','Ú'];

var StringTrajectory = vs.core.createClass ({

  parent: vs.ext.fx.Trajectory,
  
  _out: 0,
  _model: null,
  _values: null,
  __tmp: null,
  
  properties : {
    values: {
      set: function (v)
      {
        if (!vs.util.isArray (v)) return;
        if (v.length < 1) return;
        
        this._values = v.slice ();
      }
    },
    model: {
      set: function (v)
      {
        switch (v) {
          case "tick":
            this.compute = tick_trajectory.bind (this);
            this._model = "tick"
          break

          case "airport":
          default:
            this.compute = airport_trajectory.bind (this);
            this._model = "airport"
          break
        }
        
        this._model = v
      }
    },
    out: vs.core.Object.PROPERTY_OUT
  },
  
  constructor : function (config)
  {
    this._super (config);
    this._values = [];
  },
  
  initComponent : function ()
  {
    this._super ();
    
    if (!this._model) this.model = "airport";
  },
  
  compute: function ()  { return false; }

});

var airport_trajectory = function ()
{
  if (!vs.util.isNumber (this._tick)) return false;
  
  var
    start = this._values [0].split (''),
    end = this._values [1].split ('');
    
  function distance (c1, c2) {
    var pos1 = chars.indexOf (c1);
    var pos2 = chars.indexOf (c2);
    
    if (pos1 <= pos2) return pos2 - pos1;
    else {
      return chars.length - (pos1 - pos2);
    }
  }
  
  var lmax = Math.max (end.length, start.length),
    l = end.length - start.length,
    nb_steps = 0, d, steps_d = [];
    
  if (l > 0) while (l--) start.push (' ');
  if (l < 0) while (l++) end.push (' ');
  
  for (var i = 0; i < start.length; i++) {
    d = distance (start[i], end [i]);
    nb_steps += d;
    steps_d.push (d);
  }
  
  if (!this.__tmp) this.__tmp = start.slice ();
  else if (this.__tmp.length > lmax) {
    this.__tmp = this.__tmp.slice (0, lmax - 1);
  }
  
  var index = Math.floor (this._tick * nb_steps);
  var cursor = 0, steps = steps_d [cursor], old_step = 0;
  while (steps < index) {
    old_step += steps_d [cursor];
    steps += steps_d [++cursor];
  }

  var l = 0
  while (l < cursor) {
    this.__tmp [l] = end [l];
    l++;
  }
  l ++;
  while (++l < lmax) this.__tmp [l] = start [l];
  
  var step = (index - old_step)//steps_d [cursor];
  var index_char = (step + chars.indexOf (start [cursor])) % chars.length;
  this.__tmp [cursor] = chars [index_char];
  
  this._out = this.__tmp.join ('').replace (/\s*$/, '');

  return true;
}

var tick_trajectory = function ()
{
  if (!vs.util.isNumber (this._tick)) return false;
  
  var
    end = this._values [1].split (''),
    nb_steps = end.length,
    cursor = Math.floor (this._tick * nb_steps),
    l = 0;
    
    
  if (!this.__tmp) this.__tmp = [];
    
  while (l < cursor) {
    this.__tmp [l] = end [l];
    l++;
  }
  if (l < nb_steps) this.__tmp [l] = '█'; //'∎'
  while (++l < this.__tmp.length) this.__tmp [l] = " ";
    
  this._out = this.__tmp.join ('').replace (/\s*$/, '');

  return true;
}

