var JS_DOC = 1;
var CSS_DOC = 2;
var editor = null;
var current_doc_index = -1;

function loadDocument (path)
{
  var xhr = new XMLHttpRequest ();
 
 //prepare the xmlhttprequest object
  xhr.open ('GET', path, false);
  
  //send the request
  xhr.send ();
  
  return xhr.responseText;
}

function updatePreview ()
{
  var iframe = document.getElementById ('playground');
  var html = loadDocument ('playground.html')
  var preview =  iframe.contentDocument ||  iframe.contentWindow.document;
  
  preview.open ();
  preview.write (html);
  preview.close ();

  for (var i = 0; i < app_docs.length; i++)
  {
    var doc = app_docs [i];
    if (doc.type == JS_DOC)
    {
      var script = preview.createElement ('script');
      script.innerHTML = doc.data;
      script.setAttribute ("type", "text/javascript");
      if (!preview.head) { preview.head = preview.querySelector ('head'); }
      preview.head.appendChild (script);
    }
    else if (doc.type == CSS_DOC)
    {
      var css_style = preview.createElement ("style");
      css_style.setAttribute ("type", "text/css");
      css_style.innerHTML = doc.data;
      if (!preview.head) { preview.head = preview.querySelector ('head'); }
      preview.head.appendChild (css_style);
    }
  }
  
  var script = preview.createElement ('script');
  script.innerHTML = "loadApplication ();";
  script.setAttribute ("type", "text/javascript");
  if (!preview.head) { preview.head = preview.querySelector ('head'); }
  preview.head.appendChild (script);  
}

function loadApplication ()
{
  var select = document.getElementById ('files');
  
  for (var i = 0; i < app_docs.length; i++)
  {
    var doc = app_docs [i];
    doc.data = loadDocument (doc.url);

    var option = document.createElement ('option');
    option.innerHTML = doc.url;
    select.appendChild (option);
  }
  
  updatePreview ();
}

function runApplication ()
{
  // Save current document
  var data = editor.getValue ();
  app_docs [current_doc_index].data = data;

  updatePreview ();
}

function changeDocument (event)
{
  // Save current document
  var data = editor.getValue ();
  app_docs [current_doc_index].data = data;

  // Set the new document
  current_doc_index = event.target.selectedIndex;
  editor.setValue (app_docs [current_doc_index].data);
}

function initPlayground ()
{
  editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    theme: 'vsd'
  });

  loadApplication ();
  
  current_doc_index = 0;
  editor.setValue (app_docs [current_doc_index].data);
}

window.addEventListener ("load", initPlayground);