function testIsArray ()
{
  var node = document.createElement ('div');
  
  assertTrue ('ObjectIsArray 1', vs.util.isArray([]));
  assertTrue ('ObjectIsArray 2', vs.util.isArray([0]));
  assertTrue (vs.util.isArray([0, 1]));
  assertFalse ('ObjectIsArray 3', vs.util.isArray({}));
  assertFalse ('ObjectIsArray 4', vs.util.isArray(node.childNodes));
  assertFalse ('ObjectIsArray 5', vs.util.isArray());
  assertFalse ('ObjectIsArray 6', vs.util.isArray(''));
  assertFalse ('ObjectIsArray 7', vs.util.isArray('foo'));
  assertFalse ('ObjectIsArray 8', vs.util.isArray(0));
  assertFalse ('ObjectIsArray 9', vs.util.isArray(1));
  assertFalse ('ObjectIsArray 10', vs.util.isArray(null));
  assertFalse ('ObjectIsArray 11', vs.util.isArray(true));
  assertFalse ('ObjectIsArray 12', vs.util.isArray(false));
  assertFalse ('ObjectIsArray 13', vs.util.isArray(undefined));
}

function testIsElement ()
{
  var node = document.createElement('div');
  assertTrue ('ObjectIsElement 1', vs.util.isElement(node));
  assertFalse ('ObjectIsElement 2', vs.util.isElement(document.createTextNode('bla')));

  // falsy variables should not mess up return value type
  this.assertFalse ('ObjectIsElement 3', vs.util.isElement(0));
  this.assertFalse ('ObjectIsElement 4', vs.util.isElement(''));
  this.assertFalse ('ObjectIsElement 5', vs.util.isElement(NaN));
  this.assertFalse ('ObjectIsElement 6', vs.util.isElement(null));
  this.assertFalse ('ObjectIsElement 7', vs.util.isElement(undefined));
}

function testIsFunction ()
{
  var node = document.createElement ('div');
  
  assertTrue ('ObjectIsFunction 1', vs.util.isFunction(function() { }));
  assertFalse ('ObjectIsFunction 2', vs.util.isFunction("a string"));
  assertFalse ('ObjectIsFunction 3', vs.util.isFunction(node));
  assertFalse ('ObjectIsFunction 4', vs.util.isFunction([]));
  assertFalse ('ObjectIsFunction 5', vs.util.isFunction({}));
  assertFalse ('ObjectIsFunction 6', vs.util.isFunction(0));
  assertFalse ('ObjectIsFunction 7', vs.util.isFunction(false));
  assertFalse ('ObjectIsFunction 8', vs.util.isFunction(undefined));
}

function testIsString ()
{
  assertTrue ('ObjectIsHash', !vs.util.isString(function() { }));
  assertTrue ('ObjectIsHash', vs.util.isString("a string"));
  assertTrue ('ObjectIsHash', vs.util.isString(new String("a string")));
  assertTrue ('ObjectIsHash', !vs.util.isString(0));
  assertTrue ('ObjectIsHash', !vs.util.isString([]));
  assertTrue ('ObjectIsHash', !vs.util.isString({}));
  assertTrue ('ObjectIsHash', !vs.util.isString(false));
  assertTrue ('ObjectIsHash', !vs.util.isString(undefined));
  assertTrue ('ObjectIsHash', !vs.util.isString(document));
}

function testIsNumber ()
{
  assertTrue ('ObjectIsNumber 1', vs.util.isNumber(0));
  assertTrue ('ObjectIsNumber 2', vs.util.isNumber(1.0));
  assertTrue ('ObjectIsNumber 3', vs.util.isNumber(new Number(0)));
  assertTrue ('ObjectIsNumber 4', vs.util.isNumber(new Number(1.0)));
  assertFalse ('ObjectIsNumber 5', vs.util.isNumber(function() { }));
  assertFalse ('ObjectIsNumber 6', vs.util.isNumber({ test: function() { return 3 } }));
  assertFalse ('ObjectIsNumber 7', vs.util.isNumber("a string"));
  assertFalse ('ObjectIsNumber 8', vs.util.isNumber([]));
  assertFalse ('ObjectIsNumber 9', vs.util.isNumber({}));
  assertFalse ('ObjectIsNumber 10', vs.util.isNumber(false));
  assertFalse ('ObjectIsNumber 11', vs.util.isNumber(undefined));
  assertFalse ('ObjectIsNumber 12', vs.util.isNumber(document));
}

function testIsUndefined ()
{
  assertTrue ('ObjectIsUndefined 1', vs.util.isUndefined(undefined));
  assertFalse ('ObjectIsUndefined 2', vs.util.isUndefined(null));
  assertFalse ('ObjectIsUndefined 3', vs.util.isUndefined(false));
  assertFalse ('ObjectIsUndefined 4', vs.util.isUndefined(0));
  assertFalse ('ObjectIsUndefined 5', vs.util.isUndefined(""));
  assertFalse ('ObjectIsUndefined 6', vs.util.isUndefined(function() { }));
  assertFalse ('ObjectIsUndefined 7', vs.util.isUndefined([]));
  assertFalse ('ObjectIsUndefined 8', vs.util.isUndefined({}));
}