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


/*
 *----------------------------------------------------------------------
 *
 * _DoOneEvent --
 *
 *  Process a single event of some sort.  If there's no work to
 *  do, wait for an event to occur, then process it.
 *
 *
 *----------------------------------------------------------------------
 */

/**
 *  Structure used for managing events
 *  @private
 */
function Handler (_obj, _func) {
  this.obj = _obj;
  if (util.isFunction (_func)) {
    this.func_ptr = _func;
  }
  else if (util.isString (_func)) {
    this.func_name = _func;
  }
}

/**
 * @private
 */
Handler.prototype.destructor = function () {
  delete (this.obj);
  delete (this.func_ptr);
  delete (this.func_name);
};

/**
 *  Structure used for managing task
 *  @private
 */
function TaskHandler (func, args) {
  this.func_ptr = func;
  this.args = args;
}

/**
 * @private
 */
TaskHandler.prototype.run = function () {
  this.func_ptr.apply (undefined);
};

/**
 * @private
 */
TaskHandler.prototype.destructor = function () {
  delete (this.args);
  delete (this.func_ptr);
};

/**
 * @private
 */
var
  // Events queue. This array contains event structure for future propagation.
  // This array is part of the algorithm that secure event propagation, in
  // particular that avoids a event pass a previous one.
  _async_events_queue = [],
  
  // Event reference on the current synchronous event.
  _sync_event = null,
  
  // Actions queue. This array contains all actions (function for the moment)
  // that have to be execute.
  // This queue is used only in case we use our own implementation of 
  // setImmediate.
  _actions_queue  = [],
  // Boolean indicating if we are propagating a event or not.
  // To secure event propagation, in particular to avoid a event pass a previous
  // event, we manage a events queue and block new propagation if a event is
  // in propagation.
  _is_async_events_propagating = false,
  _is_sync_events_propagating = false,
  
  // Boolean indicating if we are running an action or not.
  // This boolean is used only in case we use our own implementation of 
  // setImmediate.
  _is_action_runing = false,
  _is_waiting = false;

/**
 * Put an asynchronous event into the event queue and request the mainloop
 *
 * @private
 */
function queueProcAsyncEvent (event, handler_list) {
  if (!event || !handler_list) return;

  var burst = {
    handler_list : handler_list,
    event : event
  }

  // push the event to dispatch into the queue
  _async_events_queue.push (burst);

  // request for the mainloop
  serviceLoop ();
}

/**
 * Setup a synchronous event and request the mainloop
 *
 * @private
 */
function queueProcSyncEvent (event, handler_list) {
  if (!event || !handler_list) return;

  var burst = {
    handler_list : handler_list,
    event : event
  }

  // push the event to dispatch into the queue
  _sync_event = burst;

  // request for the mainloop
  serviceLoop ();
}

/**
 * doOneEvent will dispatch One event to all observers.
 *
 * @private
 * @param {Object} burst a event burst structure
 * @param {Boolean} isSynchron if its true the callbacks are executed
 *             synchronously, otherwise they are executed within a setImmediate
 */
function doOneEvent (burst, isSynchron) {
  var
    handler_list = burst.handler_list,
    n = handler_list.length,
    i = n, l = n,
    event = burst.event;

  if (isSynchron) _is_sync_events_propagating = true;
  else _is_async_events_propagating = true;
  
  // Test is all observers have been called
  function end_propagation () {
    l--;
    if (l <= 0) {
      if (isSynchron) _is_sync_events_propagating = false;
			else _is_async_events_propagating = false;
		}
  }

  /**
   * doOneHandler will dispatch One event to an observer.
   *
   * @private
   * @param {Handler} handler
   */
  function doOneHandler (handler) {
    if (handler) try {
      if (util.isFunction (handler.func_ptr)) {
        // call function
        handler.func_ptr.call (handler.obj, event);
      }
      else if (util.isString (handler.func_name) &&
               util.isFunction (handler.obj[handler.func_name]))
      {
        // specific notify method
        handler.obj[handler.func_name] (event);
      }
      else if (util.isFunction (handler.obj.notify)) {
        // default notify method
        handler.obj.notify (event);
      }
    }
    catch (e) {
      if (e.stack) console.error (e.stack);
      else console.error (e);
    }
    end_propagation ();
  };

  if (!i) end_propagation (); // should not occur
  
  // For each observers, schedule the handler call (callback execution)
  for (i = 0; i < n; i++) {
    if (isSynchron) doOneHandler (handler_list [i])
  
    else (function (handler) {
        vs.setImmediate (function () { doOneHandler(handler) });
      }) (handler_list [i])
  }
}

/**
 * doOneAsyncEvent will dispatch One event to all observers.
 *
 * @private
 */
function doOneAsyncEvent () {
  if (_is_async_events_propagating || _is_sync_events_propagating) return;
  
  // dequeue the next event burst and do it
  doOneEvent (_async_events_queue.shift ());
}

