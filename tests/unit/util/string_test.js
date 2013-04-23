
function testStringCamelize ()
{
  assertEquals ('String Camelize 1', '', vs.util.camelize (''));
  assertEquals ('String Camelize 2', '', vs.util.camelize ('-'));
  assertEquals ('String Camelize 3', 'foo', vs.util.camelize ('foo'));
  assertEquals ('String Camelize 4', 'foo_bar', vs.util.camelize ('foo_bar'));
  assertEquals ('String Camelize 5', 'FooBar', vs.util.camelize ('-foo-bar'));
  assertEquals ('String Camelize 6', 'FooBar', vs.util.camelize ('FooBar'));
  
  assertEquals ('String Camelize 7', 'fooBar', vs.util.camelize ('foo-bar'));
  assertEquals ('String Camelize 8', 'borderBottomWidth', vs.util.camelize ('border-bottom-width'));
  
  assertEquals ('String Camelize 9', 'classNameTest',vs.util.camelize ('class-name-test'));
  assertEquals ('String Camelize 10', 'classNameTest',vs.util.camelize ('className-test'));
  assertEquals ('String Camelize 11', 'classNameTest',vs.util.camelize ('class-nameTest'));
}

function testStringCapitalize ()
{
  assertEquals ('String Capitalize  1', '', vs.util.capitalize (''));
  assertEquals ('String Capitalize  2', 'Ä',vs.util.capitalize ('ä'));
  assertEquals ('String Capitalize  3', 'A',vs.util.capitalize ('A'));
  assertEquals ('String Capitalize  4', 'Hello',vs.util.capitalize ('hello'));
  assertEquals ('String Capitalize  5', 'Hello',vs.util.capitalize ('HELLO'));
  assertEquals ('String Capitalize  6', 'Hello',vs.util.capitalize ('Hello'));
  assertEquals ('String Capitalize  7', 'Hello world',vs.util.capitalize ('hello WORLD'));
}

function testUnderscore ()
{
  assertEquals('String Underscore  1', '', vs.util.underscore (''));
  assertEquals('String Underscore  2', '_', vs.util.underscore ('-'));
  assertEquals('String Underscore  3', 'foo', vs.util.underscore ('foo'));
  assertEquals('String Underscore  4', 'foo', vs.util.underscore ('Foo'));
  assertEquals('String Underscore  5', 'foo_bar', vs.util.underscore ('foo_bar'));
  assertEquals('String Underscore  6', 'border_bottom', vs.util.underscore ('borderBottom'));
  assertEquals('String Underscore  7', 'border_bottom_width', vs.util.underscore ('borderBottomWidth'));
  assertEquals('String Underscore  8', 'border_bottom_width', vs.util.underscore ('border-Bottom-Width'));      
}
  
function testStringStrip ()
{
  assertEquals ('String StringStrip 1', 'hello world', vs.util.strip ('   hello world  '));
  assertEquals ('String StringStrip 2', 'hello world', vs.util.strip ('hello world'));
  assertEquals ('String StringStrip 3', 'hello  \n  world', vs.util.strip ('  hello  \n  world  '));
  assertEquals ('String StringStrip 4', '', vs.util.strip (' '));
}

function testStringHtmlEncode ()
{
  assertEquals ('String HtmlEncode 1', '', vs.util.htmlEncode (''));
  assertEquals ('String HtmlEncode 2', 'test', vs.util.htmlEncode ('test'));
  assertEquals ('String HtmlEncode 3', "&lt;", vs.util.htmlEncode ('<'));
  assertEquals ('String HtmlEncode 4', "&gt;", vs.util.htmlEncode ('>'));
  assertEquals ('String HtmlEncode 5', "&lt;&gt;", vs.util.htmlEncode ('<>'));
  assertEquals ('String HtmlEncode 6', "&lt;!--&gt;",vs.util.htmlEncode ("<!-->"));
  assertEquals ('String HtmlEncode 7', "&amp;", vs.util.htmlEncode ('&'));
}


function testParseJSON ()
{
  var valid = '{"test": \n\r"hello world!"}';
  var invalid = '{"test": "hello world!"';
  var date = new Date (1326814228756);
  var date_str = '{"date":"/Date(1326814228756)/"}';
  
  assertEquals ('String ParseJSON 1', 'hello world!', vs.util.parseJSON (valid).test);

  assertEquals ('String ParseJSON 1', '', vs.util.parseJSON ('""'));
  assertEquals ('String ParseJSON 1', 'foo', vs.util.parseJSON ('"foo"'));
  assertObjectEquals ('String ParseJSON 1', {}, vs.util.parseJSON ('{}'));
  assertArrayEquals ('String ParseJSON 1', [], vs.util.parseJSON ('[]'));
  assertNull ('String ParseJSON 1', vs.util.parseJSON ('null'));
  assertEquals ('String ParseJSON 1', 123, vs.util.parseJSON ('123'));
  assertEquals ('String ParseJSON 1', true, vs.util.parseJSON ('true'));
  assertEquals ('String ParseJSON 1', false, vs.util.parseJSON ('false'));
  assertEquals ('String ParseJSON 1', '"', vs.util.parseJSON ('"\\""'));
  assertEquals ('String ParseJSON 1', date.toString (), vs.util.parseJSON (date_str).date.toString ());
  
  var c_obj = {
    id:"hak_id_1326467971099169932",
    data:[{
      nb:16,
      content:"Test",
      done:true,
      }
    ]};
    
  var c_str = '{"id":"hak_id_1326467971099169932", "data": [{"nb":16,"content":"Test","done":true}]}';

  assertObjectEquals ('String ParseJSON 1', c_obj, vs.util.parseJSON (c_str));
}

