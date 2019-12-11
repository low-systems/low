import { Log, LogLevel } from './log';
import { Context, Environment } from './environment';

test('should only log when message log level is greater than or equal to the context log level', () => {
  const context: Context = {
    env: new Environment({}, [], {}),
    logLevel: LogLevel.WARN
  };

  expect(Log.log(context, 'Test Log 1: Should not log')).toBeFalsy();
  expect(Log.info(context, 'Test Info 1: Should not log')).toBeFalsy();
  expect(Log.warn(context, 'Test Warn 1: Should log')).toBeTruthy();
  expect(Log.error(context, 'Test Error 1: Should log')).toBeTruthy();

  context.logLevel = LogLevel.LOG;

  expect(Log.log(context, 'Test Log 2: Should log')).toBeTruthy();
  expect(Log.info(context, 'Test Info 2: Should log')).toBeTruthy();
  expect(Log.warn(context, 'Test Warn 2: Should log')).toBeTruthy();
  expect(Log.error(context, 'Test Error 2: Should log')).toBeTruthy();
});