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
 *  var svg = vs.ui.SVGView (config);
 *  svg.init ();
 *  svg.src = 'image.svg';
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

SVGView.prototype = {

  /**
   * The svg url
   * @private
   * @type {string}
   */
  _src: null,

  /*****************************************************************
   *
   ****************************************************************/
};
util.extendClass (SVGView, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (SVGView, {
  'src': {
    /**
     * Set the image url
     * @name vs.ui.SVGView#src 
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
  'size': {
    /**
     * Set the image size
     * @name vs.ui.SVGView#size 
     *
     * @type {Array.<number>}
     */
    set : function (v)
    {
      if (!util.isArray (v) && v.length !== 2)
      {
        if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      }
          
      this._size [0] = v [0];
      this._size [1] = v [1];
      
      if (this.view)
      {
        this.view.setAttribute ('width', this._size [0]);
        this.view.setAttribute ('height', this._size [1]);
      }
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
ui.SVGView = SVGView;
