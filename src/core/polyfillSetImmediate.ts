// Actions queue. This array contains all actions (Action object)
// that have to be executed.
import { asError, container } from 'vs_utils';
import { Action } from './Action';
import { ILogger, LOGGER, consoleLogger } from './ILogger';

let mainActionsQueue: Action[] = [];
let tmpActionsQueue: Action[] = [];
let scheduleDoActions: () => void;
let areActionsScheduled = false;

let _logger: ILogger | null = null;
// resolved when first needed (an error to log), console when no LOGGER is
// registered
const getLogger = (): ILogger => {
  if (!_logger) {
    try {
      _logger = container.get(LOGGER);
    } catch {
      _logger = consoleLogger;
    }
  }
  return _logger;
}

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
  const queue = mainActionsQueue;
  const logger = getLogger();

  areActionsScheduled = false;

  if (queue.length) {
    // switch queues
    mainActionsQueue = tmpActionsQueue;
    tmpActionsQueue = queue;

    // execute actions
    let i = 0;
    const l = queue.length;
    for (; i < l; i++) {
      const action = queue [i];
      try {
        action.run();
      }
      catch (e) {
        const err = asError(e);
        if (err.stack) logger.error (err.stack);
        else logger.error (e);
      } finally {
        Action.release(action);
      }
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

  function onGlobalMessage(event: MessageEvent) {
    // Verify origin matches current globalThis for security
    if (event.origin !== globalThis.location.origin) {
      return;
    }
    if (event.data === MESSAGE_PREFIX) {
      doAllActions();
    }
  }

  if (globalThis.addEventListener) {
    globalThis.addEventListener('message', onGlobalMessage, false);
  }

  return () => globalThis.postMessage(MESSAGE_PREFIX, globalThis.location.origin);
}

// scheduleDoActions, asynchronously execute pending actions.
// if postMessage exists, use it (this is the faster way)
// otherwise use traditional setTimeout (f, 0) that add a minimum 4ms delay
export function initSetImmediatePolyfill(): (func: () => void) => void {
  scheduleDoActions = installPostMessageImplementation();
  return queueAction;
}

export function runImmediatePolyfill(): void {
  if (mainActionsQueue.length) scheduleDoActions();
}
