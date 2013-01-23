/** @license
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

(function (window, undefined) {

var document = window.document;

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
 * @namespace Main ViniSketch toolkit namespace
 * @name vs
 */
window.vs = {};

/**
 * Contains a collections of facilities, internationalization, and miscellaneous
 * utility classes and methods.
 *
 * @namespace Main ViniSketch utility elements.
 * @name vs.util
 */
window.vs.util = {};

/**
 * @namespace Main ViniSketch components
 * @name vs.core
 */
window.vs.core = {};

/**
 * @namespace Main ViniSketch Data components
 * @name vs.data
 */
window.vs.data = {};

/**
 * @namespace Main ViniSketch User Interface components
 * @name vs.ui
 */
window.vs.ui = {};

/**
 * @namespace Main ViniSketch animation...
 * @name vs.fx
 */
window.vs.fx = {};

/**
 * @namespace Main ViniSketch Audio and Video...
 * @name vs.av
 */
window.vs.av = {};

/**
 * @namespace ViniSketch extensions...
 * @name vs.ext
 */
window.vs.ext = {};

/**
 * @namespace ViniSketch GUI extensions...
 * @name vs.ext.ui
 */
window.vs.ext.ui = {};
  
/**
 * @namespace ViniSketch FX extensions...
 * @name vs.ext.fx
 */
window.vs.ext.fx = {};

window.vs.SUPPORT_3D_TRANSFORM = false
/**
 *  class FirminCSSMatrix
 *
 *  The [[FirminCSSMatrix]] class is a concrete implementation of the
 *  `CSSMatrix` interface defined in the [CSS 2D Transforms][2d] and
 *  [CSS 3D Transforms][3d] Module specifications.
 *
 *  [2d]: http://www.w3.org/TR/css3-2d-transforms/
 *  [3d]: http://www.w3.org/TR/css3-3d-transforms/
 *
 *  The implementation was largely copied from the `WebKitCSSMatrix` class, and
 *  the supparting maths libraries in the [WebKit][webkit] project. This is one
 *  reason why much of the code looks more like C++ than JavaScript.
 *
 *  [webkit]: http://webkit.org/
 *
 *  Its API is a superset of that provided by `WebKitCSSMatrix`, largely
 *  because various pieces of supporting code have been added as instance
 *  methods rather than pollute the global namespace. Examples of these include
 *  [[FirminCSSMatrix#isAffine]], [[FirminCSSMatrix#isIdentityOrTranslation]]
 *  and [[FirminCSSMatrix#adjoint]].
 **/

/**
 *  new FirminCSSMatrix(domstr)
 *  - domstr (String): a string representation of a 2D or 3D transform matrix
 *    in the form given by the CSS transform property, i.e. just like the
 *    output from [[FirminCSSMatrix#toString]].
 **/
FirminCSSMatrix = function(domstr) {
  this.m11 = this.m22 = this.m33 = this.m44 = 1;
  
         this.m12 = this.m13 = this.m14 =
  this.m21 =        this.m23 = this.m24 =
  this.m31 = this.m32 =      this.m34 =
  this.m41 = this.m42 = this.m43        = 0;
  
  if (typeof domstr == "string") {
    this.setMatrixValue(domstr);
  }
};

/**
 *  FirminCSSMatrix.displayName = "FirminCSSMatrix"
 **/
FirminCSSMatrix.displayName = "FirminCSSMatrix";

/**
 *  FirminCSSMatrix.degreesToRadians(angle) -> Number
 *  - angle (Number): an angle in degrees.
 *
 *  Converts angles in degrees, which are used by the external API, to angles
 *  in radians used in internal calculations.
 **/
FirminCSSMatrix.degreesToRadians = function(angle) {
  return angle * Math.PI / 180;
};

/**
 *  FirminCSSMatrix.determinant2x2(a, b, c, d) -> Number
 *  - a (Number): top-left value of the matrix.
 *  - b (Number): top-right value of the matrix.
 *  - c (Number): bottom-left value of the matrix.
 *  - d (Number): bottom-right value of the matrix.
 *
 *  Calculates the determinant of a 2x2 matrix.
 **/
FirminCSSMatrix.determinant2x2 = function(a, b, c, d) {
  return a * d - b * c;
};

/**
 *  FirminCSSMatrix.determinant3x3(matrix) -> Number
 *  - a1 (Number): matrix value in position [1, 1].
 *  - a2 (Number): matrix value in position [1, 2].
 *  - a3 (Number): matrix value in position [1, 3].
 *  - b1 (Number): matrix value in position [2, 1].
 *  - b2 (Number): matrix value in position [2, 2].
 *  - b3 (Number): matrix value in position [2, 3].
 *  - c1 (Number): matrix value in position [3, 1].
 *  - c2 (Number): matrix value in position [3, 2].
 *  - c3 (Number): matrix value in position [3, 3].
 *
 *  Calculates the determinant of a 3x3 matrix.
 **/
FirminCSSMatrix.determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3) {
  var determinant2x2 = FirminCSSMatrix.determinant2x2;
  return a1 * determinant2x2(b2, b3, c2, c3) -
       b1 * determinant2x2(a2, a3, c2, c3) +
       c1 * determinant2x2(a2, a3, b2, b3);
};

/**
 *  FirminCSSMatrix.determinant4x4(matrix) -> Number
 *  - matrix (FirminCSSMatrix): the matrix to calculate the determinant of.
 *
 *  Calculates the determinant of a 4x4 matrix.
 **/
FirminCSSMatrix.determinant4x4 = function(m) {
  var determinant3x3 = FirminCSSMatrix.determinant3x3,
  
  // Assign to individual variable names to aid selecting correct elements
  a1 = m.m11, b1 = m.m21, c1 = m.m31, d1 = m.m41,
  a2 = m.m12, b2 = m.m22, c2 = m.m32, d2 = m.m42,
  a3 = m.m13, b3 = m.m23, c3 = m.m33, d3 = m.m43,
  a4 = m.m14, b4 = m.m24, c4 = m.m34, d4 = m.m44;
  
  return a1 * determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4) -
       b1 * determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4) +
       c1 * determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4) -
       d1 * determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
};

/**
 *  FirminCSSMatrix#a -> Number
 *  The first 2D vector value.
 **/

/**
 *  FirminCSSMatrix#b -> Number
 *  The second 2D vector value.
 **/

/**
 *  FirminCSSMatrix#c -> Number
 *  The third 2D vector value.
 **/

/**
 *  FirminCSSMatrix#d -> Number
 *  The fourth 2D vector value.
 **/

/**
 *  FirminCSSMatrix#e -> Number
 *  The fifth 2D vector value.
 **/

/**
 *  FirminCSSMatrix#f -> Number
 *  The sixth 2D vector value.
 **/

/**
 *  FirminCSSMatrix#m11 -> Number
 *  The 3D matrix value in the first row and first column.
 **/

/**
 *  FirminCSSMatrix#m12 -> Number
 *  The 3D matrix value in the first row and second column.
 **/

/**
 *  FirminCSSMatrix#m13 -> Number
 *  The 3D matrix value in the first row and third column.
 **/

/**
 *  FirminCSSMatrix#m14 -> Number
 *  The 3D matrix value in the first row and fourth column.
 **/

/**
 *  FirminCSSMatrix#m21 -> Number
 *  The 3D matrix value in the second row and first column.
 **/

/**
 *  FirminCSSMatrix#m22 -> Number
 *  The 3D matrix value in the second row and second column.
 **/

/**
 *  FirminCSSMatrix#m23 -> Number
 *  The 3D matrix value in the second row and third column.
 **/

/**
 *  FirminCSSMatrix#m24 -> Number
 *  The 3D matrix value in the second row and fourth column.
 **/

/**
 *  FirminCSSMatrix#m31 -> Number
 *  The 3D matrix value in the third row and first column.
 **/

/**
 *  FirminCSSMatrix#m32 -> Number
 *  The 3D matrix value in the third row and second column.
 **/

/**
 *  FirminCSSMatrix#m33 -> Number
 *  The 3D matrix value in the third row and third column.
 **/

/**
 *  FirminCSSMatrix#m34 -> Number
 *  The 3D matrix value in the third row and fourth column.
 **/

/**
 *  FirminCSSMatrix#m41 -> Number
 *  The 3D matrix value in the fourth row and first column.
 **/

/**
 *  FirminCSSMatrix#m42 -> Number
 *  The 3D matrix value in the fourth row and second column.
 **/

/**
 *  FirminCSSMatrix#m43 -> Number
 *  The 3D matrix value in the fourth row and third column.
 **/

