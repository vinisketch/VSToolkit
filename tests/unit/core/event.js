var free = _delete;

function testABEventNew ()
{
  var o1 = new ABEvent ('src', 'type', 'data');
  
  assertNotUndefined ('testABEventNew 1', o1);
  assertEquals ('testABEventNew 2', 'src', o1.src);
  assertEquals ('testABEventNew 3', 'type', o1.type);
  assertEquals ('testABEventNew 4', 'data', o1.data);
  assertEquals ('testABEventNew 5', o1.src, o1.srcTarget);
}

function testABEventFree()
{
  var o1 = new ABEvent ('src', 'type', 'data');
  
  free (o1);
  assertNull ('testABEventFree 1', o1.src);
  assertEquals ('testABEventFree 2', "", o1.type);
  assertNull ('testABEventFree 3', o1.data);
  assertNull ('testABEventNew 5', o1.srcTarget);
}