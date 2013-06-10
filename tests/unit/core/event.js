var free = _delete;

function testEventNew ()
{
  var o1 = new vs.core.Event ('src', 'type', 'data');
  
  assertNotUndefined ('testEventNew 1', o1);
  assertEquals ('testEventNew 2', 'src', o1.src);
  assertEquals ('testEventNew 3', 'type', o1.type);
  assertEquals ('testEventNew 4', 'data', o1.data);
  assertEquals ('testEventNew 5', o1.src, o1.srcTarget);
}

function testEventFree()
{
  var o1 = new vs.core.Event ('src', 'type', 'data');
  
  vs.util.free (o1);
  assertNull ('testEventFree 1', o1.src);
  assertEquals ('testEventFree 2', "", o1.type);
  assertNull ('testEventFree 3', o1.data);
  assertNull ('testEventFree 5', o1.srcTarget);
}