
function testCreateClassBasic ()
{
  var Todo = vs.core.createClass ({});

  assertTrue ('testCreateClassBasic 1', vs.util.isFunction (Todo));
}

// function testCreateClassProperties()
// {
//   var test = vs.core.createClass ({
//   
//     /** Properties definition */
//     properties: {
//       content: vs.core.Object.PROPERTY_IN_OUT,
//       done: vs.core.Object.PROPERTY_IN_OUT,
//       date: vs.core.Object.PROPERTY_OUT
//     }
//   });
// }
