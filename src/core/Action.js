/**
 *  Structure used for managing events
 *  @private
 */
export class Action {
    static pool = [];
    func;
    ctx;
    configure(func, ctx) {
        this.func = func;
        this.ctx = ctx;
    }
    /**
     * Run the action. This method is called with our setImmediate
     * implementation
     */
    run = () => this.func?.call(this.ctx);
    static retain() {
        if (Action.pool.length > 0) {
            return Action.pool.pop();
        }
        return new Action();
    }
    static release(action) {
        Action.pool.push(action);
    }
}
//# sourceMappingURL=Action.js.map