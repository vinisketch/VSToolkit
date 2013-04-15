/** @license
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

(function (window, undefined) {

var document = window.document;

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

/********************************************************************
                   
*********************************************************************/
/** @private */
var vs = window.vs,
  util = vs.util,
  core = vs.core,
  ui = vs.ui,
  fx = vs.fx,
  setElementTransform = util.setElementTransform,
  getElementTransform = util.getElementTransform,
  DeviceConfiguration = core.DeviceConfiguration,
  SUPPORT_3D_TRANSFORM = vs.SUPPORT_3D_TRANSFORM;

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
 *  var str = '&lt;span style="${style}"&gt;name:${lastname},${firstname}&lt;/span&gt;';
 * </pre>
 *
 * Expanding the template:
 * <pre class='code'>
 *  var myTemplate = new Template (str);
 * <br/>
 *  var values = {
 *    lastname : "Doo",
 *    firstname : "John",
 *    style : "color:blue"
 *  };
 * <br/>
 *  console.log (myTemplate.apply (values));
 *  // -> &lt;span style="color:blue"&gt;name:Doo,John&lt;/span&gt;
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
 *  myView.lastname = "Doo";
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
function Template (str)
{
  this._str = str;
}

/** @name vs.ui.Template# */
Template.prototype =
{
  /**
   * @protected
   * @Array
   */
  _str : null,
  _regexp_templ : /\$\{([\w\-]+)(\.([\w\.]*)+)?\}/g,
  _regexp_index : /\$\{\*([\d]+)\*\}/g,

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
  toString : function ()
  {
    return this._str;
  },

  /**
   *
   * @name vs.ui.Template#compileView
   * @function
   *
   * @param {String} viewName The view class Name. By default vs.ui.View.
   *                 [optional]
   * @return {vs.ui.View} the View
   */
  compileView : function (viewName)
  {
    var view_node = this._compile ();

    function resolveClass (name)
    {
      if (!name) return null;

      var namespaces = name.split ('.');
      var base = window;
      while (base && namespaces.length) {
        base = base [namespaces.shift ()];
      }

      return base;
    }

    var viewClass = resolveClass (viewName);
    if (!vs.util.isFunction (viewClass)) viewClass = vs.ui.View;

    var view = new viewClass ({node: view_node});

    this._addPropertiesToObject (view);

    view.init ();
    return view;
  },

  /**
   * @private
   */
  _compile : function ()
  {
    this.__properties = [];
    this.__properties_path = [];
    this.__prop_nodes = [];
    var self = this;

    /**
     * Replacement function
     * Replace a Template tag into a temporary index code
     * This code will be used to identify DOM nodes
     */
    function replace_fnc (str, key, p1, p2, offset, html)
    {
      var i = self.__properties.length;
      // a new property is found
      self.__properties.push (key);

      if (p2) self.__properties_path.push (p2.split ('.').shift ());
      else self.__properties_path.push (null);

      return "\${*" + i + "*}";
    }

    // 1) parse and index the html string
    self._regexp_templ.lastIndex = 0; // reset the regex
    var str = self._str.replace (self._regexp_templ, replace_fnc);

    // 2) the template is indexed, now parse it for generating the
    // DOM fragment
    var view_node = Template.parseHTML (str);

    /**
     * Node parsing function
     * Parse the DOM fragment to retrieve attribute and text node
     * associated to a template tag
     */
    function parseNode (node)
    {
      function parseNodes (nodes)
      {
        if (!nodes) return;
        var l = nodes.length;
        while (l--)
        {
          var node_temp = nodes.item (l);
          if (node_temp.nodeType === 3) // TEXT_NODE
          {
            var value = node_temp.data;
            node_temp.data = '';
            self._regexp_index.lastIndex = 0;// reset the regex
            var result = self._regexp_index.exec (value);
            var index = 0;
            while (result)
            {
              if (result.index)
              {
                var text_node = document.createTextNode
                  (value.substring (index, result.index));
                node.insertBefore (text_node, node_temp);
              }

              self.__prop_nodes [parseInt (result[1], 10)] = node_temp;
              index = result.index + result[0].length;

              result = self._regexp_index.exec (value);
              if (result)
              {
                text_node = document.createTextNode ('');
                if (node_temp.nextSibling)
                  node.insertAfter (text_node, node_temp.nextSibling);
                else
                  node.appendChild (text_node);
                node_temp = text_node;
              }
            }
            var text_node = document.createTextNode (value.substring (index));
            node.insertBefore (text_node, node_temp);
          }
          else if (node_temp.nodeType === 2) // ATTRIBUTE_NODE
          {
            self._regexp_index.lastIndex = 0;// reset the regex
            var result = self._regexp_index.exec (node_temp.value);
            if (result)
            {
              self.__prop_nodes [parseInt (result[1], 10)] = node_temp;
              node_temp.value = '';
            }
          }
          else if (node_temp.nodeType === 1) // ELEMENT_NODE
          {
            parseNode (node_temp);
          }
        }
      }
      parseNodes (node.childNodes);
      parseNodes (node.attributes);
    }
    parseNode (view_node);

    return view_node;
  },

  /**
   * @private
   */
  _addPropertiesToObject : function (obj)
  {
    var node_ref = [];

    // configure properties
    var l = this.__properties.length;
    while (l--)
    {
      var prop_name = this.__properties [l];
      var path = this.__properties_path [l];
      var node = this.__prop_nodes [l];
      if (!node) { continue; }

      node_ref.push ([prop_name, node]);
      _create_property (obj, prop_name, node, path);
    }

    // clone surcharge
    obj._clone = _view_clone;
    obj.__node__ref__ = node_ref;
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
  apply : function (values)
  {
    if (!values) return this._str;

    function replace_fnc (str, key, p1, p2, offset, html)
    {
      var value = values [key];

      if (p2)
      {
        var keys = p2.split ('.'), i = 0;
        while (value && i < keys.length) value = value [keys [i++]];
      }

      return value;
    }

    return this._str.replace (this._regexp_templ, replace_fnc);
  }
};

/**
 * @private
 */
var _create_property = function (view, prop_name, node, path)
{
  var desc = {};
  if (node.nodeType === 3) //TEXT_NODE
  {
    desc.set = (function (node, prop_name, _prop_name, path)
    {
      return function (v)
      {
        this [_prop_name] = v;
        node.data = v;
        this.propertyChange (prop_name);
      };
    }(node, prop_name, '_' + util.underscore (prop_name), path));

    desc.get = (function (node, _prop_name)
    {
      return function ()
      {
        this [_prop_name] = node.data
        return this[_prop_name];
      };
    }(node, '_' + util.underscore (prop_name)));
  }
  else if (node.nodeType === 2) //ATTRIBUTE_NODE
  {
    desc.set = (function (node, prop_name, _prop_name, path)
    {
      return function (v)
      {
        this [_prop_name] = v;
        node.value = v;
        this.propertyChange (prop_name);
      };
    }(node, prop_name, '_' + util.underscore (prop_name), path));

    desc.get = (function (node, _prop_name)
    {
      return function ()
      {
        this [_prop_name] = node.value
        return this[_prop_name];
      };
    }(node, '_' + util.underscore (prop_name)));
  }
  vs.util.defineProperty (view, prop_name, desc);
};

/**
 * @private
 */
var _view_clone = function (obj, cloned_map)
{
  vs.ui.View.prototype._clone.call (this, obj, cloned_map);
//  var view_cloned = obj.__config__.node;
  var view_cloned = obj.view;

  var node_ref = this.__node__ref__, node_ref_cloned = [], path, node_cloned;
  if (view_cloned && node_ref && node_ref.length)
  {
    var i = node_ref.length;
    while (i--)
    {
      var link = node_ref [i], node = link [1], prop_name = link [0];
      path = _getPath (this.view, node);

      node_cloned = _evalPath (view_cloned, path);

      node_ref_cloned.push ([prop_name, node_cloned]);

      _create_property (obj, prop_name, node_cloned);
      obj.__node__ref__ = node_ref_cloned;
    }
  }

  // rewrite properties to point cloned nodes
};

/**
 * @private
 */
var _getPath = function (root, node, path)
{
  var count = 1;
  path = path || [];

  // 1) manage node atribute
  if (node.nodeType === 2)
  {
    if (node.ownerElement)
    {
      path = _getPath (root, node.ownerElement, path);
    }
    path.push ([2, node.nodeName.toLowerCase ()]);
    return path;
  }

  // 2) current node is the root : stop
  if (root === node) { return path;}

  // 2) Manage parent
  if (node.parentNode)
  { path = _getPath (root, node.parentNode, path); }

  // 1) manage node atribute
  var sibling = node.previousSibling
  while (sibling)
  {
    if ((sibling.nodeType === 1 || sibling.nodeType === 3) && sibling.nodeName == node.nodeName)
    { count++; }
    sibling = sibling.previousSibling;
  }

  path.push ([1, node.nodeName.toLowerCase(), count]);
  return path;
};

/**
 * @private
 */
var _evalPath = function (root, path)
{
  if (!path || !path.length || !root) { return root; }

  var info = path.shift (), attrs, l, node_temp, sibbling,
    type = info [0], nodeName = info [1], count;

  // 1) manage node atribute
  if (type === 2)
  {
    attrs = root.attributes;
    l = attrs.length;
    while (l--)
    {
      node_temp = attrs.item (l);
      if (node_temp.nodeName.toLowerCase () ==  nodeName) { return node_temp; }
    }
    return null;
  }
  else if (type === 1)
  {
    sibbling = root.firstChild; l = info [2], count = 1;
    while (sibbling)
    {
      if (sibbling.nodeName.toLowerCase () === nodeName)
      {
        if (l === count) { return _evalPath (sibbling, path); }
        else { count ++; }
      }
      sibbling = sibbling.nextSibling;
    }
  }

  return null;
};

Template.parseHTML = function (html)
{
  var div = document.createElement ('div');
  try
  {
    util.safeInnerHTML (div, html);

    div = div.firstElementChild;
    if (div) div.parentElement.removeChild (div);
  }
  catch (e)
  {
    console.error ("vs.ui.Template.parseHTML failed:");
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
/*
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
 * @private
 */
function _findNodeRef (node, ref)
{
  if (!node.getAttribute) { return false; }

  if (node.getAttribute ('x-hag-ref') === ref) { return node; }
  if (node.getAttribute ('x-hag-comp') === ref) { return node; }

  var child = node.firstElementChild, result;
  while (child)
  {
    result = _findNodeRef (child, ref);
    if (result) { return result; }

    child = child.nextElementSibling;
  }

  return false;
}

/**
 *  The vs.ui.View class
 *
 *  @extends vs.core.EventSource
 *  @class
 *  vs.ui.View is a class that defines the basic drawing, event-handling, of
 *  an application. You typically don’t interact with the vs.ui.View API
 *  directly; rather, your custom view classes inherit from vs.ui.View and
 *  override many of its methods., Its also supports 2D
 *  transformations (translate, rotate, scale).
 *  <p>
 *  If you’re not creating a custom view class, there are few methods you
 *  need to use
 *
 *  Events:
 *  <ul>
 *    <li /> POINTER_START: Fired after the user click/tap on the view, when
 *           the user depresses the mouse/screen
 *    <li /> POINTER_MOVE: Fired after the user move the mouse/his finger on
 *           the view.
 *    <li /> POINTER_END: Fired after the user click/tap on the view, when
 *           the user release the mouse/ the pressur on screen.
 *  </ul>
 *  <p>
 *  @example
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.View.
 *
 * @name vs.ui.View
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function View (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = View;
}

/********************************************************************
                    Layout constant
*********************************************************************/

/**
 * No particular layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.DEFAULT_LAYOUT
 * @const
 */
View.DEFAULT_LAYOUT = null;

/**
 * Horizontal layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.HORIZONTAL_LAYOUT
 * @const
 */
View.HORIZONTAL_LAYOUT = 'horizontal_layout';

/**
 * Vertical layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.VERTICAL_LAYOUT
 * @const
 */
View.VERTICAL_LAYOUT = 'vertical_layout';

/**
 * Absolute layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.ABSOLUTE_LAYOUT
 * @const
 */
View.ABSOLUTE_LAYOUT = 'absolute_layout';

/**
 * Html flow layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.FLOW_LAYOUT
 * @const
 */
View.FLOW_LAYOUT = 'flow_layout';

/********************************************************************
                    Delay constant
*********************************************************************/

/**
 * Feed back remanence in ms before select a item
 * @name vs.ui.View.SELECT_DELAY
 * @const
 */
View.SELECT_DELAY = 150;

/**
 * Feed back remanence in ms  before unselect a item
 * @name vs.ui.View.UNSELECT_DELAY
 * @const
 */
View.UNSELECT_DELAY = 300;

/**
 * Threshold in px  use to unselect a item when pointer move
 * @name vs.ui.View.MOVE_THRESHOLD
 * @const
 */
View.MOVE_THRESHOLD = 20;

/********************************************************************

*********************************************************************/

/**
 * @private
 */
View.NON_G_OBJECT = '_non_g_object';
/**
 * @private
 */
View.ANY_PLACE = 'children';
/**
 * @private
 */
View._positionStyle = undefined;
/**
 * @private
 */
View.__comp_templates = {};

/**
 * @private
 */
View._propagate_pointer_event = function (obj, func_ptr, event)
{
  var event_name = "";
  if (event.type === core.POINTER_START) { event_name = 'POINTER_START'; }
  if (event.type === core.POINTER_END) { event_name = 'POINTER_END'; }
  if (event.type === core.POINTER_MOVE) { event_name = 'POINTER_MOVE'; }

  event.type = event_name;

  func_ptr.call (obj, event);
};

View.prototype = {

  /*****************************************************************
   *                Private members
   ****************************************************************/
  /**
   * @protected
   * @type {boolean}
   */
  _visible: true,

  /**
   * @protected
   * @type {number}
   */
  _magnet: 0,

  /**
   * @private
   * @type {Array.<int>}
   */
  _autosizing: null,

  /**
   * @protected
   * @type {Object}
   */
  _pointerevent_handlers: null,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _enable: true,

  /**
   * @protected
   * @type {Array}
   */
  _pos : null,

  /**
   * Translate value on x
   * @private
   * @type {number}
   */
  __view_t_x : 0,

  /**
   * Translate value on y
   * @private
   * @type {number}
   */
  __view_t_y : 0,

  /**
   * @protected
   * @type {Array}
   */
  _size : null,

   /**
   * Scale value
   * @protected
   * @type {number}
   */
  _scaling : 1,

   /**
   * Rotation value
   * @protected
   * @type {number}
   */
  _rotation : 0,

  /**
   * @protected
   * @type {number}
   */
  _min_scale : 0.5,

  /**
   * @protected
   * @type {number}
   */
  _max_scale : 3,

   /**
   * @protected
   * @type {String}
   */
  _layout: null,

  /**
   * @protected
   * @type {Array.<number>}
   */
  _transform_origin: null,

  /**
   * @protected
   * @type {vs.CSSMatrix}
   */
  _transforms_stack: null,

  /**
   * @protected
   * @type {vs.fx.Animation}
   */
  _show_animation: null,
  __show_clb: null,

  /**
   * @protected
   * @type {vs.fx.Animation}
   */
  _hide_animation: null,
  __hide_clb: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    var key, a, i, child;
    if (this.__parent)
    {
      this.__parent.remove (this);
    }
    for (key in this._children)
    {
      a = this._children [key];
      if (!a) { continue; }

      if (a instanceof Array)
      {
        for (i = 0; i < a.length; i++)
        {
          child = a [i];
          util.free (child);
        }
      }
      else
      { util.free (a); }
      delete (this._children [key]);
    }
    this._children = {};
    delete (this.view);

    this.clearTransformStack ();

    core.EventSource.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    var key, a, i, child;

    for (key in this._children)
    {
      a = this._children [key];
      if (!a) { continue; }

      if (a instanceof Array)
      {
        for (i = 0; i < a.length; i++)
        {
          child = a [i];
          if (!child || !child.refresh) { continue; }
          child.refresh ();
        }
      }
      else if (a.refresh)
      { a.refresh (); }
    }
  },

  /**
   * @name vs.ui.View#_clone
   * @function
   * @private
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  clone : function (config, cloned_map)
  {
    if (!config) { config = {}; }
    if (!config.node) { config.node = this.view.cloneNode (true); }

    return core.EventSource.prototype.clone.call (this, config, cloned_map);
  },

  /**
   * @name vs.ui.View#_clone
   * @function
   * @private
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone : function (obj, cloned_map)
  {
    var anim, a, key, child, l, hole;

    core.EventSource.prototype._clone.call (this, obj, cloned_map);

    // animations clone
    if (this._show_animation)
    {
      anim = cloned_map [this._show_animation._id];
      if (anim)
        obj._show_animation = anim;
      else
        obj._show_animation = this._show_animation.clone ();

      obj.__show_clb = this.__show_clb;
    }
    if (this._hide_animation)
    {
      anim = cloned_map [this._hide_animation._id];
      if (anim)
        obj._hide_animation = anim;
      else
        obj._hide_animation = this._hide_animation.clone ();

      obj.__hide_clb = this.__hide_clb;
    }

    // remove parent link
    obj.__parent = undefined;

//     for (key in this._children)
//     {
//       a = this._children [key];
//       hole = obj._holes [key];
//       if (!a || !hole) { continue; }
//
//       // @WARNING pas completement correct
//      util.removeAllElementChild (hole);

//       if (a instanceof Array)
//       {
//         l = a.length;
//         while (l--)
//         {
//           child = a [l];
//           obj.add (child.clone (null, cloned_map), key);
//         }
//       }
//       else
//       {
//         obj.add (a.clone (null, cloned_map), key);
//       }
//    }
  },

  /**
   * @protected
   * @function
   */
  _getGUInode : function (config)
  {
    var node = this.__getGUInode (config), compName, doc, doc_elem;
    if (node) { return node; }

    var _template = (config.template)?config.template:this.template;
    if (_template)
    {
      var template = new Template (_template);
      var node = template._compile ();
      template._addPropertiesToObject (this);
      return node;
    }

    // 4) no node exists, generate a warning a create a div node.
    if (this.html_template)
    {
      node = Template.parseHTML (this.html_template);
      if (node) return node;
    }
    if (util.isFunction (this.constructor))
    { compName = this.constructor.name; }
    else if (util.isString (this.constructor))
    { compName = this.constructor; }
    else
    { compName = View; }

    console.warn ("Impossible to instance view of component '" + compName + ", id [" + config.id +
      "]. A default one is created");
    node = document.createElement ('div');

    return node;
  },

  /**
   * @protected
   * @function
   */
  __getGUInode : function (config)
  {
    // 1) the node is passed within config object
    if (config.node)// && config.node instanceof HTMLElement)
    {
      return config.node;
    }

    var node = null, node_ref, root_id, root_node, obj, regexp_result;
    // find a direct reference
    if (config.node_id)
    {
      node = document.getElementById (config.node_id);
      if (node) { return node; }
    }

    // 2) find a template node in a view
    node_ref = config.node_ref;
    if (node_ref)
    {
      regexp_result = View._ref_template_reg.exec (node_ref);
      // node ref with the new syntax : ref = root_id'#'node_ref
      if (regexp_result && regexp_result.length == 3)
      {
        root_id = regexp_result [1];
        node_ref = regexp_result [2];
      }
      // old syntax
      else root_id = config.root_ref;

      if (node_ref && root_id)
      {
        root_node = null;
        obj = core.Object._obs [root_id];

        if (obj && obj.view) { root_node = obj.view; }
        else
        {
          root_node = document.getElementById (this.id);
        }
        if (root_node)
        {
          node = _findNodeRef (root_node, node_ref);
        }

        if (node) { return node; }
      }
    }

    // 3) find a template node
    if (config.template_ref)
    {
      node = this._getTemplateNode (config.template_ref);
      if (node) { return node; }
    }

    // last case : find a direct reference with component id
    if (config.id)
    {
      node = document.getElementById (config.id);
      if (node) { return node; }
    }

    return undefined;
  },

  /**
   * @private
   * @function
   */
  _getTemplateNode : function (ref)
  {
    var node =
      document.querySelector (".application_templates ." + ref);
    if (node) { return document.importNode (node, true); }
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    core.EventSource.prototype.initComponent.call (this);

    // position and size : according autosizing rules, can change
    // automaticaly if the parent container is resized
    this._pos = [-1, -1];
    this._size = [-1, -1];
    this._transform_origin = [0, 0];

    // rules for positionning a object
    this._autosizing = [4,4];

    this._holes = {};
    this._children = {};
    this._pointerevent_handlers = [];

    if (!this.__config__) this.__config__ = {};
    this.__config__.id = this.id;

    this.view = this._getGUInode (this.__config__);
    if (!this.view)
    {
      console.error ('vs.ui.View constructor failed. No view!');
      return;
    }

    this.view.id = this._id;
    this.view._comp_ = this;
    this.view.setAttribute ('x-hag-comp', this.id);

    this._parse_view (this.view);
  },

  /**
   * @protected
   * @function
   */
  componentDidInitialize : function ()
  {
    core.EventSource.prototype.componentDidInitialize.call (this);
    if (this._magnet) this.view.style.setProperty ('position', 'fixed', null);

    if (this._magnet === 5)
    {
      this._applyTransformation ();
    }
  },

  /**
   * Notifies that the component's view was added to the DOM.<br/>
   * You can override this method to perform additional tasks
   * associated with presenting the view.<br/>
   * If you override this method, you must call the parent method.
   *
   * @name vs.ui.View#viewDidAdd
   * @function
   */
  viewDidAdd : function ()
  {
    var view = this.view, self = this;
    if (!view || !view.parentElement) return;

    // update the real element size and position
    setTimeout (function () {
      self._size [0] = view.offsetWidth;
      self._size [1] = view.offsetHeight;
      self._pos [0] = view.offsetLeft;
      self._pos [1] = view.offsetTop;
    }, 0);
  },

  /**
   * @protected
   * @function
   */
  notify : function (event) {},

  /**
   * @protected
   * @function
   */
  _parse_view : function (node)
  {
    if (!node || node.nodeType === 3) { return; }

    var hole_attribute, child;

    if (node.attributes !== null)
    {
      hole_attribute = node.attributes.getNamedItem ("x-hag-hole");
      if (hole_attribute)
      {
        this._holes [hole_attribute.nodeValue] = node;
        return; // hole can not include hode
      }
    }

    child = node.firstElementChild;
    while (child)
    {
      this._parse_view (child);
      child = child.nextElementSibling;
    }
  },

  /**
   *  Instantiate, init and add the specified child component to this component.
   *  <p>
   *  The view of the MyGUIComponent is dynamically loaded (from file),
   *  instanciated and  added into the HTML DOM.
   *  <p>
   *  @example
   *  var id =
   *    myObject.createAndAddComponent ('MyGUIComponent', config, 'children');
   *
   * @name vs.ui.View#createAndAddComponent
   * @function
   *
   * @param {String} comp_name The GUI component name to instanciate
   * @param {Object} config Configuration structure need to build the component.
   * @param {String} extension The hole into the vs.ui.View will be insert.
   * @return {vs.core.Object} the created component
   */
  createAndAddComponent : function (comp_name, config, extension)
  {
    // verify the component view already exists
    if (!config) {config = {};}

    if (!config.id) { config.id = core.createId (); }

    var view = this.__getGUInode (config),
      path, data, xmlRequest, div, children, i, len, obj, msg;


    // Find template into the DOM
    if (!view) { view = this._getTemplateNode (comp_name); }

    // Find template into the component prototype
    if (!view)
    {
      if (window [comp_name] && window [comp_name].prototype &&
          window [comp_name].prototype.node_template)
      {
        view = document.importNode
          (window [comp_name].prototype.node_template, true);
      }
    }

    // If no template was found, try to load it
    if (!view)
    {
      path = comp_name + '.xhtml';

      data = View.__comp_templates [path];
      if (!data)
      {
        xmlRequest = new XMLHttpRequest ();
        xmlRequest.open ("GET", path, false);
        xmlRequest.send (null);

        if (xmlRequest.readyState === 4)
        {
          if (xmlRequest.status === 200 || xmlRequest.status === 0)
          {
            data = xmlRequest.responseText;
            View.__comp_templates [path] = data;
          }
          else
          {
            console.error ("Template file for component '" + comp_name + "' unfound.");
            return;
          }
        }
        else
        {
          console.error ("Pb when load the component '" + comp_name + "' template.");
          return;
        }
        xmlRequest = null;
      }

      view = Template.parseHTML (data);
    }
    config.node = view;
    obj = null;

    // Build object
    try { obj = new window [comp_name] (config); }
    catch (exp)
    {
      msg = "Impossible to instanciate comp: " + comp_name;
      msg += " => " + exp.message;
      console.error (msg);
      return;
    }

    // Initialize object
    try
    {
      obj.init ();
      obj.configure (config);
    }
    catch (expBis)
    {
      if (expBis.line && expBis.sourceURL)
      {
        msg = "Error when initiate comp: " + comp_name;
        msg += " => " + expBis.message;
        msg += "\n" + expBis.sourceURL + ":" + expBis.line;
      }
      else { msg = expBis; }
      console.error (msg);
    }

    // Add object to its parent
    this.add (obj, extension);
    obj.refresh ();

    return obj;
  },

  /**
   *  Return true if the set component is a child o the current component
   *
   * @name vs.ui.View#isChild
   * @function
   *
   * @param {vs.core.EventSource} child The component to be removed.
   * @return {boolean}
   */
  isChild : function (child)
  {
    if (!child) { return false; }

    var key, a, hole;

    for (key in this._children)
    {
      a = this._children [key];
      if (!a) { continue; }

      if (a === child || (a instanceof Array && a.indexOf (child) !== -1))
      {
        return true;
      }
    }

    return false;
  },

  /**
   *  Add the specified child component to this component.
   *  <p>
   *  The component can be a graphic component (vs.ui.View) or
   *  a non graphic component (vs.core.EventSource).
   *  In case of vs.ui.View its mandatory to set the extension.
   *  <p>
   *  The add is a lazy add! The child's view can be already in
   *  the HTML DOM. In that case, the add methode do not modify the DOM.
   *  <p>
   *  @example
   *  var myButton = new Button (conf);
   *  myObject.add (myButton, 'children');
   *
   * @name vs.ui.View#add
   * @function
   *
   * @param {vs.core.EventSource} child The component to be added.
   * @param {String} extension [optional] The hole into a vs.ui.View will be
   *       insert.
   */
  add : function (child, extension, view /** hack view */)
  {
    if (!child) { return; }
    if (!view) { view = child.view; }
    else { child.__gui_object__hack_view__ = view; }

    if (this.isChild (child)) { return; }

    var key, a, b, hole;
    if (!view) { key = View.NON_G_OBJECT; }
    // a non graphical object
    else if (!extension) { key = View.ANY_PLACE; }
    else { key = extension; }

    a = this._children [key];
    if (a && util.isArray (a)) { a.push (child); }
    else if (a)
    {
      b = [];
      b.push (a);
      b.push (child);
      this._children [key] = b;
    }
    else { this._children [key] = child; }

    hole = this._holes [key];
    if (view && hole)
    {
      if (view.parentElement)
      {
        if (view.parentElement === hole)
        {
          child.__parent = this;
          if (child.viewDidAdd) child.viewDidAdd ();
          return;
        }
        view.parentElement.removeChild (view);
      }
      hole.appendChild (view);
      child.__parent = this;

      if (child.viewDidAdd) child.viewDidAdd ();
    }
  },

  /**
   *  Remove the specified child component from this component.
   *
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ui.View#remove
   * @function
   *
   * @param {vs.core.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    if (!child) { return; }

    var key, a, hole, view;

    if (child.__gui_object__hack_view__)
    {
      view = child.__gui_object__hack_view__;
    }
    else { view = child.view; }

    if (view)
    {
      for (key in this._children)
      {
        a = this._children [key];
        if (!a) { continue; }

        if (a === child || (a instanceof Array && a.indexOf (child) !== -1))
        {
          if (a instanceof Array) {a.remove (child);}
          else { delete (this._children [key]); }

          hole = this._holes [key];
          if (hole) { hole.removeChild (view); }

          child.__parent = null;
          break;
        }
      }
    }
  },

  /**
   *  Remove all children components from this component and free them.
   *
   *  @example
   *  myObject.removeAllChildren ();
   *
   * @name vs.ui.View#removeAllChild
   * @function
   * @param {String} extension [optional] The hole from witch all views will be
   *   removed
   */
  removeAllChildren : function (extension)
  {
    var key, self = this;

    /** @private */
    function removeChildrenInHole (ext)
    {
      var a, child;

      a = self._children [ext];
      if (!a) { return; }

      if (a instanceof Array)
      {
        while (a.length)
        {
          child = a [0];
          self.remove (child);
          util.free (child);
        }
      }
      else
      {
        self.remove (a);
        util.free (a);
      }
      delete (self._children [ext]);
    };

    if (extension)
    {
      removeChildrenInHole (extension);
    }
    else
    {
      for (key in self._children)
      {
        removeChildrenInHole (key);
      }
      this._children = {};
    }
  },

  /**
   * @protected
   * @function
   */
  findNodeRef : function (ref)
  {
    if (!this.view) { return; }

    return _findNodeRef (this.view, ref);
  },

/********************************************************************
                  GUI Utilities
********************************************************************/
  /**
   *  The event bind method to listen events
   *  <p>
   *  When you want listen an event generated by this object, you can
   *  bind your object (the observer) to this object using 'bind' method.
   *  <p>
   *  Warning:<br>
   *  If you know the process of your callback can take time or can be blocking
   *  you should set delay to 'true' otherwise you application will be stuck.
   *  But be careful this options add an overlay in the event propagation.
   *  For debug purpose or more secure coding you can force delay to true, for
   *  all bind using global variable vs.core.FORCE_EVENT_PROPAGATION_DELAY.<br/>
   *  You just have set as true (vs.core.FORCE_EVENT_PROPAGATION_DELAY = true)
   *  at beginning of your program.
   *
   * @name vs.ui.View#bind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {vs.core.Object} obj the object interested to catch the event
   *    [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   * @param {boolean} delay if true the callback 'func' will be call within
   *        an other "simili thread".
   */
  bind : function (spec, obj, func, delay)
  {
    if (spec === 'POINTER_START' || spec === 'POINTER_END' ||
        spec === 'POINTER_MOVE' || spec === core.POINTER_START ||
        spec === core.POINTER_END || spec === core.POINTER_MOVE)
    {
      if (!this.view) { return; }

      var func_ptr, self = this, handler;
      if (!func) { func = 'notify'; }
      if (util.isFunction (func)) { func_ptr = func; }
      else if (util.isString (func) &&
               util.isFunction (obj [func]))
      {
        func_ptr = obj [func];
      }
      else
      {
        console.error ('Invalid bind arguments.');
        return;
      }

      if (!func_ptr)
      {
        console.warn ('Invalid bind arguments. Unknown func: ' + func);
        return;
      }

      var self = this;
      handler = function (event)
      {
        if (core.EVENT_SUPPORT_TOUCH && event.changedTouches &&
            event.changedTouches.length > 1) { return; }

//        event.stopPropagation ();
//        event.preventDefault ();

        event.src = self;
        if (core.EVENT_SUPPORT_TOUCH && event.changedTouches)
        {
          event.pageX = event.changedTouches[0].pageX;
          event.pageY = event.changedTouches[0].pageY;
          var rec = util.getElementAbsolutePosition (self.view);
          event.offsetX = event.changedTouches[0].pageX - rec.x;
          event.offsetY = event.changedTouches[0].pageY - rec.y;
        }
        View._propagate_pointer_event (obj, func_ptr, event);
      };

      if (spec === 'POINTER_START') { spec = core.POINTER_START; }
      if (spec === 'POINTER_MOVE') { spec = core.POINTER_MOVE; }
      if (spec === 'POINTER_END') { spec = core.POINTER_END; }

      this._pointerevent_handlers [obj.id + spec] = handler;

      vs.addPointerListener (this.view, spec, handler);
    }
    core.EventSource.prototype.bind.call (this, spec, obj, func, delay);
  },

  /**
   *  The event unbind method
   *  <p>
   *  Should be call when you want stop event listening on this object
   *
   * @name vs.ui.View#unbind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {vs.core.Object} obj the object you want unbind [mandatory]
   */
  unbind : function (spec, obj)
  {
    if (!spec || !obj) { return; }
    if (spec === core.POINTER_START || spec === core.POINTER_END ||
        spec === core.POINTER_MOVE)
    {
      var handler = this._pointerevent_handlers [obj.id + spec];
      if (!handler || !this.view) { return; }

      vs.removePointerListener (this.view, core.POINTER_END, handler);
    }
    core.EventSource.prototype.unbind.call (this, spec, obj);
  },

/********************************************************************
                  GUI Utilities
********************************************************************/

  /**
   * @protected
   * @function
   */
  _setMagnet : function (code)
  {
    if (!util.isNumber (code) || code < 0 || code > 5) return;

    this._magnet = code;
    if (this._magnet)
    {  this.view.style.setProperty ('position', 'absolute', null); }
    else
    {  this.view.style.removeProperty ('position'); }

    this._updateSizeAndPos ();
  },

  /**
   * @protected
   * @function
   */
  _updateSizeAndPos : function ()
  {
    this._updateSize ();
    this._updatePos ();
  },

  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    var pos = this._pos, size = this._size, width, height, pWidth, pHeight,
      aH = this._autosizing [0], aV = this._autosizing [1], sPosB = 'auto', sPosR = 'auto', view = this.view, parentElement, style;

    if (!view) { return; }

    parentElement = view.parentElement;
    if (parentElement)
    {
      pWidth = parentElement.offsetWidth;
      pHeight = parentElement.offsetHeight;
    }

    if (aH === 4 || aH === 1) { width = size[0] + 'px'; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0)
    {
      if (pWidth)
      {
//        width = Math.round (size[0] / pWidth * 100) + '%';
        width = (size[0] / pWidth * 100) + '%';
      }
      else { width = size[0] + 'px'; }
    }

    else { width = '100%'; }

    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (pos[0] + size [0]) + 'px';
    }


    if (aV === 4 || aV === 1) { height = size[1] + 'px'; }
    else if (aV === 5 || aV === 7) { height = 'auto'; }
    else if (aV === 2 || aV === 3 || aV === 6 || aV === 0)
    {
      if (pHeight)
      {
//        height = Math.round (size[1] / pHeight * 100) + '%';
        height = (size[1] / pHeight * 100) + '%';
      }
      else { height = size[1] + 'px'; }
    }
    else { height = '100%'; }

    if (aV === 1 || aV === 3 || aV === 5 || aV === 7)
    {
      sPosB = pHeight - (pos[1] + size [1]) + 'px';
    }

    if (this._magnet === 2) sPosB = '0px';
    if (this._magnet === 4) sPosR = '0px';

    style = view.style;
    style.width = width;
    style.height = height;
    style.right = sPosR;
    style.bottom = sPosB;
  },

  /**
   * @protected
   * @function
   */
  _updatePos : function ()
  {
    var
      x = this._pos [0], y = this._pos [1],
      w = this._size [0], h = this._size [1],
      pWidth = 0, pHeight = 0,
      sPosL = 'auto', sPosT = 'auto', sPosR = 'auto', sPosB = 'auto',
      aH = this._autosizing [0], aV = this._autosizing [1],
      view = this.view, parentElement, style;

    if (!view) { return; }

    parentElement = view.parentElement;

    if (parentElement)
    {
      pWidth = parentElement.offsetWidth;
      pHeight = parentElement.offsetHeight;
    }

    if (this._magnet === 1) y = 0;
    if (this._magnet === 3) x = 0;

    if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || (aH === 2 && !pWidth))
    { sPosL = x + 'px'; }
    else if ((aH === 2 || aH === 0) && pWidth)
//    { sPosL = Math.round (x / pWidth * 100) + '%'; }
    { sPosL = (x / pWidth * 100) + '%'; }

    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (x + w) + 'px';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight))
    { sPosT = y + 'px'; }
    else if ((aV === 2 || aV === 0) && pHeight)
//    { sPosT = Math.round (y / pHeight * 100) + '%'; }
    { sPosT = (y / pHeight * 100) + '%'; }

    if (aV === 1 || aV === 3 || aV === 5 || aV === 7)
    {
      sPosB = pHeight - (y + h) + 'px';
    }

    if (this._magnet === 2) { sPosT = 'auto'; sPosB = '0px'; }
    if (this._magnet === 4) { sPosL = 'auto'; sPosR = '0px'; }

    if (this._magnet === 5) {
      sPosT = '50%'; sPosB = 'auto';
      sPosL = '50%'; sPosR = 'auto';
    }
    this._applyTransformation ();

    style = view.style;
    style.left = sPosL;
    style.top = sPosT;
    style.right = sPosR;
    style.bottom = sPosB;
  },

  /**
   *  Returns the border value of the GUI View.
   *
   *  @example
   *  myObject.getBorder ('top');
   *  // -> 5
   *
   * @name vs.ui.View#getBorder
   * @function
   *
   * @param {String} type the border pos (top | left | bottom | right)
   * @return {Integer} value the border value
   */
  getBorder : function (type)
  {
    if (!this.view) { return 0; }
//     var style = this.getStyle ('border-' + type + '-style');
//
//     if (style && style !== 'none' && style !== 'hidden' &&
//       this.getStyle  ('border-' + type + '-width'))
    {
      var value = this.getComputedStyle ('border-' + type + '-width');
      if (value) { return parseInt (value, 10); }
    }
    return 0;
  },

  /**
   *  Returns the padding value of the GUI View.
   *
   *  @example
   *  myObject.getPadding ('top');
   *  // -> 5
   *
   * @name vs.ui.View#getPadding
   * @function
   *
   * @param {String} type the padding pos (top | left | bottom | right)
   * @return {Integer} value the padding value
   */
  getPadding : function (type)
  {
    if (!this.view) { return 0; }
    var value = this.getComputedStyle ('padding-' + type);
    if (!value) { return 0; }
    return parseInt (value, 10);
  },

  /**
   *  Returns the margin value of the GUI View.
   *
   *  @example
   *  myObject.getMargin ('top');
   *  // -> 5
   *
   * @name vs.ui.View#getMargin
   * @function
   *
   * @param {String} type the margin pos (top | left | bottom | right)
   * @return {Integer} value the margin value
   */
  getMargin : function (type)
  {
    if (!this.view) { return 0; }
    var value = this.getComputedStyle ('margin-' + type);
    if (!value) { return 0; }
    return parseInt (value, 10);
  },

/********************************************************************
 CSS manipulation
********************************************************************/

  /**
   *  Returns the given CSS property value the vs.ui.View view.
   *  <p>
   *  This method looks up the CSS property of the vs.ui.View view whether
   *  it was applied inline or in a stylesheet.
   *
   *  @example
   *  myObject.getStyle ('color');
   *  // -> 'red'
   *
   * @name vs.ui.View#getStyle
   * @function
   *
   * @param {String} property the property name
   * @return {String} value the property value or null if
   */
  getStyle : function (property)
  {
    if (!this.view) { return undefined; }
    var css = this.view.style, value, _view;
    if (css) { value = css [property]; }

    if (property === 'opacity') { return value ? parseFloat (value) : 1.0; }
    return value === 'auto' ? null : value;
  },

  /**
   *  Returns the given CSS property computed value the vs.ui.View view.
   *  <p>
   *  This method looks up the CSS property of the vs.ui.View view whether
   *  it was applied inline or in a stylesheet.
   *
   *  @example
   *  myObject.getComputedStyle ('border-left-width');
   *  // -> '5px'
   *
   * @name vs.ui.View#getComputedStyle
   * @function
   *
   * @param {String} property the property name
   * @return {String} value the property value or null if
   */
  getComputedStyle : function (property)
  {
    var css = this._getComputedStyle (this.view);
    return value = css ? css [property] : null;
  },

  /**
   * @private
   * @function
   * @parent {DivHTMLElement} elem the element to get style
   * @return the computed CCS if it exists
   */
  _getComputedStyle : function (elem)
  {
    if (!elem) { elem = this.view; }
    if (!elem) { return undefined; }

    var doc = elem.ownerDocument;
    if (!doc || !doc.defaultView) { doc = document; }
    if (!doc || !doc.defaultView) { return undefined;}

    return doc.defaultView.getComputedStyle (elem, null);
  },

  /**
   *  Modifies vs.ui.View view CSS style property.
   *  <p>
   *  The method change the css inline style of the vs.ui.View view. Then
   *  it preempts css style defined in CSS stylesheets.
   *  @see vs.ui.View#addCssRules
   *  @see vs.ui.View#addCssRule if you want to
   *  modify CSS rules.
   *
   *  @example
   *  myObject.setStyle ('color', 'red');
   *
   * @name vs.ui.View#setStyle
   * @function
   *
   * @param {String} property the property name
   * @param {String} value the property value
   */
  setStyle : function (property, value)
  {
    if (!property) { return; }
//    if (!this.view || !(this.view instanceof HTMLElement)) { return; }
    if (!this.view || !this.view.style ||
        !this.view.style.removeProperty || !this.view.style.setProperty)
    { return; }

    if (typeof value === 'undefined')
    { this.view.style.removeProperty (property); }
    else
    {
      if (util.isNumber (value)) value = '' + value; // IE need string
      this.view.style.setProperty (property, value, null);
    }
  },

  /**
   *  Modifies vs.ui.View view CSS style properties.Styles are passed as a hash
   *  of property-value pairs in which the properties are specified in their
   *  camelized form.
   *  <p>
   *  The method change the css inline style of the vs.ui.View view. Then
   *  it preempts css style defined in CSS stylesheets.
   *  @see vs.ui.View#addCssRules
   *  @see vs.ui.View#addCssRule if you want to
   *  modify CSS rules.
   *
   *  @example
   *  myObject.setStyle ('color', 'red');
   *
   * @name vs.ui.View#setStyles
   * @function
   *
   * @param {Object} style The style to modify
   */
  setStyles : function (style)
  {
    if (!style) { return; }
//    if (!this.view || !(this.view instanceof HTMLElement)) { return; }
    if (!this.view || !this.view.style)
    { return; }

    util.setElementStyle (this.view, style);
  },

  /**
   *  Add new CSS rules related to this component.
   *
   *  @example
   *  myObject.addCssRules ('.classname1', ['color: red', 'margin: 0px']);
   *  <=> to
   *  vs.util.addCssRules ('#' + myObject.id + ' .classname1', ['color: red', 'margin: 0px']);
   *
   * @name vs.ui.View#addCssRules
   * @function
   *
   * @param {String} selector CSS Selector
   * @param {Array} rules the array of rules
   */
  addCssRules : function (selector, rules)
  {
    util.addCssRules ('#' + this._id + ' ' + selector, rules);
  },

  /**
   *  Add new CSS rule related to this component.
   *
   *  @example
   *  myObject.addCssRule ('.classname1', 'color: red');
   *  <=> to
   *  vs.util.addCssRule ('#' + myObject.id + ' .classname1', 'color: red');
   *
   * @name vs.ui.View#addCssRule
   * @function
   *
   * @param {String} selector CSS Selector
   * @param {String} rule the rule using the following format:
   *   "prop_name: value"
   */
  addCssRule : function (selector, rule)
  {
    util.addCssRule ('#' + this._id + ' ' + selector, rule);
  },

/********************************************************************

********************************************************************/

  /**
   *  Force the redraw of your widget.
   *  <p>
   *  Some time a redraw is required to force the browser to rerender
   *  a part of you GUI or the entire GUI.
   *  Call redraw function on you Application object for a entire redraw or just
   *  on a specific widget.
   *
   * @name vs.ui.View#redraw
   * @function
   *
   * @param {Function} clb Optional function to call after the redraw
   */
  redraw : function (clb)
  {
    if (!this.view) { return; }
    var n = this.view, display = n.style.display, self = this;

    n.style.display = 'none';
    setTimeout (function()
    {
      if (display)
      { n.style.display = display; }
      else
      { n.style.removeProperty ('display'); }

      setTimeout (function()
      {
        self.refresh ();
        if (clb && clb instanceof Function) clb.call (self);
      }, 0);
    }, 0);
  },

  /**
   *  Displays the GUI Object
   *
   * @name vs.ui.View#show
   * @function
   */
  show : function ()
  {
    if (!this.view) { return; }
    if (this._visible) { return; }

    if (this.__view_display)
    {
      this.view.style.display = this.__view_display;
    }
    else
    {
      this.view.style.removeProperty ('display');
    }
    this.__view_display = undefined;

    if (this._show_animation)
    {
      this._show_animation.process (this, this._show_object, this);
    }
    else
    {
      this._show_object ();
    }
  },

  /**
   *  Show the GUI Object
   *
   * @private
   * @function
   */
  _show_object : function ()
  {
    if (!this.view) { return; }

    this._visible = true;
    var self = this;

    this.propertyChange ();
    if (this.__show_clb)
    {
      if (this._show_animation)
      { this.__show_clb.call (this); }
      else
      {
        setTimeout (function () {self.__show_clb.call (self);}, 0);
      }
    }
  },

  /**
   *  Set the animation used when the view will be shown.
   *  <br/>
   * Options :
   * <ul>
   *   <li /> duration: animation duration for all properties
   *   <li /> timing: animation timing for all properties
   *   <li /> origin: Specifies the number of times an animation iterates.
   *   <li /> iterationCount: Sets the origin for the transformations
   *   <li /> delay: The time to begin executing an animation after it
   *          is applied
   * </ul>
   *
   *  Ex:
   *  @example
   *  myComp.setShowAnimation ([['translate', '100px'], ['opacity', '0']]);
   *
   *  @example
   *  myAnim = new ABTranslateAnimation (50, 50);
   *  myComp.setShowAnimation (myAnim);
   *
   * @name vs.ui.View#setShowAnimation
   *
   * @param animations {Array|vs.fx.Animation} array of animation <property,
   *        value>, or an vs.fx.Animation object
   * @param options {Object} list of animation options
   * @param clb {Function} the method to call when the animation end
   * @return {String} return the identifier of the animation process. You can
   *       use it to stop the animation.
   */
  setShowAnimation:function (animations, options, clb)
  {
    if (typeof animations === "undefined" || animations === null)
    {
      this._show_animation = null;
    }
    else
    {
      if (animations.constructor === vs.fx.Animation)
      {
        this._show_animation = animations.clone ();
      }
      else if (util.isArray (animations))
      {
        this._show_animation = new vs.fx.Animation ();
        this._show_animation.setAnimations (animations);
      }
      else
      {
        console.warn ('vs.ui.View.setShowAnimation invalid parameters!');
        return;
      }
      if (options)
      {
        if (options.duration)
        { this._show_animation.duration = options.duration; }
        if (options.timing)
        { this._show_animation.timing = options.timing; }
        if (options.origin)
        { this._show_animation.origin = options.origin; }
        if (options.iterationCount)
        { this._show_animation.iterationCount = options.iterationCount; }
        if (options.delay)
        { this._show_animation.delay = options.delay; }
      }
    }
    if (util.isFunction (clb)) { this.__show_clb = clb; }
    else { this.__show_clb = clb; }
  },

  /**
   *  Hides the GUI Object
   *
   * @name vs.ui.View#hide
   * @function
   */
  hide : function ()
  {
    if (!this.view) { return; }
    if (!this._visible) { return; }

    if (this._hide_animation)
    {
      this._hide_animation.process (this, this._hide_object, this);
    }
    else
    {
      this._hide_object ();
    }
  },

  /**
   *  Hides the GUI Object
   *
   * @private
   * @function
   */
  _hide_object: function ()
  {
    if (!this.view) { return; }

    this._visible = false;

    if (this.view.style.display)
    {
      this.__view_display = this.view.style.display;
      if (this.__view_display === 'none')
      { this.__view_display = undefined; }
    }
    else
    {
      this.__view_display = undefined;
    }
    this.view.style.display = 'none'
    if (this.__hide_clb)
    {
      this.__hide_clb.call (this);
    }
    this.propertyChange ();
//    util.setElementVisibility (this.view, false);
  },

  /**
   *  Set the animation used when the view will be hidden.
   * <br/>
   * Options :
   * <ul>
   *   <li /> duration: animation duration for all properties
   *   <li /> timing: animation timing for all properties
   *   <li /> origin: Specifies the number of times an animation iterates.
   *   <li /> iterationCount: Sets the origin for the transformations
   *   <li /> delay: The time to begin executing an animation after it
   *          is applied
   * </ul>
   *
   *  Ex:
   *  @example
   *  myComp.setHideAnimation ([['translate', '100px'], ['opacity', '0']]);
   *
   *  @example
   *  myAnim = new ABTranslateAnimation (50, 50);
   *  myComp.setHideAnimation (myAnim, t);
   *
   * @name vs.ui.View#setHideAnimation
   *
   * @param animations {Array|vs.fx.Animation} array of animation <property,
   *        value>, or an vs.fx.Animation object
   * @param options {Object} list of animation options
   * @param clb {Function} the method to call when the animation end
   * @return {String} return the identifier of the animation process. You can
   *       use it to stop the animation.
   */
  setHideAnimation: function (animations, options, clb)
  {
    if (typeof animations === "undefined" || animations === null)
    {
      this._hide_animation = null;
     }
    else
    {
      if (animations.constructor === vs.fx.Animation)
      {
        this._hide_animation = animations.clone ();
      }
      else if (util.isArray (animations))
      {
        this._hide_animation = new vs.fx.Animation ();
        this._hide_animation.setAnimations (animations);
      }
      else
      {
        console.warn ('vs.ui.View.setHideAnimation invalid parameters!');
        return;
      }
      if (options)
      {
        if (options.duration)
        { this._hide_animation.duration = options.duration; }
        if (options.timing)
        { this._hide_animation.timing = options.timing; }
        if (options.origin)
        { this._hide_animation.origin = options.origin; }
        if (options.iterationCount)
        { this._hide_animation.iterationCount = options.iterationCount; }
        if (options.delay)
        { this._hide_animation.delay = options.delay; }
      }
    }
    if (util.isFunction (clb)) { this.__hide_clb = clb; }
    else { this.__hide_clb = clb; }
  },

/********************************************************************
                  state management
********************************************************************/

  /**
   *  Set the visibility of the vs.ui.View.
   *
   *  <p>
   *  @example
   *  myObject.setVisible (false);
   *
   * @name vs.ui.View#setVisible
   * @function
   *
   * @param {Boolean} visibility The visibility can be 'true' or 'false'.
   */
  setVisible: function (visibility)
  {
    if (!this.view) { return; }

    util.setElementVisibility (this.view, visibility);
  },

/********************************************************************

********************************************************************/
  /**
   *  Checks whether the vs.ui.View view has the given CSS className.
   *
   *  <p>
   *  @example
   *  myObject.hasClassName ('selected');
   *  // -> true | false
   *
   * @name vs.ui.View#hasClassName
   * @function
   *
   * @param {String} className the className to check
   * @return {Boolean} true if the view has the given className
   */
  hasClassName: function (className)
  {
    if (!this.view) { return false; }

    return util.hasClassName (this.view, className);
  },

  /**
   *  Adds a CSS classname to vs.ui.View view.
   *
   *  <p>
   *  @example
   *  myObject.addClassName ('selected');
   *  myObject.addClassName ('selected', 'small');
   *
   * @name vs.ui.View#addClassName
   * @function
   *
   * @param {String} className the className to add
   */
  addClassName: function ()
  {
    if (!this.view) { return; }

    var args = Array.prototype.slice.call (arguments);
    args.unshift (this.view);
    util.addClassName.apply (this.view, args);
  },

  /**
   *  Removes CSS className
   *
   *  <p>
   *  @example
   *  myObject.removeClassName ('selected');
   *  myObject.removeClassName ('selected', 'small');
   *
   * @name vs.ui.View#removeClassName
   * @function
   *
   * @param {String} className the className to add
   */
  removeClassName: function (className)
  {
    if (!this.view) { return; }

    var args = Array.prototype.slice.call (arguments);
    args.unshift (this.view);
    util.removeClassName.apply (this.view, args);
  },

  /**
   *  Toggle CSS className
   *
   *  <p>
   *  @example
   *  myObject.toggleClassName ('selected');
   *
   * @name vs.ui.View#toggleClassName
   * @function
   *
   * @param {String} className the className to add/remove
   */
  toggleClassName: function (className)
  {
    if (!this.view || !util.isString (className)) { return; }

    util.toggleClassName (this.view, className);
  },

/********************************************************************

********************************************************************/

  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    this._propagateToParent (e);
  },

  /**
   * @protected
   * @function
   */
  _propagateToParent : function (e)
  {
    if (this._bubbling && this.__parent && this.__parent.handleEvent)
    {
      this.__parent.handleEvent (e);
    }
  },

  /**
   * @name vs.ui.View#notifyToParent
   * @function
   */
  notifyToParent : function (e)
  {
    if (!this.__parent) { return; }
    if (this.__parent.handleEvent)
    {
      this.__parent.handleEvent (e);
    }
    else if (this.__parent.notify)
    {
      this.__parent.notify (e);
    }
  },

  /**
   * Did enable delegate
   * @name vs.ui.View#_didEnable
   * @protected
   */
   _didEnable : function () {},

  /*****************************************************************
   *                Animation methods
   ****************************************************************/

  /**
   *  Animate the component view.
   *
   *  Ex:
   *  @example
   *  myComp.animate ([['translate', '100px,0,0'], ['opacity', '0']]);
   *
   *  @example
   *  myAnim = new ABTranslateAnimation (50, 50);
   *  myComp.animate (myAnim); //<=> myAnim.process (myAnim);
   *
   * Options :
   * <ul>
   *   <li /> duration: animation duration for all properties
   *   <li /> timing: animation timing for all properties
   *   <li /> origin: Specifies the number of times an animation iterates.
   *   <li /> iterationCount: Sets the origin for the transformations
   *   <li /> delay: The time to begin executing an animation after it
   *          is applied
   * </ul>
   *
   * @name vs.ui.View#animate
   * @function
   *
   * @param animations {Array|vs.fx.Animation} array of animation
   *     <property, value>, or an vs.fx.Animation object
   * @param options {Object} list of animation options
   * @param clb {Function} the method to call when the animation end
   * @return {String} return the identifier of the animation process. You can
   *       use it to stop the animation.
   */
  animate: function (animations, options, clb)
  {
    var anim;
    if (animations instanceof vs.fx.Animation)
    {
      anim = animations
    }
    else if (util.isArray (animations))
    {
      var anim = new vs.fx.Animation ();
      anim.setAnimations (animations);
    }
    else
    {
      console.warn ('vs.ui.View.animate invalid parameters!');
      return;
    }
    if (options)
    {
      if (options.duration) { anim.duration = options.duration; }
      if (options.timing) { anim.timing = options.timing; }
      if (options.origin) { anim.origin = options.origin; }
      if (options.iterationCount)
      { anim.iterationCount = options.iterationCount; }
      if (options.delay) { anim.delay = options.delay; }
    }
    return anim.process (this, clb, this);
  },

  /*****************************************************************
   *                Transformation methods
   ****************************************************************/

  /**
   *  Move the view in x, y.
   *
   * @name vs.ui.View#translate
   * @function
   *
   * @param x {int} translation over the x axis
   * @param y {int} translation over the y axis
   */
  translate: function (x, y)
  {
    if (this.__view_t_x === x && this.__view_t_y === y) { return; }

    this.__view_t_x = x;
    this.__view_t_y = y;

    this._applyTransformation ();
  },

  /**
   *  Rotate the view about the horizontal and vertical axes.
   *  <p/>The angle units is radians.
   *
   * @name vs.ui.View#rotate
   * @function
   *
   * @param r {float} rotion angle
   */
  rotate: function (r)
  {
    if (this._rotation === r) { return; }

    this._rotation = r;

    this._applyTransformation ();
  },

  /**
   *  Scale the view
   *  <p/>The scale is limited by a max and min scale value.
   *
   * @name vs.ui.View#scale
   * @function
   *
   * @param s {float} scale value
   */
  scale: function (s)
  {
    if (s > this._max_scale) { s = this._max_scale; }
    if (s < this._min_scale) { s = this._min_scale; }
    if (this._scaling === s) { return; }

    this._scaling = s;

    this._applyTransformation ();
  },

  /**
   *  Define a new transformation matrix, using the transformation origin
   *  set as parameter.
   * @public
   * @function
   *
   * @param {Object} origin is a object reference a x and y position
   */
  setNewTransformOrigin : function (origin)
  {
    if (!origin) { return; }
    if (!util.isNumber (origin.x) || !util.isNumber (origin.y)) { return; }

    // Save current transform into a matrix
    var matrix = new vs.CSSMatrix ();
    matrix = matrix.translate
      (this._transform_origin [0], this._transform_origin [1], 0);
    matrix = matrix.translate (this.__view_t_x, this.__view_t_y, 0);
    matrix = matrix.rotate (0, 0, this._rotation);
    matrix = matrix.scale (this._scaling, this._scaling, 1);
    matrix = matrix.translate
      (-this._transform_origin [0], -this._transform_origin [1], 0);

    if (!this._transforms_stack) this._transforms_stack = matrix;
    {
      this._transforms_stack = matrix.multiply (this._transforms_stack);
      delete (matrix);
    }

    // Init a new transform space
    this.__view_t_x = 0;
    this.__view_t_y = 0;
    this._scaling = 1;
    this._rotation = 0;

    this._transform_origin = [origin.x, origin.y];
  },

  /**
   * Push a new transformation matrix into your component transformation
   * stack.
   *
   * @public
   * @function
   *
   * @param {vs.CSSMatrix} matrix the matrix you want to add
   */
  pushNewTransform : function (matrix)
  {
    if (!matrix) { return; }

    if (!this._transforms_stack) this._transforms_stack = matrix;
    else
    {
      this._transforms_stack = matrix.multiply (this._transforms_stack);
    }
  },

  /**
   *  Remove all previous transformations set for this view
   * @public
   * @function
   */
  clearTransformStack : function ()
  {
    if (this._transforms_stack) delete (this._transforms_stack);
    this._transforms_stack = undefined;
  },

  /**
   *  Return the current transform matrix apply to this graphic Object.
   * @public
   * @function
   * @return {vs.CSSMatrix} the current transform matrix
   */
  getCTM: function ()
  {
    var matrix = new vs.CSSMatrix (), transform, matrix_tmp;

    // apply current transformation
    matrix = matrix.translate (this._transform_origin [0], this._transform_origin [1], 0);
    matrix = matrix.translate (this.__view_t_x, this.__view_t_y, 0);
    matrix = matrix.rotate (0, 0, this._rotation);
    matrix = matrix.scale (this._scaling, this._scaling, 1);
    matrix = matrix.translate (-this._transform_origin [0], -this._transform_origin [1], 0);


    // apply previous transformations and return the matrix
    if (this._transforms_stack) return matrix.multiply (this._transforms_stack);
    else return matrix;
  },

  /**
   *  Returns the current transform combination matrix generate by the
   *  hierarchical parents of this graphic Object.
   *  Its returns the multiplication of the parent's CTM and parent of parent's
   *  CTM etc.
   *  If the component has no parent it returns the identity matrix.
   * @public
   * @function
   * @return {vs.CSSMatrix} the current transform matrix
   */
  getParentCTM: function ()
  {

    function multiplyParentTCM (parent)
    {
      // no parent return identity matrix
      if (!parent) return new vs.CSSMatrix ();
      // apply parent transformation matrix recurcively
      return multiplyParentTCM (parent.__parent).multiply (parent.getCTM ());
    }

    return multiplyParentTCM (this.__parent);
  },

  /**
   * @protected
   * @function
   */
  _applyTransformation: function ()
  {
    var
      matrix = this.getCTM (),
      transform = matrix.toString ();

    if (this._magnet === 5)
    {
      transform += " translate(-50%,-50%)";
    }

    setElementTransform (this.view, transform);
    delete (matrix);
  }
};
util.extendClass (View, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (View, {

  'size': {
    /**
     * Getter|Setter for size. Gives access to the size of the GUI Object
     * @name vs.ui.View#size
     *
     * @type {Array.<number>}
     */
    set : function (v)
    {
      if (!v) { return; }
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }

      this._size [0] = v [0];
      this._size [1] = v [1];

      if (!this.view) { return; }
      this._updateSize ();
    },

    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      var view = this.view;
      if (view && view.parentElement)
      {
        this._size [0] = view.offsetWidth;
        this._size [1] = view.offsetHeight;
      }
      return this._size.slice ();
    }
  },
  'position': {
    /**
     * Getter|Setter for position. Gives access to the position of the GUI
     * Object
     * @name vs.ui.View#position
     *
     * @type Array
     */
    set : function (v)
    {
      if (!v) { return; }
      if (!util.isArray (v) || v.length != 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }

      this._pos [0] = v [0];
      this._pos [1] = v [1];

      if (!this.view) { return; }
      this._updatePos ();
    },

    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      var view = this.view;
      if (view && view.parentElement)
      {
        this._pos [0] = view.offsetLeft;
        this._pos [1] = view.offsetTop;
      }
      return this._pos.slice ();
    }
  },
  'autosizing': {

    /**
     * Set size and position behavior according parent size.
     * @name vs.ui.View#autosizing
     *
     * @type Array
     */
    set : function (v)
    {
      if (!v) { return; }
      if (!util.isArray (v) || v.length != 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }

      this._autosizing [0] = v [0];
      this._autosizing [1] = v [1];

      if (!this.view) { return; }
      this._updateSizeAndPos ();
    }
  },
  'magnet': {

    /**
     * Set magnet
     * @name vs.ui.View#magnet
     *
     * @type Number
     */
    set : function (code)
    {
      this._setMagnet (code);
    }
  },
  'visible': {

    /**
     * Hide or show the object.
     * obj.visible = true <=> obj.show (), obj.visible = false <=> obj.hide (),
     * @name vs.ui.View#visible
     * @type {boolean}
     */
    set : function (v)
    {
      if (v)
      { this.show (); }
      else
      { this.hide (); }
    },

    /**
     * @ignore
     * Return true is the object is visible. False otherwise.
     * @type {boolean}
     */
    get : function ()
    {
      return this._visible;
    }
  },
  'bubbling': {

    /**
     * Allow pointer event bubbling between views (by default set to false)
     * @name vs.ui.View#bubbling
     * @type boolean
     */
    set : function (v)
    {
      if (v) { this._bubbling = true; }
      else { this._bubbling = false; }
    }
  },
  'enable': {

    /**
     * Activate or deactivate a view.
     * @name vs.ui.View#enable
     * @type {boolean}
     */
    set : function (v)
    {
      if (v && !this._enable)
      {
        this._enable = true;
        this.removeClassName ('disabled');
        this._didEnable ();
      }
      else if (!v && this._enable)
      {
        this._enable = false;
        this.addClassName ('disabled');
        this._didEnable ();
      }
    },

    /**
     * @ignore
     * @return {boolean}
     */
    get : function ()
    {
      return this._enable;
    }
  },
  'translation': {

    /**
     * Translation vector [tx, ty]
     * <=> obj.translate (tx, ty)
     * @name vs.ui.View#translation
     * @type {Array}
     */
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) { return };
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return };

      this.translate (v[0], v[1]);
    },

    /**
     * @ignore
     * @type {Array}
     */
    get : function ()
    {
      return [this.__view_t_x, this.__view_t_y];
    }
  },
  'rotation': {

    /**
     * Rotation angle in degre
     * @name vs.ui.View#rotation
     * @type {float}
     */
    set : function (v)
    {
      if (!util.isNumber (v)) { return };
      this.rotate (v);
    },

    /**
     * @ignore
     * @type {float}
     */
    get : function ()
    {
      return this._rotation;
    }
  },
  'scaling': {

    /**
     * Scale the view
     * @name vs.ui.View#scaling
     * @type {float}
     */
    set : function (v)
    {
      if (!util.isNumber (v)) { return };
      this.scale (v);
    },

    /**
     * @ignore
     * @type {float}
     */
    get : function ()
    {
      return this._scaling;
    }
  },
  'minScale': {

    /**
     * Set the minimun scale value (default value is 0.5)
     * @name vs.ui.View#minScale
     * @type {float}
     */
    set : function (v)
    {
      if (!util.isNumber (v)) { return };
      this._min_scale = v;
    },

    /**
     * @ignore
     * @type {float}
     */
    get : function ()
    {
      return this._min_scale;
    }
  },
  'maxScale': {

    /**
     * Set the maximum scale value (default value is 3)
     * @name vs.ui.View#maxScale
     * @type {float}
     */
    set : function (v)
    {
      if (!util.isNumber (v)) { return };
      this._max_scale = v;
    },

    /**
     * @ignore
     * @type {float}
     */
    get : function ()
    {
      return this._max_scale;
    }
  },
  'transformOrigin': {

    /**
     * This property allows you to specify the origin of the 2D transformations.
     * Values are pourcentage of the view size.
     * <p>
     * The property is set by default to [50, 50], which is the center of
     * the view.
     * @name vs.ui.View#transformOrigin
     * @type Array.<number>
     */
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }

      this._transform_origin [0] = v [0];
      this._transform_origin [1] = v [1];

//      var origin_str = this._transform_origin [0] + '% ';
//      origin_str += this._transform_origin [1] + '%';
//      this.view.style ['-webkit-transform-origin'] = origin_str;
    },

    /**
     * @ignore
     * @return {Array}
     */
    get : function ()
    {
      return this._transform_origin.slice ();
    }
  },
  'showAnimmation': {

    /**
     * Set the Animation when the view is shown
     * @name vs.ui.View#showAnimmation
     * @type {vs.fx.Animation}
     */
    set : function (v)
    {
      this.setShowAnimation (v);
    }
  },
  'hideAnimation': {

    /**
     * Set the Animation when the view is hidden
     * @name vs.ui.View#hideAnimation
     * @type {vs.fx.Animation}
     */
    set : function (v)
    {
      this.setHideAnimation (v);
    }
  },
  'layout': {

    /**
     * This property allows you to specify a layout for the children
     * <p>
     * <ul>
     *    <li /> vs.ui.View.DEFAULT_LAYOUT
     *    <li /> vs.ui.View.HORIZONTAL_LAYOUT
     *    <li /> vs.ui.View.VERTICAL_LAYOUT
     *    <li /> vs.ui.View.ABSOLUTE_LAYOUT
     *    <li /> vs.ui.View.FLOW_LAYOUT
     * </ul>
     * @name vs.ui.View#layout
     * @type String
     */
    set : function (v)
    {
      if (v !== View.HORIZONTAL_LAYOUT &&
          v !== View.DEFAULT_LAYOUT &&
          v !== View.ABSOLUTE_LAYOUT &&
          v !== View.VERTICAL_LAYOUT &&
          v !== View.FLOW_LAYOUT && v)
      {
        console.error ("Unsupported layout '" + v + "'!");
        return;
      }

      if (this._layout)
      {
        this.removeClassName (this._layout);
      }
      this._layout = v;
      if (this._layout)
      {
        this.addClassName (this._layout);
      }
    },
  }
});

View._ref_template_reg = /(\w+)#(\w+)/;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.View = View;
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

/** @preserve

  The code include code from :
  
  Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
  Released under MIT license
  http://cubiq.org/dropbox/mit-license.txt
  Version 3.4.5 - Last updated: 2010.07.04
*/

/**
 * @private
 * @name Scrollbar
 */
function Scrollbar (dir, wrapper, fade, shrink)
{
	this.dir = dir;
	this.fade = fade;
	this.shrink = shrink;
	this.id = core.createId ();

	// Create main scrollbar
	this.bar = document.createElement ('div');

	var size, ctx;
	this.bar.className = 'scrollbar ' + dir;

	// Create scrollbar wrapper
	this.wrapper = document.createElement ('div');
	this.wrapper.className = 'wrapper_scrollbar ' + dir;

	this.wrapper.style.position = 'absolute';
	this.wrapper.style ['-webkit-mask'] = '-webkit-canvas(' + this.id + ')';
	this.wrapper.style ['-webkit-transition-duration'] = fade ? '300ms' : '0';

	// Add scrollbar to the DOM
	this.wrapper.appendChild (this.bar);
	
	wrapper.appendChild (this.wrapper);
	
	if (this.dir === 'horizontal')
	{
		size = this.wrapper.offsetWidth;
		ctx = document.getCSSCanvasContext ("2d", this.id, size, 5);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath ();
		ctx.arc (2.5, 2.5, 2.5, Math.PI/2, -Math.PI/2, false);
		ctx.lineTo (size-2.5, 0);
		ctx.arc (size-2.5, 2.5, 2.5, -Math.PI/2, Math.PI/2, false);
		ctx.closePath ();
		ctx.fill ();
	} 
	else
	{
		size = this.wrapper.offsetHeight;
		ctx = document.getCSSCanvasContext ("2d", this.id, 5, size);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.arc (2.5, 2.5, 2.5, Math.PI, 0, false);
		ctx.lineTo (5, size-2.5);
		ctx.arc (2.5, size-2.5, 2.5, 0, Math.PI, false);
		ctx.closePath();
		ctx.fill();
	}
}

Scrollbar.prototype = {

	init: function (scroll, size)
	{
		this.maxSize = this.dir === 'horizontal' ? this.wrapper.clientWidth : this.wrapper.clientHeight;
		this.size = Math.round(this.maxSize * this.maxSize / size);
		this.maxScroll = this.maxSize - this.size;
		this.toWrapperProp = this.maxScroll / (scroll - size);
		this.bar.style[this.dir === 'horizontal' ? 'width' : 'height'] = this.size + 'px';
	},
	
	setPosition: function (pos)
	{
		pos = this.toWrapperProp * pos;
		
		if (pos < 0)
		{
			pos = this.shrink ? pos + pos * 3 : 0;
			if (this.size + pos < 5)
			{
				pos = -this.size + 5;
			}
		}
		else if (pos > this.maxScroll)
		{
			pos = this.shrink ? pos + (pos-this.maxScroll)*3 : this.maxScroll;
			if (this.size + this.maxScroll - pos < 5) {
				pos = this.size + this.maxScroll - 5;
			}
		}

    if (SUPPORT_3D_TRANSFORM)
      pos = this.dir === 'horizontal' ? 'translate3d(' + Math.round(pos) + 'px,0,0)' : 'translate3d(0,' + Math.round(pos) + 'px,0)';
    else
      pos = this.dir === 'horizontal' ? 'translate(' + Math.round(pos) + 'px,0)' : 'translate(0,' + Math.round(pos) + 'px)';
		
    setElementTransform (this.bar, pos);
  },

	show: function ()
	{
		this.wrapper.style.webkitTransitionDelay = '0';
		this.wrapper.style.opacity = '1';
	},

	hide: function ()
	{
		this.wrapper.style.webkitTransitionDelay = '200ms';
		this.wrapper.style.opacity = '0';
	},
	
	remove: function ()
	{
		this.wrapper.parentNode.removeChild (this.wrapper);
		return null;
	}
};/**
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
 *  All application inherit from Application class.<br/>
 *  This is the root component from which all other components (widgets, ...)
 *  are dependent on.
 *  @class
 *  All application inherit from Application class. <br/>
 *  This is the root component from which all other components (widgets, ...)
 *  are dependent on.
 *  <p>
 *  The class offers you a set of usefull method for laoding
 *  Javascript or CSS, know the current GUI orientation...
 *  <p>
 *  You should not create your own Application instante, because it is
 *  automatically generated by ViniSketch Designer.
 *
 *  @author David Thevenin
 *
 *  @extends vs.ui.View
 * @name vs.ui.Application
 *  @constructor
 *  Main constructor
 *
 * @param {string} type the event type [optional]
*/
var Application = function (config)
{
  this._layout = undefined;
  
  this.parent = View;
  this.parent (config);
  this.constructor = Application;
};

/**
 * @private
 */
var Application_applications = {};

var ORIENTATION_CHANGE_EVT =
  'onorientationchange' in window ? 'orientationchange' : 'resize';

vs.Application_applications = Application_applications;

Application.prototype = {
  
  /*****************************************************************
   *                Private members
   ****************************************************************/

  /**
   * @protected
   * @type {boolean}
   */
  _prevent_scroll : true,

  /*****************************************************************
   *
   ****************************************************************/
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    Application_applications [this.id] = this;

    View.prototype.initComponent.call (this);
    this.preventScroll = true;

    this.html = this.view;
    this.html._comp_ = undefined;
    
    this.view = this.body = this.html.querySelector ('body');
    if (!this.view)
    {
      console.error ("Invalid Application view");
      return;
    }
    this.view._comp_ = this;

    this.html.removeAttribute ('id');
    this.html.removeAttribute ('x-hag-ref');
    this.html.removeAttribute ('x-hag-comp');
        
    this.view.setAttribute ('id', this.id);
    this.view.setAttribute ('x-hag-ref', this.id);
    this.view.setAttribute ('x-hag-comp', this.id);
  
    var self = this;
    document.addEventListener ('orientationChanged', function (e)
    {
      var pid = window.deviceConfiguration.setOrientation (e.orientation);
      if (pid) { self.propagate ('deviceChanged', pid, null, true); }
    });
    
    window.addEventListener (ORIENTATION_CHANGE_EVT, function (e)
    {
      var orientation = 0;
      if (window.orientation) orientation = window.orientation;
      else if (window.outerWidth > window.outerHeight) orientation = 90;
      else orientation = 0;

      if (orientation === window.deviceConfiguration.getOrientation ()) return;
      
      var pid = window.deviceConfiguration.setOrientation (orientation);
      if (pid) { self.propagate ('deviceChanged', pid, null, true); }
    });
  },
  
  /**
   * Exit and terminate the application.
   * @name vs.ui.Application#exit 
   * @function
   */
  exit : function ()
  {
    Application.exit ()
  },
  
  /**
   * @protected
   * @name vs.ui.Application#applicationStarted 
   * @function
   */
  applicationStarted : function ()
  { },
  
  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    this.view.style.width = this._size[0] + 'px';;
    this.view.style.height = this._size[1] + 'px';;
    this.view.style.right = 'auto';
    this.view.style.bottom = 'auto';
  },
  
  /**
   * @protected
   * @function
   */
  _updatePos : function ()
  {
    this.view.style.left = this._pos[0] + 'px';
    this.view.style.top = this._pos[1] + 'px';
    this.view.style.right = 'auto';
    this.view.style.bottom = 'auto';
  },
  
  /**
   * Sets the active stylesheet for the HTML document according to
   * the specified pid.
   *
   * @private
   *
   * @name vs.ui.Application#setActiveStyleSheet 
   * @function
   * @param {string} title
   */
  setActiveStyleSheet : function (pid)
  {
    Application.setActiveStyleSheet (pid);
    this.propagate ('deviceChanged', pid, null, true);
  },
  
  /**
   * @protected
   *
   * @name vs.ui.Application#orientationWillChange 
   * @function
   * @param {number} orientation = {0, 180, -90, 90}
   */
  orientationWillChange: function (orientation)
  { },
    
  /**
   *  Dynamically load a script into your application.
   *  <p/>
   *  When the download is completed, the event 'scriptloaded' is fired. <br/>
   *  If a error occurs, nothing happend, then you have to manage by
   *  your own possible error load.
   *  <p/>
   *  The callback function will receive as parameter a event like that:<br/>
   *  {type: 'scriptloaded', data: path}
   *  <p/>
   *  @example
   *  myApp.bind ('scriptloaded', ...);
   *  myApp.loadScript ("resources/other.css");
   *
   * @name vs.ui.Application#loadScript 
   * @function
   * @param {string} path the script url [mandatory]
   */
  loadScript : function (path)
  {
    var self = this, endScriptLoad = function (path)
    {
      var i, l, data, ab_event;
      if (!path) { return; }
      
      self.propagate ('scriptloaded', path);
    };
    
    util.importFile (path, document, endScriptLoad, "js");
  },
  
  /**
   *  Dynamically load a CSS into your application.
   *
   *  When the download is completed, the event 'cssloaded' is fired <br/>
   *  If a error occurs, nothing happend, then you have to manage by
   *  your own possible error load.
   *  <p/>
   *  The callback function will receive as parameter a event like that:<br/>
   *  {type: 'cssloaded', data: path}
   *
   *  @example
   *  myApp.bind ('cssloaded', ...);
   *  myApp.loadCSS ("resources/other.css");
   *
   * @name vs.ui.Application#loadCSS 
   * @function
   *
   * @param {string} path the css url [mandatory]
   */
  loadCSS : function (path)
  {
    var self = this, endCssLoad = function (path)
    {
      var i, l, data, ab_event;
      if (!path) { return; }
      
      self.propagate ('cssloaded', path);
    };

    util.importFile (path, document, endCssLoad, "css");
  }  
};
util.extendClass (Application, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Application, {
  'size': {
    /** 
     * Getter|Setter for size.<br/>
     * Gives access to the size of the Application
     * @name vs.ui.Application#size 
     *
     * @type {Array.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; }
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      this._size [0] = v [0];
      this._size [1] = v [1];
      
      if (!this.view) { return; }
      this._updateSize ();
      
      window.resizeTo (this._size [0], this._size [1]);
    },
    
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (this.view && this.view.parentNode)
      {
        this._size [0] = this.view.offsetWidth;
        this._size [1] = this.view.offsetHeight;
      }
      return this._size.slice ();
    }
  },
  'preventScroll': {
    /** 
     * Getter|Setter for page scrolling cancel.<br/>
     * Set to true to cancel scrolling behavior and false to have the
     * normal behavior.<br/>
     * By default, the property is set to true.
     * 
     * @name vs.ui.Application#preventScroll 
     *
     * @type {boolean}
     */ 
    set : function (pScroll)
    {
      if (pScroll)
      {
        this._prevent_scroll = true;
        document.preventScroll = pScroll;
      }
      else
      {
        this._prevent_scroll = false;
        document.preventScroll = pScroll;
      }
    },
  
    /**
     * @ignore
     * @type {boolean}
     */
    get : function ()
    {
      this._prevent_scroll = document.preventScroll;
      return this.__prevent_scroll;
    }
  }
});

/**
 * Exit and terminate the application.
 * @name vs.ui.Application.exit 
 */
Application.exit = function ()
{
  if (window.close)
  {
    window.close ();
  }
}

/**
 * @name vs.ui.Application.configureDevice 
 */
Application.configureDevice = function ()
{
  window.deviceConfiguration.setDeviceId (Application_default_device);
  window.deviceConfiguration.setOrientation (window.orientation || 0, true);
}

/**
 * Returns the current GUI orientation.
 * <p/>
 * Be careful this API does not return the device orientation, which can be
 * deferent from the GUI orientation.
 * <p/>
 * Use the orientation module to have access to the device orientation.
 *
 * @name vs.ui.Application.getOrientation 
 * 
 * @return {integer} returns a integer include in [-90, 0, 90, 180];
 * @public
 */
Application.getOrientation = function ()
{
  return window.deviceConfiguration.getOrientation ();
};

/**
 * @potected
 */
Application.start = function ()
{
  var key, obj;
  for (key in Application_applications)
  {
    obj = Application_applications [key];
    obj.propertyChange ();
    obj.applicationStarted ();
    setTimeout (function () {obj.refresh ();}, 0);
  }
};

/**
 * @private
 * @depretacted
 */
Application.sendStart = function ()
{
  console.log ("Application.sendStart is deprecated. Please use Application.start");
  Application.start ();
};

/**
 *  Preload an array of GUI HTML templates.
 *  <p>
 *  When the developer uses createAndAddComponent method, the system will
 *  load the HTML GUI template associated to the component to create.
 *  This process can take times.<br>
 *  In order to minimize the latency, this class method allows to preload all 
 *  data related to a component.<br>
 *  This method should ne call when the application start.
 * 
 *  @example
 *  app.preloadTemplates (['GUICompOne', 'GUICompTwo']);
 * 
 * 
 * @name vs.ui.Application.preloadTemplates 
 * @param {Array.<String>} templates array of components names   
 */
Application.preloadTemplates = function (templates)
{
  for (var i = 0; i < templates.length; i++)
  {
    util.preloadTemplate (templates[i]);
  }
};

/**
 * @private
 */
var ImagePreloader = function (images)
{
  // for each image, call preload()
  for (var i = 0; i < images.length; i++ )
  {
    this.preload (images[i]);
  }
}
window.ImagePreloader = ImagePreloader;

/**
 * @private
 */
ImagePreloader.__image_path = {};

/**
 * @private
 */
ImagePreloader.prototype.preload = function (image)
{
  if (ImagePreloader.__image_path [image]) { return; }
  (new Image ()).src = image;
  ImagePreloader.__image_path [image] = true;
};

function preventBehavior (e)
{
//  window.scrollTo (0, 0);

  if (e.type == "touchstart" &&
      (e.target.tagName == "INPUT" ||
       e.target.tagName == "input" ||
       e.target.tagName == "TEXTAREA" ||
       e.target.tagName == "textarea"))
  {
    // on android do not cancel event otherwise the keyboard does not appear
    return;
  }

  e.preventDefault (); 
  return false;
};

/**
 *
 *
 * @name vs.ui.Application#mainViewVisibility 
 */
Application.prototype.mainViewVisibility = function (v)
{
};

/**
 *
 * @name vs.ui.Application#setImageBackground 
 */
Application.prototype.setImageBackground = function (path, name, type)
{
}

/**
 *
 * @name vs.ui.Application#loadingStart 
 */
Application.prototype.loadingStart = function (text)
{
};

/**
 *
 * @name vs.ui.Application#loadingStop 
 */
Application.prototype.loadingStop = function (v)
{
};

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Application = Application;
/*
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
 *  The vs.ui.SplitView class
 *
 *  @extends vs.ui.View
 *  @class
 *  vs.ui.SplitView presents two views. According the screen orientation
 *  the two views are renders vertically (landscape mode) or the views
 *  are splited to optimize screen size. In Portrait mode, the first view
 *  his hidden from the splitview and draws on a PopOver View.
 *
 *  <p>
 *  Delegates:
 *  <ul>
 *    <li/>willHideView : function (vs.ui.View the view, vs.ui.PopOver popOver)
 *    <li/>willShowView : function (vs.ui.View the view, vs.ui.PopOver popOver)
 *  </ul>
 *  <p>
 *  <p>
 *  @example
 *  var splitView = new vs.ui.SplitView ();
 *  splitView.init ();
 *
 *  splitView.delegate = this;
 *  splitView.createAndAddComponent ('ManuPanel');
 *  splitView.createAndAddComponent ('MainPanel');
 *
 *  ...
 *
 *  willShowView : function (view, popOver)
 *  {
 *    this._popOver = null;
 *    ...
 *  },
 *  
 *  willHideView : function (view, popOver)
 *  {
 *    this._popOver = popOver;
 *    ...
 *  }
 *  
 *  @author David Thevenin
 * @name vs.ui.SplitView
 *
 *  @constructor
 *   Creates a new vs.ui.SplitView.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
var SplitView = vs.core.createClass ({

  parent: vs.ui.View,

  properties: {
    "delegate": {
      /** 
       * Set the delegate.
       * It should implements following methods
       *  <ul>
       *    <li/>viewWillStartZooming : function (vs.ui.ScrollView the view)
       *    <li/>viewDidEndZooming : function (vs.ui.ScrollView the view, number scale)
       *  </ul>
       * @name vs.ui.SplitView#delegate 
       * @type {Object}
       */ 
      set : function (v)
      {
        this._delegate = v;
      }
    },
  
    "mode": {
      /** 
       * Set/get the split view mode (MOBILE, TABLET)
       * @name vs.ui.SplitView#mode 
       * @type {String}
       */ 
      set : function (v)
      {
        if (v !== SplitView.TABLET_MODE && v !== SplitView.MOBILE_MODE)
          return;
      
        this.removeClassName (this._mode);
        this._mode = v;
        this.addClassName (this._mode);
        if (this._orientation === SplitView.VERTICAL) this._set_orientation (0);
        else this._set_orientation (90);
      },
      
      get : function ()
      {
        return this._mode;
      }
    },
  
    "hideMainPanelButton": {
      /** 
       * Set the XXX
       * @name vs.ui.SplitView#hideMainPanelButton 
       * @type {vs.ui.View}
       */ 
      set : function (v)
      {
        this._hide_main_panel_button = v;
        if (this._mode == SplitView.TABLET_MODE)
        {
          this._hide_main_panel_button.hide ();
        }
        this._hide_main_panel_button.bind ('select', this);
      }
    },
  
    "showPopOverButton": {
      /** 
       * Set the XXX
       * @name vs.ui.SplitView#showPopOverButton 
       * @type {vs.ui.View}
       */ 
      set : function (v)
      {
        this._show_pop_over_button = v;
        if (this._mode == SplitView.MOBILE_MODE)
        {
          this._show_pop_over_button.hide ();
        }
        this._show_pop_over_button.bind ('select', this);
      }
    },
  
    "secondPanelPosition": {
      /** 
       * Set the navigation panel position (LEFT, RIGHT, TOP, BOTTOM)
       * @name vs.ui.SplitView#secondPanelPosition 
       * @type {String}
       */ 
      set : function (v)
      {
        if (v !== SplitView.LEFT && v !== SplitView.RIGHT &&
            v !== SplitView.TOP && v !== SplitView.BOTTOM)
          return;
      
        this.removeClassName (this._second_panel_position);
        this._second_panel_position = v;
        this.addClassName (this._second_panel_position);
      }
    },
  
    "orientation": {
      /** 
       * Set/get the split view mode (MOBILE, TABLET)
       * @name vs.ui.SplitView#mode 
       * @type {String}
       */ 
      set : function (v)
      {
        if (v !== SplitView.VERTICAL && v !== SplitView.HORIZONTAL)
          return;
      
        this.removeClassName (this._orientation);
        this._orientation = v;
        this.addClassName (this._orientation);
        if (v === SplitView.VERTICAL) this._set_orientation (0);
        else this._set_orientation (90);
      },
      
      /**
      */
      get : function (v)
      {
        return this._orientation;
      }
    },
  },

  /*****************************************************************
   *                Private members
   ****************************************************************/
   
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

   /**
   * @protected
   * @type {String}
   */
  _mode: '',

   /**
   * @protected
   * @type {String}
   */
  _second_panel_position: '',

   /**
   * @protected
   * @type {String}
   */
  _orientation: '',

   /**
   * @private
   * @type {Array}
   */
  _split_views: null,
  
   /**
   * @private
   * @type {number}
   */
  _fisrt_view_width: 320,

   /**
   * @private
   * @type {number}
   */
  _pop_over_border_width: 8,
  
   /**
   * @private
   * @type {vs.ui.PopOver}
   */
  _pop_over: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  constructor: function (config)
  {
    this._super (config);

    this._left_views = new Array ();
    this._pop_over = new PopOver ();
  },

  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    this._super ();
    this._pop_over.init ();

    this._pop_over.hide ();
    document.body.appendChild (this._pop_over.view);

    if (this._mode) this.mode = this._mode;
    else this.mode = SplitView.TABLET_MODE;
    
    if (this._orientation) this.orientation = this._orientation;
    else
    {
      var orientation = window.deviceConfiguration.getOrientation ();

      if (orientation === 0 || orientation === 180)
        this.orientation = SplitView.VERTICAL;
      else
        this.orientation = SplitView.HORIZONTAL; 
    }
    
    if (this._second_panel_position) this.secondPanelPosition = this._second_panel_position;
    else this.secondPanelPosition = SplitView.LEFT;
  },

  /**
   * Add the child view to this component.
   * <p>
   * Only two views can be added.
   *
   * @name vs.ui.SplitView#add 
   * @function
   * @param {vs.ui.EventSource} child The component to be added.
   */
  add : function (child, hole)
  {
    if (hole === 'second_panel') this._left_views.push (child);
    else
    {
      this._super (child, 'main_panel');
      return;
    }
    
    if (this._mode === SplitView.MOBILE || this._orientation === SplitView.HORIZONTAL)
    {
      this._super (child, 'second_panel');
    }
    else
    {
      this._pop_over.add (child);
    }
  },
    
  /**
   * Remove all children components from this component and free them.
   * 
   * @name vs.ui.SplitView#removeAllChildren 
   * @function
   * @example
   * myObject.removeAllChildren ();
   */
  removeAllChildren : function ()
  {
    var key, a, child;
  
    for (key in this._children)
    {
      a = this._children [key];
      if (!a) { continue; }
      
      if (a instanceof Array)
      {
        while (a.length)
        {
          child = a [0];
          this.remove (child);
          util.free (child);
        }
      }
      else
      {
        this.remove (a);
        util.free (a);
      }
      delete (this._children [key]);
    }
    this._children = {};
  },

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    this._super ();
    if (this._pop_over.visible) this._pop_over.refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  orientationWillChange : function (orientation)
  {
    if (orientation === 90 || orientation === -90)
      this.orientation = SplitView.HORIZONTAL;
    else
      this.orientation = SplitView.VERTICAL; 
  },
  
  /**
   * @protected
   * @function
   */
  _set_orientation : function (orientation)
  {
    var size = this.size, child, orientation;
    
    child = this._left_views [0];
    if (child)
    {
      if (this._mode === SplitView.MOBILE_MODE ||
          orientation === 90 || orientation === -90)
      {
        this._pop_over.hide ();
        if (this._pop_over.isChild (child))
        {
          this._pop_over.remove (child);
        }
        
        if (!this.isChild (child))
        {
          View.prototype.add.call (this, child, 'second_panel');
        }
        child.show (child.refresh);
        
        if (this._delegate && this._delegate.willShowView)
        {
          this._delegate.willShowView (child, this._pop_over);
        }
        if (this._show_pop_over_button) this._show_pop_over_button.hide ();
      }
      else
      {
        if (this.isChild (child))
        {
          View.prototype.remove.call (this, child);
        }
        if (!this._pop_over.isChild (child))
        {
          this._pop_over.add (child);
        }
        child.show ();
        this._pop_over.size =
          [this._fisrt_view_width + 2 * this._pop_over_border_width, 500];
        
         if (this._show_pop_over_button) this._show_pop_over_button.show ();
         
       if (this._delegate && this._delegate.willShowView)
        {
          this._delegate.willHideView (child, this._pop_over);
        }
      }
    }
  },
  
  /**
   * @protected
   * @function
   */
  orientationDidChange : function (orientation)
  {
    this.refresh ();
  },
  
  /**
   * @function
   */
  showPopOver : function (pos, direction)
  {
    if (this._mode !== SplitView.TABLET_MODE ||
        this._orientation !== SplitView.VERTICAL) return;

    this._pop_over.show (pos, direction);
    this._pop_over.refresh ();
  },
  
  /**
   * @function
   */
  hidePopOver : function ()
  {
    this._pop_over.hide ();
  },
  
  /**
   * @function
   */
  showMainView : function (instant)
  {
    var self = this;
    if (this._mode !== SplitView.MOBILE_MODE) return;

    if (this._hide_main_panel_button) this._hide_main_panel_button.show ();
    
    if (instant) {
      self.addClassName ('main_view_visible');
      return;
    }
    setTimeout (
      function () { self.addClassName ('main_view_visible'); },
      View.UNSELECT_DELAY
    );
  },
  
  /**
   * @function
   */
  hideMainView : function ()
  {
    if (this._mode !== SplitView.MOBILE_MODE) return;
    
    if (this._hide_main_panel_button) this._hide_main_panel_button.hide ();

    this.removeClassName ('main_view_visible');
  },
  
  notify : function (e) {
    var self = this;
    
    if (e.type == 'select' && e.src == this._hide_main_panel_button) {
      this.hideMainView ();
    }
    if (e.type == 'select' && e.src == this._show_pop_over_button) {
      this.showPopOver ([20, 20]);
    }
  }
});

/********************************************************************
                  Define class properties
********************************************************************/

SplitView.TABLET_MODE = 'tablet';
SplitView.MOBILE_MODE = 'mobile';
SplitView.VERTICAL = 'vertical';
SplitView.HORIZONTAL = 'horizontal';

SplitView.RIGHT = 'right';
SplitView.LEFT = 'left';
SplitView.BOTTOM = 'bottom';
SplitView.TOP = 'top';

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.SplitView = SplitView;
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

  Copyright (c) 2010 Matteo Spinelli, http://cubiq.org/
  Released under MIT license
  http://cubiq.org/dropbox/mit-license.txt
*/

/**
 * @private
 */
var iScroll_prototype =
{
  currPageX: 0, currPageY: 0,
  pagesX: [], pagesY: [],
  offsetBottom: 0,
  offsetTop: 0,
  contentReady: true,
  
  /**
   * @protected
   * @function
   */
  _activate_scroll : function (wrapper, scroller, options)
  {
    var that = this, doc = document, div, i;
  
    that.wrapper = wrapper;
    that.wrapper.style.overflow = 'hidden';
    that.scroller = scroller;
    
    if (!util.isNumber (that.wrapper._ab_view_s))
    { that.wrapper._ab_view_s = 1; }
  
    // Default options
    that.options =
    {
      hScroll: true,
      vScroll: true,
      hScrollbar: true,
      vScrollbar: true,
      fixedScrollbar: false,
      fadeScrollbar: (has3d) || !core.EVENT_SUPPORT_TOUCH,
      hideScrollbar: true,
      scrollbarClass: '',
      bounce: has3d,
      bounceLock: false,
      momentum: has3d,
      lockDirection: true,
      snap: false,
      onScrollStart: null,
      onScrollEnd: null,
      checkDOMChange: false   // Experimental
    };
  
    // User defined options
    for (i in options) {
      that.options[i] = options[i];
    }
      
    that.scroller.style.cssText += '-webkit-transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);-webkit-transition-duration:0;';
  
    that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
    that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
    
    that._scroll_refresh ();
  
    that._bind (RESIZE_EV, window);
    that._bind (core.POINTER_START);
  
    if (!core.EVENT_SUPPORT_TOUCH) {
      that._bind('mousewheel');
    }
    
    if (that.options.checkDOMChange) {
      that.DOMChangeInterval = setInterval(function () { that._check_scroll_size(); }, 250);
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scrollbar_init : function (dir)
  {
    var that = this, doc = document, bar = that[dir + 'ScrollbarWrapper'];

    if (!that[dir + 'Scrollbar'])
    {
      if (bar)
      {
        // Should free some mem
        setElementTransform (that[dir + 'ScrollbarIndicator'], "");
        bar.parentNode.removeChild(bar);
        delete (that[dir + 'ScrollbarWrapper']);
        that[dir + 'ScrollbarIndicator'] = null;
      }

      return;
    }

    if (!bar)
    {
      // Create the scrollbar wrapper
      bar = doc.createElement('div');
      if (that.options.scrollbarClass)
      {
        bar.className = that.options.scrollbarClass + dir.toUpperCase();
      }
      else
      {
        bar.style.cssText = 'position:absolute;z-index:100;' + (dir === 'h' ? 'height:7px;bottom:1px;left:2px;right:7px' : 'width:7px;bottom:7px;top:2px;right:1px');
      }
      bar.style.cssText += 'pointer-events:none;-webkit-transition-property:opacity;-webkit-transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

      that.wrapper.appendChild (bar);
      that[dir + 'ScrollbarWrapper'] = bar;

      // Create the scrollbar indicator
      bar = doc.createElement('div');
      if (!that.options.scrollbarClass)
      {
        bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);-webkit-background-clip:padding-box;-webkit-box-sizing:border-box;' + (dir === 'h' ? 'height:100%;-webkit-border-radius:4px 3px;' : 'width:100%;-webkit-border-radius:3px 4px;');
      }
      bar.style.cssText += 'pointer-events:none;-webkit-transition-property:-webkit-transform;-webkit-transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);-webkit-transition-duration:0;-webkit-transform:' + trnOpen + '0,0' + trnClose;

      that[dir + 'ScrollbarWrapper'].appendChild(bar);
      that[dir + 'ScrollbarIndicator'] = bar;
    }

    if (dir === 'h')
    {
      that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
      that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
      that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
      that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
      that.hScrollbarProp =
        Math.abs (that.hScrollbarMaxScroll / that.maxScrollX);
    }
    else
    {
      that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
      that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
      that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
      that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
      that.vScrollbarProp = 
        Math.abs (that.vScrollbarMaxScroll / that.maxScrollY);
    }

    // Reset position
    that._scroll_indicator_pos (dir, true);
  },
  
//  _resize: function ()
//  {
//    var that = this;
// 
//    //if (that.options.momentum) that._unbind('webkitTransitionEnd');
// 
//    setTimeout(function () {
//      that._scroll_refresh();
//    }, 0);
//  },
  
  /**
   * @protected
   * @function
   */
  _check_scroll_size: function ()
  {
    var that = this,
      scrollerW,
      scrollerH;

    if (that.moved || !that.contentReady) return;

    scrollerW = m.round(that.scroller.offsetWidth * that._ab_view_s),
    scrollerH = m.round((that.scroller.offsetHeight - that.offsetBottom - that.offsetTop) * that._ab_view_s);

    if (scrollerW === that.scrollerW && scrollerH === that.scrollerH)
    { return; }

    that._scroll_refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pos: function (x, y)
  {
    var that = this;

    that._ab_view_t_x = that.hScroll ? x : 0;
    that._ab_view_t_y = that.vScroll ? y : 0;

    that._applyInsideTransformation2D ();

    that._scroll_indicator_pos ('h');
    that._scroll_indicator_pos ('v');
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_indicator_pos: function (dir, hidden)
  {
    var that = this, pos, bar, rectS, rectP;
    
    if (!that[dir + 'Scrollbar']) return;
    
    bar = that[dir + 'ScrollbarWrapper'];
    
    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);
    pos = dir === 'h' ? rectP.left - rectS.left : rectP.top - rectS.top;
    pos = that[dir + 'ScrollbarProp'] * pos;

    if (pos < 0)
    {
      pos = that.options.fixedScrollbar ? 0 : pos + pos*3;
      if (that[dir + 'ScrollbarIndicatorSize'] + pos < 9) pos = -that[dir + 'ScrollbarIndicatorSize'] + 8;
    }
    else if (pos > that[dir + 'ScrollbarMaxScroll'])
    {
      pos = that.options.fixedScrollbar ? that[dir + 'ScrollbarMaxScroll'] : pos + (pos - that[dir + 'ScrollbarMaxScroll'])*3;
      if (that[dir + 'ScrollbarIndicatorSize'] + that[dir + 'ScrollbarMaxScroll'] - pos < 9) pos = that[dir + 'ScrollbarIndicatorSize'] + that[dir + 'ScrollbarMaxScroll'] - 8;
    }
    bar.style.webkitTransitionDelay = '0';
    bar.style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
    setElementTransform (that[dir + 'ScrollbarIndicator'], trnOpen + (dir === 'h' ? pos + 'px,0' : '0,' + pos + 'px') + trnClose);
  },

  /**
   * @protected
   * @function
   */
  _scroll_transition_time: function (time)
  {
    var that = this;
    
    time += 'ms';
    if (that.hScrollbar)
    {
      that.hScrollbarIndicator.style.webkitTransitionDuration = time;
    }
    if (that.vScrollbar)
    {
      that.vScrollbarIndicator.style.webkitTransitionDuration = time;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pointer_start: function (e, keepDefault)
  {
    if (core.EVENT_SUPPORT_TOUCH && e.changedTouches.length > 1)
    { return; }

    var that = this,
      point = core.EVENT_SUPPORT_TOUCH ? e.changedTouches[0] : e,
      matrix;

    that.moved = false;

    if (!keepDefault)
    {
      e.preventDefault ();
      e.stopPropagation ();
    }

    that.moved = false;
    that.distX = 0;
    that.distY = 0;
    that.absDistX = 0;
    that.absDistY = 0;
    that.dirX = 0;
    that.dirY = 0;
    that.returnTime = 0;
    
    that.animationDuration = 0;
    
    if (that.options.momentum)
    {
      if (that.scrollInterval)
      {
        clearInterval (that.scrollInterval);
        that.scrollInterval = null;
      }

      if (SUPPORT_3D_TRANSFORM)
      {
        matrix = new WebKitCSSMatrix (getElementTransform (that.scroller));
        if (matrix.m41 !== that._ab_view_t_x || matrix.m42 !== that._ab_view_t_y) {
          that._unbind ('webkitTransitionEnd');
          that._scroll_pos (matrix.m41, matrix.m42);
        }
      }
    }

    that.scroller.style.webkitTransitionTimingFunction = 
      'cubic-bezier(0.33,0.66,0.66,1)';
    if (that.hScrollbar)
    {
      that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 
        'cubic-bezier(0.33,0.66,0.66,1)';
    }
    if (that.vScrollbar) 
    {
      that.vScrollbarIndicator.style.webkitTransitionTimingFunction = 
        'cubic-bezier(0.33,0.66,0.66,1)';
    }
    that.startX = that._ab_view_t_x;
    that.startY = that._ab_view_t_y;
    that.pointX = point.pageX;
    that.pointY = point.pageY;
    
    that.startTime = e.timeStamp;

    if (that.options.onScrollStart)
    {
      that.options.onScrollStart.call(that);
    }

    // Registering/unregistering of events is done to preserve resources on 
    that._bind (core.POINTER_MOVE, document);
    that._bind (core.POINTER_END, document);
    that._bind (core.POINTER_CANCEL, document);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pointer_move: function (e, keepDefault)
  {
    if (core.EVENT_SUPPORT_TOUCH && e.changedTouches.length > 1)
    { return; }

    var that = this,
      point = core.EVENT_SUPPORT_TOUCH ? e.changedTouches[0] : e,
      deltaX = point.pageX - that.pointX,
      deltaY = point.pageY - that.pointY,
      newX, newY, rectS, rectP;

    if (!keepDefault)
    {
      e.preventDefault ();
      e.stopPropagation ();
    }

    that.pointX = point.pageX;
    that.pointY = point.pageY;
    
    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);
    
    newX = rectS.left + deltaX;
    newY = rectS.top + deltaY;

    // Slow down if outside of the boundaries
    if (newX > rectP.left || rectS.right + deltaX < rectP.right)
    {
      newX = that.options.bounce ? that._ab_view_t_x + (deltaX / 2.4) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
      newX = that.options.bounce ? that._ab_view_t_x + (deltaX / 2.4) : newX >= rectP.left || that.maxScrollX >= 0 ? that._ab_view_t_x : that._ab_view_t_x;
    }
    else
    {
      newX = that._ab_view_t_x + deltaX;
    }
    if (newY > rectP.top || rectS.bottom + deltaY < rectP.bottom)
    { 
      newY = that.options.bounce ? that._ab_view_t_y + (deltaY / 2.4) : newY >= rectP.top || that.maxScrollY >= 0 ? that._ab_view_t_y : that._ab_view_t_y;
    }
    else
    {
      newY = that._ab_view_t_y + deltaY;
    }

    if (that.absDistX < 4 && that.absDistY < 4)
    {
      that.distX += deltaX;
      that.distY += deltaY;
      that.absDistX = m.abs (that.distX);
      that.absDistY = m.abs (that.distY);
      return;
    }
    
    // Lock direction
    if (that.options.lockDirection)
    {
      if (that.absDistX > that.absDistY + 3)
      {
        newY = that._ab_view_t_y;
        deltaY = 0;
      }
      else if (that.absDistY > that.absDistX + 3)
      {
        newX = that._ab_view_t_x;
        deltaX = 0;
      }
    }
    
    that.moved = true;
    that._scroll_pos (newX, newY);
    that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
    that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

    if (e.timeStamp - that.startTime > 300)
    {
      that.startTime = e.timeStamp;
      that.startX = that._ab_view_t_x;
      that.startY = that._ab_view_t_y;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pointer_end: function (e, keepDefault)
  {
    if (core.EVENT_SUPPORT_TOUCH && e.touches.length !== 0)
    { return; }

    if (!keepDefault)
    {
      e.preventDefault ();
      e.stopPropagation ();
    }

    var that = this,
      point = core.EVENT_SUPPORT_TOUCH ? e.changedTouches[0] : e,
      target, ev,
      momentumX = { dist:0, time:0 },
      momentumY = { dist:0, time:0 },
      duration = e.timeStamp - that.startTime,
      newPosX = that._ab_view_t_x, newPosY = that._ab_view_t_y,
      newDuration,
      snap, rectS, rectP;

    that._unbind (core.POINTER_MOVE, document);
    that._unbind (core.POINTER_END, document);
    that._unbind (core.POINTER_CANCEL, document);

    if (duration < 300 && that.options.momentum)
    {
      var maxDistUpper = that._ab_view_t_x + 500;
      var maxDistLower = that._ab_view_t_x + 500;
      
      rectS = util.getBoundingClientRect (that.scroller);
      rectP = util.getBoundingClientRect (that.wrapper);
      momentumX =
        that._scroll_momentum_x (newPosX - that.startX, duration, rectS, rectP);
      momentumY =
        that._scroll_momentum_y (newPosY - that.startY, duration, rectS, rectP);

      newPosX = that._ab_view_t_x + momentumX.dist;
      newPosY = that._ab_view_t_y + momentumY.dist;
    }

    if (momentumX.dist || momentumY.dist)
    {
      newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

      // Do we need to snap?
      if (that.options.snap)
      {
        snap = that._scroll_snap (newPosX, newPosY);
        newPosX = snap.x;
        newPosY = snap.y;
        newDuration = m.max(snap.time, newDuration);
      }
      
      that.scrollTo (newPosX, newPosY, newDuration);
      return;
    }
    
    // Do we need to snap?
    if (that.options.snap)
    {
      snap = that._scroll_snap (that._ab_view_t_x, that._ab_view_t_y);
      if (snap.x !== that._ab_view_t_x || snap.y !== that._ab_view_t_y)
      {
        that.scrollTo (snap.x, snap.y, snap.time);
      }
      return;
    }

    that._scroll_reset_pos ();
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_reset_pos: function (time)
  {
    var that = this,
      resetX = that._ab_view_t_x,
      resetY = that._ab_view_t_y,
      rectS, rectP;

    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);
    
    if (rectS.width < rectP.width)
    {
      resetX = that._ab_view_t_x;
    }
    else
    {
      if (rectS.left > rectP.left)
      {
        resetX = that._ab_view_t_x + (rectP.left - rectS.left);
      }
      else if (rectS.right < rectP.right)
      {
        resetX = that._ab_view_t_x + (rectP.right - rectS.right);
      }
    }
    
    if (rectS.height < rectP.height)
    {
      resetY = that._ab_view_t_y;
    }
    else
    {
      if (rectS.top > rectP.top)
      {
        resetY = that._ab_view_t_y + (rectP.top - rectS.top);
      }
      else if (rectS.bottom < rectP.bottom)
      {
        resetY = that._ab_view_t_y + (rectP.bottom - rectS.bottom);
      }
    }
        
    if (resetX === that._ab_view_t_x && resetY === that._ab_view_t_y)
    {
      if (that.moved)
      {
        // Execute custom code on scroll end
        if (that.options.onScrollEnd)
        { that.options.onScrollEnd.call (that); }
        that.moved = false;
      }

      if (that.hScrollbar && that.options.hideScrollbar)
      {
        that.hScrollbarWrapper.style.webkitTransitionDelay = '300ms';
        that.hScrollbarWrapper.style.opacity = '0';
      }
      if (that.vScrollbar && that.options.hideScrollbar)
      {
        that.vScrollbarWrapper.style.webkitTransitionDelay = '300ms';
        that.vScrollbarWrapper.style.opacity = '0';
      }

      return;
    }

    if (time === undefined)
    { time = 200; }

    // Invert ease
    if (time)
    {
      that.scroller.style.webkitTransitionTimingFunction = 
        'cubic-bezier(0.33,0.0,0.33,1)';
      if (that.hScrollbar) 
      {
        that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 
          'cubic-bezier(0.33,0.0,0.33,1)';
      }
      if (that.vScrollbar)
      {
        that.vScrollbarIndicator.style.webkitTransitionTimingFunction =
          'cubic-bezier(0.33,0.0,0.33,1)';
      }
    }

    that.scrollTo (resetX, resetY, time);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_timed: function (destX, destY, runtime)
  {
    var that = this,
      startX = that._ab_view_t_x, startY = that._ab_view_t_y,
      startTime = (new Date).getTime(),
      easeOut;

    that.animationDuration = 0;
    
    if (that.scrollInterval)
    {
      clearInterval (that.scrollInterval);
      that.scrollInterval = null;
    }
    
    that.scrollInterval = setInterval (function ()
    {
      var now = (new Date).getTime(),
        newX, newY;
        
      if (now >= startTime + runtime)
      {
        clearInterval(that.scrollInterval);
        that.scrollInterval = null;

        that._scroll_pos (destX, destY);
        that._scroll_transition_end ();
        return;
      }
  
      now = (now - startTime) / runtime - 1;
      easeOut = m.sqrt(1 - now * now);
      newX = (destX - startX) * easeOut + startX;
      newY = (destY - startY) * easeOut + startY;
      that._scroll_pos (newX, newY);
    }, 20);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_transition_end : function (e)
  {
    var that = this;
    
    if (e) { e.stopPropagation(); }

    that._unbind ('webkitTransitionEnd');

    that._scroll_reset_pos (that.returnTime);
    that.returnTime = 0;
  },
    
  /**
   * @protected
   * @function
   */
  _scroll_wheel : function (e)
  {
    var that = this,
      deltaX = that._ab_view_t_x + e.wheelDeltaX / 12,
      deltaY = that._ab_view_t_y + e.wheelDeltaY / 12;

    if (deltaX > 0) deltaX = 0;
    else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

    if (deltaY > 0) deltaY = 0;
    else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;

    that.scrollTo(deltaX, deltaY, 0);
  },
  
  /**
   *
   * Utilities
   *
   */
  _scroll_momentum_x : function (dist, time, rectS, rectP)
  {
    var that = this,
      deceleration = 0.0006,
      speed = m.abs(dist) / time,
      newDist = (speed * speed) / (2 * deceleration),
      newTime = 0, outsideDist = 0;

    // Proportinally reduce speed if we are outside of the boundaries 
    if (dist > 0 && rectS.left - newDist < rectP.left)
    {
      outsideDist = rectS.width / (30 / (newDist / speed * deceleration));
      maxDistUpper = rectP.left - rectS.left + outsideDist;
      that.returnTime = 800 / rectS.width * outsideDist + 100;
      speed = speed * maxDistUpper / newDist;
      newDist = maxDistUpper;
    }
    else if (dist < 0 && rectS.right + newDist > rectP.right)
    {
      outsideDist = rectS.width / (30 / (newDist / speed * deceleration));
      maxDistLower = rectS.right - rectP.right + outsideDist;
      that.returnTime = 800 / rectS.width * outsideDist + 100;
      speed = speed * maxDistLower / newDist;
      newDist = - maxDistLower;
    }

    newTime = speed / deceleration;

    return { dist: newDist, time: m.round(newTime) };
  },

  /**
   * @protected
   * @function
   */
  _scroll_momentum_y: function (dist, time, rectS, rectP)
  {
    var that = this,
      deceleration = 0.0006,
      speed = m.abs(dist) / time,
      newDist = (speed * speed) / (2 * deceleration),
      newTime = 0, outsideDist = 0;

    // Proportinally reduce speed if we are outside of the boundaries 
    if (dist > 0 && rectS.top - newDist < rectP.top)
    {
      outsideDist = rectS.height / (30 / (newDist / speed * deceleration));
      maxDistUpper = rectP.top - rectS.top + outsideDist;
      that.returnTime = 800 / rectS.height * outsideDist + 100;
      speed = speed * maxDistUpper / newDist;
      newDist = maxDistUpper;
    }
    else if (dist < 0 && rectS.bottom + newDist > rectP.bottom)
    {
      outsideDist = rectS.height / (30 / (newDist / speed * deceleration));
      maxDistLower = rectS.bottom - rectP.bottom + outsideDist;
      that.returnTime = 800 / rectS.height * outsideDist + 100;
      speed = speed * maxDistLower / newDist;
      newDist = - maxDistLower;
    }

    newTime = speed / deceleration;

    return { dist: newDist, time: m.round(newTime) };
  },

  /**
   * @protected
   * @function
   */
  _scroll_offset: function (el, tree)
  {
    var left = -el.offsetLeft,
      top = -el.offsetTop;
      
    if (!tree) return { x: left, y: top };

    while (el = el.offsetParent)
    {
      left -= el.offsetLeft;
      top -= el.offsetTop;
    } 

    return { x: left, y: top };
  },

  /**
   * @protected
   * @function
   */
  _scroll_snap: function (x, y)
  {
    var that = this,
      i, l,
      page, time,
      sizeX, sizeY;

    // Check page X
    page = that.pagesX.length-1;
    for (i=0, l=that.pagesX.length; i<l; i++) {
      if (x >= that.pagesX[i]) {
        page = i;
        break;
      }
    }
    if (page === that.currPageX && page > 0 && that.dirX < 0)
    { page--; }
    x = that.pagesX[page];
    sizeX = m.abs(x - that.pagesX[that.currPageX]);
    sizeX = sizeX ? m.abs(that._ab_view_t_x - x) / sizeX * 500 : 0;
    that.currPageX = page;

    // Check page Y
    page = that.pagesY.length-1;
    for (i=0; i<page; i++) {
      if (y >= that.pagesY[i]) {
        page = i;
        break;
      }
    }
    if (page === that.currPageY && page > 0 && that.dirY < 0)
    { page--; }
    
    y = that.pagesY[page];
    sizeY = m.abs(y - that.pagesY[that.currPageY]);
    sizeY = sizeY ? m.abs(that._ab_view_t_y - y) / sizeY * 500 : 0;
    that.currPageY = page;

    // Snap with constant speed (proportional duration)
    time = m.round(m.max(sizeX, sizeY)) || 200;

    return { x: x, y: y, time: time };
  },

  /**
   * @protected
   * @function
   */
  _bind: function (type, el)
  {
    (el || this.scroller).addEventListener(type, this, false);
  },

  /**
   * @protected
   * @function
   */
  _unbind: function (type, el)
  {
    (el || this.scroller).removeEventListener(type, this, false);
  },

  /**
   *
   * Public methods
   *
   */
  _deactivate_scroll: function ()
  {
    var that = this;

    if (that.options.checkDOMChange) clearTimeout(that.DOMChangeInterval);

    // Remove the scrollbars
    that.hScrollbar = false;
    that.vScrollbar = false;
    that._scrollbar_init ('h');
    that._scrollbar_init ('v');

    // Free some mem
    setElementTransform (that.scroller, "");

    // Remove the event listeners
    that._unbind('webkitTransitionEnd');
    that._unbind (RESIZE_EV, window);
    that._unbind (core.POINTER_START);
    that._unbind (core.POINTER_MOVE, document);
    that._unbind (core.POINTER_END, document);
    that._unbind (core.POINTER_CANCEL, document);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_refresh: function (supportPinch)
  {
    var that = this,
      pos = 0, page = 0,
      i, l, els,
      oldHeight, offsets,
      loading, rectS, rectP;

    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);

    that.wrapperW = rectP.width;
    that.wrapperH = rectP.height;

    that.scrollerW = rectS.width;
    that.scrollerH = rectS.height;
     
    that.maxScrollX = rectP.width - rectS.width;
    that.maxScrollY = rectP.height - rectS.height;
    that.dirX = 0;
    that.dirY = 0;
    
    that.animationDuration = 0;

    that.hScroll = that.options.hScroll && that.maxScrollX < 0;
    that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);
    that.hScrollbar = that.hScroll && that.options.hScrollbar;
    that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

    // Prepare the scrollbars
    that._scrollbar_init ('h');
    that._scrollbar_init ('v');

    // Snap
    if (util.isString (that.options.snap))
    {
      that.pagesX = [];
      that.pagesY = [];
      els = that.scroller.querySelectorAll(that.options.snap);
      for (i=0, l=els.length; i<l; i++)
      {
        pos = that._scroll_offset (els[i]);
        that.pagesX[i] = pos.x < that.maxScrollX ? that.maxScrollX : pos.x * that._ab_view_s;
        that.pagesY[i] = pos.y < that.maxScrollY ? that.maxScrollY : pos.y * that._ab_view_s;
      }
    }
    else if (that.options.snap)
    {
      that.pagesX = [];
      while (pos >= that.maxScrollX)
      {
        that.pagesX[page] = pos;
        pos = pos - that.wrapperW;
        page++;
      }
      if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

      pos = 0;
      page = 0;
      that.pagesY = [];
      while (pos >= that.maxScrollY)
      {
        that.pagesY[page] = pos;
        pos = pos - that.wrapperH;
        page++;
      }
      if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
    }
    
    // Recalculate wrapper offsets
    if (supportPinch)
    {
      offsets = that._scroll_offset (that.wrapper, true);
      that.wrapperOffsetLeft = -offsets.x;
      that.wrapperOffsetTop = -offsets.y;
    }

    if (oldHeight && that._ab_view_t_y === 0)
    {
      oldHeight = oldHeight - that.scrollerH + that._ab_view_t_y;
      that.scrollTo (0, oldHeight, 0);
    }
    
    that._scroll_reset_pos ();
  },

  /**
   * @function
   */
  scrollTo: function (x, y, time, relative)
  {
    var that = this;

    if (relative) {
      x = that._ab_view_t_x - x;
      y = that._ab_view_t_y - y;
    }

    time = !time || (m.round(that._ab_view_t_x) === m.round(x) && m.round(that._ab_view_t_y) === m.round(y)) ? 0 : time;

    that.moved = true;

    if (time)
    { that._bind('webkitTransitionEnd'); }
    
    that.animationDuration = time;
    that._scroll_pos (x, y);
    if (!time) setTimeout(function () { that._scroll_transition_end(); }, 0);
  },

  /**
   * @function
   */
  scrollToElement: function (el, time)
  {
    var that = this, pos;
    el = el.nodeType ? el : that.scroller.querySelector(el);
    if (!el) return;

    pos = that._scroll_offset (el);
    pos.x = pos.x > 0 ? 0 : pos.x < that.maxScrollX ? that.maxScrollX : pos.x;
    pos.y = pos.y > 0 ? 0 : pos.y < that.maxScrollY ? that.maxScrollY : pos.y;
    time = time === undefined ? m.max(m.abs(pos.x)*2, m.abs(pos.y)*2) : time;

    that.scrollTo (pos.x, pos.y, time);
  },

  /**
   * @function
   */
  scrollToPage: function (pageX, pageY, time)
  {
    var that = this, x, y;
    
    if (that.options.snap)
    {
      pageX = pageX === 'next' ? that.currPageX+1 : pageX === 'prev' ? that.currPageX-1 : pageX;
      pageY = pageY === 'next' ? that.currPageY+1 : pageY === 'prev' ? that.currPageY-1 : pageY;

      pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
      pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

      that.currPageX = pageX;
      that.currPageY = pageY;
      x = that.pagesX[pageX];
      y = that.pagesY[pageY];
    }
    else
    {
      x = -that.wrapperW * pageX;
      y = -that.wrapperH * pageY;
      if (x < that.maxScrollX) x = that.maxScrollX;
      if (y < that.maxScrollY) y = that.maxScrollY;
    }

    that.scrollTo (x, y, time || 400);
  }
};

var has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
  hasGesture = 'ongesturestart' in window,
  RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
  trnOpen = 'translate' + (has3d ? '3d(' : '('),
  trnClose = has3d ? ',0)' : ')',
  m = Math;/*!
 * iScroll v4.2.5 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function(window, doc, vs){
var m = Math,
	vendor = vs.CSS_VENDOR,
	cssVendor = vs.CSS_VENDOR ? '-' + vs.CSS_VENDOR + '-' : '',

	// Style properties
	transform = prefixStyle('transform'),
	transitionProperty = prefixStyle('transitionProperty'),
	transitionDuration = vs.TRANSITION_DURATION,
	transformOrigin = vs.TRANSFORM_ORIGIN,
	transitionTimingFunction = vs.TRANSITION_TIMING_FUNC,
	transitionDelay = vs.TRANSITION_DELAY,

    // Browser capabilities
	isAndroid = (/android/gi).test(navigator.appVersion),
	isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
	isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

  has3d = vs.SUPPORT_3D_TRANSFORM,
  hasTouch = 'ontouchstart' in window,
  hasTransform = vs.SUPPORT_CSS_TRANSFORM,
  hasTransitionEnd = hasTransform,

	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = vs.POINTER_START,
	MOVE_EV = vs.POINTER_MOVE,
	END_EV = vs.POINTER_END,
	CANCEL_EV = vs.POINTER_CANCEL,
	TRNEND_EV = vs.TRANSITION_END,

	nextFrame = vs.requestAnimationFrame,
	cancelFrame = vs.cancelRequestAnimationFrame,

	// Helpers
	translateZ = has3d ? ' translateZ(0)' : '',

	// Constructor
	iScroll = function (el, scroller, options) {
		var that = this,
			i;

		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
		that.wrapper.style.overflow = 'hidden';
		that.scroller = scroller;

		// Default options
		that.options = {
			hScroll: true,
			vScroll: true,
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,
			topOffset: 0,
			checkDOMChanges: false,		// Experimental
			handleClick: true,

			// Scrollbar
			hScrollbar: true,
			vScrollbar: true,
			fixedScrollbar: isAndroid,
			hideScrollbar: isIDevice,
			fadeScrollbar: isIDevice && has3d,
			scrollbarClass: '',

			// Zoom
			zoom: false,
			zoomMin: 1,
			zoomMax: 4,
			doubleTapZoom: 2,
			wheelAction: 'scroll',

			// Snap
			snap: false,
			snapThreshold: 1,

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (e) { e.preventDefault(); },
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null,
			onZoomStart: null,
			onZoom: null,
			onZoomEnd: null
		};

		// User defined options
		for (i in options) that.options[i] = options[i];
		
		// Set starting position
		that.x = that.options.x;
		that.y = that.options.y;

		// Normalize options
		that.options.useTransform = hasTransform && that.options.useTransform;
		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
		that.options.zoom = that.options.useTransform && that.options.zoom;
		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

		// Helpers FIX ANDROID BUG!
		// translate3d and scale doesn't work together!
		// Ignoring 3d ONLY WHEN YOU SET that.options.zoom
		if ( that.options.zoom && isAndroid ){
			translateZ = '';
		}
		
		// Set some default styles
		that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
		that.scroller.style[transitionDuration] = '0';
		that.scroller.style[transformOrigin] = '0 0';
		if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
		
		if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
		else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

		if (that.options.useTransition) that.options.fixedScrollbar = true;

		that.refresh();

		that._bind(RESIZE_EV, window);
		that._bind(START_EV);
		if (!hasTouch) {
			if (that.options.wheelAction != 'none') {
				that._bind('DOMMouseScroll');
				that._bind('mousewheel');
			}
		}

		if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
			that._checkDOMChanges();
		}, 500);
	};

// Prototype
iScroll.prototype = {
	enabled: true,
	x: 0,
	y: 0,
	steps: [],
	scale: 1,
	currPageX: 0, currPageY: 0,
	pagesX: [], pagesY: [],
	aniTime: null,
	wheelZoomCount: 0,
	
	handleEvent: function (e) {
		var that = this;
		switch(e.type) {
			case START_EV:
				if (!hasTouch && e.button !== 0) return;
				that._start(e);
				break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case RESIZE_EV: that._resize(); break;
			case 'DOMMouseScroll': case 'mousewheel': that._wheel(e); break;
			case TRNEND_EV: that._transitionEnd(e); break;
		}
	},
	
	_checkDOMChanges: function () {
		if (this.moved || this.zoomed || this.animating ||
			(this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

		this.refresh();
	},
	
	_scrollbar: function (dir) {
		var that = this,
			bar;

		if (!that[dir + 'Scrollbar']) {
			if (that[dir + 'ScrollbarWrapper']) {
				if (hasTransform) that[dir + 'ScrollbarIndicator'].style[transform] = '';
				that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
				that[dir + 'ScrollbarWrapper'] = null;
				that[dir + 'ScrollbarIndicator'] = null;
			}

			return;
		}

		if (!that[dir + 'ScrollbarWrapper']) {
			// Create the scrollbar wrapper
			bar = doc.createElement('div');

			if (that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
			else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:opacity;' + cssVendor + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

			that.wrapper.appendChild(bar);
			that[dir + 'ScrollbarWrapper'] = bar;

			// Create the scrollbar indicator
			bar = doc.createElement('div');
			if (!that.options.scrollbarClass) {
				bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);' + cssVendor + 'background-clip:padding-box;' + cssVendor + 'box-sizing:border-box;' + (dir == 'h' ? 'height:100%' : 'width:100%') + ';' + cssVendor + 'border-radius:3px;border-radius:3px';
			}
			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:' + cssVendor + 'transform;' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translate(0,0)' + translateZ;
			if (that.options.useTransition) bar.style.cssText += ';' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';

			that[dir + 'ScrollbarWrapper'].appendChild(bar);
			that[dir + 'ScrollbarIndicator'] = bar;
		}

		if (dir == 'h') {
			that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
			that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
			that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
			that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
			that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
		} else {
			that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
			that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
			that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
			that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
			that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
		}

		// Reset position
		that._scrollbarPos(dir, true);
	},
	
	_resize: function () {
		var that = this;
		setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
	},
	
	_pos: function (x, y) {
		if (this.zoomed) return;

		x = this.hScroll ? x : 0;
		y = this.vScroll ? y : 0;

		if (this.options.useTransform) {
			this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
		} else {
			x = m.round(x);
			y = m.round(y);
			this.scroller.style.left = x + 'px';
			this.scroller.style.top = y + 'px';
		}

		this.x = x;
		this.y = y;

		this._scrollbarPos('h');
		this._scrollbarPos('v');
	},

	_scrollbarPos: function (dir, hidden) {
		var that = this,
			pos = dir == 'h' ? that.x : that.y,
			size;

		if (!that[dir + 'Scrollbar']) return;

		pos = that[dir + 'ScrollbarProp'] * pos;

		if (pos < 0) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] + m.round(pos * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
			}
			pos = 0;
		} else if (pos > that[dir + 'ScrollbarMaxScroll']) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] - m.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
				pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
			} else {
				pos = that[dir + 'ScrollbarMaxScroll'];
			}
		}

		that[dir + 'ScrollbarWrapper'].style[transitionDelay] = '0';
		that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
		that[dir + 'ScrollbarIndicator'].style[transform] = 'translate(' + (dir == 'h' ? pos + 'px,0)' : '0,' + pos + 'px)') + translateZ;
	},
	
	_start: function (e) {
		var that = this,
			point = e.pointerList[0],
			matrix, x, y,
			c1, c2;

		if (!that.enabled) return;

		if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

		if (that.options.useTransition || that.options.zoom) that._transitionTime(0);

		that.moved = false;
		that.animating = false;
		that.zoomed = false;
		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;

		// Gesture start
		if (that.options.zoom && e.nbPointers > 1) {
			c1 = m.abs(e.pointerList[0].pageX-e.pointerList[1].pageX);
			c2 = m.abs(e.pointerList[0].pageY-e.pointerList[1].pageY);
			that.touchesDistStart = m.sqrt(c1 * c1 + c2 * c2);

			that.originX = m.abs(e.pointerList[0].pageX + e.pointerList[1].pageX - that.wrapperOffsetLeft * 2) / 2 - that.x;
			that.originY = m.abs(e.pointerList[0].pageY + e.pointerList[1].pageY - that.wrapperOffsetTop * 2) / 2 - that.y;

			if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
		}

		if (that.options.momentum) {
			if (that.options.useTransform) {
				// Very lame general purpose alternative to CSSMatrix
				matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
				x = +(matrix[12] || matrix[4]);
				y = +(matrix[13] || matrix[5]);
			} else {
				x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
				y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
			}
			
			if (x != that.x || y != that.y) {
				if (that.options.useTransition) that._unbind(TRNEND_EV);
				else cancelFrame(that.aniTime);
				that.steps = [];
				that._pos(x, y);
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
			}
		}

		that.absStartX = that.x;	// Needed by snap threshold
		that.absStartY = that.y;

		that.startX = that.x;
		that.startY = that.y;
		that.pointX = point.pageX;
		that.pointY = point.pageY;

		that.startTime = e.timeStamp || Date.now();

		if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

		that._bind(MOVE_EV, window);
		that._bind(END_EV, window);
		that._bind(CANCEL_EV, window);
	},
	
	_move: function (e) {
		var that = this,
			point = e.pointerList[0],
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY,
			c1, c2, scale,
			timestamp = e.timeStamp || Date.now();

		if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

		// Zoom
		if (that.options.zoom && e.nbPointers > 1) {
			c1 = m.abs(e.pointerList[0].pageX - e.pointerList[1].pageX);
			c2 = m.abs(e.pointerList[0].pageY - e.pointerList[1].pageY);
			that.touchesDist = m.sqrt(c1*c1+c2*c2);

			that.zoomed = true;

			scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;

			if (scale < that.options.zoomMin) scale = 0.5 * that.options.zoomMin * Math.pow(2.0, scale / that.options.zoomMin);
			else if (scale > that.options.zoomMax) scale = 2.0 * that.options.zoomMax * Math.pow(0.5, that.options.zoomMax / scale);

			that.lastScale = scale / this.scale;

			newX = this.originX - this.originX * that.lastScale + this.x,
			newY = this.originY - this.originY * that.lastScale + this.y;

			this.scroller.style[transform] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;

			if (that.options.onZoom) that.options.onZoom.call(that, e);
			return;
		}

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > that.minScrollY || newY < that.maxScrollY) {
			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
		}

		that.distX += deltaX;
		that.distY += deltaY;
		that.absDistX = m.abs(that.distX);
		that.absDistY = m.abs(that.distY);

		if (that.absDistX < 6 && that.absDistY < 6) {
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY + 5) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX + 5) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if (timestamp - that.startTime > 300) {
			that.startTime = timestamp;
			that.startX = that.x;
			that.startY = that.y;
		}
		
		if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
	},
	
	_end: function (e) {
		if (e.nbPointers !== 0) return;

		var that = this,
			point = e.changedPointerList [0],
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = (e.timeStamp || Date.now()) - that.startTime,
			newPosX = that.x,
			newPosY = that.y,
			distX, distY,
			newDuration,
			snap,
			scale;

		that._unbind(MOVE_EV, window);
		that._unbind(END_EV, window);
		that._unbind(CANCEL_EV, window);

		if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

		if (that.zoomed) {
			scale = that.scale * that.lastScale;
			scale = Math.max(that.options.zoomMin, scale);
			scale = Math.min(that.options.zoomMax, scale);
			that.lastScale = scale / that.scale;
			that.scale = scale;

			that.x = that.originX - that.originX * that.lastScale + that.x;
			that.y = that.originY - that.originY * that.lastScale + that.y;
			
			that.scroller.style[transitionDuration] = '200ms';
			that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + that.scale + ')' + translateZ;
			
			that.zoomed = false;
			that.refresh();

			if (that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
			return;
		}

		if (!that.moved) {
			if (hasTouch) {
				if (that.doubleTapTimer && that.options.zoom) {
					// Double tapped
					clearTimeout(that.doubleTapTimer);
					that.doubleTapTimer = null;
					if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
					that.zoom(that.pointX, that.pointY, that.scale == 1 ? that.options.doubleTapZoom : 1);
					if (that.options.onZoomEnd) {
						setTimeout(function() {
							that.options.onZoomEnd.call(that, e);
						}, 200); // 200 is default zoom duration
					}
				} else if (this.options.handleClick) {
					that.doubleTapTimer = setTimeout(function () {
						that.doubleTapTimer = null;

						// Find the last touched element
						target = point.target;
						while (target.nodeType != 1) target = target.parentNode;

						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
							ev = doc.createEvent('MouseEvents');
							ev.initMouseEvent('click', true, true, e.view, 1,
								point.screenX, point.screenY, point.clientX, point.clientY,
								e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
								0, null);
							ev._fake = true;
							target.dispatchEvent(ev);
						}
					}, that.options.zoom ? 250 : 0);
				}
			}

			that._resetPos(400);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		if (duration < 300 && that.options.momentum) {
			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;

			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
			if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
		}

		if (momentumX.dist || momentumY.dist) {
			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

			// Do we need to snap?
			if (that.options.snap) {
				distX = newPosX - that.absStartX;
				distY = newPosY - that.absStartY;
				if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) { that.scrollTo(that.absStartX, that.absStartY, 200); }
				else {
					snap = that._snap(newPosX, newPosY);
					newPosX = snap.x;
					newPosY = snap.y;
					newDuration = m.max(snap.time, newDuration);
				}
			}

			that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		// Do we need to snap?
		if (that.options.snap) {
			distX = newPosX - that.absStartX;
			distY = newPosY - that.absStartY;
			if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) that.scrollTo(that.absStartX, that.absStartY, 200);
			else {
				snap = that._snap(that.x, that.y);
				if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x, snap.y, snap.time);
			}

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		that._resetPos(200);
		if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
	},
	
	_resetPos: function (time) {
		var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				that.moved = false;
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
			}

			if (that.hScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
				that.hScrollbarWrapper.style.opacity = '0';
			}
			if (that.vScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
				that.vScrollbarWrapper.style.opacity = '0';
			}

			return;
		}

		that.scrollTo(resetX, resetY, time || 0);
	},

	_wheel: function (e) {
		var that = this,
			wheelDeltaX, wheelDeltaY,
			deltaX, deltaY,
			deltaScale;

		if ('wheelDeltaX' in e) {
			wheelDeltaX = e.wheelDeltaX / 12;
			wheelDeltaY = e.wheelDeltaY / 12;
		} else if('wheelDelta' in e) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 12;
		} else if ('detail' in e) {
			wheelDeltaX = wheelDeltaY = -e.detail * 3;
		} else {
			return;
		}
		
		if (that.options.wheelAction == 'zoom') {
			deltaScale = that.scale * Math.pow(2, 1/3 * (wheelDeltaY ? wheelDeltaY / Math.abs(wheelDeltaY) : 0));
			if (deltaScale < that.options.zoomMin) deltaScale = that.options.zoomMin;
			if (deltaScale > that.options.zoomMax) deltaScale = that.options.zoomMax;
			
			if (deltaScale != that.scale) {
				if (!that.wheelZoomCount && that.options.onZoomStart) that.options.onZoomStart.call(that, e);
				that.wheelZoomCount++;
				
				that.zoom(e.pageX, e.pageY, deltaScale, 400);
				
				setTimeout(function() {
					that.wheelZoomCount--;
					if (!that.wheelZoomCount && that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
				}, 400);
			}
			
			return;
		}
		
		deltaX = that.x + wheelDeltaX;
		deltaY = that.y + wheelDeltaY;

		if (deltaX > 0) deltaX = 0;
		else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

		if (deltaY > that.minScrollY) deltaY = that.minScrollY;
		else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;
    
		if (that.maxScrollY < 0) {
			that.scrollTo(deltaX, deltaY, 0);
		}
	},
	
	_transitionEnd: function (e) {
		var that = this;

		if (e.target != that.scroller) return;

		that._unbind(TRNEND_EV);
		
		that._startAni();
	},


	/**
	*
	* Utilities
	*
	*/
	_startAni: function () {
		var that = this,
			startX = that.x, startY = that.y,
			startTime = Date.now(),
			step, easeOut,
			animate;

		if (that.animating) return;
		
		if (!that.steps.length) {
			that._resetPos(400);
			return;
		}
		
		step = that.steps.shift();
		
		if (step.x == startX && step.y == startY) step.time = 0;

		that.animating = true;
		that.moved = true;
		
		if (that.options.useTransition) {
			that._transitionTime(step.time);
			that._pos(step.x, step.y);
			that.animating = false;
			if (step.time) that._bind(TRNEND_EV);
			else that._resetPos(0);
			return;
		}

		animate = function () {
			var now = Date.now(),
				newX, newY;

			if (now >= startTime + step.time) {
				that._pos(step.x, step.y);
				that.animating = false;
				if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
				that._startAni();
				return;
			}

			now = (now - startTime) / step.time - 1;
			easeOut = m.sqrt(1 - now * now);
			newX = (step.x - startX) * easeOut + startX;
			newY = (step.y - startY) * easeOut + startY;
			that._pos(newX, newY);
			if (that.animating) that.aniTime = nextFrame(animate);
		};

		animate();
	},

	_transitionTime: function (time) {
		time += 'ms';
		this.scroller.style[transitionDuration] = time;
		if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
		if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
	},

	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
		var deceleration = 0.0006,
			speed = m.abs(dist) / time,
			newDist = (speed * speed) / (2 * deceleration),
			newTime = 0, outsideDist = 0;

		// Proportinally reduce speed if we are outside of the boundaries
		if (dist > 0 && newDist > maxDistUpper) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistUpper = maxDistUpper + outsideDist;
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistLower = maxDistLower + outsideDist;
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}

		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: newDist, time: m.round(newTime) };
	},

	_offset: function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;
			
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		
		if (el != this.wrapper) {
			left *= this.scale;
			top *= this.scale;
		}

		return { left: left, top: top };
	},

	_snap: function (x, y) {
		var that = this,
			i, l,
			page, time,
			sizeX, sizeY;

		// Check page X
		page = that.pagesX.length - 1;
		for (i=0, l=that.pagesX.length; i<l; i++) {
			if (x >= that.pagesX[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
		x = that.pagesX[page];
		sizeX = m.abs(x - that.pagesX[that.currPageX]);
		sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
		that.currPageX = page;

		// Check page Y
		page = that.pagesY.length-1;
		for (i=0; i<page; i++) {
			if (y >= that.pagesY[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
		y = that.pagesY[page];
		sizeY = m.abs(y - that.pagesY[that.currPageY]);
		sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
		that.currPageY = page;

		// Snap with constant speed (proportional duration)
		time = m.round(m.max(sizeX, sizeY)) || 200;

		return { x: x, y: y, time: time };
	},

	_bind: function (type, el, bubble) {
//		(el || this.scroller).addEventListener(type, this, !!bubble);
		vs.addPointerListener ((el || this.scroller), type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
//		(el || this.scroller).removeEventListener(type, this, !!bubble);
		vs.removePointerListener ((el || this.scroller), type, this, !!bubble);
	},


	/**
	*
	* Public methods
	*
	*/
	destroy: function () {
		var that = this;

		that.scroller.style[transform] = '';

		// Remove the scrollbars
		that.hScrollbar = false;
		that.vScrollbar = false;
		that._scrollbar('h');
		that._scrollbar('v');

		// Remove the event listeners
		that._unbind(RESIZE_EV, window);
		that._unbind(START_EV);
		that._unbind(MOVE_EV, window);
		that._unbind(END_EV, window);
		that._unbind(CANCEL_EV, window);
		
		if (!that.options.hasTouch) {
			that._unbind('DOMMouseScroll');
			that._unbind('mousewheel');
		}
		
		if (that.options.useTransition) that._unbind(TRNEND_EV);
		
		if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);
		
		if (that.options.onDestroy) that.options.onDestroy.call(that);
	},

	refresh: function () {
		var that = this,
			offset,
			i, l,
			els,
			pos = 0,
			page = 0;

		if (that.scale < that.options.zoomMin) that.scale = that.options.zoomMin;
		that.wrapperW = that.wrapper.clientWidth || 1;
		that.wrapperH = that.wrapper.clientHeight || 1;

		that.minScrollY = -that.options.topOffset || 0;
		that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
		that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
		that.dirX = 0;
		that.dirY = 0;

		if (that.options.onRefresh) that.options.onRefresh.call(that);

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

		that.hScrollbar = that.hScroll && that.options.hScrollbar;
		that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

		offset = that._offset(that.wrapper);
		that.wrapperOffsetLeft = -offset.left;
		that.wrapperOffsetTop = -offset.top;

		// Prepare snap
		if (typeof that.options.snap == 'string') {
			that.pagesX = [];
			that.pagesY = [];
			els = that.scroller.querySelectorAll(that.options.snap);
			for (i=0, l=els.length; i<l; i++) {
				pos = that._offset(els[i]);
				pos.left += that.wrapperOffsetLeft;
				pos.top += that.wrapperOffsetTop;
				that.pagesX[i] = pos.left < that.maxScrollX ? that.maxScrollX : pos.left * that.scale;
				that.pagesY[i] = pos.top < that.maxScrollY ? that.maxScrollY : pos.top * that.scale;
			}
		} else if (that.options.snap) {
			that.pagesX = [];
			while (pos >= that.maxScrollX) {
				that.pagesX[page] = pos;
				pos = pos - that.wrapperW;
				page++;
			}
			if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

			pos = 0;
			page = 0;
			that.pagesY = [];
			while (pos >= that.maxScrollY) {
				that.pagesY[page] = pos;
				pos = pos - that.wrapperH;
				page++;
			}
			if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
		}

		// Prepare the scrollbars
		that._scrollbar('h');
		that._scrollbar('v');

		if (!that.zoomed) {
			that.scroller.style[transitionDuration] = '0';
			that._resetPos(400);
		}
	},

	scrollTo: function (x, y, time, relative) {
		var that = this,
			step = x,
			i, l;

		that.stop();

		if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];
		
		for (i=0, l=step.length; i<l; i++) {
			if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
			that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
		}

		that._startAni();
	},

	scrollToElement: function (el, time) {
		var that = this, pos;
		el = el.nodeType ? el : that.scroller.querySelector(el);
		if (!el) return;

		pos = that._offset(el);
		pos.left += that.wrapperOffsetLeft;
		pos.top += that.wrapperOffsetTop;

		pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
		pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
		time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

		that.scrollTo(pos.left, pos.top, time);
	},

	scrollToPage: function (pageX, pageY, time) {
		var that = this, x, y;
		
		time = time === undefined ? 400 : time;

		if (that.options.onScrollStart) that.options.onScrollStart.call(that);

		if (that.options.snap) {
			pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
			pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

			pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
			pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

			that.currPageX = pageX;
			that.currPageY = pageY;
			x = that.pagesX[pageX];
			y = that.pagesY[pageY];
		} else {
			x = -that.wrapperW * pageX;
			y = -that.wrapperH * pageY;
			if (x < that.maxScrollX) x = that.maxScrollX;
			if (y < that.maxScrollY) y = that.maxScrollY;
		}

		that.scrollTo(x, y, time);
	},

	disable: function () {
		this.stop();
		this._resetPos(0);
		this.enabled = false;

		// If disabled after touchstart we make sure that there are no left over events
		this._unbind(MOVE_EV, window);
		this._unbind(END_EV, window);
		this._unbind(CANCEL_EV, window);
	},
	
	enable: function () {
		this.enabled = true;
	},
	
	stop: function () {
		if (this.options.useTransition) this._unbind(TRNEND_EV);
		else cancelFrame(this.aniTime);
		this.steps = [];
		this.moved = false;
		this.animating = false;
	},
	
	zoom: function (x, y, scale, time) {
		var that = this,
			relScale = scale / that.scale;

		if (!that.options.useTransform) return;

		that.zoomed = true;
		time = time === undefined ? 200 : time;
		x = x - that.wrapperOffsetLeft - that.x;
		y = y - that.wrapperOffsetTop - that.y;
		that.x = x - x * relScale + that.x;
		that.y = y - y * relScale + that.y;

		that.scale = scale;
		that.refresh();

		that.x = that.x > 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x;
		that.y = that.y > that.minScrollY ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		that.scroller.style[transitionDuration] = time + 'ms';
		that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + scale + ')' + translateZ;
		that.zoomed = false;
	},
	
	isReady: function () {
		return !this.moved && !this.zoomed && !this.animating;
	}
};

function prefixStyle (style) {
	if ( vendor === '' ) return style;

	style = style.charAt(0).toUpperCase() + style.substr(1);
	return vendor + style;
}

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})(window, document, vs);/**
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
 *  The vs.ui.ScrollView class
 *
 *  @extends vs.ui.View
 *  @class
 *  vs.ui.ScrollView defines the basic drawing, event-handling, of an application.
 *  The main different between vs.ui.ScrollView and vs.ui.View classes is vs.ui.ScrollView
 *  manages gesture events and scroll.
 *  <p>
 *  To allow pinch and scroll behavior, you need to set pinch and/or scroll
 *  properties. You can activate separately rotation, scale and scroll.
 *
 *  <p>
 * Delegates:
 *  <ul>
 *    <li/>viewWillStartZooming : function (vs.ui.ScrollView the view)
 *    <li/>viewDidEndZooming : function (vs.ui.ScrollView the view, number scale)
 *  </ul>
 *  <p>
 *  @example
 *  var myView = new vs.ui.ScrollView (config);
 *  myView.minScale = 1;
 *  myView.maxScale = 2;
 *  myView.pinch = vs.ui.ScrollView.SCALE; // activate pinch zoom
 *  myView.scroll = true; //
 *  
 *  @author David Thevenin
 * @name vs.ui.ScrollView
 *
 *  @constructor
 *   Creates a new vs.ui.ScrollView.
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function ScrollView (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ScrollView;
  
  this.__ab_view_t_o = [50, 50];
}

/********************************************************************
                    _scrolling constant
*********************************************************************/

/** 
 * Disable the scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.NO_SCROLL
 * @const
 */
ScrollView.NO_SCROLL = 0;

/** 
 * Activate the only vertical scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.VERTICAL_SCROLL
 * @const
 */
ScrollView.VERTICAL_SCROLL = 1;

/** 
 * Activate the horizontal scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.HORIZONTAL_SCROLL
 * @const
 */
ScrollView.HORIZONTAL_SCROLL = 2;

/** 
 * Activate the scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.SCROLL
 * @const
 */
ScrollView.SCROLL = 3;

/********************************************************************
                    Pinch / rotation / scale constant
*********************************************************************/

/** 
 * Disable the pinch
 * @see vs.ui.ScrollView#pinch 
 * @name vs.ui.ScrollView.NO_PINCH
 * @const
 */
ScrollView.NO_PINCH = 0;

/** 
 * Configures pinch rotation
 * @see vs.ui.ScrollView#pinch 
 * @name vs.ui.ScrollView.ROTATION
 * @const
 */
ScrollView.ROTATION = 1;

/** 
 * Configures pinch scale
 * @see ScrollView#pinch 
 * @name vs.ui.ScrollView.SCALE
 * @const
 */
ScrollView.SCALE = 2;

/** 
 * Configures pinch rotation and scale
 * @see vs.ui.ScrollView#pinch 
 * @name vs.ui.ScrollView.ROTATION_AND_SCALE
 * @const
 */
ScrollView.ROTATION_AND_SCALE = 3;

ScrollView.prototype = {

 /**********************************************************************
 
 *********************************************************************/
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

   /**
   * @protected
   * @type {boolean}
   */
  _scroll: false,
      
   /**
   * @private
   * @type {boolean}
   */
  __scroll_activated: false,
      
   /**
   * @protected
   * @type {boolean}
   */
  _pinch: ScrollView.NO_PINCH,
  
  /**
   * Translate value on x
   * @private
   * @type {number}
   */
  _ab_view_t_x : 0,

  /**
   * Translate value on y
   * @private
   * @type {number}
   */
  _ab_view_t_y : 0,
  
  /**
   * Scale value of the inter view
   * @private
   * @type {number}
   */
  _ab_view_s : 1,

  /**
   * Rotation value of the inter view
   * @protected
   * @type {number}
   */
  _ab_view_r : 0,

  /*******   transformation member ****************/
  
  /**
   * Animation temporisation (in millisecond)
   * @private
   * @type {number}
   */
  _animation_duration : 0,
    
//   /** 
//    * This property allows you to specify the origin of the 2D transformations. 
//    * Values are pourcentage of the view size.
//    * <p>
//    * The property is set by default to [50, 50], which is the center of
//    * the view.
//    * @name vs.ui.View#transformOrigin 
//    * @type Array.<number>
//    */ 
//   set transformOrigin (v)
//   {
//     if (!util.isArray (v) || v.length !== 2) { return; }
//     if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }
// 
//     this._transform_origin [0] = v [0];
//     this._transform_origin [1] = v [1];
// 
//     var origin_str = this._transform_origin [0] + '% ';
//     origin_str += this._transform_origin [1] + '%';
//     this._sub_view.style ['-webkit-transform-origin'] = origin_str;
//   },
// 
//   /** 
//    * @return {Array}
//    */ 
//   get transformOrigin ()
//   {
//     return this._transform_origin.slice ();
//   },

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    var child, size = this.size, width = size[0], height = size[1], v,
      css = this._getComputedStyle (this.view), dx = 0, dy = 0;
    if (!this._sub_view) { return; }
    
    View.prototype.refresh.call (this);
 
    if (css)
    {
      v = css ['border-right-width'];
      dx += v?parseInt (v, 10):0;
      v = css ['border-left-width'];
      dx += v?parseInt (v, 10):0;
      v = css ['border-top-width'];
      dy += v?parseInt (v, 10):0;
      v = css ['borde-bottom-width'];
      dy += v?parseInt (v, 10):0;
    }

    width -= dx;
    height -= dy;
    
    child = this._sub_view.firstElementChild;
    while (child)
    {
      v = child.offsetHeight + child.offsetTop;
      if (v > height) { height = v; }
      v = child.offsetWidth + child.offsetLeft;
      if (v > width) { width = v; }
      
      child = child.nextElementSibling;
    }
    
    if (this._scroll === ScrollView.SCROLL)
    {
      this._sub_view.style.width = width + 'px';
      this._sub_view.style.height = height + 'px';
    }
    if (this._scroll === ScrollView.HORIZONTAL_SCROLL)
    {
      this._sub_view.style.width = width + 'px';
      this._sub_view.style.height = this.size [1] - dx + 'px';
    }
    if (this._scroll === ScrollView.VERTICAL_SCROLL)
    {
      this._sub_view.style.width = this.size [0] - dy + 'px';
      this._sub_view.style.height = height + 'px';
    }
    
    if (this._scroll === ScrollView.NO_SCROLL)
    {
      size = this.size;
      this._sub_view.style.width = size [0] + 'px';
      this._sub_view.style.height = size [1] + 'px'
    }

    if (this.__iscroll__) this.__iscroll__.refresh ();
  },
    
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__iscroll__)
    {
      this.__iscroll__.destroy ();
      this.__iscroll__ = undefined;
    }
    this._scroll = false;
    
    if (this._sub_view)
    {
      this.view.removeChild (this._sub_view);
    }
    View.prototype.destructor.call (this);
    delete (this._sub_view);
  },
  
  /**
   * Add the specified child component to this component.
   * <p>
   * The component can be a graphic component (vs.ui.View) or
   * a non graphic component (vs.core.EventSource).
   * In case of vs.ui.View its mandatory to set the extension.
   * <p>
   * The add is a lazy add! The child's view can be already in
   * the HTML DOM. In that case, the add methode do not modify the DOM.
   * <p>
   * @example
   *  var myButton = new Button (conf);
   *  myObject.add (myButton, 'children');
   *
   * @name vs.ui.ScrollView#add
   * @function
   * 
   * @param {vs.core.EventSource} child The component to be added.
   * @param {String} extension [optional] The hole into a vs.ui.View will be insert.
  */
  add : function (child, extension)
  {
    // manage Navigation bar and vs.ui.ToolBar specific positioning
    if (!child) { return; }
    if (child.constructor === NavigationBar)
    { extension = 'top_bar'; }
    if (child.constructor === ToolBar)
    { extension = 'bottom_bar'; }
    
    View.prototype.add.call (this, child, extension);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this._sub_view = this.view.querySelector ('.content');
    
    this.pinch = this._pinch;
    this.scroll = this._scroll;
    this.layout = this._layout;
    this.animationDuration = this._animation_duration;
   
    this.refresh ();
//    this._applyInsideTransformation2D ();
  },
  
  /*****************************************************************
   *                Events Management
   ****************************************************************/
   
  /**
   * @private
   * @function
   */
//   handleEvent : function (e)
//   {
//     switch (e.type)
//     {
//       case core.POINTER_START:
//         this.pointerStart (e);
//         break;
//       case core.POINTER_MOVE:
//         this._scroll_pointer_move (e);
//         break;
//       case core.POINTER_CANCEL:
//       case core.POINTER_END:
//         this._scroll_pointer_end (e);
//         break;
//       case 'gesturestart':
//         this.gestureStart (e);
//         break;
//       case 'gesturechange':
//         this.gestureChange (e);
//         break;
//       case 'gestureend':
//       case 'gesturecancel':
//         this.gestureEnd (e);
//         break;
//       case 'webkitTransitionEnd':
//         this._scroll_transition_end ();
//         break;
//       case 'orientationchange':
//       case 'resize':
//         this.refresh ();
//         break;
//       case 'DOMSubtreeModified':
//         this.onDOMModified (e);
//         break;
//      }
//     return false;
//   },

  /**
   * @private
   * @function
   */
//   gestureStart : function (e)
//   {
//     e.preventDefault ();
//     e.stopPropagation ();
//     
//     this.animationDuration = 0;
// 
//     if (this._pinch & ScrollView.SCALE && this._delegate &&
//         this._delegate.viewWillStartZooming)
//     {
//       this._delegate.viewWillStartZooming (this);
//     }
// 
//     document.addEventListener ('gesturechange', this);
//     document.addEventListener ('gestureend', this);
//     document.addEventListener ('gesturecancel', this);
//     this.view.addEventListener ('gestureend', this);
//     this.view.addEventListener ('gesturecancel', this);
//     
//     this.__ab_view_s = this._ab_view_s;
//     this.__ab_view_r = this._ab_view_r;
// 
//     origin_str = '50% 50%';
//     this._sub_view.style ['-webkit-transform-origin'] = origin_str;
//   },

  /**
   * @private
   * @function
   */
//   gestureChange : function (e)
//   {
//     var scale = this.__ab_view_s * e.scale;
//     e.preventDefault ();
//     e.stopPropagation ();
// 
//     if (scale > this._max_scale) { scale = this._max_scale; }
//     if (scale < this._min_scale) { scale = this._min_scale; }
// 
//     if (this._pinch === ScrollView.ROTATION)
//     {
//       this._ab_view_r = this.__ab_view_r + e.rotation;
//     }
//     else if (this._pinch === ScrollView.SCALE)
//     {
//       this._ab_view_s = scale;
//     }
//     else if (this._pinch === ScrollView.ROTATION_AND_SCALE)
//     {
//       this._ab_view_r = this.__ab_view_r + e.rotation;
//       this._ab_view_s = scale;
//     }
//     this._applyInsideTransformation2D ();
//     
//     // refresh scroll views according scale and rotiation
// //    if (this._scroll) { this._scroll_refresh (this._pinch); }
//   },

  /**
   * @private
   * @function
   */
//   gestureEnd : function (e)
//   {
//     var self = this;
// 
//     e.preventDefault ();
//     e.stopPropagation ();
// 
//     document.removeEventListener ('gesturechange', this);
//     document.removeEventListener ('gestureend', this);
//     document.removeEventListener ('gesturecancel', this);
//     this.view.removeEventListener ('gestureend', this);
//     this.view.removeEventListener ('gesturecancel', this);
//     
// 		setTimeout(function () {
// 			self.refresh();
// 		}, 0);
// 
//     if (this._pinch & ScrollView.SCALE && this._delegate &&
//         this._delegate.viewDidEndZooming)
//     {
//       this._delegate.viewDidEndZooming (this, this._ab_view_s);
//     }
//   },

  /**
   * @protected
   * @function
   */
//   pointerStart: function (e)
//   {
//     var matrix, len, origin_str, bx = 0, by = 0;
//     
//     // manage multi touche events (pinch, ...)
//     if (e.changedTouches && e.changedTouches.length > 1)
//     {
//       len = e.changedTouches.length;
//       for (i = 0; i < len; i ++)
//       {
//         bx += e.changedTouches [i].pageX;
//         by += e.changedTouches [i].pageY;
//       }
//       bx = (bx / len) - this._pos [0];
//       by = (by / len) - this._pos [1];
//       origin_str = bx + 'px ' + by + 'px';
//       this._sub_view.style ['-webkit-transform-origin'] = origin_str;
//       return;
//     }
// 
// // manage one touch event (touch, slide, ...)
// //     if (!this.enabled || (!this.options.vScrollbar && !this.options.hScrollbar)) {
// //       this._propagateToParent (e);
// //       return;
// //     }
// //     if (!e._fake && e.currentTarget !== this._sub_view) { return; }
// 
//     this._scroll_pointer_start (e);
//   },
  
  /**
   * @protected
   * @function
   */
//   onDOMModified: function (e)
//   {
//     var self = this;
// 
//     // (Hopefully) execute onDOMModified only once
//     if (e.target.parentNode !== this._sub_view) { return; }
// 
// //    setTimeout (function () { self.refresh(); }, 0);
//     this.refresh();
// 
//     if (this.options.topOnDOMChanges && 
//        (this._ab_view_t_x !== 0 || this._ab_view_t_y !== 0))
//     { this.scrollTo (0,0,0); }
//   },

  /**
   * @protected
   * @function
   */
//   onScrollEnd: function ()
//   {},
  
  /*****************************************************************
   *                Transformation methods
   ****************************************************************/
   
  /**
   * Move the content in x, y.
   *
   * @name vs.ui.ScrollView#insideTranslate
   * @function
   * 
   * @param {int} x translation over the x axis
   * @param {int} y translation over the y axis
   * @param {function} clb Function call at the end of the transformation
   */
//   insideTranslate: function (x, y, clb)
//   {
//     if (this._ab_view_t_x === x && this._ab_view_t_y === y) { return; }
//     
//     this._ab_view_t_x = x;
//     this._ab_view_t_y = y;
//     
//     this._applyInsideTransformation2D (clb);
//   },

  /**
   * Rotate the content
   *
   * @name vs.ui.ScrollView#insideRotate
   * @function
   * 
   * @param r {int} rotation
   * @param y {int} translation over the y axis
   * @param {function} clb Function call at the end of the transformation
   */
//   insideRotate: function (r, clb)
//   {
//     if (this._ab_view_r === r) { return; }
//     
//     this._ab_view_r = r;
//     
//     this._applyInsideTransformation2D (clb);
//     
//     // refresh scroll views according scale and rotiation
//     if (this._scroll) { this._scroll_refresh (this._pinch); }
//   },
  
  /**
   * Scale the content
   * <p/>The scale is limited by a max and min scale value.
   * 
   * @name vs.ui.ScrollView#insideScale
   * @function
   * 
   * @param s {float} scale value
   * @param {function} clb Function call at the end of the transformation
   */
//   insideScale: function (s, clb)
//   {    
//     if (s > this._max_scale) { s = this._max_scale; }
//     if (s < this._min_scale) { s = this._min_scale; }
//     if (this._ab_view_s === s) { return; }
//  
//     this._ab_view_s = s;
//     
//     this._applyInsideTransformation2D (clb);
//     
//     // refresh scroll views according scale and rotiation
// //    if (this._scroll) { this._scroll_refresh (this._pinch); }
//   },
  
  /**
   * @protected
   * @function
   */
//   _applyInsideTransformation2D: function (clb)
//   {
//     var transform = '', callback, self = this;
//     
//     callback = function (event) 
//     {
//       // do nothing if that event just bubbled from our target's sub-tree
//       if (event.currentTarget !== self._sub_view) { return; }
// 
//       self._sub_view.removeEventListener
//         ('webkitTransitionEnd', callback, false);
//       
//       if (clb) { clb.call (self); }
//     }
// 
//     // apply translation, therefor a strange bug appear (flick)
//     if (SUPPORT_3D_TRANSFORM)
//       transform += 
//         "translate3d("+this._ab_view_t_x+"px,"+this._ab_view_t_y+"px,0)";
//     else
//       transform += 
//         "translate("+this._ab_view_t_x+"px,"+this._ab_view_t_y+"px)";
// 
//     if (this._ab_view_r)
//     {
//       transform += " rotate(" + this._ab_view_r + "deg)";
//     }
//     if (this._ab_view_s !== 1)
//     {
//       transform += " scale(" + this._ab_view_s + ")";
//     }
//     
//     if (clb)
//     {
//       this._sub_view.addEventListener ('webkitTransitionEnd', callback, false);
//     }
//     setElementTransform (this._sub_view, transform);
//   },
  
  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    View.prototype._updateSize.call (this);
    this.refresh ();
  },
  
  _setup_iscroll : function () {
    if (this.__iscroll__)
    {
      this.__iscroll__.destroy ();
      this.__iscroll__ = undefined;
    }
  
    if (this.view && this._sub_view)
    {
      var options = {};
      options.bubbling = false;
//      options.bounce = false;
//      options.momentum = false;
      options.hScroll = false;
      options.vScroll = false;
      if (this._scroll === 1)
      {
        options.vScroll = true;
      }
      else if (this._scroll === 2)
      {
        options.hScroll = true;
      }
      else if (this._scroll === 3)
      {
        options.hScroll = true;
        options.vScroll = true;
      }
      
      // For any case, do not show the scroll bar
//       options.hScrollbar = false;
//       options.vScrollbar = false;
 
      this.__iscroll__ = new iScroll (this.view, this._sub_view, options);

      this.refresh ();
    }
  }
};
util.extendClass (ScrollView, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ScrollView, {
'delegate': {
  /** 
   * Set the delegate.
   * It should implements following methods
   *  <ul>
   *    <li/>viewWillStartZooming : function (vs.ui.ScrollView the view)
   *    <li/>viewDidEndZooming : function (vs.ui.ScrollView the view, number scale)
   *  </ul>
   * @name vs.ui.ScrollView#delegate 
   * @type {Object}
   */ 
  set : function (v)
  {
    this._delegate = v;
  }
},
'scroll': {
  /** 
   * Allow to scroll the view.
   * By default it not allowed
   * @name vs.ui.ScrollView#scroll 
   * @type {boolean|number}
   */ 
  set : function (v)
  {
    if (v === this._scroll) return;
    if (!v)
    {
      if (this.__iscroll__)
      {
        this.__iscroll__.destroy ();
        this.__iscroll__ = undefined;
      }
      this._scroll = false;
    }
    else if (v === true || v === 1 || v === 2 || v === 3)
    {
      this._scroll = v;
      this._setup_iscroll ();
    }
  },
  
  /** 
   * @ignore
   * @type {boolean}
   */ 
  get : function ()
  {
    return this._scroll;
  }
},
'pinch': {  
  /** 
   * Configures the view pinch.
   * By default it not allowed (vs.ui.ScrollView.NO_PINCH)
   * @name vs.ui.ScrollView#pinch 
   * @type {number}
   * @see vs.ui.ScrollView.NO_PINCH
   * @see vs.ui.ScrollView.SCALE
   * @see vs.ui.ScrollView.ROTATION
   * @see vs.ui.ScrollView.ROTATION_AND_SCALE
   */ 
  set : function (v)
  {
    if (v !== ScrollView.NO_PINCH && v !== ScrollView.ROTATION  &&
        v !== ScrollView.SCALE  && v !== ScrollView.ROTATION_AND_SCALE)
    { return; }
    
    if (!this.view) { return; }

//     if (v === ScrollView.NO_PINCH && this._pinch !== ScrollView.NO_PINCH)
//     {
//       this.view.removeEventListener ('gesturestart', this);
//     }
//     else if (v !== ScrollView.NO_PINCH && this._pinch === ScrollView.NO_PINCH)
//     {
//       this.view.addEventListener ('gesturestart', this);
// //      this.view.addEventListener ('touchstart', this);
//     }
    this._pinch = v;
  }
},
'animationDuration': {
  /** 
   * Set the animation/transition temporisation (in millisecond)
   * @name vs.ui.ScrollView#animationDuration 
   * @type {number}
   */ 
  set : function (time)
  {
    if (!time) { time = 0; }
    if (!util.isNumber (time)) { return };
    
    this._animation_duration = time;
    
    if (!this._sub_view) { return; }
    
    this._sub_view.style.webkitTransitionDuration = time + 'ms';
    
    if (this.hScrollbar || this.vScrollbar)
    {
      this._scroll_transition_time (time);
    }
  }
},
'layout': {
  /** 
   * This property allows you to specify a layout for the children
   * <p>
   * <ul>
   *    <li /> vs.ui.View.DEFAULT_LAYOUT
   *    <li /> vs.ui.View.HORIZONTAL_LAYOUT
   *    <li /> vs.ui.View.VERTICAL_LAYOUT
   *    <li /> vs.ui.View.ABSOLUTE_LAYOUT
   *    <li /> vs.ui.View.FLOW_LAYOUT
   * </ul>
   * @name vs.ui.ScrollView#layout 
   * @type String
   */ 
  set : function (v)
  {
    if (v !== View.HORIZONTAL_LAYOUT &&
        v !== View.DEFAULT_LAYOUT &&
        v !== View.ABSOLUTE_LAYOUT &&
        v !== View.VERTICAL_LAYOUT &&
        v !== View.FLOW_LAYOUT && v)
    {
      console.error ("Unsupported layout '" + v + "'!");
      return;
    }

    if (!this._sub_view)
    { 
      this._layout = v;
      return;
    }

    if (this._layout)
    {
      util.removeClassName (this.view, this._layout);
    }
    this._layout = v;
    if (this._layout)
    {
      util.addClassName (this.view, this._layout);
    }
  }
}
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ScrollView = ScrollView;
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
 *  The vs.ui.ScrollImageView class
 *
 *  @extends vs.ui.ScrollView
 *  @class
 *  An vs.ui.ScrollImageView embeds an image in your application.
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> load. Fired when the image is loaded.
 *  </ul>
 *
 *  @example
 *  var config = {}
 *  var config.id = 'myImg';
 *  var config.src = 'http://xxx/xxx/img.png;
 *
 *  var img = vs.ui.ScrollImageView (config);
 *  img.init ();
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.ScrollImageView
 *
 *  @constructor
 *   Creates a new vs.ui.ScrollImageView.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ScrollImageView (config)
{
  this.parent = ScrollView;
  this.parent (config);
  this.constructor = ScrollImageView;
}

/**
 * No stretch.<br/>
 * Image proportion is respected, but a part can be hidden if
 * its size is bigger than widget's size.
 * @name vs.ui.ScrollImageView.STRETCH_NONE
 * @const
 */
ScrollImageView.STRETCH_NONE = 0;

/**
 * Image is stretched to fit the widget width and height.<br/>
 * Image proportion could be not respected.
 * @name vs.ui.ScrollImageView.STRETCH_FILL
 * @const
 */
ScrollImageView.STRETCH_FILL = 1;

/**
 * Image is stretched to fit the widget width or height.<br/>
 * Image proportion is respected and the entire image is visible.
 * @name vs.ui.ScrollImageView.STRETCH_UNIFORM
 * @const
 */
ScrollImageView.STRETCH_UNIFORM = 2;

/**
 * Image is stretched to fit the widget width or height.<br/>
 * Image proportion is respected and a part of the image can be hidden.
 * @name vs.ui.ScrollImageView.STRETCH_UNIFORM_FILL
 * @const
 */
ScrollImageView.STRETCH_UNIFORM_FILL = 3;

ScrollImageView.prototype = {

  /**
   * @protected
   * @type {Image}
   */
  _image_data: null,

  /**
   * @protected
   * @type {number}
   */
  _image_width: 0,

  /**
   * @protected
   * @type {Image}
   */
  _image_height: 0,

  /**
   * @protected
   * @type {boolean}
   */
  _image_loaded: false,

  /**
   * The image url
   * @private
   * @type {string}
   */
  _src: null,

  /**
   * The image stretch to fit the view or not
   * @private
   * @type {number}
   */
  _stretch: ScrollImageView.STRETCH_FILL,

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this._sub_view)
    {
      this._image_data.onload = null;
      delete (this._image_data);
      this._image_loaded = false;

      // force image free
      this._sub_view.src = 
        'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    }
    
    ScrollView.prototype.destructor.call (this);
  },
     
  /**
   * @ignore vs.ui.View#show
   * @function
   */
  show: function ()
  {
    ScrollView.prototype.show.call (this);
    // reapply stretch mode
    this.stretch = this._stretch;
  },
  
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    if (this.__scroll_activated) { this._scroll_refresh (this._pinch); }
  },

  /**
   * @protected
   * @function
   */
  _image_onload : function (event)
  { 
    this._image_loaded = true;
    this._image_width = this._image_data.width;
    this._image_height = this._image_data.height;
    
    if (this._sub_view)
    {
      this._sub_view.src = this._src;
    }
    this.stretch = this._stretch;
    this.propagate ('load');
    
    var self = this;
    setTimeout (function ()
    {
      self.refresh ();
//      self._applyInsideTransformation ();
    }, 0);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    ScrollView.prototype.initComponent.call (this);

    var self = this, size;
    this._image_data = new Image ();
    this._image_data.onload = function (e) { self._image_onload (e); };
    
    this.pinch = this._pinch;
    this.pan = this._pan;

    // init default image src with the attribute node img.src
    // if it exists. Use getAttribute instead of direct property
    // in order to have a relative path (without base)
    if (this._sub_view && this._sub_view.src)
    {
      this._src = this._sub_view.getAttribute ('src');
      this._image_data.src = this._src;
      this._image_onload ();
    }

    if (this._sub_view)
    {
      this._sub_view.ondragstart =
        function (e) { e.preventDefault(); return false; }

      // reapply stretch mode
      this.stretch = this._stretch;
    }
    
    this.refresh ();
//    this._applyInsideTransformation ();
  }
};
util.extendClass (ScrollImageView, ScrollView);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ScrollImageView, {

'src': {
  /**
   * Set the image url
   * @name vs.ui.ScrollImageView#src 
   * @type {string}
   */
  set : function (v)
  {
    if (!util.isString (v)) { return; }
    
    this._image_loaded = false;
    this._src = v;
    this._image_data.src = this._src;
  },

  /**
   * @ignore
   * Get the image url
   * @return {string}
   */
  get : function ()
  {
    return this._src;
  }
},
'stretch': {
  /**
   * Configure the image to fit the view or to keep its original size.
   * <p>The property can take four values : 
   * <ul>
   *   <li/>vs.ui.ScrollImageView.STRETCH_NONE;
   *   <li/>vs.ui.ScrollImageView.STRETCH_FILL;
   *   <li/>vs.ui.ScrollImageView.STRETCH_UNIFORM;
   *   <li/>vs.ui.ScrollImageView.STRETCH_UNIFORM_FILL.
   * </ul>
   * @name vs.ui.ScrollImageView#stretch 
   * @type {number}
   */
  set : function (v)
  {
    if (!util.isNumber (v)) { return; }
    if (v !== ScrollImageView.STRETCH_FILL &&
        v !== ScrollImageView.STRETCH_NONE &&
        v !== ScrollImageView.STRETCH_UNIFORM && 
        v !== ScrollImageView.STRETCH_UNIFORM_FILL)
    { return; }
    
    this._stretch = v;
    
    if (!this._sub_view || !this._image_loaded) { return; }
    
    if (this._stretch === ScrollImageView.STRETCH_FILL)
    {
      this._sub_view.setAttribute ('width', "100%");
      this._sub_view.setAttribute ('height', "100%");
    }
    else if (this._stretch === ScrollImageView.STRETCH_NONE)
    {
      this._sub_view.removeAttribute ('width');
      this._sub_view.removeAttribute ('height');
    }
    else if (this._stretch === ScrollImageView.STRETCH_UNIFORM)
    {
      var r1 = this._size[0] / this._size[1],
        r2 = this._image_width / this._image_height,
        delta = 0, scale = 1;
      
      if (r1 < r2)
      {
        scale = this._image_width / this._size[0];
        delta = (this._size[1] - this._image_height / scale) / 2;
        this._sub_view.setAttribute ('width', "100%");
        this._sub_view.removeAttribute ('height');
        this._sub_view.style.left = "0px";
        this._sub_view.style.top = delta + "px";
      }
      else
      {
        scale = this._image_height / this._size[1];
        delta = (this._size[0] - this._image_width / scale) / 2;
        this._sub_view.removeAttribute ('width');
        this._sub_view.setAttribute ('height', "100%");
        this._sub_view.style.top = "0px";
        this._sub_view.style.left = delta + "px";
      }
    }
    else if (this._stretch === ScrollImageView.STRETCH_UNIFORM_FILL)
    {
      var r1 = this._size[0] / this._size[1],
        r2 = this._image_width / this._image_height;
      
      if (r1 > r2)
      {
        this._sub_view.setAttribute ('width', "100%");
        this._sub_view.removeAttribute ('height');
      }
      else
      {
        this._sub_view.removeAttribute ('width');
        this._sub_view.setAttribute ('height', "100%");
      }
    }
  },

  /**
   * @ignore
   * Get the image stretch mode (vs.ui.ScrollImageView.STRETCH_FILL or 
   * vs.ui.ScrollImageView.STRETCH_NONE)
   * @return {number}
   */
  get : function ()
  {
    return this._stretch;
  }
},
'size': {
  /**
   * Set the image size
   * @name vs.ui.ScrollImageView#size 
   *
   * @type {Array.<number>}
   */
  set : function (v)
  {
    if (!util.isArray (v) && v.length !== 2)
    {
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
    }
    
    // reapply stretch mode
    this.stretch = this._stretch;
    
    this._size [0] = v [0];
    this._size [1] = v [1];
    this._updateSize ();
  },

  /**
   * @ignore
   * @return {Array.<number>} v
   */
  get : function ()
  {
    if (this.view && this.view.parentNode)
    {
      this._size [0] = this.view.offsetWidth;
      this._size [1] = this.view.offsetHeight;
    }
    return this._size.slice ();
  }
}
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ScrollImageView = ScrollImageView;
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
 * A vs.ui.TextArea.
 * @constructor
 * @name vs.ui.TextArea
 * @extends vs.ui.View
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> continuous_change: data [text]; the current text
 *    <li/> change: data [text]: Data is the current text
 *  </ul>
 *  <p>
 */
function TextArea (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = TextArea;
}

TextArea.prototype = {
  
  /**
   * Translate value on x
   * @private
   * @type {number}
   */
  _ab_view_t_x : 0,

  /**
   * Translate value on y
   * @private
   * @type {number}
   */
  _ab_view_t_y : 0,

  /**
   * The text value
   * @protected
   * @type {string}
   */
  _value: "",

/*****************************************************************
 *
 ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this.view.removeEventListener ('change', this);
    this.view.removeEventListener ('focus', this);
    this.view.removeEventListener ('blur', this);
    this.view.removeEventListener ('textInput', this);

    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    if (!util.isString (this._value)) {return;}
    
    this.view.value = this._value;

    this.view.addEventListener ('textInput', this);
    this.view.addEventListener ('change', this);
    this.view.addEventListener ('focus', this);
    this.view.addEventListener ('blur', this);
  },
    
  /**
   *  Set the focus to your input
   *
   * @name vs.ui.TextArea#setFocus 
   * @function
   */
  setFocus : function ()
  {
    this.view.focus ();
  },

  /**
   *  Remove the focus to your input
   *
   * @name vs.ui.TextArea#setBlur 
   * @function
   */
  setBlur : function ()
  {
    this.view.blur ();
  },

  /*****************************************************************
   *                Events Management
   ****************************************************************/

  /**
   *  set pointer events
   *  @TODO a documenter un peu
   *
   * @name vs.ui.TextArea#setPointerEvents 
   * @function
   */
  setPointerEvents : function (v)
  {
    if (v)
    { this._text_field.style.pointerEvents = 'none'; }
    else
    { this._text_field.style.pointerEvents = 'auto'; }
  },

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var self = this;
    function manageBlur (event)
    {
      if (event.src === self.view)
      { return; }
      
      vs.removePointerListener (document, core.POINTER_START, manageBlur, true);
      self.setBlur ();
    }
    
    switch (event.type)
    {
      case 'focus':
        vs.addPointerListener (document, core.POINTER_START, manageBlur, true);
      break;

      case 'blur':
      break;
      
      case 'change':
        this._value = this.view.value;
        this.propertyChange ();
        this.propagate ('change', this._value);
        break;
        
      case  'textInput':
        this._value = this.view.value;
        this.propertyChange ();
        this.propagate ('continuous_change', this._value);
        break;
    }
  }
};
util.extendClass (TextArea, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (TextArea, "value", {
  /**
   * Set the text value
   * @param {string} v
   */
  set : function (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    this._value = v;
    
    this.view.value = v;
  },

  /**
   * @ignore
   * get the text value
   * @type {string}
   */
  get : function ()
  {
    return this._value;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.TextArea = TextArea;
/*
  COPYRIGHT NOTICE
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
 *  The vs.ui.Button class
 *
 *  @extends vs.ui.View
 *  @class
 *  The Button class is a subclass of vs.ui.View that intercepts pointer-down
 *  events and sends an 'select' event to a target object when it’s clicked
 *  or pressed.
 *
 *  Events:
 *  <ul>
 *    <li /> select: Fired after the button is clicked or pressed.
 *  </ul>
 *  <p>
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'mybutton';
 *  var config.text = 'Hello';
 *
 *  var myButton = Button (config);
 *  myButton.init ();
 *
 *  @example
 *  // Button with our own style
 *  var config = {}
 *  var config.id = 'mybutton';
 *  var config.text = 'Hello';
 *
 *  var myButton = vs.ui.Button (config);
 *  myButton.init ();
 *
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.Button
 *
 *  @constructor
 *   Creates a new vs.ui.Button.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function Button (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Button;
}

/**
 * default button
 * @name vs.ui.Button.DEFAULT_TYPE
 * @const
 */
Button.DEFAULT_TYPE = 'default';

/**
 * default style button
 * @name vs.ui.Button.DEFAULT_STYLE
 * @const
 */
Button.DEFAULT_STYLE = 'default_style';

/**
 * default style button
 * @name vs.ui.Button.GREEN_STYLE
 * @const
 */
Button.GREEN_STYLE = 'green';

/**
 * default style button
 * @name vs.ui.Button.RED_STYLE
 * @const
 */
Button.RED_STYLE = 'red';

/**
 * default style button
 * @name vs.ui.Button.GREY_STYLE
 * @const
 */
Button.GREY_STYLE = 'grey';

/**
 * Navigation button
 * @name vs.ui.Button.NAVIGATION_TYPE
 * @const
 */
Button.NAVIGATION_TYPE = 'nav';

/**
 * back button
 * @name vs.ui.Button.NAVIGATION_BACK_TYPE
 * @const
 */
Button.NAVIGATION_BACK_TYPE = 'nav_back';

/**
 * forward button
 * @name vs.ui.Button.NAVIGATION_FORWARD_TYPE
 * @const
 */
Button.NAVIGATION_FORWARD_TYPE = 'nav_forward';

/**
 * iPhone/iPad default style button
 * @name vs.ui.Button.BLUE_STYLE
 * @const
 */
Button.BLUE_STYLE = 'blue_style';

/**
 * iPhone/iPad black style button
 * @name vs.ui.Button.BLACK_STYLE
 * @const
 */
Button.BLACK_STYLE = 'black_style';

/**
 * iPhone/iPad silver style button
 * @name vs.ui.Button.SILVER_STYLE
 * @const
 */
Button.SILVER_STYLE = 'silver_style';

Button.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @private
   * @type {boolean}
   */
  __touch_binding: false,
  __is_touched: false,

  /**
   *
   * @protected
   * @type {number}
   */
  _style: Button.DEFAULT_STYLE,

  /**
   *
   * @protected
   * @type {number}
   */
  _type: Button.DEFAULT_TYPE,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _selected: false,

  /**
   *
   * @protected
   * @type {string}
   */
  _text: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _released_image: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _selected_image: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _disabled_image: "",

  /*****************************************************************
   *               General methods
   ****************************************************************/
    
  /**
   * @protected
   * @function
   */
  _setPressed : function (v)
  {
    if (v)
    {
      this.addClassName ('pressed');
      this._selected = true;
    }
    else
    {
      this.removeClassName ('pressed');
      this._selected = false;
    }
  },
  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__touch_binding)
    {
      vs.removePointerListener (this.view, core.POINTER_START, this);
      this.__touch_binding = false;
    }
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this.text_view = this.view.firstElementChild;

    if (!this.__touch_binding)
    {
      vs.addPointerListener (this.view, core.POINTER_START, this);
      this.__touch_binding = true;
    }

    if (this._text)
    {
      this.text = this._text;
    }
    else
    {
      this.text = "";
    }
    this.view.name = this.id;
    if (this._style) this.addClassName (this._style);
    if (this._type) this.addClassName (this._type);
  },

  /*****************************************************************
   *               Pointer events management
   ****************************************************************/
    
  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    if (!this._enable) { return; }
    var self = this;
    
    // by default cancel any default behavior to avoid scroll
    e.preventDefault ();
        
    switch (e.type)
    {
      case core.POINTER_START:
        if (this.__is_touched) { return; }
        // prevent multi touch events
        if (e.nbPointers > 1) { return; }
        
        // we keep the event
        e.stopPropagation ();
        
        if (this.__button_time_out)
        {
          clearTimeout (this.__button_time_out);
          this.__button_time_out = 0;
        }
        
        this._setPressed (true);
        vs.addPointerListener (document, core.POINTER_END, this);
        vs.addPointerListener (document, core.POINTER_MOVE, this);
        this.__start_x = e.pointerList[0].pageX;
        this.__start_y = e.pointerList[0].pageY;
        this.__is_touched = true;
        
        return false;
      break;

      case core.POINTER_MOVE:
        if (!this.__is_touched) { return; }

        var dx = e.pointerList[0].pageX - this.__start_x;
        var dy = e.pointerList[0].pageY - this.__start_y;
          
        if (Math.abs (dx) + Math.abs (dy) < View.MOVE_THRESHOLD)
        {
          // we keep the event
          e.stopPropagation ();
          return false;
        }
 
        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);
        this.__is_touched = false;

        this._setPressed (false);
        
        return false;
      break;

      case core.POINTER_END:
        if (!this.__is_touched) { return; }
        this.__is_touched = false;
        
        // we keep the event
        e.stopPropagation ();

        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);

        this.__button_time_out = setTimeout (function ()
        {
          self._setPressed (false);
          self.__button_time_out = 0;
        }, View.UNSELECT_DELAY);        
  
        this.propagate ('select');
        
        return false;
      break;
    }
  }
};
util.extendClass (Button, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Button, {
  'text': {
    /** 
     * Getter|Setter for text. Allow to get or change the text draw
     * by the button
     * @name vs.ui.Button#text 
     * @type String
     */ 
    set : function (v)
    {
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; }
        v = v.toString ();
      }
  
      this._text = v;
      if (this.text_view)
      {
        util.setElementInnerText (this.text_view, this._text);
      }
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text;
    }
  },
  'style': {
    /** 
     * Getter|Setter for the button style (for instance blue, sliver, ...)
     * @name vs.ui.Button#style 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      // code to remove legacy spec
      v = v.replace ('_ios', '');
      
      if (this._style)
      {
        this.removeClassName (this._style);
      }
      this._style = v;
      this.addClassName (this._style);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._style;
    }
  },
  'type': {
    /** 
     * Getter|Setter for the button type (DEFAULT_TYPE, NAVIGATION_TYPE,…)
     * @name vs.ui.Button#type 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (this._type)
      {
        this.removeClassName (this._type);
      }
      this._type = v;
      this.addClassName (this._type);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._type;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Button = Button;
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
 *  The vs.ui.AbstractList class
 *
 *  @extends vs.ui.View
 *  @class
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.AbstractList.
 * @name vs.ui.AbstractList
 *
 *  @example
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function AbstractList (config)
{
  this.parent = ScrollView;
  this.parent (config);
  this.constructor = AbstractList;
}

AbstractList.prototype = {

 /**********************************************************************
                 General data for the list
  *********************************************************************/

   /**
   * @protected
   * @type {boolean}
   */
  _items_selectable : true,
  
   /**
   * @protected
   * @type {boolean}
   */
  _scroll: 0,
  
  /**
   * @private
   * @type {vs.core.Array}
   */
  _model: null,
       
 /**********************************************************************
                  Data Used for managing scroll states
  *********************************************************************/
  
  /**
   *  @private
   */
   __elem : null,
     
  /**
   * @private
   * @type {int}
   */
  __scroll_start: 0,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  add : function () { },
  
  /**
   * @protected
   * @function
   */
  remove : function (child) {},
      
 /**********************************************************************

  *********************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
    
    this._model.unbindChange (null, this, this._modelChanged);
    if (this._model_allocated) util.free (this._model);
    this._model_allocated = false;
  },
  
  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    View.prototype.initComponent.call (this);
    
    this._model = new vs.core.Array ();
    this._model.init ();
    this._model_allocated = true;
    this._model.bindChange (null, this, this._modelChanged);
    
    // manage list template without x-hag-hole="item_children"
    if (!this._holes.item_children) {
      this._holes.item_children = this.view.querySelector ('ul');
    }
    
    this._list_items = this._sub_view = this._holes.item_children;

    this._renderData (this._items_selectable);
    this.refresh ();
  },
    
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    if (this.__iscroll__) this.__iscroll__.refresh ();
  },

  /**
   * @protected
   * @function
   */
  _modelChanged : function ()
  {
    // TODO   on peut mieux faire : au lieu de faire
    // un init skin qui vire tout et reconstruit tout, on pourrait
    // ne gerer que la difference
    this._renderData (this._items_selectable);
    this.refresh ();
  },
    
  /**
   * @protected
   * @function
   */
  _renderData : function () {},
    
  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item) {},
      
  /**
   * @protected
   * @function
   */
  _untouchItemFeedback : function (item) {},

  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item) {},

  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    var elem = e.currentTarget, self = this, pageY, pageX,
      time, pos, index;
    
    if (e.type === 'click')
    {
      // Cancel default behavior
      e.stopPropagation ();
      e.preventDefault();
      return;
    }
    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }

      this.__touch_start = e.pointerList[0].pageY;
  
      vs.addPointerListener (document, core.POINTER_MOVE, this, false);
      vs.addPointerListener (document, core.POINTER_END, this, false);
      
      if (!this._items_selectable)
      { return false; }
      
      if (elem === this.view)
      {
        this.__elem = null;
        return;
      }
      this.__elem = elem;

      if (this.__list_time_out)
      {
        clearTimeout (this.__list_time_out);
      }
      if (this.__elem_to_unselect)
      {
        this._untouchItemFeedback (this.__elem_to_unselect);
        this.__elem_to_unselect = null;
      }

      this.__list_time_out = setTimeout (function ()
      {
        self._touchItemFeedback (elem);
        self.__list_time_out = 0;
      }, View.SELECT_DELAY);
    }
    else if (e.type === core.POINTER_MOVE)
    {
      pageY = e.pointerList[0].pageY;
      this.__delta = pageY - this.__touch_start;  
            
      // this is a move, not a selection => deactivate the selected element
      // if needs
      if (this.__elem && (Math.abs (this.__delta) > View.MOVE_THRESHOLD))
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);
          this.__list_time_out = 0;
        }
        this._untouchItemFeedback (this.__elem);
        this.__elem = null;
      }            
    }
    else if (e.type === core.POINTER_END)
    {
      // Stop tracking when the last finger is removed from this element
      vs.removePointerListener (document, core.POINTER_MOVE, this);
      vs.removePointerListener (document, core.POINTER_END, this);
      
      if (this.__delta) { this.__scroll_start += this.__delta; }
      
      // a item is selected. propagate the change
      if (this.__elem)
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);
          this._touchItemFeedback (this.__elem);
        }

        this.__elem_to_unselect = this.__elem;
        
        this.__list_time_out = setTimeout (function ()
        {
          self._untouchItemFeedback (self.__elem_to_unselect);
          self.__elem_to_unselect = null;
          self.__list_time_out = 0;
        }, View.UNSELECT_DELAY);

        this._updateSelectItem (this.__elem);
      }

      this.__delta = 0;
      this.__elem = null;
    }
    return false;
  },

//   /**
//    * @protected
//    * @function
//    */
//   _scrollToElement: function (el, delta)
//   {
//     if (!el) { return; }
//     var pos;
//     
//     var pos_el = util.getElementAbsolutePosition (el);
//     var pos_list = util.getElementAbsolutePosition (this.view);
//     this.__max_scroll = this.size [1] - this._list_items.offsetHeight;
//     
//     if (!delta) { delta = 0; }
//     
//     var scroll = this.__scroll_start + (pos_list.y - pos_el.y) + delta
//     scroll = scroll > 0 ? 0 : scroll < this.__max_scroll ? this.__max_scroll : scroll;
// 
//     // animate the list
//     this._list_items.style.webkitTransition = '0.3s ease-out';
//     
//     this.__scroll_start = scroll;
//     
//     if (SUPPORT_3D_TRANSFORM)
//       setElementTransform
//         (this._list_items, 'translate3d(0,' + scroll + 'px,0)');
//     else
//       setElementTransform
//         (this._list_items, 'translate(0,' + scroll + 'px)');    
//     
//     // animate the scroll
//     if (this._scrollbar) this._scrollbar.setPosition (scroll);
//   }  
};
util.extendClass (AbstractList, ScrollView);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (AbstractList, {

  'scroll': {
    /** 
     * Allow to scroll the list items.
     * By default it not allowed
     * @name vs.ui.CheckBox#scroll 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      {
        this._scroll = ScrollView.VERTICAL_SCROLL;
        this._setup_iscroll ();
      }
      else
      {
        if (this.__iscroll__)
        {
          this.__iscroll__.destroy ();
          this.__iscroll__ = undefined;
        }
        this._scroll = false;
      }
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._scroll?true:false;
    }
  },
  
  'model': {
    /** 
     * Getter|Setter for data. Allow to get or change the vertical list
     * @name vs.ui.AbstractList#model 
     *
     * @type vs.core.Array
     */ 
    set : function (v)
    {
      if (!v) return;
      
      if (util.isArray (v))
      {
        this._model.removeAll ();
        this._model.add.apply (this._model, v);
      }
      else if (v.toJSON && v.propertyChange)
      {
        if (this._model_allocated)
        {
          this._model.unbindChange (null, this, this._modelChanged);
          util.free (this._model);
        }
        this._model_allocated = false;
        this._model = v;
        this._model.bindChange (null, this, this._modelChanged);
      }
      else return;
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._model;
    }
  },
  
  'data': {
    /** 
     * Getter|Setter for data. Allow to get or change the vertical list
     * @name vs.ui.AbstractList#data 
     *
     * @deprecated
     * @see vs.ui.AbstractList#model 
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v)) return;
      
      if (!this._model_allocated)
      {
        this._model = new vs.core.Array ();
        this._model.init ();
        this._model_allocated = true;
        this._model.bindChange (null, this, this._modelChanged);
      }
      else
      {
        this._model.removeAll ();
      }
      this._model.add.apply (this._model, v);

      this._modelChanged ();
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._model._data.slice ();
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.AbstractList = AbstractList;
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
 * @public
 * @name vs.ui.AbstractListItem
 */
var AbstractListItem = function (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = AbstractListItem;
}

AbstractListItem.prototype = {

  /**
   * @protected
   * @function
   */
  _index: 0,

  /**
   * @protected
   * @function
   */
  _pressed: false,
 
  /**
   * @protected
   * @function
   */
  _visible: true,
  
 /**********************************************************************
                 General method
  *********************************************************************/
  /**
   * This method should be implemented to manage item selection
   *
   * @name vs.ui.AbstractListItem#didSelect 
   * @function
   */
  didSelect : function () {}
};
util.extendClass (AbstractListItem, View);

util.defineClassProperties (AbstractListItem, {

  'pressed': {
    /** 
     * @name vs.ui.AbstractListItem#pressed 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (!this.view) { return; }
      
      if (v)
      {
        this.addClassName ('pressed');
        this._pressed = true;
      }
      else
      {
        this.removeClassName ('pressed');
        this._pressed = false;
      }
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._pressed;
    }
  },
  
  'index': {
    /** 
     * @name vs.ui.AbstractListItem#index 
     *
     * @type {number}
     */ 
    set : function (v)
    {
      this._index = v;
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._index;
    }
  }
});

/**
 * @name vs.ui.DefaultListItem
 * @private
 */
function DefaultListItem ()
{
  this.parent = AbstractListItem;
  this.parent ();
  this.constructor = AbstractListItem;
}

DefaultListItem.prototype = {

  _title: "",
  _label: "",

 /**********************************************************************
                  In/Out properties declarations 
  *********************************************************************/

  /** 
   * @name vs.ui.DefaultListItem#title
   */ 
  set title (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._title = v;
    if (this.view)
    {
      util.setElementInnerText (this.view, this._title);
      this.view.appendChild (this._label_view);
    }
  },

  /** 
   */ 
  set label (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._label = v;
    if (this.view)
    {
      util.setElementInnerText (this._label_view, this._label);
    }
    if (this._label && !this._label_view.parentNode)
      this.view.appendChild (this._label_view);
    if (!this._label && this._label_view.parentNode)
      this.view.removeChild (this._label_view);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    if (!this.__config__) this.__config__ = {};
    this.__config__.id = this.id;

    if (!this.__config__.node)
      this.__config__.node = document.createElement ('li');
      
    AbstractListItem.prototype.initComponent.call (this);

    this._label_view = document.createElement ('span');
  }
};
util.extendClass (DefaultListItem, AbstractListItem);

/**
 * @name vs.ui.SimpleListItem
 * @private
 */
function SimpleListItem (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = SimpleListItem;
}

SimpleListItem.prototype = {

  _title: "",

 /**********************************************************************
                  In/Out properties declarations 
  *********************************************************************/
  /** 
   * @name vs.ui.SimpleListItem#title
   */ 
  set title (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._title = v;
    if (this.view)
    {
      util.setElementInnerText (this.title_view, this._title);
    }
  },

 /**********************************************************************

  *********************************************************************/
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    if (!this.__config__) this.__config__ = {};
    this.__config__.id = this.id;

    if (!this.__config__.node)
    {
      this.__config__.node = document.createElement ('div');
      this.__config__.node.className = 'simplelist_item';
      
      var div = document.createElement ('div');
      div.className = 'title';
      this.__config__.node.appendChild (div);
    }
      
    AbstractListItem.prototype.initComponent.call (this);

    this._label_view = document.createElement ('span');

    this.title_view = this.view.querySelector ('.title');
  }
};
util.extendClass (SimpleListItem, View);

/**********************************************************************
 
           Block List and Tab List section

*********************************************************************/

/**
 * @private
 */
function buildSection (list, title, index, itemsSelectable)
{
  var section = document.createElement ('li'), 
    title_view = document.createElement ('div'), 
    content = document.createElement ('ul'), 
    cells, item, obj, data = list._model;

  while (index < data.length)
  {
    item = data.item (index);
    if (util.isString (item)) { break; }
    
    item = data.item (index);
    if (list.__template_obj)
    {
      listItem = list.__template_obj.clone ();
    }
    else
    {
      listItem = new DefaultListItem ().init ();
    }
    // model update management
    if (item instanceof core.Model)
    {
      listItem.link (item);
    }
    else
    {
      listItem.configure (item)
    }
    listItem.index = index;

    if (itemsSelectable)
    {
      vs.addPointerListener (listItem.view, core.POINTER_START, list);
    }
    content.appendChild (listItem.view);
    list.__item_obs.push (listItem);
    listItem.__parent = list;
    index ++;
  }
  if (title)
  {
    
    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_MEEGO ||
        os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      title_view.appendChild (document.createElement ('div'));
      var tmp_title = document.createElement ('div');
      tmp_title.appendChild (document.createTextNode (title));
      title_view.appendChild (tmp_title);
    }
    else
    {
      util.setElementInnerText (title_view, title);
    }
    section.appendChild (title_view);
  }
  if (content.childElementCount > 0)
  {
    section.appendChild (content);
  }
  return [section, index];
};

/**
 * @private
 */
function blockListRenderData (itemsSelectable)
{
  if (!this._model) { return; }
     
  var _list_items = this._list_items, index, item, title,
    s, width, titles, i, items;
  if (!_list_items) { return; }
   
// remove all children
  this._freeListItems ();
  
  util.removeAllElementChild (_list_items);

  if (SUPPORT_3D_TRANSFORM)
    setElementTransform (_list_items, 'translate3d(0,0,0)');
  else
    setElementTransform (_list_items, 'translate(0,0)');

  this.view.removeChild (_list_items);
  
  index = 0;
  util.setElementVisibility (_list_items, false);
  
  while (index < this._model.length)
  {
    item = this._model.item (index);
    title = null;
    if (util.isString (item))
    {
      title = item; index ++;
    }

    s = buildSection (this, title, index, itemsSelectable);
    _list_items.appendChild (s[0]);
    index = s[1];
  }
  this.view.appendChild (_list_items);
  {
    _list_items.style.width = 'auto';
  }
  util.setElementVisibility (_list_items, true);
};

/**
 * @private
 */
function tabListRenderData (itemsSelectable)
{
  if (!this._model) { return; }
     
  var _list_items = this._list_items, _direct_access = this._direct_access,
    index, item, title,
    s, width, titles, i, items;
  if (!_list_items) { return; }
   
// remove all children
  this._freeListItems ();
  
  util.removeAllElementChild (_list_items);
  util.removeAllElementChild (_direct_access);

  if (SUPPORT_3D_TRANSFORM)
    util.setElementTransform (_list_items, 'translate3d(0,0,0)');
  else
    util.setElementTransform (_list_items, 'translate(0,0)');

  this.view.removeChild (_list_items);
  this.view.removeChild (_direct_access);
  
  index = 0;
  util.setElementVisibility (_list_items, false);
  var title_index = 0;
  while (index < this._model.length)
  {
    item = this._model.item (index);
    title = null;
    if (util.isString (item))
    {
      title = item; index ++;
      var elem = document.createElement ('div');
      util.setElementInnerText (elem, title [0]);
      elem._index_ = title_index++;
      _direct_access.appendChild (elem);
    }

    s = buildSection (this, title, index, itemsSelectable);
    _list_items.appendChild (s[0]);
    index = s[1];
  }
  this.view.appendChild (_list_items);
  this.view.appendChild (_direct_access);
  _list_items.style.width = 'auto';
  util.setElementVisibility (_list_items, true);
};

/**********************************************************************
        
        
*********************************************************************/

/**
 * @private
 */
function defaultListRenderData (itemsSelectable)
{
  if (!this._model) { return; }
     
  var _list_items = this._list_items, index, item, title,
    s, width, titles, i, items;
  if (!_list_items) { return; }
   
// remove all children
  this._freeListItems ();
  
  util.removeAllElementChild (_list_items);
  
  if (SUPPORT_3D_TRANSFORM)
    setElementTransform (_list_items, 'translate3d(0,0,0)');
  else
    setElementTransform (_list_items, 'translate(0,0)');

  this.view.removeChild (_list_items);
  
  index = 0;
  util.setElementVisibility (_list_items, false);
        
  while (index < this._model.length)
  {
    item = this._model.item (index);
    if (this.__template_obj)
    {
      listItem = this.__template_obj.clone ();
    }
    else
    {
      listItem = new DefaultListItem ().init ();
    }
    // model update management
    if (item instanceof core.Model)
    {
      listItem.link (item);
    }
    else
    {
      listItem.configure (item);
    }
    listItem.index = index;

    if (itemsSelectable)
    {
      vs.addPointerListener (listItem.view, core.POINTER_START, this);
    }
    _list_items.appendChild (listItem.view);
    this.__item_obs.push (listItem);
    listItem.__parent = this;
    index ++;
  }
  this.view.appendChild (_list_items);
  _list_items.style.width = 'auto';

  util.setElementVisibility (_list_items, true);
};

/**********************************************************************
        
        
*********************************************************************/

/**
 *  The vs.ui.List class
 *
 *  @extends vs.ui.AbstractList
 *  @class
 *  The vs.ui.List class draw a list of ListItem and allows the user to 
 *  select one object from it.
 *  <p>
 *  Events:
 *  <ul>
 *    <li />itemselect, fired when a item is selected.
 *          Event Data = {index, item data}
 *  </ul>
 *  <p>
 *  To reduce performance issues, you can deactivate events handling
 *  for the list, using vs.ui.List#itemsSelectable property.
 *
 * Data can be filtered. The filter he array contains the member to filters
 * and filter:
 * @ex:
 *   list.filters = 
 *      [{property:'title', value:'o', matching:vs.ui.List.FILTER_CONTAINS, strict:true];
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.List.
 * @name vs.ui.List
 *
 *  @example
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function List (config)
{
  this.parent = AbstractList;
  this.parent (config);
  this.constructor = List;

  this.__item_obs = new Array ();
}

/**
 * @const 
 * @name vs.ui.List.FILTER_EXACTS
 */
List.FILTER_EXACTS = 0;

/**
 * @const 
 * @name vs.ui.List.FILTER_CONTAINS
 */
List.FILTER_CONTAINS = 1;

/**
 * @const 
 * @name vs.ui.List.FILTER_STARTS_WITH
 */
List.FILTER_STARTS_WITH = 2;

/**
 * @const 
 * @name vs.ui.List.BLOCK_LIST
 */
List.BLOCK_LIST = 'BlockList';

/**
 * @const 
 * @name vs.ui.List.TAB_LIST
 */
List.TAB_LIST = 'TabList';

/**
 * @const 
 * @name vs.ui.List.DEFAULT_LIST
 */
List.DEFAULT_LIST = 'DefaultList';

List.prototype = {

  _type: List.DEFAULT_LIST,
  
 /**********************************************************************
                 General data for the list
  *********************************************************************/
  
  /**
   * @private
   * @type {number}
   */
  _selected_index: 0,
  
  /**
   * @private
   * @type {number}
   */
  _selected_item: 0,
  
  /**
   * @private
   * @type {Array}
   */
  _filters: null,
  
  /**
   *  @protected
   *  @type {boolean}
   */
  _has_arrow : true,
     
 /**********************************************************************
                  Data Used for managing scroll states
  *********************************************************************/

  /**
   *  @private
   */
   __item_obs : null,
  
  /**
   *  @private
   */
   __elem : null,
     
  /**
   * @private
   * @type {vs.core.Object}
   */
  __template_obj: null,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  add : function (child, extension)
  {
    this.setItemTemplate (child);
  },
  
  /**
   *  Set the template object will be used for list item
   *  <p>
   *  The object will be automatically cloned according list data.
   *  <p>
   *  The template must have the same properties than data. For instance :
   *  @example
   *    data = [{text: "title1", nb: 5}, {text: "title2", nb: 2}];
   *    template objet must have properties named "text" and "nb"
   *
   * @name vs.ui.List#setItemTemplate 
   * @function
   * @param {vs.ui.View | Class} obj the template object;
   */
  setItemTemplate : function (obj)
  {
    if (!obj) return;
    
    if (util.isFunction (obj))
      this.__template_obj = new obj () .init ();
    else if (obj.constructor) 
      this.__template_obj = obj;
  },

  /**
   *  Set the template object will be used for list item
   *  <p>
   *  The object will be automatically cloned according list data.
   *  <p>
   *  The template must have the same properties than data. For instance :
   *  @example
   *    data = [{text: "title1", nb: 5}, {text: "title2", nb: 2}];
   *    template objet must have properties named "text" and "nb"
   *
   * @name vs.ui.List#setItemTemplateName 
   * @function
   * @param {string} name the component name
   * @return {vs.ui.View} the template object or null if an error occured
   */
  setItemTemplateName : function (name)
  {
    return this.createAndAddComponent (name, {}, 'item_children');
  },

  /**
   * @protected
   * @function
   */
  remove : function (child)
  {},
       
 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this._freeListItems ();
    AbstractList.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    AbstractList.prototype.initComponent.call (this);
    
    this.addClassName (this._type);  
    this.refresh ();
  },
  
  /**
   * Return the list of items in the vs.ui.List
   *
   * @name vs.ui.List#getItems 
   * @function
   * @return {Array} the items
   */
  getItems : function ()
  {
    if (this.__item_obs)
    {
      return this.__item_obs.slice ();
    }
    return [];
  },
  
  
  /**
   * @protected
   * @function
   */
  applyFilters : function ()
  {
    if (!this._filters || !this.__item_obs) { return; }
    
    var i, obj, item;
    
    for (i = 0; i < this.__item_obs.length; i++)
    {
      obj = this.__item_obs [i];
      item = this._model.item (obj.index);
      this.appyFiltersOnObj (obj, item);
    }
  },
  
  /**
   * @protected
   * @function
   */
  appyFiltersOnObj : function  (obj, item)
  {
    if (!this._filters || !obj || !item) { return; }
    
    var i, filter, toHide, vSrc, vTrg, l = this._filters.length;
    
    if (l === 0)
    {
      obj.show ();
      return;
    }
    for (i = 0; i < l; i++)
    {
      filter = this._filters [i];
      if (!filter.property || !filter.value)
      {
        obj.show ();
        continue;
      }
      
      toHide = false;
      vSrc = item[filter.property];
      vTrg = filter.value;
      
      if (filter.strict === false)
      {
        vSrc = vSrc.toLowerCase ();
        vTrg = vTrg.toLowerCase ();
      }
      
      switch (filter.matching)
      {
        case undefined:
        case null:
        case List.FILTER_EXACTS:
          if (vSrc !== vTrg)
          { toHide = true; }
        break;
        
        case List.FILTER_STARTS_WITH:
          if (vSrc.indexOf (vTrg) !== 0)
          { toHide = true; }
        break;
        
        case List.FILTER_CONTAINS:
          if (vSrc.indexOf (vTrg) === -1)
          { toHide = true; }
        break;
      }

      if (toHide)
      { obj.hide (); }
      else
      { obj.show (); }
    }
  },
  
  /**
   * @protected
   * @function
   */
  _freeListItems : function ()
  {
    var i, obj;
    for (i = 0 ; i < this.__item_obs.length; i ++)
    {
      obj = this.__item_obs [i];
      obj.__parent = undefined;
      util.free (obj);
    }
    
    this.__item_obs = [];
  },
  
  /**
   * @protected
   * @function
   */
  _renderData : defaultListRenderData,
  
  /**
   * @protected
   * @function
   */
  _modelChanged : function (event)
  {
    // TODO   on peut mieux faire : au lieu de faire
    // un init skin qui vire tout et reconstruit tout, on pourrait
    // ne gerer que la difference
    this._renderData (this._items_selectable);
    this.refresh ();
  },

  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item)
  {
    item._comp_.pressed = true;
  },
  
  /**
   * @private
   * @function
   */
  _untouchItemFeedback : function (item)
  {
    item._comp_.pressed = false;
  },
      
  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item)
  {
    this._selected_index = item._comp_.index;
    this._selected_item = this._model.item (this._selected_index);
    if (item._comp_ && item._comp_.didSelect) item._comp_.didSelect ();
    
    this.propertyChange ();
                
    this.propagate ('itemselect',
    {
      index: this._selected_index,
      item: this._selected_item
    });
  },
  
 /**********************************************************************
      General function for the direct access bar within Tab list
  *********************************************************************/

  init_directAccessBar : function ()
  {
    this._direct_access = document.createElement ('div');
    this._direct_access.className = 'direct_access';
    this.view.appendChild (this._direct_access);
    
    this._acces_index = 0;
    
    var self = this;
    var bar_dim, bar_pos;
    
    var getIndex = function (y) {
      if (!bar_dim || !bar_pos) return 0;
      var dy = y - bar_pos.y;
      if (dy < 0) dy = 0;
      else if (dy > bar_dim.height) dy = bar_dim.height - 1;
      
      var nb_elem = self._direct_access.childElementCount;
      return Math.floor (dy * nb_elem / bar_dim.height);
    };
    
    var accessBarStart = function (e)
    {
      e.stopPropagation ();
      e.preventDefault ();
      
      util.setElementTransform (self._list_items, '');
      self.__max_scroll = self.size [1] - self._list_items.offsetHeight;
      
      vs.addPointerListener (document, core.POINTER_MOVE, accessBarMove, false);
      vs.addPointerListener (document, core.POINTER_END, accessBarEnd, false);
      
      var _acces_index = e.srcElement._index_;
      if (!util.isNumber (_acces_index)) return;
      
      if (self._acces_index === _acces_index) return;
      self._acces_index = _acces_index;
      var newPos = -self.getTitlePosition (_acces_index);
      
      if (newPos < self.__max_scroll) newPos = self.__max_scroll;

      self.__scroll_start = newPos;

      if (SUPPORT_3D_TRANSFORM)
        util.setElementTransform
          (self._list_items, 'translate3d(0,' + newPos + 'px,0)');
      else
        util.setElementTransform
          (self._list_items, 'translate(0,' + newPos + 'px)');

      // animate the scroll
      if (self._scrollbar) self._scrollbar.setPosition (newPos);
      
      bar_dim = util.getElementDimensions (self._direct_access);
      bar_dim.height -= 10;
      bar_pos = util.getElementAbsolutePosition (self._direct_access);
      bar_pos.y += 5;

      if (self._startScrolling) self._startScrolling ();
    };
    
    var accessBarMove = function (e)
    {
      e.stopPropagation ();
      e.preventDefault ();
      
      var _acces_index = getIndex (e.pageY);
      if (!util.isNumber (_acces_index)) return;
      
      if (self._acces_index === _acces_index) return;
      self._acces_index = _acces_index;
      var newPos = -self.getTitlePosition (_acces_index);

      if (newPos < self.__max_scroll) newPos = self.__max_scroll;

      self.__scroll_start = newPos;

      if (SUPPORT_3D_TRANSFORM)
        util.setElementTransform
          (self._list_items, 'translate3d(0,' + newPos + 'px,0)');
      else
        util.setElementTransform
          (self._list_items, 'translate(0,' + newPos + 'px)');

      // animate the scroll
      if (self._scrollbar) self._scrollbar.setPosition (newPos);

      if (self._isScrolling) self._isScrolling ();
    };
    
    var accessBarEnd = function (e)
    {
      vs.removePointerListener (document, core.POINTER_MOVE, accessBarMove);
      vs.removePointerListener (document, core.POINTER_END, accessBarEnd);

      if (self._endScrolling) self._endScrolling ();
    };

    vs.addPointerListener
      (this._direct_access, core.POINTER_START, accessBarStart, false);
  },
  
  getTitlePosition : function (index)
  {
    var titleItems = this.view.querySelectorAll ('ul > li > div');
    var item = titleItems.item (index);
    if (!item) return;
    return item.parentElement.offsetTop;
  }
};
util.extendClass (List, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (List, {
  'itemsSelectable': {
    /** 
     * Allow deactivate the list item selection.
     * <p>
     * This is use full to set this property to false, if you do not listen
     * the event 'itemselect'. It will prevent unnecessary inter event 
     * management
     * which uses processing time.
     * By default its set to true
     * @name vs.ui.List#itemsSelectable 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v && this._items_selectable) { return; }
      if (!v && !this._items_selectable) { return; }
      
      if (v)
      {
        this._items_selectable = true;
        for (i = 0; i < this.__item_obs.length; i++)
        {
          obj = this.__item_obs [i];
          vs.addPointerListener (obj.view, core.POINTER_START, this, true);
        }
      }
      else
      {
        this._items_selectable = false;
        for (i = 0; i < this.__item_obs.length; i++)
        {
          obj = this.__item_obs [i];
          vs.removePointerListener (obj.view, core.POINTER_START, this, true);
        }
      }
    }
  },
  
  'selectedIndex': {
    /** 
     * Getter for selectedIndex.
     * @name vs.ui.List#selectedIndex 
     * @type {number}
     */ 
    get : function ()
    {
      return this._selected_index;
    }
  },
  
  
  'selectedItem': {
    /** 
     * Getter for selectedItem.
     * @name vs.ui.List#selectedItem 
     * @type {Object}
     */ 
    get : function ()
    {
      return this._selected_item;
    }
  },
  
  'type': {
    /** 
     * This properties allow to change the style of the List
     * Possible values ar :
     * <ul>
     *   <li/> vs.ui.List.BLOCK_LIST
     *   <li/> vs.ui.List.TAB_LIST
     *   <li/> vs.ui.List.DEFAULT_LIST
     * </ul>
     * @name vs.ui.List#type 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (v !== List.BLOCK_LIST &&
          v !== List.TAB_LIST && 
          v !== List.DEFAULT_LIST) { return; }
      
      this.removeClassName (this._type);
      this._type = v;
      this.addClassName (this._type);
      
      if (this._type === List.BLOCK_LIST)
      {
        this._renderData = blockListRenderData;
        if (this._direct_access)
        {
          this.view.removeChild (this._direct_access);
          delete (this._direct_access);
        }
      }
      if (this._type === List.TAB_LIST)
      {
        this._renderData = tabListRenderData
        if (!this._direct_access) this.init_directAccessBar ();
      }
      if (this._type === List.DEFAULT_LIST)
      {
        this._renderData = defaultListRenderData
        if (this._direct_access)
        {
          this.view.removeChild (this._direct_access);
          delete (this._direct_access);
        }
      }
      
      this._renderData (this._items_selectable);
    }
  },
  
  'hasArrow': {
    /** 
     * Show an arrow for each list item or not
     * @name vs.ui.List#hasArrow 
     *
     * @type boolean
     */ 
    set : function (v)
    {
      if (v)
      {
        this._has_arrow = true;
        this.addClassName ('arrow');
      }
      else
      {
        this._has_arrow = false;
        this.removeClassName ('arrow');
      }
    }
  },
  
  'filters': {
    /** 
     * Getter|Setter for filters. Allow to filter item data.
     * @ex:
     *   list.filters = [
     *     {
     *       property:'title',
     *       value:'o',
     *       matching:vs.ui.List.FILTER_CONTAINS,
     *       strict:true
     *     }];
     *
     * @name vs.ui.List#filters 
     *
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v)) { return; }
      this._filters = v;
      
      // TODO   on peut mieux faire : au lieu de faire
      // un init skin qui vire tout et reconstruit tout, on pourrait
      // ne gerer que la difference
      this.applyFilters ();
      this.refresh ();
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._filters;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.List = List;
/** @private */
ui.AbstractListItem = AbstractListItem;
/** @private */
ui.DefaultListItem = DefaultListItem;
/** @private */
ui.SimpleListItem = SimpleListItem;
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
 *  The vs.ui.ComboBox class
 *
 *  @extends vs.ui.View
 *  @class
 *  An implementation of a combo box. The user can select a value from the
 *  drop-down list.
 *
 *  <p>
 *  @example
 *  var config = {}
 *  config.data = ['item1, 'item2', 'item3'];
 *  config.id = vs.core.createId ();
 *
 *  var object = vs.ui.ComboBox (config);
 *  object.init ();
 *
 *  @author David Thevenin
 * @name vs.ui.ComboBox
 *
 *  @constructor
 *   Creates a new vs.ui.ComboBox.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ComboBox (config)
{
  this._data = new Array ();
  this._items = {};

  this.parent = View;
  this.parent (config);
  this.constructor = ComboBox;
}

/** @private */
ComboBox.NORMAL_MODE = 1;
ComboBox.NATIVE_MODE = 2;

ComboBox.prototype = {
    
  /**
   * @private
   * @type {Array.<string>}
   */
  _mode: ComboBox.NORMAL_MODE,

  /**
   * @private
   * @type {Array.<string>}
   */
  _data: null,

  /**
   * @private
   * @type {string}
   */
  _selected_item: null,

  /**
   * @private
   * @type {Object.<string, HTMLOptionElement>}
   */
  _items: null,

  /*****************************************************************
   *      Init
   ****************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    if (this._mode === ComboBox.NATIVE_MODE)
    {
      vs.removePointerListener (this.view, core.POINTER_START, this);
      vs.removePointerListener (this.view, core.POINTER_END, this);
    }
    else
    {
      this.nodeUnbind (this._select, 'change');
      this.nodeUnbind (this._select, 'blur');
    }

    View.prototype.destructor.call (this);
  },

  /**
   * @private
   * @function
   */
  update_gui_combo_box : function ()
  {
    if (!util.isArray (this._data)) { return; }
    
    if (this._mode === ComboBox.NORMAL_MODE)
    {
      util.removeAllElementChild (this._select);
        
      this._items = {};
  
      var i, option;
      
      for (i = 0; i < this._data.length; i++)
      {
        option = document.createElement ('option');
  
        option.appendChild (document.createTextNode (this._data [i]));
        this._items [this._data [i]] = option;
        
        this._select.appendChild (option);
      }
  
      if (this._selected_item)
      {
        this._select.value = this._selected_item;
      }
      else
      {
        this._select.selectedIndex = 0;
      }
    }
    else
    {
      util.setElementInnerText (this._select, this._selected_item);
    }
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    // PG Native GUI
    if (window.device && (
          window.device.platform.indexOf ("iPhone") !== -1 || 
          window.device.platform.indexOf ("iPad") !== -1 || 
          window.device.platform.indexOf ("Android") !== -1)
        && window.plugins.combo_picker)
    {
      this._mode = ComboBox.NATIVE_MODE;

      this._select = document.createElement ('div');
      this.view.appendChild (this._select);

      vs.addPointerListener (this.view, core.POINTER_START, this);
      vs.addPointerListener (this.view, core.POINTER_END, this);
    }
    // Normal GUI
    else
    {
      this._mode = ComboBox.NORMAL_MODE;

      this._select = document.createElement ('select');
      this.view.appendChild (this._select);

      this.nodeBind (this._select, 'change');
      this.nodeBind (this._select, 'blur');
    }

    this.update_gui_combo_box ();
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    e.preventDefault ();
    e.stopPropagation ();
    if (e.type === core.POINTER_START)
    {
      this.setFocus ();
      window.plugins.combo_picker.show (this, this._data, this._selected_item);
    }
  },
  
  /**
   * Set the focus to your input
   * @name vs.ui.ComboBox#setFocus 
   * @function
   */
  setFocus : function ()
  {
    if (this._mode === ComboBox.NATIVE_MODE)
    {
      this.addClassName ('focus');
    }
    else
    {
      this._select.focus ();
    }
  },
  
  /**
   * Remove the focus to your input
   * @name vs.ui.ComboBox#setBlur 
   * @function
   */
  setBlur : function ()
  {
    if (this._mode === ComboBox.NATIVE_MODE)
    {
      this.removeClassName ('focus');
    }
    else
    {
      this._select.blur ();
    }
  },
  
  /**
   * @protected
   * @function
   */
  notify : function (event)
  {
    if (event.type === 'change')
    {
      this._selected_item = this._select.value;
      this.propertyChange ();
      this.propagate ('change', this._selected_item);
    }
    else if (event.type === 'blur')
    {
      window.scrollTo (0, 0);
    }
  }
};
util.extendClass (ComboBox, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ComboBox, {
  'selectedItem': {
    /** 
     * Getter|Setter for an item. Allow to select or get one item
     * @name vs.ui.ComboBox#selectedItem 
     *
     * @type {String}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      this._selected_item = v;
      
      if (this._mode === ComboBox.NORMAL_MODE)
      {
        if (this._selected_item)
        {
          this._select.value = this._selected_item;
        }
        else
        {
          this._select.selectedIndex = 0;
        }
      }
      else
      {
        util.setElementInnerText (this._select, this._selected_item);
      }
    },
  
    /** 
     * @ignore
     * @type {String}
     */ 
    get : function ()
    {
      return this._selected_item;
    }
  },
  'data': {
    /** 
     * Getter|Setter for data. Allow to get or change the combo box items
     * @name vs.ui.ComboBox#data 
     *
     * @type {Array.<string>}
     */ 
    set : function (v)
    {
      if (!util.isArray (v)) { return; }
  
      this._data = v.slice ();
      
      this.update_gui_combo_box ();
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ComboBox = ComboBox;
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
 * A vs.ui.RadioButton.
 *  @class
 *  The vs.ui.RadioButton class creates a vertical radio button list which allow
 *  to select one - and just one - option from a set of alternatives.
 *  <p>
 *  If more options are to be allowed at the same time you should use 
 *  vs.ui.CheckBox instead
 *  <p>
 *  Events:
 *  <ul>
 *    <li />change, fired when a item is selected.
 *          Event Data = {index, item}
 *  <ul>
 *  <p>
 *
 *  @author David Thevenin
 *
 *  @extends vs.ui.AbstractList
 *  @constructor
 *   Creates a new vs.ui.RadioButton.
 *
 * @name vs.ui.RadioButton
 *  @example
 *  var config = {}
 *  config.data = ['item1, 'item2', 'item3'];
 *  config.id = vs.core.createId ();
 *
 *  var object = vs.ui.RadioButton (config);
 *  object.init ();
 */
function RadioButton (config)
{
  this._items = new Array ();

  this.parent = AbstractList;
  this.parent (config);
  this.constructor = RadioButton;
}

RadioButton.prototype = {

  /**
   * @private
   * @type {int}
   */
  _selected_index: -1,

  /**
   * @private
   * @type {Array.<HTMLInputElement>}
   */
  _items: null,
  
  /*****************************************************************
   *
   ****************************************************************/
      
  /**
   * @protected
   * @function
   */
  clean_gui : function ()
  {
    var input;
    
    this.__scroll_start = 0;
  
    // removes all items;
    util.removeAllElementChild (this._list_items);
  
    while (this._items.length)
    {
      input = this._items [0];
      
      vs.removePointerListener (input, core.POINTER_START, this);
      input.removeEventListener ('click', this);
      this._items.remove (0);
    }
  },

  /**
   * @protected
   * @function
   */
  _renderData : function ()
  {
    if (!this._model) { return; }
    
    var i, input, item, l;
    
    if (!this._list_items)
    {
      console.error ('vs.ui.RadioButton uncorrectly initialized.');
      return;
    }

    this.clean_gui ();
    this._selected_index = -1;
    var os_device = window.deviceConfiguration.os;
    
    for (i = 0, l = this._model.length; i < l; i++)
    {
      item = this._model.item (i);
      input = document.createElement ('input');
      input.type = 'radio';
      input.name = this._id;
      input.value = i;
      input.id = this._id + "_l" + i;
      
      this._list_items.appendChild (input);
      this._items [i] = input;
      vs.addPointerListener (input, core.POINTER_START, this);
      input.addEventListener ('click', this);
      
      label = document.createElement ('label');
      label.value = i;
      label.setAttribute ("for", this._id + "_l" + i);
      vs.addPointerListener (label, core.POINTER_START, this);
      label.addEventListener ('click', this);
      util.setElementInnerText (label, item);
      this._list_items.appendChild (label);
    }
    this.refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item)
  {
    util.addClassName (item, 'pressed');
  },
  
  /**
   * @private
   * @function
   */
  _untouchItemFeedback : function (item)
  {
    util.removeClassName (item, 'pressed');
  },
      
  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item)
  {
    var index = parseInt (item.value);
    if (item._comp_ && item._comp_.didSelect) item._comp_.didSelect ();
    
    if (index >= 0 || index < this._items.length) 
    {
      this.selectedIndex = index;
      this.propertyChange ();
      this.propagate ('change',
      {
        index: this._selected_index,
        item: this._model.item (this._selected_index)
      });
    }
  }
};
util.extendClass (RadioButton, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (RadioButton, "selectedIndex", {
  /** 
   * Set the vs.ui.RadioButton selectedIndex
   *
   * @name vs.ui.RadioButton#selectedIndex 
   * @type {int}
   */ 
  set : function (v)
  {
    if (!util.isNumber (v))
    {
      v = parseInt (v);
    }
    
    if (isNaN (v)) { return; }
    if (v < 0 || v > this._items.length - 1) { return; }

    if (this._items [v])
    {
      var item = this._items [v];
      if (item)
      {
        item.checked = true;
      }
      this._selected_index = v;
    }
  },

  /** 
   * @ignore
   * Get the vs.ui.RadioButton selectedIndex
   * @type {int}
   */ 
  get : function ()
  {
    return this._selected_index;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.RadioButton = RadioButton;
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
 *  A vs.ui.CheckBox.
 *  @class
 *  The vs.ui.CheckBox class creates a vertical checkbox list which allow to 
 *  select one or more options from a set of alternatives.
 *  <p>
 *  If only one option is to be selected at a time you should use vs.ui.RadioButton
 *  instead
 *  <p>
 *  Events:
 *  <ul>
 *    <li />change, fired when a item is selected.
 *          Event Data = index
 *  <ul>
 *  <p>
 *
 *  @author David Thevenin
 * @name vs.ui.CheckBox
 *
 *  @extends vs.ui.AbstractList
 *  @constructor
 *   Creates a new vs.ui.CheckBox.
 *
 *  @example
 *  var config = {}
 *  config.data = ['item1, 'item2', 'item3'];
 *  config.id = vs.core.createId ();
 *
 *  var object = vs.ui.CheckBox (config);
 *  object.init ();
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function CheckBox (config)
{
  this._items = new Array ();

  this.parent = AbstractList;
  this.parent (config);
  this.constructor = CheckBox;
  
  this._selected_indexes = new Array ();
}

CheckBox.prototype = {

  /**
   * @private
   * @type Array.<int>
   */
  _selected_indexes: null,

  /**
   * @private
   * @type {Array.<HTMLImputElement>}
   */
  _items: null,

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * This method select on unselect a item
   *
   * @name vs.ui.CheckBox#selectItem
   * @function
   * @param {int} index the item index to select/unselect
   */
  selectItem : function (index)
  {
    if (!util.isNumber (index)) { return; }
    if (index < 0 || index >= this._items.length) { return; }
    
    var item = this._items [index];
    if (!item) { return; }
    
    for (var i = 0; i < this._selected_indexes.length; i++)
    {
      if (this._selected_indexes [i] === index)
      {
        this._selected_indexes.remove (i);
        item.checked = false;
        return;
      }
    }
    
    // the item is not selected. Selected it.
    this._selected_indexes.push (index);
    item.checked = true;
  },
    
  /*****************************************************************
   *
   ****************************************************************/
    
  /**
   * @protected
   * @function
   */
  clean_gui : function ()
  {
    var input;
    
    this.__scroll_start = 0;
  
    // removes all items;
    util.removeAllElementChild (this._list_items);
  
    while (this._items.length)
    {
      input = this._items [0];
      
      vs.removePointerListener (input, core.POINTER_START, this);
      input.removeEventListener ('click', this);
      this._items.remove (0);
    }
  },
  
  /**
   * @protected
   * @function
   */
  _renderData : function ()
  {
    if (!this._model) { return; }
    
    var i, l, div, title, button, item;
    if (!this._list_items)
    {
      console.error ('vs.ui.RadioButton uncorrectly initialized.');
      return;
    }
   
    this._selected_indexes = [];
    this.clean_gui ();
    var os_device = window.deviceConfiguration.os;
    
    for (i = 0, l = this._model.length; i < l; i++)
    {
      item = this._model.item (i);
      input = document.createElement ('input');
      input.type = 'checkbox';
      input.name = this._id;
      input.id = this._id + "_l" + i;
      input.value = i;

      this._list_items.appendChild (input);
      this._items [i] = input;
      
      vs.addPointerListener (input, core.POINTER_START, this);
      input.addEventListener ('click', this);

      label = document.createElement ('label');
      label.value = i;
      label.setAttribute ("for", this._id + "_l" + i);
      vs.addPointerListener (label, core.POINTER_START, this);
      label.addEventListener ('click', this);
      util.setElementInnerText (label, item);
      this._list_items.appendChild (label);
    }
    
    // select items
    this.selectedItem = this._selected_indexes;
  },
  
  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item)
  {
    util.addClassName (item, 'pressed');
  },
  
  /**
  * @private
  */
  _untouchItemFeedback : function (item)
  {
    util.removeClassName (item, 'pressed');
  },
      
  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item)
  {
    var index = parseInt (item.value);
    if (item._comp_ && item._comp_.didSelect) item._comp_.didSelect ();
    
    if (index >= 0 || index < this._items.length) 
    {
      this.selectItem (index);
      this.propertyChange ();
      
      items = new Array ();
      for (i = 0, l = this._selected_indexes.length; i < l; i ++)
      {
        items.push (this._model.item (this._selected_indexes [i]));
      }
      
      this.propagate ('change',
      {
        indexes: this._selected_indexes.slice (),
        items: items
      });
    }
  }
};
util.extendClass (CheckBox, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (CheckBox, "selectedIndexes", {
  /** 
   * Getter|Setter for items. Allow to select or get one or more items
   * @name vs.ui.CheckBox#selectedIndexes
   *
   * @type {Array.<int>}
   */ 
  set : function (v)
  {
    if (!util.isArray (v)) { return; }
    
    var index, len, i, item;
    
    this._selected_indexes = [];
    for (i = 0; i < v.length; i++)
    {
      index = v [i];
      if (!util.isNumber (index)) { continue; }
      
      this._selected_indexes.push (index);
    }
    
    for (i = 0; i < this._items.length; i ++)
    {
      var item = this._items [i];
      if (item)
      {
        item.checked = false;
      }
    }
    
    len = this._selected_indexes.length;
    for (i = 0; i < len; i++)
    {
      var item = this._items [this._selected_indexes[i]];
      if (item)
      {
        item.checked = true;
      }
    }
  },
  
  /**
   * @ignore
   * @type {Array.<int>}
   */
  get : function ()
  {
    return this._selected_indexes.slice ();
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.CheckBox = CheckBox;
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
 *  The vs.ui.NavivationBar class implements a view for controlling navigation
 *  on content views.
 *
 *  @extends vs.ui.View
 *  @class
 *  This bar is displayed at the top of the parent view,
 *  Typically it includes navigation buttons, or a title.
 *  But it can contains any custom widgets.
 *  <p>
 *
 *  @example
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.NavigationBar.
 * @name vs.ui.NavigationBar
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function NavigationBar (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = NavigationBar;
  
  this._states = {};
}

/**
 * Blue style tab bar (defaut)
 * @name vs.ui.NavigationBar.DEFAULT_STYLE
 * @const
 */
NavigationBar.DEFAULT_STYLE = 'blue_style';

/**
 * Black translucide style tab bar
 * @name vs.ui.NavigationBar.BLACK_TRANSLUCIDE_STYLE
 * @const
 */
NavigationBar.BLACK_TRANSLUCIDE_STYLE = 'black_translucide_style';

/**
 * Black style tab bar
 * @name vs.ui.NavigationBar.BLACK_STYLE
 * @const
 */
NavigationBar.BLACK_STYLE = 'black_style';

NavigationBar.prototype = {
  
/********************************************************************
                  protected members declarations
********************************************************************/

  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _hide_animation: null,
  
  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _show_animation: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _style: NavigationBar.DEFAULT_STYLE,

  /**
   * States configuration.
   * For a given state name, give the list of visible widgets in the navigation
   * bar.
   *
   * @protected
   * @type {Object}
   */
  _states : null,

  /**
   * The current state name.
   * @protected
   * @type {string}
   */
  _current_state : null,
  
/********************************************************************
                general initialisation declarations
********************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },
    
  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    View.prototype.initComponent.call (this);

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this._hide_animation = new vs.fx.Animation (['translateY', '-50px']);
    }
    else
    {
      this._hide_animation = new vs.fx.Animation (['translateY', '-44px']);
    }
    this._show_animation = new vs.fx.Animation (['translateY', '0px']);

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      util.setElementStyle (this.view, {
        left: '0px', top: '0px', bottom: 'auto', 
        width: '100%', height: '50px'
      });
    }
    else
    {
      util.setElementStyle (this.view, {
        left: '0px', top: '0px', bottom: 'auto', 
        width: '100%', height: '44px'
      });
    }
    this.style = this._style;
  },
  
/********************************************************************
                    States definitions
********************************************************************/
  
  /**
   *  Set a list of visible widgets per a state name.
   *
   *  Widgets view will be automatically added to the navigation bar view
   *  if its need.
   *
   * @name vs.ui.NavigationBar#setStateItems
   * @function
   *
   * @param {String} state The state name  
   * @param {Array} items The list of widget (pointers on widget)  
   */
  setStateItems : function (state, items)
  {
    var i;
    
    if (!state || !util.isString (state)) { return; }
    if (!items || !util.isArray (items)) { return; }
    
    this._states [state] = items.slice ();
    
    if (this._current_state === state)
    {
      // hide all children except those have to be shown
      for (key in this._children)
      {
        children = this._children [key];
        if (util.isArray (children))
        {
          for (i = 0; i < children.length; i++)
          {
            obj = children [i];
            if (items.findItem (obj) >= 0) { continue; }
            
            if (obj && obj.hide) { obj.hide (); }
          }
        }
        else
        { if (children.hide) { children.hide (); } }
      }
  
      for (i = 0; i < items.length; i++)
      {
        obj = items [i];
        if (!this.isChild (obj))
        {
          this.add (obj, 'children');
        }
        obj.show ();
      }
    }
    else
    {
      for (i = 0; i < items.length; i++)
      {
        obj = items [i];
        if (!this.isChild (obj))
        {
          this.add (obj, 'children');
        }
      }
    }
  },
  
  /**
   *  Return the list of visible widgets for a state name.
   *  Return undefined if the state is undefined.
   *
   * @name vs.ui.NavigationBar#getStateItems
   * @function
   *
   * @param {String} state The state name  
   * @return {Array} items The list of widget (pointers on widget)  
   */
  getStateItems : function (state, items)
  {
    if (!state || !util.isString (state)) { return undefined; }
    
    if (this._states [state])
    {
      return this._states [state].slice ();
    }
    else
    {
      return undefined;
    }
  },
  
  /**
   *  Apply a state to the Navigatio Bar.
   *  Only widgets associated to the state will be showed.
   *
   * @name vs.ui.NavigationBar#changeState
   * @function
   *
   * @param {String} state The state name  
   * @param {Object} conf Optional configuration parameters 
   *     Structure have to follow : {comp_id: {prop: value}}
   */
  changeState : function (state, conf)
  {
    if (!state) { return; }
    var i = 0, length, children, objs_to_show, obj, key, data;
    
    this._current_state = state;
    objs_to_show = this._states [this._current_state];
    if (!objs_to_show)
    { objs_to_show = []; }
    length = objs_to_show.length;
    
    // hide all children except those have to be shown
    for (key in this._children)
    {
      children = this._children [key];
      if (util.isArray (children))
      {
        for (i = 0; i < children.length; i++)
        {
          obj = children [i];
          if (objs_to_show.findItem (obj) >= 0) { continue; }
          
          if (obj && obj.hide) { obj.hide (); }
        }
      }
      else
      { if (children.hide) { children.hide (); } }
    }
    
    // show all children associate to this state and configure them if needs
    for (i = 0; i < length; i++)
    {
      obj = objs_to_show [i];
      if (conf && conf [obj.id])
      {
        data = conf [obj.id];
        for (key in data)
        {
          if (key)
          {
            obj [key] = data [key];
          }
        }
      }
      if (obj) { obj.show (); }
    }
  },

/********************************************************************
                  events management
********************************************************************/

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var self = event.currentTarget;
    
    switch (event.type)
    {
      case core.POINTER_START:
        util.addClassName (self, 'active');
        vs.addPointerListener (event.currentTarget, core.POINTER_END, this, true);
        vs.addPointerListener (event.currentTarget, core.POINTER_MOVE, this, true);
      break;

      case core.POINTER_END:
        vs.removePointerListener (event.currentTarget, core.POINTER_END, this);
        vs.removePointerListener (event.currentTarget, core.POINTER_MOVE, this);        
        
        setTimeout (function () 
          { util.removeClassName (self, 'active'); }, 200);
        this.propagate ('buttonselect', event.currentTarget.spec);
      break;

      case core.POINTER_MOVE:
        event.preventDefault ();
        setTimeout (function () 
          { util.removeClassName (self, 'active'); }, 200);
        vs.removePointerListener (event.currentTarget, core.POINTER_END, this);
        vs.removePointerListener (event.currentTarget, core.POINTER_MOVE, this);
      break;
    }
  },
  
/********************************************************************
                  add / remove buttons
********************************************************************/

  /**
   *  Remove the specified child component from this component.
   * 
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ui.NavigationBar#remove
   * @function
   *
   * @param {vs.ui.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    var state, items;
    
    View.prototype.remove.call (this, child);
    
    for (state in this._states)
    {
      items = this._states [state];
      if (items.indexOf (child) !== -1)
      {
        items.remove (child);
      }
    }
  }
};
util.extendClass (NavigationBar, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (NavigationBar, {
  'style': {
    /** 
     * Getter|Setter for the tab bar style
     * @name vs.ui.NavigationBar#style 
     * @type String
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (this._style)
      {
        this.removeClassName (this._style);
      }
      this._style = v;
      this.addClassName (this._style);
    },
  
    /** 
     * @ignore
     * @return {String}
     */ 
    get : function ()
    {
      return this._style;
    }
  },
  
  'position': {
    /**
     * @ignore
     * @private
     */
    set : function (v)
    {
  //    util.setElementStyle (this.view, {left: '0px', top: '0px', bottom: 'auto'});
    },
    
    /**
     * @ignore
     * @private
     */
    get : function ()
    {
      return [this.view.offsetLeft, this.view.offsetTop];
    }
  },
  
  'size': {
    /**
     * @ignore
     * @private
     */
    set : function (v)
    {
  //    util.setElementStyle (this.view, {width: '100%', height: '44px'});
    },
  
    /**
     * @ignore
     * @private
     */
    get : function ()
    {
      return [this.view.offsetWidth, this.view.offsetHeight];
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.NavigationBar = NavigationBar;
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
 *  The vs.ui.ToolBar class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ToolBar class implements a control for selecting buttons.
 *  The vs.ui.ToolBar class provides the ability for the user to customize the tab bar
 *  by reordering, removing, and adding items to the bar.
 *  <p>
 *  When a tabbar button is selected the tabbar send an event named
 *  'itemselect'.
 *  The event data contains the id of the selected button.
 *
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'bar';
 *
 *  var bar = vs.ui.ToolBar (config);
 *  bar.init ();
 *  bar.addButton ('attach', vs.ui.ToolBar.BUTTON_ATTACH);
 *
 *  bar.addButton ('right', 
 *    vs.ui.ToolBar.BUTTON_ARROW_RIGHT,
 *    vs.ui.ToolBar.RIGHT_POSITION);
 *
 *  bar.addButton ('left',
 *    vs.ui.ToolBar.BUTTON_ARROW_LEFT,
 *    vs.ui.ToolBar.LEFT_POSITION);
 *
 *  bar.bind ('itemselect', this);
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ToolBar (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ToolBar;
  
  this._items = {};
}

/**
 * Black style tab bar (defaut)
 * @name vs.ui.ToolBar.DEFAULT_STYLE
 * @const
 */
ToolBar.DEFAULT_STYLE = 'black_style';

/**
 * Black translucide style tab bar
 * @name vs.ui.ToolBar.BLACK_TRANSLUCIDE_STYLE
 * @const
 */
ToolBar.BLACK_TRANSLUCIDE_STYLE = 'black_translucide_style';

/**
 * Blue style tab bar
 * @name vs.ui.ToolBar.BLUE_STYLE
 * @const
 */
ToolBar.BLUE_STYLE = 'blue_style';

/**
 * Left Position for a button
 * @name vs.ui.ToolBar.LEFT_POSITION
 */
ToolBar.LEFT_POSITION = 'left';

/**
 * Right Position for a button
 * @name vs.ui.ToolBar.RIGHT_POSITION
 */
ToolBar.RIGHT_POSITION = 'right';


ToolBar.prototype = {
  
/********************************************************************
                  protected members declarations
********************************************************************/

  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _hide_animation: null,
  
  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _show_animation: null,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _style: ToolBar.DEFAULT_STYLE,

  /**
   * The configuration of the tab bar (list of button, type and position)
   * @private
   * @type {Array.<Array>}
   */
  _configuration: [],

  /**
   * The reference array on tabbar's items
   * @private
   * @type {object.<string>}
   */
  _items: null,
  
/********************************************************************
                general initialisation declarations
********************************************************************/
    
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    View.prototype.initComponent.call (this);

    this._hide_animation = new vs.fx.Animation (['translateY', '44px']);
    this._show_animation = new vs.fx.Animation (['translateY', '0px']);

    util.setElementStyle (this.view, {
      left: '0px', top: 'auto', bottom: '0px', 
      width: '100%', height: '44px'
    });
    
    this.style = this._style;
  },
  
/********************************************************************
                  events management
********************************************************************/

  /**
   * @protected
   * @function
   */
  notify : function (event)
  {
    this.propagate ('itemselect', event.data);
  },
  
/********************************************************************
                  add / remove buttons
********************************************************************/

  /**
   *  Add a button to the ToolBar
   *
   * @name vs.ui.ToolBar#addButton
   * @function
   *
   * @param {string} id An unique identifier for the button. This id will be
   *                 send as event data if the button is pressed.
   * @param {string} name The identifier of the button to add.
   * @param {string} position The position of the button. (should be
   *    vs.ui.ToolBar.LEFT_POSITION or vs.ui.ToolBar.RIGHT_POSITION)
   * @return {vs.ui.ToolBar.Button}
   */
  addButton : function (id, name, position)
  {
    if (this._items [id]) { return; }
    
    var config = {id: id};
    var button = new ToolBar.Button (config);
    button.init ();
    if (position) { button.position = position; }
    button.name = name;
    
    this.add (button, 'children')
    button.bind ('select', this);
    
    this._items [id] = button;
    return button;
  },
  
  /**
   *  Add a generic vs.ui.ToolBar item to the ToolBar
   *
   * @name vs.ui.ToolBar#addItem
   * @function
   *
   * @param {vs.ui.ToolBar.item} obj the item to add.
   */
  addItem : function (item)
  {
    if (!item || this._items [item.id]) { return; }
    
    this.add (item, 'children')
    item.bind ('select', this);
    
    this._items [item.id] = item;
  },

  /**
   *  Remove an item from the ToolBar
   *
   * @name vs.ui.ToolBar#removeItem
   * @function
   *
   * @param {string} id the identifier for the item to remove.
   */
  removeItem : function (id)
  {
    var item = this._items [id];
    if (!item) { return; }
    
    try { this.remove (item); } catch (e) {}
    item.unbind ('select', this);
    
    delete (this._items [id]);
  }
};
util.extendClass (ToolBar, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ToolBar, {
  'style': {
    /** 
     * Getter|Setter for the tab bar style
     * @name vs.ui.ToolBar#style 
     * @type String
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (this._style)
      {
        this.removeClassName (this._style);
      }
      this._style = v;
      this.addClassName (this._style);
    },
  
    /** 
     * @ignore
     * @return {String}
     */ 
    get : function ()
    {
      return this._style;
    }
  }, 
  'configuration': {
    /**
     * Set a vs.ui.ToolBar configuration
     * <p>
     * A configuration is an array of button specification.<br/>
     * Q button specification is a array of 2 or 3 values:
     * <ol>
     *   <li>The button id (a String)
     *   <li>The button type (a String).
     *       <br/>Ex: vs.ui.ToolBar.BUTTON_BLOG, vs.ui.ToolBar.BUTTON_ARROW_RIGHT
     *   <li> A optional position.
     *       <br/>Ex: vs.ui.ToolBar.LEFT_POSITION or vs.ui.ToolBar.RIGHT_POSITION
     *     <br/> The default value is vs.ui.ToolBar.LEFT_POSITION.
     * </ol>   
     * @name vs.ui.ToolBar#configuration 
     *
     * @type {Array.<Array>}
     */
    set : function (v)
    {
      if (!util.isArray (v)) { return; }
      
      var id, i, spec;
      
      this._configuration = v;
      
      // 1) remove all previous buttons
      for (id in this._items)
      {
        this.removeItem (id);
      }    
  
      // 2) add new buttons
      for (i = 0; i < v.length; i++)
      {
        spec = v [i];
        this.addButton (spec[0], spec[1], spec[2]);
      }    
    }
  },
  'position': {
    /**
     * @ignore
     * @private
     */
    set : function (v) {},
    
    /**
     * @ignore
     * @private
     */
    get : function () 
    {
      return [this.view.offsetLeft, this.view.offsetTop];
    }
  },
  'size': {
    /**
     * @ignore
     * @private
     */
    set : function (v) {},
    /**
     * @ignore
     * @private
     */
    get : function () 
    {
      return [this.view.offsetWidth, this.view.offsetHeight];
    }
  }
});

/**
 *  The vs.ui.ToolBar.Item  abstract class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ToolBar.Item class is an abstract class for implementing controls
 *  for the vs.ui.ToolBar.
 *  <p>
 *  @see vs.ui.ToolBar.Button
 *  @see vs.ui.ToolBar.Text
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar.Item 
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.
 *
 * @name vs.ui.ToolBar.Item
 *
 * @param {Object} config the configuration structure [mandatory]
 */
ToolBar.Item = function (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ToolBar.Item;
}

ToolBar.Item.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @private
   * @type {String}
   */
  _position: ToolBar.LEFT_POSITION,
  
  /*****************************************************************
   *               init methods
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    var glow = document.createElement ('div');
    this.view.appendChild (glow);

    this.addClassName (this._position);
    this.view.addEventListener (core.POINTER_START, this, true);
  },

  /*****************************************************************
   *               events methods
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var self = event.currentTarget;
    
    switch (event.type)
    {
      case core.POINTER_START:
        util.addClassName (self, 'active');
        vs.addPointerListener (event.currentTarget, core.POINTER_END, this, true);
        vs.addPointerListener (event.currentTarget, core.POINTER_MOVE, this, true);
      break;

      case core.POINTER_END:
        vs.removePointerListener (event.currentTarget, core.POINTER_END, this);
        vs.removePointerListener (event.currentTarget, core.POINTER_MOVE, this);
                
        window.setTimeout (function () { util.removeClassName (self, 'active'); }, 200);
        this.propagate ('select', this.id);
      break;

      case core.POINTER_MOVE:
        event.preventDefault ();
        window.setTimeout (function () { util.removeClassName (self, 'active'); }, 200);
        vs.removePointerListener (event.currentTarget, core.POINTER_END, this);
        vs.removePointerListener (event.currentTarget, core.POINTER_MOVE, this);
      break;
    }
  }
};
util.extendClass (ToolBar.Item, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (ToolBar.Item, "position", {
  /** 
   * Set the position of the button (LEFT or RIGHT)
   *
   * @name vs.ui.ToolBar.Item#position
   *
   * @type String
   */ 
  set : function (v)
  {
    if (v !== ToolBar.LEFT_POSITION && v !== ToolBar.RIGHT_POSITION)
    { return; }
    
    if (this._position) { this.removeClassName (this._position); }

    this._position = v;
    this.addClassName (this._position);
  },

  /** 
   * @ignore
   * @return {string}
   */ 
  get : function ()
  {
    return this._position;
  }
});

/**
 *  The vs.ui.ToolBar.Text class
 *
 *  @extends vs.ui.ToolBar.Item
 *  @class
 *  The vs.ui.ToolBar.Text class implements a text control for the vs.ui.ToolBar.
 *  It provides the ability for the user to customize the tab bar with the
 *  you own text which is selectable.
 *
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'bar';
 *
 *  var bar = vs.ui.ToolBar (config);
 *  bar.init ();
 *
 *  var label = vs.ui.ToolBar.Text ({id:"info"});
 *  label.init ();
 *  label.text = "Information";
 *  label.position = vs.ui.ToolBar.LEFT_POSITION;
 *  bar.addItem (label);
 *
 *
 *  bar.bind ('itemselect', this);
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar.Text 
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.Text.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
ToolBar.Text = function (config)
{
  this.parent = ToolBar.Item;
  this.parent (config);
  this.constructor = ToolBar.Text;
}

ToolBar.Text.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/

  /**
   *
   * @private
   * @type {String}
   */
  _text: "",
  
  /*****************************************************************
  *               init methods
  ****************************************************************/

  /**
   * Object default init. <p>
   * Must be call after the new.
   * @ignore
   * @name vs.ui.ToolBar.Text#initComponent
   */
  initComponent : function ()
  {
    if (!this.__config__) { this.__config__ = {}; }
    this.__config__.id = this.id;
    if (!this.__config__.node)
    {
      this.__config__.node = document.createElement ('div');
      this.__config__.node.className = 'vs_ui_toolbar_text';
    }

    ToolBar.Item.prototype.initComponent.call (this);

    var glow, div, text_view;
    
    this._text_view = document.createElement ('div');
    this._text_view.className = "text_view";
    this.view.appendChild (this._text_view);

    glow = document.createElement ('div');
    glow.className = "glow_view";
    this.view.appendChild (glow);
    
    div = document.createElement ('div');
    glow.appendChild (div);
  }
};
util.extendClass (ToolBar.Text, ToolBar.Item);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (ToolBar.Text, "text", {

  /** 
   * The text of the item
   * @name vs.ui.ToolBar.Text#text 
   * @type String
   */ 
  set : function (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._text = v;
    if (this._text_view)
    {
      util.setElementInnerText (this._text_view, this._text);
    }
  },

  /** 
   * @ignore
   * @return {string}
   */ 
  get : function ()
  {
    return this._text;
  }
});

/**
 *  The vs.ui.ToolBar.Button class
 *
 *  @extends vs.ui.ToolBar.Item
 *  @class
 *  The vs.ui.ToolBar.Button class implements a button control for the vs.ui.ToolBar.
 *  It provides the ability for the user to customize the tab bar with the
 *  you own button image.
 *
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'bar';
 *
 *  var bar = vs.ui.ToolBar (config);
 *  bar.init ();
 *
 *  var button = vs.ui.ToolBar.Button ({id:"back"});
 *  button.init ();
 *  button.setImage ("resources/images/back_icon.png);
 *  button.position = vs.ui.ToolBar.LEFT_POSITION;
 *  bar.addItem (button);
 *
 *
 *  bar.bind ('itemselect', this);
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar.Button
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.Button.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
ToolBar.Button = function (config)
{
  this.parent = ToolBar.Item;
  this.parent (config);
  this.constructor = ToolBar.Button;
}

ToolBar.Button.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/

  /**
   *
   * @private
   * @type {String}
   */
  _name: "",
  
  /*****************************************************************
   *               General methods
   ****************************************************************/
   
  /**
   * Object default init. <p>
   * Must be call after the new.
   * @ignore
   * @function
   * @name vs.ui.ToolBar.Text#initComponent
   */
  initComponent : function ()
  {
    if (!this.__config__) { this.__config__ = {}; }
    this.__config__.id = this.id;
    if (!this.__config__.node)
    {
      this.__config__.node = document.createElement ('div');
      this.__config__.node.className = 'vs_ui_toolbar_button';
    }

    ToolBar.Item.prototype.initComponent.call (this);
  
    this.size = [30, 30];
  },
  
  /**
   * Allows to set a background image for the ToolBar button
   *
   * @name vs.ui.ToolBar.Button#setImage
   * @function
   *
   * @param {String} button image path
   */
  setImage : function (path)
  {
    this.view.style.backgroundImage = 'url(' + path + ')';
  }
};
util.extendClass (ToolBar.Button, ToolBar.Item);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (ToolBar.Button, "name", {
  /** 
   * The name of the button from the list (vs.ui.ToolBar.BUTTON_ADD,...)
   * If you want use you own button with your own image, you can set it
   * using "setImage" method.
   *
   * @name vs.ui.ToolBar.Button#name 
   *
   * @type String
   */ 
  set : function (v)
  {
    if (!util.isString (v)) { return; }

    this._name = v;
    this.addClassName (this._name);
  },

  /** 
   * @ignore
   * @return {string}
   */ 
  get : function ()
  {
    return this._name;
  }
});


/** @name vs.ui.ToolBar.BUTTON_ADD */
ToolBar.BUTTON_ADD = 'add';
/** @name vs.ui.ToolBar.BUTTON_ARROW_DOWN */
ToolBar.BUTTON_ARROW_DOWN = 'arrow_down';
/** @name vs.ui.ToolBar.BUTTON_ARROW_LEFT */
ToolBar.BUTTON_ARROW_LEFT = 'arrow_left';
/** @name vs.ui.ToolBar.BUTTON_ARROW_RIGHT */
ToolBar.BUTTON_ARROW_RIGHT = 'arrow_right';
/** @name vs.ui.ToolBar.BUTTON_ARROW_UP */
ToolBar.BUTTON_ARROW_UP = 'arrow_up';
/** @name vs.ui.ToolBar.BUTTON_ATTACH */
ToolBar.BUTTON_ATTACH = 'attach';
/** @name vs.ui.ToolBar.BUTTON_AUCTION */
ToolBar.BUTTON_AUCTION = 'auction';
/** @name vs.ui.ToolBar.BUTTON_BELL_OFF */
ToolBar.BUTTON_BELL_OFF = 'bell_off';
/** @name vs.ui.ToolBar.BUTTON_BELL */
ToolBar.BUTTON_BELL = 'bell';
/** @name vs.ui.ToolBar.BUTTON_BLOG */
ToolBar.BUTTON_BLOG = 'blog';
/** @name vs.ui.ToolBar.BUTTON_BOOK_MARKED */
ToolBar.BUTTON_BOOK_MARKED = 'book_marked';
/** @name vs.ui.ToolBar.BUTTON_BOOK */
ToolBar.BUTTON_BOOK = 'book';
/** @name vs.ui.ToolBar.BUTTON_BOOKMARK_ADD */
ToolBar.BUTTON_BOOKMARK_ADD = 'bookmark_add';
/** @name vs.ui.ToolBar.BUTTON_BOORMARK */
ToolBar.BUTTON_BOORMARK = 'bookmark';
/** @name vs.ui.ToolBar.BUTTON_BOX_FULL */
ToolBar.BUTTON_BOX_FULL = 'box_full';
/** @name vs.ui.ToolBar.BUTTON_BOX_MAIL */
ToolBar.BUTTON_BOX_MAIL = 'box_mail';
/** @name vs.ui.ToolBar.BUTTON_BOX */
ToolBar.BUTTON_BOX = 'box';
/** @name vs.ui.ToolBar.BUTTON_BRIGHTNESS */
ToolBar.BUTTON_BRIGHTNESS = 'brightness';
/** @name vs.ui.ToolBar.BUTTON_BRUSH */
ToolBar.BUTTON_BRUSH = 'brush';
/** @name vs.ui.ToolBar.BUTTON_BULB_OFF */
ToolBar.BUTTON_BULB_OFF = 'bulb_off';
/** @name vs.ui.ToolBar.BUTTON_BULB_ON */
ToolBar.BUTTON_BULB_ON = 'bulb_on';
/** @name vs.ui.ToolBar.BUTTON_BUZZER */
ToolBar.BUTTON_BUZZER = 'buzzer';
/** @name vs.ui.ToolBar.BUTTON_CALCULATOR */
ToolBar.BUTTON_CALCULATOR = 'calculator';
/** @name vs.ui.ToolBar.BUTTON_CALENDAR */
ToolBar.BUTTON_CALENDAR = 'calendar';
/** @name vs.ui.ToolBar.BUTTON_CALL */
ToolBar.BUTTON_CALL = 'call';
/** @name vs.ui.ToolBar.BUTTON_CANCEL */
ToolBar.BUTTON_CANCEL = 'cancel';
/** @name vs.ui.ToolBar.BUTTON_CASE */
ToolBar.BUTTON_CASE = 'case';
/** @name vs.ui.ToolBar.BUTTON_CHECKMARK */
ToolBar.BUTTON_CHECKMARK = 'checkmark';
/** @name vs.ui.ToolBar.BUTTON_CIRCLE_ARROW_LEFT */
ToolBar.BUTTON_CIRCLE_ARROW_LEFT = 'circle_arrow_left';
/** @name vs.ui.ToolBar.BUTTON_CIRCLE_ARROW_RIGHT */
ToolBar.BUTTON_CIRCLE_ARROW_RIGHT = 'circle_arrow_right';
/** @name vs.ui.ToolBar.BUTTON_COMMAND_LINE */
ToolBar.BUTTON_COMMAND_LINE = 'command_line';
/** @name vs.ui.ToolBar.BUTTON_COMMENT_ADD */
ToolBar.BUTTON_COMMENT_ADD = 'command_add';
/** @name vs.ui.ToolBar.BUTTON_COMMENT_DELETE */
ToolBar.BUTTON_COMMENT_DELETE = 'command_delete';
/** @name vs.ui.ToolBar.BUTTON_COMMENT_OK */
ToolBar.BUTTON_COMMENT_OK = 'command_ok';
/** @name vs.ui.ToolBar.BUTTON_COMPUTER_OFF */
ToolBar.BUTTON_COMPUTER_OFF = 'computer_off';
/** @name vs.ui.ToolBar.BUTTON_COMPUTER_ON */
ToolBar.BUTTON_COMPUTER_ON = 'computer_on';
/** @name vs.ui.ToolBar.BUTTON_CONSTRAST */
ToolBar.BUTTON_CONSTRAST = 'contrast';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_1 */
ToolBar.BUTTON_CONTROL_1 = 'controls_1';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_2 */
ToolBar.BUTTON_CONTROL_2 = 'controls_2';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_3 */
ToolBar.BUTTON_CONTROL_3 = 'controls_3';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_4 */
ToolBar.BUTTON_CONTROL_4 = 'controls_4';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_5 */
ToolBar.BUTTON_CONTROL_5 = 'controls_5';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_6 */
ToolBar.BUTTON_CONTROL_6 = 'controls_6';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_7 */
ToolBar.BUTTON_CONTROL_7 = 'controls_7';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_8 */
ToolBar.BUTTON_CONTROL_8 = 'controls_8';
/** @name vs.ui.ToolBar.BUTTON_COPY */
ToolBar.BUTTON_COPY = 'copy';
/** @name vs.ui.ToolBar.BUTTON_COURT */
ToolBar.BUTTON_COURT = 'court';
/** @name vs.ui.ToolBar.BUTTON_CREDIT_CARD */
ToolBar.BUTTON_CREDIT_CARD = 'credit_card';
/** @name vs.ui.ToolBar.BUTTON_CUT */
ToolBar.BUTTON_CUT = 'cut';
/** @name vs.ui.ToolBar.BUTTON_DANGER */
ToolBar.BUTTON_DANGER = 'danger';
/** @name vs.ui.ToolBar.BUTTON_DELETE */
ToolBar.BUTTON_DELETE = 'delete';
/** @name vs.ui.ToolBar.BUTTON_DISK */
ToolBar.BUTTON_DISK = 'disk';
/** @name vs.ui.ToolBar.BUTTON_DOCUMENT_BLANK */
ToolBar.BUTTON_DOCUMENT_BLANK = 'document_blank';
/** @name vs.ui.ToolBar.BUTTON_DOCUMENT */
ToolBar.BUTTON_DOCUMENT = 'document';
/** @name vs.ui.ToolBar.BUTTON_DOLLAR */
ToolBar.BUTTON_DOLLAR = 'dollar';
/** @name vs.ui.ToolBar.BUTTON_DOWNLAOD */
ToolBar.BUTTON_DOWNLAOD = 'download';
/** @name vs.ui.ToolBar.BUTTON_ERROR */
ToolBar.BUTTON_ERROR = 'error';
/** @name vs.ui.ToolBar.BUTTON_FAVORITIES_ADD */
ToolBar.BUTTON_FAVORITIES_ADD = 'favorities_add';
/** @name vs.ui.ToolBar.BUTTON_FAVORITIES_REMOVE */
ToolBar.BUTTON_FAVORITIES_REMOVE = 'favorities_remove';
/** @name vs.ui.ToolBar.BUTTON_FAVORITIES */
ToolBar.BUTTON_FAVORITIES = 'favorities';
/** @name vs.ui.ToolBar.BUTTON_FILM */
ToolBar.BUTTON_FILM = 'film';
/** @name vs.ui.ToolBar.BUTTON_FILMING */
ToolBar.BUTTON_FILMING = 'filming';
/** @name vs.ui.ToolBar.BUTTON_FIRST_AID */
ToolBar.BUTTON_FIRST_AID = 'first_aid';
/** @name vs.ui.ToolBar.BUTTON_FLAG_BIS */
ToolBar.BUTTON_FLAG_BIS = 'flag_1';
/** @name vs.ui.ToolBar.BUTTON_FLAG */
ToolBar.BUTTON_FLAG = 'flag';
/** @name vs.ui.ToolBar.BUTTON_FLASH_ARROW */
ToolBar.BUTTON_FLASH_ARROW = 'flash_arrow';
/** @name vs.ui.ToolBar.BUTTON_FLASH */
ToolBar.BUTTON_FLASH = 'flash';
/** @name vs.ui.ToolBar.BUTTON_FOLDER_BOOKMARCK */
ToolBar.BUTTON_FOLDER_BOOKMARCK = 'folder_bookmark';
/** @name vs.ui.ToolBar.BUTTON_FOLDER_GOTO */
ToolBar.BUTTON_FOLDER_GOTO = 'folder_goto';
/** @name vs.ui.ToolBar.BUTTON_FOLDER */
ToolBar.BUTTON_FOLDER = 'folder';
/** @name vs.ui.ToolBar.BUTTON_FONT_CAPITAL */
ToolBar.BUTTON_FONT_CAPITAL = 'font_capital';
/** @name vs.ui.ToolBar.BUTTON_FONT_ITALIC */
ToolBar.BUTTON_FONT_ITALIC = 'font_italic';
/** @name vs.ui.ToolBar.BUTTON_FONT_REGULAR */
ToolBar.BUTTON_FONT_REGULAR = 'font_regular';
/** @name vs.ui.ToolBar.BUTTON_FONT_UNDERLINE */
ToolBar.BUTTON_FONT_UNDERLINE = 'font_undeline';
/** @name vs.ui.ToolBar.BUTTON_FONT */
ToolBar.BUTTON_FONT = 'font';
/** @name vs.ui.ToolBar.BUTTON_FONTS */
ToolBar.BUTTON_FONTS = 'fonts';
/** @name vs.ui.ToolBar.BUTTON_FORUM */
ToolBar.BUTTON_FORUM = 'forum';
/** @name vs.ui.ToolBar.BUTTON_FRAME */
ToolBar.BUTTON_FRAME = 'frame';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_AREAS */
ToolBar.BUTTON_GRAPH_AREAS = 'graph_areas';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_BARS_DOWN */
ToolBar.BUTTON_GRAPH_BARS_DOWN = 'graph_bars_down';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_BARS_UP */
ToolBar.BUTTON_GRAPH_BARS_UP = 'graph_bars_up';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_BARS */
ToolBar.BUTTON_GRAPH_BARS = 'graph_bars';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_DOWN */
ToolBar.BUTTON_GRAPH_DOWN = 'graph_down';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_LINES */
ToolBar.BUTTON_GRAPH_LINES = 'graph_lines';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_UP */
ToolBar.BUTTON_GRAPH_UP = 'graph_up';
/** @name vs.ui.ToolBar.BUTTON_HAT */
ToolBar.BUTTON_HAT = 'hat';
/** @name vs.ui.ToolBar.BUTTON_HELP */
ToolBar.BUTTON_HELP = 'help';
/** @name vs.ui.ToolBar.BUTTON_HOME */
ToolBar.BUTTON_HOME = 'home';
/** @name vs.ui.ToolBar.BUTTON_INFORMATION */
ToolBar.BUTTON_INFORMATION = 'information';
/** @name vs.ui.ToolBar.BUTTON_KEY */
ToolBar.BUTTON_KEY = 'key';
/** @name vs.ui.ToolBar.BUTTON_KEYBOARD */
ToolBar.BUTTON_KEYBOARD = 'keyboard';
/** @name vs.ui.ToolBar.BUTTON_LAPTOP */
ToolBar.BUTTON_LAPTOP = 'laptop';
/** @name vs.ui.ToolBar.BUTTON_LINK */
ToolBar.BUTTON_LINK = 'links';
/** @name vs.ui.ToolBar.BUTTON_LIST_BULLETS */
ToolBar.BUTTON_LIST_BULLETS = 'bullets';
/** @name vs.ui.ToolBar.BUTTON_LIST_NUMBERS */
ToolBar.BUTTON_LIST_NUMBERS = 'list_numbers';
/** @name vs.ui.ToolBar.BUTTON_LOCK */
ToolBar.BUTTON_LOCK = 'lock';
/** @name vs.ui.ToolBar.BUTTON_MAGNIFY_GLASS */
ToolBar.BUTTON_MAGNIFY_GLASS = 'magnify_glass';
/** @name vs.ui.ToolBar.BUTTON_MAIL */
ToolBar.BUTTON_MAIL = 'mail';
/** @name vs.ui.ToolBar.BUTTON_MANAGE */
ToolBar.BUTTON_MANAGE = 'manage';
/** @name vs.ui.ToolBar.BUTTON_MEASURE */
ToolBar.BUTTON_MEASURE = 'measure';
/** @name vs.ui.ToolBar.BUTTON_MEASURES */
ToolBar.BUTTON_MEASURES = 'measures';
/** @name vs.ui.ToolBar.BUTTON_MIC_BIS */
ToolBar.BUTTON_MIC_BIS = 'mic_bis';
/** @name vs.ui.ToolBar.BUTTON_MIC */
ToolBar.BUTTON_MIC = 'mic';
/** @name vs.ui.ToolBar.BUTTON_MINUS */
ToolBar.BUTTON_MINUS = 'minus';
/** @name vs.ui.ToolBar.BUTTON_MUTE */
ToolBar.BUTTON_MUTE = 'mute';
/** @name vs.ui.ToolBar.BUTTON_PAINT */
ToolBar.BUTTON_PAINT = 'pain';
/** @name vs.ui.ToolBar.BUTTON_PAPER_PLANE */
ToolBar.BUTTON_PAPER_PLANE = 'paper_plane';
/** @name vs.ui.ToolBar.BUTTON_PAPER_TRASH */
ToolBar.BUTTON_PAPER_TRASH = 'paper_trash';
/** @name vs.ui.ToolBar.BUTTON_PAPERCLIO */
ToolBar.BUTTON_PAPERCLIO = 'paperclio';
/** @name vs.ui.ToolBar.BUTTON_PARAGRAPH */
ToolBar.BUTTON_PARAGRAPH = 'paragraph';
/** @name vs.ui.ToolBar.BUTTON_PENCIL */
ToolBar.BUTTON_PENCIL = 'pencil';
/** @name vs.ui.ToolBar.BUTTON_PHOTO */
ToolBar.BUTTON_PHOTO = 'photo';
/** @name vs.ui.ToolBar.BUTTON_PIECHART */
ToolBar.BUTTON_PIECHART = '113';
/** @name vs.ui.ToolBar.BUTTON_POST */
ToolBar.BUTTON_POST = 'post';
/** @name vs.ui.ToolBar.BUTTON_PROFILE */
ToolBar.BUTTON_PROFILE = 'profile';
/** @name vs.ui.ToolBar.BUTTON_REFRESH */
ToolBar.BUTTON_REFRESH = 'refresh';
/** @name vs.ui.ToolBar.BUTTON_RESIZE */
ToolBar.BUTTON_RESIZE = 'resize';
/** @name vs.ui.ToolBar.BUTTON_RSS  */
ToolBar.BUTTON_RSS = 'rss';
/** @name vs.ui.ToolBar.BUTTON_SAD_FACE */
ToolBar.BUTTON_SAD_FACE = 'sade_face';
/** @name vs.ui.ToolBar.BUTTON_SAFE */
ToolBar.BUTTON_SAFE = 'safe';
/** @name vs.ui.ToolBar.BUTTON_SAVE */
ToolBar.BUTTON_SAVE = 'save';
/** @name vs.ui.ToolBar.BUTTON_SETTINGS */
ToolBar.BUTTON_SETTINGS = 'settings';
/** @name vs.ui.ToolBar.SHOPPING_BAG */
ToolBar.SHOPPING_BAG = 'shopping_bag';
/** @name vs.ui.ToolBar.SHOPPING_CART */
ToolBar.SHOPPING_CART = 'shopping_cart';
/** @name vs.ui.ToolBar.SHOPPING_HEAVY */
ToolBar.SHOPPING_HEAVY = 'shopping_heavy';
/** @name vs.ui.ToolBar.SIM */
ToolBar.SIM = 'sim';
/** @name vs.ui.ToolBar.SMILE_FACE */
ToolBar.SMILE_FACE = 'smile_face';
/** @name vs.ui.ToolBar.SORT_AZ */
ToolBar.SORT_AZ = 'sort_az';
/** @name vs.ui.ToolBar.SORT_ZA */
ToolBar.SORT_ZA = 'sort_za';
/** @name vs.ui.ToolBar.STAR */
ToolBar.STAR = 'star';
/** @name vs.ui.ToolBar.STORAGE */
ToolBar.STORAGE = 'storage';
/** @name vs.ui.ToolBar.SWITCH */
ToolBar.SWITCH = 'switch';
/** @name vs.ui.ToolBar.TAG_ADD */
ToolBar.TAG_ADD = 'tag_add';
/** @name vs.ui.ToolBar.TAG_CANCEL */
ToolBar.TAG_CANCEL = 'tag_cancel';
/** @name vs.ui.ToolBar.TAG_DELETE */
ToolBar.TAG_DELETE = 'tag_delete';
/** @name vs.ui.ToolBar.TAG */
ToolBar.TAG = 'tag';
/** @name vs.ui.ToolBar.TEXT_ALIGN_CENTER */
ToolBar.TEXT_ALIGN_CENTER = 'text_align_center';
/** @name vs.ui.ToolBar.TEXT_ALIGN_JUSTIFY */
ToolBar.TEXT_ALIGN_JUSTIFY = 'text_align_justify';
/** @name vs.ui.ToolBar.TEXT_ALIGN_LEFT */
ToolBar.TEXT_ALIGN_LEFT = 'text_align_left';
/** @name vs.ui.ToolBar.TEXT_ALIGN_RIGHT */
ToolBar.TEXT_ALIGN_RIGHT = 'text_align_right';
/** @name vs.ui.ToolBar.TIME */
ToolBar.TIME = 'time';
/** @name vs.ui.ToolBar.TIMER */
ToolBar.TIMER = 'timer';
/** @name vs.ui.ToolBar.TRASH */
ToolBar.TRASH = 'trash';
/** @name vs.ui.ToolBar.TWG */
ToolBar.TWG = 'twg';
/** @name vs.ui.ToolBar.UNLOCK */
ToolBar.UNLOCK = 'unlock';
/** @name vs.ui.ToolBar.UPLOAD */
ToolBar.UPLOAD = 'upload';
/** @name vs.ui.ToolBar.USER */
ToolBar.USER = 'user';
/** @name vs.ui.ToolBar.USERS */
ToolBar.USERS = 'users';
/** @name vs.ui.ToolBar.VOLUME_DOWN */
ToolBar.VOLUME_DOWN = 'volume_down';
/** @name vs.ui.ToolBar.VOLUME_UP */
ToolBar.VOLUME_UP = 'volume_up';
/** @name vs.ui.ToolBar.VOLUME */
ToolBar.VOLUME = 'volume';
/** @name vs.ui.ToolBar.WALLET */
ToolBar.WALLET = 'wallet';
/** @name vs.ui.ToolBar.WARNING */
ToolBar.WARNING = 'warning';
/** @name vs.ui.ToolBar.WIFI */
ToolBar.WIFI = 'wifi';
/** @name vs.ui.ToolBar.WINDOW_ERROR */
ToolBar.WINDOW_ERROR = 'window_error';
/** @name vs.ui.ToolBar.WINDOW_GLOBE */
ToolBar.WINDOW_GLOBE = 'window_globe';
/** @name vs.ui.ToolBar.WINDOW_LOCK */
ToolBar.WINDOW_LOCK = 'window_lock';
/** @name vs.ui.ToolBar.WINDOW */
ToolBar.WINDOW = 'window';
/** @name vs.ui.ToolBar.ZOOM_IN */
ToolBar.ZOOM_IN = 'zoom_in';
/** @name vs.ui.ToolBar.ZOMM_OUT */
ToolBar.ZOMM_OUT = 'zoom_out';

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ToolBar = ToolBar;
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
 * A TextLabel.
 * @constructor
 * @extends vs.ui.View
 * @name vs.ui.TextLabel
 */
function TextLabel (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = TextLabel;
}

TextLabel.prototype = {
  
  /**
   * The text value
   * @protected
   * @type {string}
   */
  _text: "",

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    if (!this._text) { return; }
    
    util.setElementInnerText (this.view, this._text);
  }
};
util.extendClass (TextLabel, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (TextLabel, "text", {

  /**
   * Set the text value
   * @name vs.ui.TextLabel#name
   * @param {string} v
   */
  set : function (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._text = v;
    if (this.view)
    {
      util.setElementInnerText (this.view, this._text);
    }
  },

  /**
   * @ignore
   * get the text value
   * @type {string}
   */
  get : function ()
  {
    return this._text;
  }
});


/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.TextLabel = TextLabel;
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
 
 Use code from Canto.js Copyright 2010 David Flanagan
*/

/**
 *  The vs.ui.Canvas class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.Canvas class is a subclass of vs.ui.View that allows you to easily draw
 *  arbitrary content within your HTML content.
 *  <p>
 *  When you instantiate the vs.ui.Canvas class you should reimpletement the draw method.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.Canvas.
 * @name vs.ui.Canvas
 *
 *  @example
 *  var myCanvas = new vs.ui.Canvas (config);
 *  myCanvas.init ();
 *
 *  myCanvas.draw = function (x, y, width, height)
 *  {
 *    this.canvas_ctx.clearRect (x, y, width, height)
 *    // <=> this.clearRect (x, y, width, height)
 *      
 *    this.canvas_ctx.fillStyle = "rgb(200,0,0)";
 *    // <=> this.fillRect (10, 10, 55, 50);
 *   
 *    this.canvas_ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
 *    // <=> this.fillRect (30, 30, 55, 50);
 *
 *    ...
 *    
 *  };
 *
 *  // other way to use vs.ui.Canvas
 *  myCanvas.moveTo(100,100).lineTo(200,200,100,200).closePath().stroke();
 *
 * @param {Object} config The configuration structure [mandatory]
*/
function Canvas (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Canvas;
}

Canvas.prototype = {

  /**
   *
   * @protected
   * @type {CanvasRenderingContext2D|null}
   */
  canvas_ctx: null,
  
  /**
   *
   * @protected
   * @type {HTMLCanvasElement|null}
   */
  canvas_node: null,
  
/*****************************************************************
 *
 ****************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this.canvas_node = this.view.firstChild;
    if (this.canvas_node)
    {
      this.canvas_ctx = this.canvas_node.getContext('2d');
      
      this.canvas_node.width = this._size [0];
      this.canvas_node.height = this._size [1];    
      this.draw (0, 0, this._size [0], this._size [1]);
    }
  },
  
  /**
   *
   * @name vs.ui.Canvas#getContext
   * @function
   * @return {CanvasRenderingContext2D} the canvas context
   */
  getContext: function ()
  {
    return this.canvas_ctx;
  },
  
  /**
   * This method draws a rectangle.
   * <p/>
   * With 4 arguments, it works just like the 2D method. An optional
   * 5th argument specifies a radius for rounded corners. An optional
   * 6th argument specifies a clockwise rotation about (x,y).
   *
   * @name vs.ui.Canvas#drawRect
   * @function
   *
   * @param {number} x The x position
   * @param {number} y The y position
   * @param {number} w The rectangle width
   * @param {number} h The rectangle height
   * @param {number} radius The rectangle radius
   * @param {number} rotation The rectangle rotation
   */
  drawRect : function (x, y, w, h, radius, rotation)
  {
    if (arguments.length === 4)
    {
      // square corners, no rotation
      this.rect (x, y, w, h).stroke ();
    }
    else
    {
      if (!rotation)
      {
        // Rounded corners, no rotation
        this.polygon (x, y, x + w, y, x + w, y + h, x, y + h, radius);
      }
      else
      {
        // Rotation with or without rounded corners
        var sr = Math.sin (rotation), cr = Math.cos (rotation),
          points = [x,y], p = this.rotatePoint (w, 0, rotation);
          
        points.push (x + p [0], y + p [1]);
        p = this.rotatePoint (w, h, rotation);
        points.push (x + p [0], y + p [1]);
        p = this.rotatePoint (0, h, rotation);
        points.push (x + p [0], y + p [1]);
        if (radius) { points.push (radius); }
        
        this.polygon.apply (this, points);
      }
    }
    // The polygon() method handles setting the current point
    return this;
  },
  
  /**
   * @protected
   * @function
   */
  rotatePoint : function (x, y, angle)
  {
    return [x * Math.cos (angle) - y * Math.sin (angle),
            y * Math.cos (angle) + x * Math.sin (angle)];
  },

  /**
   * This method connects the specified points as a polygon.  It requires
   * at least 6 arguments (the coordinates of 3 points).  If an odd 
   * number of arguments are passed, the last one is taken as a corner
   * radius.
   *
   * @example
   *  var myCanvas = new vs.ui.Canvas (config);
   *  myCanvas.init ();
   *
   *  // draw a triangle
   *  myCanvas.polygon (100, 100, 50, 150, 300, 300);
   *
   * @name vs.ui.Canvas#polygon
   * @function
   * @param {number+} list of number
   */
  polygon : function ()
  {
    // Need at least 3 points for a polygon
    if (arguments.length < 6) { throw new Error("not enough arguments"); }

    var i, radius, n, x0, y0;
    
    this.beginPath ();

    if (arguments.length % 2 === 0)
    {
      this.moveTo (arguments [0], arguments [1]);
     
      for (i = 2; i < arguments.length; i += 2)
      {
        this.lineTo (arguments [i], arguments [i + 1]);
      }
    }
    else
    {
      // If the number of args is odd, then the last is corner radius
      radius = arguments [arguments.length - 1];
      n = (arguments.length - 1) / 2;

      // Begin at the midpoint of the first and last points
      x0 = (arguments [n * 2 - 2] + arguments [0]) /2;
      y0 = (arguments [n * 2 - 1] + arguments [1]) /2;
      this.moveTo (x0, y0);
      
      // Now arcTo each of the remaining points
      for (i = 0; i < n - 1; i++)
      {
        this.arcTo
          (arguments [i * 2], arguments [i * 2 + 1],
           arguments [i * 2 + 2], arguments [i * 2 + 3], radius);
      }
      // Final arcTo back to the start
      this.arcTo
        (arguments [n * 2 - 2], arguments [n * 2 - 1],
         arguments [0], arguments [1], radius);
    }

    this.closePath ();
    this.moveTo (arguments [0], arguments [1]);
    this.stroke ();
    return this;
  },

  /**
   * This method draws elliptical arcs as well as circular arcs.
   *
   * @name vs.ui.Canvas#ellipse
   * @function
   * @example
   *  var myCanvas = new Canvas (config);
   *  myCanvas.init ();
   *
   *  myCanvas.ellipse (100, 100, 50, 150, Math.PI/5, 0, Math.PI);
   *
   * @param {number} cx The X coordinate of the center of the ellipse
   * @param {number} cy The Y coordinate of the center of the ellipse
   * @param {number} rx The X radius of the ellipse
   * @param {number} ry The Y radius of the ellipse
   * @param {number} rotation The clockwise rotation about (cx,cy).
   *       The default is 0.
   * @param {number} sa The start angle; defaults to 0
   * @param {number} ea The end angle; defaults to 2pi
   * @param {boolean} anticlockwise The arc direction. The default
   *        is false, which means clockwise
   */
  ellipse : function (cx, cy, rx, ry, rotation, sa, ea, anticlockwise)
  {
    if (rotation === undefined) { rotation = 0;}
    if (sa === undefined) { sa = 0; }
    if (ea === undefined) { ea = 2 * Math.PI; }
      
    if (anticlockwise === undefined) { anticlockwise = false; }

    // compute the start and end points
    var sp =
      this.rotatePoint (rx * Math.cos (sa), ry * Math.sin (sa), rotation),
      sx = cx + sp[0], sy = cy + sp[1],
      ep = this.rotatePoint (rx * Math.cos (ea), ry * Math.sin (ea), rotation),
      ex = cx + ep[0], ey = cy + ep[1];
    
    this.moveTo (sx, sy);

    this.translate (cx, cy);
    this.rotate (rotation);
    this.scale (rx / ry, 1);
    this.arc (0, 0, ry, sa, ea, anticlockwise);
    this.scale (ry / rx, 1);
    this.rotate (-rotation);
    this.translate (-cx, -cy);
    
    this.stroke ();
    
    return this;
  },
  
  /**
   * Load a web page and draw it in the canvas. (does not work in Webkit)
   *
   * @name vs.ui.Canvas#load
   * @function
   *
   * @param {string} url The web site url
   */
  load : function (url)
  {
    var windowWidth = window.innerWidth - 25;  
    this.__iframe = document.createElement ("iframe");  
    this.__iframe.id = "canvas_load_iframe";  
    this.__iframe.height = "10px";  
    this.__iframe.width = windowWidth + "px";  
    this.__iframe.style.visibility = "hidden";  
    this.__iframe.src = url;  
    // Here is where the magic happens... add a listener to the  
    // frame's onload event
    this.nodeBind (this.__iframe, "load", 'remotePageLoaded');
    //append to the end of the page  
    document.body.appendChild (this.__iframe);
    
    return;      
  },
  
  /**
   * @protected
   * @function
   */
  remotePageLoaded : function ()
  {  
    // Get a reference to the window object you need for the canvas  
    // drawWindow method  
    var remoteWindow = this.__iframe.contentWindow,
      windowWidth = window.innerWidth - 25,
      windowHeight = window.innerHeight;  

    //Draw canvas  
    this.clearRect (0, 0, this._size [0], this._size [1]);  
    this.save ();  
    this.scale (this._size [0] / windowWidth, this._size [1] / windowHeight);  
    this.canvas_ctx.drawWindow
      (remoteWindow, 0, 0, windowWidth, windowHeight, "rgb(255,255,255)");  
    this.restore();  
  },
  
  /**
   * vs.ui.Canvas draw method.
   * Should be reimplement when you instanciate a vs.ui.Canvas object.
   *
   * @name vs.ui.Canvas#draw
   * @function
   *
   * @param {number} x The top position of the canvas; Default = 0
   * @param {number} y The left position of the canvas; Default = 0
   * @param {number} width The width of the canvas; Default = canvas's width
   * @param {number} height The height of the canvas; Default = canvas's height
   */
  draw : function (x, y, width, height)
  {
    if (!x) { x = 0; }
    if (!y) { y = 0; }
    if (!width) { width = this._size [0]; }
    if (!height) { height = this._size [1]; }
    
    this.clearRect (x, y, width, height);
      
    this.lineWidth = 3;
    this.shadowColor = 'white';
    this.shadowBlur = 1;
    
    var i, x1, y1, x2, y2;
    
    for (i = 0; i < 10; i++)
    {
      this.strokeStyle = 'rgb(' + 
        Math.floor (Math.random () * 255) + ',' + 
        Math.floor (Math.random () * 255) + ',' + 
        Math.floor (Math.random () * 255) +')';
      
      x1 = Math.floor (Math.random() * width);
      y1 = Math.floor (Math.random() * height);
  
      x2 = Math.floor (Math.random() * width);
      y2 = Math.floor (Math.random() * height);
  
      this.beginPath ();
      this.moveTo (x1,y1);
      this.lineTo (x2,y2);
      this.closePath ();
      this.stroke ();
    }
  }
};
util.extendClass (Canvas, View);

/**
 * @private
 */
Canvas.methods =   
  ['arc','arcTo','beginPath','bezierCurveTo','clearRect','clip',  
  'closePath','createImageData','createLinearGradient','createRadialGradient',  
  'createPattern','drawFocusRing','drawImage','fill','fillRect','fillText',  
  'getImageData','isPointInPath','lineTo','measureText','moveTo','putImageData',  
  'quadraticCurveTo','rect','restore','rotate','save','scale','setTransform',  
  'stroke','strokeRect','strokeText','transform','translate'];
  
/**
 * @private
 */
Canvas.props =
  ['canvas','fillStyle','font','globalAlpha','globalCompositeOperation',  
  'lineCap','lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowOffsetY',  
  'shadowBlur','shadowColor','strokeStyle','textAlign','textBaseline'];

/**
 * @private
 */
Canvas.setup = function ()
{
  var i, m, p;
  for (i = 0; i < Canvas.methods.length; i++)
  {
    m = Canvas.methods [i];  
    Canvas.prototype [m] = (function (m)
    {
      return function (a, b, c, d, e, f, g, h, i)
      { // 9 args is most in API  
        this.canvas_ctx [m] (a, b, c, d, e, f, g, h, i);  
        return this;  
      };
    }(m));  
  }

  for (i = 0; i < Canvas.props.length; i++)
  {  
    p = Canvas.props [i];
    
    var d = {};
    
    d.enumerable = true; 
    d.set = (function (p)
    {
      return function (value)
      {
        this.canvas_ctx [p] = value;
      };
    }(p));
    
    d.get = (function (p)
    {
      return function ()
      {
        return this.canvas_ctx [p];
      };
    }(p));

    util.defineProperty (Canvas.prototype, p, d);
  }  
};

Canvas.setup ();

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (Canvas, "size", {
 /** 
   * Getter|Setter for size. Gives access to the size of the vs.ui.Canvas
   * @name vs.ui.Canvas#size 
   *
   * @type {Array.<number>}
   */ 
  set : function (v)
  {
    if (!v) { return; } 
    if (!util.isArray (v) || v.length !== 2) { return; }
    if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }

    this._size [0] = v [0];
    this._size [1] = v [1];
    
    if (!this.view) { return; }
    this._updateSize ();

    if (!this.canvas_node)
    {
      this.canvas_node = this.view.firstChild;
      if (!this.canvas_node)
      {
        console.error ('Uncompatible canvas view');
        return;
      }
      this.canvas_ctx = this.canvas_node.getContext ('2d');
    }
   this.canvas_node.width = this._size [0];
   this.canvas_node.height = this._size [1];    
   this.draw (0, 0, this._size [0], this._size [1]);
  },

  /**
     * @ignore
   * @type {Array.<number>}
   */
  get : function ()
  {
    if (this.view && this.view.parentNode)
    {
      this._size [0] = this.view.offsetWidth;
      this._size [1] = this.view.offsetHeight;
    }
    return this._size.slice ();
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Canvas = Canvas;

/********************************************************************
                   Documentation
********************************************************************/

/**
 * Adds points to the subpath such that the arc described by the circumference 
 * of the circle described by the arguments, starting at the given start angle 
 * and ending at the given end angle, going in the given direction (defaulting * 
 * to clockwise), is added to the path, connected to the previous point by a 
 * straight line.
 * @name vs.ui.Canvas#arc
 * @function
 */

/**
 * Adds an arc with the given control points and radius to the current subpath, 
 * connected to the previous point by a straight line.
 * @name vs.ui.Canvas#arcTo
 * @function
 */

/**
 * Resets the current path.
 * @name vs.ui.Canvas#beginPath
 * @function
 */

/**
 * Adds the given point to the current subpath, connected to the previous one by 
 * a cubic Bézier curve with the given control points.
 * @name vs.ui.Canvas#bezierCurveTo
 * @function
 */

/**
 * Clears all pixels on the canvas in the given rectangle to transparent black.
 * @name vs.ui.Canvas#clearRect
 * @function
 */

/**
 * Further constrains the clipping region to the given path.
 * @name vs.ui.Canvas#clip
 * @function
 */

/**
 * Marks the current subpath as closed, and starts a new subpath with a point 
 * the same as the start and end of the newly closed subpath.
 * @name vs.ui.Canvas#closePath
 * @function
 */

/**
 * Returns an ImageData object with the given dimensions in CSS pixels (which 
 * might map to a different number of actual device pixels exposed by the object 
 * itself). All the pixels in the returned object are transparent black.
 * @name vs.ui.Canvas#createImageData
 * @function
 */

/**
 * Returns a CanvasGradient object that represents a linear gradient that paints 
 * along the line given by the coordinates represented by the arguments.
 * If any of the arguments are not finite numbers, throws a NotSupportedError 
 * exception.
 * @name vs.ui.Canvas#createLinearGradient
 * @function
 */

/**
 * Returns a CanvasGradient object that represents a radial gradient that paints 
 * along the cone given by the circles represented by the arguments.
 * If any of the arguments are not finite numbers, throws a NotSupportedError 
 * exception. If either of the radii are negative, throws an IndexSizeError 
 * exception.
 * @name vs.ui.Canvas#createRadialGradient
 * @function
 */

/**
 * Returns a CanvasPattern object that uses the given image and repeats in the 
 * direction(s) given by the repetition argument.
 * @name vs.ui.Canvas#createPattern
 * @function
 */

/**
 * @name vs.ui.Canvas#drawFocusRing
 * @function
 */

/**
 * Draws the given image onto the canvas.
 * @name vs.ui.Canvas#drawImage
 * @function
 */

/**
 * @name vs.ui.Canvas#fill
 * @function
 */

/**
 * Paints the given rectangle onto the canvas, using the current fill style.
 * @name vs.ui.Canvas#fillRect
 * @function
 */

/**
 * Fills the given text at the given position. If a maximum width is provided, 
 * the text will be scaled to fit that width if necessary.
 * @name vs.ui.Canvas#fillText
 * @function
 */

/**
 * Returns an ImageData object containing the image data for the given rectangle 
 * of the canvas.
 * @name vs.ui.Canvas#getImageData
 * @function
 */

/**
 * Returns true if the given point is in the current path.
 * @name vs.ui.Canvas#isPointInPath
 * @function
 */

/**
 * Adds the given point to the current subpath, connected to the previous one by 
 * a straight line.
 * @name vs.ui.Canvas#lineTo
 * @function
 */

/**
 * Returns a TextMetrics object with the metrics of the given text in the 
 * current font.
 * @name vs.ui.Canvas#measureText
 * @function
 */

/**
 * Creates a new subpath with the given point.
 * @name vs.ui.Canvas#moveTo
 * @function
 */

/**
 * Paints the data from the given ImageData object onto the canvas. If a dirty 
 * rectangle is provided, only the pixels from that rectangle are painted.
 * @name vs.ui.Canvas#putImageData
 * @function
 */

/**
 * Adds the given point to the current subpath, connected to the previous one by 
 * a quadratic Bézier curve with the given control point.
 * @name vs.ui.Canvas#quadraticCurveTo
 * @function
 */

/**
 * Adds a new closed subpath to the path, representing the given rectangle.
 * @name vs.ui.Canvas#rect
 * @function
 */

/**
 * Pops the top state on the stack, restoring the context to that state.
 * @name vs.ui.Canvas#restore
 * @function
 */

/**
 * Changes the transformation matrix to apply a rotation transformation with the 
 * given characteristics. The angle is in radians.
 * @name vs.ui.Canvas#rotate
 * @function
 */

/**
 * Pushes the current state onto the stack.
 * @name vs.ui.Canvas#save
 * @function
 */

/**
 * Changes the transformation matrix to apply a scaling transformation with the 
 * given characteristics.
 * @name vs.ui.Canvas#scale
 * @function
 */

/**
 * Changes the transformation matrix to the matrix given by the arguments as 
 * described below.
 * @name vs.ui.Canvas#setTransform
 * @function
 */

/**
 * Strokes the subpaths with the current stroke style.
 * @name vs.ui.Canvas#stroke
 * @function
 */

/**
 * Paints the box that outlines the given rectangle onto the canvas, using the 
 * current stroke style.
 * @name vs.ui.Canvas#strokeRect
 * @function
 */

/**
 * Strokes the given text at the given position. If a maximum width is provided, 
 * the text will be scaled to fit that width if necessary.
 * @name vs.ui.Canvas#strokeText
 * @function
 */

/**
 * Changes the transformation matrix to apply the matrix given by the arguments 
 * as described below.
 * @name vs.ui.Canvas#transform
 * @function
 */

/**
 * Changes the transformation matrix to apply a translation transformation with 
 * the given characteristics.
 * @name vs.ui.Canvas#translate
 * @function
 */

/**
 * Returns the canvas element.
 * @name vs.ui.Canvas#canvas
 */

/**
 * Can be set, to change the fill style.
 * <br />
 * Returns the current style used for filling shapes.
 * @name vs.ui.Canvas#fillStyle
 */

/**
 * Can be set, to change the font. The syntax is the same as for the CSS 'font' 
 * property; values that cannot be parsed as CSS font values are ignored.
 * <br />
 * Returns the current font settings
 * @name vs.ui.Canvas#font
 */

/**
 * Can be set, to change the alpha value. Values outside of the range 0.0 .. 1.0 
 * are ignored.
 * <br />
 * Returns the current alpha value applied to rendering operations.
 * @name vs.ui.Canvas#globalAlpha
 */

/**
 * Can be set, to change the composition operation. Unknown values are ignored.
 * <br />
 * Returns the current composition operation, from the list below.
 * @name vs.ui.Canvas#globalCompositeOperation
 */

/**
 * Can be set, to change the line cap style.
 * <br />
 * Returns the current line cap style.
 * @name vs.ui.Canvas#lineCap
 */

/**
 * Can be set, to change the line join style.
 * <br />
 * Returns the current line join style.
 * @name vs.ui.Canvas#lineJoin
 */

/**
 * Can be set, to change the miter limit ratio. Values that are not finite 
 * values greater than zero are ignored.
 * <br />
 * Returns the current miter limit ratio.
 * @name vs.ui.Canvas#miterLimit
 */

/**
 * Can be set, to change the line width. Values that are not finite values 
 * greater than zero are ignored.
 * Returns the current line width.
 * @name vs.ui.Canvas#lineWidth
 */

/**
 * Can be set, to change the shadow offset. Values that are not finite numbers 
 * are ignored.
 * <br />
 * Returns the current shadow offset.
 * @name vs.ui.Canvas#shadowOffsetX
 */

/**
 * Can be set, to change the shadow offset. Values that are not finite numbers 
 * are ignored.
 * <br />
 * Returns the current shadow offset.
 * @name vs.ui.Canvas#shadowOffsetY
 */

/**
 * Can be set, to change the blur level. Values that are not finite numbers 
 * greater than or equal to zero are ignored.
 * <br />
 * Returns the current level of blur applied to shadows.
 * @name vs.ui.Canvas#shadowBlur
 */

/**
 * Can be set, to change the shadow color. Values that cannot be parsed as CSS 
 * colors are ignored.
 * <br />
 * Returns the current shadow color.
 * @name vs.ui.Canvas#shadowColor
 */

/**
 * Can be set, to change the stroke style.
 * <br />
 * Returns the current style used for stroking shapes.
 * @name vs.ui.Canvas#strokeStyle
 */

/**
 * Can be set, to change the alignment. The possible values are start, end, 
 * left, right, and center. Other values are ignored. The default is start.
 * Returns the current text alignment settings.
 * @name vs.ui.Canvas#textAlign
 */

/**
 * Can be set, to change the baseline alignment. The possible values and their 
 * meanings are given below. Other values are ignored. The default is 
 * alphabetic.
 * <br />
 * Returns the current baseline alignment settings.
 * @name vs.ui.Canvas#textBaseline
 */
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
 *  The vs.ui.ProgressBar class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ProgressBar class is used to convey the progress of a task.
 *
 *  @example
 *
 * <p>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.ProgressBar.
 * @name vs.ui.ProgressBar
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ProgressBar (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ProgressBar;
  
  this._range = [0, 100];
}

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_IOS = 5;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_ANDROID = 5;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_WP7 = 0;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_SYMBIAN = 0;

/**
 * @const
 * @private
 * @type {number}
 */
ProgressBar.BORDER_WIDTH_BB = 1;

ProgressBar.prototype = {
  
  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __inner_view: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _index: 0,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _indeterminate: false,

  /**
   *
   * @protected
   * @type {Array.<number>}
   */
  _range: null,
   
  /**
   *
   * @private
   * @type {number}
   */
  __border_width: 0,
  
  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    util.setElementSize (this.view, this._size [0],  this._size [1]);
    this.index = this._index;
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this.__inner_view = this.view.firstElementChild;
    this.indeterminate = this._indeterminate;

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_ANDROID * 2;
    }
    else if (os_device == DeviceConfiguration.OS_IOS)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_IOS * 2;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_WP7 * 2;
    }
    else if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_SYMBIAN * 2;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this.__border_width = ProgressBar.BORDER_WIDTH_BB * 2;
    }

    this.index = this._index;
  },
  
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    this.index = this._index;
  }
};
util.extendClass (ProgressBar, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ProgressBar, {
  'index': {
    /** 
     * Allow to set or get the progress bar index
     * @name vs.ui.ProgressBar#index 
     * @type number
     */ 
    set : function (v)
    {
      if (!util.isNumber (v)) { return; }
  
      this._index = v;
      
      if (!this.__inner_view) { return; }
      
      var width = this.size [0], w;
      width -= this.__border_width;
      
      w = width * (this._index - this._range[0]) / 
                  (this._range [1] - this._range [0]);
      
      if (w > width) { w = width; }
      if (w < 0) { w = 0; }
          
      var os_device = window.deviceConfiguration.os;
      if (os_device === DeviceConfiguration.OS_ANDROID ||
          os_device === DeviceConfiguration.OS_IOS)
      {
        this.__inner_view.style.width = (w + this.__border_width) + 'px';
      }
      else { this.__inner_view.style.width = w + 'px'; }
    },
  
    /** 
     * @ignore
     * @return {number}
     */ 
    get : function ()
    {
      return this._index;
    }
  },
  'range': {
    /** 
     * Set or get the progress bar range, By default range = [0, 100];
     * @name vs.ui.ProgressBar#range 
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }
      if (v[0] === v[1] || v[0] > v[1]) { return; }
  
      this._range [0] = v [0];
      this._range [1] = v [1];
      this.index = this._index;
    },
  
    /** 
     * @ignore
     * @return {Array}
     */ 
    get : function ()
    {
      return this._range.slice ();
    }
  },
  'indeterminate': {
    /** 
     * Boolean value indicating whether the progress bar is indeterminate.
     * @name vs.ui.ProgressBar#indeterminate 
     * @type Boolean
     */ 
    set : function (v)
    {
      if (v)
      {
        this._indeterminate = true;
        if (this.view) util.addClassName (this.view, 'indeterminate');
      }
      else
      {
        this._indeterminate = false;
        if (this.view) util.removeClassName (this.view, 'indeterminate');
      }
    },
  
    /** 
     * @ignore
     * @return Boolean
     */ 
    get : function ()
    {
      return this._indeterminate ;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ProgressBar = ProgressBar;
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
 *  The vs.ui.Slider class
 *
 *  @extends vs.ui.View
 *  @class
 *  An vs.ui.Slider is a control used to select a single value from a continuous
 *  range of values. Sliders are horizontal or vertical.
 *  <p/>
 *  By default the range is include in [0, 100] and the value is a float.
 *
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> continuous_change: data [number]; propagate when during slide
 *    <li/> change: data [number]: propagate at end of slide 
 *  </ul>
 *  <p>
 *  @example
 *  var config = {}
 *  var config.id = 'mySlider';
 *  var config.orientation = vs.ui.Slider.HORIZONTAL;
 *  var config.value = 10;
 *
 *  var mySlider = vs.ui.Slider (config);
 *  mySlider.init ();
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.Slider 
 *
 *  @constructor
 *   Creates a new vs.ui.Slider.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function Slider (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Slider;
  
  this._range = [0, 100];
}

/** 
 * Horizontal constant to configure a slider.
 * <p/>A slider can be horizontal or vertical.
 * Set the orientation property with this constant for a horizontal slider.
 * By default a slider is horizontal.
 * @see vs.ui.Slider#orientation
 * @name vs.ui.Slider.HORIZONTAL
 * @const
 */
Slider.HORIZONTAL = 0;

/** 
 * Vertical constant to configure a slider.
 * <p/>A slider can be horizontal or vertical.
 * Set the orientation property with this constant for a vertical slider.
 * By default a slider is horizontal.
 * @see vs.ui.Slider#orientation
 * @name vs.ui.Slider.VERTICAL
 * @const
 */
Slider.VERTICAL = 1;

Slider.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
  /**
   * slider orientation (0: horizontal, 1: vertical)
   * @protected
   * @type {number}
   */
  _orientation : Slider.HORIZONTAL,

  /**
   * set default button position to 0
   * @protected
   * @type {number}
   */
  _value : 0,

  /**
   *
   * @protected
   * @type {Array.<number>}
   */
  _range: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @private
   * @type {number}
   */
  __v : 0,

  /**
   * @private
   * @type {number}
   */
  __drag_x : 0,

  /**
   * @private
   * @type {number}
   */
  __drag_y : 0,

  /**
   * @private
   * @type {HTMLDivElement}
   */
  __handle : null,
  
  /**
   * @private
   * @type {number}
   */
  __handle_width : 0,
     
  /**
   * @private
   * @type {number}
   */
  __handle_delta : 10,
     
/********************************************************************
                  setter and getter declarations
********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    vs.removePointerListener (this.__handle, core.POINTER_START, this, true);
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_WP7)
    {
      this.__handle_width = 30;
    }
    else if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this.__handle_width = 34;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this.__handle_width = 35;
      this.__handle_height = 12;
      this.__handle_delta = 3;
    }
    else { this.__handle_width = 23; } // ios
    
    //1) find first Div.
    this.__handle = this.view.querySelector ('.handle');
      
    // top/bottom click listening
    vs.addPointerListener (this.__handle, core.POINTER_START, this, true);
    
    this.orientation = this._orientation;
    this.value = this._value;
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    var dec, delta, pageY, pageX;

    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }

      // prevent objet keep event => prevent propagation
      e.stopPropagation ();
      e.preventDefault();

      pageY = e.pointerList[0].pageY,
      pageX = e.pointerList[0].pageX;

      this.__drag_x = pageX;
      this.__drag_y = pageY;
      
      this.__v = this._value;
      this.__handle_width = this.__handle.offsetWidth;
      
      vs.addPointerListener (document, core.POINTER_MOVE, this, true);
      vs.addPointerListener (document, core.POINTER_END, this, true);
      vs.addPointerListener (this.__handle, core.POINTER_END, this, true);
      
      return false;
    }
    else if (e.type === core.POINTER_MOVE)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }

      // prevent objet keep event => prevent propagation
      e.stopPropagation ();
      e.preventDefault();

      pageY = e.pointerList[0].pageY,
      pageX = e.pointerList[0].pageX;

      if (this._orientation === 0)
      {
        dec = this.view.offsetWidth - this.__handle_width;
        delta = this.__drag_x - pageX;
      }
      else
      {
        dec = this.view.offsetHeight - this.__handle_width;
        delta = this.__drag_y - pageY;
      }
      
      this.value = this.__v - delta * (this._range [1] - this._range [0]) / dec;

      this.propertyChange ();
      this.propagate ('continuous_change', this._value);
      
      return false;
    }
    else if (e.type === core.POINTER_END)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }

      // prevent objet keep event => prevent propagation
      e.stopPropagation ();
      e.preventDefault();

      vs.removePointerListener (document, core.POINTER_MOVE, this, true);
      vs.removePointerListener (document, core.POINTER_END, this, true);
      vs.removePointerListener (this.__handle, core.POINTER_END, this, true);
 
      this.propagate ('change', this._value);
      
      return false;
    }
  },
 
 /**********************************************************************
 
 *********************************************************************/

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    // reconfigure handle size
    this.__handle_width = this.__handle.offsetWidth;
    // force GUI update
    this.value = this._value;

    View.prototype.refresh.call (this);
  }
};
util.extendClass (Slider, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Slider, {
  'value':{
    /**
     * Set the current slider value
     * The value should be include in [0, 100]
     * @name vs.ui.Slider#value 
     * @type number
     */
    set : function (v)
    {
      var height, width, x, y;
      
      if (v < this._range [0]) { v = this._range [0]; }
      if (v > this._range [1]) { v = this._range [1]; }
      
      this._value = v;
      var d1 = this.__handle_width / 2, d2 = 0;
       
      var os_device = window.deviceConfiguration.os;
      if (os_device === DeviceConfiguration.OS_BLACK_BERRY)
      {
        d2 = (this.__handle_height - this.__handle_delta) / 2;
      }
      else
      {
        d2 = (this.__handle_width - this.__handle_delta) / 2;
      }
      
      if (this._orientation === 0)
      {
        width = this.view.offsetWidth,
          x = Math.floor ((v - this._range [0]) * width /
            (this._range [1] - this._range [0])) - d1;
        
        if (SUPPORT_3D_TRANSFORM)
          setElementTransform (this.__handle, "translate3d(" + x + "px,-" + d2 + "px,0)");
        else
          setElementTransform (this.__handle, "translate(" + x + "px,-" + d2 + "px)");
          
        this.view.style.backgroundSize = (x + d1) + "px 10px";
      }
      else
      {
        height = this.view.offsetHeight,
          y = Math.floor ((v - this._range [0]) * height /
            (this._range [1] - this._range [0])) - d1;
          
        if (SUPPORT_3D_TRANSFORM)
          setElementTransform (this.__handle, "translate3d(-" + d2 + "px," + y + "px,0)");
        else
          setElementTransform (this.__handle, "translate(-" + d2 + "px," + y + "px)");
          
        this.view.style.backgroundSize = "10px " + (y + d1) + "px";
      }
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._value;
    }
  },
  'range':{
    /** 
     * Set or get the slider range, By default range = [0, 100];
     * @name vs.ui.Slider#range 
     * @type Array.<number>
     */ 
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }
      if (v[0] === v[1] || v[0] > v[1]) { return; }
  
      this._range [0] = v [0];
      this._range [1] = v [1];
       
      this.value = this._value;
    },
  
    /** 
     * @ignore
     * @return {Array}
     */ 
    get : function ()
    {
      return this._range.slice ();
    }
  },
  'orientation':{
    /**
     * Property to configure the slider orientation.
     * <p/>A slider can be horizontal or vertical.
     *  Use the vs.ui.Slider.HORIZONTAL
     * or vs.ui.Slider.VERTICAL constant to configure the slider.
     * <p/>By default a slider is horizontal.
     * @name vs.ui.Slider#orientation 
     * @type number
     */
    set : function (v)
    {
      if (v !== Slider.HORIZONTAL && v !== Slider.VERTICAL) { return; }
      
      this._orientation = v;
      
      if (this._orientation === 0)
      {
        this.removeClassName ('vertical');
        this.addClassName ('horizontal');
      }
      else
      {
        this.addClassName ('vertical');
        this.removeClassName ('horizontal');
      }
      
      // re-apply the value
      this.value = this._value;
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._orientation;
    }
  },
  'size':{
    /** 
     * Getter|Setter for size. Gives access to the size of the GUI Object
     * @name vs.ui.Slider#size 
     *
     * @type {vs.ui.Slider.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      
      this._size [0] = v [0];
      this._size [1] = v [1];
      
      if (!this.view) { return; }
      this._updateSize ();
      
      // re-apply the value
      this.value = this._value;
    },
  
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (this.view && this.view.parentNode)
      {
        this._size [0] = this.view.offsetWidth;
        this._size [1] = this.view.offsetHeight;
      }
      return this._size.slice ();
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Slider = Slider;
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
 * A vs.ui.ImageView.
 * @constructor
 * @name vs.ui.ImageView
 * @extends vs.ui.View
 * An vs.ui.ImageView embeds an image in your application.
 */
function ImageView (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ImageView;
}

ImageView.prototype = {

  /**
   * The image url
   * @private
   * @type {string}
   */
  _src: null,

  /*****************************************************************
   *
   ****************************************************************/  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.view)
    {
      // force image free
      this.view.src = 
        'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    }
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this.view.ondragstart = function (e) { e.preventDefault(); return false; }

    // init default image src with the attribute node img.src
    // if it exists. Use getAttribute instead of direct property
    // in order to have a relative path (without base)
    if (this.view.src)
      this._src = this.view.getAttribute ('src');
    else
      this.view.src = this._src;
    
    this.view.setAttribute ('width', "100%");
    this.view.setAttribute ('height', "100%");
  }
};
util.extendClass (ImageView, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ImageView, {

  'src': {
    /**
     * Set the image url
     * @name vs.ui.ImageView#src 
     * @type {string}
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      this._src = v;
      
      if (this.view)
      {
        this.view.src = this._src;
      }
    },
  
    /**
     * @ignore
     * Get the image url
     * @return {string}
     */
    get : function ()
    {
      return this._src;
    }
  },
  'size': {
    /**
     * Set the image size
     * @name vs.ui.ImageView#size 
     *
     * @type {Array.<number>}
     */
    set : function (v)
    {
      if (!util.isArray (v) && v.length !== 2)
      {
        if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      }
      if (this.view)
      {
        this.view.setAttribute ('width', v [0]);
        this.view.setAttribute ('height', v [1]);
      }
      this._size [0] = v [0];
      this._size [1] = v [1];
      this._updateSize ();
    },
  
    /**
     * @ignore
     * @return {Array.<number>}
     */
    get : function ()
    {
      if (this.view && this.view.parentNode)
      {
        this._size [0] = this.view.offsetWidth;
        this._size [1] = this.view.offsetHeight;
      }
      return this._size.slice ();
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ImageView = ImageView;
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
 *  The vs.ui.InputField class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.InputField class implements an input text.
 *  <p/>
 *  The control provides 
 *  a text field (for entering text) and cancel button. The View can be styled
 *  as a text field, a password field style (characters are replaced by dots)
 *  or a search field style.
 *  <p/>
 *  Events:
 *  <ul>
 *    <li /> change: Fired after the user enter a new value
 *  </ul>
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.InputField.
 * @name vs.ui.InputField
 *
 *  @example
 *   var myInput = new vs.ui.InputField ({id:'input'});
 *   myInput.init ();
 *
 *   myInput.placeholder = "Type our password...";
 *   myVideo.type = vs.ui.InputField.PASSWORD;
 *
 * @param {Object} config The configuration structure [mandatory]
*/
function InputField (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = InputField;
}

/**
 * InputField is a text input
 * @name vs.ui.InputField.TEXT
 * @const
 */
InputField.TEXT = 'text';

/**
 * InputField is a passord input, that means the characters are replaced by dots
 * @name vs.ui.InputField.PASSWORD
 * @const
 */
InputField.PASSWORD = 'password';

/**
 * InputField is a search input
 * @name vs.ui.InputField.SEARCH
 * @const
 */
InputField.SEARCH = 'search';

InputField.prototype = {

  /**
   * The text field node
   * @private
   * @type {HTMLElement}
   */
  _text_field: null,
  
  /**
   * @private
   * @type {HTMLElement}
   */
  _clear_button: null,

  /**
   * The current field value
   *
   * @protected
   * @type {string}
   */
  _value: "",
  
  /**
   * @protected
   * @type {string}
   */
  _placeholder: "type ...",
  
  /**
   * The field type (TEST, PASSWORD, SEARCH)
   *
   * @protected
   * @type {int}
   */
  _type: InputField.TEXT,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    this._text_field.removeEventListener ('focus', this);
    this._text_field.removeEventListener ('blur', this);
    this._text_field.removeEventListener ('change', this);
    this._text_field.removeEventListener ('input', this);
    
    if (this._clear_button)
    {    
      this.nodeUnbind (this._clear_button, core.POINTER_START, 'cleanData');  
    }
    delete (this._text_field);

    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
        
    this._text_field = this.view.querySelector ('input');
    this._text_field.name = this.id
    
    this._clear_button = this.view.querySelector ('.clear_button');
    if (this._clear_button)
    {
      this.nodeBind (this._clear_button, core.POINTER_START, 'cleanData');  
    }
    this.type = this._type;
    this.value = this._value;
    this.placeholder = this._placeholder;

    this._text_field.addEventListener ('focus', this);
    this._text_field.addEventListener ('blur', this);
    this._text_field.addEventListener ('change', this);
    this._text_field.addEventListener ('input', this);
  },
    
  /**
   * @protected
   * @function
   */
  cleanData : function (v)
  {
    this._text_field.value = '';
    this._value = '';
    this._activateDelete (false);
    
    this.propertyChange ();
    this.propagate ('continuous_change', this._value);
    this.propagate ('change', this._value);
  },
    
  /**
   * @private
   * @function
   */
  changeData : function ()
  {
    this._value = this._text_field.value;
    if (this._value) { this._activateDelete (true); }
    else { this._activateDelete (false); }
  },
  
  /**
   * @private
   * @function
   */
  _activateDelete : function (v)
  {
    if (!this._clear_button)
    { return; }
    
    if (v) { util.setElementVisibility (this._clear_button, true); }
    else { util.setElementVisibility (this._clear_button, false); }
  },
  
  /**
   * @private
   * @function
   */
  onkeydown : function (event)
  {
    event = fixEvent (event)
    
    var editor = event.target
    if ((event.keyCode === TAB) || (event.keyCode === ENTER))
    {
      editor.blur ();
      return false
    }
  },
  
  /**
   * Set the focus to your input
   * @name vs.ui.InputField#setFocus 
   * @function
   */
  setFocus : function ()
  {
    this._text_field.focus ();
  },

  /**
   * Remove the focus to your input
   * @name vs.ui.InputField#setBlur 
   * @function
   */
  setBlur : function ()
  {
    this._text_field.blur ();
  },
  
  /**
   *  Set pointer events
   *
   * @name vs.ui.InputField#setPointerEvents 
   * @function
   */
  setPointerEvents : function (v)
  {
    if (v)
    { this._text_field.style.pointerEvents = 'none'; }
    else
    { this._text_field.style.pointerEvents = 'auto'; }
  },
  
  /**
   * Did enable delegate
   * @name vs.ui.View#_didEnable
   * @protected
   */
  _didEnable : function ()
  {
    if (this._enable) this._text_field.removeAttribute ('disabled');
    else this._text_field.setAttribute ('disabled', true);
  },
  
  /**
   * @private
   * @function
   */
  handleEvent : function (event)
  {
    var self = this;
    function manageBlur (event)
    {
      if (event.target === self.view || event.target === self._text_field)
      { return; }
      
      if (event.target === self._clear_button)
      {
        self.cleanData ();
        event.stopPropagation ();
        event.preventDefault ();
        return;
      }
      
      vs.removePointerListener (document, core.POINTER_START, manageBlur, true);
      self.setBlur ();
    }

    if (event.type === 'change')
    {
      this.changeData ();
      this.propertyChange ();
      this.propagate ('change', this._value);
    }
    else if (event.type === 'input')
    {
      this.changeData ();
      this.propertyChange ();
      this.propagate ('continuous_change', this._value);
    }
    else if (event.type === 'focus')
    {
      this.addClassName ('focus');
      this._value = this._text_field.value;
      if (this._value) { this._activateDelete (true); }
      else { this._activateDelete (false); }
      
      vs.addPointerListener (document, core.POINTER_START, manageBlur, true);
    }
    else if (event.type === 'blur')
    {
      this.removeClassName ('focus');
      this._activateDelete (false);
      window.scrollTo (0, 0);
    }
  }
}
util.extendClass (InputField, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (InputField, {
  'value': {
    /**
     * Allows to set the input value
     * @name vs.ui.InputField#value 
     * @type {string}
     */
    set : function (v)
    {
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; };
        v = v.toString ();
      }
  
      this._value= v;
      if (this._text_field)
      {
        this._text_field.value = this._value;
        if (!this._value || this._value === '')
        {this._activateDelete (false);}
        else {this._activateDelete (true);}
      }
    },
  
    /**
     * @ignore
     * @type {string}
     * @nosideeffects
     */
    get : function ()
    {
      this._value = this._text_field.value;
      return this._value;
    }
  },
  'type': {
    /**
     * Allows to change the input type.
     * you can choose between :
     * <ul>
     *   <li/>vs.ui.InputField.TEXT
     *   <li/>vs.ui.InputField.PASSWORD
     *   <li/>vs.ui.InputField.SEARCH
     * </ul>
     * @name vs.ui.InputField#type 
     * @type {enum}
     */
    set : function (v)
    {
      if (v !== InputField.TEXT &&
        v !== InputField.PASSWORD &&
        v !== InputField.SEARCH) { return; }
  
      if (!this.view) { return; } 
      
      this.removeClassName (this._type);
      this._type = v;
      this.addClassName (this._type);
      
      if (!this._text_field) { return; }
      if (this._type === InputField.PASSWORD)
      {
        this._text_field.setAttribute ('type', 'password');
      }
      else if (this._type === InputField.SEARCH)
      {
        this._text_field.setAttribute ('type', 'search');
      }
      else
      {
        this._text_field.setAttribute ('type', 'text');
      }
    }
  },
  'placeholder': {
    /**
     * Defines a hint to help users fill out the input field.
     * @name vs.ui.InputField#placeholder 
     * @type {enum}
     */
    set : function (v)
    {
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; };
        v = v.toString ();
      }
  
      this._placeholder = v;
      if (this._text_field)
      {
        this._text_field.setAttribute ('placeholder', this._placeholder);
      }
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.InputField = InputField;
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
 *  The vs.ui.PopOver class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.PopOver view allows you to present information temporarily on top of
 *  your existing views. This view should not be draw over the entire screen.
 *  <p/>
 *  To display properly (with the arrow) the popover you have to use the method 
 *  how" with 2 following parameters:
 *  <ul>
 *    <li/>The coordinate [x, y] on screen, specify the point
 *         which is pointed by the popover
 *    <li/>The popover position related the to first parameter
 *           (ABOVE, BELOW, RIGHT, LEFT). 
 *  </ul>
 * 
 *  The popover is composed of tree views.
 *  <ul>
 *    <li/>The main subView (vs.ui.View). This is the main view in which you can
 *         add any widgets you want to present. The insertion peg is name
 *         'children'. This view should presents information associate to the
 *         user task. <br/>For adding view, you should use the method "add" of the 
 *         popover
 *    <li/>The second and third views are the header and footer views. They are
 *         deactivated by default. These views are usefull to presents 
 *         information related to navigation, for instance navigation buttons,
 *         cancel/validation button, etc. 
 *  </ul>
 *
 * @example
 *   // PopOver creation
 *   var popOver = new vs.ui.PopOver ();
 *   popOver.init ();
 *
 *   // PopOver main view construction
 *   var list = new vs.ui.List ();
 *   list.init ();
 *   list.data = data;
 *   popOver.add (list, 'children');
 *
 *   // PopOver footer view activation and init
 *   popOver.hasFooter = true;
 *   var cancelButton = new vs.ui.Button ();
 *   cancelButton.init ();
 *   cancelButton.text = "Cancel";
 *   popOver.add (cancelButton, 'footer');
 *
 *   // PopOver draw
 *   popOver.show ([300, 100], vs.ui.PopOver.RIGHT);
 *
 *  @author David Thevenin
 * @name vs.ui.PopOver
 *
 *  @constructor
 *   Creates a new vs.ui.PopOver.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function PopOver (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = PopOver;
}

/**
 * The popover is positioned below the reference point
 * @name vs.ui.PopOver.BELOW
 * @const
 */
PopOver.BELOW = 0;

/**
 * The popover is positioned above the reference point
 * @name vs.ui.PopOver.ABOVE
 * @const
 */
PopOver.ABOVE = 1;

/**
 * The popover is positioned at left of the reference point
 * @name vs.ui.PopOver.LEFT
 * @const
 */
PopOver.LEFT = 2;

/**
 * The popover is positioned at right of the reference point
 * @name vs.ui.PopOver.RIGHT
 * @const
 */
PopOver.RIGHT = 3;

PopOver.prototype = {
  
  /*****************************************************************
   *               public members
   ****************************************************************/
   
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @protected
   * @type {Array}
   */
  _point_position: null,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _has_footer: false,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _has_header: false,

  /*****************************************************************
   *               init methods
   ****************************************************************/
   
  /**
   * Object default init. <p>
   * Must be call after the new.
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this._arrow = this.view.querySelector ('.vs_ui_popover >.arrow');
    
    this.__show_clb = this._endShowConfiguration;
  },
        
  /*****************************************************************
   *               General methods
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  _endShowConfiguration : function ()
  {
    var envlop = {}, delta, endShowConfiguration, size = this.size,
      max_y = window.innerHeight, max_x = window.innerWidth, pos;
    
    if (typeof this.__direction !== "undefined" && this._point_position)
    {
      envlop.x = this._point_position [0] - (size [0] /2);
      envlop.y = this._point_position [1] - (size [1] /2);
      envlop.width = size [0];
      envlop.height = size [1];
      
      if (this.__direction !== PopOver.BELOW &&
          this.__direction !== PopOver.ABOVE &&
          this.__direction !== PopOver.RIGHT &&
          this.__direction !== PopOver.LEFT)
      {
        if (this._point_position [0] > max_x /2)
        { this.__direction = PopOver.RIGHT; }
        else
        { this.__direction = PopOver.LEFT; }
        
        if (this._point_position [1] + envlop.height + 30 < max_y)
        { this.__direction = PopOver.BELOW; }
        else if (this._point_position [1] - envlop.height - 30 > 0)
        { this.__direction = PopOver.ABOVE; }
      }
      
      switch (this.__direction)
      {
        case PopOver.BELOW:
          envlop.y = envlop.y + (size [1] /2) + 15;
          if (envlop.x < 5) { envlop.x = 5; }
          if (envlop.x + envlop.width > max_x)
          { envlop.x = max_x - envlop.width - 5; }
          
          this._arrow.className = "arrow top";
          delta = this._point_position [0] - envlop.x - 15 - 8;
          this._arrow.style.left = "5px";
          this._arrow.style.right = "5px";
          this._arrow.style["-webkit-mask-position-x"] = delta + "px";
          this._arrow.style["-webkit-mask-position-y"] = "0px";
        break;
      
        case PopOver.ABOVE:
          envlop.y = envlop.y - (size [1] /2) - 15;
          if (envlop.x < 5) { envlop.x = 5; }
          if (envlop.x + envlop.width > max_x)
          { envlop.x = max_x - envlop.width - 5; }
          
          this._arrow.className = "arrow bottom"
          delta = this._point_position [0] - envlop.x - 15 - 8;
          this._arrow.style.left = "5px";
          this._arrow.style.right = "5px";
          this._arrow.style["-webkit-mask-position-x"] = delta + "px";
          this._arrow.style["-webkit-mask-position-y"] = "0px";
        break;
          
        case PopOver.RIGHT:
          envlop.x = envlop.x - (size [0] /2) - 15;
          if (envlop.y < 5) { envlop.y = 5; }
          if (envlop.y + envlop.height > max_y - 20)
          { envlop.y = max_y - envlop.height - 20; }
          
          this._arrow.className = "arrow right"
          delta = envlop.height - (this._point_position [1] - envlop.y + 15) - 2;
          this._arrow.style.left = "auto";
          this._arrow.style.right = "-13px";
          this._arrow.style["-webkit-mask-position-x"] = "0px";
          this._arrow.style["-webkit-mask-position-y"] = delta + "px";
        break;
      
        case PopOver.LEFT:
          envlop.x = envlop.x + (size [0] /2) + 15;
          if (envlop.y < 5) { envlop.y = 5; }
          if (envlop.y + envlop.height > max_y - 20)
          { envlop.y = max_y - envlop.height - 20; }
          
          this._arrow.className = "arrow left"
          delta = this._point_position [1] - envlop.y - 15 - 2;
          this._arrow.style.left = "-13px";
          this._arrow.style.right = "auto";
          this._arrow.style["-webkit-mask-position-x"] = "0px";
          this._arrow.style["-webkit-mask-position-y"] = delta + "px";
        break;
      }
      
      pos = util.getElementAbsolutePosition (this.view.parentElement);
      if (pos)
      {
        this.position = [envlop.x - pos.x, envlop.y - pos.y];
      }
      else
      {
        this.position = [envlop.x, envlop.y];
      }
      this.size = [envlop.width, envlop.height];
    }
    
    // force redraw !!!! grrrr !!!!
    this.redraw ();
  },
 
 /** 
   *  Shows and positions the popover according a given coordinate.
   *  <p/>
   *  The position is defined by a coordinate and position of the popover
   *  related to the coordinate. can be vs.ui.PopOver.ABOVE, 
   *  vs.ui.PopOver.BELOW, vs.ui.PopOver.RIGHT, vs.ui.PopOver.LEFT
   * 
   * @name vs.ui.PopOver#show
   * @function
   *
   * @param coordinate [Array] the coordinate of screen for the popover position
   * @param position [number] the position of the popover related to the
   *     coordinate. 
   */ 
  show : function (pos, direction)
  {
    if (!this.view || this._visible) { return; }
    
    if (pos && util.isArray (pos) && pos.length === 2 &&
      util.isNumber (pos[0]) && util.isNumber(pos[1]))
    {
      this._point_position = pos.slice ();;
    }
    else
    {
      this._point_position = null;
    }

    this.__direction = direction;

    this.view.style.setProperty ("display", 'block', null);
    this.__view_display = undefined;

    if (this._show_animation)
    {
      this._show_animation.process (this, this._show_object, this);
    }
    else
    {
      this._show_object ();
    }
    
    vs.addPointerListener (document, core.POINTER_START, this, true); 
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    if (this.childOf (e.target, this.view))
    { return; }
    
    e.preventDefault ();
    e.stopPropagation ();
  
    this.hide ();
  },
  
  
  /**
   * @protected
   * @function
   */
  childOf : function (child, parent)
  {
    if (child === parent) { return true; }
    
    child = child.parentElement
    while (child)
    {
      if (child === parent) { return true; }
      child = child.parentElement
    }
    return false;
  },

  /**
   * Hides the popover
   * @name vs.ui.PopOver#hide 
   * @function
   */
  hide : function ()
  {
    if (!this.view) { return; }
    View.prototype.hide.call (this);
    
    vs.removePointerListener (document, core.POINTER_START, this, true); 
    this.view.style.display = 'none';
  }
};
util.extendClass (PopOver, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (PopOver, {
  'hasFooter': {
    /** 
     * Activate/deactivate the footer space. If its activate, you can
     * add child to this view.
     * @example
     *   myPopOver.hasFooter = true;
     *   button = new vs.ui.Button (...);
     *   myPopOver.add (button, 'footer');
     * @name vs.ui.PopOver#hasFooter 
     * @type boolean
     */ 
    set : function (v)
    {
      if (v) { this._has_footer = true; }
      else { this._has_footer = false; }
      
      if (this.view && this._has_footer)
      {
        this.addClassName ('withFooter');
      }
      if (this.view && !this._has_footer)
      {
        this.removeClassName ('withFooter');
      }
    },
  
    /** 
     * @ignore
     * @return boolean
     */ 
    get : function ()
    {
      return this._has_footer;
    }
  },
  'hasHeader': {
    /** 
     * Activate/deactivate the header space. If its activate, you can
     * add child to this view.
     * @example
     *   myPopOver.hasHeader = true;
     *   button = new vs.ui.Button (...);
     *   myPopOver.add (button, 'header');
     * @name vs.ui.PopOver#hasHeader 
     * @type boolean
     */ 
    set : function (v)
    {
      if (v) { this._has_header = true; }
      else { this._has_header = false; }
      
      if (this.view && this._has_header)
      {
        this.addClassName ('withHeader');
      }
      if (this.view && !this._has_header)
      {
        this.removeClassName ('withHeader');
      }
    },
  
    /** 
     * @ignore
     * @return {boolean}
     */ 
    get : function ()
    {
      return this._has_header;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.PopOver = PopOver;
/*
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
 *  The vs.ui.Switch class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.Switch display an element showing the boolean state value.
 *  User is able to tap the control to change the value.
 *  <p>
 *  Events:
 *  <ul>
 *    <li /> change: Fired after the switch is tap. Event.data = true if button is toggled.
 *  </ul>
 *  <p>
 *  @example
 *  var toggle = new vs.ui.Switch ();
 *  toggle.init ();
 *  toggle.position = [100, 250];
 *
 *  toggle.textOn = 'I'
 *  toggle.textOff = 'O'
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.Switch 
 *
 *  @constructor
 *   Creates a new vs.ui.Switch.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function Switch (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Switch;
}

/**
 * @private
 * @const
 */
Switch.MODE_DEFAULT = 0;

/**
 * @private
 * @const
 */
Switch.MODE_IOS = 1;
/**
 * @private
 * @const
 */
Switch.MODE_ANDROID = 2;

/**
 * @private
 * @const
 */
Switch.MODE_MEEGO = 3;

/**
 * @private
 * @const
 */
Switch.MODE_WP7 = 4;

/**
 * @private
 * @const
 */
Switch.MODE_SYMBIAN = 5;

/**
 * @private
 * @const
 */
Switch.MODE_BLACKBERRY = 6;

Switch.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @private
   * @type {boolean}
   */
  __touch_binding: false,
  __is_touched: false,
    
  /**
   *
   * @protected
   * @type {boolean}
   */
  _selected: false,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _toggled: true,

  /**
   * @private
   * @type {Number}
   */
  _mode: Switch.MODE_DEFAULT,

  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __toggle_on_view: null,

  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __toggle_off_view: null,

  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __switch_view: null,
  
  /**
   *
   * @protected
   * @type {string}
   */
  _text_on: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _text_off: "",
  
  /*****************************************************************
   *    
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  _setSelected : function (v)
  {
    if (v)
    {
      this.addClassName ('selected');
      this._selected = true;
    }
    else
    {
      this.removeClassName ('selected');
      this._selected = false;
    }
  },

  /*****************************************************************
   *               General methods
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  _setToggle: function (v)
  {
    if (!this.__background_view)
    {
      console.warn ("vs.ui.Switch.toggled, none initialized comp: " + this.id);
      return;
    }

    var left;
    if (v)
    {
      this._toggled = true;
      if (this._mode === Switch.MODE_IOS ||
               this._mode === Switch.MODE_WP7)
      {
        setElementTransform (this.__background_view, "scale(0, 1)");
        setElementTransform (this.__toggles_view, "translate(0,0)");
      }
      else if (this._mode === Switch.MODE_DEFAULT ||
               this._mode === Switch.MODE_ANDROID ||
               this._mode === Switch.MODE_MEEGO ||
               this._mode === Switch.MODE_SYMBIAN ||
               this._mode === Switch.MODE_BLACKBERRY)
      {
        this.addClassName ('on');
      }
    }
    else
    {
      this._toggled = false;
      if (this._mode === Switch.MODE_IOS ||
               this._mode === Switch.MODE_WP7)
      {
        setElementTransform (this.__background_view, "scale(1, 1)");
        setElementTransform (this.__toggles_view, 
          "translate(-" + (this.size[0] - this.__width_switch) + "px,0)");
      }
      else if (this._mode === Switch.MODE_DEFAULT ||
               this._mode === Switch.MODE_ANDROID ||
               this._mode === Switch.MODE_MEEGO ||
               this._mode === Switch.MODE_SYMBIAN ||
               this._mode === Switch.MODE_BLACKBERRY)
      {
        this.removeClassName ('on');
      }
    }
    this.propertyChange ();
  },

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__touch_binding)
    {
      vs.removePointerListener (this.view, core.POINTER_START, this);
      this.__touch_binding = false;
    }
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    this.__background_view =
      this.view.querySelector ('.vs_ui_switch >div:first-child');
    this.__toggles_view =
      this.view.querySelector ('.vs_ui_switch >div:nth-child(2)');
    this.__toggle_on_view =
      this.view.querySelector ('.vs_ui_switch .toggle_on');
    this.__toggle_off_view =
      this.view.querySelector ('.vs_ui_switch .toggle_off');
    this.__switch_view =
      this.view.querySelector ('.vs_ui_switch .switch');

    if (!this.__touch_binding)
    {
      vs.addPointerListener (this.view, core.POINTER_START, this);
      this.__touch_binding = true;
    }

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_IOS)
    {
      this._mode = Switch.MODE_IOS;
    }
    else if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this._mode = Switch.MODE_ANDROID;
    }
    else if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this._mode = Switch.MODE_SYMBIAN;
    }
    else if (os_device == DeviceConfiguration.OS_MEEGO)
    {
      this._mode = Switch.MODE_MEEGO;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this._mode = Switch.MODE_WP7;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this._mode = Switch.MODE_BLACKBERRY;
    }

    if (this._text_on)
    {
      this.textOn = this._text_on;
    }
    else
    {
      this.textOn = "ON";
    }
    if (this._text_off)
    {
      this.textOff = this._text_off;
    }
    else
    {
      this.textOff = "OFF";
    }

    this.toggled = this._toggled;
  },
  
  refresh : function ()
  {
    View.prototype.refresh.call (this);

    switch (this._mode)
    {
      case Switch.MODE_IOS:
        this.__width_switch = 40;
      break;
    
      case Switch.MODE_WP7:
        this.__width_switch = 23;
      break;

      case Switch.MODE_BLACKBERRY:
        this.__width_switch = 20;
      break;

      default:
      // this method could not work if the view his not displaied
      this.__width_switch = this.__switch_view.offsetWidth;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    var pos = this._pos, size = this._size, width
      aH = this._autosizing [0], aV = this._autosizing [1], sPosR = 'auto';
    
    if (this.view.parentNode)
    {
      pWidth = this.view.parentNode.offsetWidth;
    }
    
    if (aH === 4 || aH === 1) { width = size[0] + 'px'; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0)
    {
      if (pWidth)
      {
        width = Math.round (size[0] / pWidth * 100) + '%';
      }
      else { width = size[0] + 'px'; } 
    }
    
    else { width = '100%'; }

    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (pos[0] + size [0]) + 'px';
    }
    
    this.view.style.width = width;
    this.view.style.right = sPosR;
    this.view.style.bottom = 'auto';
    this.view.style.removeProperty ('height');
  },
  
  /**
   * @protected
   * @function
   */
  _updatePos : function ()
  {
    var pos = this._pos, size = this._size, pWidth = 0, pHeight = 0,
      sPosL = 'auto', sPosT = 'auto', sPosR = 'auto',
      aH = this._autosizing [0], aV = this._autosizing [1];
      
    if (this.view.parentNode)
    {
      pWidth = this.view.parentNode.offsetWidth;
      pHeight = this.view.parentNode.offsetHeight;
    }
    
    if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || (aH === 2 && !pWidth))
    { sPosL = pos[0] + 'px'; }
    else if ((aH === 2 || aH === 0) && pWidth)
    { sPosL = Math.round (pos[0] / pWidth * 100) + '%'; }
    
    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (pos[0] + size [0]) + 'px';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight))
    { sPosT = pos[1] + 'px'; }
    else if ((aV === 2 || aV === 0) && pHeight)
    { sPosT = Math.round (pos[1]  / pHeight * 100) + '%'; }

    this.view.style.left = sPosL;
    this.view.style.top = sPosT;
    this.view.style.right = sPosR;
    this.view.style.bottom = 'auto';
  },
  
  /*****************************************************************
   *               Pointer events management
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    if (!this._enable) { return; }
    var self = this;
        
    // by default cancel any default behavior to avoid scroll
    e.preventDefault ();

    switch (e.type)
    {
      case core.POINTER_START:
        if (this.__is_touched) { return; }
        // prevent multi touch events
        if (e.nbPointers > 1) { return; }

        // we keep the event
        e.stopPropagation ();
                
        this._setSelected (true);
        vs.addPointerListener (document, core.POINTER_END, this);
        vs.addPointerListener (document, core.POINTER_MOVE, this);
        this.__start_x = e.pointerList[0].pageX;
        this.__start_y = e.pointerList[0].pageY;
        this.__is_touched = true;
        
        return false;
      break;

      case core.POINTER_MOVE:
        if (!this.__is_touched) { return; }

        var dx = e.pointerList[0].pageX - this.__start_x;
        var dy = e.pointerList[0].pageY - this.__start_y;
        
        // manage swipe and selection
        if (this._mode === Switch.MODE_IOS)
        {
          if (Math.abs (dy) < View.MOVE_THRESHOLD && 
            ((this._toggled && dx < 0 && dx > -this._size[0]) ||
             (!this._toggled && dx > 0 && dx < this._size[0])))
          {
            // we keep the event
            e.stopPropagation ();
            return false;
          }
        }
        else
        {
          if ((Math.abs (dy) + Math.abs (dy)) < View.MOVE_THRESHOLD)
          {
            // we keep the event
            e.stopPropagation ();
            return false;
          }
        }

        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);
        this.__is_touched = false;

        this._setSelected (false);
        
        return false;
      break;

      case core.POINTER_END:
        if (!this.__is_touched) { return; }
        this.__is_touched = false;

        // we keep the event
        e.stopPropagation ();

        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);

        this._setSelected (false);

        this._setToggle (!this._toggled);
        this.propagate ('change', this._toggled);
        
        return false;
      break;
    }
  }  
};
util.extendClass (Switch, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Switch, {

  'textOn': {
    /** 
     * Getter|Setter for the text switch. Allow to get or change the text draw
     * by the switch when its on.
     * @name vs.ui.Switch#textOn 
     * @type String
     */ 
    set : function (v)
    {
      if (!this.__toggle_on_view)
      {
        console.warn ("vs.ui.Switch.textOff, none initialized comp: " + this.id);
        return;
      }
  
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; }
        v = v.toString ();
      }
  
      this._text_on = v;
      util.setElementInnerText (this.__toggle_on_view, this._text_on);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text_on;
    }
  },
  'textOff': {
    /** 
     *  Getter|Setter for the text switch. Allow to get or change the text draw
     *  by the switch when its off.
     * @name vs.ui.Switch#textOff 
     *  @type String
     */ 
    set : function (v)
    {
      if (!this.__toggle_off_view)
      {
        console.warn ("vs.ui.Switch.textOff, none initialized comp: " + this.id);
        return;
      }
  
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; }
        v = v.toString ();
      }
  
      this._text_off = v;
      util.setElementInnerText (this.__toggle_off_view, this._text_off);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text_off;
    }
  },
  'toggled': {
  
    /** 
     * Getter|Setter the toggled state.
     * @name vs.ui.Switch#toggled 
     * @type boolean
     */ 
    set : function (v)
    {
      var self = this;
      setTimeout (function () { self._setToggle (v); }, 10);
    },
  
    /** 
     * @ignore
     * @return {boolean}
     */ 
    get : function ()
    {
      return this._toggled;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Switch = Switch;
/*
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
 * 
 * Find more about the Spinning Wheel function at
 * http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch/11
 *
 * Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 1.4 - Last updated: 2009.07.09
 * 
 */

/**
 *  The vs.ui.Picker class
 *
 *  @extends vs.ui.View
 *  @class
 *  vs.ui.Picker defines a view that use a spinning-wheel or slot-machine 
 *  metaphor to show one or more sets of values. Users select values by 
 *  rotating the wheels so that the desired row of values aligns with a
 *  selection indicator.
 *  <p>
 *  This code ins based on Spinning Wheel object from Matteo Spinelli.
 *
 *  <p>
 *  Delegate:
 *  <ul>
 *    <li/>pickerViewSelectRow : function (vs.ui.Picker the view)
 *  </ul>
 *  <p>
 *  Event:
 *  <ul>
 *    <li/>change : data : {index: slot_index, key: selected key, value, 
 *                  selected value} 
 *  </ul>
 *  <p>
 *  @example
 *  var sizePicker = new vs.ui.Picker ();
 *  
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot ({ separator: ',', 'readonly');
 *  sizePicker.addSlot (vs.ui.Picker.NUMBERS, 'right');
 *  sizePicker.addSlot ({ cm: 'Cm', ft: 'Feet' }, 'shrink');
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.Picker.
 * @name vs.ui.Picker
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function Picker (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Picker;
}

/**
 * Predefined numbers for the Picker
 *
 * @name vs.ui.Picker.NUMBERS
 * @public
 * @const
 */
Picker.NUMBERS =
  { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9};

/**
 * @private
 * @const
 */
Picker.MODE_DEFAULT = 0;

/**
 * @private
 * @const
 */
Picker.MODE_IOS = 1;

/**
 * @private
 * @const
 */
Picker.MODE_ANDROID = 2;

/**
 * @private
 * @const
 */
Picker.MODE_WP7 = 3;

/**
 * @private
 * @const
 */
Picker.MODE_SYMBIAN = 4;

/**
 * @private
 * @const
 */
Picker.MODE_BLACK_BERRY = 5;

Picker.prototype = {

  /**
   * @private
   * @type {Number}
   */
  _mode: Picker.MODE_DEFAULT,

  /**
   * @private
   * @type {Number}
   */
  _cell_height: 44,

  /**
   * @private
   * @type {Number}
   */
  _friction: 0.003,

  /**
   * Slots data
   * @protected
   * @type {Array}
   */
  _data: null,

  /**
   * Slots build elements
   * @private
   * @type {Array}
   */
  _slots_elements: null,

  /**
   * Slots build elements
   * @private
   * @type {Array}
   */
  _current_values: null,

  /**
   * @protected
   * @type {Array}
   */
  _selected_keys: null,

  /**
   * @protected
   * @type {Array}
   */
  _selected_values: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * destructor
   *
   * @protected
   * @function
   */
  destructor : function ()
  {
    vs.removePointerListener (this._frame_view, core.POINTER_START, this, false);

    vs.removePointerListener (document, core.POINTER_START, this, false);
    vs.removePointerListener (document, core.POINTER_MOVE, this, false);

    util.removeAllElementChild (this._slots_view);

    delete (this._data);
    delete (this._slots_elements);
    delete (this._frame_view);
    delete (this._slots_view);
 
    delete (this._current_values);
 
    View.prototype.destructor.call (this);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    this._data = [];
    this._slots_elements = [];
    
    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_IOS)
    {
      this._mode = Picker.MODE_IOS;
    }
    else if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this._mode = Picker.MODE_ANDROID;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this._mode = Picker.MODE_WP7;
    }
    else if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this._mode = Picker.MODE_SYMBIAN;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this._mode = Picker.MODE_BLACK_BERRY;
    }
    else
    {
      this._mode = Picker.MODE_DEFAULT;
    }
    
    // Pseudo table element (inner wrapper)
    this._slots_view = this.view.querySelector ('.slots');
        
    // The scrolling controller
    this._frame_view = this.view.querySelector ('.frame');
    
    switch (this._mode)
    {
      case Picker.MODE_BLACK_BERRY:
         this._cell_height = 50;

      case Picker.MODE_DEFAULT:
      case Picker.MODE_IOS:
      case Picker.MODE_SYMBIAN:
        // Add scrolling to the slots
        vs.addPointerListener (this._frame_view, core.POINTER_START, this);
        this._frame_border_width = 0;
      break;
      
      case Picker.MODE_WP7:
        this._cell_height = 83;
      
      case Picker.MODE_ANDROID:
        this._frame_view.parentElement.removeChild (this._frame_view);
      break;
    }    
  },

  /**
   * Remove all slots from the picker
   *
   * @public
   * @name vs.ui.Picker#removeAllSlots 
   * @function
   */
  removeAllSlots: function ()
  {
    delete (this._data);
    this._data = [];
    
    this._remove_all_slots ();
  },

  /**
   * Remove all slots from the picker
   *
   * @public
   * @name vs.ui.Picker#removeAllSlots 
   * @function
   */
  _remove_all_slots: function ()
  {
    util.removeAllElementChild (this._slots_view);

    delete (this._slots_elements);
    this._slots_elements = [];
    
    this._active_slot = null;
  },

  /**
   * Renders slots
   *
   * @private
   * @function
   */
  _render_slots: function ()
  {
    // Create HTML slot elements
    for (var l = 0; l < this._data.length; l++)
    {
      // Create the slot
      this._render_a_slot (l);
    }
  },  
  
  /**
   * Renders one slot
   *
   * @private
   * @function
   */
  _render_a_slot: function (l)
  {
    var i, out, ul, div, data = this._data[l];

    if (!data) { return; }

    var width = 0;
    var os_device = window.deviceConfiguration.os;
    if (data.length && os_device == DeviceConfiguration.OS_WP7)
      width = Math.floor (100 / data.length);
    
     // Create the slot
    ul = document.createElement ('ul');
    ul.index = l;

    // WP7 does not manage box model (then use inline-block instead of)
    if (width) util.setElementStyle (ul, {"width": width + '%'});

    out = '';
    
    for (i in data.values)
    {
      out += '<li>' + data.values[i] + '<' + '/li>';
    }
    util.safeInnerHTML (ul, out);
    
    if (this._mode === Picker.MODE_ANDROID)
    {
      // Create slot container
      div = document.createElement ('div');
      
      var buttons = this._generate_button (l);

      div.appendChild (buttons [0]);
    
      // Create slot container
      var slot = document.createElement ('div');
      // Add styles to the container
      slot.className = data.style;
      slot.appendChild (ul);
      div.appendChild (slot);

      div.appendChild (buttons [1]);
    }
    else
    {
      // Create slot container
      div = document.createElement ('div');
      // Add styles to the container
      div.className = data.style;
      div.appendChild (ul);
    }

    // Append the slot to the wrapper
    this._slots_view.appendChild (div);
    
    // Save the slot position inside the wrapper
    ul.slotPosition = l;
    ul.slotYPosition = 0;
    switch (this._mode)
    {
      case Picker.MODE_WP7:
        ul.slotMaxScroll = this.view.clientHeight - ul.clientHeight;
        vs.addPointerListener (ul, core.POINTER_START, this, true);
      break;
    }    
    
    // Add default transition
    ul.style.webkitTransitionTimingFunction = 'cubic-bezier(0, 0, 0.2, 1)';   

    if (SUPPORT_3D_TRANSFORM)
      setElementTransform (ul, 'translate3d(0,0,0)');
    else
      setElementTransform (ul, 'translate(0,0)');
    
    // Save the slot for later use
    this._slots_elements.push (ul);
    
    // Place the slot to its default position (if other than 0)
    if (data.defaultValue)
    {
      this.scrollToValue (l, data.defaultValue);  
    }
  },
  
  /**
   * @protected
   * @function
   */
  _generate_button: function (i)
  {
    var readonly = this._data[i].style.match ('readonly');

    var button_incr = document.createElement ('div');
    if (readonly)
    {
      button_incr.className = 'button_incr readonly';
    }
    else
    {
      button_incr.className = "button_incr";
      util.setElementInnerText (button_incr, '+');
      button_incr.slotPosition = i;
    }

    if (!readonly)
    {
      vs.addPointerListener (button_incr, core.POINTER_START, this);
      vs.addPointerListener (button_incr, core.POINTER_END, this);
      vs.addPointerListener (button_incr, core.POINTER_CANCEL, this);
    }
    
    // Create the slot
    var button_decr = document.createElement ('div');
    if (readonly)
    {
      button_decr.className = 'button_decr readonly';
    }
    else
    {
      button_decr.className = 'button_decr';
      util.setElementInnerText (button_decr, '-');
      button_decr.slotPosition = i;
    }

    if (!readonly)
    {
      vs.addPointerListener (button_decr, core.POINTER_START, this);
      vs.addPointerListener (button_decr, core.POINTER_END, this);
      vs.addPointerListener (button_decr, core.POINTER_CANCEL, this);
    }
    
    return [button_incr, button_decr];
  },
  
  /**
   * @protected
   * @function
   */
  _buttonSelected : function (e)
  {
    var slotNum = e.target.slotPosition;
    switch (e.type)
    {
      case core.POINTER_START:
        util.addClassName (e.target, 'active');
        break
      
      case core.POINTER_END:
        var slot_elem = this._slots_elements[slotNum], slotMaxScroll,
          pos = slot_elem.slotYPosition;
        if (util.hasClassName (e.target, 'button_decr'))
        {
          pos += 44;
          if (pos > 0) { pos = 0;}
        }
        else
        {
          pos -= 44;
          var slotMaxScroll = this.getSlotMaxScroll (slot_elem);
          if (pos < slotMaxScroll) { pos = slotMaxScroll; }
        }

        this._scrollTo (slotNum, pos);
      case core.POINTER_CANCEL:
        util.removeClassName (e.target, 'active');
        break
    }
  },
  
  /**
   * Add a new slot to the picket view.
   * <p>
   * The new slot is added at right of others slots.<br/>
   * Values is in the form of: < key: value >. Keys are the identifiers
   * that won’t be shown in the picker.<br/>
   *
   * Styles is a list of space separated predefined styles to be applied
   * to the slot. The available values are:
   * <ul>
   *  <li />right, align text inside the slot to the right;
   *  <li />readonly, the slot can’t be spun;
   *  <li />shrink, shrink the slot width to the minimum possible.
   * </ul>
   *
   * @name vs.ui.Picker#addSlot
   * @function
   *
   * @param {Object} values The slot data
   * @param {string} style The slot style
   * @param {string} defaultValue The default value to set
   */
  addSlot: function (values, style, defaultValue)
  {
    if (!style) { style = ''; }

    var obj = {}
    obj.values = values;
    obj.style = style;
    obj.defaultValue = defaultValue;
    
    this._data.push (obj);
    
    this._render_a_slot (this._data.length - 1);
  },
  
  /**
   * Returns slots selected value.
   *
   * @public
   *
   * @name vs.ui.Picker#getSelectedValues
   * @function
   *
   * @return {Object} {keys, values}
   */
  getSelectedValues: function ()
  {
    if (this._current_values) { return this._current_values; }
    
    var index, count, i, l, elem, slotMaxScroll;
    
    this._selected_keys = [];
    this._selected_values = [];

    for (i = 0; i < this._slots_elements.length; i++)
    {
      elem = this._slots_elements[i];
      if (!elem)
      { continue; }
      // Remove any residual animation
      elem.removeEventListener (vs.TRANSITION_END, this, false);
      elem.style.setProperty (vs.TRANSITION_DURATION, '0');

      slotMaxScroll = this.getSlotMaxScroll (elem);
      
      if (elem.slotYPosition > 0)
      {
        this._setPosition (i, 0);
      }
      else if (elem.slotYPosition <  slotMaxScroll)
      {
        this._setPosition (i, slotMaxScroll);
      }

      index = -Math.round (elem.slotYPosition / this._cell_height);

      count = 0;
      for (l in this._data[i].values)
      {
        if (count == index)
        {
          this._selected_keys.push (l);
          this._selected_values.push (this._data[i].values[l]);
          break;
        }
        
        count++;
      }
    }

    this._current_values =
      { 'keys': this._selected_keys, 'values': this._selected_values };
    return this._current_values;
  },

  /**
   * Returns slots selected value.
   *
   * @private
   * @function
   *
   * @return {Object} {keys, values}
   */
  _getSelectedValues: function ()
  {
    if (this._current_values) { return this._current_values; }
    
    var index, count, i, l, elem;

    this._selected_keys = [];
    this._selected_values = [];

    for (i = 0; i < this._slots_elements.length; i++)
    {
      elem = this._slots_elements[i];
      if (!elem) { continue; }

       index = -Math.round (elem.slotYPosition / this._cell_height);

      count = 0;
      for (l in this._data[i].values)
      {
        if (count == index)
        {
          this._selected_keys.push (l);
          this._selected_values.push (this._data[i].values[l]);
          break;
        }
        
        count++;
      }
    }

    this._current_values =
      { 'keys': this._selected_keys, 'values': this._selected_values };
    return this._current_values;
  },

  /**
   * Scroll a given slot to a set value
   *
   * @name vs.ui.Picker#scrollToValue
   * @function
   *
   * @param {number} slot the slot number (number starting from 0)
   * @param {string} value the value to set
   * @return {boolean} returns true if the value was set. False otherwise.
   */
  scrollToValue: function (slot, value)
  {
    var yPos, count, i, elem = this._slots_elements[slot],
      slot_data = this._data[slot];

    if (!elem) { return false; }
    if (!slot_data) { return false; }
    
    elem.removeEventListener (vs.TRANSITION_END, this, false);
    elem.style.setProperty (vs.TRANSITION_DURATION, '0');
    
    count = 0;
    for (i in slot_data.values)
    {
      if (i == value)
      {
        yPos = count * this._cell_height;
        this._setPosition (slot, yPos);
        return true;
      }
      
      count -= 1;
    }
    return false
  },
  
  /*****************************************************************
   *              private general methodes
   ****************************************************************/

  /**
   * Rolling slots
   *
   * @private
   * @function
   */
  _setPosition: function (slot, pos)
  {
    delete (this._current_values);
    var elem = this._slots_elements [slot];
    elem.slotYPosition = pos;

    if (SUPPORT_3D_TRANSFORM)
      setElementTransform (elem, 'translate3d(0,' + pos + 'px,0)');
    else
      setElementTransform (elem, 'translate(0,' + pos + 'px)');
  },
  
  /**
   * Rolling slots
   *
   * @private
   * @function
   */
  _scrollTo: function (slotNum, dest, runtime)
  {
    var slot_elem = this._slots_elements[slotNum], slotMaxScroll;
    slot_elem.style.setProperty (vs.TRANSITION_DURATION, runtime ? runtime + 'ms': '100ms');
    this._setPosition (slotNum, dest ? dest : 0);

    slotMaxScroll = this.getSlotMaxScroll (slot_elem);
    
    // If we are outside of the boundaries go back to the sheepfold
    if (slot_elem.slotYPosition > 0 ||
        slot_elem.slotYPosition < slotMaxScroll)
    {
      slot_elem.addEventListener (vs.TRANSITION_END, this, false);
    }
    else
    {
      if (this._delegate && this._delegate.pickerViewSelectRow)
      {
        this._delegate.pickerViewSelectRow (this);
      }
      this.propagate ('change', this._getSelectedValues ());
      this.propertyChange ();
    }
  },
  
  /*****************************************************************
   *              Events managements
   ****************************************************************/

  /**
   * Main event handler
   *
   * @private
   * @function
   */
  handleEvent: function (e)
  {
    if (this._mode === Picker.MODE_ANDROID)
    {
      this._buttonSelected (e);
    }
    else switch (e.type)
    {
      case core.POINTER_START:
        this._scrollStart (e);
      break;

      case core.POINTER_MOVE:
        this._scrollMove (e);
      break;

      case core.POINTER_END:
        this._scrollEnd (e);
      break;

      case vs.TRANSITION_END:
        this._backWithinBoundaries (e);
      break;
    }
  },

  /**
   * @protected
   * @function
   */
  _scrollStart: function (e)
  {
    if (e.nbPointers > 1) return false;
    
    e.preventDefault ();
    e.stopPropagation ();
    
    var point = e.pointerList [0];
    this._active_slot = undefined;

    var css = this._getComputedStyle (this._frame_view);
    this._frame_border_width = css ? parseInt (css.getPropertyValue ('border-left-width')) : 0;

    switch (this._mode)
    {
      case Picker.MODE_DEFAULT:
      case Picker.MODE_IOS:
      case Picker.MODE_SYMBIAN:
      case Picker.MODE_BLACK_BERRY:
        var delta = 0;
        // Find the clicked slot
        var rec = util.getBoundingClientRect (this._slots_view);
        if (this._mode == Picker.MODE_BLACK_BERRY) { delta = 8; }
        
        // Clicked position
        var xPos = point.clientX - rec.left - this._frame_border_width - delta; 
        
        // Find tapped slot
        var slot = 0;
        for (var i = 0; i < this._slots_elements.length; i++)
        {
          slot += this._slots_elements[i].offsetWidth;
          
          if (xPos < slot)
          {
            this._active_slot = i;
            break;
          }
        }
      break;

      case Picker.MODE_WP7:
        this._active_slot = e.currentTarget.index;
        util.addClassName ("dragging");
      break;
    }
    
    if (typeof this._active_slot === "undefined")
    { return; }

    // If slot is readonly do nothing
    if (this._data[this._active_slot].style.match('readonly'))
    {
      vs.removePointerListener (document, core.POINTER_MOVE, this, true);
      vs.removePointerListener (document, core.POINTER_END, this, true);
      return false;
    }
    
    var slot_elem = this._slots_elements[this._active_slot];
    
    slot_elem.slotMaxScroll = this.getSlotMaxScroll (slot_elem);

    slot_elem.removeEventListener (vs.TRANSITION_END, this, false);  // Remove transition event (if any)
    slot_elem.style.setProperty (vs.TRANSITION_DURATION, '0');   // Remove any residual transition
    
    // Stop and hold slot position
    if (SUPPORT_3D_TRANSFORM)
    {
      var theTransform = getElementTransform (slot_elem);
      theTransform = new vs.CSSMatrix(theTransform).m42;
      if (theTransform != slot_elem.slotYPosition)
      {
        this._setPosition (this._active_slot, theTransform);
      }
    }
    
    this.startY = point.clientY;
    this.scrollStartY = slot_elem.slotYPosition;
    this.scrollStartTime = e.timeStamp;

    vs.addPointerListener (document, core.POINTER_MOVE, this, true);
    vs.addPointerListener (document, core.POINTER_END, this, true);
    
    switch (this._mode)
    {
      case Picker.MODE_WP7:
      case Picker.MODE_BLACK_BERRY:
        if (this.__timer)
        {
          clearTimeout (this.__timer);
          this.__timer = 0;
        }
        
        if (this.__elem_to_hide && this.__elem_to_hide != slot_elem)
        {
          util.removeClassName (this.__elem_to_hide.parentElement, "visible");
          this.__elem_to_hide = null;
        }
        util.addClassName (slot_elem.parentElement, "visible");
      break;
    }    

    return true;
  },

  /**
   * @protected
   * @function
   */
  _scrollMove: function (e)
  {
    e.preventDefault ();
    e.stopPropagation ();

    var point = e.pointerList [0];
    var topDelta = point.clientY - this.startY;
    var slot_elem = this._slots_elements[this._active_slot];

    if (slot_elem.slotYPosition > 0 ||
        slot_elem.slotYPosition < slot_elem.slotMaxScroll)
    {
      topDelta /= 2;
    }
    
    this._setPosition (this._active_slot, slot_elem.slotYPosition + topDelta);
    this.startY = point.clientY;

    // Prevent slingshot effect
    if (e.timeStamp - this.scrollStartTime > 80)
    {
      this.scrollStartY = slot_elem.slotYPosition;
      this.scrollStartTime = e.timeStamp;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scrollEnd: function (e)
  {
    vs.removePointerListener (document, core.POINTER_MOVE, this, true);
    vs.removePointerListener (document, core.POINTER_END, this, true);
    
    var elem = this._slots_elements[this._active_slot], scrollDist,
      scrollDur, newDur, newPos, self = this;
    if (!elem) { return; }

    switch (this._mode)
    {
//      case Picker.MODE_BLACK_BERRY:
//        this.__elem_to_hide = elem;
//      break;
  
      case Picker.MODE_BLACK_BERRY:
      case Picker.MODE_WP7:
        if (elem.parentElement)
        {
          this.__elem_to_hide = elem;
          this.__timer = setTimeout (function ()
          {
            util.removeClassName (self.__elem_to_hide.parentElement, "visible");
            self.__elem_to_hide = null;
            self.removeClassName ("dragging");
          }, 1000);
        }
      break;
    }    

    // If we are outside of the boundaries, let's go back to the sheepfold
    if (elem.slotYPosition > 0 || elem.slotYPosition < elem.slotMaxScroll)
    {
      this._scrollTo 
        (this._active_slot, elem.slotYPosition > 0 ? 0 : elem.slotMaxScroll);
      return false;
    }

    // Lame formula to calculate a fake deceleration
    scrollDist = elem.slotYPosition - this.scrollStartY;

    // The drag session was too short
    if (scrollDist < this._cell_height / 1.5 && 
        scrollDist > -this._cell_height / 1.5)
    {
      if (elem.slotYPosition % this._cell_height)
      {
        this._scrollTo 
          (this._active_slot,
          Math.round(elem.slotYPosition / this._cell_height) * this._cell_height, 100);
      }

      return false;
    }

    scrollDur = e.timeStamp - this.scrollStartTime;

    newDur = (2 * scrollDist / scrollDur) / this._friction;
    scrollDist = (this._friction / 2) * (newDur * newDur);
    
    if (newDur < 0)
    {
      newDur = -newDur;
      scrollDist = -scrollDist;
    }

    newPos = elem.slotYPosition + scrollDist;
 
    if (newPos > 0)
    {
      // Prevent the slot to be dragged outside the visible area (top margin)
      newPos /= 2;
      newDur /= 3;

      if (newPos > this.view.clientHeight / 4)
      {
        newPos = this.view.clientHeight / 4;
      }
    }
    else if (newPos < elem.slotMaxScroll)
    {
      // Prevent the slot to be dragged outside the visible area (bottom margin)
      newPos = (newPos - elem.slotMaxScroll) / 2 + elem.slotMaxScroll;
      newDur /= 3;
      
      if (newPos < elem.slotMaxScroll - this.view.clientHeight / 4)
      {
        newPos = elem.slotMaxScroll - this.view.clientHeight / 4;
      }
    }
    else
    {
      newPos = Math.round (newPos / this._cell_height) * this._cell_height;
    }

    this._scrollTo
      (this._active_slot, Math.round (newPos), Math.round (newDur));
 
    return true;
  },

  /**
   * @protected
   * @function
   */
  getSlotMaxScroll : function (ul)
  {
    switch (this._mode)
    {
      case Picker.MODE_DEFAULT:
        return this.view.clientHeight - ul.clientHeight - 66;
      break;
      
      case Picker.MODE_IOS:
        return this.view.clientHeight - ul.clientHeight - 86;
      break;
      
      case Picker.MODE_SYMBIAN:
        return this.view.clientHeight - ul.clientHeight - 80;
      break;
      
      case Picker.MODE_BLACK_BERRY:
        return this.view.clientHeight - ul.clientHeight - 93;
      break;
      
      case Picker.MODE_WP7:
        return this.view.clientHeight - ul.clientHeight - 103;
      break;
      
      case Picker.MODE_ANDROID:
        return this.view.clientHeight - ul.clientHeight - 121;
      break;
    }
    
    return 0;
  },
  
  /**
   * @protected
   * @function
   */
  _backWithinBoundaries: function (e)
  {
    var elem = e.target;
    elem.removeEventListener (vs.TRANSITION_END, this, false);
    
    slotMaxScroll = this.getSlotMaxScroll (elem);

    this._scrollTo (elem.slotPosition, elem.slotYPosition > 0 ? 0 : slotMaxScroll, 150);
    
    return false;
  }
};
util.extendClass (Picker, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Picker, {
  'delegate': {
    /** 
     * Set the delegate.
     * It should implements following methods
     *  <ul>
     *    <li/>pickerViewSelectRow : function (vs.ui.Picker the view)
     *  </ul>
     * @name vs.ui.Picker#delegate 
     * @type {Object}
     */ 
    set : function (v)
    {
      this._delegate = v;
    }
  },
  
  'data': {
    /** 
     * Sets the Picker datas
     * 
     * Data is a array of object <values, type, default_value>:
     * <ul>
     * <li/>Values is in the form of: < key: value >. Keys are the identifiers
     * that won’t be shown in the picker.<br/>
     *
     * <li/>Styles is a list of space separated predefined styles to be applied
     * to the slot. The available values are:
     * <ul>
     *  <li />right, align text inside the slot to the right;
     *  <li />readonly, the slot can’t be spun;
     *  <li />shrink, shrink the slot width to the minimum possible.
     * </ul>
     * 
     * <li/>Default value, a value include in values field
     * </ul>
     *
     * @example
     *  var sizePicker = new vs.ui.Picker ();
     *  
     *  sizePicker.data = [
     *     {values: vs.ui.Picker.NUMBERS, style: 'right shrink'},
     *     {values: vs.ui.Picker.NUMBERS, style: 'right shrink'},
     *     {values: vs.ui.Picker.NUMBERS, style: 'right shrink'}];
     * 
     * @name vs.ui.Picker#data 
     * @type {boolean|number}
     */ 
    set : function (v)
    {
      var data, values, style, defaultValue, i;
      if (!util.isArray (v))
      { return; }
      
      this.removeAllSlots ();
      
      for (i = 0; i < v.length; i++)
      {
        data = v [i];
        values = data.values
        style = data.style
        defaultValue = data.defaultValue
        
        if (!values) { continue; }
        
        this.addSlot (values, style, defaultValue);
      }
    }
  },
  
  'selectedKeys': {
    /** 
     * Get the selected slot keys
     * @name vs.ui.Picker#selectedKeys 
     * @type {Array}
     */ 
    get : function ()
    {
      if (!this._current_values)
      {
        this.getSelectedValues ();
      }
      return this._selected_keys;
    }
  },
  
  'selectedValues': {
    /** 
     * Get the selected slot values
     * @name vs.ui.Picker#selectedValues 
     * @type {Array}
     */ 
    get : function ()
    {
      if (!this._current_values)
      {
        this.getSelectedValues ();
      }
      return this._selected_values;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Picker = Picker;
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
 *  The vs.ui.SVGView class
 *
 *  @extends vs.ui.View
 *  @class
 *  An vs.ui.SVGView embeds an svg view into your application.
 *
 *  @example
 *  var svg = vs.ui.SVGView (config).init ();
 *  svg.href = 'image.svg';
 *  // or
 *  svg.href = 'image.svg#id';
 *  // or
 *  svg.contentData = "<svg.... ";
 *
 *  @author David Thevenin
 * @name vs.ui.SVGView
 *
 *  @constructor
 *   Creates a new vs.ui.SVGView.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function SVGView (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = SVGView;
}

var SVG_DOCUMENTS = {};
var SVG_DOCUMENTS_TO_LOAD = {};
var SVG_DIV_DOCUMENTS = null;

function load_svg_doc (path, id, svg_obj)
{
  if (!path || !svg_obj) return;

  var handlers = SVG_DOCUMENTS_TO_LOAD [path];
  if (handlers)
  {
    // register new handler
    handlers.push ({ elem_id: id, svg_obj : svg_obj });
  }
  else
  {
    // create handlers and register new handler
    handlers = [];
    handlers.push ({ elem_id: id, svg_obj : svg_obj });

    SVG_DOCUMENTS_TO_LOAD [path] = handlers;

    // load document
    var object = document.createElement ('object');
    object.data = path;
    object.type = "image/svg+xml";
    object.width = "0";
    object.height = "0";
    object.style.visibility = "hidden";

    object.onload = function (e) {

      var doc = object.getSVGDocument ();
      var svg_doc = doc.querySelector ('svg');
      if (!SVG_DIV_DOCUMENTS)
      {
        SVG_DIV_DOCUMENTS = document.createElement ('div');
        SVG_DIV_DOCUMENTS.style.width = "0";
        SVG_DIV_DOCUMENTS.style.height = "0";
        SVG_DIV_DOCUMENTS.style.visibility = "hidden";
        document.body.appendChild (SVG_DIV_DOCUMENTS);
      }
      SVG_DIV_DOCUMENTS.appendChild (svg_doc);
      document.body.removeChild (object);

      SVG_DOCUMENTS [path] = svg_doc;

      var handlers = SVG_DOCUMENTS_TO_LOAD [path];
      if (!handlers) return;
      delete (SVG_DOCUMENTS_TO_LOAD [path]);

      for (var i = 0; i < handlers.length; i++)
      {
        var handler = handlers [i];
        handler.svg_obj.__set_svg_doc (svg_doc, handler.elem_id);
      }
    };
    document.body.appendChild (object);
  }
}

SVGView.prototype = {

  /**
   * The svg url
   * @private
   * @type {string}
   */
  _href: null,

  /**
   * The svg view box
   * @private
   * @type {array}
   */
  _view_box: null,

  /*****************************************************************
   *
   ****************************************************************/
  __set_svg_doc : function (svg_doc, elem_id)
  {
    if (!svg_doc) return;

    var svg = document.createElementNS ("http://www.w3.org/2000/svg", 'svg');

    this.view.appendChild (svg);
    if (this._view_box) this.viewBox = this._view_box;

    function create_use (elem_id)
    {
      use = document.createElementNS ("http://www.w3.org/2000/svg", 'use')
      use.setAttributeNS ("http://www.w3.org/1999/xlink", "href", "#" + elem_id);
      return use;
    }

    if (elem_id)
    {
      svg.appendChild (create_use (elem_id));
    }
    else
    {
      var nodes = svg_doc.childNodes
      for (var i = 0; i < nodes.length; i++)
      {
        var node = nodes [i];
        if (node.nodeType === 1 && node.nodeName !== 'defs')
        {
          elem_id = node.getAttribute ('id');
          if (!elem_id)
          {
            elem_id = vs.core.createId ();
            node.setAttribute ('id', elem_id);
          }
          svg.appendChild (create_use (elem_id));
        }
      }
    }
  }
};
util.extendClass (SVGView, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (SVGView, {
  'href': {
    /**
     * Set the image url
     * @name vs.ui.SVGView#src
     * @type {string}
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._href = v;
      var href, elem_id;

      if (v.indexOf ("#") !== -1)
      {
        href = v.substr (0, v.indexOf ("#"));
        elem_id = v.substring (v.indexOf ("#") + 1);
      }
      else
      {
        href = this._href;
      }

      var svg_doc = SVG_DOCUMENTS [href];
      if (svg_doc) this.__set_svg_doc (svg_doc, elem_id);
      else load_svg_doc (href, elem_id, this);
    },

    /**
     * @ignore
     * Get the image url
     * @return {string}
     */
    get : function ()
    {
      return this._href;
    }
  },

  'contentData': {
    /**
     * Set the image url
     * @name vs.ui.SVGView#contentData
     * @type {string}
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this.removeAllElementChild (this.view);
      if (this.__object)
      {
        delete (this.__object);
      }

      util.safeInnerHTML (this.view, v);
      this._href = undefined;
    }
  },

  'viewBox': {
    /**
     * Set the image url
     * @name vs.ui.SVGView#viewBox
     * @type {array}
     */
    set : function (v)
    {
      if (!util.isArray (v) || v.length != 4) { return; }

      this._view_box = v;

      var svg_doc = this.view.querySelector ('svg');
      if (!svg_doc) return;

      svg_doc.setAttribute ('width', v[2]);
      svg_doc.setAttribute ('height', v[3]);
      svg_doc.setAttribute ('viewBox', v.join (' '));
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.SVGView = SVGView;
/*
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
 *  The vs.ui.SegmentedButton class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.SegmentedButton class is a subclass of vs.ui.View that intercepts
 *  pointer-down events and sends an 'select' event to a target object when
 *  it’s clicked or pressed.
 *  <br />
 *  The widget displays horizontally a set of button. Only one button can be
 *  selected.
 *  <br />
 *  Events:
 *  <ul>
 *    <li /> select: Fired after a button is pressed. {index, item}
 *  </ul>
 *  <p>
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *
 *  var segButton = vs.ui.SegmentedButton ({
 *    items : ['test1', 'test2', 'test3'],
 *    size : [280, 30],
 *    style : vs.ui.SegmentedButton.BAR_STYLE
 *  }).init ();
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.SegmentedButton
 *
 *  @constructor
 *   Creates a new vs.ui.SegmentedButton.
 * @name s.ui.SegmentedButton
 *
 * @param {Object} config the configuration structure
*/
function SegmentedButton (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = SegmentedButton;
}

/**
 * default type
 * @name vs.ui.SegmentedButton.DEFAULT_TYPE
 * @const
 */
SegmentedButton.DEFAULT_TYPE = 'default';;

/**
 * bar type
 * @name vs.ui.SegmentedButton.BAR_TYPE
 * @const
 */
SegmentedButton.BAR_TYPE = 'bar';;

/** 
 * Horizontal constant to configure a SegmentedButton.
 * <p/>A SegmentedButton can be horizontal or vertical.
 * Set the orientation property with this constant for a horizontal SegmentedButton.
 * By default a SegmentedButton is horizontal.
 * @see vs.ui.SegmentedButton#orientation
 * @name vs.ui.SegmentedButton.HORIZONTAL
 * @const
 */
SegmentedButton.HORIZONTAL = 0;

/** 
 * Vertical constant to configure a SegmentedButton.
 * <p/>A SegmentedButton can be horizontal or vertical.
 * Set the orientation property with this constant for a vertical SegmentedButton.
 * By default a SegmentedButton is horizontal.
 * @see vs.ui.SegmentedButton#orientation
 * @name vs.ui.SegmentedButton.VERTICAL
 * @const
 */
SegmentedButton.VERTICAL = 1;

SegmentedButton.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @protected
   * @type {number}
   */
  _type: SegmentedButton.DEFAULT_TYPE,

  /**
   *
   * @protected
   * @type {number}
   */
  _is_toggle_buttons: true,

  /**
   *
   * @protected
   * @type {array.<string>}
   */
  _items: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _selected_index: -1,

  /**
   *
   * @private
   * @type {array.<HtmlDivElement>}
   */
  _div_list: null,

  /**
   * SegmentedButton orientation (0: horizontal, 1: vertical)
   * @protected
   * @type {number}
   */
  _orientation : SegmentedButton.HORIZONTAL,

  /*****************************************************************
   *               General methods
   ****************************************************************/
    
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this._cleanButtons ();
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  _cleanButtons : function (v)
  {
    if (!this.view) { return; }
    
    util.removeAllElementChild (this.view);
    
    while (this._div_list.length)
    {
      var div = this._div_list [0];
      vs.removePointerListener (div, core.POINTER_START, this);
      
      this._div_list.remove (0);
    }
  },
  
  /**
   * @protected
   * @function
   */
  _renderButtons : function (v)
  {
    if (!this.view) { return; }
    
    this._cleanButtons ();
    var width = "";
    var os_device = window.deviceConfiguration.os;
    if (this._items.length && os_device == DeviceConfiguration.OS_WP7)
      width = Math.floor (100 / this._items.length);
      
    var subView = document.createElement ('div');
    this.view.appendChild (subView)
    
    for (var i = 0, l = this._items.length; i < l; i++)
    {
      var div = document.createElement ('div');
      div._index = i;
      util.setElementInnerText (div, this._items [i]);
      
      // WP7 does not manage box model (then use inline-block instead of)
      if (width) util.setElementStyle (div, {"width": width + '%'});

      vs.addPointerListener (div, core.POINTER_START, this);
      
      this._div_list.push (div);
      subView.appendChild (div);
    }
    this.orientation = this._orientation;
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    this._items = new Array ();
    this._div_list = new Array ();

    this._renderButtons ();
    this.selectedIndex = this._selected_index;
    this.type = this._type;
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    var target;
    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }
      
      // hack to retrieve the correct source (the bug occurs on iOS)
      target = e.target;
      if (!target.tagName)
      {
        target = target.parentElement;
      }
      if (this._selected_index === target._index)
      { return false; }
      
      e.stopPropagation ();
      e.preventDefault ();

      this.selectedIndex = target._index;
      this.propagate ('select', {
        index: this._selected_index,
        item: this._items [this._selected_index]
      });
      
      this.propertyChange ();
      
      return false;
    }
  }
};
util.extendClass (SegmentedButton, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (SegmentedButton, {
  'items': {
    /** 
     * Getter|Setter for text. Allow to get or change the text draw
     * by the button
     * @name vs.ui.SegmentedButton#text 
     * @type String
     */ 
    set : function (v)
    {
      var i, l;
      if (!util.isArray (v) || !v.length) { return; }
      
      this._items.removeAll ();
      for (var i = 0, l = v.length; i < l; i++)
      {
        if (!v [i]) { continue; }
        
        this._items.push (v [i].toString ());
      }
      
      this._renderButtons ();
      if (this._is_toggle_buttons) this.selectedIndex = this._selected_index;
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text;
    }
  },
  'selectedIndex': {
    /** 
     * Getter|Setter for select one of button
     * @name vs.ui.SegmentedButton#selectedIndex 
     * @type number
     */ 
    set : function (v)
    {
      if (!util.isNumber (v)) { return; }
      if (v < 0 || v >= this._div_list.length) { return; }
          
      var div = this._div_list [this._selected_index];
      if (div)
      {
        util.removeClassName (div, 'selected'); 
      }
      
      this._selected_index = v;
      var div = this._div_list [this._selected_index];
      if (div)
      {
        util.addClassName (div, 'selected'); 
      }
      if (!this._is_toggle_buttons)
      {
        var self = this;
        this.__button_time_out = setTimeout (function ()
        {
          util.removeClassName (div, 'selected');
          self.__button_time_out = 0;
          self._selected_index = -1;
        }, View.UNSELECT_DELAY);
      }
    },
  
    /** 
     * @ignore
     * @return {number}
     */ 
    get : function ()
    {
      return this._selected_index;
    }
  },
  'type': {
    /** 
     * Getter|Setter for the widget type (for instance default, bar, ...)
     * @name vs.ui.SegmentedButton#type 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (this._type)
      {
        this.removeClassName (this._type);
      }
      this._type = v;
      this.addClassName (this._type);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._type;
    }
  },
  'isToggleButtons': {
    /** 
     * Getter|Setter to configure the buttons as toggle buttons or not.
     * By default SegmentedButton are toggle buttons
     * @name vs.ui.SegmentedButton#isToggleButton 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v) this._is_toggle_buttons = true;
      else this._is_toggle_buttons = false;
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._is_toggle_buttons;
    }
  },
  'orientation':{
    /**
     * Property to configure the SegmentedButton orientation.
     * <p/>A SegmentedButton can be horizontal or vertical.
     *  Use the vs.ui.SegmentedButton.HORIZONTAL
     * or vs.ui.SegmentedButton.VERTICAL constant to configure the
     * SegmentedButton.
     * <p/>By default a SegmentedButton is horizontal.
     * @name vs.ui.SegmentedButton#orientation 
     * @type number
     */
    set : function (v)
    {
      if (v !== SegmentedButton.HORIZONTAL && v !== SegmentedButton.VERTICAL)
      { return; }
      
      this._orientation = v;
      
      if (this._orientation === 0)
      {
        this.removeClassName ('vertical');
        this.addClassName ('horizontal');
      }
      else
      {
        this.addClassName ('vertical');
        this.removeClassName ('horizontal');
      }
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._orientation;
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.SegmentedButton = SegmentedButton;

View.prototype.html_template = "\
<div class='vs_ui_view' x-hag-hole='children'></div>\
";

SplitView.prototype.html_template = "\
<div class='vs_ui_splitview'>\
  <div x-hag-hole='second_panel'></div>\
  <div x-hag-hole='main_panel'></div>\
</div>\
";

ScrollView.prototype.html_template = "\
<div class='vs_ui_scrollview'>\
  <div x-hag-hole='top_bar'></div>\
  <div class='content' x-hag-hole='children'></div>\
  <div x-hag-hole='bottom_bar'></div>\
</div>\
";

ScrollImageView.prototype.html_template = "\
<div class='vs_ui_scrollimageview'><img class='content'/></div>\
";

TextArea.prototype.html_template = "\
<textarea class='vs_ui_textarea'></textarea>\
";

Button.prototype.html_template = "\
<div class='vs_ui_button'><div></div></div>\
";

List.prototype.html_template = "\
<div class='vs_ui_list'><ul x-hag-hole='item_children'/></div>\
";

NavigationBar.prototype.html_template = "\
<div class='vs_ui_navbar blue_ios_style' x-hag-hole='children'></div>\
";

ToolBar.prototype.html_template = "\
<div class='vs_ui_toolbar black_ios_style' x-hag-hole='children'></div>\
";

Canvas.prototype.html_template = "\
<div class='vs_ui_canvas'><canvas class='canvas_inner'></canvas></div>\
";

ProgressBar.prototype.html_template = "\
<div class='vs_ui_progressbar'><div></div></div>\
";

TextLabel.prototype.html_template = "\
<div class='vs_ui_textlabel'></div>\
\
";

RadioButton.prototype.html_template = "\
<div class='vs_ui_radiobutton'><fieldset x-hag-hole='item_children' /></div>\
";

ComboBox.prototype.html_template = "\
<div class='vs_ui_combobox'></div>\
";

CheckBox.prototype.html_template = "\
<div class='vs_ui_checkbox'><fieldset x-hag-hole='item_children' /></div>\
";

Slider.prototype.html_template = "\
<div class='vs_ui_slider'><div class='handle'></div></div>\
";

ImageView.prototype.html_template = "\
<img class='vs_ui_imageview'></img>\
";

InputField.prototype.html_template = "\
<div class='vs_ui_inputfield'><input type='text' value='' placeholder='type ...' incremental='incremental'/><div class='clear_button'/>\
</div>\
";

PopOver.prototype.html_template = "\
<div class='vs_ui_popover'>\
  <div class='header' x-hag-hole='header'></div>\
  <div class='center' x-hag-hole='children'></div>\
  <div class='footer' x-hag-hole='footer'></div>\
  <div class='arrow'></div>\
</div>\
";

Switch.prototype.html_template = "\
<div class='vs_ui_switch'>\
  <div></div>\
  <div>\
    <div class='toggle_on'></div>\
    <div class='toggle_off'></div> \
    <div class='switch'></div> \
  </div>\
</div>\
";

Picker.prototype.html_template = "\
<div class='vs_ui_picker'>\
  <div class='slots'></div>\
  <div class='frame'></div>\
</div>\
";

SegmentedButton.prototype.html_template = "\
<div class='vs_ui_segmentedbutton'></div>\
";

SVGView.prototype.html_template = "\
<div class='vs_ui_svgview'></div>\
";
util.defineProperty (document, 'preventScroll', {
  get : function ()
  {
    return document._preventScroll;
  },
  
  set : function (preventScroll)
  {
    document._preventScroll = preventScroll;
    if (preventScroll)
    {
      // for android
      document.addEventListener ("touchstart", preventBehavior, false);
      // for android and other
      document.addEventListener ("touchmove", preventBehavior, false);
      document.addEventListener ("scroll", preventBehavior, false);
      window.scrollTo (0, 0);
    }
    else
    {
      // for android
      document.removeEventListener ("touchstart", preventBehavior, false);
      // for android and other
      document.removeEventListener ("touchmove", preventBehavior, false);
      document.removeEventListener ("scroll", preventBehavior, false);
    }
  }
});

})(window);