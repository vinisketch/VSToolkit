import Component from '../Component';
import { isFunction, isString } from 'vs_utils';

export type HandlerFunction = string | Function;

export default class Handler {
  static #pool: Handler[] = [];
  #funcName: string | undefined;
  #funcPtr: Function | undefined;
  #obj: Component | undefined;

  get func(): string | Function | undefined {
    return this.#funcPtr || this.#funcName;
  }

  get obj(): Component | undefined {
    return this.#obj;
  }

  constructor() {
    Handler.#pool.push(this);
  }

  configure(obj?: Component, func?: HandlerFunction): void {
    this.#obj = obj;

    if (isFunction(func)) {
      this.#funcPtr = func;
    } else if (isString(func)) {
      this.#funcName = func;
    }
  }

  release(): void {
    Handler.#pool.push(this);
  }

  static retain(): Handler {
    if (Handler.#pool.length) {
      return Handler.#pool.pop()!;
    }
    return new Handler();
  }

  static release(handler: Handler) {
    Handler.#pool.push(handler);
  }
}
