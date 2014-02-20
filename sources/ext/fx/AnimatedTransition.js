/******************************************************************************
          
******************************************************************************/

var AnimationDefaultOption = {
  duration: 300,
  begin: 0,
  pace: Pace.getLinearPace (),
  steps: 0,
  repeat: 1,
  startClb: null,
  endClb: null
}

/******************************************************************************
          
******************************************************************************/

/**
 *  animateTransition (obj, property, options)
 *
 *  Instruments a object property with an animation
 *  When the property is change, instead of XXX
 *
 *  @param obj {Object} 
 *  @param property {String} the property name to instrument
 *  @param options {Object} Animation options [optional]
**/
var animateTransition = function (obj, property, options)
{
  var animOptions = vs.util.clone (AnimationDefaultOption);
  if (options) {
    for (var key in options) animOptions [key] = options [key];
  }
  
  var chrono = new Chronometer (animOptions).init ();
  var pace = animOptions.pace;
  var traj = animOptions.trajectory;

  chrono.__clb = function (i) {
  
    pace._tick_i = i;
    if (pace._timing) {
      pace._tick_out = pace._timing (i);
    }
    else {
      pace._tick_out = pace._tick_in;
    }
    
    traj._tick = pace._tick_out;
    if (traj.compute ()) {
      obj [property] = traj._out;
      obj.propertyChange ();
    }
  }
  
  return chrono;
}

var animateTransitionBis = function (obj, srcs, targets, options)
{
  if (!vs.util.isArray (srcs) || !vs.util.isArray (targets)) return;
  if (srcs.length !== targets.length) return;
  
  var animOptions = vs.util.clone (AnimationDefaultOption);
  if (options) {
    for (var key in options) animOptions [key] = options [key];
  }
  
  var chrono = new Chronometer (animOptions).init ();
  var pace = animOptions.pace;
  var traj = animOptions.trajectory;

  chrono.__clb = function (i) {
    pace.tickIn = i;
    pace.propertiesDidChange ();
    
    traj.tick = pace.tickOut;
    traj.propertiesDidChange ();
    
    for (var i = 0; i < srcs.length; i++) { obj [targets[i]] = traj [srcs[i]]; }
    obj.propertyChange ();
  }
  
  return chrono;
}

function attachTransitionAnimation (comp, property, options)
{
  var animOptions = vs.util.clone (AnimationDefaultOption);
  if (options) {
    for (var key in options)
      animOptions [key] = options [key];
  }
  
  var
    chrono = new Chronometer (animOptions).init (),
    pace = animOptions.pace,
    traj = animOptions.trajectory,
    _property = '_' + vs.util.underscore (property),
    set_function;
    
  if (!traj) throw new Error ("Error StringTrajectory");

  chrono.__clb = function (i) {
  
    pace._tick_i = i;
    if (pace._timing) {
      pace._tick_out = pace._timing (i);
    }
    else {
      pace._tick_out = pace._tick_in;
    }
    
    traj._tick = pace._tick_out;
    if (traj.compute ()) {
      set_function.call (comp, traj._out);
      comp.propertyChange ();
    }
  }
    
  var desc = comp.getPropertyDescriptor (property);
  if (!desc || !desc.set) throw new Error ("Error StringTrajectory");
  set_function = desc.set;
  
  function descriptorInstrument ()
  {
    var instrumentedDesc = {};
    if (desc.get) instrumentedDesc.get = desc.get;

    instrumentedDesc.set = function (v) {
      traj.values = [this [_property], v];
      chrono.start ();
    }
    
    instrumentedDesc.configurable = desc.configurable;
    instrumentedDesc.enumerable = desc.enumerable;

    Object.defineProperty (comp, "__trans_anim_" + property, desc);
    Object.defineProperty (comp, property, instrumentedDesc);
  }
  
  removeTransitionAnimation (comp, property);
  descriptorInstrument ();
}

function removeTransitionAnimation (comp, property)
{
  var desc = comp.getPropertyDescriptor ("__trans_anim_" + property);
  if (desc) {
    Object.defineProperty (comp, property, desc);
    delete (comp ["__trans_anim_" + property]);
  }
}