/**
 *  FirminCSSMatrix#m44 -> Number
 *  The 3D matrix value in the fourth row and fourth column.
 **/

[["m11", "a"],
 ["m12", "b"],
 ["m21", "c"],
 ["m22", "d"],
 ["m41", "e"],
 ["m42", "f"]].forEach(function(pair) {
  var key3d = pair[0], key2d = pair[1];
  
  Object.defineProperty(FirminCSSMatrix.prototype, key2d, {
    set: function(val) {
      this[key3d] = val;
    },
    
    get: function() {
      return this[key3d];
    }
  });
});

/**
 *  FirminCSSMatrix#isAffine() -> Boolean
 *
 *  Determines whether the matrix is affine.
 **/
FirminCSSMatrix.prototype.isAffine = function() {
  return this.m13 === 0 && this.m14 === 0 &&
       this.m23 === 0 && this.m24 === 0 &&
       this.m31 === 0 && this.m32 === 0 &&
       this.m33 === 1 && this.m34 === 0 &&
       this.m43 === 0 && this.m44 === 1;
};

/**
 *  FirminCSSMatrix#multiply(otherMatrix) -> FirminCSSMatrix
 *  - otherMatrix (FirminCSSMatrix): the matrix to multiply this one by.
 *
 *  Multiplies the matrix by a given matrix and returns the result.
 **/
FirminCSSMatrix.prototype.multiply = function(otherMatrix) {
  var a = otherMatrix,
    b = this,
    c = new FirminCSSMatrix();
  
  c.m11 = a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41;
  c.m12 = a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42;
  c.m13 = a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43;
  c.m14 = a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44;
  
  c.m21 = a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41;
  c.m22 = a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42;
  c.m23 = a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43;
  c.m24 = a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44;
  
  c.m31 = a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41;
  c.m32 = a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42;
  c.m33 = a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43;
  c.m34 = a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44;
  
  c.m41 = a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41;
  c.m42 = a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42;
  c.m43 = a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43;
  c.m44 = a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44;
  
  return c;
};

/**
 *  FirminCSSMatrix#isIdentityOrTranslation() -> Boolean
 *
 *  Returns whether the matrix is the identity matrix or a translation matrix.
 **/
FirminCSSMatrix.prototype.isIdentityOrTranslation = function() {
  var t = this;
  return t.m11 === 1 && t.m12 === 0 && t.m13 === 0 && t.m14 === 0 &&
       t.m21 === 0 && t.m22 === 1 && t.m23 === 0 && t.m24 === 0 &&
       t.m31 === 0 && t.m31 === 0 && t.m33 === 1 && t.m34 === 0 &&
  /* m41, m42 and m43 are the translation points */ t.m44 === 1;
};

/**
 *  FirminCSSMatrix#adjoint() -> FirminCSSMatrix
 *
 *  Returns the adjoint matrix.
 **/
FirminCSSMatrix.prototype.adjoint = function() {
  var result = new FirminCSSMatrix(), t = this,
    determinant3x3 = FirminCSSMatrix.determinant3x3,
    
    a1 = t.m11, b1 = t.m12, c1 = t.m13, d1 = t.m14,
    a2 = t.m21, b2 = t.m22, c2 = t.m23, d2 = t.m24,
    a3 = t.m31, b3 = t.m32, c3 = t.m33, d3 = t.m34,
    a4 = t.m41, b4 = t.m42, c4 = t.m43, d4 = t.m44;
  
  // Row column labeling reversed since we transpose rows & columns
  result.m11 =  determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
  result.m21 = -determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
  result.m31 =  determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
  result.m41 = -determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
  
  result.m12 = -determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
  result.m22 =  determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
  result.m32 = -determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
  result.m42 =  determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);
  
  result.m13 =  determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
  result.m23 = -determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
  result.m33 =  determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
  result.m43 = -determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);
  
  result.m14 = -determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
  result.m24 =  determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
  result.m34 = -determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
  result.m44 =  determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
  
  return result;
};

/**
 *  FirminCSSMatrix#inverse() -> FirminCSSMatrix | null
 *
 *  If the matrix is invertible, returns its inverse, otherwise returns null.
 **/
FirminCSSMatrix.prototype.inverse = function() {
  var inv, det, result, i, j;
  
  if (this.isIdentityOrTranslation()) {
    inv = new FirminCSSMatrix();
    
    if (!(this.m41 === 0 && this.m42 === 0 && this.m43 === 0)) {
      inv.m41 = -this.m41;
      inv.m42 = -this.m42;
      inv.m43 = -this.m43;
    }
    
    return inv;
  }
  
  // Calculate the adjoint matrix
  result = this.adjoint();
  
  // Calculate the 4x4 determinant
  det = FirminCSSMatrix.determinant4x4(this);
  
  // If the determinant is zero, then the inverse matrix is not unique
  if (Math.abs(det) < 1e-8) return null;
  
  // Scale the adjoint matrix to get the inverse
  for (i = 1; i < 5; i++) {
    for (j = 1; j < 5; j++) {
      result[("m" + i) + j] /= det;
    }
  }
  
  return result;
};

/**
 *  FirminCSSMatrix#rotate(rotX, rotY, rotZ) -> FirminCSSMatrix
 *  - rotX (Number): the rotation around the x axis.
 *  - rotY (Number): the rotation around the y axis. If undefined, the x
 *    component is used.
 *  - rotZ (Number): the rotation around the z axis. If undefined, the x
 *    component is used.
 *
 *  Returns the result of rotating the matrix by a given vector.
 *
 *  If only the first argument is provided, the matrix is only rotated about
 *  the z axis.
 **/
FirminCSSMatrix.prototype.rotate = function(rx, ry, rz) {
  var degreesToRadians = FirminCSSMatrix.degreesToRadians;
  
  if (typeof rx != "number" || isNaN(rx)) rx = 0;
  
  if ((typeof ry != "number" || isNaN(ry)) &&
    (typeof rz != "number" || isNaN(rz))) {
    rz = rx;
    rx = 0;
    ry = 0;
  }
  
  if (typeof ry != "number" || isNaN(ry)) ry = 0;
  if (typeof rz != "number" || isNaN(rz)) rz = 0;
  
  rx = degreesToRadians(rx);
  ry = degreesToRadians(ry);
  rz = degreesToRadians(rz);
  
  var tx = new FirminCSSMatrix(),
    ty = new FirminCSSMatrix(),
    tz = new FirminCSSMatrix(),
    sinA, cosA, sinA2;
  
  rz /= 2;
  sinA = Math.sin(rz);
  cosA = Math.cos(rz);
  sinA2 = sinA * sinA;
  
  // Matrices are identity outside the assigned values
  tz.m11 = tz.m22 = 1 - 2 * sinA2;
  tz.m12 = tz.m21 = 2 * sinA * cosA;
  tz.m21 *= -1;
  
  ry /= 2;
  sinA  = Math.sin(ry);
  cosA  = Math.cos(ry);
  sinA2 = sinA * sinA;
  
  ty.m11 = ty.m33 = 1 - 2 * sinA2;
  ty.m13 = ty.m31 = 2 * sinA * cosA;
  ty.m13 *= -1;
  
  rx /= 2;
  sinA = Math.sin(rx);
  cosA = Math.cos(rx);
  sinA2 = sinA * sinA;
  
  tx.m22 = tx.m33 = 1 - 2 * sinA2;
  tx.m23 = tx.m32 = 2 * sinA * cosA;
  tx.m32 *= -1;
  
  return tz.multiply(ty).multiply(tx).multiply(this);
};

/**
 *  FirminCSSMatrix#rotateAxisAngle(rotX, rotY, rotZ, angle) -> FirminCSSMatrix
 *  - rotX (Number): the rotation around the x axis.
 *  - rotY (Number): the rotation around the y axis. If undefined, the x
 *    component is used.
 *  - rotZ (Number): the rotation around the z axis. If undefined, the x
 *    component is used.
 *  - angle (Number): the angle of rotation about the axis vector, in degrees.
 *
 *  Returns the result of rotating the matrix around a given vector by a given
 *  angle.
 *
 *  If the given vector is the origin vector then the matrix is rotated by the
 *  given angle around the z axis.
 **/
