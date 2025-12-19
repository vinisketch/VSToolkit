import Component from '../Component';
export type HandlerFunction = string | Function;
export default class Handler {
    #private;
    get func(): string | Function | undefined;
    get obj(): Component | undefined;
    constructor();
    configure(obj?: Component, func?: HandlerFunction): void;
    release(): void;
    static retain(): Handler;
    static release(handler: Handler): void;
}
//# sourceMappingURL=Handler.d.ts.map