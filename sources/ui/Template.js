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
    this.__properties = [];
    this.__properties_path = [];
    this.__prop_nodes = [];
    this.__attr_eval_strs = [];

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

    // clone surcharge
    view._clone = _template_view_clone;

    view.init ();

    delete (this.__properties);
    delete (this.__properties_path);
    delete (this.__prop_nodes);
    delete (this.__attr_eval_strs);

    return view;
  },

  /**
   * @private
   */
  _compile : function ()
  {
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
     * Attributes parsing function
     */
    function parseAttributes (nodes)
    {
      if (!nodes) return;
      var l = nodes.length;
      while (l--)
      {
        var node_temp = nodes.item (l), result,
          str = node_temp.value, indexs = [], index;

        self._regexp_index.lastIndex = 0;// reset the regex
        result = self._regexp_index.exec (str);
        if (result)
        {
          while (result)
          {
            index = parseInt (result[1], 10);
            indexs.push (index);
            self.__prop_nodes [index] = node_temp;
            result = self._regexp_index.exec (str);
          }
          node_temp.value = '';

          for (var i = 0; i < indexs.length; i++)
          {
            index = indexs [i];
            str = str.replace (
              "${*" + index + "*}",
              "\"+this._" + util.underscore (self.__properties [i]) + "+\""
            );
          }

          for (i = 0; i < indexs.length; i++)
          {
            self.__attr_eval_strs [indexs [i]] = "\"" + str + "\"";
          }
        }
      }
    }

    /**
     * Node parsing function
     * Parse the DOM fragment to retrieve attribute and text node
     * associated to a template tag
     */
    function parseNode (node)
    {
      /**
       * Nodes parsing function
       */
      function parseNodes (nodes)
      {
        if (!nodes) return;
        var l = nodes.length;
        while (l--)
        {
          var node_temp = nodes.item (l);
          if (node_temp.nodeType === 3) // TEXT_NODE
          {
            var value = node_temp.data, result, index = 0, text_node;

            self._regexp_index.lastIndex = 0;// reset the regex
            node_temp.data = '';
            result = self._regexp_index.exec (value);
            while (result)
            {
              if (result.index)
              {
                text_node = document.createTextNode
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
            text_node = document.createTextNode (value.substring (index));
            node.insertBefore (text_node, node_temp);
          }
          else if (node_temp.nodeType === 1) // ELEMENT_NODE
          {
            parseNode (node_temp);
          }
        }
      }

      parseNodes (node.childNodes);
      parseAttributes (node.attributes);
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
      var prop_name = this.__properties [l],
        node = this.__prop_nodes [l],
        str = this.__attr_eval_strs [l];
      
      if (!node) { continue; }

      node_ref.push ([prop_name, node]);
      _create_property (obj, prop_name, node, str);
    }

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
      var value = values [key], key;

      if (p2)
      {
        keys = p2.split ('.'), i = 0;
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
var _create_property = function (view, prop_name, node, attr_eval_str)
{
  var desc = {};
  if (node.nodeType === 3) //TEXT_NODE
  {
    desc.set = (function (node, prop_name, _prop_name)
    {
      return function (v)
      {
        this [_prop_name] = v;
        node.data = v;
        this.propertyChange (prop_name);
      };
    }(node, prop_name, '_' + util.underscore (prop_name)));

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
    desc.set = (function (node, prop_name, _prop_name, attr_eval_str)
    {
      return function (v)
      {
        this [_prop_name] = v;
        node.value = eval(attr_eval_str);
        this.propertyChange (prop_name);
      };
    }(node, prop_name, '_' + util.underscore (prop_name), attr_eval_str));

    desc.get = (function (node, _prop_name)
    {
      return function ()
      {
//        this [_prop_name] = node.value
        return this[_prop_name];
      };
    }(node, '_' + util.underscore (prop_name)));
    
    // save this string for clone process
    desc.set.__vs_attr_eval_str = attr_eval_str;
  }
  view.defineProperty (prop_name, desc);
};

/**
 * @private
 */
var _template_view_clone = function (obj, cloned_map)
{
  vs.ui.View.prototype._clone.call (this, obj, cloned_map);
//  var view_cloned = obj.__config__.node;
  var view_cloned = obj.view;

  var node_ref = this.__node__ref__, node_ref_cloned = [], path, node_cloned, desc;
  if (view_cloned && node_ref && node_ref.length)
  {
    var i = node_ref.length;
    while (i--)
    {
      var link = node_ref [i], node = link [1], prop_name = link [0];
      path = _getPath (this.view, node);

      node_cloned = _evalPath (view_cloned, path);

      node_ref_cloned.push ([prop_name, node_cloned]);

      desc = this.getPropertyDescriptor (prop_name)
      _create_property (obj, prop_name, node_cloned, desc.set.__vs_attr_eval_str);
      obj.__node__ref__ = node_ref_cloned;
    }
  }

  // clone surcharge
  obj._clone = _template_view_clone;

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
