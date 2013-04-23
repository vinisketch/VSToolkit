function testABObjectNew ()
{
  var o1 = new ABObject ('id1');
  o1.init ();
  
  assertNotUndefined ('testABObjectNew 1', o1);
  assertEquals ('testABObjectNew 2', 'id1', o1.id);
  assertEquals ('testABObjectNew 3', 'id1', o1._id);
  assertNotUndefined ('testABObjectNew 4', ABObject._obs.id1);
  
  var o3 = new ABObject ();
  o3.init ();
  assertNotUndefined ('testABObjectNew 5', o3);
  assertNotNull ('testABObjectNew 6', o3._id);
  
  o3.createId ();
}

function testABObjectConfiguration ()
{
  var o1 = new ABObject ('id1');
  o1.init ();
    
  var configuration = {}
  configuration.id = "beurk";
  configuration.huhu = "huhu";
  configuration.int1 = 1;
  configuration.booleanTrue = true;
  
  o1.configure (configuration);
  assertEquals ('testABObjectConfiguration 1', 'huhu', o1.huhu);
  assertEquals ('testABObjectConfiguration 2', 1, o1.int1);
  assertEquals ('testABObjectConfiguration 3', true, o1.booleanTrue);
  assertEquals ('testABObjectConfiguration 4', 'id1', o1.id);
}

function testABObjectClone ()
{
  var o1 = new ABObject ('id1');
  o1.init ();
  
  var configuration = {}
  configuration.id = "beurk";
  configuration.huhu = "huhu";
  configuration.int1 = 1;
  configuration.booleanTrue = true;
  o1.configure (configuration);
  
  var o2 = o1.clone ('id2');
  assertEquals ('testABObjectClone 1', 'huhu', o2.huhu);
  assertEquals ('testABObjectClone 2', 1, o2.int1);
  assertEquals ('testABObjectClone 3', true, o2.booleanTrue);
  assertEquals ('testABObjectClone 4', 'id2', o2._id);
}