FirminCSSMatrix.prototype.rotateAxisAngle = function(x, y, z, a) {
  if (typeof x != "number" || isNaN(x)) x = 0;
  if (typeof y != "number" || isNaN(y)) y = 0;
  if (typeof z != "number" || isNaN(z)) z = 0;
  if (typeof a != "number" || isNaN(a)) a = 0;
  if (x === 0 && y === 0 && z === 0) z = 1;
  
  var t = new FirminCSSMatrix(),
    len = Math.sqrt(x * x + y * y + z * z),
    cosA, sinA, sinA2, csA, x2, y2, z2;
  
  a   = (FirminCSSMatrix.degreesToRadians(a) || 0) / 2;
  cosA  = Math.cos(a);
  sinA  = Math.sin(a);
  sinA2 = sinA * sinA;
  
  // Bad vector, use something sensible
  if (len === 0) {
    x = 0;
    y = 0;
    z = 1;
  } else if (len !== 1) {
    x /= len;
    y /= len;
    z /= len;
  }
  
  // Optimise cases where axis is along major axis
  if (x === 1 && y === 0 && z === 0) {
    t.m22 = t.m33 = 1 - 2 * sinA2;
    t.m23 = t.m32 = 2 * cosA * sinA;
    t.m32 *= -1;
  } else if (x === 0 && y === 1 && z === 0) {
    t.m11 = t.m33 = 1 - 2 * sinA2;
    t.m13 = t.m31 = 2 * cosA * sinA;
    t.m13 *= -1;
  } else if (x === 0 && y === 0 && z === 1) {
    t.m11 = t.m22 = 1 - 2 * sinA2;
    t.m12 = t.m21 = 2 * cosA * sinA;
    t.m21 *= -1;
  } else {
    csA = sinA * cosA;
    x2  = x * x;
    y2  = y * y;
    z2  = z * z;
    
    t.m11 = 1 - 2 * (y2 + z2) * sinA2;
    t.m12 = 2 * (x * y * sinA2 + z * csA);
    t.m13 = 2 * (x * z * sinA2 - y * csA);
    t.m21 = 2 * (y * x * sinA2 - z * csA);
    t.m22 = 1 - 2 * (z2 + x2) * sinA2;
    t.m23 = 2 * (y * z * sinA2 + x * csA);
    t.m31 = 2 * (z * x * sinA2 + y * csA);
    t.m32 = 2 * (z * y * sinA2 - x * csA);
    t.m33 = 1 - 2 * (x2 + y2) * sinA2;
  }
  
  return this.multiply(t);
};

/**
 *  FirminCSSMatrix#scale(scaleX, scaleY, scaleZ) -> FirminCSSMatrix
 *  - scaleX (Number): the scaling factor in the x axis.
 *  - scaleY (Number): the scaling factor in the y axis. If undefined, the x
 *    component is used.
 *  - scaleZ (Number): the scaling factor in the z axis. If undefined, 1 is
 *    used.
 *
 *  Returns the result of scaling the matrix by a given vector.
 **/
FirminCSSMatrix.prototype.scale = function(scaleX, scaleY, scaleZ) {
  var transform = new FirminCSSMatrix();
  
  if (typeof scaleX != "number" || isNaN(scaleX)) scaleX = 1;
  if (typeof scaleY != "number" || isNaN(scaleY)) scaleY = scaleX;
  if (typeof scaleZ != "number" || isNaN(scaleZ)) scaleZ = 1;
  
  transform.m11 = scaleX;
  transform.m22 = scaleY;
  transform.m33 = scaleZ;
  
  return this.multiply(transform);
};

/**
 *  FirminCSSMatrix#translate(x, y, z) -> FirminCSSMatrix
 *  - x (Number): the x component of the vector.
 *  - y (Number): the y component of the vector.
 *  - z (Number): the z component of the vector. If undefined, 0 is used.
 *
 *  Returns the result of translating the matrix by a given vector.
 **/
FirminCSSMatrix.prototype.translate = function(x, y, z) {
  var t = new FirminCSSMatrix();
  
  if (typeof x != "number" || isNaN(x)) x = 0;
  if (typeof y != "number" || isNaN(y)) y = 0;
  if (typeof z != "number" || isNaN(z)) z = 0;
  
  t.m41 = x;
  t.m42 = y;
  t.m43 = z;
  
  return this.multiply(t);
};

/**
 *  FirminCSSMatrix#setMatrixValue(domstr) -> undefined
 *  - domstr (String): a string representation of a 2D or 3D transform matrix
 *    in the form given by the CSS transform property, i.e. just like the
 *    output from [[FirminCSSMatrix#toString]].
 *
 *  Sets the matrix values using a string representation, such as that produced
 *  by the [[FirminCSSMatrix#toString]] method.
 **/
FirminCSSMatrix.prototype.setMatrixValue = function(domstr) {
    domstr = domstr.trim();
  var mstr   = domstr.match(/^matrix(3d)?\(\s*(.+)\s*\)$/),
    is3d, chunks, len, points, i, chunk;
  
  if (!mstr) return;
  
  is3d   = !!mstr[1];
  chunks = mstr[2].split(/\s*,\s*/);
  len    = chunks.length;
  points = new Array(len);
  
  if ((is3d && len !== 16) || !(is3d || len === 6)) return;
  
  for (i = 0; i < len; i++) {
    chunk = chunks[i];
    if (chunk.match(/^-?\d+(\.\d+)?$/)) {
      points[i] = parseFloat(chunk);
    } else return;
  }
  
  for (i = 0; i < len; i++) {
    point = is3d ?
      ("m" + (Math.floor(i / 4) + 1)) + (i % 4 + 1) :
      String.fromCharCode(i + 97); // ASCII char 97 == 'a'
    this[point] = points[i];
  }
};

/**
 *  FirminCSSMatrix#toString() -> String
 *
 *  Returns a string representation of the matrix.
 **/
FirminCSSMatrix.prototype.toString = function() {
  var self = this, points, prefix;
  
  if (this.isAffine()) {
    prefix = "matrix(";
    points = ["a", "b", "c", "d", "e", "f"];
  } else {
    prefix = "matrix3d(";
    points = ["m11", "m12", "m13", "m14",
          "m21", "m22", "m23", "m24",
          "m31", "m32", "m33", "m34",
          "m41", "m42", "m43", "m44"];
  }
  
  return prefix + points.map(function(p) {
    return self[p].toFixed(6);
  }).join(", ") + ")";
};/**
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

var document = (typeof window != "undefined")?window.document:null;

/**
 *  @private
 */
var vs = window.vs,
  util = vs.util;

/**
 * Create our "vsTest" element and style that we do most feature tests on.
 * @private
 */
var vsTestElem = (document)?document.createElement ('vstestelem'):null;

/**
 * @private
 */
var vsTestStyle = (vsTestElem)?vsTestElem.style:null;
var __date_reg_exp = /\/Date\((-?\d+)\)\//;

if (vsTestStyle)
{
  if (vsTestStyle.webkitTransform !== undefined)
    vs.SUPPORT_3D_TRANSFORM =
      'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix ();
      
  else if (vsTestStyle.MozTransform !== undefined) 
    vs.SUPPORT_3D_TRANSFORM = 'MozPerspective' in vsTestStyle;

  else if (vsTestStyle.msTransform !== undefined) 
    vs.SUPPORT_3D_TRANSFORM =
     'MSCSSMatrix' in window && 'm11' in new MSCSSMatrix ();

  vs.CSS_VENDOR = (function () {
    var vendors = ['MozT', 'msT', 'OT', 'webkitT', 't'],
      transform,
      l = vendors.length;

    while (--l) {
      transform = vendors[l] + 'ransform';
      if ( transform in vsTestStyle ) return vendors[l].substr(0, vendors[l].length-1);
    }

    return null;
  })();
}

vs.SUPPORT_CSS_TRANSFORM = (vs.CSS_VENDOR !== null) ? true : false;

/**
 * Represents a 4×4 homogeneous matrix that enables Document Object Model (DOM)
 * scripting access to Cascading Style Sheets (CSS) 2-D and 3-D Transforms
 * functionality.
 * @public
 * @memberOf vs
 */
vs.CSSMatrix = ('WebKitCSSMatrix' in window)?window.WebKitCSSMatrix:
  ('MSCSSMatrix' in window)?window.MSCSSMatrix:FirminCSSMatrix;

/**
 * Tells the browser that you wish to perform an animation and requests
 * that the browser schedule a repaint of the window for the next animation
 * frame. The method takes as an argument a callback to be invoked before
 * the repaint.
 *
 * @public
 * @function
 * @memberOf vs
 *
 * @param {Function} callback A parameter specifying a function to call
 *        when it's time to update your animation for the next repaint.
 */
vs.requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) { window.setTimeout (callback, 1000 / 60); };

