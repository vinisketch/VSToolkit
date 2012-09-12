/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

function DataFlow ()
{
  this.dataflow_node = [];
  this.dataflow_edges = {};
  this.is_propagating = false;
  this._node_link = {};
  this.__shouldnt_propagate__ = 0;
}

DataFlow.prototype = {

  propagate_values : function (id)
  {
    var ids = this.dataflow_edges [id], k, j, obj, prop_in, prop_out,
      obj_next, connector;
    if (!ids) { return; }
    
    obj = VSObject._obs [id];
    
    for (k = 0; k < ids.length; k++)
    {
      obj_next = VSObject._obs [ids [k][0]];
      if (!obj_next) { continue; }
      
      connector = ids [k][2];
      if (connector)
      {
        // properties value propagation
        for (j = 0; j < connector.length; j++)
        {
          prop_in = connector [j][0];
          prop_out = connector [j][1];
          
          var desc_in = obj.getPropertyDescriptor (prop_in);
          var desc_out = obj_next.getPropertyDescriptor (prop_out);

          if (!desc_in || !desc_in.get)
          {
            prop_in = '_' + util.underscore (prop_in);
            if (!obj.hasOwnProperty (prop_in))
            {
              continue;
            }
          }
          if (!desc_out || !desc_out.set)
          {
            prop_out = '_' + util.underscore (prop_out);
            if (!obj_next.hasOwnProperty (prop_out))
            {
              continue;
            }
          }

          obj_next [prop_out] = obj [prop_in];
        }
        
        obj_next.__should__call__has__changed__ = true;
      }
    }
  },
  
  propagate : function (_id)
  {
    if (this.is_propagating || this.__shouldnt_propagate__) { return; }
    
    this.is_propagating = true;
    
    var i = 0, obj;
    if (_id)
    {
      // find the first node corresponding to the id
      while (i < this.dataflow_node.length && this.dataflow_node [i] !== _id)
      { i++; }
    
      // the node wad found. First data propagation
      if (i < this.dataflow_node.length - 1)
      {
        this.propagate_values (_id);
        i++;
      }
    }
    
    // continue the propagation
    for (; i < this.dataflow_node.length; i++)
    {
      obj = VSObject._obs [this.dataflow_node [i]];
      if (!obj) { continue; }
  
      if (obj.__should__call__has__changed__ && obj.propertiesDidChange)
      {
        obj.propertiesDidChange ();
        obj.__should__call__has__changed__ = false;
      }
      
      this.propagate_values (obj.id);
    }
    this.is_propagating = false;
  },

  build : function ()
  {
    if (!this._ref_node || !this._ref_edges) { return; }
    
    var temp = [], i, ref, edges, edges_temp, edge, edge_temp;
    for (i = 0; i < this._ref_node.length; i++)
    {
      ref = this._ref_node [i];
      if (!this._node_link [ref])
      {
//        console.warn ('_df_build, this._node_link [ref] null');
        continue;
      }
      
      temp.push (this._node_link [ref]);
    }
    this.dataflow_node = temp;
    
    temp = {};
    for (ref in this._ref_edges)
    {
      if (!this._node_link [ref])
      {
//        console.warn ('_df_build, this._node_link [ref] null');
        continue;
      }
  
      edges = this._ref_edges [ref];
      edges_temp = [];
      for (i = 0; i < edges.length; i++)
      {
        edge = edges [i];
        edge_temp = [3];
        
        if (!this._node_link [edge [0]])
        {
//          console.warn ('_df_build, this._node_link [edge [0]] null');
          continue;
        }
        edge_temp [0] = this._node_link [edge [0]];
        edge_temp [1] = edge [1];
        edge_temp [2] = edge [2].slice ();
        
        edges_temp.push (edge_temp);
      }
      
      temp [this._node_link [ref]] = edges_temp;
    }
    this.dataflow_edges = temp;
  },

  register_ref_node : function (data)
  {
    if (!data) { return; }
    this._ref_node = data;
  },
  
  register_ref_edges : function (data)
  {
    if (!data) { return; }
    this._ref_edges = data;
  },
  
  /**
   * @private
   */
  pausePropagation : function ()
  {
    this.__shouldnt_propagate__ ++;
  },
  
  /**
   * @private
   */
  restartPropagation : function ()
  {
    this.__shouldnt_propagate__ --;
    if (this.__shouldnt_propagate__ < 0) this.__shouldnt_propagate__ = 0;
  }

};

var _df_node_to_def = {};

function _df_node_register (df_id, ref, id)
{
  if (!df_id || !ref || !id) { return; }
  var df = _df_node_to_def [df_id];
  if (!df) { return; }
  
  df._node_link [ref] = id;
  _df_node_to_def [id] = df;
}
vs._df_node_register = _df_node_register;

function _df_create (id, ref)
{
  var df = new DataFlow ();
  
  df.ref = ref;
  _df_node_to_def [id] = df;
  
  return df;
}
vs._df_create = _df_create;

function _df_register_ref_node (id, data)
{
  if (!id || !data) { return; }
  
  var df = _df_node_to_def [id];
  if (!df) { return; }
  
  df.register_ref_node (data);
}
vs._df_register_ref_node = _df_register_ref_node;

function _df_register_ref_edges (id, data)
{
  if (!id || !data) {return;}
  
  var df = _df_node_to_def [id];
  if (!df) { return; }
  
  df.register_ref_edges (data);
}
vs._df_register_ref_edges = _df_register_ref_edges;

function _df_build (id)
{
  if (!id) { return; }
  
  var df = _df_node_to_def [id];
  if (!df) {return;}
  
  df.build ();
}
vs._df_build = _df_build;

/********************************************************************
                      Export
*********************************************************************/
core.DataFlow = DataFlow;

