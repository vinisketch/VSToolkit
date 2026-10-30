import { injectionToken } from "vs_utils";

interface LeveledLogMethod {
  (message: string): void;
  (message: string, meta: any): void;
  (message: string, ...meta: any[]): void;
  (message: any): void;
  (infoObject: object): void;
}

export interface ILogger {
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  info: LeveledLogMethod;
  debug: LeveledLogMethod;
  verbose: LeveledLogMethod;
}

export const LOGGER = injectionToken<ILogger>('LOGGER');

/**
 * Logger writing to the console, used when no LOGGER is registered
 */
export const consoleLogger: ILogger = {
  error: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.warn(...args),
  info: (...args: any[]) => console.info(...args),
  debug: (...args: any[]) => console.debug(...args),
  verbose: (...args: any[]) => console.debug(...args),
};