vs.cancelRequestAnimationFrame = window.cancelRequestAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.oCancelAnimationFrame ||
  window.msCancelAnimationFrame ||
  clearTimeout;

/********************************************************************

*********************************************************************/

/**
 * extend with __defineSetter__/__defineGetter__ compatible API
 *
 * @private
 */
function _extend_api1 (destination, source)
{
  for (var property in source)
  {
    getter = source.__lookupGetter__ (property);
    setter = source.__lookupSetter__ (property);

    if (getter)
    {
      destination.__defineGetter__ (property, getter)
    }
    if (setter)
    {
      destination.__defineSetter__ (property, setter)
    }
    if (!getter && !setter)
    {
      destination [property] = source [property];
    }
  }
  return destination;
}

/**
 * extend with Object.defineProperty compatible API
 *
 * @private
 */
function _extend_api2 (destination, source)
{
  for (var property in source)
  {
    var desc = Object.getOwnPropertyDescriptor (source, property);
    
    if (desc && (desc.get || desc.set))
    {
      util.defineProperty (destination, property, desc);
    }
    else
    {
      destination [property] = source [property];
    }
  }
  return destination;
}

/**
 * Copies all properties from the source to the destination object.
 *
 * @memberOf vs.util
 *
 * @param {Object} destination The object to receive the new properties.
 * @param {Object} source The object whose properties will be duplicated.
 **/
vs.util.extend = (Object.defineProperty)?_extend_api2:_extend_api1;

/**
 * Extends a the prototype of a object
 *
 * @memberOf vs.util
 *
 * @param {Object} destination The Class to receive the new properties.
 * @param {Object} source The Class whose properties will be duplicated.
 **/
var extendClass = function (obj, extension)
{
  if (!obj || !extension) { return; }
  if (!obj.prototype || !extension.prototype) { return; }
  
  try
  {
    if (Object.__proto__)
    {
      obj.prototype.__proto__ = extension.prototype;      
    }
    else
    {
      var proto = obj.prototype;
      obj.prototype = new extension ();

      util.extend (obj.prototype, proto);
    }
    
    if (!obj._properties_) obj._properties_ = [];
    if (extension._properties_)
    {
      obj._properties_ = obj._properties_.concat (extension._properties_);
    }

    return obj;
  }
  catch (e)
  {
    console.error (e.message ());
  }
}

/**
 * Free a ViniSketch object
 *
 * @memberOf vs.util
 *
 * @param {Object} obj the object to free
 */
function free (obj)
{
  if (!obj) { return; }
  if (obj._free) { obj._free (); }
  if (obj.destructor) { obj.destructor (); }
  delete (obj);
  obj = null;
}

/**
 * Defines a new property directly on an object, or modifies an existing
 * property on an object.<br/><br/>
 *
 * Property descriptors present in objects come in two main flavors: data
 * descriptors and accessor descriptors. A data descriptor is a property that
 * has a value, which may or may not be writable. An accessor descriptor is a
 * property described by a getter-setter pair of functions. A descriptor must be
 * one of these two flavors; it cannot be both. All descriptors regardless of
 * flavor include the configurable and enumerable fields.<br/><br/>
 *
 * A property descriptor is an object with the following fields:
 * <ul>
 * <ol> <b>value</b> The value associated with the property. (data descriptors
 * only). <br/><i>Defaults to undefined.</i></ol>
 * <ol> <b>writable</b> True if and only if the value associated with the
 * property may be changed. (data descriptors only).<br/>
 * <i>Defaults to false.</ol>
 * <ol> <b>get</b> A function which serves as a getter for the property, or
 * undefined if there is no getter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>set</b> A function which serves as a setter for the property, or
 * undefined if there is no setter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>configurable</b> True if and only if the type of this property
 * descriptor may be changed and if the property may be deleted from the
 * corresponding object.<br/><i>Defaults to true.</i></ol>
 * <ol> <b>enumerable</b> True if and only if this property shows up during
 * enumeration of the properties on the corresponding object. <br/>
 * Defaults to true.</i></ol></ul>
 *
 * @memberOf vs.util
 *
 * @param {Object} obj The object on which to define the property.
 * @param {String} prop_name The name of the property to be defined or modified.
 * @param {Object} desc The descriptor for the property being defined or
 * modified
 */


/**
 * defineProperty with __defineSetter__/__defineGetter__ API
 *
 * @private
 */
function _defineProperty_api1 (obj, prop_name, desc)
{
  function hasProperty (obj, prop)
  {
    return Object.prototype.hasOwnProperty.call (obj, prop);
  }

  if (hasProperty (desc, "set"))
  {
    var s = desc.set;
    if (isFunction (s)) obj.__defineSetter__(prop_name, s);
  }

  if (hasProperty (desc, "get"))
  {
    var s = desc.get;
    if (isFunction (s)) obj.__defineGetter__(prop_name, s);
  }
}

/**
 * defineProperty with Object.defineProperty API
 *
 * @private
 */
function _defineProperty_api2 (obj, prop_name, desc)
{
  function hasProperty (obj, prop)
  {
    return Object.prototype.hasOwnProperty.call (obj, prop);
  }

  if (typeof desc != "object" || desc === null)
  {
    throw new TypeError ("bad desc");
  }
  
  if (typeof prop_name != "string" || prop_name === null)
  {
    throw new TypeError ("bad property name");
  }
  
  var d = {};
  
  if (hasProperty (desc, "enumerable")) d.enumerable = !!desc.enumerable;
  else d.enumerable = true; 
  if (hasProperty (desc, "configurable")) d.configurable = !!desc.configurable;
  else d.configurable = true; 
  if (hasProperty (desc, "value")) d.value = desc.value;
  if (hasProperty (desc, "writable")) d.writable = !!desc.writable;
  if (hasProperty (desc, "get"))
  {
    var g = desc.get;
    if (isFunction (g)) d.get = g;
  }
  if (hasProperty (desc, "set"))
  {
    var s = desc.set;
    if (isFunction (s)) d.set = s;
  }

  if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
    throw new TypeError("identity-confused descriptor");

  Object.defineProperty (obj, prop_name, d);
}

/**
 * Defines a new property directly on the object's prototype, or modifies an 
 * existing property on an object's prototype.<br/><br/>
 *
 * Property descriptors present in objects come in two main flavors: data
 * descriptors and accessor descriptors. A data descriptor is a property that
 * has a value, which may or may not be writable. An accessor descriptor is a
 * property described by a getter-setter pair of functions. A descriptor must be
 * one of these two flavors; it cannot be both. All descriptors regardless of
 * flavor include the configurable and enumerable fields.<br/><br/>
 *
 * A property descriptor is an object with the following fields:
 * <ul>
 * <ol> <b>value</b> The value associated with the property. (data descriptors
 * only). <br/><i>Defaults to undefined.</i></ol>
 * <ol> <b>writable</b> True if and only if the value associated with the
 * property may be changed. (data descriptors only).<br/>
 * <i>Defaults to false.</ol>
 * <ol> <b>get</b> A function which serves as a getter for the property, or
 * undefined if there is no getter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>set</b> A function which serves as a setter for the property, or
 * undefined if there is no setter. (accessor descriptors only).<br/>
 * <i>Defaults to undefined.</i></ol>
 * <ol> <b>configurable</b> True if and only if the type of this property
 * descriptor may be changed and if the property may be deleted from the
 * corresponding object.<br/><i>Defaults to true.</i></ol>
 * <ol> <b>enumerable</b> True if and only if this property shows up during
 * enumeration of the properties on the corresponding object. <br/>
 * Defaults to true.</i></ol></ul>
 *
 * @memberOf vs.util
 *
 * @param {Object} the_class The object's prototype on which to define the 
 * property.
 * @param {String} prop_name The name of the property to be defined or modified.
 * @param {Object} desc The descriptor for the property being defined or
 * modified
 */
function defineClassProperty (the_class, prop_name, desc)
{
  if (!desc) { return; }
  if (!the_class._properties_) the_class._properties_ = [];
  if (!the_class.prototype) {
    throw ("defineClassProperty on a Class without prototype");
  }
  util.defineProperty (the_class.prototype, prop_name, desc);
  if (desc.enumerable != false) the_class._properties_.push (prop_name);
}

/**
 * @private
 */
var _keys = (typeof Object.keys === 'function')?Object.keys: function (o)
{
  var array = new Array (), key;
  for (key in o)
  {
    if (Object.prototype.hasOwnProperty.call (o, key)) { array.push (key); }
  }
  return array;
};

