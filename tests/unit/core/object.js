function testObjectNew ()
{
  var o1 = new vs.core.Object ({id: 'id1'});
  o1.init ();
  
  assertNotUndefined ('testObjectNew 1', o1);
  assertEquals ('testObjectNew 2', 'id1', o1.id);
  assertEquals ('testObjectNew 3', 'id1', o1._id);
  assertNotUndefined ('testObjectNew 4', vs.core.Object._obs.id1);
  
  var o3 = new vs.core.Object ();
  o3.init ();
  assertNotUndefined ('testObjectNew 5', o3);
  assertNotNull ('testObjectNew 6', o3._id);
  
  o3.createId ();
}

function testObjectConfiguration ()
{
  var o1 = new vs.core.Object ({id: 'id2'});
  o1.init ();
    
  var configuration = {}
  configuration.id = "beurk";
  configuration.huhu = "huhu";
  configuration.int1 = 1;
  configuration.booleanTrue = true;
  
  o1.configure (configuration);
  assertEquals ('testObjectConfiguration 1', 'huhu', o1.huhu);
  assertEquals ('testObjectConfiguration 2', 1, o1.int1);
  assertEquals ('testObjectConfiguration 3', true, o1.booleanTrue);
  assertEquals ('testObjectConfiguration 4', 'id2', o1.id);
}

// function testObjectClone ()
// {
//   var o1 = new vs.core.Object ({id: 'id1'});
//   o1.init ();
//   
//   var configuration = {}
//   configuration.id = "beurk";
//   configuration.huhu = "huhu";
//   configuration.int1 = 1;
//   configuration.booleanTrue = true;
//   o1.configure (configuration);
//   
//   var o2 = o1.clone ({id: 'id2'});
//   assertEquals ('testABObjectClone 1', 'huhu', o2.huhu);
//   assertEquals ('testABObjectClone 2', 1, o2.int1);
//   assertEquals ('testABObjectClone 3', true, o2.booleanTrue);
//   assertEquals ('testABObjectClone 4', 'id2', o2._id);
// }