/**
 * doOneSyncEvent will dispatch the synchronous event to all observers.
 *
 * @private
 */
function doOneSyncEvent () {
  doOneEvent (_sync_event, true);
  _sync_event = null;
}

/**
 * doAction, execute one action. This method is called with our setImmediate
 * implementation.
 *
 * @private
 */
function doAction () {

  if (!_actions_queue.length) return;
  
  var action = _actions_queue.shift ();

  if (action) try {
    _is_action_runing = true;
    action.run ();
  }
  catch (e) {
    if (e.stack) console.error (e.stack);
    else console.error (e);
  }

  vs.util.free (action);
  _is_action_runing = false;

  if (_actions_queue.length) { _delay_do_action (); }
}

/**
 * doAction, execute one action. This method is called with our setImmediate
 * implementation.
 *
 * @private
 */
function installPostMessageImplementation () {

  var MESSAGE_PREFIX = "vs.core.scheduler" + Math.random ();

  function onGlobalMessage (event) {
    if (event.data === MESSAGE_PREFIX) {
      doAction ();
    }
  }
  
  if (window.addEventListener) {
    window.addEventListener ("message", onGlobalMessage, false);
  }

  return function () {
    window.postMessage (MESSAGE_PREFIX, "*");
  };
}

var _delay_do_action = (window.postMessage)?installPostMessageImplementation():
  function () {setTimeout (doAction, 0)};

/**
 * Install our awn setImmediate implementation, if needs
 *
 * @private
 */
var setImmediate = window.setImmediate || function (func) {

  // push the action to execute into the queue
  _actions_queue.push (new TaskHandler (func));

  // doAction
  if (!_is_action_runing) _delay_do_action ();
};

/**
 * This method is used to break-up long running operations and run a callback
 * function immediately after the browser has completed other operations such
 * as events and display updates.
 *
 * @example
 * vs.setImmediate (function () {...});
 *
 * @see vs.scheduleAction
 * @name vs.setImmediate 
 * @param {Function} func The action to run
 */
vs.setImmediate = setImmediate;

/**
 * Mainloop core
 *
 * @private
 */
function serviceLoop () {

  if (_sync_event) doOneSyncEvent ();

  if ((_async_events_queue.length === 0 && _actions_queue.length === 0) ||
      _is_waiting) return;

  function loop () {
    _is_waiting = false;
    serviceLoop ();
  }

  if (_is_async_events_propagating || _is_sync_events_propagating) {
    // do the loop
    vs.setImmediate (loop);
    return;
  }

  // dispatch an event to observers
  if (!_is_action_runing && _actions_queue.length) _delay_do_action ();
  if (_async_events_queue.length) doOneAsyncEvent ();
}

/** 
 * Schedule your action on next frame.
 *
 * @example
 * vs.scheduleAction (function () {...}, vs.ON_NEXT_FRAME);
 *
 * @see vs.scheduleAction
 *
 * @name vs.ON_NEXT_FRAME 
 * @type {String}
 * @const
 * @public
 */ 
var ON_NEXT_FRAME = '__on_next_frame__';

/** 
 * Schedule an action to be executed asynchronously.
 * <br />
 * There is three basic scheduling; the action can be executed:
 * <ul>
 *   <li>as soon as possible.
 *   <li>on the next frame
 *   <li>after a delay
 * </ul>
 *
 * 1- As soon as possible<br />
 * The action will be executed as soon as possible in a manner that is
 * typically more efficient and consumes less power than the usual
 * setTimeout(..., 0) pattern.<br />
 * It based on setImmediate if it is available; otherwise it will use postMessage
 * if it is possible and at least setTimeout(..., 0) pattern if previous APIs are
 * not available.
 *<br /><br />
 *
 * 2- On next frame<br />
 * The action will be executed on next frame.<br />It is equivalent to use
 * window.requestAnimationFrame.
 *<br /><br />
 *
 * 2- After a delay<br />
 * The action will be executed after a given delay in millisecond.<br />
 * It is equivalent to use window.setTimeout(..., delay).
 *
 * @example
 * // run asap
 * vs.scheduleAction (function () {...});
 * // run on next frame
 * vs.scheduleAction (function () {...}, vs.ON_NEXT_FRAME);
 * // run after 1s
 * vs.scheduleAction (function () {...}, 1000);
 *
 * @name vs.scheduleAction 
 * @type {String}
 * @function
 * @public
 *
 * @param {Function} func The action to run
 * @param {(Number|String)} delay when run the action [optional]
 */ 
function scheduleAction (func, delay) {
  if (!util.isFunction (func)) return;
  if (delay && util.isNumber (delay)) {
    setTimeout (func, delay);
  }
  else if (delay === ON_NEXT_FRAME) {
    vs.requestAnimationFrame (func);
  }
  else vs.setImmediate (func);
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
util.extend (vs, {
  scheduleAction: scheduleAction,
  ON_NEXT_FRAME: ON_NEXT_FRAME
});
