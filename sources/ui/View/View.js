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
    for (key in this.children)
    {
      a = this.children [key];
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
      delete (this.children [key]);
    }
    this.children = {};
    delete (this.view);
    
    core.EventSource.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    var key, a, i, child;

    for (key in this.children)
    {
      a = this.children [key];
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
   *  Clone the Object <p>
   * 
   * @name vs.ui.View#clone
   * @function
   * 
   * @param {Object} config the configuration structure for the new object
   * @return {vs.ui.View} the cloned object
   */
  clone : function (config, cloned_map)
  {
    var obj, anim;
    
    if (!cloned_map) { cloned_map = {}; }
    
    // have already cloned;
    if (cloned_map [this]) { return cloned_map [this]; }

    if (!config) { config = {}; }
    if (!config.id) { config.id = core.createId (); }
    if (!config.node) { config.node = this.view.cloneNode (true); }
    
    obj = core.EventSource.prototype.clone.call (this, config, cloned_map);
    if (!obj) { return; }

    // animations clone
    if (this._show_animation)
    {
      anim = cloned_map [this._show_animation];
      if (anim)
        obj._show_animation = anim;
      else
        obj._show_animation = this._show_animation.clone ();
        
      obj.__show_clb = this.__show_clb;
    }
    if (this._hide_animation)
    {
      anim = cloned_map [this._hide_animation];
      if (anim)
        obj._hide_animation = anim;
      else
        obj._hide_animation = this._hide_animation.clone ();

      obj.__hide_clb = this.__hide_clb;
    }

    /// TODO clone des children WARNING XXX
    return obj;
  },

  /**
   * @protected
   * @function
   */
  _getGUInode : function (config)
  {
    var node = this.__getGUInode (config), compName, doc, doc_elem;
    if (node) { return node; }
    
    // 4) no node exists, generate a warning a create a div node.
    if (this.html_template)
    {
      if (DOMParser)
      {
        doc = new DOMParser ().parseFromString
          (this.html_template, 'text/html');
        if (doc)
        {
          doc_elem = doc.documentElement;
          if (doc_elem instanceof HTMLElement)
          {
            node = document.importNode (doc_elem, true);
            if (node) { return node; }
          }
        }
      }
 
      node = document.createElement ('div');
      node.innerHTML = this.html_template;
      node = node.firstElementChild;
      if (node)
      {
        node.parentElement.removeChild (node);
        return node;
      }
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
   *  Init the GUI object.
   *  <p>
   *  This method should be implemented by all object inheriting from a
   *  vs.ui.View class. See the programer's guide for more information.
   *
   * @name vs.ui.View#init 
   * @function
   *
   *  @example
   *  var myObject = new vs.ui.View (config);
   *  myObject.init ();
   *  // now myObject is active
   */
  init : function ()
  {
    core.Object.prototype.init.call (this);
    
    this.initSkin ();
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    core.Object.prototype.initComponent.call (this);

    // position and size : according autosizing rules, can change
    // automaticaly if the parent container is resized
    this._pos = [-1, -1];
    this._size = [-1, -1];
    this._transform_origin = [50, 50];

    // rules for positionning a object
    this._autosizing = [4,4];

    this._holes = {};
    this.children = {};
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
  initSkin : function ()
  {},
  
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
      
      div = document.createElement ('div');
      div.innerHTML = data;
      
      children = div.childNodes;
      i = 0;
      len = children.length;
      while (i < len && !view)
      {
        if (children.item (i).nodeType === 1) /// ELEMENT_NODE
        {
          view = children.item (i);
        }
        i++;
      }
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
    
    for (key in this.children)
    {
      a = this.children [key];
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
    
    a = this.children [key];
    if (a && util.isArray (a)) { a.push (child); }
    else if (a)
    {
      b = [];
      b.push (a);
      b.push (child);
      this.children [key] = b;
    }
    else { this.children [key] = child; }
  
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
      for (key in this.children)
      {
        a = this.children [key];
        if (!a) { continue; }
        
        if (a === child || (a instanceof Array && a.indexOf (child) !== -1))
        {
          if (a instanceof Array) {a.remove (child);}
          else { delete (this.children [key]); }
          
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
   */
  removeAllChildren : function ()
  {
    var key, a, child;
  
    for (key in this.children)
    {
      a = this.children [key];
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
      delete (this.children [key]);
    }
    this.children = {};
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
   *  all bind using global variable FORCE_EVENT_PROPAGATION_DELAY.<br/>
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
          var bound = self.view.getBoundingClientRect ();
          event.offsetX = event.changedTouches[0].pageX - bound.left;
          event.offsetY = event.changedTouches[0].pageY - bound.top;
        }
        View._propagate_pointer_event (obj, func_ptr, event);
      };
      
      if (spec === 'POINTER_START') { spec = core.POINTER_START; }
      if (spec === 'POINTER_MOVE') { spec = core.POINTER_MOVE; }
      if (spec === 'POINTER_END') { spec = core.POINTER_END; }
      
      this._pointerevent_handlers [obj.id + spec] = handler;
      
      this.view.addEventListener (spec, handler);
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
      
      this.view.removeEventListener (core.POINTER_END, handler);
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
        width = Math.round (size[0] / pWidth * 100) + '%';
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
        height = Math.round (size[1] / pHeight * 100) + '%';
      }
      else { height = size[1] + 'px'; } 
    }
    else { height = '100%'; }

    if (aV === 1 || aV === 3 || aV === 5 || aV === 7)
    {
      sPosB = pHeight - (pos[1] + size [1]) + 'px';
    }
    
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
    var pos = this._pos, size = this._size, pWidth = 0, pHeight = 0,
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

    if (aV === 1 || aV === 3 || aV === 5 || aV === 7)
    {
      sPosB = pHeight - (pos[1] + size [1]) + 'px';
    }

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
      this.view.style.setProperty (property, value);
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
   *  Modifies vs.ui.View View CSS styleSheets.
   *  <p>
   *  Modifies vs.ui.View View’s CSS style styleSheets. It can be preempted
   *  by css style inline modification (see vs.ui.View.setStyle).
   *  @see vs.ui.View#setStyles if you want to modify inline CSS.
   *
   *  @example
   *  myObject.addCssRules ('.classname1', ['color: red', 'margin: 0px']);
   *
   * @name vs.ui.View#addCssRules 
   * @function
   *
   * @param {String} selector CSS Selector
   * @param {Array} rules the array of rules
   */
  addCssRules : function (selector, rules)
  {
    if (!rules) { return; }
    
    var i = rules.length;
    while (i--)
    {
      this.addCssRule (selector, rules [i]);
    }
  },
  
  /**
   *  Modifies vs.ui.View View CSS styleSheets.
   *  <p>
   *  Modifies vs.ui.View View’s CSS style styleSheets. It can be preempted
   *  by css style inline modification (see vs.ui.View.setStyle).
   *  @see vs.ui.View#setStyle if you want to modify inline CSS.
   *
   *  @example
   *  myObject.addCssRule ('.classname1', 'color: red');
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
    if (document.styleSheets)
    {
      var head, i, ss, l;
      if (!document.styleSheets.length)
      {
        head = document.getElementsByTagName ('head')[0];
        head.appendChild (bc.createEl ('style'));
      }
      
      i = document.styleSheets.length - 1;
      ss = document.styleSheets [i];
      
      l = 0;
      if (ss.cssRules)
      {
        l = ss.cssRules.length;
      } else if (ss.rules)
      {
        l = ss.rules.length;
      }
      
      if (ss.insertRule)
      {
        ss.insertRule (selector + ' {' + rule + '}', l);
      } else if (ss.addRule) 
      {
        ss.addRule (selector, rule, l);
      }
    }
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
      
      if (clb && clb instanceof Function)
      {
        setTimeout (function() {clb.call (self);}, 0);
      }
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
      if (animations.constructor === fx.Animation)
      {
        this._show_animation = animations.clone ();
      }
      else if (util.isArray (animations))
      {
        this._show_animation = new fx.Animation ();
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
      if (animations.constructor === fx.Animation)
      {
        this._hide_animation = animations.clone ();
      }
      else if (util.isArray (animations))
      {
        this._hide_animation = new fx.Animation ();
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
    if (animations instanceof fx.Animation)
    {
      anim = animations
    }
    else if (util.isArray (animations))
    {
      var anim = new fx.Animation ();
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
    
    this.applyTransformation2D ();
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
    
    this.applyTransformation2D ();
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
    
    this.applyTransformation2D ();
  },
  
  /**
   * @protected
   * @function
   */
  applyTransformation2D: function ()
  {
    var transform = '';
    
    // apply translation, therefor a strange bug appear (flick)
    if (SUPPORT_3D_TRANSFORM)
      transform += 
        "translate3d("+this.__view_t_x+"px,"+this.__view_t_y+"px,0)";
    else
      transform += 
        "translate("+this.__view_t_x+"px,"+this.__view_t_y+"px)";

    if (this._rotation)
    {
      transform += " rotate(" + this._rotation + "deg)";
    }
    if (this._scaling !== 1)
    {
      transform += " scale(" + this._scaling + ")";
    }
    
    setElementTransform (this.view, transform);
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
      if (v)
      { 
        this._enable = true;
        this.removeClassName ('disabled');
      }
      else
      { 
        this._enable = false;
        this.addClassName ('disabled');
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
  
      var origin_str = this._transform_origin [0] + '% ';
      origin_str += this._transform_origin [1] + '%';
      this.view.style ['-webkit-transform-origin'] = origin_str;
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

View.createTemplate = function (html)
{
  var div = document.createElement ('div');
  try
  {
    div.innerHTML = html;
    div = div.firstElementChild;
  }
  catch (e)
  {
    console.error ("vs.ui.View.createTemplate failed: " + e);
    return undefined;
  }
//   while (div)
//   {
//     if (div.nodeType === 1) { return div; }
//     div = div.nextSibling;
//   }
  return undefined;
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.View = View;
