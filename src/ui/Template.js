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

/**
 *  @class
 *  vs.ui.Template is GUI template system you can use to create the view
 *  of component for instance. <br/>
 *  A template is a HTML text fragment containing template tags. There is two
 *  ways to use template :
 * <ul>
 *   <li> By expanding tags using values provides in an Object</li>
 *   <li> By generating a vs.ui.View with properties linked to tags</li>
 * </ul>
 *  @author David Thevenin
 * <br/>
 * <br/>
 * Typical template description:
 * <pre class='code'>
 *  var str = '&lt;span style="${style}"&gt;name:${lastname}, \
 *     ${firstname}&lt;/span&gt;';
 * </pre>
 *
 * Expanding the template:
 * <pre class='code'>
 *  var myTemplate = new Template (str);
 * <br/>
 *  var values = {
 *    lastname : "Doe",
 *    firstname : "John",
 *    style : "color:blue"
 *  };
 * <br/>
 *  console.log (myTemplate.apply (values));
 *  // -> &lt;span style="color:blue"&gt;name:Doe,John&lt;/span&gt;
 * </pre>
 *
 * Generating a vs.ui.View from the template:
 * <pre class='code'>
 *  var myTemplate = new Template (str);
 * <br/>
 *  var myView = myTemplate.compileView ();
 * <br/>
 *  myApp.add (myView); //|| document.body.appendChild (myView.view);
 * <br/>
 *  // property changes, automatically update the DOM
 *  myView.lastname = "Doe";
 *  myView.firstname = "John";
 *  myView.style = "color:blue";
 * <br/>
 * </pre>
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.ui.Template
 *
 * @param {string} config the configuration structure [mandatory]
 */
function Template (str) {
  this._str = str;
}

/** @name vs.ui.Template# */
Template.prototype = {
  /**
   * @protected
   * @Array
   */
  _str : null,
  _regexp_templ : /\$\{((([\w\-]+)(\.([\w\.]*)+)?)|@)\}/g,
  _regexp_index : /\$\{\*([\d]+)\*\}/g,
  _shadow_view : null,

  /***************************************************************

  ***************************************************************/

  /**
   * HTML String of the template <p>
   *
   * @name vs.ui.Template#toString
   * @function
   *
   * @return {String} HTML String of the template
   */
  toString : function () {
    return this._str;
  },

  /**
   *
   * @name vs.ui.Template#compileView
   * @function
   *
   * @param {String} className The view class Name. By default vs.ui.View.
   *                 [optional]
   * @param {Object|Model} data The view data configuration | model
   *                 [optional]
   * @return {vs.ui.View} the View
   */
  compileView : function (className, data) {
    if (!this._shadow_view) {
      this._shadow_view = _pre_compile_shadow_view (this, className);
    }
    
    var obj = _instanciate_shadow_view (this._shadow_view, data);

    // Clone data
    obj.__shadow_view = this._shadow_view;
    // Clone surcharge
    obj.clone = _template_view_clone.bind (obj);
    obj._clone = _template_view__clone.bind (obj);

    return obj;
  },

  /**
   *
   * @name vs.ui.Template#compileView
   * @function
   * @private
   *
   * @param {vs.ui.View} comp Extends a component with this template
   *                 [mandatory]
   * @return {HTMLElement} The component view
   */
   __extend_component : function (comp) {
    if (!this._shadow_view) {
      this._shadow_view = _pre_compile_shadow_view (this);
    }
    
    var new_node = this._shadow_view.__node.cloneNode (true);
    comp.view = new_node;
  
    _instrument_component (comp, this._shadow_view, new_node);
  
    // Clone data
    comp.__shadow_view = this._shadow_view;
    // Clone surcharge
    comp.clone = _template_view_clone.bind (comp);
    comp._clone = _template_view__clone.bind (comp);

    return new_node;
  },

  /**
   * Returns an HTML String of this template with the specified values.
   *
   * @example
   *  myTemplate.apply (['John', 25]);
   *
   * @name vs.ui.Template#apply
   * @function
   *
   * @param {Object} values The template values.
   * @return {String} The HTML string
   */
  apply : function (values) {
    if (!values) return this._str;

    function replace_fnc (str, key, p1, p2, offset, html) {
      var value = values [key], key, keys, i, l;

      if (offset) {
        keys = p1.split ('.'); i = 1; l = keys.length;
        value = values [keys[0]];
        while (value && i < l) value = value [keys [i++]];
      }

      return value;
    }

    return this._str.replace (this._regexp_templ, replace_fnc);
  }
};

