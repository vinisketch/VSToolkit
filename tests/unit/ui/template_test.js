function testTemplateNew()
{
  var t = '<span style="${style}">name:${lastname},${firstname}</span>';
  var template = new vs.ui.Template (t);
  
  assertNotNull ('testTemplateNew 1', template);
  assertEquals ('testTemplateNew 2', t, template._str);
  assertEquals ('testTemplateNew 2', t, template.toString ());
}

function testTemplateApply()
{
  var t = '<span style="${style}">name:${lastname},${firstname}</span>';
  var r = "<span style=\"color:blue\">name:Doe,John</span>"
  var template = new vs.ui.Template (t);
  
  var values = {
    lastname : "Doe",
    firstname : "John",
    style : "color:blue"
  };

  assertNotNull ('testTemplateApply 1', template);
  assertEquals ('testTemplateApply 2', r, template.apply (values));
}

function testViewCompile1 ()
{
  var t = '<span style="${style}" class="huhu">name:${lastname},${firstname}</span>';
  var r = "name:Doe,John"
  var s = "color:blue"
  var template = new vs.ui.Template (t);
  var myView = template.compileView ();
  
  myView.lastname = "Doe";
  myView.firstname = "John";
  myView.style = "color:blue";
 
  assertNotNull ('testViewCompile1 1', template);
  assertEquals ('testViewCompile1 2', r, myView.view.innerHTML);
  assertEquals ('testViewCompile1 3', s, myView.view.getAttribute ('style'));
  assertEquals ('testViewCompile1 3', 'huhu', myView.view.getAttribute ('class'));
}

function testViewCompile2 ()
{
  var t = '<div><div style="${style}"><div>name:${lastname}</div></div>,<span>${firstname}</span></div>';
  var r1 = "name:Doe"
  var r2 = "John"
  var r3 = "color:blue"
  var template = new vs.ui.Template (t);
  var myView = template.compileView ();
  
  myView.lastname = "Doe";
  myView.firstname = "John";
  myView.style = "color:blue";
 
  assertNotNull ('testViewCompile2 1', template);
  assertEquals ('testViewCompile2 2', r1, myView.view.firstElementChild.firstElementChild.innerHTML);
  assertEquals ('testViewCompile2 3', r2, myView.view.querySelector ('span').innerHTML);
  assertEquals ('testViewCompile2 4', r3, myView.view.firstElementChild.getAttribute ('style'));
}

function testViewCompile3 ()
{
  var t = '<div>${test}</div>';
  var template = new vs.ui.Template (t);
  var myView1 = template.compileView ();
  var myView2 = template.compileView ();
  
  myView1.test = "huhu";
  myView2.test = "hoho";

  assertNotNull ('testViewCompile3 1', template);
  assertEquals ('testViewCompile3 2', "huhu", myView1.view.textContent);
  assertEquals ('testViewCompile3 3', "hoho", myView2.view.textContent);
}

function testViewCompilePropRefeMultipleNode1 ()
{
  var t = '<div style="width:${size}px;height:${size}px">${size}</div>';
  var template = new vs.ui.Template (t);
  var myView = template.compileView ();
  
  assertNotNull ('testViewCompile4 1', template);
  myView.size = "45";
  assertEquals ('testViewCompile4 2', "45px", myView.view.style.width);
  assertEquals ('testViewCompile4 3', "45px", myView.view.style.height);
  assertEquals ('testViewCompile4 4', "45", myView.view.textContent);
}

function testViewCompilePropRefeMultipleNode2 ()
{
  var t =
    '<div style="width:${size}px;height:${size}px">${size}' +
      '<img style="width:${suze}px;height:${size}px">'+
    '</img></div>';
    
  var template = new vs.ui.Template (t);
  var myView = template.compileView ();
  
  myView.size = "45";
  myView.suze = "48";
  assertEquals ('testViewCompile5 1', "45px", myView.view.style.width);
  assertEquals ('testViewCompile5 2', "45px", myView.view.style.height);

  var img = myView.view.querySelector ('img');
  assertEquals ('testViewCompile5 3', "48px", img.style.width);
  assertEquals ('testViewCompile5 4', "45px", img.style.height);
  
  assertEquals ('testViewCompile5 5', "45", myView.view.textContent);
}

function testAttributes()
{
  var t = '<div style="color:${color};position:${css_pos}"></div>';
  var template = new vs.ui.Template (t);
  var myView = template.compileView ();
  
  myView.color = "red";
  myView.css_pos = "absolute";
 
  assertNotNull ('testAttributes 1', template);
  assertEquals ('testAttributes 2', 'red', myView.view.style.color);
  assertEquals ('testAttributes 2', 'absolute', myView.view.style.position);
}

var contact_tmp_str = 
"<div class=''>\
  <img src='' />\
  <div class='name'>${firstname} ${lastname}</div>\
  <div class='comp'>${companie}</div>\
  <div class='address'><div data-iterate='addresses'>${address}\
    <div class='tel'><div data-iterate='tels'>${tel}</div></div>\
  </div></div>\
</div>"

