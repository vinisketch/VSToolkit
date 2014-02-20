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
 
var AnimVector = vs.core.createClass ({

  parent: vs.ext.fx.Trajectory,
  
  _translations: null,
  _translation: 0,
  _scalings: null,
  _scaling: 0,
  
  properties : {
    translations: {
      set: function (v) {
        if (!vs.util.isArray (v) || v.length < 1) return;
        this._translations = v.slice ();
      }
    },
    
    translation: vs.core.Object.PROPERTY_OUT,
    
    scalings: {
      set: function (v) {
        if (!vs.util.isArray (v) || v.length < 1) return;
        this._scalings = v.slice ();
      }
    },
    
    scaling: vs.core.Object.PROPERTY_OUT
  },
  
  constructor : function (config)
  {
    this._super (config);
    this._translations = [];
    this._scalings = [];
  },
  
  _compute_translate: function ()
  {
    var
      nb_values = this._translations.length - 1, // int [0, n]
      ti = this._tick * nb_values, // float [0, n]
      index = Math.floor (ti), // int [0, n]
      d = ti - index; // float [0, 1]
      
    if (this._tick === 0) this._translation = this._translations [0];
    else if (this._tick === 1) this._translation = this._translations [nb_values];
    else
    {
      var v1 = this._translations [index];
      var v2 = this._translations [index + 1];
      this._translation = [
        v1[0] + (v2[0] - v1[0]) * d,
        v1[1] + (v2[1] - v1[1]) * d
      ]
    }
  },
  
  _compute_scaling: function ()
  {
    var
      nb_values = this._scalings.length - 1, // int [0, n]
      ti = this._tick * nb_values, // float [0, n]
      index = Math.floor (ti), // int [0, n]
      d = ti - index; // float [0, 1]
      
    if (this._tick === 0) this._scaling = this._scalings [0];
    else if (this._tick === 1) this._scaling = this._scalings [nb_values];
    else
    {
      var v1 = this._scalings [index];
      var v2 = this._scalings [index + 1];
      this._scaling = v1 + (v2 - v1) * d;
    }
  },
  
  compute: function ()
  {
    if (!vs.util.isNumber (this._tick)) return;
    
    this._compute_translate ();
    this._compute_scaling ();
  }
});