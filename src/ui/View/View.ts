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

import vs_utils, { applyMixins } from 'vs_utils';
import vs_ui_utils from 'vs_ui_utils';
import { Component } from 'vs_toolkit/vs_core';
import { PointerEventType, isPointerEventType, addPointerListener, removePointerListener } from 'vs_gesture';
import { Animation } from '../Animation';

import RecognizerManager from '../Recognizers/RecognizerManager';
import Template from '../Template';
import html_template from './View.html';

/**
 * Configuration interface for View
 */
interface ViewConfig {
  id?: string;
  node?: HTMLElement;
  node_id?: string;
  node_ref?: string;
  root_ref?: string;
  template_ref?: string;
  template?: string;
  [key: string]: any;
}

/**
 * Animation options interface
 */
interface AnimationOptions {
  duration?: number;
  timing?: string;
  origin?: string;
  iterationCount?: number;
  delay?: number;
}

/**
 * Transform origin interface
 */
interface TransformOrigin {
  x: number;
  y: number;
}

/**
 * @private
 */
function _findNodeRef(node: Element | null, ref: string): Element | false
{
  if (!node?.getAttribute) { return false; }

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
 *  @extends vs_core.EventSource
 *  @class
 *  vs.ui.View is a class that defines the basic drawing, event-handling, of
 *  an application. You typically don't interact with the vs.ui.View API
 *  directly; rather, your custom view classes inherit from vs.ui.View and
 *  override many of its methods., Its also supports 2D
 *  transformations (translate, rotate, scale).
 *  <p>
 *  If you're not creating a custom view class, there are few methods you
 *  need to use
 *
 *  Events:
 *  <ul>
 *    <li /> POINTER_START: Fired after the user click/tap on the view, when
 *           the user depresses the mouse/screen
 *    <li /> POINTER_MOVE: Fired after the user move the mouse/his finger on
 *           the view.
 *    <li /> POINTER_END: Fired after the user click/tap on the view, when
 *           the user release the mouse/ the press on screen.
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
class View extends vs_core.Component {
  // DOM and template properties
  view: HTMLElement | null = null;
  html_template = html_template;

  // Private instance properties
  private _pos: number[];
  private _size: number[];
  private _visible: boolean;
  private _magnet: number;
  private _pointerevent_handlers: any;
  private _enable: boolean;
  private _opacity: number;
  private _scaling: number;
  private _min_scale: number;
  private _max_scale: number;
  private _layout: string | null;
  private _autosizing: number[];
  private _translation: number[];
  private _rotation: number[];
  private _transform_origin: number[];
  private _transforms_stack: any;
  private _show_animation: any;
  private __show_clb: any;
  private _hide_animation: any;
  private __hide_clb: any;
  private __pointer_recognizers: any[];
  private _bubbling: boolean;
  private __parent: any;
  private __children: any;
  private _holes: any;
  private __config__: any;
  private __visibility_anim: any;
  private __view_display: any;
  private __is_showing: boolean;
  private __is_hidding: boolean;

  private static refTemplatereg = /(\w+)#(\w+)/;

  // static getDeviceCSSCode () {
  //   const el = document.createElement('div');
  //   el.className = 'device_test';
  //   document.body.appendChild (el);
    
  //   const val = document.defaultView.getComputedStyle (el,null).getPropertyValue("margin-top");

  //   document.body.removeChild (el);

  //   return parseInt (val || 0, 10);
  // }

  constructor(config: ViewConfig = {}) {
    super(config);

    // init recognizer support
    this.__pointer_recognizers = [];

    // position and size : according autosizing rules, can change
    // automatically if the parent container is resized
    this._pos = [-1, -1];
    this._size = [-1, -1];

    // init transformation
    this._translation =[0, 0, 0];
    this._rotation =[0, 0, 0];
    this._transform_origin =[0, 0];

    // rules for positionning a object
    this._autosizing = [4,4];

    // Initialize instance properties from old prototype defaults
    this._visible = true;
    this._magnet = View.MAGNET_NONE;
    this._pointerevent_handlers = null;
    this._enable = true;
    this._opacity = 1;
    this._scaling = 1;
    this._min_scale = 0.5;
    this._max_scale = 3;
    this._layout = null;
    this._transforms_stack = null;
    this._show_animation = null;
    this.__show_clb = null;
    this._hide_animation = null;
    this.__hide_clb = null;
    this._bubbling = false;
    this.__is_showing = false;
    this.__is_hidding = false;
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
  static DEFAULT_LAYOUT = null;

  /**
   * Horizontal layout
   * @see vs.ui.View#layout
   * @name vs.ui.View.HORIZONTAL_LAYOUT
   * @const
   */
  static HORIZONTAL_LAYOUT = 'horizontal';
  /** @private */
  static LEGACY_HORIZONTAL_LAYOUT = 'horizontal_layout';

  /**
   * Vertical layout
   * @see vs.ui.View#layout
   * @name vs.ui.View.VERTICAL_LAYOUT
   * @const
   */
  static VERTICAL_LAYOUT = 'vertical';
  /** @private */
  static LEGACY_VERTICAL_LAYOUT = 'vertical_layout';

  /**
   * Absolute layout
   * @see vs.ui.View#layout
   * @name vs.ui.View.ABSOLUTE_LAYOUT
   * @const
   */
  static ABSOLUTE_LAYOUT = 'absolute';
  /** @private */
  static LEGACY_ABSOLUTE_LAYOUT = 'absolute_layout';

  /**
   * Html flow layout
   * @see vs.ui.View#layout
   * @name vs.ui.View.FLOW_LAYOUT
   * @const
   */
  static FLOW_LAYOUT = 'flow';
  /** @private */
  static LEGACY_FLOW_LAYOUT = 'flow_layout';

  /********************************************************************
                      Delay constant
  *********************************************************************/

  /**
   * Threshold in px  use to unselect a item when pointer move
   * @name vs.ui.View.MOVE_THRESHOLD
   * @const
   */
  static MOVE_THRESHOLD = 20;

  /********************************************************************
                      Magnet contants
  *********************************************************************/

  /**
   * No magnet
   * @name vs.ui.View.MAGNET_NONE
   * @const
   */
  static MAGNET_NONE = 0;

  /**
   * The widget will be fixed on left
   * @name vs.ui.View.MAGNET_LEFT
   * @const
   */
  static MAGNET_LEFT = 3;

  /**
   * The widget will be fixed on bottom
   * @name vs.ui.View.MAGNET_BOTTOM
   * @const
   */
  static MAGNET_BOTTOM = 2;

  /**
   * The widget will be fixed on top
   * @name vs.ui.View.MAGNET_TOP
   * @const
   */
  static MAGNET_TOP = 1;

  /**
   * The widget will be fixed on right
   * @name vs.ui.View.MAGNET_RIGHT
   * @const
   */
  static MAGNET_RIGHT = 4;

  /**
   * The widget will centered
   * @name vs.ui.View.MAGNET_CENTER
   * @const
   */
  static MAGNET_CENTER = 5;

  /********************************************************************

  *********************************************************************/

  /**
   * @private
   */
  static NON_G_OBJECT = '_non_g_object';
  /**
   * @private
   */
  static ANY_PLACE = 'children';
  /**
   * @private
   */
  static _positionStyle = undefined;
  /**
   * @private
   */
  static __comp_templates = {};

  /**
   * @private
   */
  static _propagate_pointer_event(obj: any, func_ptr: Function, event: PointerEvent): void {
    // let event_name = "";
    // if (event.type === POINTER_START) { event_name = 'POINTER_START'; }
    // if (event.type === POINTER_END) { event_name = 'POINTER_END'; }
    // if (event.type === POINTER_MOVE) { event_name = 'POINTER_MOVE'; }

    // event.type = event_name;

    func_ptr.call (obj, event);
  }

  /********************************************************************
                    Instance properties and methods
  *********************************************************************/

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor(): void
  {
    let key: string, a: any, i: number, child: View;
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
          vs_utils.free (child);
        }
      }
      else
      { vs_utils.free (a); }
      delete (this.__children [key]);
    }
    this.__children = {};
    this.view = null;

    this.clearTransformStack ();

    super.destructor();
  }

  /**
   * @protected
   * @function
   */
  refresh(): void
  {
    let key: string, a: any, i: number, child: any, view = this.view;

    // refresh element real size and position
    if (view && view.parentElement)
    {
      this._size[0] = view.offsetWidth;
      this._size [1] = view.offsetHeight;
      this._pos[0] = view.offsetLeft;
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
  }

  /**
   * @name vs.ui.View#clone
   * @function
   * @private
   *
   * @param {vs_core.VSObject} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  clone(config: ViewConfig, cloned_map: any):  View
  {
    throw new Error('View clone is not supported yet');
    // function _getPaths (root, nodes)
    // {
    //   var paths = [], i = 0, l = nodes.length, node;
    //   for (; i < l; i++)
    //   {
    //     node = nodes[i];
    //     paths.push ([node, _getPath (root, node)]);
    //   }
    //   return paths;
    // }

    // function _evalPaths (root, paths, clonedViews)
    // {
    //   var nodes = [], i = 0, l = paths.length, path;
    //   for (; i < l; i++)
    //   {
    //     path = paths[i];
    //     if (!path.id) path.id = vs_core.createId ();
    //     clonedViews [path[0].id] = _evalPath (root, path[1]);
    //   }
    // }

    // function makeClonedNodeMap (comp, clonedViews)
    // {
    //   var
    //     clonedNode = comp.view.cloneNode (true),
    //     nodes = [], paths;
        
    //   function manageChild (child)
    //   {
    //     if (child.__gui_object__hack_view__)
    //     { nodes.push (child.__gui_object__hack_view__); }
    //     else if (child.view) { nodes.push (child.view); }
      
    //     retreiveChildNodes (child);
    //   }
        
    //   function retreiveChildNodes (comp)
    //   {
    //     var key, a, i, l, child;
    //     for (key in comp.__children)
    //     {
    //       a = comp.__children [key];
    //       if (!a) { continue; }
          
    //       if (vs_utils.isArray (a))
    //       {
    //         l = a.length;
    //         for (i = 0; i < l; i++)
    //         {
    //           manageChild (a [i]);
    //         }
    //       }
    //       else manageChild (a);
    //     }
    //   }
      
    //   retreiveChildNodes (comp);
      
    //   paths = _getPaths (comp.view, nodes);
    //   _evalPaths (clonedNode, paths, clonedViews);
      
    //   return clonedNode;
    // }
    
    // if (!cloned_map) { cloned_map = {}; }
    // if (!cloned_map.__views__) { cloned_map.__views__ = {}; }    
    // if (!config) { config = {}; }
    // if (!config.node)
    // {
    //   var node = cloned_map.__views__ [this.view.id];
    //   if (!node)
    //   {
    //     node = makeClonedNodeMap (this, cloned_map.__views__);
    //   }
    //   config.node = node;
    // }

    // return super.clone( config, cloned_map);
  }

   /**
   * @name vs_core.VSObject#_clone_properties_value
   * @function
   * @protected
   *
   * @param {vs_core.VSObject} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone_properties_value(obj: View, cloned_map?: any): void
  {
    var key;

    for (key in this)
    {
      if (key == 'id') continue;

      if (key == "size" || key == "position")
      {
        var value = this.size;
        if (!value || value.length !== 3 ||
            (value[0] === 0 && value[1] === 0))
        { continue; }
      }
  
      // property value copy
      if (this.isProperty (key))
      { vs_core.VSObject.__propertyCloneValue (key, this, obj); }
    }
  }

  /**
   * @name vs.ui.View#_clone
   * @function
   * @private
   *
   * @param {vs_core.VSObject} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone(obj: View, cloned_map?: any): void
  {
    var anim, a, key, child, l, hole, cloned_comp;

    super._clone( obj, cloned_map);

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
  }

  /**
   * @protected
   * @function
   */
  _getGUInode(config: ViewConfig): HTMLElement | null {
    throw new Error('View _getGUInode is not supported yet');
    // var node = this.__getGUInode (config), compName, doc, doc_elem;
    // if (node) { return node; }

    // var _template = (config.template)?config.template:this.template;
    // if (_template)
    // {
    //   var template = new Template (_template);
    //   var node = template.__extend_component (this);
    //   vs_utils.free (template);
    //   return node;
    // }

    // // 4) no node exists, generate a warning a create a div node.
    // if (this.html_template)
    // {
    //   node = Template.parseHTML (this.html_template);
    //   if (node) return node;
    // }
    // if (vs_utils.isFunction (this.constructor))
    // { compName = this.constructor.name; }
    // else if (vs_utils.isString (this.constructor))
    // { compName = this.constructor; }
    // else
    // { compName = View; }

    // console.warn ("Impossible to instance view of component '" + compName + ", id [" + config.id +
    //   "]. A default one is created");
    // node = document.createElement ('div');

    // return node;
  }

  /**
   * @protected
   * @function
   */
  __getGUInode(config: ViewConfig): HTMLElement | null {
    throw new Error('View __getGUInode is not supported yet');

    // // 1) the node is passed within config object
    // if (config.node)// && config.node instanceof HTMLElement)
    // {
    //   return config.node;
    // }

    // var node = null, node_ref, root_id, root_node, obj, regexp_result;
    // // find a direct reference
    // if (config.node_id)
    // {
    //   node = document.getElementById (config.node_id);
    //   if (node) { return node; }
    // }

    // // 2) find a template node in a view
    // node_ref = config.node_ref;
    // if (node_ref)
    // {
    //   regexp_result = View.refTemplatereg.exec (node_ref);
    //   // node ref with the new syntax : ref = root_id'#'node_ref
    //   if (regexp_result && regexp_result.length == 3)
    //   {
    //     root_id = regexp_result [1];
    //     node_ref = regexp_result [2];
    //   }
    //   // old syntax
    //   else root_id = config.root_ref;

    //   if (node_ref && root_id)
    //   {
    //     root_node = null;
    //     obj = vs_core.VSObject._obs [root_id];

    //     if (obj && obj.view) { root_node = obj.view; }
    //     else
    //     {
    //       root_node = document.getElementById (this.id);
    //     }
    //     if (root_node)
    //     {
    //       node = _findNodeRef (root_node, node_ref);
    //     }

    //     if (node) { return node; }
    //   }
    // }

    // // 3) find a template node
    // if (config.template_ref)
    // {
    //   node = this._getTemplateNode (config.template_ref);
    //   if (node) { return node; }
    // }

    // // last case : find a direct reference with component id
    // if (config.id)
    // {
    //   node = document.getElementById (config.id);
    //   if (node) { return node; }
    // }

    // return undefined;
  }

  /**
   * @private
   * @function
   */
  _getTemplateNode(ref: string): Node | undefined
  {
    var node: Element | null = null;

    if (!_template_nodes) {
      _template_nodes = document.querySelector (".application_templates");
      if (_template_nodes && _template_nodes.parentElement) {
        _template_nodes.parentElement.removeChild (_template_nodes);
      }
    }
    if (_template_nodes) {
      node = _template_nodes.querySelector ("." + ref);
    }

    if (node) { return document.importNode (node, true); }
  }

  /**
   * @protected
   * @function
   */
  initComponent(): void
  {
    super.initComponent();

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
  }

  /**
   * @protected
   * @function
   */
  componentDidInitialize(): void
  {
    super.componentDidInitialize();
    if (this._magnet) {
      this.view?.style.setProperty ('position', 'absolute');
    }

    if (this._magnet === View.MAGNET_CENTER)
    {
      this._updateSizeAndPos ();
      this._applyTransformation ();
    }
  }

  /**
   * Notifies that the component's view was added to the DOM.<br/>
   * You can override this method to perform additional tasks
   * associated with presenting the view.<br/>
   * If you override this method, you must call the parent method.
   *
   * @name vs.ui.View#viewDidAdd
   * @function
   */
  viewDidAdd(): void
  {
    const view = this.view;
    if (!view || !view.parentElement) return;

    // update the real element size and position
    vs_core.scheduleAction (()=> {
      this._size[0] = view.offsetWidth;
      this._size [1] = view.offsetHeight;
      this._pos[0] = view.offsetLeft;
      this._pos [1] = view.offsetTop;
    });
  }

  /**
   * @protected
   * @function
   */
  notify(event: any): void {}

  /**
   * @protected
   * @function
   */
  _parse_view(node: Element | null): void
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
  }

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
   * @return {vs_core.VSObject} the created component
   */
  createAndAddComponent(comp_name: string, config?: any, extension?: string): any
  {
    var comp_class = window [comp_name];
    if (!comp_class) {
      console.error ("Impossible to fund component '" + comp_name + "'.");
      return;
    }

    // verify the component view already exists
    if (!config) {config = {};}

    if (!config.id) { config.id = vs_core.createId (); }

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
  }

  /**
   *  Return true if the set component is a child o the current component
   *
   * @name vs.ui.View#isChild
   * @function
   *
   * @param {vs_core.EventSource} child The component to be removed.
   * @return {boolean}
   */
  isChild(child: any): boolean
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
  }

  /**
   *  Add the specified child component to this component.
   *  <p>
   *  The component can be a graphic component (vs.ui.View) or
   *  a non graphic component (vs_core.EventSource).
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
   * @param {vs_core.EventSource} child The component to be added.
   * @param {String} extension [optional] The hole into a vs.ui.View will be
   *       insert.
   */
  add(child: any, extension?: string, view?: HTMLElement): void
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
    if (a && vs_utils.isArray (a)) { a.push (child); }
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
  }

  /**
   *  Remove the specified child component from this component.
   *
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ui.View#remove
   * @function
   *
   * @param {vs_core.EventSource} child The component to be removed.
   */
  remove(child: any): void
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
  }

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
  removeAllChildren(should_free?: boolean, extension?: string): any[] | undefined
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
          child = a[0];
          self.remove (child);
          if (should_free) vs_utils.free (child);
          else children.push (child);
        }
      }
      else
      {
        self.remove (a);
        if (should_free) vs_utils.free (a);
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
  }

  /**
   * @protected
   * @function
   */
  findNodeRef(ref: string): Element | false
  {
    if (!this.view) { return; }

    return _findNodeRef (this.view, ref);
  }

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
   *  all bind using global variable vs_core.FORCE_EVENT_PROPAGATION_DELAY.<br/>
   *  You just have set as true (vs_core.FORCE_EVENT_PROPAGATION_DELAY = true)
   *  at beginning of your program.
   *
   * @name vs.ui.View#bind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {vs_core.VSObject} obj the object interested to catch the event
   *    [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   * @param {boolean} delay if true the callback 'func' will be call within
   *        an other "simili thread".
   */
  bind(spec: PointerEventType | string, obj: any, func?: string | Function, delay?: boolean): any
  {
    if (isPointerEventType(spec)) {
      if (!this.view) { return; }

      if (!func) { func = 'notify'; }
      const func_ptr = vs_utils.isFunction (func) ? func : obj [func];

      if (!func_ptr)
      {
        throw new Error('Invalid bind arguments. Unknown func: ' + func);
      }

      const handler = (event: Event) => {
        if (vs_core.EVENT_SUPPORT_TOUCH && (event as any).changedTouches &&
            (event as any).changedTouches.length > 1) { return; }

//        event.stopPropagation ();
//        event.preventDefault ();

        event.src = this;
        if (vs_core.EVENT_SUPPORT_TOUCH && event.changedTouches)
        {
          event.pageX = event.changedTouches[0].pageX;
          event.pageY = event.changedTouches[0].pageY;
          var rec = vs_ui_utils.getElementAbsolutePosition (this.view);
          event.offsetX = event.changedTouches[0].pageX - rec.x;
          event.offsetY = event.changedTouches[0].pageY - rec.y;
        }
        View._propagate_pointer_event (obj, func_ptr, event);
      };

      this._pointerevent_handlers [obj.id + spec] = handler;

      addPointerListener (this.view, spec, handler);
    }
    return super.bind( spec, obj, func, delay);
  }

  /**
   *  The event unbind method
   *  <p>
   *  Should be call when you want stop event listening on this object
   *
   * @name vs.ui.View#unbind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {vs_core.VSObject} obj the object you want unbind [mandatory]
   */
  unbind(spec: string, obj: any): void
  {
    if (!spec || !obj) { return; }
    if (isPointerEventType(spec)) {
      var handler = this._pointerevent_handlers [obj.id + spec];
      if (!handler || !this.view) { return; }

      removePointerListener (this.view, spec, handler);
    }
    super.unbind( spec, obj);
  }

/********************************************************************
                  GUI Utilities
********************************************************************/

  /**
   * @protected
   * @function
   */
  _setMagnet(code: number): void
  {
    this._magnet = code;
    if (!this.view) { return; }

    if (this._magnet)
    { this.view.style.setProperty ('position', 'absolute'); }
    else
    { this.view.style.removeProperty ('position'); }

    this._updateSizeAndPos ();
    this._applyTransformation ();
  }

  /**
   * @protected
   * @function
   * This function cost a lot!
   */
  _updateSizeAndPos(): void
  {
    const x = this._pos[0], w = this._size[0];
    let y = this._pos [1], h = this._size [1];

    let width: string, height: string, pWidth = 0, pHeight = 0,
      left = 'auto', top = 'auto', right = 'auto', bottom = 'auto';

    const aH = this._autosizing[0], aV = this._autosizing [1],
      view = this.view;
      
    let parentElement: HTMLElement | null;

    if (!view) { return; }
//     if (w < 0) { w = 0; }
//     if (h < 0) { h = 0; }

    parentElement = view.parentElement;
    if (parentElement) {
      pWidth = parentElement.offsetWidth;
      pHeight = parentElement.offsetHeight;
    }

    if (this._magnet === View.MAGNET_LEFT) x = 0;
    if (this._magnet === View.MAGNET_TOP) y = 0;

    if (w < 0) { width = ''; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 4 || aH === 1) { width = w + 'px'; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0) {
      if (pWidth) {
        width = (w / pWidth * 100) + '%';
      }
      else { width = w + 'px'; }
    }
    else { width = '100%'; }

    if (h < 0) { height = ''; }
    else if (aV === 5 || aV === 7) { height = 'auto'; }
    else if (aV === 4 || aV === 1) { height = h + 'px'; }
    else if (aV === 2 || aV === 3 || aV === 6 || aV === 0) {
      if (pHeight) {
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
      const r = pWidth - (x + w);
      right = (r >= 0) ? r + 'px' : '0';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight))
    { top = y + 'px'; }
    else if ((aV === 2 || aV === 0) && pHeight)
    { top = (y / pHeight * 100) + '%'; }

    if ((h >= 0) && (aV === 1 || aV === 3 || aV === 5 || aV === 7))
    {
      const b = pHeight - (y + h);
      bottom = (b >= 0) ? b + 'px' : '0';
    }

    if (this._magnet === View.MAGNET_BOTTOM) { top = 'auto'; bottom = '0px'; }
    if (this._magnet === View.MAGNET_RIGHT) { left = 'auto'; right = '0px'; }

    if (this._magnet === View.MAGNET_CENTER) {
      top = '50%'; bottom = 'auto';
      left = '50%'; right = 'auto';
    }

    view.style.left = left;
    view.style.right = right;
    view.style.top = top;
    view.style.bottom = bottom;
    view.style.width = width;
    view.style.height = height;
  }

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
   * @return {String} value the property value or undefined
   */
  getStyle(property: string): string | number | undefined {
    if (!this.view) { return undefined; }
    const css = this.view.style
    const value = css.getPropertyValue(property);

    if (property === 'opacity') { return value ? parseFloat (value) : 1.0; }
    return value === 'auto' ? undefined : value;
  }

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
  getComputedStyle(property: string): string | number | undefined {
    var css = this._getComputedStyle(this.view);
    const value = css?.getPropertyValue(property);

    if (property === 'opacity') { return value ? parseFloat (value) : 1.0; }
    return value === 'auto' ? undefined : value;
  }

  /**
   * @private
   * @function
   * @parent {DivHTMLElement} elem the element to get style
   * @return the computed CCS if it exists
   */
  private _getComputedStyle(elem?: HTMLElement | null): CSSStyleDeclaration | undefined {
    if (!this.view) { return undefined; }

    var doc = this.view.ownerDocument;
    if (!doc || !doc.defaultView) { doc = document; }
    if (!doc || !doc.defaultView) { return undefined;}

    return doc.defaultView.getComputedStyle(this.view, null);
  }

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
  setStyle(property: string, value?: string | number): void {
    if (!property) { return; }
    if (!this.view || !this.view.style ||
        !this.view.style.removeProperty || !this.view.style.setProperty)
    { return; }

    if (typeof value === 'undefined')
    { this.view.style.removeProperty (property); }
    else
    {
      if (vs_utils.isNumber (value)) value = '' + value; // IE need string
      this.view.style.setProperty (property, value);
    }
  }

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
  setStyles(style: Record<string, number | string | null | undefined>): void {
    if (!style) { return; }
    if (!this.view || !this.view.style)
    { return; }

    vs_ui_utils.setElementStyle (this.view, style);
  }

  /**
   *  Add new CSS rules related to this component.
   *
   *  @example
   *  myObject.addCssRules ('.classname1', ['color: red', 'margin: 0px']);
   *  <=> to
   *  vs_ui_utils.addCssRules ('#' + myObject.id + ' .classname1', ['color: red', 'margin: 0px']);
   *
   * @name vs.ui.View#addCssRules
   * @function
   *
   * @param {String} selector CSS Selector
   * @param {Array} rules the array of rules
   */
  addCssRules(selector: string, rules: string[]): void {
    vs_ui_utils.addCssRules ('#' + this._id + ' ' + selector, rules);
  }

  /**
   *  Add new CSS rule related to this component.
   *
   *  @example
   *  myObject.addCssRule ('.classname1', 'color: red');
   *  <=> to
   *  vs_ui_utils.addCssRule ('#' + myObject.id + ' .classname1', 'color: red');
   *
   * @name vs.ui.View#addCssRule
   * @function
   *
   * @param {String} selector CSS Selector
   * @param {String} rule the rule using the following format:
   *   "prop_name: value"
   */
  addCssRule(selector: string, rule: string): void {
    vs_ui_utils.addCssRule ('#' + this._id + ' ' + selector, rule);
  }

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
  redraw(clb?: Function): void
  {
    if (!this.view) { return; }
    var n = this.view, display = n.style.display, self = this;

    n.style.display = 'none';
    vs_core.scheduleAction (function()
    {
      if (display)
      { n.style.display = display; }
      else
      { n.style.removeProperty ('display'); }

      vs_core.scheduleAction (function()
      {
        self.refresh ();
        if (clb && vs_utils.isFunction (clb)) clb.call (self);
      });
    });
  }

  /**
   *  Displays the GUI Object
   *
   * @name vs.ui.View#show
   * @param {Function} clb a function to call a the end of show process
   * @function
   */
  show(clb?: Function): void
  {
    if (!this.view) { return; }
    if (this._visible) { return; }
    if (!vs_utils.isFunction (clb)) clb = undefined; 

    if (this.__view_display) {
      this.view.style.display = this.__view_display;
    }
    else {
      this.view.style.removeProperty ('display');
    }
    this.__view_display = undefined;

    this.__is_hidding = false;
    this.__is_showing = true;

    if (this._show_animation) {
      this._show_animation.process (this, function () {
        this._show_object (clb);
      }, this);
    }
    else {
      this._show_object (clb);
    }
  }

  /**
   *  Show the GUI Object
   *
   * @private
   * @param {Function} clb a function to call a the end of show process
   * @function
   */
  _show_object(clb?: Function): void
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
          vs_core.scheduleAction (function () {self.__show_clb.call (self);});
        }
        if (clb) {
          vs_core.scheduleAction (function () {clb.call (self);});
        }
      }
    }
  }

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
  setShowAnimation(animations?: any[] | Animation | null, options?: AnimationOptions, clb?: Function): void {
    if (typeof animations === "undefined" || animations === null) {
      this._show_animation = null;
    }
    else {
      if (animations instanceof Animation)
      {
        this._show_animation = animations.clone ();
      }
      else if (vs_utils.isArray (animations))
      {
        this._show_animation = new Animation ();
        this._show_animation.setAnimations (animations);
      }
      else
      {
        console.warn ('vs.ui.View.setShowAnimation invalid parameters!');
        return;
      }
      if (options)
      {
        if (options.duration) {
          this._show_animation.duration = options.duration;
        }
        if (options.timing) {
          this._show_animation.timing = options.timing;
        }
        if (options.origin) {
          this._show_animation.origin = options.origin;
        }
        if (options.iterationCount) {
          this._show_animation.iterationCount = options.iterationCount;
        }
        if (options.delay) {
          this._show_animation.delay = options.delay;
        }
      }
    }
    if (vs_utils.isFunction (clb)) { this.__show_clb = clb; }
    else { this.__show_clb = clb; }
  }

  /**
   *  Hides the GUI Object
   *
   * @name vs.ui.View#hide
   * @param {Function} clb a function to call a the end of show process
   * @function
   */
  hide(clb?: Function): void
  {
    if (!this.view) { return; }
    if (!this._visible && !this.__is_showing) { return; }
    if (!vs_utils.isFunction (clb)) clb = undefined; 

    this._visible = false;
    
    this.__is_showing = false;
    this.__is_hidding = true;
    
    if (this._hide_animation)
    {
      this._hide_animation.process (this, () => {
        this._hide_object (clb);
      }, this);
    }
    else
    {
      this._hide_object (clb);
    }
  }

  /**
   *  Hides the GUI Object
   *
   * @private
   * @function
   * @param {Function} clb a function to call a the end of show process
   */
  _hide_object(clb?: Function): void
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
          vs_core.scheduleAction (function () {self.__hide_clb.call (self);});
        }
        if (clb) {
          vs_core.scheduleAction (function () {clb.call (self);});
        }
      }
    }
    this.propertyChange ();
  }

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
  setHideAnimation(animations?: any[] | Animation | null, options?: AnimationOptions, clb?: Function): void
  {
    if (typeof animations === "undefined" || animations === null)
    {
      this._hide_animation = null;
     }
    else
    {
      if (animations instanceof Animation)
      {
        this._hide_animation = animations.clone ();
      }
      else if (vs_utils.isArray (animations))
      {
        this._hide_animation = new Animation ();
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
    if (vs_utils.isFunction (clb)) { this.__hide_clb = clb; }
    else { this.__hide_clb = clb; }
  }

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
  setVisible(visibility: boolean): void
  {
    if (!this.view) { return; }

    vs_ui_utils.setElementVisibility (this.view, visibility);
  }

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
  hasClassName(className: string): boolean
  {
    if (!this.view) { return false; }

    return vs_ui_utils.hasClassName (this.view, className);
  }

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
  addClassName(...classNames: string[]): void {
    this.view?.classList.add(...classNames);
  }

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
  removeClassName(...classNames: string[]): void {
    this.view?.classList.remove(...classNames);
  }

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
  toggleClassName(className: string): void{
    this.view?.classList.toggle(className);
  }

/********************************************************************

********************************************************************/

  /**
   * @protected
   * @function
   */
  _propagateToParent(e: any): void
  {
    if (this._bubbling && this.__parent && this.__parent.handleEvent)
    {
      this.__parent.handleEvent (e);
    }
  }

  /**
   * @name vs.ui.View#notifyToParent
   * @function
   */
  notifyToParent(e: any): void
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
  }

  /**
   * Did enable delegate
   * @name vs.ui.View#_didEnable
   * @protected
   */
   _didEnable(): void {}

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
  animate(animations: any[] | Animation, options?: AnimationOptions, clb?: Function): string | undefined
  {
    var anim;
    if (animations instanceof Animation)
    {
      anim = animations
    }
    else if (vs_utils.isArray (animations))
    {
      var anim = new Animation ();
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
  }

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
  translate(x: number, y: number, z?: number): void
  {
    if (!vs_utils.isNumber (x) || !vs_utils.isNumber (y)) { return };
    if (!vs_utils.isNumber (z)) z = 0;

    this._translation[0] = x;
    this._translation[1] = y;
    this._translation[2] = z;
    this._applyTransformation ();
  }

  /**
   *  Rotate the view about the horizontal and vertical axes.
   *  <p/>The angle units is radians.
   *
   * @name vs.ui.View#rotate
   * @function
   *
   * @param r {{float|array}} rotion angle
   */
  rotate(r: number | number[]): void
  {
    if (vs_utils.isNumber (r)) {
      this._rotation[0] = 0;
      this._rotation[1] = 0;
      this._rotation[2] = r;
    }
    else if (vs_utils.isArray (r))
    {
      if (vs_utils.isNumber (r[0])) this._rotation[0] = r[0];
      else this._rotation[0] = 0;
      if (vs_utils.isNumber (r[1])) this._rotation[1] = r[1];
      else this._rotation[1] = 0;
      if (vs_utils.isNumber (r[2])) this._rotation[2] = r[2];
      else this._rotation[2] = 0;
    }

    this._applyTransformation ();
  }

  /**
   *  Scale the view
   *  <p/>The scale is limited by a max and min scale value.
   *
   * @name vs.ui.View#scale
   * @function
   *
   * @param s {float} scale value
   */
  scale(s: number): void
  {
    if (!vs_utils.isNumber (s)) { return };

    if (s > this._max_scale) { s = this._max_scale; }
    if (s < this._min_scale) { s = this._min_scale; }
    if (this._scaling === s) { return; }

    this._scaling = s;

    this._applyTransformation ();
  }

  /**
   *  Define a new transformation matrix, using the transformation origin
   *  set as parameter.
   * @public
   * @function
   *
   * @param {Object} origin is a object reference a x and y position
   */
  setNewTransformOrigin(origin: TransformOrigin): void
  {
    if (!origin) { return; }
    if (!vs_utils.isNumber (origin.x) || !vs_utils.isNumber (origin.y)) { return; }

    this.flushTransformStack ();
    
    this._transform_origin[0] = origin.x;
    this._transform_origin[1] = origin.y;
  }

  /**
   *  Flush all current transformation, into the transformation stack.
   * @public
   * @function
   */
  flushTransformStack(): void
  {
    // Save current transform into a matrix
    var matrix = new vs_utils.CSSMatrix ();
    matrix = matrix.translate
      (this._transform_origin[0], this._transform_origin [1], 0);
    matrix = matrix.translate
      (this._translation[0], this._translation[1], this._translation[2]);
    matrix = matrix.rotate
      (this._rotation[0], this._rotation[1], this._rotation[2]);
    matrix = matrix.scale (this._scaling, this._scaling, 1);
    matrix = matrix.translate
      (-this._transform_origin[0], -this._transform_origin [1], 0);

    if (!this._transforms_stack) this._transforms_stack = matrix;
    {
      this._transforms_stack = matrix.multiply (this._transforms_stack);
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
  }

  /**
   * Push a new transformation matrix into your component transformation
   * stack.
   *
   * @public
   * @function
   *
   * @param {vs.CSSMatrix} matrix the matrix you want to add
   */
  pushNewTransform(matrix: any): void
  {
    if (!matrix) { return; }

    if (!this._transforms_stack) this._transforms_stack = matrix;
    else
    {
      this._transforms_stack = matrix.multiply (this._transforms_stack);
    }
  }

  /**
   *  Remove all previous transformations set for this view
   * @public
   * @function
   */
  clearTransformStack(): void
  {
    if (this._transforms_stack) delete (this._transforms_stack);
    this._transforms_stack = undefined;
  }

  /**
   *  Return the current transform matrix apply to this graphic Object.
   * @public
   * @function
   * @return {vs.CSSMatrix} the current transform matrix
   */
  getCTM(): any
  {
    var matrix, identity = new vs_utils.CSSMatrix ();

    // apply current transformation
    matrix = identity.translate (
      this._transform_origin[0] + this._translation[0],
      this._transform_origin [1] + this._translation[1],
      this._translation[2]
    );
    matrix = matrix.multiply (
      identity.rotate (this._rotation[0], this._rotation[1], this._rotation[2])
    );
    matrix = matrix.scale (this._scaling, this._scaling, 1);
    matrix = matrix.translate (
      -this._transform_origin[0],
      -this._transform_origin [1],
      0
    );

    // apply previous transformations and return the matrix
    if (this._transforms_stack) return matrix.multiply (this._transforms_stack);
    else return matrix;
  }

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
  getParentCTM(): any
  {

    function multiplyParentTCM (parent)
    {
      // no parent return identity matrix
      if (!parent) return new vs_utils.CSSMatrix ();
      // apply parent transformation matrix recurcively
      return multiplyParentTCM (parent.__parent).multiply (parent.getCTM ());
    }

    return multiplyParentTCM (this.__parent);
  }

  /**
   * @protected
   * @function
   */
  _applyTransformation(): void
  {
    var
      matrix = this.getCTM (),
      transform = matrix.getMatrix3dStr ();

    if (this._magnet === View.MAGNET_CENTER)
    {
      transform += " translate(-50%,-50%)";
    }

    vs_ui_utils.setElementTransform (this.view, transform);
  }

  /********************************************************************
                    Property getters and setters
  ********************************************************************/

  /**
   * Getter|Setter for size. Gives access to the size of the GUI Object
   * @name vs.ui.View#size
   *
   * @type {Array.<number>}
   */
  set size(v: number[])
  {
    if (!vs_utils.isArray (v) || v.length !== 2) { return; }
    if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber(v[1])) { return; }

    this._size[0] = v[0];
    this._size [1] = v [1];

    if (!this.view) { return; }
    this._updateSizeAndPos ();
  }

  /**
   * @ignore
   * @type {Array.<number>}
   */
  get size(): number[]
  {
    return this._size.slice ();
  }

  /**
   * Getter|Setter for position. Gives access to the position of the GUI
   * Object
   * @name vs.ui.View#position
   *
   * @type Array
   */
  set position(v: number[])
  {
    if (!v) { return; }
    if (!vs_utils.isArray (v) || v.length != 2) { return; }
    if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber(v[1])) { return; }

    this._pos[0] = v[0];
    this._pos [1] = v [1];

    if (!this.view) { return; }
    this._updateSizeAndPos ();
  }

  /**
   * @ignore
   * @type {Array.<number>}
   */
  get position(): number[]
  {
    return this._pos.slice ();
  }

  /**
   * Set size and position behavior according parent size.
   * @name vs.ui.View#autosizing
   *
   * @type Array
   */
  set autosizing(v: number[])
  {
    if (!v) { return; }
    if (!vs_utils.isArray (v) || v.length != 2) { return; }
    if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber(v[1])) { return; }

    if (this._autosizing[0] === v[0] && this._autosizing [1] === v [1])
    { return; }

    this._autosizing[0] = v[0];
    this._autosizing [1] = v [1];

    if (!this.view) { return; }
    this._updateSizeAndPos ();
  }

  /**
   * Set magnet
   * @name vs.ui.View#magnet
   *
   * @type Number
   */
  set magnet(code: number)
  {
    if (this._magnet === code) return;
    if (!vs_utils.isNumber (code) || code < 0 || code > 5) return;
    this._setMagnet (code);
  }

  /**
   * Hide or show the object.
   * obj.visible = true <=> obj.show (), obj.visible = false <=> obj.hide (),
   * @name vs.ui.View#visible
   * @type {boolean}
   */
  set visible(v: boolean)
  {
    if (v)
    { this.show (); }
    else
    { this.hide (); }
  }

  /**
   * Return true is the object is visible. False otherwise.
   * @ignore
   * @type {boolean}
   */
  get visible(): boolean
  {
    return this._visible;
  }

  /**
   * Allow pointer event bubbling between views (by default set to false)
   * @name vs.ui.View#bubbling
   * @type boolean
   */
  set bubbling(v: boolean)
  {
    if (v) { this._bubbling = true; }
    else { this._bubbling = false; }
  }

  /**
   * Activate or deactivate a view.
   * @name vs.ui.View#enable
   * @type {boolean}
   */
  set enable(v: boolean)
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
  }

  /**
   * @ignore
   * @return {boolean}
   */
  get enable(): boolean
  {
    return this._enable;
  }

  /**
   * Change view opacity.
   * value is include in this range[0, 1]
   * @name vs.ui.View#opacity
   * @type {number}
   */
  set opacity(v: number)
  {
    if (!vs_utils.isNumber (v)) return;
    if (v < 0 || v > 1) return;

    if (this.view) this.view.style.opacity = v.toString();
    this._opacity = v;
  }

  /**
   * Translation vector [tx, ty, tz]
   * <=> obj.translate (tx, ty, tz)
   * @name vs.ui.View#translation
   * @type {Array}
   */
  set translation(v: number[])
  {
    if (!vs_utils.isArray (v)) { return };

    this.translate (v[0], v[1], v[2]);
  }

  /**
   * @ignore
   * @type {Array}
   */
  get translation(): number[]
  {
    return this._translation.slice ();
  }

  /**
   * Rotation angle in degre
   * @name vs.ui.View#rotation
   * @type {{float|array}}
   */
  set rotation(v: number | number[])
  {
    this.rotate (v);
  }

  /**
   * @ignore
   * @type {Array}
   */
  get rotation(): number[]
  {
    return this._rotation.slice ();
  }

  /**
   * Scale the view
   * @name vs.ui.View#scaling
   * @type {float}
   */
  set scaling(v: number)
  {
    this.scale (v);
  }

  /**
   * @ignore
   * @type {float}
   */
  get scaling(): number
  {
    return this._scaling;
  }

  /**
   * Set the minimun scale value (default value is 0.5)
   * @name vs.ui.View#minScale
   * @type {float}
   */
  set minScale(v: number)
  {
    if (!vs_utils.isNumber (v)) { return };
    this._min_scale = v;

    if (this._scaling < this._min_scale) { this.scale (this._min_scale); }
  }

  /**
   * @ignore
   * @type {float}
   */
  get minScale(): number
  {
    return this._min_scale;
  }

  /**
   * Set the maximum scale value (default value is 3)
   * @name vs.ui.View#maxScale
   * @type {float}
   */
  set maxScale(v: number)
  {
    if (!vs_utils.isNumber (v)) { return };
    this._max_scale = v;

    if (this._scaling > this._max_scale) { this.scale (this._max_scale); }
  }

  /**
   * @ignore
   * @type {float}
   */
  get maxScale(): number
  {
    return this._max_scale;
  }

  /**
   * This property allows you to specify the origin of the 2D transformations.
   * Values are pourcentage of the view size.
   * <p>
   * The property is set by default to [50, 50], which is the center of
   * the view.
   * @name vs.ui.View#transformOrigin
   * @type Array.<number>
   */
  set transformOrigin(v: number[])
  {
    if (!vs_utils.isArray (v) || v.length !== 2) { return; }
    if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber (v[1])) { return; }

    this._transform_origin[0] = v[0];
    this._transform_origin [1] = v [1];

