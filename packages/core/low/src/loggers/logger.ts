import { Module } from "../module";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger<C, S> extends Module<C, S> /* implements LogMethods */ {
  async debug(label: string, ...args: any[]) {
    console.log.apply(console, [label, ...args]);
  }

  async info(label: string, ...args: any[]) {
    console.info.apply(console, [label, ...args]);
  }

  async warn(label: string, ...args: any[]) {
    console.warn.apply(console, [label, ...args]);
  }

  async error(label: string, ...args: any[]) {
    console.error.apply(console, [label, ...args]);
  }
}

export interface LogContext {
  logLevel?: LogLevel;
  env?: { logLevel: LogLevel };
}