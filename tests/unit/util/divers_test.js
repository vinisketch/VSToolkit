
function testObjectClone ()
{
  var object = {foo: 'foo', bar: [1, 2, 3]};
  
  assertNull ('ObjectClone', vs.util.clone(null));
  assertTrue ('ObjectClone', vs.util.isUndefined (vs.util.clone(undefined)));
  assertTrue ('ObjectClone', vs.util.isUndefined (vs.util.clone()));
  assertEquals ('ObjectClone', "test", vs.util.clone("test"));
  assertNotEquals ('ObjectClone', object, vs.util.clone(object));
//  assertHashEquals ('ObjectClone', object, vs.util.clone(object));
  
  var clone = vs.util.clone(object);
  delete clone.bar;
  assertHashEquals ('ObjectClone', {foo: 'foo'}, clone);
};

function testObjectToJSON ()
{
  var object = {};
  
  assertUndefined ('ObjectToJSON 1', vs.util.toJSON(undefined));
  assertUndefined ('ObjectToJSON 2', vs.util.toJSON(object.K));
  assertEquals ('ObjectToJSON 3', '\"\"', vs.util.toJSON(''));
  assertEquals ('ObjectToJSON 4', '\"test\"', vs.util.toJSON('test'));
  assertEquals ('ObjectToJSON 5', 'null', vs.util.toJSON(Number.NaN));
  assertEquals ('ObjectToJSON 6', '0', vs.util.toJSON(0));
  assertEquals ('ObjectToJSON 7', '-293', vs.util.toJSON(-293));
  assertEquals ('ObjectToJSON 8', '[]', vs.util.toJSON([]));
  assertEquals ('ObjectToJSON 9', '[\"a\"]', vs.util.toJSON(['a']));
  assertEquals ('ObjectToJSON 10', '[\"a\",1]', vs.util.toJSON(['a', 1]));
  assertEquals ('ObjectToJSON 11', '[\"a\",{\"b\":null}]', vs.util.toJSON(['a', {'b': null}]));
  assertEquals ('ObjectToJSON 12', '{\"a\":\"hello!\"}', vs.util.toJSON({a: 'hello!'}));
  assertEquals ('ObjectToJSON 13', '{}', vs.util.toJSON({}));
  assertEquals ('ObjectToJSON 14', '{}', vs.util.toJSON({a: undefined, b: undefined, c: vs.util.K}));
  assertEquals ('ObjectToJSON 15', '{\"b\":[null,false,true,null],\"c\":{\"a\":\"hello!\"}}',
    vs.util.toJSON({'b': [undefined, false, true, undefined], c: {a: 'hello!'}}));
  assertEquals ('ObjectToJSON 16', 'true', vs.util.toJSON(true));
  assertEquals ('ObjectToJSON 17', 'false', vs.util.toJSON(false));
  assertEquals ('ObjectToJSON 18', 'null', vs.util.toJSON(null));
  var element = document.createElement ('div');
  element.toJSON = function(){return 'I\'m a div with id test'};
  
  // marche pas
 assertEquals ('ObjectToJSON 19', '"I\'m a div with id test"', vs.util.toJSON(element));
};

function testFree ()
{
  var obj1 = {};
  var obj2 = {};
  obj2._free = function () {};
  var obj3 = {};
  obj3.destructor = function () {};
  
  assertUndefined ("Free 1", vs.util.free (obj1));
  assertUndefined ("Free 2", vs.util.free (obj2));
  assertUndefined ("Free 3", vs.util.free (obj3));
}

function testOthers ()
{
  vs.util.importFile ("toto.js", document, function () {}, 'js');
  vs.util.importFile ("toto.css", document, function () {}, 'css');
  vs.util.setActiveStyleSheet ('huhu');
  vs.util.preloadTemplate ("hoho");
}

