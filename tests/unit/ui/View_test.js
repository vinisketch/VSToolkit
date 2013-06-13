function testViewNew()
{
  var view = new vs.ui.View ({id: 'view1'}).init ();
 
  assertNotNull ('testViewNew 1', view);
  assertEquals ('testViewNew 2', 'view1', view._id);
}

function testViewLayoutSet ()
{
  var view = new vs.ui.View ().init ();
 
  assertNotNull ('testViewLayout 1', view);
  assertEquals ('testViewLayout 2', vs.ui.View.DEFAULT_LAYOUT, view._layout);

  view.layout = vs.ui.View.HORIZONTAL_LAYOUT;
  assertEquals ('testViewLayout 3', vs.ui.View.HORIZONTAL_LAYOUT, view._layout);
  
  assertEquals ('testViewLayout 3bis', true, view.hasClassName (vs.ui.View.HORIZONTAL_LAYOUT));

  view.layout = vs.ui.View.VERTICAL_LAYOUT;
  assertEquals ('testViewLayout 4', vs.ui.View.VERTICAL_LAYOUT, view._layout);
  assertEquals ('testViewLayout 4bis', true, view.hasClassName (vs.ui.View.VERTICAL_LAYOUT));

  view.layout = vs.ui.View.ABSOLUTE_LAYOUT;
  assertEquals ('testViewLayout 5', vs.ui.View.ABSOLUTE_LAYOUT, view._layout);
  assertEquals ('testViewLayout 5bis', true, view.hasClassName (vs.ui.View.ABSOLUTE_LAYOUT));

  view.layout = vs.ui.View.FLOW_LAYOUT;
  assertEquals ('testViewLayout 6', vs.ui.View.FLOW_LAYOUT, view._layout);
  assertEquals ('testViewLayout 6bis', true, view.hasClassName (vs.ui.View.FLOW_LAYOUT));

  view.layout = vs.ui.View.DEFAULT_LAYOUT;
  assertEquals ('testViewLayout 7', vs.ui.View.DEFAULT_LAYOUT, view._layout);
  assertEquals ('testViewLayout 7bis', "vs_ui_view", view.view.className);
}

var tr = "matrix3d(0.707106, 0.707106, 0, 0, -0.707106, 0.707106, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
function testViewRotation ()
{
  var view = new vs.ui.View ().init (), r = 45;
 
  assertNotNull ('testViewRotation 1', view);
  
  view.rotation = r; 
  assertEquals ('testViewRotation 2', r, view._rotation);

  // bad values
  view.rotation = "string";
  assertEquals ('testViewRotation 3', r, view._rotation);

  view.rotation = ["array"];
  assertEquals ('testViewRotation 4', r, view._rotation);
  
  // test matrix result
  assertEquals ('testViewRotation 5', tr, vs.util.getElementTransform (view.view));
}

var tt = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 45, 79, 0, 1)";
function testViewTranslation ()
{
  var view = new vs.ui.View ().init (), t = [45, 79];
 
  assertNotNull ('testViewTranslation 1', view);
  
  view.translation = t;  
  assertArrayEquals ('testViewTranslation 2', t, [view.__view_t_x, view.__view_t_y]);

  // bad values
  view.translation = "string";
  assertEquals ('testViewTranslation 3', 45, view.__view_t_x);

  view.translation = ["array"];
  assertEquals ('testViewTranslation 4',  45, view.__view_t_x);
  
  // test matrix result
  assertEquals ('testViewTranslation 5', tt, vs.util.getElementTransform (view.view));
}


var ts = "matrix3d(1.4, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
function testViewScale ()
{
  var view = new vs.ui.View ().init (), s = 1.4;
 
  assertNotNull ('testViewScale 1', view);
  
  view.scaling = s;
  assertEquals ('testViewScale 2', s, view._scaling);

  // bad values
  view.rotation = "string";
  assertEquals ('testViewScale 3', s, view._scaling);

  view.rotation = ["array"];
  assertEquals ('testViewScale 4', s, view._scaling);
  
  // test matrix result
  assertEquals ('testViewScale 5', ts, vs.util.getElementTransform (view.view));
}

