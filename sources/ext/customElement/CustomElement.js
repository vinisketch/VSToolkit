// add/ child / peg / hole


// propriété ref sur un autre composant

// associer du code


// OK content text ex: <vs-button>Salut</vs-button>
// OK events

// OK propriété non scalaire (Array, object)
// 3 approches: namespace, dynamic, default string

var UNMUTABLE_ATTRIBUTES = ["id", "is", "x-hag-comp", "peg", "properties", "name"];

function NO_CONTENT (node) {
  vs.util.removeAllElementChild (node);
}

function TEXT_CONTENT (node, config) {
  var text = node.textContent;
  vs.util.removeAllElementChild (node);
  
  if (text) config.text = text;
}

function RADIO_CHECK_BUTTON_CONTENT (node, config) {
  var
    model = [],
    items = node.children,
    i = 0,
    l = items.length,
    item;
    
  for (; i < l; i ++) {
    item = items.item (i);
    if (item.nodeName == "VS-ITEM") model.push (item.textContent);
  }
  
  vs.util.removeAllElementChild (node);
  
  config.model = model;
}

var EXTERN_COMPONENT = {}, LOADING_CLBS = {};

function get_extern_component (href, result_clb) {

  var node = EXTERN_COMPONENT [href], data, clbs;
  
  if (!vs.util.isFunction (result_clb)) result_clb = null;

  if (node) {
    if (result_clb) result_clb (node);
    return;
  }
  
  if (result_clb) {
    clbs = LOADING_CLBS [href];
    if (!clbs) {
      LOADING_CLBS [href] = clbs = [];
    }
    clbs.push (result_clb);
  }
  
  function send_result (href, data) {
    var clbs = LOADING_CLBS [href];
    if (clbs) {
      clbs.forEach (function (result_clb) {
        vs.scheduleAction (function () {result_clb (data)});
      })
      clbs = [];
      delete (LOADING_CLBS [href]);
    }
  }
  
  var xmlRequest = new XMLHttpRequest ();
  xmlRequest.open ("GET", href, false);
  xmlRequest.send (null);

  if (xmlRequest.readyState === 4)
  {
    if (xmlRequest.status === 200 || xmlRequest.status === 0)
    {
      data = xmlRequest.responseText;
      node = vs.ui.Template.parseHTML (data);
      EXTERN_COMPONENT [href] = node;
      send_result (href, node);
    }
    else
    {
      console.error ("Template file for component '" + comp_name + "' unfound.");
      send_result (href, node);
      return;
    }
  }
  else
  {
    console.error ("Pb when load the component '" + comp_name + "' template.");
    send_result (href, node);
    return;
  }
  xmlRequest = null;
}


function declare_extern_component () {

  var
    node,
    comp_proto;
  
  node = vs.ui.Template.parseHTML ("<div></div>");
  comp_proto = Object.create (node.constructor.prototype);
  
  comp_proto.createdCallback = function () {
  
    var href = this.getAttribute ('href');
    if (!href) return;
    
    // force component to be load
    get_extern_component (href);
  };
  
  comp_proto.attachedCallback = function () {
  
    var
      self = this,
      href = this.getAttribute ('href'),
      id = this.getAttribute ('id');
    
    get_extern_component (href, function (data) {
      if (!data) return;
      
      var
        parentNode = self.parentNode,
        importNode = document.importNode (data, true);
        
      if (id) {
        importNode.setAttribute ('id', id);
      }
      console.log (importNode);
      
      parentNode.insertBefore (importNode, self);
      parentNode.removeChild (self);
    });
  };
        
  comp_proto.detachedCallback = function () {
    console.log ("detachedCallback");
  };
        
  comp_proto.attributeChangedCallback = function (name, oldValue, newValue) {};
  
  document.registerElement ("vs-import", {prototype: comp_proto});
}















var property_reg = /(\w+):(\w+[.\w+]*)#(\w+)/;

function parsePropertiesDeclaration (properties_str) {

  var
    comp_properties = {},
    properties = properties_str.split (';'),
    prop_decl;
  
  for (var i = 0; i < properties.length; i++) {
    prop_decl = property_reg.exec (properties [i]);
    if (!prop_decl || prop_decl.length != 4) {
      console.error ("Problem with properties declaration \"%s\"",
        properties [i]);
      continue;
    }
    comp_properties [prop_decl[1]] = [prop_decl [2], prop_decl [3]];
  }

  return comp_properties;
}

