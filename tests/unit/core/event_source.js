var free = _delete;

function testABEventSourceNew ()
{
  var o1 = new ABEventSource ('id1');
  
  assertNotUndefined ('testABEventSourceNew 1', o1);
  assertEquals ('testABEventSourceNew 2', 'id1', o1._id);
  assertHashEquals ('testABEventSourceNew 3', {}, o1.__bindings__);
  assertHashEquals ('testABEventSourceNew 4', {}, o1.__node_binds__);
}

function testABEventSourceBind ()
{
  var o1 = new ABEventSource ('id1');
  
  var o2 = new ABEventSource ('id2');

  assertUndefined ('testABEventSourceBind 1', o1.bind () );
  assertUndefined ('testABEventSourceBind 2', o1.bind ('spec') );
  
  var handler = o1.bind ('spec', o2);
  assertNotUndefined ('testABEventSourceBind 3', handler );
  assertNotUndefined ('testABEventSourceBind 4', o1.__bindings__ ['spec']);
  assertTrue ('testABEventSourceBind 5', Object.isArray (o1.__bindings__ ['spec']));

  assertEquals ('testABEventSourceBind 6', 'spec', handler.spec);
  assertEquals ('testABEventSourceBind 7', o2, handler.obj);
  assertUndefined ('testABEventSourceBind 8', handler.delay);
  assertUndefined ('testABEventSourceBind 9', handler.func);
  
  var b = o1.__bindings__ ['spec'];
  assertEquals ('testABEventSourceBind 10', 1, b.length);
  assertEquals ('testABEventSourceBind 11', handler, b[0]);
  
  
  var handlerBis = o1.bind ('specBis', o2, 'notify');
  assertNotUndefined ('testABEventSourceBind 12', handlerBis );
  assertNotUndefined ('testABEventSourceBind 13', o1.__bindings__ ['specBis']);
  assertTrue ('testABEventSourceBind 14', Object.isArray (o1.__bindings__ ['specBis']));

  assertEquals ('testABEventSourceBind 15', 'specBis', handlerBis.spec);
  assertEquals ('testABEventSourceBind 16', o2, handlerBis.obj);
  assertUndefined ('testABEventSourceBind 17', handlerBis.delay);
  assertEquals ('testABEventSourceBind 18', 'notify', handlerBis.func);
  assertUndefined ('testABEventSourceBind 19', handlerBis.func_ptr);
  
  b = o1.__bindings__ ['specBis'];
  assertEquals ('testABEventSourceBind 20', 1, b.length);
  assertEquals ('testABEventSourceBind 21', handlerBis, b[0]);
   
  function  notify () {};
   
  var handlerTer = o1.bind ('spec', o2, notify, true);
  assertNotUndefined ('testABEventSourceBind 22', handlerTer );

  assertEquals ('testABEventSourceBind 23', 'spec', handlerTer.spec);
  assertEquals ('testABEventSourceBind 24', o2, handlerTer.obj);
  assertTrue ('testABEventSourceBind 25', handlerTer.delay);
  assertEquals ('testABEventSourceBind 26', notify, handlerTer.func_ptr);
  assertUndefined ('testABEventSourceBind 27', handlerTer.func);

  b = o1.__bindings__ ['spec'];
  assertEquals ('testABEventSourceBind 28', 2, b.length);
  assertEquals ('testABEventSourceBind 29', handler, b[0]);
  assertEquals ('testABEventSourceBind 30', handlerTer, b[1]);
}

function testABEventSourceFree ()
{
  var o1 = new ABEventSource ('id1');  
  var o2 = new ABEventSource ('id2');

  var handler = o1.bind ('spec', o2);
  var handlerBis = o1.bind ('specBis', o2, 'notify');

  function  notify () {};
  var handlerTer = o1.bind ('spec', o2, notify, true);
  
  var node = document.createElement ('div');
  o1.nodeBind (node, 'click', notify);
  
  free (o1);
  free (o2);
  
  assertNull ('testABEventSourceFree 1', o1.__bindings__);
  assertNull ('testABEventSourceFree 2', o1.__node_binds__);
  
  assertNull ('testABEventSourceFree 3', o2.__bindings__);
  assertNull ('testABEventSourceFree 4', o2.__node_binds__);  
}

function testABEventSourceUnBind ()
{
  var o1 = new ABEventSource ();  
  var o2 = new ABEventSource ('id2');

  var handler = o1.bind ('spec', o2);
  var handlerBis = o1.bind ('specBis', o2, 'notify');

  function  notify () {};
  var handlerTer = o1.bind ('spec', o2, notify, true);
  
  o1.unbind ('specBis');

  var b = o1.__bindings__ ['specBis'];
  assertEquals ('testABEventSourceUnBind 1', 1, b.length);


  o1.unbind ('specBis', o2);

  b = o1.__bindings__ ['specBis'];
  assertEquals ('testABEventSourceUnBind 2', 0, b.length);

  o1.unbind ('spec');

  var b = o1.__bindings__ ['spec'];
  assertEquals ('testABEventSourceUnBind 3', 2, b.length);


  o1.unbind ('spec', o2, notify);

  b = o1.__bindings__ ['spec'];
  assertEquals ('testABEventSourceUnBind 4', 1, b.length);

  o1.unbind ('spec', o2);

  b = o1.__bindings__ ['spec'];
  assertEquals ('testABEventSourceUnBind 5', 0, b.length);
}


