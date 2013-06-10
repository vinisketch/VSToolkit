var free = vs.util.free;

function testEventSourceNew ()
{
  var o1 = new vs.core.EventSource ({id: 'id1'});
  
  assertNotUndefined ('testEventSourceNew 1', o1);
  assertEquals ('testEventSourceNew 2', 'id1', o1._id);
  assertHashEquals ('testEventSourceNew 3', {}, o1.__bindings__);
  assertHashEquals ('testEventSourceNew 4', {}, o1.__node_binds__);
}

function testEventSourceBind ()
{
  var o1 = new vs.core.EventSource ({id: 'id1'});
  
  var o2 = new vs.core.EventSource ({id: 'id2'});

  assertUndefined ('testEventSourceBind 1', o1.bind () );
  assertUndefined ('testEventSourceBind 2', o1.bind ('spec') );
  
  var handler = o1.bind ('spec', o2);
  assertNotUndefined ('testEventSourceBind 3', handler );
  assertNotUndefined ('testEventSourceBind 4', o1.__bindings__ ['spec']);
  assertTrue ('testEventSourceBind 5', Array.isArray (o1.__bindings__ ['spec']));

  assertEquals ('testEventSourceBind 7', o2, handler.obj);
  assertUndefined ('testEventSourceBind 9', handler.func_name);
  
  var b = o1.__bindings__ ['spec'];
  assertEquals ('testEventSourceBind 10', 1, b.length);
  assertEquals ('testEventSourceBind 11', handler, b[0]);
  
  
  var handlerBis = o1.bind ('specBis', o2, 'notify');
  assertNotUndefined ('testEventSourceBind 12', handlerBis );
  assertNotUndefined ('testEventSourceBind 13', o1.__bindings__ ['specBis']);
  assertTrue ('testEventSourceBind 14', Array.isArray (o1.__bindings__ ['specBis']));

  assertEquals ('testEventSourceBind 16', o2, handlerBis.obj);
  assertEquals ('testEventSourceBind 18', 'notify', handlerBis.func_name);
  assertUndefined ('testEventSourceBind 19', handlerBis.func_ptr);
  
  b = o1.__bindings__ ['specBis'];
  assertEquals ('testEventSourceBind 20', 1, b.length);
  assertEquals ('testEventSourceBind 21', handlerBis, b[0]);
   
  function  notify () {};
   
  var handlerTer = o1.bind ('spec', o2, notify);
  assertNotUndefined ('testEventSourceBind 22', handlerTer );

  assertEquals ('testEventSourceBind 24', o2, handlerTer.obj);
  assertEquals ('testEventSourceBind 26', notify, handlerTer.func_ptr);
  assertUndefined ('testEventSourceBind 27', handlerTer.func_name);

  b = o1.__bindings__ ['spec'];
  assertEquals ('testEventSourceBind 28', 2, b.length);
  assertEquals ('testEventSourceBind 29', handler, b[0]);
  assertEquals ('testEventSourceBind 30', handlerTer, b[1]);
}

function testEventSourceFree ()
{
  var o1 = new vs.core.EventSource ({id: 'id1'});  
  var o2 = new vs.core.EventSource ({id: 'id2'});

  var handler = o1.bind ('spec', o2);
  var handlerBis = o1.bind ('specBis', o2, 'notify');

  function  notify () {};
  var handlerTer = o1.bind ('spec', o2, notify);
  
  var node = document.createElement ('div');
  o1.nodeBind (node, 'click', notify);
  
  free (o1);
  free (o2);
  
  assertNull ('testEventSourceFree 1', o1.__bindings__);
  assertNull ('testEventSourceFree 2', o1.__node_binds__);
  
  assertNull ('testEventSourceFree 3', o2.__bindings__);
  assertNull ('testEventSourceFree 4', o2.__node_binds__);  
}

function testEventSourceUnBind ()
{
  var o1 = new vs.core.EventSource ();  
  var o2 = new vs.core.EventSource ({id: 'id2'});

  var handler = o1.bind ('spec', o2);
  var handlerBis = o1.bind ('specBis', o2, 'notify');

  function notify () {};
  var handlerTer = o1.bind ('spec', o2, notify);
  
  o1.unbind ('specBis');

  var b = o1.__bindings__ ['specBis'];
  assertEquals ('testEventSourceUnBind 1', 1, b.length);

  o1.unbind ('specBis', o2);

  b = o1.__bindings__ ['specBis'];
  assertEquals ('testEventSourceUnBind 2', 0, b.length);

  o1.unbind ('spec');

  var b = o1.__bindings__ ['spec'];
  assertEquals ('testEventSourceUnBind 3', 2, b.length);


  o1.unbind ('spec', o2, notify);

  b = o1.__bindings__ ['spec'];
  assertEquals ('testEventSourceUnBind 4', 1, b.length);

  o1.unbind ('spec', o2);

  b = o1.__bindings__ ['spec'];
  assertEquals ('testEventSourceUnBind 5', 0, b.length);
}

function testEventSourceClone ()
{
  var o1 = new vs.core.EventSource ();
  var o2 = new vs.core.EventSource ({id: 'id2'});

  var handler = o1.bind ('spec', o2);
  var handlerBis = o1.bind ('specBis', o2, 'notify');

  function  notify () {};
  var handlerTer = o1.bind ('spec', o2, notify);
  
  var o3 = o1.clone ({id: 'id4'});
  
  assertNotUndefined ('testEventSourceClone 1', o3);
  assertEquals ('testEventSourceClone 2', 'id4', o3._id);
  assertHashEquals ('testEventSourceClone 3', {}, o3.__bindings__);
  assertHashEquals ('testEventSourceClone 4', {}, o3.__node_binds__);
}

