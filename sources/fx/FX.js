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

/********************************************************************
                   
*********************************************************************/
/** @private */
var vs = window.vs,
  util = vs.util,
  core = vs.core,
  ui = vs.ui,
  fx = vs.fx,
  setElementTransform = util.setElementTransform,
  getElementTransform = util.getElementTransform;

// Test which kind of transformation you can use
var SUPPORT_CSS_TRANSFORM = 
  (util.vsTestStyle.webkitTransform || util.vsTestStyle.msTransform);
  
var SUPPORT_3D_TRANSFORM =
  'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix ();

util.extend (fx, {
  SUPPORT_CSS_TRANSFORM:    SUPPORT_CSS_TRANSFORM,
  SUPPORT_3D_TRANSFORM:     SUPPORT_3D_TRANSFORM
});