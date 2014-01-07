function testDataFlowPropagation1 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var df = vs._default_df_;
  
  df.connect (item1, "inOut1", item2, "inOut1")
  df.connect (item1, "inOut2", item2, "inOut2")

  df.connect (item2, "inOut1", item3, "inOut1")
  df.connect (item2, "inOut2", item3, "inOut2")

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();

  assertEquals ('testDataFlowPropagation1 1', 1, item1._in_out1);
  assertEquals ('testDataFlowPropagation1 2', 2, item1._in_out2);
  assertEquals ('testDataFlowPropagation1 3', 1, item2._in_out1);
  assertEquals ('testDataFlowPropagation1 4', 2, item2._in_out2);
  assertEquals ('testDataFlowPropagation1 5', 1, item3._in_out1);
  assertEquals ('testDataFlowPropagation1 6', 2, item3._in_out2);
}

function testDataFlowPropagation2 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var df = vs._default_df_;
  
  df.connect (item1, ["inOut1", "inOut2"], item2, ["inOut1", "inOut2"]);
  df.connect (item2, ["inOut1", "inOut2"], item3, ["inOut1", "inOut2"]);

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();
  
  assertEquals ('testDataFlowPropagation2 1', 1, item1._in_out1);
  assertEquals ('testDataFlowPropagation2 2', 2, item1._in_out2);
  assertEquals ('testDataFlowPropagation2 3', 1, item2._in_out1);
  assertEquals ('testDataFlowPropagation2 4', 2, item2._in_out2);
  assertEquals ('testDataFlowPropagation2 5', 1, item3._in_out1);
  assertEquals ('testDataFlowPropagation2 6', 2, item3._in_out2);
}

function testDataFlowPropagation3 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "in": vs.core.Object.PROPERTY_IN,
      "out": vs.core.Object.PROPERTY_OUT
    },
    
    propertiesDidChange : function () {
      this._out = this._in + 1;
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var df = vs._default_df_;
  
  df.connect (item1, ["out"], item2, ["in"]);
  df.connect (item2, ["out"], item3, ["in"]);

  df.build ();

  item1['in'] = 1;
  
  assertEquals ('testDataFlowPropagation3 1', 1, item1._in);
  assertEquals ('testDataFlowPropagation3 2', 2, item1._out);
  assertEquals ('testDataFlowPropagation3 3', 2, item2._in);
  assertEquals ('testDataFlowPropagation3 4', 3, item2._out);
  assertEquals ('testDataFlowPropagation3 5', 3, item3._in);
  assertEquals ('testDataFlowPropagation3 6', 4, item3._out);
}

function testDataFlowFunction1 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  var item4 = new TestObject ().init ();
  var item5 = new TestObject ().init ();

  var df = vs._default_df_;

  var foisDeux = function (v) {
    return v * 2
  };
  var foisTrois = function (v) {
    return v * 3
  };
  
  df.connect (item1, "inOut", item2, "inOut", foisDeux)
  df.connect (item2, "inOut", item3, "inOut", foisDeux)
  df.connect (item3, "inOut", item4, "inOut", foisTrois)
  df.connect (item4, "inOut", item5, "inOut", foisTrois)
  df.build ();

  item1['inOut'] = 1;
  
  assertEquals ('testDataFlowFunction1 1', 1, item1._in_out);
  assertEquals ('testDataFlowFunction1 2', 2, item2._in_out);
  assertEquals ('testDataFlowFunction1 3', 4, item3._in_out);
  assertEquals ('testDataFlowFunction1 4', 12, item4._in_out);
  assertEquals ('testDataFlowFunction1 5', 36, item5._in_out);
}

function testDataFlowFunction2 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var func = function (v1, v2) {
    return [v2 * 2, v1 * 3];
  };

  var df = vs._default_df_;
  
  df.connect (item1, ["inOut1", "inOut2"], item2, ["inOut1", "inOut2"], func);
  df.connect (item2, ["inOut1", "inOut2"], item3, ["inOut1", "inOut2"], func);

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();

  assertEquals ('testDataFlowFunction2 1', 1, item1._in_out1);
  assertEquals ('testDataFlowFunction2 2', 2, item1._in_out2);
  assertEquals ('testDataFlowFunction2 3', 4, item2._in_out1);
  assertEquals ('testDataFlowFunction2 4', 3, item2._in_out2);
  assertEquals ('testDataFlowFunction2 5', 6, item3._in_out1);
  assertEquals ('testDataFlowFunction2 6', 12, item3._in_out2);
}

function testDataFlowFunction3 () {

  var TestObject1 = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var TestObject2 = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject1 ().init ();
  var item2 = new TestObject2 ().init ();
  var item3 = new TestObject1 ().init ();
  
  var func1 = function (v1, v2) {
    return v1 * v2;
  };
  var func2 = function (v) {
    return [v * 2, v * 3];
  };

  var df = vs._default_df_;
  
  df.connect (item1, ["inOut1", "inOut2"], item2, "inOut", func1);
  df.connect (item2, "inOut", item3, ["inOut1", "inOut2"], func2);

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();

  assertEquals ('testDataFlowFunction3 1', 1, item1._in_out1);
  assertEquals ('testDataFlowFunction3 2', 2, item1._in_out2);
  assertEquals ('testDataFlowFunction3 3', 2, item2._in_out);
  assertEquals ('testDataFlowFunction3 4', 4, item3._in_out1);
  assertEquals ('testDataFlowFunction3 5', 6, item3._in_out2);
}

