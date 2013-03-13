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
 * A TextLabel.
 * @constructor
 * @extends vs.ui.View
 * @name vs.ui.TextLabel
 */
function TextLabel (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = TextLabel;
}

TextLabel.prototype = {
  
  /**
   * The text value
   * @protected
   * @type {string}
   */
  _text: "",

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    if (!this._text) { return; }
    
    util.setElementInnerText (this.view, this._text);
  }
};
util.extendClass (TextLabel, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (TextLabel, "text", {

  /**
   * Set the text value
   * @name vs.ui.TextLabel#name
   * @param {string} v
   */
  set : function (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._text = v;
    if (this.view)
    {
      util.setElementInnerText (this.view, this._text);
    }
  },

  /**
   * @ignore
   * get the text value
   * @type {string}
   */
  get : function ()
  {
    return this._text;
  }
});


/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.TextLabel = TextLabel;
