/**
 * TODO:
 * Turn this into a `Module` and have a `log` method in `Environment` that calls all registered Log
 * modules. These modules will each have their own `log` method
*/

import * as Crypto from 'crypto';

import { Context, Environment } from "./environment";

export enum LogLevel {
  LOG = 0,
  INFO = 1 << 0,
  WARN = 1 << 1,
  ERROR = 1 << 2
}

export type LogContext = Context | Environment | null | undefined;

export class Log {
  static getContextLabel(logContext: LogContext) {
    if (typeof logContext !== 'object' || logContext === null) {
      return 'GLOBAL';
    }

    if (logContext instanceof Environment) {
      return 'ENVIRONMENT';
    }

    if (!logContext.hasOwnProperty('uid')) {
      logContext.uid = Crypto.randomBytes(4).toString('hex');
    }

    return logContext.uid;
  }

  static getContextLogLevel(logContext: LogContext) {
    if (typeof logContext !== 'object' || logContext === null) {
      return LogLevel.ERROR;
    }

    if (typeof logContext.logLevel === 'number') {
      //HACK: TSC thinks that it's possible for `logContext` to be `undefined` here?!
      return logContext.logLevel;
    }

    if (logContext.hasOwnProperty('env') && (logContext as Context).env instanceof Environment) {
      return (logContext as Context).env.logLevel;
    }

    return LogLevel.ERROR;
  }

  static when(context: LogContext, when: LogLevel, message?: any, ...args: any[]) {
    const contextLogLevel = Log.getContextLogLevel(context);
    const contextLabel = Log.getContextLabel(context);

    if (when & contextLogLevel) {
      console.log.apply(console, [contextLabel, message, ...args]);
      return true;
    }

    return false;
  }

  static log(context: LogContext, message?: any, ...args: any[]) {
    const contextLogLevel = Log.getContextLogLevel(context);
    if (LogLevel.LOG < contextLogLevel) { return false; }

    const contextLabel = Log.getContextLabel(context);
    console.log.apply(console, [contextLabel, message, ...args]);
    return true;
  }

  static info(context: LogContext, message?: any, ...args: any[]) {
    const contextLogLevel = Log.getContextLogLevel(context);
    if (LogLevel.INFO < contextLogLevel) { return false; }

    const contextLabel = Log.getContextLabel(context);
    console.info.apply(console, [contextLabel, message, ...args]);
    return true;
  }

  static warn(context: LogContext, message?: any, ...args: any[]) {
    const contextLogLevel = Log.getContextLogLevel(context);
    if (LogLevel.WARN < contextLogLevel) { return false; }

    const contextLabel = Log.getContextLabel(context);
    console.warn.apply(console, [contextLabel, message, ...args]);
    return true;
  }

  static error(context: LogContext, message?: any, ...args: any[]) {
    const contextLogLevel = Log.getContextLogLevel(context);
    if (LogLevel.ERROR < contextLogLevel) { return false; }

    const contextLabel = Log.getContextLabel(context);
    console.error.apply(console, [contextLabel, message, ...args]);
    return true;
  }
}
