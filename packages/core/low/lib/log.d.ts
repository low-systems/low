/**
 * TODO:
 * Turn this into a `Module` and have a `log` method in `Environment` that calls all registered Log
 * modules. These modules will each have their own `log` method
*/
import { Context, Environment } from "./environment";
export declare enum LogLevel {
    LOG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 4
}
export declare type LogContext = Context | Environment | null | undefined;
export declare class Log {
    static getContextLabel(logContext: LogContext): any;
    static getContextLogLevel(logContext: LogContext): LogLevel;
    static when(context: LogContext, when: LogLevel, message?: any, ...args: any[]): boolean;
    static log(context: LogContext, message?: any, ...args: any[]): boolean;
    static info(context: LogContext, message?: any, ...args: any[]): boolean;
    static warn(context: LogContext, message?: any, ...args: any[]): boolean;
    static error(context: LogContext, message?: any, ...args: any[]): boolean;
}
