function testTemplateClone ()
{
  var t = '<div style="${style}">name:${lastname}<span>,${firstname}</span></div>';
  
  var r1 = "name:Salut1<span>,Gars1</span>"
  var r2 = "name:Salut2<span>,Gars2</span>"
  var r3 = "name:Salut3<span>,Gars2</span>"

  var myTemplate = new vs.ui.Template (t)
  
  var view1 = myTemplate.compileView ();
  view1.lastname = "Salut1"
  view1.firstname = "Gars1";
  view1.style = "display:none";
  
  var view2 = view1.clone ();

  view2.lastname = "Salut2"
  view2.firstname = "Gars2";
  
  var view3 = view2.clone ();

//   view3.lastname = "Salut3"
//   view3.style = "display:block";
  
//   assertNotNull ('testTemplateClone 1', view1);
//   assertNotNull ('testTemplateClone 2', view2);
//   assertNotNull ('testTemplateClone 3', view3);
//   
//   assertEquals ('testTemplateClone 4', "Salut1", view1.lastname);
//   assertEquals ('testTemplateClone 5', "Gars1", view1.firstname);
//   
//   assertEquals ('testTemplateClone 6', "Salut2", view2.lastname);
//   assertEquals ('testTemplateClone 7', "Gars2", view2.firstname);
//   
//   assertEquals ('testTemplateClone 8', "Salut3", view3.lastname);
//   assertEquals ('testTemplateClone 9', "Gars2", view3.firstname);
// 
//   assertEquals ('testTemplateClone 10', r1, view1.view.innerHTML);
//   assertEquals ('testTemplateClone 11', r2, view2.view.innerHTML);
//   assertEquals ('testTemplateClone 12', r3, view3.view.innerHTML);
// 
//   assertEquals ('testTemplateClone 13', "display:none", view1.view.getAttribute ('style'));
//   assertEquals ('testTemplateClone 14', "display:none", view2.view.getAttribute ('style'));
//   assertEquals ('testTemplateClone 15', "display:block", view3.view.getAttribute ('style'));
}
