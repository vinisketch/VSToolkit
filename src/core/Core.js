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

/**
 * @private
 */
var _id_index_ = 0;

/**
 * Returns a local unique Id <p>
 * The algorithm is based on an index initialized when the page is loaded.
 *
 * @memberOf vs.core
 *
 * @return {String}
 */
function createId ()
{
  return "vs_id_" + _id_index_++;
}

/**
 * Returns an unique Id <p>
 * The algorithm uses a time stamp and a random number to generate the id.
 *
 * @memberOf vs.core
 *
 * @return {String}
 */
function createUniqueId ()
{
  return "vs_id_" + new Date().getTime() + "" + Math.floor (Math.random() * 1000000);
}

/********************************************************************
                      Export
*********************************************************************/
/**
 * @private
 */
export {
  createId,
  createUniqueId
};