function testABEventSourceClone ()
{
  var o1 = new ABEventSource ();  
  var o2 = new ABEventSource ('id2');

  var handler = o1.bind ('spec', o2);
  var handlerBis = o1.bind ('specBis', o2, 'notify');

  function  notify () {};
  var handlerTer = o1.bind ('spec', o2, notify);
  
  var o3 = o1.clone ('id4');
  
  assertNotUndefined ('testABEventSourceClone 1', o3);
  assertEquals ('testABEventSourceClone 2', 'id4', o3._id);
  assertHashEquals ('testABEventSourceClone 3', {}, o3.__bindings__);
  assertHashEquals ('testABEventSourceClone 4', {}, o3.__node_binds__);
}

function testABEventSourcePropagate ()
{
  var o1 = new ABEventSource ();  
  var o2 = new ABEventSource ('id2');

  var result = false;
  function notify (event)
  {
    result = {};
    result.type = event.type;
    result.data = event.data;    
  };
  o2.notify = notify;
  o2.toto = notify;
  
  o1.bind ('spec', o2, notify);
  o1.bind ('specBis', o2);
  o1.bind ('specTer', o2, 'toto');

  assertFalse ('testABEventSourcePropagate 1', result);
  o1.propagate ('spec', 3);
  o1.propagate ('toto');
  assertEquals ('testABEventSourcePropagate 2', 'spec', result.type);
  assertEquals ('testABEventSourcePropagate 3', 3, result.data);

  result = false;
  assertFalse ('testABEventSourcePropagate 4', result);
  var event = new ABEvent (o1, 'specBis', 4);
  o1.notify (event);
  assertEquals ('testABEventSourcePropagate 5', 'specBis', result.type);
  assertEquals ('testABEventSourcePropagate 6', 4, result.data);

  result = false;
  assertFalse ('testABEventSourcePropagate 7', result);
  var event = new ABEvent (o1, 'specTer', 5);
  o1.notify (event);
  assertEquals ('testABEventSourcePropagate 8', 'specTer', result.type);
  assertEquals ('testABEventSourcePropagate 9', 5, result.data);
}

function testABEventSourceNodeBind ()
{
  var o1 = new ABEventSource ('id1');
  function notify (event)
  {
    result = {};
    result.type = event.type;
    result.data = event.data;    
  };
  o1.notify = notify;
  
  var node = document.createElement ('div');

  o1.nodeBind (node, 'click', 'notify');
  
  var b = o1.__node_binds__ ['clicknotify'];
  assertNotUndefined ('testABEventSourceNodeBind 1', b);

  assertTrue ('testABEventSourceNodeBind 2', Object.isArray (b));
  assertEquals ('testABEventSourceNodeBind 3', 1, b.length);

  o1.nodeBind (node, 'mousemove', o1.notify);
  
  var b = o1.__node_binds__ ['mousemovenotify'];
  assertNotUndefined ('testABEventSourceNodeBind 4', b);

  assertTrue ('testABEventSourceNodeBind 5', Object.isArray (b));
  assertEquals ('testABEventSourceNodeBind 6', 1, b.length);
}

function testABEventSourceNodeUnbind ()
{
  var o1 = new ABEventSource ('id1');
  function notify (event)
  {
    result = {};
    result.type = event.type;
    result.data = event.data;    
  };
  o1.notify = notify;
  
  var node = document.createElement ('div');

  o1.nodeBind (node, 'click', 'notify');
  o1.nodeBind (node, 'mousemove', o1.notify);

   
  var b = o1.__node_binds__ ['clicknotify'];
  assertEquals ('testABEventSourceNodeUnbind 1', 1, b.length);

  var b = o1.__node_binds__ ['mousemovenotify'];
  assertEquals ('testABEventSourceNodeUnbind 2', 1, b.length);

  o1.nodeUnbind (node, 'click', 'notify');

  var b = o1.__node_binds__ ['clicknotify'];
  assertEquals ('testABEventSourceNodeUnbind 3', 0, b.length);

  o1.nodeUnbind (node, 'mousemove', o1.notify);

  var b = o1.__node_binds__ ['mousemovenotify'];
  assertEquals ('testABEventSourceNodeUnbind 4', 0, b.length);
}


function testABEventSourceDocumentBind ()
{
  var o1 = new ABEventSource ('id1');
  function notify (event)
  {
    result = {};
    result.type = event.type;
    result.data = event.data;    
  };
  o1.notify = notify;

  o1.allDocumentBind ('click', 'notify');
  
  var b = o1.__node_binds__ ['clicknotify'];
  assertNotUndefined ('testABEventSourceDocumentBind 1', b);

  assertTrue ('testABEventSourceDocumentBind 2', Object.isArray (b));
  assertEquals ('testABEventSourceDocumentBind 3', 1, b.length);
}

function testABEventSourceDocumentUnbind ()
{
  var o1 = new ABEventSource ('id1');
  function notify (event)
  {
    result = {};
    result.type = event.type;
    result.data = event.data;    
  };
  o1.notify = notify;

  o1.allDocumentBind ('click', 'notify');

  
  var b = o1.__node_binds__ ['clicknotify'];
  assertNotUndefined ('testABEventSourceDocumentUnbind 1', b);

  assertTrue ('testABEventSourceDocumentUnbind 2', Object.isArray (b));
  assertEquals ('testABEventSourceDocumentUnbind 3', 1, b.length);

  o1.allDocumentUnbind ('click', 'notify');

  var b = o1.__node_binds__ ['clicknotify'];
  assertNotUndefined ('testABEventSourceDocumentUnbind 4', b);

  assertTrue ('testABEventSourceDocumentUnbind 5', Object.isArray (b));
  assertEquals ('testABEventSourceDocumentUnbind 6', 0, b.length);
}

