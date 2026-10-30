import Component from '../Component';
import { isFunction, isString } from 'vs_utils';
import { HandlerFunction } from './HandlerFunction';
import type Event from './Event';

/**
 * @class
 * Handler is a class that represents an event handler binding between an
 * EventSource and a Component.
 * 
 * Call Handler.retain() to get an instance from the pool.
 * Call Handler.release() to return an instance to the pool and release its resources.
 */
export default class Handler {
  static readonly #pool: Handler[] = [];
  #funcName: string | undefined;
  #funcPtr: Function | undefined;
  #obj: Component | undefined;
  #isPooled = false;

  get func(): string | Function | undefined {
    return this.#funcPtr || this.#funcName;
  }

  get obj(): Component | undefined {
    return this.#obj;
  }

  private constructor() {
  }

  configure(obj?: Component, func?: HandlerFunction): void {
    this.#obj = obj;
    this.#funcPtr = isFunction(func) ? func : undefined;
    this.#funcName = isString(func) ? func : undefined;
  }

  /**
   * Returns a function calling the handler callback with the event, as it
   * is now: later changes of the handler (release, reuse) do not affect it.
   * A callback given by name is looked up on the object when called.
   * Nothing is called when the object was deleted meanwhile (the event
   * is delivered asynchronously).
   */
  toListener(): (event: Event) => void {
    const obj = this.#obj;
    const funcPtr = this.#funcPtr;
    const funcName = this.#funcName;

    return (event: Event): void => {
      if (obj?.isDeleted?.()) return;

      const func = funcPtr ?? (obj && funcName ? (obj as unknown as Record<string, unknown>)[funcName] : undefined);
      if (isFunction(func)) {
        func.call(obj, event);
      }
    };
  }

  static retain(): Handler {
    const handler = Handler.#pool.pop() ?? new Handler();
    handler.#isPooled = false;
    return handler;
  }

  static release(handler: Handler) {
    // already in the pool: releasing it again would make two retain() return it
    if (handler.#isPooled) return;
    handler.#isPooled = true;

    // Clean up references
    handler.#obj = undefined;
    handler.#funcName = undefined;
    handler.#funcPtr = undefined;

    // Return to pool
    Handler.#pool.push(handler);
  }
}
