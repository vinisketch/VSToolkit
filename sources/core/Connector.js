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

var Connector = function (object, property_out) {
  this.object = object;
  this.property_out = property_out;
}

Connector.prototype.to = function (object, property_in) {
  vs._default_df_.connect (this.object, this.property_out, object, property_in);
  
  return this;
}

Connector.prototype.connect = function (property_out) {
  return new Connector (this.object, property_out);
}

vs.core.Object.prototype.connect = function (property_out) {
  return new Connector (this, property_out);
}