function _setCompProperties (comp, properties)
{
  var desc, prop_name, value;
  
  if (!comp.__properties__) comp.__properties__ = [];
  
  for (prop_name in properties) {

    value = properties [prop_name];
    desc = {};
    
    desc.set = (function (_path, _prop_name) {
      return function (v) {
        var base = this.view, namespaces = _path.split ('.');
        while (base && namespaces.length) {
          base = base.querySelector ("*[name=" + namespaces.shift () + "]");
        }
        if (base) base.setAttribute (_prop_name, v);

        this.propertyChange (_prop_name);
      };
    }(value[0], value[1]));

    desc.get = (function (_path, _prop_name) {
      return function () {
        var base = this, namespaces = _path.split ('.');
        while (base && namespaces.length) {
          base = base [namespaces.shift ()];
        }
        if (base) return base [_prop_name];
      };
    }(value[0], value[1]));
    
    vs.util.defineProperty (comp, prop_name, desc);
    comp.__properties__.push (prop_name);
  }
}


function LIST_TEMPLATE_CONTENT (node, config) {

  var template_comp, comp_properties;
  
  function buildTemplate (item) {
    
    var str_template = "<li";
    var attributes = item.attributes, l = attributes.length, attribute;
    
    // copy attributes
    while (l--) {
      attribute = attributes.item (l);
      if (attribute.name == "properties") {
        //properties declaration
        comp_properties = parsePropertiesDeclaration (attribute.value);
        continue;
      }
      if (UNMUTABLE_ATTRIBUTES.indexOf (attribute.name) !== -1) continue;
      str_template += ' ' + attribute.name + "=\"" + attribute.value + "\"";
    }

    // copy the template content
    str_template += ">" + item.innerHTML + "</li>";

    // create the template object
    var template = new vs.ui.Template (str_template);
    
    // generate the comp
    var config = buildConfiguration (item);
    var comp = template.compileView ("vs.ui.AbstractListItem", config);
    _setCompProperties (comp, comp_properties);
    return comp;
  }

  var item = node.firstElementChild;
  
  while (item) {
  
    if (item.nodeName == "VS-TEMPLATE") {
    
      var href = item.getAttribute ("href");
      if (href) {
        get_extern_component (href);
        node.__ext_template = href;
      }
      else {
        template_comp = buildTemplate (item);
      }
      
      break;
    }
  }
  
  vs.util.removeAllElementChild (node);
  
  config.__template_obj = template_comp;
}

function LIST_ATTACHED_CALLBACK () {
  
  if (!this._comp_) return;
  
   console.log ("LIST attachedCallback");
   
  var href = this.__ext_template, self = this;
  if (href) {
    delete (this.__ext_template);
    
    get_extern_component (href, function (data) {
      if (!data) return;

      var config = buildConfiguration (data);
      config.node = document.importNode (data, true);

      var comp = new vs.ui.AbstractListItem (config).init ();
      
      var properties_str = data.getAttribute ("properties");
      if (properties_str) {
        var comp_properties = parsePropertiesDeclaration (properties_str);
        _setCompProperties (comp, comp_properties);
      }
    
      self._comp_.setItemTemplate (comp);
      self._comp_._modelChanged ();
    });
  }
   
  var parentComp = getParentComp (this), name = this.getAttribute ("name");
  
  if (parentComp) {
    parentComp.add (this._comp_, this.getAttribute ("peg"));
    if (name) {
      if (parentComp.isProperty (name)) {
        console.error (
          "Impossible to define a child, type \"%s\", with the same name " +
          "\"%s\" of a property. Change the component name on your template.",
          this.nodeName, name);
        console.log (this);
      }
      else {
        parentComp [name] = this._comp_;
        this.classList.add (name);
      }
    }
  }
  
//   console.log (this.nodeName);
}

function ALLOW_CHILD_CONTENT (node) {}

