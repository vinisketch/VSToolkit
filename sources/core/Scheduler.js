/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and
  contributors. All rights reserved

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


// function Scheduler ()
// {
//   this.parent = core.EventSource;
//   this.parent (createId ());
//   this.constructor = vs.core.Scheduler;
// };
//
// Scheduler.prototype = {
//
// };
//util.extendClass (Scheduler, EventSource);
//

/**
 *  The vs.core.Task class
 *
 *  <p>
 *
 * Delegates:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.Task .
 *
 * @name vs.core.Task
 *
 * @param {Object} config the configuration structure
*/
function Task (conf)
{
  this.parent = core.Object;
  this.parent (conf);
  this.constructor = Task;
};

/**
 * The task is started
 * @const
 * @name vs.core.Task.STARTED
 */
Task.STARTED = 1;

/**
 * The task is stopped
 * @const
 * @name vs.core.Task.STOPPED
 */
Task.STOPPED = 0;

/**
 * The task is paused
 * @const
 * @name vs.core.Task.PAUSED
 */
Task.PAUSED = 2;

Task.prototype = {

/********************************************************************

********************************************************************/

  /**
   * TaskDelegate.
   * Methods are called when state changes (stop | pause)
   *
   *  <p>
   *  @example
   *  var delegate = {};
   *  delegate.taskDidEnd = function () { ... }
   *
   *  // Declare a PAR task including a SEC Task
   *  var task = new Task (...)
   *  task.delegate = delegate;
   *  task.start ();
   *
   * @name vs.core.Task#delegate
   *
   * @property {object}
   */
  delegate : null,

/********************************************************************
                  States
********************************************************************/
  /**
   *	@private
   */
  _state : Task.STOPPED,

/********************************************************************

********************************************************************/

  /**
   *  Default task destructor
   *
   * @name vs.core.Task#destructor
   * @function
   */
  destructor: function ()
  {
    this.stop ();
    this._super ();
  },
  
  /**
   *  Starts the task
   *
   * @name vs.core.Task#start
   * @function
   *
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start: function (param) {},

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the TaskDelegate.taskDidStop
   *  if it declared.
   *
   * @name vs.core.Task#stop
   * @function
   */
  stop: function () {},

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the TaskDelegate.taskDidPause
   *  if it declared.
   *
   * @name vs.core.Task#pause
   * @function
   */
  pause: function () {}
};
util.extendClass (Task, core.Object);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (Task, "state", {

  /**
   *  Return the task State. <br />
   *  Possible values: {@link vs.core.Task.STARTED},
   *  {@link vs.core.Task.STOPPED},
   *  {@link vs.core.Task.PAUSED}
   *
   * @name vs.core.Task#state
   *  @type {number}
   */
  get : function ()
  {
    return this._state;
  }
});

/**
 *  The vs.core.Task_PAR class
 *
 *  @extends vs.core.Task
 *
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The Task_PAR class provides a parallel group of tasks.<br />
 *  Task_PAR is a vs.core.Task that starts all its tasks when it is started itself.
 *  <br />
 *  The Task_SEQ ended when longest lasting task has ended.
 *
 *  <p>
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *
 *  Methods borrowed from class {@link vs.core.Task}:<br />
 *  &nbsp;&nbsp;&nbsp;&nbsp;{@link vs.core.Task#pause}, {@link vs.core.Task#start},
 *  {@link vs.core.Task#stop}
 *
 *  <p>
 *  @example
 *  // Declare two tasks (animations)
 *  var rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  var scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the Task_PAR
 *  var par = Task_PAR ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  par.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  var seq = new Task_SEQ
 *    ([scale, comp0], new Task_PAR ([rotate, comp1], [rotate, comp2]));
 *  seq.delegate = this;
 *  seq.start ();
 *
 *  @author David Thevenin
 *
 *  @borrows vs.core.Task#start as Task_PAR#start
 *
 *  @constructor
 *   Creates a new vs.core.Task.
 *
 * @name vs.core.Task_PAR
 *
 * @param list List of task to start parallel with an optional
 *  parameter
*/
function Task_PAR (tasksAndParams)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = Task_PAR;

  this._tasksAndParams = [];
  this._state = Task.STOPPED;

  if (arguments.length) this.setTasks (arguments);
};

