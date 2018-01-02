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

import vs_utils from 'vs_utils';
import vs_core from 'vs_core';
import View from '../View/View';
import html_template from './SVGView.html';

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
var SVG_DEFS = null;

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

    object.onload = function () {

      var doc = object.getSVGDocument ();
      if (!doc) return;
      var svg_doc = doc.querySelector ('svg');
      if (!SVG_DEFS)
      {
        var svg = document.createElementNS ("http://www.w3.org/2000/svg", 'svg');
        svg.setAttribute ("width", "0");
        svg.setAttribute ("height", "0");
        document.body.appendChild (svg);
        
        SVG_DEFS = document.createElementNS ("http://www.w3.org/2000/svg", 'defs');
        svg.appendChild (SVG_DEFS);
      }
      SVG_DEFS.appendChild (svg_doc);
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

  html_template: html_template,

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

    vs_utils.removeAllElementChild (this.view);
    this.view.appendChild (svg);
    if (this._view_box) this.viewBox = this._view_box;

    function create_use (elem_id)
    {
      var use_elem = document.createElementNS ("http://www.w3.org/2000/svg", 'use');
      use_elem.setAttributeNS ("http://www.w3.org/1999/xlink", "href", "#" + elem_id);
      return use_elem;
    }

    if (elem_id)
    {
      svg.appendChild (create_use (elem_id));
    }
    else
    {
      var nodes = svg_doc.childNodes;
      for (var i = 0; i < nodes.length; i++)
      {
        var node = nodes [i];
        if (node.nodeType === 1 && node.nodeName !== 'defs')
        {
          elem_id = node.getAttribute ('id');
          if (!elem_id)
          {
            elem_id = vs_core.createId ();
            node.setAttribute ('id', elem_id);
          }
          svg.appendChild (create_use (elem_id));
        }
      }
    }
  }
};
vs_utils.extendClass (SVGView, View);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (SVGView, {
  'href': {
    /**
     * Set the image url
     * @name vs.ui.SVGView#src
     * @type {string}
     */
    set : function (v)
    {
      if (!vs_utils.isString (v)) { return; }

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
     * Get the image url
     * @ignore
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
      if (!vs_utils.isString (v)) { return; }

      vs_utils.removeAllElementChild (this.view);
      if (this.__object)
      {
        delete (this.__object);
      }

      vs_utils.safeInnerHTML (this.view, v);
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
      if (!vs_utils.isArray (v) || v.length != 4) { return; }

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
export default SVGView;