//      var origin_str = this._transform_origin[0] + '% ';
//      origin_str += this._transform_origin [1] + '%';
//      this.view.style ['-webkit-transform-origin'] = origin_str;
  }

  /**
   * @ignore
   * @return {Array}
   */
  get transformOrigin(): number[]
  {
    return this._transform_origin.slice ();
  }

  /**
   * Set the Animation when the view is shown
   * @name vs.ui.View#showAnimmation
   * @type {vs.fx.Animation}
   */
  set showAnimmation(v: any)
  {
    this.setShowAnimation (v);
  }

  /**
   * Set the Animation when the view is hidden
   * @name vs.ui.View#hideAnimation
   * @type {vs.fx.Animation}
   */
  set hideAnimation(v: any)
  {
    this.setHideAnimation (v);
  }

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
  set layout(v: string | null)
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
  }

  /**
   * This property allows to define both the HTML code and the text
   * @name vs.ui.View#innerHTML
   * @type String
   */
  set innerHTML(v: string)
  {
    if (!this.view) return;

    vs_utils.safeInnerHTML (this.view, v);
  }
}

applyMixins(View, [vs_core.Container]);

/**
 * @private
 */
var _template_nodes: Element | null = null;

// Apply RecognizerManager mixin
vs_utils.extend (View.prototype, RecognizerManager);
vs_utils.extendClass (View, vs_core.EventSource);