var LIST_COMPONENT = [
  ["vs.ui.Button", "vs-button", TEXT_CONTENT],
  ["vs.ui.Switch", "vs-switch", NO_CONTENT],
  ["vs.ui.Slider", "vs-slider", NO_CONTENT],
  ["vs.ui.Application", "vs-application", ALLOW_CHILD_CONTENT],
  ["vs.ui.Canvas", "vs-canvas", NO_CONTENT],
  ["vs.ui.CheckBox", "vs-checkbox", RADIO_CHECK_BUTTON_CONTENT],
  ["vs.ui.ComboBox", "vs-combobox", NO_CONTENT],
  ["vs.ui.ImageView", "vs-image", NO_CONTENT],
  ["vs.ui.InputField", "vs-input", NO_CONTENT],
  ["vs.ui.List", "vs-list", LIST_TEMPLATE_CONTENT, null, LIST_ATTACHED_CALLBACK],
  ["vs.ui.NavigationBar", "vs-navigation-bar", ALLOW_CHILD_CONTENT],
  ["vs.ui.Picker", "vs-picker", NO_CONTENT],
  ["vs.ui.PopOver", "vs-popover", ALLOW_CHILD_CONTENT],
  ["vs.ui.ProgressBar", "vs-progress-bar", NO_CONTENT],
  ["vs.ui.RadioButton", "vs-radiobutton", RADIO_CHECK_BUTTON_CONTENT],
  ["vs.ui.ScrollImageView", "vs-scroll-image", NO_CONTENT],
  ["vs.ui.ScrollView", "vs-scroll-view", ALLOW_CHILD_CONTENT],
  ["vs.ui.SegmentedButton", "vs-segmented-button", NO_CONTENT],
  ["vs.ui.SplitView", "vs-split-view", ALLOW_CHILD_CONTENT],
  ["vs.ui.SVGView", "vs-svg", NO_CONTENT],
  ["vs.ui.TextArea", "vs-textarea", NO_CONTENT],
  ["vs.ui.TextLabel", "vs-label", TEXT_CONTENT],
  ["vs.ui.ToolBar", "vs-toolbar", NO_CONTENT],
  ["vs.ui.View", "vs-view", ALLOW_CHILD_CONTENT]
]

function INT_DECODER (value) {
  return parseInt (value, 10)
}

function BOOL_DECODER (value) {
  return Boolean (value)
}

function JSON_DECODER (value) {
  var result;
  try {
    result = JSON.parse (value);
  }
  catch (exp) {
    if (exp.stack) console.error (exp.stack);
    console.error (exp);
  }
  return result;
}

function ARRAY_DECODER (value) {
  var result;
  try {
    result = JSON.parse (value);
  }
  catch (exp) {
    if (exp.stack) console.error (exp.stack);
    console.error (exp);
  }
  if (vs.util.isArray (result)) return result;
  
  return;
}

function OBJECT_DECODER (value) {
  var result;
  try {
    result = JSON.parse (value);
  }
  catch (exp) {
    if (exp.stack) console.error (exp.stack);
    console.error (exp);
  }
  
  return result;
}

function STRING_DECODER (value) {
  return "" + value;
}

function DYNAMIC_DECODER (value, comp, prop_name) {
  if (!comp || !prop_name) return STRING_DECODER (value);
  
  var old_value = comp [prop_name];
  if (vs.util.isNumber (old_value)) return INT_DECODER (value);
  if (vs.util.isArray (old_value)) return ARRAY_DECODER (value);
  if (vs.util.isString (old_value)) return STRING_DECODER (value);
  if (vs.util.isUndefined (old_value)) return STRING_DECODER (value);
  if (vs.util.isObject (old_value)) return OBJECT_DECODER (value);
  
  return STRING_DECODER (value);
}

var ATTRIBUTE_DECODERS = {
  "magnet": INT_DECODER,
  "range": ARRAY_DECODER
}

var ONLOAD_METHODS = [];

/**
 * @private
 */
function resolveClass (name) {
  if (!name) { return null; }

  var namespaces = name.split ('.');
  var base = window;
  while (base && namespaces.length) {
    base = base [namespaces.shift ()];
  }

  return base;
}

function buildConfiguration (node) {

  var
    config = {},
    name,
    attributes = node.attributes,
    l = attributes.length,
    attribute;
  
  config.node = node;
  
  while (l--) {
    attribute = attributes.item (l);
    name = vs.util.camelize (attribute.name);
    if (name == "id") {
      config.id = attribute.value;
      continue;
    }
    else if (name == "class") continue;
    else if (UNMUTABLE_ATTRIBUTES.indexOf (attribute.name) !== -1) continue;
    else if (name.indexOf ("on") === 0) continue; // Event
    else if (name.indexOf ("json:") === 0) {
      config [name.replace ("json:", "")] = JSON_DECODER (attribute.value);
    }
    else {
      var decoder = ATTRIBUTE_DECODERS [name]
      if (decoder) config [name] = decoder (attribute.value);
      else config [name] = DYNAMIC_DECODER (attribute.value);
    }
  }
  
  return config;
}

function buildBinding (node, comp) {

  var
    attributes = node.attributes,
    i,
    attribute,
    spec;
    
  for (i = 0; i < attributes.length; ) {
    attribute = attributes.item (i);
    name = vs.util.camelize (attribute.name);
    if (name == "onload") {
      var value = attribute.value;
      if (value) {
        ONLOAD_METHODS.push (function (event) {
          try { 
            eval (value);
          } catch (exp) {
            if (exp.stack) console.error (exp.stack);
            console.error (exp);
          }
        });
      }
      node.removeAttribute (name);
    }
    else if (name.indexOf ("on") === 0) {
      spec = name.substring (2);
      var value = attribute.value;
      node.removeAttribute (name);
      comp.bind (spec, window, function (event) {
        try { 
          eval (value);
        } catch (exp) {
          if (exp.stack) console.error (exp.stack);
          console.error (exp);
        }
      });
    }
    else i++;
  }
}

