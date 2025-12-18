/**
 *  Structure used for managing events
 *  @private
 */
export class Action {
  private static pool: Action[] = [];

  private func: ((...arg: unknown[]) => void) | undefined;
  private ctx: any | undefined;

  configure(func: (...args: any[]) => void, ctx?: any) {
    this.func = func;
    this.ctx = ctx;
  }

  /**
   * Run the action. This method is called with our setImmediate
   * implementation
   */
  run = (): void => this.func?.call(this.ctx);

  static retain(): Action {
    if (Action.pool.length > 0) {
      return Action.pool.pop()!;
    }
    return new Action();
  }

  static release(action: Action): void {
    Action.pool.push(action);
  }
}