/**
 * Defines new or modifies existing properties directly on an 'class'.<br/><br/>
 *
 * @see vs.util.defineClassProperty
 *
 * @memberOf vs.util
 *
 * @param {Object} the_class The 'class' on which to define the property.
 * @param {Object} properties An object whose own enumerable properties
 *   constitute descriptors for the properties to be defined or modified.
 */
function defineClassProperties (the_class, properties)
{
  if (!the_class.prototype) {
    throw ("defineClassProperties on a Class without prototype");
  }

  properties = Object (properties);  
  var keys = _keys (properties);  
  for (var i = 0; i < keys.length; i++)
  {
    var prop_name = keys[i]
    var desc = properties[keys[i]];
    defineClassProperty (the_class, prop_name, desc);
  }
}

/********************************************************************
                    Object management
*********************************************************************/

/** 
 * @private
 * @const
 */
NULL_TYPE = 'Null';

/** 
 * @private
 * @const
 */
UNDEFINED_TYPE = 'Undefined';

/** 
 * @private
 * @const
 */
BOOLEAN_TYPE = 'Boolean';

/** 
 * @private
 * @const
 */
NUMBER_TYPE = 'Number';

/** 
 * @private
 * @const
 */
STRING_TYPE = 'String';

/** 
 * @private
 * @const
 */
OBJECT_TYPE = 'Object';

/** 
 * @private
 * @const
 */
BOOLEAN_CLASS = '[object Boolean]';

/** 
 * @private
 * @const
 */
NUMBER_CLASS = '[object Number]';

/** 
 * @private
 * @const
 */
STRING_CLASS = '[object String]';

/** 
 * @private
 * @const
 */
ARRAY_CLASS = '[object Array]';

/** 
 * @private
 * @const
 */
OBJECT_CLASS = '[object Object]';

/**
 * @private
 */
function clone (object)
{
  var destination;

  switch (object)
  {
    case null: return null;
    case undefined: return undefined;
  }

  switch (_toString.call (object))
  {
    case OBJECT_CLASS:
    case OBJECT_TYPE:
      destination = {};
      for (var property in object)
      {
        destination[property] = clone (object [property]);
      }
      return destination; break;
      
    case ARRAY_CLASS:
      destination = [];
      for (var i = 0; i < object.length; i++)
      {
        destination [i] = clone (object [i]);
      }
      return destination; break;

    case BOOLEAN_TYPE:
    case NUMBER_TYPE:
    case STRING_TYPE:
    case BOOLEAN_CLASS:
    case NUMBER_CLASS:
    case STRING_CLASS:
    default:
      return object; break;
  }
};

/**
 *  Returns a JSON string.
 *
 *  @memberOf vs.util
 *
 * @param {Object} value The object to be serialized.
 **/
function toJSON (value)
{
  return JSON.stringify (value);
};

/********************************************************************
                    Testing methods
*********************************************************************/

/**
 * @private
 **/
var _toString = Object.prototype.toString;

/**
 *  Returns `true` if `object` is a DOM node of type 1; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isElement(new Element('div'));
 *  //-> true
 *
 *  vs.util.isElement(document.createElement('div'));
 *  //-> true
 *      
 *  vs.util.isElement(document.createTextNode('foo'));
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isElement (object)
{
  return !!(object && object.nodeType === 1);
};
  
/**
 *  Returns `true` if `object` is an [[Array]]; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isArray([]);
 *  //-> true
 *      
 *  vs.util.isArray({ });
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isArray (object)
{
  if (typeof Array.isArray == 'function')
  {
    return Array.isArray (object);
  }
  return _toString.call (object) === ARRAY_CLASS;
};

/**
 *  Returns `true` if `object` is an Function; `false` otherwise.
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isFunction (object)
{
  return typeof object === "function";
};

/**
 *  Returns `true` if `object` is an String; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isString ("qwe");
 *  //-> true
 *      
 *  vs.util.isString (123);
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isString (object)
{
  return _toString.call (object) === STRING_CLASS;
};

/**
 *  Returns `true` if `object` is an Number; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isNumber (123);
 *  //-> true
 *      
 *  vs.util.isNumber (1.23);
 *  //-> true
 *      
 *  vs.util.isNumber ("123");
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isNumber (object)
{
  return _toString.call (object) === NUMBER_CLASS;
};

/**
 *  Returns `true` if `object` is of type `undefined`; `false` otherwise.
 *  
 *  @example
 *  
 *  vs.util.isUndefined ();
 *  //-> true
 *      
 *  vs.util.isUndefined (undefined);
 *  //-> true
 *      
 *  vs.util.isUndefined (null);
 *  //-> false
 *      
 *  vs.util.isUndefined (0);
 *  //-> false
 *
 *  @memberOf vs.util
 *
 * @param {Object} object The object to test.
 **/
function isUndefined (object)
{
  return typeof object === "undefined";
};

/********************************************************************
                    Element Class testing
*********************************************************************/

