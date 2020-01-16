import { Module } from "../module";
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger<C, S> extends Module<C, S> {
    debug(label: string, ...args: any[]): Promise<void>;
    info(label: string, ...args: any[]): Promise<void>;
    warn(label: string, ...args: any[]): Promise<void>;
    error(label: string, ...args: any[]): Promise<void>;
}
export interface LogContext {
    logLevel?: LogLevel;
    env?: {
        logLevel: LogLevel;
    };
}