function testDataFlowUnconnectAPI_ID_1 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var df = vs._default_df_;
  
  var t11_id = df.connect (item1, "inOut1", item2, "inOut1")
  var t21_id = df.connect (item1, "inOut2", item2, "inOut2")

  var t12_id = df.connect (item2, "inOut1", item3, "inOut1")
  var t22_id = df.connect (item2, "inOut2", item3, "inOut2")

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();

  assertEquals ('testDataFlowUnconnectAPI_ID_1 1', 1, item1._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 2', 2, item1._in_out2);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 3', 1, item2._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 4', 2, item2._in_out2);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 5', 1, item3._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 6', 2, item3._in_out2);

  df.unconnect (t12_id);
  df.unconnect (t21_id);
  
  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 3;
  item1['inOut2'] = 4;
  df.restartPropagation ();
  
  df.propagate ();

  assertEquals ('testDataFlowUnconnectAPI_ID_1 7', 3, item1._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 8', 4, item1._in_out2);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 9', 3, item2._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 10', 2, item2._in_out2);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 11', 1, item3._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_1 12', 2, item3._in_out2);
}

function testDataFlowUnconnectAPI_ID_2 () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var df = vs._default_df_;
  
  var t11_id = df.connect (item1, "inOut1", item2, "inOut1")
  var t21_id = df.connect (item1, "inOut2", item2, "inOut2")

  var t12_id = df.connect (item2, "inOut1", item3, "inOut1")
  var t22_id = df.connect (item2, "inOut2", item3, "inOut2")

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();

  df.unconnect (t12_id);
  df.unconnect (t21_id);
  
  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 3;
  item1['inOut2'] = 4;
  df.restartPropagation ();
  
  df.propagate ();

  df.pausePropagation ();
  item2['inOut2'] = 6;
  df.restartPropagation ();

  df.propagate ();

  assertEquals ('testDataFlowUnconnectAPI_ID_2 1', 3, item1._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_2 2', 4, item1._in_out2);
  assertEquals ('testDataFlowUnconnectAPI_ID_2 3', 3, item2._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_2 4', 6, item2._in_out2);
  assertEquals ('testDataFlowUnconnectAPI_ID_2 5', 1, item3._in_out1);
  assertEquals ('testDataFlowUnconnectAPI_ID_2 6', 6, item3._in_out2);
}

function testDataFlowReconnect () {

  var TestObject = vs.core.createClass ({

    parent: vs.core.Object,

    properties : {
      "inOut1": vs.core.Object.PROPERTY_IN_OUT,
      "inOut2": vs.core.Object.PROPERTY_IN_OUT
    }
  });

  var item1 = new TestObject ().init ();
  var item2 = new TestObject ().init ();
  var item3 = new TestObject ().init ();
  
  var df = vs._default_df_;
  
  var t11_id = df.connect (item1, "inOut1", item2, "inOut1")
  var t21_id = df.connect (item1, "inOut2", item2, "inOut2")

  var t12_id = df.connect (item2, "inOut1", item3, "inOut1")
  var t22_id = df.connect (item2, "inOut2", item3, "inOut2")

  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 1;
  item1['inOut2'] = 2;
  df.restartPropagation ();
  
  df.propagate ();

  df.unconnect (t12_id);
  df.unconnect (t21_id);
  
  df.build ();

  df.pausePropagation ();
  item1['inOut1'] = 3;
  item1['inOut2'] = 4;
  df.restartPropagation ();
  
  df.propagate ();

  df.pausePropagation ();
  item2['inOut2'] = 6;
  df.restartPropagation ();

  df.propagate ();

  var t12_id = df.connect (item2, "inOut1", item3, "inOut1")
  var t21_id = df.connect (item1, "inOut2", item2, "inOut2")

  df.build ();

  df.pausePropagation ();
  item2['inOut1'] = 7;
  item2['inOut2'] = 8;
  df.restartPropagation ();

  df.propagate ();

  assertEquals ('testDataFlowReconnect 1', 3, item1._in_out1);
  assertEquals ('testDataFlowReconnect 2', 4, item1._in_out2);
  assertEquals ('testDataFlowReconnect 3', 7, item2._in_out1);
  assertEquals ('testDataFlowReconnect 4', 8, item2._in_out2);
  assertEquals ('testDataFlowReconnect 5', 7, item3._in_out1);
  assertEquals ('testDataFlowReconnect 6', 8, item3._in_out2);

  df.pausePropagation ();
  item1['inOut1'] = 9;
  item1['inOut2'] = 10;
  df.restartPropagation ();

  df.propagate ();

  assertEquals ('testDataFlowReconnect 7', 9, item1._in_out1);
  assertEquals ('testDataFlowReconnect 8', 10, item1._in_out2);
  assertEquals ('testDataFlowReconnect 9', 9, item2._in_out1);
  assertEquals ('testDataFlowReconnect 10', 10, item2._in_out2);
  assertEquals ('testDataFlowReconnect 11', 9, item3._in_out1);
  assertEquals ('testDataFlowReconnect 12', 10, item3._in_out2);
}