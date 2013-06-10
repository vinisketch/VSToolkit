
function testCreateClassBasic ()
{
  var Todo = vs.core.createClass ({});

  assertTrue ('testCreateClassBasic 1', (typeof Todo == "function"));
}

function testCreateClassProperties()
{
  var Test = vs.core.createClass ({
  
    /** Properties definition **/
    properties: {
      content: vs.core.Object.PROPERTY_IN,
      done: vs.core.Object.PROPERTY_IN_OUT,
      date: vs.core.Object.PROPERTY_OUT
    } 
  });
  
  assertTrue ('testCreateClassProperties 1', (typeof Test == "function"));
  
  var desc = Object.getOwnPropertyDescriptor (Test.prototype, 'content');
  assertTrue ('testCreateClassProperties 2', (typeof desc.set == "function"));
  assertUndefined ('testCreateClassProperties 3', desc.get);
  
  desc = Object.getOwnPropertyDescriptor (Test.prototype, 'done');
  assertTrue ('testCreateClassProperties 4', (typeof desc.set == "function"));
  assertTrue ('testCreateClassProperties 5', (typeof desc.get == "function"));
  
  desc = Object.getOwnPropertyDescriptor (Test.prototype, 'date');
  assertUndefined ('testCreateClassProperties 7', desc.set);
  assertTrue ('testCreateClassProperties 6', (typeof desc.get == "function"));
}

function testNewClassBasic ()
{
  var Todo = vs.core.createClass ({});

  assertTrue ('testNewClassBasic 1', (typeof Todo == "function"));
  
  var todo = new Todo ();
  assertNotUndefined ('testNewClassBasic 2', todo);
  
  todo = new Todo ({id: 'huhu'});
  assertNotUndefined ('testNewClassBasic 3', todo);
  assertEquals ('testNewClassBasic 4', "huhu", todo.id);
}

function testNewClassProperties1 ()
{
  var Test = vs.core.createClass ({
  
    /** Properties definition **/
    properties: {
      content: vs.core.Object.PROPERTY_IN,
      done: vs.core.Object.PROPERTY_IN_OUT,
      date: vs.core.Object.PROPERTY_OUT
    } 
  });
  
  var test = new Test ().init ();
  test.content = 'huhu';
  assertEquals ('testNewClassProperties1 1', "huhu", test._content);
  assertUndefined ('testNewClassProperties1 2', test.content);

  test.done = 'none';
  assertEquals ('testNewClassProperties1 3', "none", test._done);
  assertEquals ('testNewClassProperties1 4', "none", test.done);

  test.date = 'test date';
  assertUndefined ('testNewClassProperties1 5', test._date);
  assertUndefined ('testNewClassProperties1 6', test.date);

  test._date = 'test date';
  assertEquals ('testNewClassProperties1 7', "test date", test._date);
  assertEquals ('testNewClassProperties1 8', "test date", test.date);
}

function testNewClassProperties2 ()
{
  var Test = vs.core.createClass ({
  
    /** Properties definition **/
    properties: {
      content: vs.core.Object.PROPERTY_IN,
      done: vs.core.Object.PROPERTY_IN_OUT,
      date: vs.core.Object.PROPERTY_OUT
    } 
  });
  
  var test = new Test ({content: 'huhu', done: 'none', date:'test date'}).init ();

  assertEquals ('testNewClassProperties2 1', "huhu", test._content);
  assertUndefined ('testNewClassProperties2 2', test.content);

  assertEquals ('testNewClassProperties2 3', "none", test._done);
  assertEquals ('testNewClassProperties2 4', "none", test.done);

  assertUndefined ('testNewClassProperties2 5', test._date);
  assertUndefined ('testNewClassProperties2 6', test.date);

  test = new Test ({_date:'test date'}).init ();

  assertEquals ('testNewClassProperties2 7', "test date", test._date);
  assertEquals ('testNewClassProperties2 8', "test date", test.date);
}
