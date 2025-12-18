import { isFunction, isString } from 'vs_utils';
export default class Handler {
    static #pool = [];
    #funcName;
    #funcPtr;
    #obj;
    get func() {
        return this.#funcPtr || this.#funcName;
    }
    get obj() {
        return this.#obj;
    }
    constructor() {
        Handler.#pool.push(this);
    }
    configure(obj, func) {
        this.#obj = obj;
        if (isFunction(func)) {
            this.#funcPtr = func;
        }
        else if (isString(func)) {
            this.#funcName = func;
        }
    }
    release() {
        Handler.#pool.push(this);
    }
    static retain() {
        if (Handler.#pool.length) {
            return Handler.#pool.pop();
        }
        return new Handler();
    }
    static release(handler) {
        Handler.#pool.push(handler);
    }
}
//# sourceMappingURL=Handler.js.map