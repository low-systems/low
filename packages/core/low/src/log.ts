import { Context } from "./environment";

export enum LogLevel {
  LOG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 4
}

export class Log {
  static shouldLog(context: Context, logLevel: LogLevel) {
    let contextLogLevel = LogLevel.ERROR;
    if (typeof context === 'object' && context !== null) {
      if (typeof context.env === 'object' && context.env !== null && typeof context.env.logLevel === 'number') {
        contextLogLevel = context.env.logLevel;
      }
      if (typeof context.logLevel === 'number') {
        contextLogLevel = context.logLevel;
      }
    }
    return logLevel >= contextLogLevel;
  }

  static log(context: Context, message?: any, ...args: any[]) {
    if (!Log.shouldLog(context, LogLevel.LOG)) { return false; }
    console.log.apply(console, [message, ...args]);
    return true;
  }

  static info(context: Context, message?: any, ...args: any[]) {
    if (!Log.shouldLog(context, LogLevel.INFO)) { return false; }
    console.info.apply(console, [message, ...args]);
    return true;
  }

  static warn(context: Context, message?: any, ...args: any[]) {
    if (!Log.shouldLog(context, LogLevel.WARN)) { return false; }
    console.warn.apply(console, [message, ...args]);
    return true;
  }

  static error(context: Context, message?: any, ...args: any[]) {
    if (!Log.shouldLog(context, LogLevel.ERROR)) { return false; }
    console.error.apply(console, [message, ...args]);
    return true;
  }
}
