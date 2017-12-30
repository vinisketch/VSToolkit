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
  
  // init recognizer support
  this.__pointer_recognizers = [];

  // position and size : according autosizing rules, can change
  // automaticaly if the parent container is resized
  this._pos = [-1, -1];
  this._size = [-1, -1];
  
  // init transformation
  this._translation = [0, 0, 0];
  this._rotation = [0, 0, 0];
  this._transform_origin = [0, 0];

  // rules for positionning a object
  this._autosizing = [4,4];
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
View.HORIZONTAL_LAYOUT = 'horizontal';
/** @private */
View.LEGACY_HORIZONTAL_LAYOUT = 'horizontal_layout';

/**
 * Vertical layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.VERTICAL_LAYOUT
 * @const
 */
View.VERTICAL_LAYOUT = 'vertical';
/** @private */
View.LEGACY_VERTICAL_LAYOUT = 'vertical_layout';

/**
 * Absolute layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.ABSOLUTE_LAYOUT
 * @const
 */
View.ABSOLUTE_LAYOUT = 'absolute';
/** @private */
View.LEGACY_ABSOLUTE_LAYOUT = 'absolute_layout';

/**
 * Html flow layout
 * @see vs.ui.View#layout
 * @name vs.ui.View.FLOW_LAYOUT
 * @const
 */
View.FLOW_LAYOUT = 'flow';
/** @private */
View.LEGACY_FLOW_LAYOUT = 'flow_layout';

/********************************************************************
                    Delay constant
*********************************************************************/

/**
 * Threshold in px  use to unselect a item when pointer move
 * @name vs.ui.View.MOVE_THRESHOLD
 * @const
 */
View.MOVE_THRESHOLD = 20;

/********************************************************************
                    Magnet contants
*********************************************************************/

/**
 * No magnet
 * @name vs.ui.View.MAGNET_NONE
 * @const
 */
View.MAGNET_NONE = 0;

/**
 * The widget will be fixed on left
 * @name vs.ui.View.MAGNET_LEFT
 * @const
 */
View.MAGNET_LEFT = 3;

/**
 * The widget will be fixed on bottom
 * @name vs.ui.View.MAGNET_BOTTOM
 * @const
 */
View.MAGNET_BOTTOM = 2;

/**
 * The widget will be fixed on top
 * @name vs.ui.View.MAGNET_TOP
 * @const
 */
View.MAGNET_TOP = 1;

/**
 * The widget will be fixed on right
 * @name vs.ui.View.MAGNET_RIGHT
 * @const
 */
View.MAGNET_RIGHT = 4;

/**
 * The widget will centered
 * @name vs.ui.View.MAGNET_CENTER
 * @const
 */
View.MAGNET_CENTER = 5;

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

/**
 * @private
 */
