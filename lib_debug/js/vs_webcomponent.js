/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
window.CustomElements = window.CustomElements || {flags:{}};
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope){

// bootstrap parsing
function bootstrap() {
  // parse document
  CustomElements.parser.parse(document);
  // one more pass before register is 'live'
  CustomElements.upgradeDocument(document);
  // choose async
  var async = window.Platform && Platform.endOfMicrotask ? 
    Platform.endOfMicrotask :
    vs.scheduleAction;
  async(function() {
    // set internal 'ready' flag, now document.registerElement will trigger 
    // synchronous upgrades
    CustomElements.ready = true;
    // capture blunt profiling data
    CustomElements.readyTime = Date.now();
    if (window.HTMLImports) {
      CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
    }
    // notify the system that we are bootstrapped
    document.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );

    // install upgrade hook if HTMLImports are available
    if (window.HTMLImports) {
      HTMLImports.__importsParsingHook = function(elt) {
        CustomElements.parser.parse(elt.import);
      }
    }
  });
}

// CustomEvent shim for IE
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(inType, true, true);
    return e;
  };
}

// When loading at readyState complete time (or via flag), boot custom elements
// immediately.
// If relevant, HTMLImports must already be loaded.
if (document.readyState === 'complete' || scope.flags.eager) {
  bootstrap();
// When loading at readyState interactive time, bootstrap only if HTMLImports
// are not pending. Also avoid IE as the semantics of this state are unreliable.
} else if (document.readyState === 'interactive' && !window.attachEvent &&
    (!window.HTMLImports || window.HTMLImports.ready)) {
  bootstrap();
// When loading at other readyStates, wait for the appropriate DOM event to 
// bootstrap.
} else {
  var loadEvent = window.HTMLImports && !HTMLImports.ready ?
      'HTMLImportsLoaded' : 'DOMContentLoaded';
  window.addEventListener(loadEvent, bootstrap);
}

})(window.CustomElements);/*
Copyright 2013 The Polymer Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

(function(scope){

var logFlags = window.logFlags || {};
var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : 'none';

// walk the subtree rooted at node, applying 'find(element, data)' function
// to each element
// if 'find' returns true for 'element', do not search element's subtree
function findAll(node, find, data) {
  var e = node.firstElementChild;
  if (!e) {
    e = node.firstChild;
    while (e && e.nodeType !== Node.ELEMENT_NODE) {
      e = e.nextSibling;
    }
  }
  while (e) {
    if (find(e, data) !== true) {
      findAll(e, find, data);
    }
    e = e.nextElementSibling;
  }
  return null;
}

// walk all shadowRoots on a given node.
function forRoots(node, cb) {
  var root = node.shadowRoot;
  while(root) {
    forSubtree(root, cb);
    root = root.olderShadowRoot;
  }
}

// walk the subtree rooted at node, including descent into shadow-roots,
// applying 'cb' to each element
function forSubtree(node, cb) {
  //logFlags.dom && node.childNodes && node.childNodes.length && console.group('subTree: ', node);
  findAll(node, function(e) {
    if (cb(e)) {
      return true;
    }
    forRoots(e, cb);
  });
  forRoots(node, cb);
  //logFlags.dom && node.childNodes && node.childNodes.length && console.groupEnd();
}

// manage lifecycle on added node
function added(node) {
  if (upgrade(node)) {
    insertedNode(node);
    return true;
  }
  inserted(node);
}

// manage lifecycle on added node's subtree only
function addedSubtree(node) {
  forSubtree(node, function(e) {
    if (added(e)) {
      return true;
    }
  });
}

// manage lifecycle on added node and it's subtree
function addedNode(node) {
  return added(node) || addedSubtree(node);
}

// upgrade custom elements at node, if applicable
function upgrade(node) {
  if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
    var type = node.getAttribute('is') || node.localName;
    var definition = scope.registry[type];
    if (definition) {
      logFlags.dom && console.group('upgrade:', node.localName);
      scope.upgrade(node);
      logFlags.dom && console.groupEnd();
      return true;
    }
  }
}

function insertedNode(node) {
  inserted(node);
  if (inDocument(node)) {
    forSubtree(node, function(e) {
      inserted(e);
    });
  }
}


// TODO(sorvell): on platforms without MutationObserver, mutations may not be 
// reliable and therefore attached/detached are not reliable.
// To make these callbacks less likely to fail, we defer all inserts and removes
// to give a chance for elements to be inserted into dom. 
// This ensures attachedCallback fires for elements that are created and 
// immediately added to dom.
var hasPolyfillMutations = (!window.MutationObserver ||
    (window.MutationObserver === window.JsMutationObserver));
scope.hasPolyfillMutations = hasPolyfillMutations;

var isPendingMutations = false;
var pendingMutations = [];
function deferMutation(fn) {
  pendingMutations.push(fn);
  if (!isPendingMutations) {
    isPendingMutations = true;
    var async = (window.Platform && window.Platform.endOfMicrotask) ||
        vs.scheduleAction;
    async(takeMutations);
  }
}

function takeMutations() {
  isPendingMutations = false;
  var $p = pendingMutations;
  for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
    p();
  }
  pendingMutations = [];
}

function inserted(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _inserted(element);
    });
  } else {
    _inserted(element);
  }
}

// TODO(sjmiles): if there are descents into trees that can never have inDocument(*) true, fix this
function _inserted(element) {
  // TODO(sjmiles): it's possible we were inserted and removed in the space
  // of one microtask, in which case we won't be 'inDocument' here
  // But there are other cases where we are testing for inserted without
  // specific knowledge of mutations, and must test 'inDocument' to determine
  // whether to call inserted
  // If we can factor these cases into separate code paths we can have
  // better diagnostics.
  // TODO(sjmiles): when logging, do work on all custom elements so we can
  // track behavior even when callbacks not defined
  //console.log('inserted: ', element.localName);
  if (element.attachedCallback || element.detachedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('inserted:', element.localName);
    if (inDocument(element)) {
      element.__inserted = (element.__inserted || 0) + 1;
      // if we are in a 'removed' state, bluntly adjust to an 'inserted' state
      if (element.__inserted < 1) {
        element.__inserted = 1;
      }
      // if we are 'over inserted', squelch the callback
      if (element.__inserted > 1) {
        logFlags.dom && console.warn('inserted:', element.localName,
          'insert/remove count:', element.__inserted)
      } else if (element.attachedCallback) {
        logFlags.dom && console.log('inserted:', element.localName);
        element.attachedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

function removedNode(node) {
  removed(node);
  forSubtree(node, function(e) {
    removed(e);
  });
}


function removed(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _removed(element);
    });
  } else {
    _removed(element);
  }
}

function _removed(element) {
  // TODO(sjmiles): temporary: do work on all custom elements so we can track
  // behavior even when callbacks not defined
  if (element.attachedCallback || element.detachedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('removed:', element.localName);
    if (!inDocument(element)) {
      element.__inserted = (element.__inserted || 0) - 1;
      // if we are in a 'inserted' state, bluntly adjust to an 'removed' state
      if (element.__inserted > 0) {
        element.__inserted = 0;
      }
      // if we are 'over removed', squelch the callback
      if (element.__inserted < 0) {
        logFlags.dom && console.warn('removed:', element.localName,
            'insert/remove count:', element.__inserted)
      } else if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

// SD polyfill intrustion due mainly to the fact that 'document'
// is not entirely wrapped
function wrapIfNeeded(node) {
  return window.ShadowDOMPolyfill ? ShadowDOMPolyfill.wrapIfNeeded(node)
      : node;
}

function inDocument(element) {
  var p = element;
  var doc = wrapIfNeeded(document);
  while (p) {
    if (p == doc) {
      return true;
    }
    p = p.parentNode || p.host;
  }
}

function watchShadow(node) {
  if (node.shadowRoot && !node.shadowRoot.__watched) {
    logFlags.dom && console.log('watching shadow-root for: ', node.localName);
    // watch all unwatched roots...
    var root = node.shadowRoot;
    while (root) {
      watchRoot(root);
      root = root.olderShadowRoot;
    }
  }
}

function watchRoot(root) {
  if (!root.__watched) {
    observe(root);
    root.__watched = true;
  }
}

function handler(mutations) {
  //
  if (logFlags.dom) {
    var mx = mutations[0];
    if (mx && mx.type === 'childList' && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || (d.host && d.host.localName)) || '';
          u = u.split('/?').shift().split('/').pop();
        }
    }
    console.group('mutations (%d) [%s]', mutations.length, u || '');
  }
  //
  mutations.forEach(function(mx) {
    //logFlags.dom && console.group('mutation');
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (!n.localName) {
          return;
        }
        // nodes added may need lifecycle management
        addedNode(n);
      });
      // removed nodes may need lifecycle management
      forEach(mx.removedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (!n.localName) {
          return;
        }
        removedNode(n);
      });
    }
    //logFlags.dom && console.groupEnd();
  });
  logFlags.dom && console.groupEnd();
};

var observer = new MutationObserver(handler);

function takeRecords() {
  // TODO(sjmiles): ask Raf why we have to call handler ourselves
  handler(observer.takeRecords());
  takeMutations();
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

function observe(inRoot) {
  observer.observe(inRoot, {childList: true, subtree: true});
}

function observeDocument(doc) {
  observe(doc);
}

function upgradeDocument(doc) {
  logFlags.dom && console.group('upgradeDocument: ', (doc.baseURI).split('/').pop());
  addedNode(doc);
  logFlags.dom && console.groupEnd();
}

function upgradeDocumentTree(doc) {
  doc = wrapIfNeeded(doc);
  upgradeDocument(doc);
  //console.log('upgradeDocumentTree: ', (doc.baseURI).split('/').pop());
  // upgrade contained imported documents
  var imports = doc.querySelectorAll('link[rel=' + IMPORT_LINK_TYPE + ']');
  for (var i=0, l=imports.length, n; (i<l) && (n=imports[i]); i++) {
    if (n.import && n.import.__parsed) {
      upgradeDocumentTree(n.import);
    }
  }
}

// exports
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
scope.watchShadow = watchShadow;
scope.upgradeDocumentTree = upgradeDocumentTree;
scope.upgradeAll = addedNode;
scope.upgradeSubtree = addedSubtree;

scope.observeDocument = observeDocument;
scope.upgradeDocument = upgradeDocument;

scope.takeRecords = takeRecords;

})(window.CustomElements);
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

// import

var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;

// highlander object for parsing a document tree

var parser = {
  selectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']'
  ],
  map: {
    link: 'parseLink'
  },
  parse: function(inDocument) {
    if (!inDocument.__parsed) {
      // only parse once
      inDocument.__parsed = true;
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(parser.selectors);
      // for each parsable node type, call the mapped parsing method
      forEach(elts, function(e) {
        parser[parser.map[e.localName]](e);
      });
      // upgrade all upgradeable static elements, anything dynamically
      // created should be caught by observer
      CustomElements.upgradeDocument(inDocument);
      // observe document for dom changes
      CustomElements.observeDocument(inDocument);
    }
  },
  parseLink: function(linkElt) {
    // imports
    if (isDocumentLink(linkElt)) {
      this.parseImport(linkElt);
    }
  },
  parseImport: function(linkElt) {
    if (linkElt.import) {
      parser.parse(linkElt.import);
    }
  }
};

function isDocumentLink(inElt) {
  return (inElt.localName === 'link'
      && inElt.getAttribute('rel') === IMPORT_LINK_TYPE);
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// exports

scope.parser = parser;
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;

})(window.CustomElements);
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * Implements `document.register`
 * @module CustomElements
*/

