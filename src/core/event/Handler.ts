import Component from '../Component';
import { isFunction, isString } from 'vs_utils';

export type HandlerFunction = string | Function;

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

    if (isFunction(func)) {
      this.#funcPtr = func;
    } else if (isString(func)) {
      this.#funcName = func;
    }
  }

  static retain(): Handler {
    if (Handler.#pool.length > 0) {
      return Handler.#pool.pop()!;
    }
    return new Handler();
  }

  static release(handler: Handler) {
    // Clean up references
    handler.#obj = undefined;
    handler.#funcName = undefined;
    handler.#funcPtr = undefined;

    // Return to pool
    Handler.#pool.push(handler);
  }
}
