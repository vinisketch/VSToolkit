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
