function testApplicationNew()
{
  var view = new vs.ui.Application ().init ();
  
  assertNotNull ('testApplicationNew 1', view);
}

