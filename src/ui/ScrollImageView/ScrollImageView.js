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
import html_template from './ScrollImageView.html';
import ScrollView from '../ScrollView/ScrollView';

/**
 *  The vs.ui.ScrollImageView class
 *
 *  @extends vs.ui.ScrollView
 *  @class
 *  An vs.ui.ScrollImageView embeds an image in your application.
 *  It provides an efficient way to display images in a view while at the 
 *  same time supporting a number of image transformation to fit the image
 *  within the view space.
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

  html_template: html_template,

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
   * @ignore
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
    if (this._sub_view && this._image_loaded) {
    
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
    }

    if (this.__scroll_activated) { this._scroll_refresh (this._pinch); }
    View.prototype.refresh.call (this);
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
    vs_core.scheduleAction (function ()
    {
      self.refresh ();
//      self._applyInsideTransformation ();
    });
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
vs_utils.extendClass (ScrollImageView, ScrollView);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (ScrollImageView, {

'src': {
  /**
   * Set the image url
   * @name vs.ui.ScrollImageView#src 
   * @type {string}
   */
  set : function (v)
  {
    if (!vs_utils.isString (v)) { return; }
    
    this._image_loaded = false;
    this._src = v;
    this._image_data.src = this._src;
  },

  /**
   * Get the image url
   * @ignore
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
    if (!vs_utils.isNumber (v)) { return; }
    if (v !== ScrollImageView.STRETCH_FILL &&
        v !== ScrollImageView.STRETCH_NONE &&
        v !== ScrollImageView.STRETCH_UNIFORM && 
        v !== ScrollImageView.STRETCH_UNIFORM_FILL)
    { return; }
    
    this._stretch = v;
    this.refresh ();
  },

  /**
   * Get the image stretch mode (vs.ui.ScrollImageView.STRETCH_FILL or 
   * vs.ui.ScrollImageView.STRETCH_NONE)
   * @ignore
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
    if (!vs_utils.isArray (v) && v.length !== 2)
    {
      if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber(v[1])) { return; }
    }
    
    // reapply stretch mode
    this.stretch = this._stretch;
    
    this._size [0] = v [0];
    this._size [1] = v [1];
    this._updateSizeAndPos ();
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
export default ScrollImageView;