function testIterate ()
{
  var tmp = new vs.ui.Template (contact_tmp_str);
  var obj = tmp.compileView ();

  assertNotNull ('testIterate 1', tmp);
  assertNotNull ('testIterate 2', obj);

  var data = {};
  data.firstname = 'John';
  data.lastname = 'Doe';
  data.companie = 'IBM';
  data.addresses = [
    {address:'123 bd Saint Michel, 67000 Toulouse',
      tels : [{tel:'34 8984 4389'}, {tel:'34 8984 4390'}]},
    {address:'129 Av Simon bolivar Paris, 75019',
      tels : [{tel:'134 8984 4389'}, {tel:'134 8984 4391'}, {tel:'134 8984 4392'}]}
      ];

  obj.configure (data);
  var view = obj.view;

  assertNotNull ('testIterate 3', view);

  var
    nameNode = view.querySelector ('.name'),
    compNode = view.querySelector ('.comp'),
    adressesNodes = view.querySelectorAll ('.address > div');

  assertNotNull ('testIterate 4', nameNode);
  assertEquals ('testIterate 5', 'John Doe', nameNode.textContent);

  assertNotNull ('testIterate 6', compNode);
  assertEquals ('testIterate 7', 'IBM', compNode.textContent);

  assertNotNull ('testIterate 8', adressesNodes);
  assertEquals ('testIterate 9', 2, adressesNodes.length);

  var
    telsNode1 = adressesNodes[0].querySelectorAll ('.tel > div'),
    telsNode2 = adressesNodes[1].querySelectorAll ('.tel > div');
  
  assertNotNull ('testIterate 10', telsNode1);
  assertEquals ('testIterate 11', 2, telsNode1.length);
  assertEquals ('testIterate 12',  '34 8984 4389', telsNode1[0].textContent);
  assertEquals ('testIterate 13',  '34 8984 4390', telsNode1[1].textContent);
  
  assertNotNull ('testIterate 14', telsNode2);
  assertEquals ('testIterate 15', 3, telsNode2.length);
  assertEquals ('testIterate 16',  '134 8984 4389', telsNode2[0].textContent);
  assertEquals ('testIterate 17',  '134 8984 4391', telsNode2[1].textContent);
  assertEquals ('testIterate 18',  '134 8984 4392', telsNode2[2].textContent);
}


function testTemplateClone ()
{
  var t = '<div style="color:${color}">name:${lastname}<span style="color:${color}">,${firstname}</span></div>';
  
  var r1 = "name:Salut1<span style=\"color:red\">,Gars1</span>"
  var r2 = "name:Salut2<span style=\"color:red\">,Gars2</span>"
  var r3 = "name:Salut3<span style=\"color:yellow\">,Gars2</span>"

  var myTemplate = new vs.ui.Template (t)
  
  var view1 = myTemplate.compileView ();
  view1.lastname = "Salut1"
  view1.firstname = "Gars1";
  view1.color = "red";
  
  var view2 = view1.clone ();

  view2.lastname = "Salut2"
  view2.firstname = "Gars2";
  
  var view3 = view2.clone ();

  view3.lastname = "Salut3"
  view3.color = "yellow";
  
  assertNotNull ('testTemplateClone 1', view1);
  assertNotNull ('testTemplateClone 2', view2);
  assertNotNull ('testTemplateClone 3', view3);
  
  assertEquals ('testTemplateClone 4', "Salut1", view1._lastname);
  assertEquals ('testTemplateClone 4bis', "Salut1", view1.lastname);
  assertEquals ('testTemplateClone 5', "Gars1", view1._firstname);
  assertEquals ('testTemplateClone 5bis', "Gars1", view1.firstname);
  
  assertEquals ('testTemplateClone 6', "Salut2", view2._lastname);
  assertEquals ('testTemplateClone 6bis', "Salut2", view2.lastname);
  assertEquals ('testTemplateClone 7', "Gars2", view2._firstname);
  assertEquals ('testTemplateClone 7bis', "Gars2", view2.firstname);
  
  assertEquals ('testTemplateClone 8', "Salut3", view3._lastname);
  assertEquals ('testTemplateClone 8bis', "Salut3", view3.lastname);
  assertEquals ('testTemplateClone 9', "Gars2", view3._firstname);
  assertEquals ('testTemplateClone 9bis', "Gars2", view3.firstname);

  assertEquals ('testTemplateClone 10', r1, view1.view.innerHTML);
  assertEquals ('testTemplateClone 11', r2, view2.view.innerHTML);
  assertEquals ('testTemplateClone 12', r3, view3.view.innerHTML);
  
  assertEquals ('testTemplateClone 13', "red", view1.view.style.color);
  assertEquals ('testTemplateClone 14', "red", view2.view.style.color);
  assertEquals ('testTemplateClone 15', "yellow", view3.view.style.color);

  var span1 = view1.view.querySelector ('span');
  var span2 = view2.view.querySelector ('span');
  var span3 = view3.view.querySelector ('span');

  assertEquals ('testTemplateClone 16', "red", span1.style.color);
  assertEquals ('testTemplateClone 17', "red", span2.style.color);
  assertEquals ('testTemplateClone 18', "yellow", span3.style.color);
}
