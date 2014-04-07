/**
  Copyright (C) 2009-2013. David Thevenin, ViniSketch (c), ICEL Co. Ltd, and
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
 *  @class
 *  vs.core.Connector is Dataflow Connector. Show not be instanced. 
 *  An Connector Object is returned by the connect method call.
 *
 * @author David Thevenin
 *
 * @constructor
 * @name vs.core.Connector
 * @public
 * @param {vs.core.Object} object the Component the connector will connected
 *        from
 * @param {String} property_name the Component out property name to connect
 *        from
 */
var Connector = function (object, property_name) {
  this._base_object = object;
  this._previous_object = undefined;
  this.property_out = property_name;
}

/**
 * @name vs.core.Connector#connect 
 * @function
 * @public
 * @param {vs.core.Object} object the Component the connector will connected
 *        to
 * @param {String} property_name the Component in property name to connect
 *        to
 */
Connector.prototype.to = function (object, property_name, func) {
  vs._default_df_.connect (this._base_object, this.property_out, object, property_name, func);
  this._previous_object = object;
  
  return this;
}

/**
 * @name vs.core.Connector#connect 
 * @function
 * @public
 * @param {String} property_name the Component out property name to connect
 *        from
 */
Connector.prototype.connect = function (property_name) {
  var object = this._previous_object || this._base_object;
  
  return new Connector (object, property_name);
}