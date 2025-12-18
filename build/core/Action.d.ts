/**
 *  Structure used for managing events
 *  @private
 */
export declare class Action {
    private static pool;
    private func;
    private ctx;
    configure(func: (...args: any[]) => void, ctx?: any): void;
    /**
     * Run the action. This method is called with our setImmediate
     * implementation
     */
    run: () => void;
    static retain(): Action;
    static release(action: Action): void;
}
//# sourceMappingURL=Action.d.ts.map