/**
 * @private
 */
function _resolveClass (name) {
  if (!name) { return null; }

  var namespaces = name.split ('.');
  var base = window;
  while (base && namespaces.length) {
    base = base [namespaces.shift ()];
  }

  return base;
}

/**
 * @private
 */
var _template_view_clone = function (config, cloned_map) {
  if (!config) { config = {}; }
  
  config.node =
    (this.__shadow_view)?this.__shadow_view.__node.cloneNode (true):
    (config.node)?config.node:this.view.cloneNode (true);
  
  return core.EventSource.prototype.clone.call (this, config, cloned_map);
};

/**
 * @private
 */
var _template_view__clone = function (obj, cloned_map) {
  ui.View.prototype._clone.call (this, obj, cloned_map);

  _instrument_component (obj, this.__shadow_view, obj.view);

  // Clone data
  obj.__shadow_view = this.__shadow_view;
  // clone surcharge
  obj.clone = _template_view_clone.bind (obj);
  obj._clone = _template_view__clone.bind (obj);
  // rewrite properties to point cloned nodes
};

/**
 * @private
 */
function _instrument_component (obj, shadow_view, node) {

  /**
   * @private
   */
  var _create_node_property = function (view, prop_name, nodes) {
    var desc = {}, _prop_name = '_' + util.underscore (prop_name);

    desc.set = (function (nodes, prop_name, _prop_name) {
      return function (v) {
        var i = 0, node, l = nodes.length, r;
        this [_prop_name] = v;
        for (; i < l; i++) {
          node = nodes [i];
          if (node.nodeType === 3) { //TEXT_NODE
            node.data = v;
          }
          else if (node.nodeType === 2) {
            r = eval(node.__attr_eval_str);
            //ATTRIBUTE_NODE
            if (node.name == 'value' && node.ownerElement.tagName == 'INPUT') {
              node.ownerElement.value = r;
            }
            //ATTRIBUTE_NODE
            else {
              node.value = r;
            }
          }
        }
        if (prop_name == '_$_') this.propertyChange ();
        else this.propertyChange (prop_name);
      };
    }(nodes, prop_name, _prop_name));

    desc.get = (function (_prop_name) {
      return function () {
        return this[_prop_name];
      };
    }(_prop_name));

    // save this string for clone process
//    desc.set.__vs_attr_eval_str = attr_eval_str;

    view.defineProperty (prop_name, desc);
  };

  /**
   * @private
   */
  var _create_iterate_property =
    function (obj, prop_name, shadow_view, parentElement) {
    var desc = {}, _prop_name = '_' + util.underscore (prop_name);
      
    desc.set = (function (prop_name, _prop_name, shadow_view, parentElement) {
      return function (v) {
        if (!util.isArray (v)) { return; }
      
        var i = 0, l = v.length, obj;
        this [_prop_name] = v;
        util.removeAllElementChild (parentElement);
        for (; i < l; i++) {
          obj = _instanciate_shadow_view (shadow_view, v [i]);
          parentElement.appendChild (obj.view);
        }

        this.propertyChange (prop_name);
      };
    }(prop_name, _prop_name, shadow_view, parentElement));

    desc.get = (function (_prop_name) {
      return function () {
        return this[_prop_name];
      };
    }(_prop_name));

    obj.defineProperty (prop_name, desc);
  };

  /**
   * @private
   */
  var _createPropertiesToObject = function (obj, ctx, view_node) {
    var node_ref = [];

    // configure properties
    
    // Properties pointing on a node
    var l = ctx.__all_properties.length;
    while (l--) {
      var prop_name = ctx.__all_properties [l],
        nodes = ctx.__prop_nodes [l],
        paths, nodes_cloned;
      
      if (nodes) {
        paths = _getPaths (ctx.__node, nodes);
        nodes_cloned = _evalPaths (view_node, paths);

        node_ref.push ([prop_name, nodes]);
        if (prop_name === '@') _create_node_property (obj, '_$_', nodes_cloned);
        else _create_node_property (obj, prop_name, nodes_cloned);
      }
    }

    // Iterate Properties
    var l = ctx.__all_properties.length;
    while (l--) {
      var prop_name = ctx.__all_properties [l],
        shadow_view = ctx.__list_iterate_prop [prop_name], paths, nodes_cloned;
      
      if (shadow_view) {
        path = _getPath (ctx.__node, shadow_view.__parent_node);
        node_cloned = _evalPath (view_node, path);

        _create_iterate_property (obj, prop_name, shadow_view, node_cloned);
      }
    }
    obj.__node__ref__ = node_ref;
  };
  
  _createPropertiesToObject (obj, shadow_view, node);
};

