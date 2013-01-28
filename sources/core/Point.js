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
 
 Use code from Canto.js Copyright 2010 Steven Levithan <stevenlevithan.com>
*/

/**
 *  @class
 *  vs.Point is an (x, y) coordinate pair. 
 *  When you use an vs.Point object in matrix operations, the object is 
 *  treated as a vector of the following form <x, y, 1>
 *
 * @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.Point
 *
 * @param {Number} the x-coordinate value.
 * @param {Number} the y-coordinate value.
*/
function Point (x, y)
{
  if (util.isNumber (x)) this.x = x;
  if (util.isNumber (y)) this.y = y;
}

Point.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
   x: 0,
   y: 0,
  
  /*****************************************************************
   *              
   ****************************************************************/
   
  /**
   * Applies the given 2×3 matrix transformation on this Point object and 
   * returns a new, transformed Point object.
   *
   * @name vs.Point#matrixTransform
   * @function
   * @public
   * @param {vs.CSSMatrix} matrix he matrix
   * @returns {vs.Point} the matrix
   */
  matrixTransform : function (matrix)
  {
    var matrix_tmp = new vs.CSSMatrix ();

    matrix_tmp = matrix_tmp.translate (this.x, this.y, this.z || 0);
    matrix = matrix.multiply (matrix_tmp);

    var result = new Point (matrix.m41, matrix.m42);

    delete (matrix_tmp);
    delete (matrix);

    return result;
  }
};

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.Point = Point;