function testViewMaxScale ()
{
  var view = new vs.ui.View ().init ();
 
  assertNotNull ('testViewMaxScale 1', view);
  
  view.scaling = 5;
  assertEquals ('testViewMaxScale 2', view._max_scale, view._scaling);

  view.maxScale = 6;
  view.scaling = 5;
  assertEquals ('testViewMaxScale 3', 5, view._scaling);

  view.maxScale = 2;
  assertEquals ('testViewMaxScale 4', 2, view._scaling);
}


function testViewMinScale ()
{
  var view = new vs.ui.View ().init ();
 
  assertNotNull ('testViewMinScale 1', view);
  
  view.scaling = 0.2;
  assertEquals ('testViewMinScale 2', view._min_scale, view._scaling);

  view.minScale = 0.1;
  view.scaling = 0.2;
  assertEquals ('testViewMinScale 3', 0.2, view._scaling);

  view.minScale = 0.5;
  assertEquals ('testViewMinScale 4', 0.5, view._scaling);
}

function testViewInnerHTML ()
{
  var view = new vs.ui.View ().init ();
 
  assertNotNull ('testViewInnerHTML 1', view);
  
  view.innerHTML = "hello";
  assertEquals ('testViewInnerHTML 2', "hello", view.view.innerHTML);
  
  view.innerHTML = "<span>hello</span>";
  assertEquals ('testViewInnerHTML 3', "hello", view.view.textContent);
  
  view.innerHTML = "<span>hello</span>";
  assertEquals ('testViewInnerHTML 4', "SPAN", view.view.firstElementChild.nodeName);
}


function testViewPosition ()
{
  var view = new vs.ui.View ().init ();
 
  assertNotNull ('testViewPosition 1', view);
  
  view.position = [20, 45];
  
  assertArrayEquals ('testViewPosition 2', [20, 45], view._pos);
  assertEquals ('testViewPosition 3', "20px", view.view.style.left);
  assertEquals ('testViewPosition 4', "45px", view.view.style.top);

  // bad values
  view.position = [50];  
  assertArrayEquals ('testViewPosition 5', [20, 45], view._pos);

  view.position = ["jhhu", 44];  
  assertArrayEquals ('testViewPosition 6', [20, 45], view._pos);

  view.position = 45;  
  assertArrayEquals ('testViewPosition 7', [20, 45], view._pos);

  view.position = "huhu";  
  assertArrayEquals ('testViewPosition 8', [20, 45], view._pos);

  view.position = undefined;  
  assertArrayEquals ('testViewPosition 9', [20, 45], view._pos);

  view.position = null;  
  assertArrayEquals ('testViewPosition 10', [20, 45], view._pos);
}


function testViewSize ()
{
  var view = new vs.ui.View ().init ();
 
  assertNotNull ('testViewSize 1', view);
  
  view.size = [120, 245];
  
  assertArrayEquals ('testViewSize 2', [120, 245], view._size);
  assertEquals ('testViewSize 3', "120px", view.view.style.width);
  assertEquals ('testViewSize 4', "245px", view.view.style.height);

  // bad values
  view.position = [50];  
  assertArrayEquals ('testViewSize 5', [120, 245], view._size);

  view.position = ["jhhu", 44];  
  assertArrayEquals ('testViewSize 6', [120, 245], view._size);

  view.position = 45;  
  assertArrayEquals ('testViewSize 7', [120, 245], view._size);

  view.position = "huhu";  
  assertArrayEquals ('testViewSize 8', [120, 245], view._size);

  view.position = undefined;  
  assertArrayEquals ('testViewSize 9', [120, 245], view._size);

  view.position = null;  
  assertArrayEquals ('testViewSize 10', [120, 245], view._size);
}