/**
 * @private
 */
function _instanciate_shadow_view (shadow_view, data) {
  var new_node = shadow_view.__node.cloneNode (true);
  var obj = new shadow_view.__class ({node: new_node});
  
  _instrument_component (obj, shadow_view, new_node);
  
  obj.init ();
  if (data) {
    obj.configure (data);
  }
  if (obj.isProperty ('_$_')) { obj._$_ = data; }
  
  return obj;
};

/**
 * @private
 */
function _pre_compile_shadow_view (self, className) {
  var shadow_view = {};
  shadow_view.__prop_nodes = [];
  shadow_view.__list_iterate_prop = {};
  shadow_view.__all_properties = [];

  shadow_view.__class = _resolveClass (className);
  if (!util.isFunction (shadow_view.__class)) {
    shadow_view.__class = ui.View;
  }

  /**
   * Replacement function
   * Replace a Template tag into a temporary index code
   * This code will be used to identify DOM nodes
   */
  function replace_fnc (str, key, p1, p2, offset, html) {
    var i = shadow_view.__all_properties.indexOf (key);
    if (i === -1) {
      i = shadow_view.__all_properties.length;
      // a new property is found
      shadow_view.__all_properties.push (key);
    }
    return "\${*" + i + "*}";
  }

  // 1) parse and index the html string
  self._regexp_templ.lastIndex = 0; // reset the regex
  var str = self._str.replace (self._regexp_templ, replace_fnc);

  // 2) the template is indexed, now parse it for generating the
  // DOM fragment
  shadow_view.__node = Template.parseHTML (str);

  /**
   * Attributes parsing function
   */
  function parseAttributes (nodes, ctx) {
    if (!nodes) return;
    var l = nodes.length;
    while (l--) {
      var node_temp = nodes.item (l), result,
        str = node_temp.value, indexs = [], index;

      self._regexp_index.lastIndex = 0;// reset the regex
      result = self._regexp_index.exec (str);
      if (result) {
        while (result) {
          index = parseInt (result[1], 10);
          indexs.push (index);
          if (!ctx.__prop_nodes [index])
          { ctx.__prop_nodes [index] = [node_temp]; }
          else { ctx.__prop_nodes [index].push (node_temp); }
          result = self._regexp_index.exec (str);
        }
        node_temp.value = '';

        for (var i = 0; i < indexs.length; i++) {
          index = indexs [i];
          str = str.replace (
            "${*" + index + "*}",
            "\"+this._" + util.underscore (ctx.__all_properties [index]) + "+\""
          );
        }
        
        node_temp.__attr_eval_str = "\"" + str + "\"";
      }
    }
  }
  
  /**
   * Node parsing function
   * Parse the DOM fragment to retrieve attribute and text node
   * associated to a template tag
   */
  function parseNode (node, ctx) {
    var interate_attr = node.getAttribute ('data-iterate');
    if (interate_attr) {
      var parentElement = node.parentElement;
      parentElement.removeChild (node);
      
      if (ctx.__all_properties.indexOf (interate_attr) === -1) {
        ctx.__all_properties.push (interate_attr);
      }

      var shadow_view = {};
      ctx.__list_iterate_prop [interate_attr] = shadow_view;
      
      shadow_view.__prop_nodes = [];
      shadow_view.__list_iterate_prop = {};
      shadow_view.__parent_node = parentElement;
      shadow_view.__node = node;
      shadow_view.__all_properties = ctx.__all_properties;
      shadow_view.__class = ui.View;
      
      ctx = shadow_view;
    }
    
    /**
     * Nodes parsing function
     */
    function parseNodes (nodes, ctx) {
      if (!nodes) return;
      var l = nodes.length;
      while (l--) {
        var node_temp = nodes.item (l);
        if (node_temp.nodeType === 3) { // TEXT_NODE
          var value = node_temp.data, result, index = 0, i, text_node;

          self._regexp_index.lastIndex = 0;// reset the regex
          // put white space to avoid IE nodeClone removes empty textNode
          node_temp.data = ' ';
          result = self._regexp_index.exec (value);
          while (result) {
            if (result.index) {
              text_node = document.createTextNode
                (value.substring (index, result.index));
              node.insertBefore (text_node, node_temp);
            }

            i = parseInt (result[1], 10);
            if (!ctx.__prop_nodes [i]) {
              ctx.__prop_nodes [i] = [node_temp];
            }
            else {
              ctx.__prop_nodes [i].push (node_temp);
            }
            
            index = result.index + result[0].length;

            result = self._regexp_index.exec (value);
            if (result) {
              // put white space to avoid IE nodeClone removes empty textNode
              text_node = document.createTextNode (' ');
              if (node_temp.nextSibling) {
                node.insertBefore (text_node, node_temp.nextSibling);
              }
              else {
                node.appendChild (text_node);
              }
              node_temp = text_node;
            }
          }
          var end_text = value.substring (index);
          if (end_text) {
            text_node = document.createTextNode (end_text);
            if (node_temp.nextSibling) {
              node.insertBefore (text_node, node_temp.nextSibling);
            }
            else {
              node.appendChild (text_node);
            }
          }
        }
        else if (node_temp.nodeType === 1) { // ELEMENT_NODE
          parseNode (node_temp, ctx);
        }
      }
    }

    parseAttributes (node.attributes, ctx);
    parseNodes (node.childNodes, ctx);
  }
  parseNode (shadow_view.__node, shadow_view);

  return shadow_view;
};