function getParentComp (node) {
  if (!node) return null;
  var parentNode = node.parentNode;
  if (parentNode && parentNode._comp_) return parentNode._comp_;
  else return getParentComp (parentNode);
}

function declareComponent (className, comp_name, manage_content,
  createdCallback, attachedCallback, detachedCallback) {

  var
    _class = resolveClass (className),
    node,
    comp_proto,
    decl,
    html_comp;
  
  if (!_class) return;
  
  if (className == "vs.ui.Application") {
    node = document.createElement ("body");
    node.className = "application";
    node.setAttribute ("x-hag-hole", "children");
  }
  else if (_class.prototype.html_template) {
    node = vs.ui.Template.parseHTML (_class.prototype.html_template);
  }
  else {
    node = vs.ui.Template.parseHTML ("<div></div>");
  }
  
  comp_proto = Object.create (node.constructor.prototype);
  
  if (vs.util.isFunction (createdCallback)) {
    comp_proto.createdCallback = createdCallback;
  }
  else comp_proto.createdCallback = function () {

   // console.log (this.nodeName);
    
    var
      _node = document.importNode (node, true),
      children = _node.children,
      config = buildConfiguration (this),
      _comp_;

    this.className = node.className;
      
    if (manage_content) {
      manage_content (this, config);
    }
    else NO_CONTENT (this);
      
    for (var i = 0; i < children.length; i++) {
      this.appendChild (children.item (i));
    }
    _comp_ = new _class (config);

    var properties_str = this.getAttribute ("properties");
    if (properties_str) {
      var comp_properties = parsePropertiesDeclaration (properties_str);
      _setCompProperties (_comp_, comp_properties);
    }
    
    _comp_.init ();
    
    buildBinding (this, _comp_);
  };
  
  if (vs.util.isFunction (attachedCallback)) {
    comp_proto.attachedCallback = attachedCallback;
  }
  else comp_proto.attachedCallback = function () {
  
    if (!this._comp_) return;
    
    var
      parentComp = getParentComp (this),
      name = this.getAttribute ("name");
    
    if (parentComp) {
      parentComp.add (this._comp_, this.getAttribute ("peg"));
      if (name) {
        if (parentComp.isProperty (name)) {
          console.error (
            "Impossible to define a child, type \"%s\", with the same name " +
            "\"%s\" of a property. Change the component name on your template.",
            this.nodeName, name);
          console.log (this);
        }
        else {
          parentComp [name] = this._comp_;
          this.classList.add (name);
        }
      }
    }
    
 //   console.log (this.nodeName);
  };
        
  if (vs.util.isFunction (detachedCallback)) {
    comp_proto.detachedCallback = detachedCallback;
  }
  else comp_proto.detachedCallback = function () {
    console.log ("detachedCallback");
  };
        
  comp_proto.attributeChangedCallback = function (name, oldValue, newValue) {
  
    if (UNMUTABLE_ATTRIBUTES.indexOf (name) !== -1) return;
    
    var comp = this._comp_;
    name = vs.util.camelize (name)
    
    if (!comp) return;

    else if (name.indexOf ("json:") === 0) {
      name = name.replace ("json:", "");
      if (comp.isProperty (name)) {
        comp [name] = JSON_DECODER (newValue);
      }
    }

    else if (comp.isProperty (name)) {
      var decoder = ATTRIBUTE_DECODERS [name]
      if (decoder) comp [name] = decoder (newValue);
      else comp [name] = DYNAMIC_DECODER (newValue, comp, name);
      comp.propagateChange (name);
    }
  };
  
  decl = {prototype: comp_proto};
  
  if (className == "vs.ui.Application") {
    decl.extends = "body";
  }
  
  html_comp = document.registerElement (comp_name, decl);

  return html_comp;
}

LIST_COMPONENT.forEach (function (item) {
  declareComponent.apply (this, item);
});

declare_extern_component ();

window.addEventListener ('DOMContentLoaded', function() {
  document.body.style.opacity = 0;
});
  
window.addEventListener ('WebComponentsReady', function() {
  // show body now that everything is ready
  vs.ui.Application.start ();
  vs.scheduleAction (function () {
    document.body.style.opacity = 1;
  });
  
  ONLOAD_METHODS.forEach (function (item) { item.call (); });
});

