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
export declare const LOGGER: {
    id: Symbol;
    cast: (param: unknown) => ILogger;
    toString(): string;
};
export {};
//# sourceMappingURL=ILogger.d.ts.map