/**
 * @private
 */
var _getPaths = function (root, nodes) {
  var paths = [], i = 0, l = nodes.length, node;
  for (; i < l; i++) {
    node = nodes[i];
    paths.push ([_getPath (root, node), node.__attr_eval_str]);
  }
  return paths;
}

/**
 * @private
 */
var _getPath = function (root, node, path) {
  var count = 1;
  path = path || [];

  // 1) manage node atribute
  if (node.nodeType === 2) {
    if (node.ownerElement) {
      path = _getPath (root, node.ownerElement, path);
    }
    path.push ([2, node.nodeName.toLowerCase ()]);
    return path;
  }

  // 2) current node is the root : stop
  if (root === node) {
    return path;
  }

  // 2) Manage parent
  if (node.parentNode) {
    path = _getPath (root, node.parentNode, path);
  }

  // 1) manage node atribute
  var sibling = node.previousSibling
  while (sibling) {
    if ((sibling.nodeType === 1 || sibling.nodeType === 3) &&
         sibling.nodeName == node.nodeName) {
      count++;
    }
    sibling = sibling.previousSibling;
  }

  path.push ([1, node.nodeName.toLowerCase(), count]);
  return path;
};

/**
 * @private
 */
var _evalPaths = function (root, paths) {
  var nodes = [], i = 0, l = paths.length, path, node;
  for (; i < l; i++) {
    path = paths[i];
    node = _evalPath (root, path[0]);
    node.__attr_eval_str = path[1];
    nodes.push (node);
  }
  return nodes;
}

/**
 * @private
 */
var _evalPath = function (root, path) {
  if (!path || !path.length || !root) {
    return root;
  }

  var info = path.shift (), attrs, l, node_temp, sibbling,
    type = info [0], nodeName = info [1], count;

  // 1) manage node atribute
  if (type === 2) {
    attrs = root.attributes;
    l = attrs.length;
    while (l--) {
      node_temp = attrs.item (l);
      if (node_temp.nodeName.toLowerCase () ==  nodeName) { return node_temp; }
    }
    return null;
  }
  else if (type === 1) {
    sibbling = root.firstChild; l = info [2], count = 1;
    while (sibbling) {
      if (sibbling.nodeName.toLowerCase () === nodeName) {
        if (l === count) {
          return _evalPath (sibbling, path);
        }
        else {
          count ++;
        }
      }
      sibbling = sibbling.nextSibling;
    }
  }

  return null;
};

/**
 * @protected
 */
Template.parseHTML = function (html) {
  var div = document.createElement ('div');
  try {
    util.safeInnerHTML (div, html);

    div = div.firstElementChild;
    if (div) {
      div.parentElement.removeChild (div);
    }
  }
  catch (e) {
    console.error ("vs.ui.Template.parseHTML failed:");
    if (e.stack) console.log (e.stack);
    console.error (e);
    return undefined;
  }
  return div;
}
/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.ui.Template = Template;
