/**
 * doAction, execute one action. This method is called with our setImmediate
 * implementation.
 *
 * @private
 */
export default function installPostMessageImplementation(doAllActions: () => void):() => void {
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
