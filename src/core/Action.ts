import { defined } from 'vs_utils';

/**
 *  Structure used for managing events
 *  @private
 */
export class Action {
  private static readonly pool: Action[] = [];

  private func: ((...arg: unknown[]) => void) | undefined;
  private ctx: any | undefined;

  private constructor() {
    // empty
  }

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
      return defined(Action.pool.pop());
    }
    return new Action();
  }

  static release(action: Action): void {
    // reset action
    action.func = undefined;
    action.ctx = undefined;

    // put back in pool
    Action.pool.push(action);
  }
}
