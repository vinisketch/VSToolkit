function testButtonNew()
{
  var view = new vs.ui.Button ().init ();
  
  assertNotNull ('testButtonNew 1', view);
}

function testButtonDelete ()
{
  var view = new vs.ui.Button ().init ();
  assertNotNull ('testButtonDelete 1', view);
  
  vs.util.free (view);
  assertEquals ('testButtonDelete 2', false, view.__i__);
}

function testButtonPressed ()
{
  var view = new vs.ui.Button ().init ();
  assertNotNull ('testButtonDelete 1', view);
  
  assertEquals ('testButtonDelete 2', false, view._selected);

  view.didTouch ();
  assertTrue ('testButtonDelete 3', view._selected);
  assertTrue ('testButtonDelete 4', view.hasClassName ("pressed"));

  view.didUntouch (false);
  assertFalse ('testButtonDelete 5', view._selected);
  assertFalse ('testButtonDelete 6', view.hasClassName ("pressed"));
}

function testButtonText ()
{
  var view = new vs.ui.Button ().init ();
 
  assertNotNull ('testButtonText 1', view);
  assertEquals ('testButtonText 2', "", view._text);

  view.text = "hello"
  assertEquals ('testButtonText 3', "hello", view._text);
  assertEquals ('testButtonText 3bis', "hello", view.text);
  assertEquals ('testButtonText 3ter', "hello", view.view.textContent);

  view.text = 10;
  assertEquals ('testButtonText 4', "10", view._text);
  assertEquals ('testButtonText 4bis', "10", view.view.textContent);

  view.text = 10.45;
  assertEquals ('testButtonText 5', "10.45", view._text);
  assertEquals ('testButtonText 5bis', "10.45", view.view.textContent);

  view.text = true;
  assertEquals ('testButtonText 6', "true", view._text);
  assertEquals ('testButtonText 6bis', "true", view.view.textContent);

  view.text = false;
  assertEquals ('testButtonText 7', "false", view._text);
  assertEquals ('testButtonText 7bis', "false", view.view.textContent);

  view.text = null;
  assertEquals ('testButtonText 8', "", view._text);
  assertEquals ('testButtonText 8bis', "", view.view.textContent);

  view.text = undefined;
  assertEquals ('testButtonText 9', "", view._text);
  assertEquals ('testButtonText 9bis', "", view.view.textContent);

  view.text = "<b>hello</b>";
  assertEquals ('testButtonText 10', "<b>hello</b>", view._text);
  assertEquals ('testButtonText 10bis', "<b>hello</b>", view.view.textContent);
}

function testButtonStyle ()
{
  var view = new vs.ui.Button ({
    style: vs.ui.Button.BLACK_STYLE
  }).init ();
 
  assertNotNull ('testButtonStyle 1', view);
  assertTrue ('testButtonStyle 2', view.hasClassName (vs.ui.Button.BLACK_STYLE));

  view.style = vs.ui.Button.BLUE_STYLE
  assertTrue ('testButtonStyle 3', view.hasClassName (vs.ui.Button.BLUE_STYLE));

  view.style = vs.ui.Button.DEFAULT_STYLE
  assertTrue ('testButtonStyle 4', view.hasClassName (vs.ui.Button.DEFAULT_STYLE));

  view.style = vs.ui.Button.GREEN_STYLE
  assertEquals ('testButtonStyle 5', vs.ui.Button.GREEN_STYLE, view.style);
  assertTrue ('testButtonStyle 5bis', view.hasClassName (vs.ui.Button.GREEN_STYLE));

  view.style = vs.ui.Button.GREY_STYLE
  assertTrue ('testButtonStyle 6', view.hasClassName (vs.ui.Button.GREY_STYLE));

  view.style = vs.ui.Button.RED_STYLE
  assertTrue ('testButtonStyle 7', view.hasClassName (vs.ui.Button.RED_STYLE));

  view.style = vs.ui.Button.SILVER_STYLE
  assertTrue ('testButtonStyle 8', view.hasClassName (vs.ui.Button.SILVER_STYLE));
}

function testButtonType ()
{
  var view = new vs.ui.Button ({
    style: vs.ui.Button.BLACK_STYLE
  }).init ();
 
  assertNotNull ('testButtonType 1', view);
  assertTrue ('testButtonType 2', view.hasClassName (vs.ui.Button.DEFAULT_TYPE));

  view.type = vs.ui.Button.NAVIGATION_BACK_TYPE
  assertEquals ('testButtonStyle 3', vs.ui.Button.NAVIGATION_BACK_TYPE, view.type);
  assertTrue ('testButtonType 3bis', view.hasClassName (vs.ui.Button.NAVIGATION_BACK_TYPE));

  view.type = vs.ui.Button.NAVIGATION_FORWARD_TYPE
  assertTrue ('testButtonType 4', view.hasClassName (vs.ui.Button.NAVIGATION_FORWARD_TYPE));

  view.type = vs.ui.Button.NAVIGATION_TYPE
  assertTrue ('testButtonType 5', view.hasClassName (vs.ui.Button.NAVIGATION_TYPE));
}