/**
 * Polyfilled extensions to the `document` object.
 * @class Document
*/

(function(scope) {

// imports

if (!scope) {
  scope = window.CustomElements = {flags:{}};
}
var flags = scope.flags;

// native document.registerElement?

var hasNative = Boolean(document.registerElement);
// TODO(sorvell): See https://github.com/Polymer/polymer/issues/399
// we'll address this by defaulting to CE polyfill in the presence of the SD
// polyfill. This will avoid spamming excess attached/detached callbacks.
// If there is a compelling need to run CE native with SD polyfill, 
// we'll need to fix this issue.
var useNative = !flags.register && hasNative && !window.ShadowDOMPolyfill;

if (useNative) {

  // stub
  var nop = function() {};

  // exports
  scope.registry = {};
  scope.upgradeElement = nop;
  
  scope.watchShadow = nop;
  scope.upgrade = nop;
  scope.upgradeAll = nop;
  scope.upgradeSubtree = nop;
  scope.observeDocument = nop;
  scope.upgradeDocument = nop;
  scope.upgradeDocumentTree = nop;
  scope.takeRecords = nop;

} else {

  /**
   * Registers a custom tag name with the document.
   *
   * When a registered element is created, a `readyCallback` method is called
   * in the scope of the element. The `readyCallback` method can be specified on
   * either `options.prototype` or `options.lifecycle` with the latter taking
   * precedence.
   *
   * @method register
   * @param {String} name The tag name to register. Must include a dash ('-'),
   *    for example 'x-component'.
   * @param {Object} options
   *    @param {String} [options.extends]
   *      (_off spec_) Tag name of an element to extend (or blank for a new
   *      element). This parameter is not part of the specification, but instead
   *      is a hint for the polyfill because the extendee is difficult to infer.
   *      Remember that the input prototype must chain to the extended element's
   *      prototype (or HTMLElement.prototype) regardless of the value of
   *      `extends`.
   *    @param {Object} options.prototype The prototype to use for the new
   *      element. The prototype must inherit from HTMLElement.
   *    @param {Object} [options.lifecycle]
   *      Callbacks that fire at important phases in the life of the custom
   *      element.
   *
   * @example
   *      FancyButton = document.registerElement("fancy-button", {
   *        extends: 'button',
   *        prototype: Object.create(HTMLButtonElement.prototype, {
   *          readyCallback: {
   *            value: function() {
   *              console.log("a fancy-button was created",
   *            }
   *          }
   *        })
   *      });
   * @return {Function} Constructor for the newly registered type.
   */
  function register(name, options) {
    //console.warn('document.registerElement("' + name + '", ', options, ')');
    // construct a defintion out of options
    // TODO(sjmiles): probably should clone options instead of mutating it
    var definition = options || {};
    if (!name) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('document.registerElement: first argument `name` must not be empty');
    }
    if (name.indexOf('-') < 0) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('document.registerElement: first argument (\'name\') must contain a dash (\'-\'). Argument provided was \'' + String(name) + '\'.');
    }
    // elements may only be registered once
    if (getRegisteredDefinition(name)) {
      throw new Error('DuplicateDefinitionError: a type with name \'' + String(name) + '\' is already registered');
    }
    // must have a prototype, default to an extension of HTMLElement
    // TODO(sjmiles): probably should throw if no prototype, check spec
    if (!definition.prototype) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('Options missing required prototype property');
    }
    // record name
    definition.__name = name.toLowerCase();
    // ensure a lifecycle object so we don't have to null test it
    definition.lifecycle = definition.lifecycle || {};
    // build a list of ancestral custom elements (for native base detection)
    // TODO(sjmiles): we used to need to store this, but current code only
    // uses it in 'resolveTagName': it should probably be inlined
    definition.ancestry = ancestry(definition.extends);
    // extensions of native specializations of HTMLElement require localName
    // to remain native, and use secondary 'is' specifier for extension type
    resolveTagName(definition);
    // some platforms require modifications to the user-supplied prototype
    // chain
    resolvePrototypeChain(definition);
    // overrides to implement attributeChanged callback
    overrideAttributeApi(definition.prototype);
    // 7.1.5: Register the DEFINITION with DOCUMENT
    registerDefinition(definition.__name, definition);
    // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
    // 7.1.8. Return the output of the previous step.
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    // force our .constructor to be our actual constructor
    definition.prototype.constructor = definition.ctor;
    // if initial parsing is complete
    if (scope.ready) {
      // upgrade any pre-existing nodes of this type
      scope.upgradeDocumentTree(document);
    }
    return definition.ctor;
  }

  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([extendee]);
    }
    return [];
  }

  function resolveTagName(definition) {
    // if we are explicitly extending something, that thing is our
    // baseTag, unless it represents a custom component
    var baseTag = definition.extends;
    // if our ancestry includes custom components, we only have a
    // baseTag if one of them does
    for (var i=0, a; (a=definition.ancestry[i]); i++) {
      baseTag = a.is && a.tag;
    }
    // our tag is our baseTag, if it exists, and otherwise just our name
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      // if there is a base tag, use secondary 'is' specifier
      definition.is = definition.__name;
    }
  }

  function resolvePrototypeChain(definition) {
    // if we don't support __proto__ we need to locate the native level
    // prototype for precise mixing in
    if (!Object.__proto__) {
      // default prototype
      var nativePrototype = HTMLElement.prototype;
      // work out prototype when using type-extension
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        nativePrototype = Object.getPrototypeOf(inst);
      }
      // ensure __proto__ reference is installed at each point on the prototype
      // chain.
      // NOTE: On platforms without __proto__, a mixin strategy is used instead
      // of prototype swizzling. In this case, this generated __proto__ provides
      // limited support for prototype traversal.
      var proto = definition.prototype, ancestor;
      while (proto && (proto !== nativePrototype)) {
        var ancestor = Object.getPrototypeOf(proto);
        proto.__proto__ = ancestor;
        proto = ancestor;
      }
    }
    // cache this in case of mixin
    definition.native = nativePrototype;
  }

  // SECTION 4

  function instantiate(definition) {
    // 4.a.1. Create a new object that implements PROTOTYPE
    // 4.a.2. Let ELEMENT by this new object
    //
    // the custom element instantiation algorithm must also ensure that the
    // output is a valid DOM element with the proper wrapper in place.
    //
    return upgrade(domCreateElement(definition.tag), definition);
  }

  function upgrade(element, definition) {
    // some definitions specify an 'is' attribute
    if (definition.is) {
      element.setAttribute('is', definition.is);
    }
    // remove 'unresolved' attr, which is a standin for :unresolved.
    element.removeAttribute('unresolved');
    // make 'element' implement definition.prototype
    implement(element, definition);
    // flag as upgraded
    element.__upgraded__ = true;
    // lifecycle management
    created(element);
    // there should never be a shadow root on element at this point
    // we require child nodes be upgraded before `created`
    scope.upgradeSubtree(element);
    // OUTPUT
    return element;
  }

  function implement(element, definition) {
    // prototype swizzling is best
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      // where above we can re-acquire inPrototype via
      // getPrototypeOf(Element), we cannot do so when
      // we use mixin, so we install a magic reference
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }

  function customMixin(inTarget, inSrc, inNative) {
    // TODO(sjmiles): 'used' allows us to only copy the 'youngest' version of
    // any property. This set should be precalculated. We also need to
    // consider this for supporting 'super'.
    var used = {};
    // start with inSrc
    var p = inSrc;
    // sometimes the default is HTMLUnknownElement.prototype instead of
    // HTMLElement.prototype, so we add a test
    // the idea is to avoid mixing in native prototypes, so adding
    // the second test is WLOG
    while (p !== inNative && p !== HTMLUnknownElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i=0, k; k=keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k,
              Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }

  function created(element) {
    // invoke createdCallback
    if (element.createdCallback) {
      element.createdCallback();
    }
  }

  // attribute watching

  function overrideAttributeApi(prototype) {
    // overrides to implement callbacks
    // TODO(sjmiles): should support access via .attributes NamedNodeMap
    // TODO(sjmiles): preserves user defined overrides, if any
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    }
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    }
    prototype.setAttribute._polyfilled = true;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/
  // index.html#dfn-attribute-changed-callback
  function changeAttribute(name, value, operation) {
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback
        && (newValue !== oldValue)) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  // element registry (maps tag names to definitions)

  var registry = {};

  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }

  function registerDefinition(name, definition) {
    registry[name] = definition;
  }

  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }

  function createElement(tag, typeExtension) {
    // TODO(sjmiles): ignore 'tag' when using 'typeExtension', we could
    // error check it, or perhaps there should only ever be one argument
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      return new definition.ctor();
    }
    return domCreateElement(tag);
  }

  function upgradeElement(element) {
    if (!element.__upgraded__ && (element.nodeType === Node.ELEMENT_NODE)) {
      var type = element.getAttribute('is') || element.localName;
      var definition = getRegisteredDefinition(type);
      return definition && upgrade(element, definition);
    }
  }

  function cloneNode(deep) {
    // call original clone
    var n = domCloneNode.call(this, deep);
    // upgrade the element and subtree
    scope.upgradeAll(n);
    // return the clone
    return n;
  }
  // capture native createElement before we override it

  var domCreateElement = document.createElement.bind(document);

  // capture native cloneNode before we override it

  var domCloneNode = Node.prototype.cloneNode;

  // exports

  document.registerElement = register;
  document.createElement = createElement; // override
  Node.prototype.cloneNode = cloneNode; // override

  scope.registry = registry;

  /**
   * Upgrade an element to a custom element. Upgrading an element
   * causes the custom prototype to be applied, an `is` attribute 
   * to be attached (as needed), and invocation of the `readyCallback`.
   * `upgrade` does nothing if the element is already upgraded, or
   * if it matches no registered custom tag name.
   *
   * @method ugprade
   * @param {Element} element The element to upgrade.
   * @return {Element} The upgraded element.
   */
  scope.upgrade = upgradeElement;
}

// bc
document.register = document.registerElement;

scope.hasNative = hasNative;
scope.useNative = useNative;

})(window.CustomElements);// add/ child / peg / hole


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

