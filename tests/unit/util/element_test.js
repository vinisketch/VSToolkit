function testClassNameManipulation ()
{
  var node = document.createElement ('div');
  
  // test add class
  vs.util.addClassName (node, 'test');
  assertEquals ("ClassNameManipulation vs.util.addClassName", 'test', node.className);
  
  vs.util.addClassName (node, 'test2');
  assertEquals ("ClassNameManipulation vs.util.addClassName", 
    'test test2', node.className);
  
  vs.util.addClassName (node, 'test2');
  assertEquals ("ClassNameManipulation vs.util.addClassName", 
    'test test2', node.className);
  
  // test has class
  assertTrue ("ClassNameManipulation vs.util.hasClassName", vs.util.hasClassName (node, 'test'));
  assertTrue ("ClassNameManipulation vs.util.hasClassName", vs.util.hasClassName (node, 'test2'));
  assertFalse ("ClassNameManipulation vs.util.hasClassName", vs.util.hasClassName (node, 'test3'));

  // test remove class
  vs.util.removeClassName (node, 'test');
  assertEquals ("ClassNameManipulation vs.util.removeClassName", 'test2', node.className);

  // test toggle class
  vs.util.toggleClassName (node, 'test2');
  assertEquals ("ClassNameManipulation vs.util.removeClassName", '', node.className);
  vs.util.toggleClassName (node, 'test');
  assertEquals ("ClassNameManipulation vs.util.removeClassName", 'test', node.className);
  vs.util.toggleClassName (node, 'test');
  assertEquals ("ClassNameManipulation vs.util.removeClassName", '', node.className);
}

function testElementStyle()
{
  var node = document.createElement ('div');
  document.body.appendChild (node);
  
  assertEquals ("ElementStyle setStyle", "", node.style.cssText);
  vs.util.setElementStyle (node, {color: 'black'});
  assertEquals ("ElementStyle setStyle", "color: black; ", node.style.cssText);
  vs.util.setElementStyle (node, {color: 'red', opacity: '0.5', display: "block"});
  assertEquals ("ElementStyle setStyle", "color: red; opacity: 0.5; display: block; ", node.style.cssText);
  vs.util.setElementStyle (node, {display: undefined});
  assertEquals ("ElementStyle setStyle", "color: red; opacity: 0.5; ", node.style.cssText);
  vs.util.setElementStyle (node, {color: undefined, opacity: undefined});
  assertEquals ("ElementStyle setStyle", "", node.style.cssText);
  
  node.style.color = 'black';
  node.style.display = 'block';
  node.style.opacity = 1;
  vs.util.setElementOpacity (node, '1');

  assertEquals ("ElementOpacity set1", '1', node.style.opacity);
  vs.util.setElementOpacity (node, 0.1);
  assertEquals ("ElementOpacity set2", '0.1', node.style.opacity);
  vs.util.setElementOpacity (node, 0);
  assertEquals ("ElementOpacity set3", '0', node.style.opacity);

  assertEquals ("ElementOpacity get1", 0, vs.util.getElementOpacity (node));
  vs.util.setElementOpacity (node, 0.6);
  assertEquals ("ElementOpacity get2", 0.6, vs.util.getElementOpacity (node)); 
}

function testElementDimensions ()
{
  var node = document.createElement ('div');
  document.body.appendChild (node);
  
  vs.util.setElementSize (node, 75, 150);
  
  var dim = vs.util.getElementDimensions (node);
  
  assertEquals ("ElementDimensions width 1", 75, dim.width);
  assertEquals ("ElementDimensions height 2", 150, dim.height);

  node.style.display = "none";
  var dim = vs.util.getElementDimensions (node);
  assertEquals ("ElementDimensions width 3", 75, dim.width);
  assertEquals ("ElementDimensions height 4", 150, dim.height);

  vs.util.setElementSize (node, 105, 100);
  assertEquals ("ElementDimensions width 5", 105, vs.util.getElementWidth (node));
  assertEquals ("ElementDimensions height 6", 100, vs.util.getElementHeight (node));
}


function testElementPosition ()
{
  var node = document.createElement ('div');
  document.body.appendChild (node);
  
  vs.util.setElementPos (node, 75, 150);
  
  assertEquals ("ElementPosition left 1", '75px', node.style.left);
  assertEquals ("ElementPosition height 2", '150px', node.style.top);
  
  node.style.position = "absolute";
  var pos = vs.util.getElementAbsolutePosition (node);
  assertEquals ("ElementPosition left 3", 75, pos.x);
  assertEquals ("ElementPosition top 4", 150, pos.y);
  
  // force the non native algorithm
  node.getBoundingClientRect = null;
  var pos = vs.util.getElementAbsolutePosition (node);
  assertEquals ("ElementPosition left 3", 75, pos.x);
  assertEquals ("ElementPosition top 4", 150, pos.y);
}

function testElementVisibility ()
{
  var node = document.createElement ('div');
  document.body.appendChild (node);
  
  var text = document.createTextNode ("hehe");
  node.appendChild (text);
  
  assertTrue ("ElementVisibility 1", vs.util.isElementVisible (node));

  vs.util.setElementVisibility (node, false);
  assertFalse ("ElementVisibility 2", vs.util.isElementVisible (node));
  
  vs.util.setElementVisibility (node, true);
  assertTrue ("ElementVisibility 3", vs.util.isElementVisible (node));

  assertTrue ("ElementVisibility 4", vs.util.isElementVisible (text));
}

function testRemoveAllElement ()
{
  var node = document.createElement ('div');
  document.body.appendChild (node);
  
  node.appendChild (document.createTextNode ("hehe1"));
  node.appendChild (document.createTextNode ("hehe2"));
  node.appendChild (document.createTextNode ("hehe3"));
  
  assertEquals ("RemoveAllElement 1", 3, node.childNodes.length);
  vs.util.removeAllElementChild (node)
  assertEquals ("RemoveAllElement 2", 0, node.childNodes.length);
}

function testElementInnerText ()
{
  var node = document.createElement ('div');
  document.body.appendChild (node);
  
  vs.util.setElementInnerText (node)  
  assertEquals ("ElementInnerText 1", "", node.innerHTML);

  vs.util.setElementInnerText (null)  
  assertEquals ("ElementInnerText 2", "", node.innerHTML);

  vs.util.setElementInnerText (node, "hoho")  
  assertEquals ("ElementInnerText 3", "hoho", node.innerHTML);

  vs.util.setElementInnerText (node, 5)  
  assertEquals ("ElementInnerText 4", "5", node.innerHTML);

  vs.util.setElementInnerText (node, "Salut\nje vais bien")  
  assertEquals ("ElementInnerText 5", 3, node.childNodes.length);

  vs.util.setElementInnerText (node, "Salut\nje vais bien")  
  assertEquals ("ElementInnerText 6", "Salut<br>je vais bien", node.innerHTML);
}