/**
 *  Checks whether element has the given CSS className.
 *
 *  <p>
 *  @example
 *  elem.hasClassName ('selected');
 *  // -> true | false
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className to check
 * @return {Boolean} true if the element has the given className
*/
function hasClassName (element, className)
{
  if (!element) { return; }
  var elementClassName = element.className;
  return (elementClassName && elementClassName.length > 0 && 
    (elementClassName === className ||
    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
}

/**
 *  Adds a CSS classname to Element.
 *
 *  @example
 *  elem.addClassName ('selected');
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className to add
*/
function addClassName ()
{
  var element = arguments [0], className, i = 1;
  if (!element) { return; }
  for (; i < arguments.length; i++)
  {
    className = arguments [i];
    if (!hasClassName(element, className))
    {
      element.className = (element.className ? element.className + ' ' : '') + className;
    }
  }
  return element;
}

/**
 *  Removes element’s CSS className
 *
 *  <p>
 *  @example
 *  elem.removeClassName ('selected');
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className to remove
*/
function removeClassName ()
{
  var element = arguments [0], className, i = 1;
  if (!element || !element.className) { return; }
  for (; i < arguments.length; i++)
  {
    className = arguments [i];
    element.className = strip (element.className.replace (
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
  }
  return element;
}

/**
 *  Toggles element’s CSS className
 *
 *  <p>
 *  @example
 *  elem.toggleClassName ('selected');
 *
 *  @memberOf vs.util
 *
 * @param {String} className the className 
*/
function toggleClassName (element, className)
{
  if (!element) { return; }
  return hasClassName(element, className) ?
    removeClassName(element, className): addClassName(element, className);
}

/********************************************************************
                    String manipulation
*********************************************************************/

/**
 * HTML-encodes a string and returns the encoded string.
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 */
function htmlEncode (str)
{
  if (!isString (str)) return '';
  
  return str.replace (/&/g, "&amp;").
    replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 *  Strips all leading and trailing whitespace from a string.
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 */
function strip (str)
{
  if (!isString (str)) return '';
  
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

/**
 *  Converts a string separated by dashes into a camelCase equivalent
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 * @return {String} the result
 */
function camelize (str)
{
  if (!isString (str)) return '';
  
  var parts = str.split ('-'), len = parts.length;
  if (len === 1) { return parts [0]; }

  var camelized = str.charAt (0) === '-'
    ? parts [0].charAt (0).toUpperCase () + parts [0].substring (1)
    : parts [0];

  for (var i = 1; i < len; i++)
    camelized += parts[i].charAt (0).toUpperCase() + parts[i].substring (1);

  return camelized;
}

/**
 *  Converts a string separated by dashes into a camelCase equivalent
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 * @return {String} the result
 */
function capitalize (str)
{
  if (!isString (str)) return '';
  
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

/**
 *  Converts a camelized string into a series of words separated by an 
 *  underscore (_).
 *
 *  @memberOf vs.util
 *
 * @param {String} str String The string
 * @return {String} the result
 */
function underscore (str)
{
  if (!isString (str)) return '';

  return str.replace (/::/g, '/')
            .replace (/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace (/([a-z\d])([A-Z])/g, '$1_$2')
            .replace (/-/g, '_')
            .toLowerCase ();
}

/**
 *  Parse a json string. <p/>
 *  This function use the JSON.parse function but it manage also 
 *  Date parsing wich is not managed by the JSON.parse
 *
 *  @memberOf vs.util
 *  @ignore
 *
 * @param {String} str String The string
 * @return {Object} the result
 */
function parseJSON (json)
{
  if (!json) return null;
  var temp = JSON.parse (json);
  
  if (!__date_reg_exp.test (json)) return temp;
  
  function manageDate (obj)
  {
    if (isString (obj))
    {
      var result = __date_reg_exp.exec (obj);
      if (result && result [1]) // JSON Date -> Date generation
      {
        obj = new Date (parseInt (result [1]));
      }
    }
    else if (isArray (obj))
    {
      for (var i = 0; i < obj.length; i++) { obj [i] = manageDate (obj [i]); }
    }
    else if (obj instanceof Date) { return obj; }
    else if (obj instanceof Object)
    {
      for (var key in obj) { obj [key] = manageDate (obj [key]); }
    }
    return obj;
  }
  return manageDate (temp);
};

/********************************************************************
                    Element management
*********************************************************************/

/**
 *  Returns the height of `element`.<br/>
 *  
 *  This method returns correct values on elements whose display is set to
 *  `none` either in an inline style rule or in an CSS stylesheet.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 *	@returns {Number} the height
 **/
function getElementHeight (elem)
{
  if (!isElement (elem)) return;
  
  return getElementDimensions (elem).height;
};

/**
 *  Returns the width of `element`.<br/>
 *  
 *  This method returns correct values on elements whose display is set to
 *  `none` either in an inline style rule or in an CSS stylesheet.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 *	@returns {Number} the width
 **/
function getElementWidth (elem)
{
  if (!isElement (elem)) return;
  
  return getElementDimensions (elem).width;
};

/**
 *  Finds the computed width and height of `element` and returns them as
 *  key/value pairs of an object.<br/>
 *  <p/>
 *  For backwards-compatibility, these dimensions represent the dimensions
 *  of the element's "border box" (including CSS padding and border).<br/> This
 *  is equivalent to the built-in `offsetWidth` and `offsetHeight`
 *  browser properties.
 *
 *  @memberOf vs.util
 * 
 * @param {Element} elem The element
 *	@returns {Object} the key/value width & height
 **/
function getElementDimensions (elem)
{
  if (!isElement (elem)) return {};
  
  var display = getElementStyle (elem, 'display'),
    els = elem.style, originalVisibility = els.visibility,
    originalPosition = els.position, originalDisplay = els.display,
    originalWidth = 0, originalHeight = 0;
    
  if (display !== 'none' && display !== null) // Safari bug
  {
    return {width: elem.offsetWidth, height: elem.offsetHeight};
  }
  // All *Width and *Height properties give 0 on elements with display none,
  // so enable the element temporarily
    
  els.visibility = 'hidden';
  els.position = 'absolute';
  els.display = 'block';
  
  originalWidth = elem.clientWidth;
  originalHeight = elem.clientHeight;
  els.display = originalDisplay;
  els.position = originalPosition;
  els.visibility = originalVisibility;
  
  return {width: originalWidth, height: originalHeight};
};

/**
 *  Returns the given CSS property value of `element`.<br/> The property can be
 *  specified in either its CSS form (`font-size`) or its camelized form
 *  (`fontSize`).<br/>
 *
 *  This method looks up the CSS property of an element whether it was
 *  applied inline or in a stylesheet. It works around browser inconsistencies
 *  regarding `float`, `opacity`, which returns a value between `0`
 *  (fully transparent) and `1` (fully opaque), position properties
 *  (`left`, `top`, `right` and `bottom`) and when getting the dimensions
 *  (`width` or `height`) of hidden elements.
 *  
 *  @example
 *  
 *  getElementStyle (elem, 'fontSize');
 *  // -> '12px'
 *
 *  @memberOf vs.util
 * 
 * @param {Element} elem The element
 * @param {String} style The style to find
 *	@returns {Object} the key/value width & height
 **/
function getElementStyle (elem, style)
{
  if (!isElement (elem)) return;
  
  style = style === 'float' ? 'cssFloat' : camelize (style);
  var value = elem.style[style], css;
  if (!value || value === 'auto')
  {
    css = document.defaultView.getComputedStyle (elem, null);
    value = css ? css[style] : null;
  }
  if (style === 'opacity') { return value ? parseFloat (value) : 1.0; }
  return value === 'auto' ? null : value;
};

/**
 *  Modifies `element`'s CSS style properties. Styles are passed as a hash of
 *  property-value pairs in which the properties are specified in their
 *  camelized form.
 *
 * @example
 * setElementStyle ({color: 'red', display: 'block'});
 * // add/set color and display properties
 * setElementStyle ({color: undefined});
 * // remove color property
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Object} style The style to modify
 */
function setElementStyle (elem, styles)
{
  if (!isElement (elem)) return;
  
  var elementStyle = elem.style, property;

  for (property in styles)
  {
    if (property === 'opacity')
    { 
      setElementOpacity (elem, styles[property]);
    }
    else
    {
      if (!styles [property])
      {
        elementStyle.removeProperty (property);
      }
      elementStyle[(property === 'float' || property === 'cssFloat') ?
        (isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
          property] = styles[property];
    }
  }
};

/** 
 *  Sets the visual opacity of an element while working around inconsistencies
 *  in various browsers. The `opacity` argument should be a floating point
 *  number, where the value of `0` is fully transparent and `1` is fully opaque.
 *  
 *  @example
 *  // set to 50% transparency
 *  setElementOpacity (element, 0.5);
 *      
 *  // these are equivalent, but allow for setting more than
 *  // one CSS property at once:
 *  setElementStyle (element, { opacity: 0.5 });
 *  setElementStyle (element, "opacity: 0.5");
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Number} value The opacity
 **/
function setElementOpacity (elem, value)
{
  if (!isElement (elem)) return;
  var elementStyle = elem.style;
  
  if (isUndefined (value)) elementStyle.removeProperty ('opacity');
  
  elementStyle.opacity = (value === 1 || value === '') ? '' :
    (value < 0.00001) ? 0 : value;
};

/** 
 *  Returns the opacity of the element.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @return {Number} value The opacity
 **/
function getElementOpacity (elem)
{
  if (!isElement (elem)) return;
  
  return getElementStyle (elem, 'opacity');
};

/**
 * Compute the elements position in terms of the window viewport
 * Returns a key/value object {x, y}
 *
 *  @memberOf vs.util
 *
 * @return {Object} the x,y absolute position of a element
 **/
function getElementAbsolutePosition (element)
{
  if (!element)
  { return null; }
  if (element.getBoundingClientRect)
  {
    var rec = element.getBoundingClientRect ();
    if (rec) { return { x:rec.left, y:rec.top }; } 
  }
  var x = 0;
  var y = 0;
  var parent = element;
  while (parent)
  {
     var borderXOffset = 0;
     var borderYOffset = 0;
     if (parent != element)
     {
        borderXOffset = parseInt (
          parent.currentStyle?
          parent.currentStyle ["borderLeftWidth"]:0, 0);
        borderYOffset = parseInt (
          parent.currentStyle?
          parent.currentStyle ["borderTopWidth"]:0, 0);
        borderXOffset = isNaN (borderXOffset) ? 0 : borderXOffset;
        borderYOffset = isNaN (borderYOffset) ? 0 : borderYOffset;
     }

     x += parent.offsetLeft - parent.scrollLeft + borderXOffset;
     y += parent.offsetTop - parent.scrollTop + borderYOffset;
     parent = parent.offsetParent;
  }
  return { x:x, y:y };
}

/**
 * @private
 */
function _getBoundingClientRect_api1 (e) 
{
  var rec = getElementAbsolutePosition (e);
  return {
    width: e.offsetWidth,
    height: e.offsetWidth,
    left: rec.x,
    top: rec.y
  }
};

/**
 * @private
 */
function _getBoundingClientRect_api2 (e)
{
  return (e && e.getBoundingClientRect)?e.getBoundingClientRect ():null;
};

/** 
 *  Set the absolute element position.
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Number} x The element left position
 * @param {Number} y The element top position
 **/
function setElementPos (elem, x, y)
{
  if (!elem) { return; }
  var elementStyle = elem.style;
  
  elementStyle.left = x + 'px';
  elementStyle.top = y + 'px';
}

/** 
 * Set the element size
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {Number} w The element width
 * @param {Number} w The element height
 **/
function setElementSize (elem, w, h)
{
  if (!elem) { return; }
  var elementStyle = elem.style;
  
  elementStyle.width = w + 'px';
  elementStyle.height = h + 'px';
}

/** 
 *  Set the element HTML visibility
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {boolean} v True if the element should be visible or false
 **/
function setElementVisibility (elem, v)
{
  if (!elem) { return; }
  var elementStyle = elem.style;
  
  if (elementStyle || util.isString (elem.innerHTML))
  {
    if (v)
    {
      elementStyle.visibility = 'visible';
    }
    else
    {
      elementStyle.visibility = 'hidden';
    }
  }
//  else if (elem instanceof CharacterData)
//  {}
  else // SVG
  {
    if (v)
    {
      elem.setAttribute ('visibility', 'visible');
    }
    else
    {
      elem.setAttribute ('visibility', 'hidden');
    }
  }
}

/** 
 *  Return true if the element is visible, false otherwise
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @return {boolean}
 **/
function isElementVisible (elem)
{
  if (!elem) { return false; }
  var elementStyle = elem.style;
  
  if (elementStyle || util.isString (elem.innerHTML))
  {
    if (elementStyle.visibility === 'hidden') { return false; }
    else { return true; }
  }
  else if (elem instanceof CharacterData)
  {
    return true;
  }
  else // SVG
  {
    if (elem.getAttribute ('visibility') === 'hidden') { return false; }
    else { return true; }
  }
}

/** 
 *  Remove all element children
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 **/
function removeAllElementChild (elem)
{
  if (!elem) { return; }
  
  while (elem.firstChild)
  {
    elem.removeChild (elem.firstChild);
  }
};

/** 
 *  Set inner content of a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {String} txt The text
 **/
function setElementInnerText (elem, text)
{
  if (!elem) { return; }
  
  removeAllElementChild (elem); //... deroule
  
  if (!util.isString (text))
  {
    if (text === undefined) { text = ""; }
    else if (text === null) { text = ""; }
    else if (util.isNumber (text)) { text = "" + text; }
    else if (text.toString) { text = text.toString (); }
    else { text = ""; }
  }
  var lines = text.split ('\n'), i = 0;
  if (!lines.length) { return; }
  elem.appendChild (document.createTextNode (lines [i]));
  i++;
  for (; i < lines.length; i++)
  {
    elem.appendChild (document.createElement ('br'));
    elem.appendChild (document.createTextNode (lines [i]));
  }
};

/**
 *@private
 */
function setElementWebkitTransform (elem, transform)
{
  if (elem && elem.style) elem.style.webkitTransform = transform;
  else console.warn ("setElementTransform, elem null or without style");
}

/**
 *@private
 */
function getElementWebkitTransform (elem, transform)
{
  if (elem) return window.getComputedStyle (elem).webkitTransform;
}

/**
 *@private
 */
function setElementMSTransform (elem, transform)
{
  if (elem && elem.style) elem.style.msTransform = transform;
  else console.warn ("setElementTransform, elem null or without style");
}

/**
 *@private
 */
function getElementMSTransform (elem, transform)
{
  if (elem) return window.getComputedStyle (elem).msTransform;
}

/**
 *@private
 */
function setElementMozTransform (elem, transform)
{
  if (elem && elem.style) elem.style.MozTransform = transform;
  else console.warn ("setElementTransform, elem null or without style");
}

/**
 *@private
 */
function getElementMozTransform (elem, transform)
{
  if (elem) return window.getComputedStyle (elem).MozTransform;
}

/** 
 *  Set the CSS transformation to a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {String} transform css transformations
 **/
var setElementTransform;

/** 
 *  get the CSS transformation to a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @return {Transform} transform css transformations
 **/
var getElementTransform;

if (vsTestStyle && vsTestStyle.webkitTransform !== undefined)
{
  setElementTransform = setElementWebkitTransform;
  getElementTransform = getElementWebkitTransform;
}  
else if (vsTestStyle && vsTestStyle.msTransform !== undefined)
{
  setElementTransform = setElementMSTransform;
  getElementTransform = getElementMSTransform;
}
else if (vsTestStyle && vsTestStyle.MozTransform !== undefined)
{
  setElementTransform = setElementMozTransform;
  getElementTransform = getElementMozTransform;
}

/** 
 *  Set the CSS transformation to a element
 *
 *  @memberOf vs.util
 *
 * @param {Element} elem The element
 * @param {String} origin. The value is a CSS string. Ex: '50% 0%',
 *                 or '10px 10px'
 **/
function setElementTransformOrigin (elem, value)
{
  if (elem && elem.style) 
  {
    elem.style ['-' + vs.CSS_VENDOR.toLowerCase () + '-transform-origin'] = value;
  }
  else console.warn ("setElementTransformOrigin, elem null or without style");
}

/********************************************************************
                    Array extension
*********************************************************************/

/**
 * Removes the elements in the specified interval of this Array.<br/> 
 * Shifts any subsequent elements to the left (subtracts one from their indices).<br/>
 * This method extends the JavaScript Array prototype.
 * By John Resig (MIT Licensed)
 *
 * @param {int} from Index of the first element to be removed
 * @param {int} to Index of the last element to be removed
 */
Array.prototype._remove = function (from, to)
{
  var rest = this.slice ((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply (this, rest);
};


/**
 * @private
 */
var _findItem = function (obj, from)
{
  var len = this.length;

  var from = from?from:0;
  from = (from < 0)? 0: from;

  while (from < len)
  {
    if (this [from] === obj) { return from; }
    from++;
  }
  return -1;
};

/**
 *  Find an element into this Array.
 *
 * @param {Object} obj Element to locate in the array
 * @param {number} fromIndex The index at which to begin the search. 
 *    Defaults to 0, i.e. the whole array will be searched.
 *    If the index is greater than or equal to the length of the 
 *    array, -1 is returned
 * @return {int} the Index of the element. Return -1 if unfound.
 */
Array.prototype.findItem = Array.prototype.indexOf? 
Array.prototype.indexOf:_findItem;

/**
 * Removes the elements in the specified interval of this Array.<br/> 
 * Shifts any subsequent elements to the left (subtracts one from their indices).<br/>
 * This method extends the JavaScript Array prototype.
 *
 * @param {int} from Index of the first element to be removed
 * @param {int} to Index of the last element to be removed
 * @return {Array} the modified array
 */
Array.prototype.remove = function (from, to)
{
  if ((typeof(from) === "object") || util.isString (from))
  {
    var i = 0;
    while (i < this.length)
    {
      if (this[i] === from) { this._remove (i); }
      else { i++; }
    }
  }
  else { this._remove (from, to); }
  return this;
};

/**
 * Removes all elements of this Array.<br/> 
 *
 * @return {Array} the modified array
 */
Array.prototype.removeAll = function ()
{
  while (this.length > 0) { this._remove (0); }
  return this;
};

/**
 * Return a copy of the array 
 *
 * @return {Array} the modified array
 */
Array.prototype.clone = function ()
{
  return this.slice ();
};

/********************************************************************
                         export
*********************************************************************/

/**
 * Imports a JavaScript or css file into a document
 *
 * @memberOf vs.util
 *
 * @param {String} path The file path to import
 * @param {Document} doc The document into import the file
 * @param {Function} clb A function which will be called when the file is loaded
 * @param {String} type The file type ['js', 'css']
 */
function importFile (path, doc, clb, type)
{
  if (!doc) { doc = document; }
  
  var js_effets, css_style;
  
  if (type === 'js' || path.search ('\\.js') >= 0)
  {
    js_effets = doc.createElement ("script");
    js_effets.setAttribute ("type", "text/javascript");
    js_effets.setAttribute ("src", path);
    if (clb)
    {
      js_effets.onload = function ()
      {
        clb.call (this, path);
      };
    }
    if (!doc.head) { doc.head = doc.querySelector ('head'); }
    doc.head.appendChild (js_effets);
  }
  else if (type === 'css' || path.search('\\.css') >= 0)
  {
    css_style = doc.createElement ("link");
    css_style.setAttribute ("rel", "stylesheet");
    css_style.setAttribute ("type", "text/css");
    css_style.setAttribute ("href", path);
    css_style.setAttribute ("media", "screen");
    if (util.isFunction (clb))
    {
      var count = 0;
      
      /**
       * @private
       */
      (function()
      {
        if (!css_style.sheet || !css_style.sheet.cssRules)
        {
          if (count++ < 100)
          {
            cssTimeout = setTimeout (arguments.callee, 100);
          }
          else
          {
            console.error ('CSS load of ' + path + ' failed!');
          }
          return;
        };
        if (css_style.sheet.cssRules &&
            css_style.sheet.cssRules.length === 0)
        {
          console.error ('CSS load of ' + path + ' failed!');
        }
        else
        {
          clb.call (document, path);
        }
      })();
    }
    if (!doc.head) { doc.head = doc.querySelector ('head'); }
    doc.head.appendChild (css_style);
  }
}

/********************************************************************
                         Style mamangent
*********************************************************************/

/**
 *  Modifies CSS styleSheets.
 *  <p>
 *  Modifies CSS style styleSheets. It can be preempted
 *  by css style inline modification (see vs.ui.View.setStyle).
 *  @see vs.ui.View#setStyles if you want to modify inline CSS.
 *
 *  @example
 *  vs.util.addCssRules ('.classname1', ['color: red', 'margin: 0px']);
 *
 * @memberOf vs.util
 * @function
 *
 * @param {String} selector CSS Selector
 * @param {Array} rules the array of rules
 */
function addCssRules (selector, rules)
{
  if (!isArray (rules)) { return; }
  
  var i = rules.length;
  while (i--)
  {
    addCssRule (selector, rules [i]);
  }
};

var __app_style_sheet__ = null;
/**
 *  Modifies CSS styleSheets.
 *  <p>
 *  Modifies CSS style styleSheets. It can be preempted
 *  by css style inline modification (see vs.ui.View.setStyle).
 *  @see vs.ui.View#setStyle if you want to modify inline CSS.
 *
 *  @example
 *  vs.util.addCssRule ('.classname1', 'color: red');
 *
 * @memberOf vs.util
 * @function
 *
 * @param {String} selector CSS Selector
 * @param {String} rule the rule using the following format:
 *   "prop_name: value"
 */
function addCssRule (selector, rule)
{
  if (!__app_style_sheet__) 
  {
    var style = document.createElement ('style');
    /* For Safari */
    style.appendChild (document.createTextNode (''));
    head = document.getElementsByTagName ('head')[0];
    head.appendChild (style);
    
    __app_style_sheet__ =
      document.styleSheets[document.styleSheets.length - 1];
  }
  
  var l = 0;
  if (__app_style_sheet__.cssRules)
  {
    l = __app_style_sheet__.cssRules.length;
  } else if (__app_style_sheet__.rules)
  {
    l = __app_style_sheet__.rules.length;
  }
  
  if (__app_style_sheet__.insertRule)
  {
    __app_style_sheet__.insertRule (selector + ' {' + rule + '}', l);
  } else if (__app_style_sheet__.addRule) 
  {
    __app_style_sheet__.addRule (selector, rule, l);
  }
};


/**
 * @private
 */
var SET_STYLE_OPTIMIZATION = true;

/**
 * @private
 */
var _current_platform_id = 0;
vs._current_platform_id = _current_platform_id;

/** 
 *  Sets the active stylesheet for the HTML document according to the specified
 *  title.
 *
 *  @memberOf vs.util
 *
 * @param {String} title
 */
var setActiveStyleSheet = function (title)
{
  var i = 0, stylesheets = document.getElementsByTagName ("link"),
    stylesheet, info, id, app, size;
    
  vs._current_platform_id = title;
  var apps = vs.Application_applications;
  
  if (SET_STYLE_OPTIMIZATION)
  {
    if (apps) for (id in apps)
    {
      app = apps [id];
      if (app.view) app.view.style.display = "none";
    }
  }

  for (i = 0; i < stylesheets.length; i++)
  {
    stylesheet = stylesheets [i];
    // If the stylesheet doesn't contain the title attribute, assume it's
    // a persistent stylesheet and should not be disabled
    if (!stylesheet.getAttribute ("title")) { continue; }
    // All other stylesheets than the one specified by "title" should be
    // disabled
    if (stylesheet.getAttribute ("title") !== title)
    {
      stylesheet.setAttribute ("disabled", true);
    } else 
    {
      stylesheet.removeAttribute ("disabled");
    }
  }
  
  if (SET_STYLE_OPTIMIZATION)
  {
    if (apps) for (id in apps)
    {
      app = apps [id];
      if (app.view) app.view.style.display = "block";
    }
  }

//     // resize application
//   if (window.deviceConfiguration.targets)
//   {
//     info = window.deviceConfiguration.targets [title];
//     if (!info)
//     { return; }
//     
//     if (info.orientations [0] === 0 || info.orientations [0] === 180)
//     {
//       size = info.resolution.slice ();
//     }
//     else if (info.orientations [0] === 90 || info.orientations [0] === -90)
//     {
//       size = [];
//       size [0] = info.resolution [1];
//       size [1] = info.resolution [0];
//     }
//     else
//     { return; }
//     
//     if (info.statusBarHeight)
//     {
//       size [1] -= info.statusBarHeight;
//     }
//     if (apps) for (id in apps)
//     {
//       app = Application_applications [id];
//       app.position = [0, 0];
//       app.size = size;
//     }
//   }
}

/**
 *  Preload GUI HTML template for the given component.
 *  <p>
 *  When the developer uses createAndAddComponent method, the system will
 *  load the HTML GUI template associated to the component to create.
 *  This process can take times.<br>
 *  In order to minimize the latency, this class method allows to preload all 
 *  data related to a component.<br>
 *  This method should ne call when the application start.
 * 
 *  @example
 *  vs.util.preloadTemplate ('GUICompOne');
 *  vs.util.preloadTemplate ('GUICompTwo');
 *  ...
 *  myObject.createAndAddComponent ('GUICompOne', conf, 'children');
 * 
 *  @memberOf vs.util
 *
 * @param {String} comp_name The GUI component name   
 */
function preloadTemplate (comp_name)
{
  var path = comp_name + '.xhtml', xmlRequest;
  
  if (vs.ui && vs.ui.View && vs.ui.View.__comp_templates [path]) { return; }

  xmlRequest = new XMLHttpRequest ();
  xmlRequest.open ("GET", path, false);
  xmlRequest.send (null);

  if (xmlRequest.readyState === 4)
  {
    if (xmlRequest.status === 200 || xmlRequest.status === 0)
    {
      data = xmlRequest.responseText;
      if (vs.ui && vs.ui.View) vs.ui.View.__comp_templates [path] = data;
    }
    else
    {
      console.error
        ("Template file for component '" + comp_name + "' unfound");
      return;
    }
  }
  else
  {
    console.error
      ("Pb when load the component '" + comp_name + "' template");
    return;
  }
  xmlRequest = null;
}

/********************************************************************
                         export
*********************************************************************/

util.extend (util, {
  vsTestElem:              vsTestElem,
  vsTestStyle:             vsTestStyle,
  
  // Class functions
  extendClass:             extendClass,
  defineProperty:
        (Object.defineProperty)?_defineProperty_api2:_defineProperty_api1,
  defineClassProperty:     defineClassProperty,
  defineClassProperties:   defineClassProperties,
  clone:                   clone,
  free:                    free,

  // JSON functions  
  toJSON:                  toJSON,

  // testing functions
  isElement:               isElement,
  isArray:                 isArray,
  isFunction:              isFunction,
  isString:                isString,
  isNumber:                isNumber,
  isUndefined:             isUndefined,

  // element class
  hasClassName:    hasClassName,
  addClassName:    addClassName,
  removeClassName: removeClassName,
  toggleClassName: toggleClassName,

  // string
  htmlEncode:      htmlEncode,
  strip:           strip,
  camelize:        camelize,
  capitalize:      capitalize,
  underscore:      underscore,
  parseJSON:       parseJSON,

  // element style
  addCssRule:                 addCssRule,
  addCssRules:                addCssRules,
  getElementHeight:           getElementHeight,
  getElementWidth:            getElementWidth,
  getElementDimensions:       getElementDimensions,
  getElementStyle:            getElementStyle,
  setElementStyle:            setElementStyle,
  setElementOpacity:          setElementOpacity,
  getElementOpacity:          getElementOpacity,
  getElementAbsolutePosition: getElementAbsolutePosition,
  setElementPos:              setElementPos,
  setElementSize:             setElementSize,
  setElementVisibility:       setElementVisibility,
  isElementVisible:           isElementVisible,
  removeAllElementChild:      removeAllElementChild,
  setElementInnerText:        setElementInnerText,
  setElementTransform:        setElementTransform,
  getElementTransform:        getElementTransform,
  setElementTransformOrigin:  setElementTransformOrigin,
  getBoundingClientRect:      
    (vsTestElem && vsTestElem.getBoundingClientRect)?
    _getBoundingClientRect_api2:_getBoundingClientRect_api1,
  
  // other
  importFile:           importFile,
  setActiveStyleSheet:  setActiveStyleSheet,
  preloadTemplate:      preloadTemplate,
  __date_reg_exp:       __date_reg_exp,
  _findItem:            _findItem, // export only for testing purpose
  _defineProperty_api1: _defineProperty_api1, // export only for testing purpose
  _defineProperty_api2: _defineProperty_api2, // export only for testing purpose
  _extend_api1:         _extend_api1, // export only for testing purpose
  _extend_api2:         _extend_api2 // export only for testing purpose
});

})(window);