function testEventSourcePropagate ()
{
  // for testing purpose, make propagate synchrone
  var requestAnimationFrame = vs.requestAnimationFrame;
  vs.requestAnimationFrame = function (clb) {
    clb ();
  }

  var o1 = new vs.core.EventSource ();  
  var o2 = new vs.core.EventSource ({id: 'id2'});

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

  assertFalse ('testEventSourcePropagate 1', result);
  o1.propagate ('spec', 3);
  o1.propagate ('toto');
  assertEquals ('testEventSourcePropagate 2', 'spec', result.type);
  assertEquals ('testEventSourcePropagate 3', 3, result.data);

  result = false;
  assertFalse ('testEventSourcePropagate 4', result);
  var event = new vs.core.Event (o1, 'specBis', 4);
  o1.notify (event);
  assertEquals ('testEventSourcePropagate 5', 'specBis', result.type);
  assertEquals ('testEventSourcePropagate 6', 4, result.data);

  result = false;
  assertFalse ('testEventSourcePropagate 7', result);
  var event = new vs.core.Event (o1, 'specTer', 5);
  o1.notify (event);
  assertEquals ('testEventSourcePropagate 8', 'specTer', result.type);
  assertEquals ('testEventSourcePropagate 9', 5, result.data);

  vs.requestAnimationFrame = requestAnimationFrame;
}

function testEventSourceNodeBind ()
{
  // for testing purpose, make propagate synchrone
  var requestAnimationFrame = vs.requestAnimationFrame;
  vs.requestAnimationFrame = function (clb) {
    clb ();
  }

  var o1 = new vs.core.EventSource ({id: 'id1'});
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
  assertNotUndefined ('testEventSourceNodeBind 1', b);

  assertTrue ('testEventSourceNodeBind 2', Array.isArray (b));
  assertEquals ('testEventSourceNodeBind 3', 1, b.length);

  o1.nodeBind (node, 'mousemove', o1.notify);
  
  var b = o1.__node_binds__ ['mousemovenotify'];
  assertNotUndefined ('testEventSourceNodeBind 4', b);

  assertTrue ('testEventSourceNodeBind 5', Array.isArray (b));
  assertEquals ('testEventSourceNodeBind 6', 1, b.length);

  vs.requestAnimationFrame = requestAnimationFrame;
}

function testEventSourceNodeUnbind ()
{
  // for testing purpose, make propagate synchrone
  var requestAnimationFrame = vs.requestAnimationFrame;
  vs.requestAnimationFrame = function (clb) {
    clb ();
  }

  var o1 = new vs.core.EventSource ({id: 'id1'});
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
  assertEquals ('testEventSourceNodeUnbind 1', 1, b.length);

  var b = o1.__node_binds__ ['mousemovenotify'];
  assertEquals ('testEventSourceNodeUnbind 2', 1, b.length);

  o1.nodeUnbind (node, 'click', 'notify');

  var b = o1.__node_binds__ ['clicknotify'];
  assertEquals ('testEventSourceNodeUnbind 3', 0, b.length);

  o1.nodeUnbind (node, 'mousemove', o1.notify);

  var b = o1.__node_binds__ ['mousemovenotify'];
  assertEquals ('testEventSourceNodeUnbind 4', 0, b.length);

  vs.requestAnimationFrame = requestAnimationFrame;
}

// function testEventSourceDocumentBind ()
// {
//   // for testing purpose, make propagate synchrone
//   var requestAnimationFrame = vs.requestAnimationFrame;
//   vs.requestAnimationFrame = function (clb) {
//     clb ();
//   }
// 
//   var o1 = new vs.core.EventSource ({id: 'id1'});
//   function notify (event)
//   {
//     result = {};
//     result.type = event.type;
//     result.data = event.data;    
//   };
//   o1.notify = notify;
// 
//   o1.allDocumentBind ('click', 'notify');
//   
//   var b = o1.__node_binds__ ['clicknotify'];
//   assertNotUndefined ('testEventSourceDocumentBind 1', b);
// 
//   assertTrue ('testEventSourceDocumentBind 2', Array.isArray (b));
//   assertEquals ('testEventSourceDocumentBind 3', 1, b.length);
// 
//   vs.requestAnimationFrame = requestAnimationFrame;
// }

// function testEventSourceDocumentUnbind ()
// {
//   var o1 = new vs.core.EventSource ({id: 'id1'});
//   function notify (event)
//   {
//     result = {};
//     result.type = event.type;
//     result.data = event.data;    
//   };
//   o1.notify = notify;
// 
//   o1.allDocumentBind ('click', 'notify');
// 
//   
//   var b = o1.__node_binds__ ['clicknotify'];
//   assertNotUndefined ('testEventSourceDocumentUnbind 1', b);
// 
//   assertTrue ('testEventSourceDocumentUnbind 2', Array.isArray (b));
//   assertEquals ('testEventSourceDocumentUnbind 3', 1, b.length);
// 
//   o1.allDocumentUnbind ('click', 'notify');
// 
//   var b = o1.__node_binds__ ['clicknotify'];
//   assertNotUndefined ('testEventSourceDocumentUnbind 4', b);
// 
//   assertTrue ('testEventSourceDocumentUnbind 5', Array.isArray (b));
//   assertEquals ('testEventSourceDocumentUnbind 6', 0, b.length);
// }

