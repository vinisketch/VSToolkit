
function testExtend ()
{
  // test general extend
  var src = {};
  var target = vs.util.extend ({}, src);
  assertObjectEquals ('testExtend 1', {}, target);

  src = {
    m1:true,
    func: function (p) {}
  };
  target = vs.util.extend ({}, src);
  assertObjectEquals ('testExtend 2', src, target);

  src = {
    m1:true,
    func: function (p) {},
    ar: [1, 2, 3]
  };
  target = vs.util.clone (src);
  assertObjectEquals ('testExtend 3', target, vs.util.extend(src));

  target.m1 = false;
  assertObjectEquals ('testExtend 4', target, vs.util.extend (src, {m1: false}));

  assertObjectEquals ('testExtend 5', src, vs.util.extend(src, {bla: 123}));
  
  
  // test properties copy
  src = { m1:true  };

  var props = {};
  var d = {get : function () {return '_hihi_'}, configurable: true, enumerable: true};
  Object.defineProperty (props, 'huhu', d);
  d = {
    set: function (v) {this.m1 = v},
    get: function () {return this.m1},
    configurable: true,
    enumerable: true
  };
  Object.defineProperty (props, 'hihi', d);
  vs.util.extend (src, props);

  assertEquals ('testExtend 6', '_hihi_', src.huhu);
  assertEquals ('testExtend 7', true, src.hihi);
  src.hihi = false;
  assertEquals ('testExtend 8', false, src.hihi);
}

function testExtendClass ()
{
  // test general extend
  function src () {};
  src.prototype.func1 = function (p) {};
  src.prototype.ar = [1, 2, 3];
  src._properties_ = [{content: 1}];
  
  function target () {};
  target.prototype.func2 = function (p) {};
  
  vs.util.extendClass (target, src);
  var o = new target ();

  assertTrue ('testExtendClass 1', vs.util.isFunction (o.func2));
  assertTrue ('testExtendClass 2', vs.util.isFunction (o.func1));
  assertTrue ('testExtendClass 3', vs.util.isArray (o.ar));
}

function testDefinePropertyAPI_1 ()
{
  var func = Object.defineProperty
  var props = {};
  var d = {get : function () {
    if (!this._d) return '_hihi_';
    else return this._d
  }, set : function (v) {
    this._d = v;}
  };

  vs.util._defineProperty_api1 (props, 'hihi', d);

  assertNotNull ('testDefinePropertyAPI_1 1', Object.getOwnPropertyDescriptor (props, 'hihi'));
  assertEquals ('testDefinePropertyAPI_1 2', '_hihi_', props.hihi);
  props.hihi = '_hoho_'
  assertEquals ('testDefinePropertyAPI_2 3', '_hoho_', props.hihi);
}

function testDefinePropertyAPI_2 ()
{
  var props = {};
  var d = {get : function () {
    if (!this._d) return '_hihi_';
    else return this._d
  }, set : function (v) {
    this._d = v;}
  };

  vs.util._defineProperty_api2 (props, 'hihi', d);

  assertNotNull ('testDefinePropertyAPI_2 1', Object.getOwnPropertyDescriptor (props, 'hihi'));
  assertEquals ('testDefinePropertyAPI_2 2', '_hihi_', props.hihi);
  props.hihi = '_hoho_'
  assertEquals ('testDefinePropertyAPI_2 3', '_hoho_', props.hihi);
}

function testDefineClassProperty ()
{
  // test general extend
  function src () {};
  src.prototype.func = function (p) {};

  var props = {};
  var d = {get : function () {return '_hihi_'}};

  vs.util.defineClassProperty (src, 'hihi', d);

  assertNotNull ('testDefineClassProperty 1', Object.getOwnPropertyDescriptor (src, 'hihi'));
  var o = new src ();
  assertEquals ('testDefineClassProperty 2', '_hihi_', o.hihi);
}


function testDefineClassProperties ()
{
  // test general extend
  function src () {};
  src.prototype.func = function (p) {};

  var props = {};
  var d = {get : function () {return '_hihi_'}};
  var dd = {get : function () {return '_huhu_'}};

  vs.util.defineClassProperties (src, {'hihi': d, 'huhu': dd});

  assertNotNull ('testDefineClassProperties 1', Object.getOwnPropertyDescriptor (src, 'hihi'));
  assertNotNull ('testDefineClassProperties 2', Object.getOwnPropertyDescriptor (src, 'huhu'));
  var o = new src ();
  assertEquals ('testDefineClassProperties 3', '_hihi_', o.hihi);
  assertEquals ('testDefineClassProperties 4', '_huhu_', o.huhu);
}