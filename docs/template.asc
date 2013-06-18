---
layout: default
title: Model Driven Views
subtitle: polyfill

feature:
  #spec: http://mdv.googlecode.com/git/docs/design_intro.html
  status: <span class="label label-warning">in progress</span>
  code: https://github.com/polymer/mdv
  summary: Extends HTML and the DOM APIs to support a sensible separation between the UI (DOM) of a document or application and its underlying data (model). Updates to the model are reflected in the DOM and user input into the DOM is immediately assigned to the model.
links:
- "HTML5Rocks - HTML's New Template Tag": http://www.html5rocks.com/tutorials/webcomponents/template/
---

{% include spec-header.html %}

Template 
        </h2>
        <span style="font-weight:bold;font-style:italic">WARNING: The API is not yet fully committed.</span>
        <p>
          Template is a simple way for creating view of a component.<br/>
          A template is a HTML text fragment containing template tags. There is two ways to use template :
          <ul>
            <li> By expanding tags using values provides in an Object</li>
            <li> By generating a vs.ui.View with properties linked to tags</li>
          </ul>
          <br />
Typical template description:
          <br />
          <br />
<pre><code class="javascript">var str = '&lt;span style="color:${color}"&gt;name:${lastname},${firstname}&lt;/span&gt;';
</code></pre>
          <br />
        1- Expanding the template:
          <br />
          <br />
<pre><code class="javascript">var myTemplate = new Template (str);

var values = {
  lastname : "Doe",
  firstname : "John",
  color : "blue"
};

console.log (myTemplate.apply (values));
// -> &lt;span style="color:blue"&gt;name:Doe,John&lt;/span&gt;
</code></pre>
          <br />
        2- Generating a vs.ui.View from the template:
          <br />
          <br />
<pre><code class="javascript">var myTemplate = new Template (str);

var myView = myTemplate.compileView ();

myApp.add (myView);

// property changes, automatically update the DOM
myView.lastname = "Doe";
myView.firstname = "John";
myView.color = "blue";
</code></pre>
          <br />
        3- Create two views form the same template:
          <br />
          <br />
First solution:          
          <br />
<pre><code class="javascript">var myTemplate = new Template (str);

var myView1 = myTemplate.compileView ();
myApp.add (myView1);

var myView2 = myTemplate.compileView ();
myApp.add (myView2);
</code></pre>
          <br />
Second solution:          
<pre><code class="javascript">var myTemplate = new Template (str);

var myView1 = myTemplate.compileView ();
myApp.add (myView1);

var myView2 = myView1.clone ();
myApp.add (myView2);
</code></pre>
          <br />
        4- Iterate on data:
          <br />
          <br />
Iteration on array of objects:          
          <br />
<pre><code class="javascript">var str =
'&lt;div class="tels"&gt; \
  &lt;div data-iterate="tels"&gt;${tel}&lt;/div&gt; \
&lt;/div&gt;';
</code></pre>
<pre><code class="javascript">var myTemplate = new Template (str);

var myView = myTemplate.compileView ();

myView.tels = [{tel: '080 6555 8899'}, {tel: '080 5785 55445'}]
</code></pre>
          <br />
Iteration on array of scalare:          
          <br />
<pre><code class="javascript">var str =
'&lt;div class="tels"&gt; \
  &lt;div data-iterate="tels"&gt;${@}&lt;/div&gt; \
&lt;/div&gt;';
</code></pre>
<pre><code class="javascript">var myTemplate = new Template (str);

var myView = myTemplate.compileView ();

myView.tels = ['080 6555 8899', '080 5785 55445']
</code></pre>
          <br />
        </p>
        