var _template_nodes = null;

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
  _magnet: View.MAGNET_NONE,

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
   * View translate
   * @private
   * @type {Array}
   */
  _translation : null,

  /**
   * @protected
   * @type {Array}
   */
  _size : null,

   /**
   * Opacity value
   * @protected
   * @type {number}
   */
  _opacity : 1,

   /**
   * Scale value
   * @protected
   * @type {number}
   */
  _scaling : 1,

   /**
   * Rotation value
   * @protected
   * @type {Array}
   */
  _rotation : null,

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
    for (key in this.__children)
    {
      a = this.__children [key];
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
      delete (this.__children [key]);
    }
    this.__children = {};
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
    var key, a, i, child, view = this.view;

    // refresh element real size and position
    if (view && view.parentElement)
    {
      this._size [0] = view.offsetWidth;
      this._size [1] = view.offsetHeight;
      this._pos [0] = view.offsetLeft;
      this._pos [1] = view.offsetTop;
    }

    for (key in this.__children)
    {
      a = this.__children [key];
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
   * @name vs.ui.View#clone
   * @function
   * @private
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  clone : function (config, cloned_map)
  {
    function _getPaths (root, nodes)
    {
      var paths = [], i = 0, l = nodes.length, node;
      for (; i < l; i++)
      {
        node = nodes[i];
        paths.push ([node, _getPath (root, node)]);
      }
      return paths;
    }

    function _evalPaths (root, paths, clonedViews)
    {
      var nodes = [], i = 0, l = paths.length, path;
      for (; i < l; i++)
      {
        path = paths[i];
        if (!path.id) path.id = core.createId ();
        clonedViews [path[0].id] = _evalPath (root, path[1]);
      }
    }

    function makeClonedNodeMap (comp, clonedViews)
    {
      var
        clonedNode = comp.view.cloneNode (true),
        nodes = [], paths;
        
      function manageChild (child)
      {
        if (child.__gui_object__hack_view__)
        { nodes.push (child.__gui_object__hack_view__); }
        else if (child.view) { nodes.push (child.view); }
      
        retreiveChildNodes (child);
      }
        
      function retreiveChildNodes (comp)
      {
        var key, a, i, l, child;
        for (key in comp.__children)
        {
          a = comp.__children [key];
          if (!a) { continue; }
          
          if (util.isArray (a))
          {
            l = a.length;
            for (i = 0; i < l; i++)
            {
              manageChild (a [i]);
            }
          }
          else manageChild (a);
        }
      }
      
      retreiveChildNodes (comp);
      
      paths = _getPaths (comp.view, nodes);
      _evalPaths (clonedNode, paths, clonedViews);
      
      return clonedNode;
    }
    
    if (!cloned_map) { cloned_map = {}; }
    if (!cloned_map.__views__) { cloned_map.__views__ = {}; }    
    if (!config) { config = {}; }
    if (!config.node)
    {
      var node = cloned_map.__views__ [this.view.id];
      if (!node)
      {
        node = makeClonedNodeMap (this, cloned_map.__views__);
      }
      config.node = node;
    }

    return core.EventSource.prototype.clone.call (this, config, cloned_map);
  },

   /**
   * @name vs.core.Object#_clone_properties_value
   * @function
   * @protected
   *
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone_properties_value : function (obj, cloned_map)
  {
    var key;

    for (key in this)
    {
      if (key == 'id') continue;

      if (key == "size" || key == "position")
      {
        value = this.size;
        if (!value || value.length !== 3 ||
            (value[0] === 0 && value[1] === 0))
        { continue; }
      }
  
      // property value copy
      if (this.isProperty (key))
      { core.Object.__propertyCloneValue (key, this, obj); }
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
  _clone : function (obj, cloned_map)
  {
    var anim, a, key, child, l, hole, cloned_comp;

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

    function getClonedComp (comp, cloned_map) {
      if (!comp || !cloned_map) return null;
      
      if (cloned_map [comp._id]) return cloned_map [comp._id];
      
      var  view = cloned_map.__views__ [comp._id];
        
      return (view)?view._comp_:null;
    }

    for (key in this.__children)
    {
      a = this.__children [key];
      hole = obj._holes [key];
      if (!a || !hole) { continue; }

      if (a instanceof Array)
      {
        l = a.length;
        while (l--)
        {
          child = a [l];
          cloned_comp = getClonedComp (child, cloned_map);
          if (!cloned_comp) {
            cloned_comp = child.clone (null, cloned_map);
            obj.add (cloned_comp, key);
          }
          else {
            cloned_map [child._id] = cloned_comp;
          }
        }
      }
      else
      {
        cloned_comp = getClonedComp (a, cloned_map);
        if (!cloned_comp) {
          cloned_comp = a.clone (null, cloned_map);
          obj.add (cloned_comp, key);
        }
        else {
          cloned_map [a._id] = cloned_comp;
        }
      }
    }
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
      var node = template.__extend_component (this);
      util.free (template);
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
    var node = null;
    
    if (!_template_nodes) {
      _template_nodes = document.querySelector (".application_templates");
      if (_template_nodes) {
        _template_nodes.parentElement.removeChild (_template_nodes);
      }
    }
    if (_template_nodes) {
      var node = _template_nodes.querySelector ("." + ref);
    }   
      
    if (node) { return document.importNode (node, true); }
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    core.EventSource.prototype.initComponent.call (this);

    this._holes = {};
    this.__children = {};
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
    if (this._magnet) this.view.style.setProperty ('position', 'absolute', null);

    if (this._magnet === View.MAGNET_CENTER)
    {
      this._updateSizeAndPos ();
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
    vs.scheduleAction (function () {
      self._size [0] = view.offsetWidth;
      self._size [1] = view.offsetHeight;
      self._pos [0] = view.offsetLeft;
      self._pos [1] = view.offsetTop;
    });
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
    var comp_class = window [comp_name];
    if (!comp_class) {
      console.error ("Impossible to fund component '" + comp_name + "'.");
      return;
    }

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
      if (comp_class.prototype && comp_class.prototype.template)
      {
        view = Template.parseHTML (comp_class.prototype.template);
      }
    }

    if (!view)
    {
      if (comp_class.prototype && comp_class.prototype.node_template)
      {
        view = document.importNode (comp_class.prototype.node_template, true);
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
    try { obj = new comp_class (config); }
    catch (exp)
    {
      msg = "Impossible to instanciate comp: " + comp_name;
      msg += " => " + exp.message;
      console.error (msg);
      if (exp.stack) console.error (exp.stack);
      return;
    }

    // Initialize object
    try
    {
      obj.init ();
      obj.configure (config);
    }
    catch (exp)
    {
      if (exp.line && exp.sourceURL)
      {
        msg = "Error when initiate comp: " + comp_name;
        msg += " => " + exp.message;
        msg += "\n" + exp.sourceURL + ":" + exp.line;
      }
      else { msg = exp; }
      console.error (msg);
      if (exp.stack) console.error (exp.stack);
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

    for (key in this.__children)
    {
      a = this.__children [key];
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

    a = this.__children [key];
    if (a && util.isArray (a)) { a.push (child); }
    else if (a)
    {
      b = [];
      b.push (a);
      b.push (child);
      this.__children [key] = b;
    }
    else { this.__children [key] = child; }

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

    var key, a, view;

    if (child.__gui_object__hack_view__)
    {
      view = child.__gui_object__hack_view__;
    }
    else { view = child.view; }

    if (view)
    {
      for (key in this.__children)
      {
        a = this.__children [key];
        if (!a) { continue; }

        if (a === child || (a instanceof Array && a.indexOf (child) !== -1))
        {
          if (a instanceof Array) {a.remove (child);}
          else { delete (this.__children [key]); }

          if (view.parentElement)
          {
            view.parentElement.removeChild (view);
          }
//          hole = this._holes [key];
//          if (hole) { hole.removeChild (view); }

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
   * @param {Boolean} should_free free children
   * @param {String} extension [optional] The hole from witch all views will be
   *   removed
   * @return {Array} list of removed child if not should_free
   */
  removeAllChildren : function (should_free, extension)
  {
    var key, self = this, children = [];

    /** @private */
    function removeChildrenInHole (ext)
    {
      var a, child;

      a = self.__children [ext];
      if (!a) { return; }

      if (a instanceof Array)
      {
        while (a.length)
        {
          child = a [0];
          self.remove (child);
          if (should_free) util.free (child);
          else children.push (child);
        }
      }
      else
      {
        self.remove (a);
        if (should_free) util.free (a);
        else children.push (a);
      }
      delete (self.__children [ext]);
    };

    if (extension)
    {
      removeChildrenInHole (extension);
    }
    else
    {
      for (key in self.__children)
      {
        removeChildrenInHole (key);
      }
      this.__children = {};
    }
    
    return (should_free)?undefined:children;
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
    return core.EventSource.prototype.bind.call (this, spec, obj, func, delay);
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
    this._magnet = code;
    if (this._magnet)
    { this.view.style.setProperty ('position', 'absolute', null); }
    else
    { this.view.style.removeProperty ('position'); }

    this._updateSizeAndPos ();
    this._applyTransformation ();
  },

  /**
   * @protected
   * @function
   * This function cost a lot!
   */
  _updateSizeAndPos : function ()
  {
    var
      x = this._pos [0], y = this._pos [1],
      w = this._size [0], h = this._size [1],
      width, height, pWidth = 0, pHeight = 0,
      left = 'auto', top = 'auto', right = 'auto', bottom = 'auto',
      aH = this._autosizing [0], aV = this._autosizing [1],
      view = this.view, parentElement, style;

    if (!view) { return; }
//     if (w < 0) { w = 0; }
//     if (h < 0) { h = 0; }

    parentElement = view.parentElement;
    if (parentElement)
    {
      pWidth = parentElement.offsetWidth;
      pHeight = parentElement.offsetHeight;
    }

    if (this._magnet === View.MAGNET_LEFT) x = 0;
    if (this._magnet === View.MAGNET_TOP) y = 0;

    if (w < 0) { width = ''; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 4 || aH === 1) { width = w + 'px'; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0)
    {
      if (pWidth)
      {
        width = (w / pWidth * 100) + '%';
      }
      else { width = w + 'px'; }
    }

    else { width = '100%'; }

    if (h < 0) { height = ''; }
    else if (aV === 5 || aV === 7) { height = 'auto'; }
    else if (aV === 4 || aV === 1) { height = h + 'px'; }
    else if (aV === 2 || aV === 3 || aV === 6 || aV === 0)
    {
      if (pHeight)
      {
        height = (h / pHeight * 100) + '%';
      }
      else { height = h + 'px'; }
    }
    else { height = '100%'; }

    if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || (aH === 2 && !pWidth))
    { left = x + 'px'; }
    else if ((aH === 2 || aH === 0) && pWidth)
    { left = (x / pWidth * 100) + '%'; }

    if ((w >=0) && (aH === 1 || aH === 3 || aH === 5 || aH === 7))
    {
      right = pWidth - (x + w);
      if (right < 0) right = 0;
      right += 'px';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight))
    { top = y + 'px'; }
    else if ((aV === 2 || aV === 0) && pHeight)
    { top = (y / pHeight * 100) + '%'; }

    if ((h >= 0) && (aV === 1 || aV === 3 || aV === 5 || aV === 7))
    {
      bottom = pHeight - (y + h);
      if (bottom < 0) bottom = 0;
      bottom += 'px';
    }

    if (this._magnet === View.MAGNET_BOTTOM) { top = 'auto'; bottom = '0px'; }
    if (this._magnet === View.MAGNET_RIGHT) { left = 'auto'; right = '0px'; }

    if (this._magnet === View.MAGNET_CENTER) {
      top = '50%'; bottom = 'auto';
      left = '50%'; right = 'auto';
    }

    style = view.style;
    style.left = left;
    style.right = right;
    style.top = top;
    style.bottom = bottom;
    style.width = width;
    style.height = height;
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
   *  myObject.setStyles ({
   *    left: '0px', top: '0px', bottom: 'auto', 
   *    width: '100%', height: '50px'
   *  });
   *
   * @name vs.ui.View#setStyles
   * @function
   *
   * @param {Object} style The style to modify
   */
  setStyles : function (style)
  {
    if (!style) { return; }
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
    vs.scheduleAction (function()
    {
      if (display)
      { n.style.display = display; }
      else
      { n.style.removeProperty ('display'); }

      vs.scheduleAction (function()
      {
        self.refresh ();
        if (clb && util.isFunction (clb)) clb.call (self);
      });
    });
  },

  /**
   *  Displays the GUI Object
   *
   * @name vs.ui.View#show
   * @param {Function} clb a function to call a the end of show process
   * @function
   */
  show : function (clb)
  {
    if (!this.view) { return; }
    if (this._visible) { return; }
    if (!util.isFunction (clb)) clb = undefined; 

    if (this.__view_display)
    {
      this.view.style.display = this.__view_display;
    }
    else
    {
      this.view.style.removeProperty ('display');
    }
    this.__view_display = undefined;

    this.__is_hidding = false;
    this.__is_showing = true;

    if (this._show_animation)
    {
      this._show_animation.process (this, function () {
        this._show_object (clb);
      }, this);
    }
    else
    {
      this._show_object (clb);
    }
  },

  /**
   *  Show the GUI Object
   *
   * @private
   * @param {Function} clb a function to call a the end of show process
   * @function
   */
  _show_object : function (clb)
  {
    if (!this.view) { return; }
    this.__visibility_anim = undefined;

    if (!this.__is_showing) { return; }
    this.__is_showing = false;

    this._visible = true;
    var self = this;

    this.propertyChange ();
    if (this.__show_clb || clb)
    {
      if (this._show_animation)
      {
        if (this.__show_clb) this.__show_clb.call (this);
        if (clb) clb.call (this);
      }
      else
      {
        if (this.__show_clb) {
          vs.scheduleAction (function () {self.__show_clb.call (self);});
        }
        if (clb) {
          vs.scheduleAction (function () {clb.call (self);});
        }
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
   *  myComp.setShowAnimation ([['translate', '0,0,0'], ['opacity', '1']]);
   *
   *  @example
   *  myAnim = new ABTranslateAnimation (50, 50);
   *  myComp.setShowAnimation (myAnim);
   *
   * @name vs.ui.View#setShowAnimation
   * @function
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
      if (animations instanceof vs.fx.Animation)
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
   * @param {Function} clb a function to call a the end of show process
   * @function
   */
  hide : function (clb)
  {
    if (!this.view) { return; }
    if (!this._visible && !this.__is_showing) { return; }
    if (!util.isFunction (clb)) clb = undefined; 

    this._visible = false;
    
    this.__is_showing = false;
    this.__is_hidding = true;
    
    if (this._hide_animation)
    {
      this._hide_animation.process (this, function () {
        this._hide_object (clb);
      }, this);
    }
    else
    {
      this._hide_object (clb);
    }
  },

  /**
   *  Hides the GUI Object
   *
   * @private
   * @function
   * @param {Function} clb a function to call a the end of show process
   */
  _hide_object: function (clb)
  {
    if (!this.view || this._visible) { return; }
    this.__visibility_anim = undefined;

    if (!this.__is_hidding) { return; }
    
    this.__is_hidding = false;
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
    if (this.__hide_clb || clb)
    {
      if (this._show_animation)
      {
        if (this.__hide_clb) this.__hide_clb.call (this);
        if (clb) clb.call (this);
      }
      else
      {
        if (this.__hide_clb) {
          vs.scheduleAction (function () {self.__hide_clb.call (self);});
        }
        if (clb) {
          vs.scheduleAction (function () {clb.call (self);});
        }
      }
    }
    this.propertyChange ();
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
   *  myComp.setHideAnimation ([['translate', '100px,0,0'], ['opacity', '0']], options);
   *
   *  @example
   *  myAnim = new ABTranslateAnimation (50, 50);
   *  myComp.setHideAnimation (myAnim, t);
   *
   * @name vs.ui.View#setHideAnimation
   * @function
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
      if (animations instanceof vs.fx.Animation)
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
   * @param z {int} translation over the x axis
   */
  translate: function (x, y, z)
  {
    if (!util.isNumber (x) || !util.isNumber (y)) { return };
    if (!util.isNumber (z)) z = 0;

    this._translation[0] = x;
    this._translation[1] = y;
    this._translation[2] = z;
    this._applyTransformation ();
  },

  /**
   *  Rotate the view about the horizontal and vertical axes.
   *  <p/>The angle units is radians.
   *
   * @name vs.ui.View#rotate
   * @function
   *
   * @param r {{float|array}} rotion angle
   */
  rotate: function (r)
  {
    if (util.isNumber (r)) {
      this._rotation[0] = 0;
      this._rotation[1] = 0;
      this._rotation[2] = r;
    }
    else if (util.isArray (r))
    {
      if (util.isNumber (r[0])) this._rotation[0] = r[0];
      else this._rotation[0] = 0;
      if (util.isNumber (r[1])) this._rotation[1] = r[1];
      else this._rotation[1] = 0;
      if (util.isNumber (r[2])) this._rotation[2] = r[2];
      else this._rotation[2] = 0;
    }

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
    if (!util.isNumber (s)) { return };

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

    this.flushTransformStack ();
    
    this._transform_origin[0] = origin.x;
    this._transform_origin[1] = origin.y;
  },

  /**
   *  Flush all current transformation, into the transformation stack.
   * @public
   * @function
   */
  flushTransformStack : function ()
  {
    // Save current transform into a matrix
    var matrix = new vs.CSSMatrix ();
    matrix = matrix.translate
      (this._transform_origin [0], this._transform_origin [1], 0);
    matrix = matrix.translate
      (this._translation[0], this._translation[1], this._translation[2]);
    matrix = matrix.rotate
      (this._rotation[0], this._rotation[1], this._rotation[2]);
    matrix = matrix.scale (this._scaling, this._scaling, 1);
    matrix = matrix.translate
      (-this._transform_origin [0], -this._transform_origin [1], 0);

    if (!this._transforms_stack) this._transforms_stack = matrix;
    {
      this._transforms_stack = matrix.multiply (this._transforms_stack);
      delete (matrix);
    }

    // Init a new transform space
    this._translation[0] = 0;
    this._translation[1] = 0;
    this._translation[2] = 0;
    this._scaling = 1;
    this._rotation[0] = 0;
    this._rotation[1] = 0;
    this._rotation[2] = 0;

    this._transform_origin[0] = 0;
    this._transform_origin[1] = 0;
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
    var matrix, identity = new vs.CSSMatrix ();

    // apply current transformation
    matrix = identity.translate (
      this._transform_origin [0] + this._translation[0],
      this._transform_origin [1] + this._translation[1],
      this._translation[2]
    );
    matrix = matrix.multiply (
      identity.rotate (this._rotation[0], this._rotation[1], this._rotation[2])
    );
    matrix = matrix.scale (this._scaling, this._scaling, 1);
    matrix = matrix.translate (
      -this._transform_origin [0],
      -this._transform_origin [1],
      0
    );

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
      transform = matrix.getMatrix3dStr ();

    if (this._magnet === View.MAGNET_CENTER)
    {
      transform += " translate(-50%,-50%)";
    }

    setElementTransform (this.view, transform);
    delete (matrix);
  }
};
util.extend (View.prototype, RecognizerManager);
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
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }

      this._size [0] = v [0];
      this._size [1] = v [1];

      if (!this.view) { return; }
      this._updateSizeAndPos ();
    },

    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
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
      this._updateSizeAndPos ();
    },

    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
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

      if (this._autosizing [0] === v [0] && this._autosizing [1] === v [1])
      { return; }

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
      if (this._magnet === code) return;
      if (!util.isNumber (code) || code < 0 || code > 5) return;
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
     * Return true is the object is visible. False otherwise.
     * @ignore
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

  'opacity': {

    /**
     * Change view opacity.
     * value is include in this range [0, 1]
     * @name vs.ui.View#opacity
     * @type {number}
     */
    set : function (v)
    {
      if (!util.isNumber (v)) return;
      if (v < 0 || v > 1) return;

      if (this.view) this.view.style.opacity = v;
      this._opacity = v;
    }
  },

  'translation': {

    /**
     * Translation vector [tx, ty, tz]
     * <=> obj.translate (tx, ty, tz)
     * @name vs.ui.View#translation
     * @type {Array}
     */
    set : function (v)
    {
      if (!util.isArray (v)) { return };

      this.translate (v[0], v[1], v[2]);
    },

    /**
     * @ignore
     * @type {Array}
     */
    get : function ()
    {
      return this._translation.slice ();
    }
  },

  'rotation': {

    /**
     * Rotation angle in degre
     * @name vs.ui.View#rotation
     * @type {{float|array}}
     */
    set : function (v)
    {
      this.rotate (v);
    },

    /**
     * @ignore
     * @type {Array}
     */
    get : function ()
    {
      return this._rotation.slice;
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
      
      if (this._scaling < this._min_scale) { this.scale (this._min_scale); }
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
      
      if (this._scaling > this._max_scale) { this.scale (this._max_scale); }
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
          v !== View.FLOW_LAYOUT &&
          v !== View.LEGACY_HORIZONTAL_LAYOUT &&
          v !== View.LEGACY_ABSOLUTE_LAYOUT &&
          v !== View.LEGACY_VERTICAL_LAYOUT &&
          v !== View.LEGACY_FLOW_LAYOUT && v)
      {
        console.error ("Unsupported layout '" + v + "'!");
        return;
      }

      if (this._layout)
      {
        this.removeClassName (this._layout);
      }
      if (!v || v.indexOf ("_layout") !== -1) this._layout = v;
      else this._layout = v + "_layout";
      if (this._layout)
      {
        this.addClassName (this._layout);
      }
    },
  },

  'innerHTML': {

    /**
     * This property allows to define both the HTML code and the text
     * @name vs.ui.View#innerHTML
     * @type String
     */
    set : function (v)
    {
      if (!this.view) return;

      util.safeInnerHTML (this.view, v);
    },
  }
});

View._ref_template_reg = /(\w+)#(\w+)/;

function getDeviceCSSCode ()
{	
	var el = document.createElement('div'), val;
	el.className = 'device_test';
	document.body.appendChild (el);
	
	val = document.defaultView.getComputedStyle (el,null).getPropertyValue("margin-top");

	document.body.removeChild (el);

	return parseInt (val || 0, 10);
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.View = View;
View.getDeviceCSSCode = getDeviceCSSCode;
