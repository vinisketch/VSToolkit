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
      this._updateSizeAndPos ();
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
