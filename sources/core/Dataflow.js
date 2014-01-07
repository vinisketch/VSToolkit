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

var edge_id_counter = 1;

function DataFlow (comp) {
  
  // ordered node list Array<Object>
  this.dataflow_node = [];

  // edges from components Object[component.id] => Array[3] <Object, , properties>
  this.dataflow_edges = {};
  this.is_propagating = false;
//  this._node_link = {};
  this.__shouldnt_propagate__ = 0;
  
  this._list_node = [];
  this._edges_from = {};
  
  if (comp && comp.__df__) {
    comp.__df__.push (this);
  }
}

DataFlow.prototype = {
 
  propagate_values : function (obj) {
 
    var data = this.dataflow_edges [obj._id],
      connectors, edges, i = 0, j = 0, l = 0,
      fnc, descriptors,
      edge, obj_next,
      length = 0, length_desc = 0, func = null, params;
    
    if (!data) { return; }

    length = data.length;
    for (i = 0; i < length; i++) {
    
      connectors = data [i]; if (!connectors) { continue; }
      obj_next = connectors [0]; if (!obj_next) { continue; }

      edges = connectors [2];
      if (!edges || !edges.length) { continue; }
      
      for (j = 0; j < edges.length; j++) {
      
        edge = edges [j];
        func = edge [3];
        params = [];
        descriptors = edge [1]; // properties out
        length_desc = descriptors.length;

        // configure parameters
        for (l = 0; l < length_desc; l++) {
          params.push (descriptors [l].call (obj));
        }
        
        if (func) {
          params = func.apply (window, params);
          if (!util.isArray (params)) {
            params = [params];
          }
        }
        
        descriptors = edge [2]; // properties in
        length_desc = descriptors.length;

        if (params.length !== length_desc) {
          console.error ("Dataflow, invalid parameters");
          return;
        }

        // properties value propagation
        for (l = 0; l < length_desc; l++) {
          fnc = descriptors [l];
          fnc.call (obj_next, params [l]);
        }

        obj_next.__input_property__did__change__ = true;
      }
    }
  },
  
  /**
   * Propagates values along the dataflow graph
   *
   * @protected
   *
   * @param {Object} comp, an optional component form witch start the
   *                 propagation
   * @param {Boolean} force force a full propagation, without test
   *                  if properties have changed or not
   * @param {Boolean} output_propagation, do a propagation, starting from
   *         output property instead of input property (default configuration)
   */
  propagate : function (obj, force, output_propagation) {

    // The graph is sorted and save into an array.
    // Propagation consiste of take each object of tree, one by one, following
    // the array order, and propagation value between node, and call
    // propertiesDidChange method.
  
    // 1) the dataflow is propagating values, do nothing.
    if (this.is_propagating || this.__shouldnt_propagate__) { return; }

    this.is_propagating = true;
    
    var i = 0, dataflow_node = this.dataflow_node, l = dataflow_node.length;
    
    // 2) manage the first object from which starting propagation
    if (obj) {
      // find the first node corresponding to the id
      while (i < l && dataflow_node [i] !== obj) { i++; }

      // the node was found. First data propagation
      if (i < l - 1) {
        if (!output_propagation && obj.propertiesDidChange) {
          if (obj.propertiesDidChange ()) {
            // true means output properties were not changed.
            // => stop propagation

            // end of propagation
            this.is_propagating = false;
            return;
          }
        }
        this.propagate_values (obj);
        i++;
      }
      else {
        i = 0;
      }
    }

    // 3) continue the propagation to following nodes
    for (; i < l; i++) {
      obj = dataflow_node [i];
      if (!obj) { continue; }

      if (obj.__input_property__did__change__) {
        obj.__input_property__did__change__ = false;
        if (obj.propertiesDidChange) {
          if (obj.propertiesDidChange ()) {
            // true means output properties were not changed.
            // => stop propagation
            continue;
          }
        }
        this.propagate_values (obj);
      }
    }

    // 4) end of propagation
    this.is_propagating = false;
  },

  /**
   * Connect two components within the datalfow.
   * After a connection, you have to call build method to compile the dataflow.
   * Build can (should) be call when all connection are done (to avoid
   * un-necessary calculation)
   *
   * @public
   * @param {String|Object} obj_src the Component (or Id) source.
   * @param {String|Array} property_out one or an array of output property name(s)
   * @param {String|Object} obj_trg the Component (or Id) target.
   * @param {String|Array} property_in one or an array of input property name(s)
   */
  connect : function (obj_src, property_out, obj_trg, property_in, func) {

    var
      cid_src, cid_trg, properties_out, properties_in,
      data, index, data_l,
      connections, edges,
      edge_id = edge_id_counter++, edge;
  
    if (util.isString (obj_src)){
      cid_src = obj_src;
    }
    else {
      cid_src = obj_src._id;
    }
    
    obj_src = VSObject._obs [cid_src]; if (!obj_src) { return; }
    if (obj_src.__df__.indexOf (this) === -1) {
      obj_src.__df__.push (this);
    }
  
    if (util.isString (obj_trg)) {
      cid_trg = obj_trg;
    }
    else {
      cid_trg = obj_trg._id;
    }
    
    // Properties out management
    if (util.isString (property_out)) {
      properties_out = [property_out];
    }
    else if (!util.isArray (property_out)) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    else {
      properties_out = property_out;
    }
  
    // Properties in management
    if (util.isString (property_in)) {
      properties_in = [property_in];
    }
    else if (!util.isArray (property_in)) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    else {
      properties_in = property_in;
    }
    
    if (!func && properties_in.length !== properties_out.length) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    
    if (this._list_node.indexOf (cid_src) === -1)
      this._list_node.push (cid_src);

    if (this._list_node.indexOf (cid_trg) === -1)
      this._list_node.push (cid_trg);

    data = this._edges_from [cid_src];
    if (!data) {
      data = [];
      this._edges_from [cid_src] = data;
    }
    
    data_l = data.length;
      
    // find a existing connection to the component
    for (index = 0; index < data_l; index++) {
      connections = data [index];
      if (connections[0] === cid_trg) {
        edges = connections [2];
        break;
      }
    }
    // no connection exist, create
    if (!edges) {
      edges = [];
      data.push ([cid_trg, 1, edges]);
    }
    
    edge = [edge_id, properties_out.slice (), properties_in.slice (), func];
    edges.push (edge);
    
    return edge_id;
  },

  /**
   * Remove a dataflow connection
   * After the remove, you have to call build method to compile the dataflow.
   * Build can (should) be call when all remove are done (to avoid
   * un-necessary calculation)
   *
   * @public
   * @param {Number} edge_id the id of the edge to remove (this id is returned
   *                 by connect method)
   */
  unconnect : function (edge_id) {
    this._unconnect_by_id (edge_id);
  },

  /**
   * Remove a dataflow connection using a edge ids
   *
   * @private
   * @param {Number} edge_id the id of the edge to remove
   */
  _unconnect_by_id : function (edge_id) {
    
    for (var cid in this._edges_from) {
      var data = this._edges_from [cid];
      if (!data) continue;
      
      var data_l = data.length;
      
      // find a existing connection to the component
      for (var index = 0; index < data_l; index++) {
        var connections = data [index];
        var edges = connections [2];

        var i = 0, edges_l = edges.length, edge;
        for (; i < edges_l; i++) {
          edge = edges [i];
      
          if (edge && edge [0] === edge_id) {
            edges.remove (i);
            if (edges.length === 0) {
              // remove connection
              
              
            }
            return;
          }
        }
      }   
    }
  },

  /**
   * Performs a topological sort on this DAG, so that getNodes returns the
   * ordered list of nodes.<p>
   * Returns true if the graph is acyclic, false otherwise. When the graph is
   * cyclic, the algorithm does at it best to partially order it and issues a
   * warning.
   *
   * @private
   * @return {boolean}
   */
  _sort : function () {

    /// This method uses the classical sorting algorithm with cycle-detection.
    /// See, e.g., http://www.cs.umb.edu/cs310/class23.html
    /// It is normally O(|E|) but this probably won't be the case here
    /// until efficiency issues have been solved.
    /// The algorithm has also been modified in order to cyclic graphs to be
    /// partially sorted instead of being not sorted at all.

    /// 1) Calculate in-degrees for nodes
    var
      nb_node = this._list_node.length,
      indegrees = [], i, j, key, ids, index;

    for (i = 0; i < nb_node; i++) {
      indegrees [i] = 0;
    }

    for (key in this._edges_from) {
      /// FIXME: For more efficiency, store indexes into edges to avoid node
      /// search.
      ids = this._edges_from [key];
      for (j = 0; j < ids.length; j++) {
        //find the index of the node in the node list
        index = this._list_node.findItem (ids [j][0]);
        indegrees [index]++;
      }
    }

    /// 2) Initialization
    var
      pending = this._list_node.slice (),
      sorted = [], violationcount = 0;

    /// 3) Loop until everything has been sorted
    while (pending.length !== 0) {
      /// Extract a node of minimal input degree and append it to list topsorted
      var
        min_i = this._array_min (indegrees),
        indegree = indegrees [min_i];
        
      indegrees.remove (min_i);

      var n_id = pending [min_i];
      pending.remove (min_i);
      
      if (indegree > 0) {
        violationcount++;
      }
      sorted.push (n_id);

      /// 4) Decrement indegrees of nodes m adjacent to n
      /// FIXME: For more efficiency, store adjacent nodes to avoid this search.
      /// Use an adjacency matrix implementation ?
      ids = this._edges_from [n_id];
      if (ids) {
        for (j = 0; j < ids.length; j++) {
          var mi =  pending.findItem (ids [j][0]);
          if (mi !== -1) {
            indegrees [mi]--;
          }
        }
      }
    }

    /// 5) Update node list & return result
    this._list_node = sorted;
    this.is_sorted = true;
    this.is_cyclic = violationcount > 0;

    if (violationcount > 0) {
      var edgecount = Object.keys (this._edges_from).length;
      console.warn (
        "WARNING: Cycles detected during topological sort." +
        "%d dependencies out of %d have been violated.\n",
        violationcount, edgecount);
    }
    return !this.is_cyclic;
  },
  
  /**
   * Returns the index of the smallest element into an array
   *
   * @private
   * @param {Array} indegrees the Array
   * @return {integer} the index
   */
  _array_min : function (indegrees) {
    var count = indegrees.length;
    if (count === 0) return -1;
    if (count === 1) return 0;
    var min_index = 0;
    var min = indegrees [min_index];

    for (var i = 1; i < indegrees.length; i++) {
      if (indegrees [i] < min) {
        min = indegrees [i];
        min_index = i;
      }
    }
    return min_index;
  },

  build : function () {
    this._sort ();

    this._data_optimize (this._edges_from, this._list_node);
  },
  
  /**
   * @private
   */
  pausePropagation : function () {
    this.__shouldnt_propagate__ ++;
  },

  /**
   * @private
   */
  restartPropagation : function () {
    this.__shouldnt_propagate__ --;
    if (this.__shouldnt_propagate__ < 0) this.__shouldnt_propagate__ = 0;
  },

  _data_optimize : function (_ref_edges, _ref_node) {
    if (!_ref_node || !_ref_edges) { return; }
  
    var temp = [], i, j, k,
      data, data_temp,
      connections, connections_temp,
      edges, edges_temp,
      edge, edge_temp,
      cid_src, cid_trg, obj_src, obj_trg,
      property_name, descriptor, properties, properties_temp;
    
    for (i = 0; i < _ref_node.length; i++) {
      cid_src = _ref_node [i];    
      obj_src = VSObject._obs [cid_src]; if (!obj_src) { continue; }
    
      temp.push (obj_src);
    }
    this.dataflow_node = temp;
  
    temp = {};
    for (cid_src in _ref_edges) {
      obj_src = VSObject._obs [cid_src]; if (!obj_src) { continue; }

      data = _ref_edges [cid_src];
      data_temp = [];
      temp [cid_src] = data_temp;
    
      if (data) for (i = 0; i < data.length; i++) {
        connections = data [i];
        connections_temp = [3];
        
        data_temp.push (connections_temp);
        cid_trg = connections [0];
        obj_trg = VSObject._obs [cid_trg];  if (!obj_trg) { continue; }
      
        connections_temp [0] = obj_trg;
        connections_temp [1] = connections [1];
      
        edges = connections [2];
        edges_temp = [];
        connections_temp [2] = edges_temp;
      
        for (j = 0; j < edges.length; j++) {
          edge = edges [j];
          edge_temp = [4];
          edges_temp.push (edge_temp);

          edge_temp [0] = edge [0]; // id copy
          if (util.isFunction (edge [3])) {
            // function copy
            edge_temp [3] = edge [3];
          }
        
          // manage out properties
          properties = edge [1], properties_temp = [];
          for (k = 0; k < properties.length; k++) {
            property_name = properties [k];
            descriptor = obj_src.getPropertyDescriptor (property_name);
            if (!descriptor) { continue; }
            if (descriptor.get) properties_temp.push (descriptor.get);
            else {
              properties_temp.push ((function (_prop_name) {
                return function () { return this[_prop_name]; };
              }('_' + util.underscore (property_name))));
            }
          }
          edge_temp [1] = properties_temp;
      
          // manage in properties
          properties = edge [2], properties_temp = [];
          for (k = 0; k < properties.length; k++) {
            property_name = properties [k];
            descriptor = obj_trg.getPropertyDescriptor (property_name);
            if (!descriptor) { continue; }
            if (descriptor.set) {
              properties_temp.push (descriptor.set);
            }
            else {
              properties_temp.push ((function (_prop_name) {
                return function (v) { this[_prop_name] = v; };
              }('_' + util.underscore (property_name))));
            }
          }
          edge_temp [2] = properties_temp;
        }
      }
    }
    this.dataflow_edges = temp;
  }
};

/********************************************************************
                      Export
*********************************************************************/
core.DataFlow = DataFlow;
vs._default_df_ = new DataFlow ();

