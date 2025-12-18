// Actions queue. This array contains all actions (Action object)
// that have to be executed.
import { Action } from './Action';

let mainActionsQueue: Action[] = [];
let tmpActionsQueue: Action[] = [];
let scheduleDoActions: () => void;
let areActionsScheduled = false;

function queueAction(func: ()=> void, ctx?: any) {
  const action = Action.retain();
  action.configure (func, ctx);

  mainActionsQueue.push(action);

  if (!areActionsScheduled) {
    areActionsScheduled = true;
    scheduleDoActions();
  }
}

function doAllActions () {
  var queue = mainActionsQueue;

  areActionsScheduled = false;

  if (queue.length) {

    // switch queues
    mainActionsQueue = tmpActionsQueue;
    tmpActionsQueue = queue;

    try {
      // execute actions
      var i = 0, l = queue.length, func;
      for (; i < l; i++) {
        func = queue [i];
        func.run();
      }
    }
    catch (e) {
      if (e.stack) console.error (e.stack);
      else console.error (e);
    }
    // clean the queue
    queue.length = 0;
  }
}

/**
 * doAction, execute one action. This method is called with our setImmediate
 * implementation.
 *
 * @private
 */
function installPostMessageImplementation():() => void {
  const MESSAGE_PREFIX = `_scheduler_${Date.now()}_${Math.random()}`;

  function onGlobalMessage(event: Event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (event.data === MESSAGE_PREFIX) {
      doAllActions();
    }
  }

  if (window.addEventListener) {
    window.addEventListener('message', onGlobalMessage, false);
  }

  return () => window.postMessage(MESSAGE_PREFIX, '*');
}

// scheduleDoActions, asynchronously execute pending actions.
// if postMessage exists, use it (this is the faster way)
// otherwise use traditional setTimeout (f, 0) that add a minimum 4ms delay
export function initSetImmediatePolyfill(): (func: () => void) => void {
  scheduleDoActions = (window.postMessage)?
    installPostMessageImplementation ():
    function () { setTimeout (doAllActions, 0) };

  return queueAction;
}

export function runImmediatePolyfill(): void {
  if (mainActionsQueue.length) scheduleDoActions();
}