/**
 *  Methods that create a PAR group
 *
 *  <p>
 *  @example
 *
 *  // Declare the Task_PAR
 *  var group = vs.par ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 * @param list List of task to start parallel with an optional
 *  parameter
 */
vs.par = function ()
{
  if (arguments.length === 0) return;

  var task = new Task_PAR ();
  task.setTasks (arguments);

  return task;
};

Task_PAR.prototype = {

/********************************************************************

********************************************************************/
  /**
   *	@private
  */
  _tasksAndParams : null,

  /**
   * taks ended
   *	@private
  */
  _tasksWillEnded : null,

/********************************************************************

********************************************************************/

  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name vs.core.Task_PAR#setTasks
   * @function
   *
   * @param list List of task to start parallel with an optional
   *  parameter
   */
  setTasks : function (tasksAndParams)
  {
    if (this._state !== Task.STOPPED) { return false; }
    var i, taskAndparam, task, param;

    this._tasksAndParams = [];
    for (i = 0; i < tasksAndParams.length; i ++)
    {
      taskAndparam = tasksAndParams [i];
      if (!taskAndparam) { continue; }

      param = null; task = null;

      if (util.isArray (taskAndparam))
      {
        if (taskAndparam.length === 1)
        {
          task = taskAndparam [0];
        }
        else if (taskAndparam.length === 2)
        {
          task = taskAndparam [0];
          param = taskAndparam [1];
        }
      }
      else
      {
        task = taskAndparam;
        param = null;
      }

      if (!task)
      {
        console.warn ('Undefined task');
        continue;
      }

      if (!task.start || !task.stop || !task.pause)
      {
        console.warn ('Invalid task: ' + task.toString ());
        continue;
      }

      this._tasksAndParams.push ([task, param]);
    }
  },

  /**
   *  Starts the task
   *
   * @name vs.core.Task_PAR#start
   * @function
   * @ignore
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start: function (param)
  {
    if (this._state === Task.STARTED) { return false; }
    this._tasksWillEnded = this._tasksAndParams.length;
    this._state = Task.STARTED;

    var taskAndparam, i;
    for (i = 0; i < this._tasksAndParams.length; i ++)
    {
      taskAndparam = this._tasksAndParams [i];

      taskAndparam [0].delegate = this;
      taskAndparam [0].start ((taskAndparam [1])?taskAndparam [1]:param);
    }

    return true;
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @function
   * @ignore
   */
  stop: function ()
  {
    if (this._state === Task.STOPPED) { return false; }
    this._state = Task.STOPPED;

    var taskAndparam, i;
    for (i = 0; i < this._tasksAndParams.length; i ++)
    {
      taskAndparam = this._tasksAndParams [i];
      taskAndparam [0].stop ();
    }

    return true;
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the taskDidPause if it exits.
   *  @ignore
   * @function
   */
  pause: function ()
  {
    if (this._state === Task.PAUSED) { return false; }
    this._state = Task.PAUSED;

    var taskAndparam, i;
    for (i = 0; i < this._tasksAndParams.length; i ++)
    {
      taskAndparam = this._tasksAndParams [i];
      taskAndparam [0].pause ();
    }

    return true;
  },

/********************************************************************
               delegate methodes
********************************************************************/

  /**
   * @protected
   * @function
   */
  taskDidStop : function (task)
  {
    this._state = Task.STOPPED;

    this._tasksWillEnded --;
    if (this._tasksWillEnded === 0)
    {
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  },

  /**
   * @protected
   * @function
   */
  taskDidPause : function (task)
  {
    this._state = Task.STOPPED;

    this._tasksWillEnded --;
    if (this._tasksWillEnded === 0)
    {
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  },

  /**
   * @protected
   * @function
   */
  taskDidEnd : function (task)
  {
    this._state = Task.STOPPED;

    this._tasksWillEnded --;
    if (this._tasksWillEnded === 0)
    {
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  }
};
util.extendClass (Task_PAR, Task);

/**
 *  The Task_SEQ class
 *
 *  @extends vs.core.Task
 *
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The Task_SEQ class provides a sequential group of tasks.<br />
 *  Task_SEQ is a vs.core.Task that runs its tasks in sequence, i.e., it starts
 *  one task after another has ended. <br />
 *  The tasks are started in the order they are defined within the constructor.
 *  <br />
 *  The Task_SEQ finishes when its last tasks has ended.
 *
 *  <p>
 *
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *
 *  Methods borrowed from class {@link vs.core.Task}:<br />
 *  &nbsp;&nbsp;&nbsp;&nbsp;{@link vs.core.Task#pause}, {@link vs.core.Task#start},
 *  {@link vs.core.Task#stop}
 *
 *  @example
 *  // Declare two tasks (animations)
 *  var rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  var scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the Task_SEQ
 *  var seq = Task_SEQ ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations sequentially
 *  seq.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  var seq = new Task_SEQ
 *    ([scale, comp0], new Task_PAR ([rotate, comp1], [rotate, comp2]));
 *  seq.delegate = this;
 *  seq.start ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.Task_SEQ.
 *
 * @name vs.core.Task_SEQ
 *
 * @param list List of task to start sequentially with an optional
 *  parameter
 */
function Task_SEQ (tasksAndParams)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = Task_SEQ;

  this._tasksAndParams = [];
  this._state = Task.STOPPED;

  if (arguments.length) this.setTasks (arguments);
};

/**
 *  Methods that create a SEQ group
 *
 *  <p>
 *  @example
 *
 *  // Declare the Task_PAR
 *  var group = vs.seq ([scale, comp0], [rotate, comp0]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 * @param list List of task to start sequentially with an optional
 *  parameter
 */
vs.seq = function ()
{
  if (arguments.length === 0) return;

  var task = new Task_SEQ ();
  task.setTasks (arguments);

  return task;
};

Task_SEQ.prototype = {

/********************************************************************

********************************************************************/
  /**
   *	@private
  */
  _tasksAndParams : null,

  /**
   *	@private
  */
  _nextTaskToStart : 0,

  /**
   *	@private
  */
  _startParam : null,

/********************************************************************

********************************************************************/

  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name vs.core.Task_SEQ#setTasks
   * @function
   *
   * @param list List of task to start parallel with an optional
   *  parameter
   */
  setTasks : function (tasksAndParams)
  {
    if (this._state !== Task.STOPPED) { return false; }
    var i, taskAndparam, task, param;

    this._tasksAndParams = [];
    for (i = 0; i < tasksAndParams.length; i ++)
    {
      taskAndparam = tasksAndParams [i];
      if (!taskAndparam) { continue; }

      param = null; task = null;

      if (util.isArray (taskAndparam))
      {
        if (taskAndparam.length === 1)
        {
          task = taskAndparam [0];
        }
        else if (taskAndparam.length === 2)
        {
          task = taskAndparam [0];
          param = taskAndparam [1];
        }
      }
      else
      {
        task = taskAndparam;
        param = null;
      }

      if (!task)
      {
        console.warn ('Undefined task');
        continue;
      }

      if (!task.start || !task.stop || !task.pause)
      {
        console.warn ('Invalid task: ' + task.toString ());
        continue;
      }

      this._tasksAndParams.push ([task, param]);
    }
  },

  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start: function (param)
  {
    if (this._state === Task.STARTED) { return false; }
    this._state = Task.STARTED;

    this._startParam = param;

    var taskAndparam = this._tasksAndParams [this._nextTaskToStart];
    if (!taskAndparam) { return false; }

    this._nextTaskToStart++;
    taskAndparam [0].delegate = this;
    taskAndparam [0].start ((taskAndparam [1])?taskAndparam [1]:param);

    return true;
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop: function ()
  {
    if (this._state === Task.STOPPED) { return false; }
    this._state = Task.STOPPED;

    var taskAndparam = this._tasksAndParams [this._nextTaskToStart - 1];
    if (!taskAndparam) { return false; }

    this._nextTaskToStart = 0;
    taskAndparam [0].stop ();

    return true;
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause: function ()
  {
    if (this._state === Task.PAUSED) { return false; }
    this._state = Task.PAUSED;

    var taskAndparam = this._tasksAndParams [this._nextTaskToStart - 1];
    if (!taskAndparam) { return false; }

    taskAndparam [0].pause ();

    return true;
  },

/********************************************************************
               delegate methodes
********************************************************************/

  /**
   * @protected
   * @function
   */
  taskDidStop : function (task)
  {
    this._state = Task.STOPPED;

    if (this._nextTaskToStart === 0)
    { this._nextTaskToStart = this._nextTaskToStart - 1; }

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }
  },

  /**
   * @protected
   * @function
   */
  taskDidPause : function (task)
  {
    this._state = Task.PAUSED;

    this._nextTaskToStart = this._nextTaskToStart - 1;

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }
  },

  /**
   * @protected
   * @function
   */
  taskDidEnd : function (task)
  {
    this._state = Task.STOPPED;

    if (this._nextTaskToStart < this._tasksAndParams.length)
    {
      // start the next task
      this.start (this._startParam);
    }
    else
    {
      this._nextTaskToStart = 0;
      if (this.delegate && this.delegate.taskDidEnd)
      { this.delegate.taskDidEnd (this); }
    }
  }
};
util.extendClass (Task_SEQ, Task);

/**
 *  The vs.core.TaskWait class
 *
 *  @extends vs.core.Task
 *
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The vs.core.TaskWait class provides ...
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.TaskWait.
 *
 * @name vs.core.TaskWait
 *
 * @param time The time to wait, using millisecond
 *  parameter
 */
function TaskWait (time)
{
  this.parent = core.Task;
  this.parent ();
  this.constructor = TaskWait;
  this._state = Task.STOPPED;

  this.time = time;
};

TaskWait.prototype = {

/********************************************************************

********************************************************************/
  /**
   *	@private
  */
  _time : 0,
  _left_time : 0,

  /**
   *	@private
   */
  _timer : null,

  /**
   *	@private
   */
  _start_time : 0,

/********************************************************************

********************************************************************/

  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start: function ()
  {
    var self = this, time = this._time;
    if (this._state === Task.STARTED) { return false; }
    if (this._state === Task.PAUSED)
    { time = this._left_time; }
    else
    { this._left_time = time; }

    this._state = Task.STARTED;

    this._start_time = new Date ().getTime ();
    var self = this;
    this._timer = setTimeout (function ()
    {
      self._state = Task.STOPPED;
      if (self.delegate && self.delegate.taskDidEnd)
      { self.delegate.taskDidEnd (self); }
    }, time);

    return true;
  },

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop: function ()
  {
    if (this._state === Task.STOPPED) { return false; }
    this._state = Task.STOPPED;

    clearTimeout (this._timer);
    this._timer = null;

    this._left_time = this._time;

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }

    return true;
  },

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause: function ()
  {
    if (this._state === Task.PAUSED) { return false; }
    this._state = Task.PAUSED;

    this._left_time =
      this._left_time - new Date ().getTime () + this._start_time;

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }

    return true;
  }
};
util.extendClass (TaskWait, Task);

util.defineClassProperty (TaskWait, "state", {

  /**
   * Set the task time, using millisecond. <br />
   * @name vs.core.TaskWait#time
   * @type {number}
   */
  set : function (v)
  {
    if (!util.isNumber (v)) { return; }
    this._time = v;
  }
});

/********************************************************************
                      Export
*********************************************************************/
util.extend (core, {
  Task:        Task,
  Task_PAR:    Task_PAR,
  Task_SEQ:    Task_SEQ,
  TaskWait:    TaskWait
});

