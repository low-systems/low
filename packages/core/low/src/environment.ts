import { EventEmitter2 } from 'eventemitter2';
import * as Crypto from 'crypto';

import { CacheManager } from './cache-managers/cache-manager';
import { Connector } from './connectors/connector';
import { Doer } from './doers/doer';
import { MultiDoer } from './doers/multi-doer';
import { Logger, LogLevel } from './loggers/logger';
import { BooleanParser } from './parsers/boolean-parser';
import { IntegerParser } from './parsers/integer-parser';
import { FloatParser } from './parsers/float-parser';
import { JsonParser } from './parsers/json-parser';
import { StringParser } from './parsers/string-parser';
import { UrlParser } from './parsers/url-parser';
import { QuerystringParser } from './parsers/querystring-parser';
import { Renderer } from './renderers/renderer';
import { ModuleManager } from './module-manager';
import { TaskManager } from './task-manager';

const builtIns = [
  new CacheManager(),
  new Connector(),
  new Doer(),
  new MultiDoer(),
  new Logger(),
  new BooleanParser(),
  new IntegerParser(),
  new FloatParser(),
  new JsonParser(),
  new StringParser(),
  new UrlParser(),
  new QuerystringParser(),
  new Renderer(),
];

/**
 * The Environment class is the core of a `low` system.
 * If you are using `low` you should create an instance of this
 * with your Modules, Tasks, and Configurations, and initialise it.
 */
export class Environment extends EventEmitter2 {
  /**
   * Any sensitive configuration information loaded into the
   * Environment using [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable)
   */
  secrets: any = {};

  logLevel: LogLevel = LogLevel.ERROR;

  moduleManager = new ModuleManager();
  taskManager = new TaskManager();

  /**
   * Create a new `Environment` instance
   * @param modules       A collection of instances of all external modules to be made available in the Environment
   * @param tasks         A list of all task configurations available in the Environment
   * @param config        Any configuration information for your modules and metadata your tasks may require
   * @param secretsName   The name of an system level environment variable that holds an `EnvironmentConfig` with information to sensitive to go into code
   */
  constructor(public metadata: any = {}, secrets: any = 'SECRETS') {
    super();
    this.onAny(this.globalListener.bind(this));
    this.loadSecrets(secrets);
  }

  loadSecrets(secrets: any) {
    if (!secrets) {
      this.secrets = {};
    }

    if (typeof secrets === 'object') {
      this.secrets = secrets;
    } else if (typeof secrets === 'string') {
      const secretsVar = (process || { env: {} }).env[secrets] || secrets || '{}';
      this.secrets = JSON.parse(secretsVar);
    }
  }

  async init() {
    await this.moduleManager.init(this);
    await this.taskManager.init(this);

    for (const mod of builtIns) {
      this.moduleManager.registerModule(mod);
      await this.moduleManager.initModule(mod.moduleType);
    }
  }

  globalListener(event: string | string[], ...args: any[]) {
    this.debug(null, `Environment event: ${event}`, ...args);
  }

  log(context: Context | null, level: LogLevel, ...args: any[]) {
    try {
      let contextLogLevel = this.logLevel;
      if (typeof context === 'object' && context !== null && typeof context.logLevel === 'number') {
        contextLogLevel = context.logLevel;
      }

      if (level < contextLogLevel) {
        return false;
      }

      let label = 'ENVIRONMENT';
      if (typeof context === 'object' && context !== null) {
        if (typeof context.uid !== 'string') {
          context.uid = Crypto.randomBytes(4).toString('hex');
        }
        label = context.uid;
      }

      const loggerPrototype = Object.getPrototypeOf(Logger);
      const loggers = this.moduleManager.getModules<Logger>(loggerPrototype);
      for (const logger of loggers) {
        switch (level) {
          case (LogLevel.DEBUG):
            logger.debug(label, ...args).then().catch((err: Error) => {
              console.error(`Logger Error: '${logger.moduleType}.debug()`, err);
            });
            break;
          case (LogLevel.INFO):
            logger.info(label, ...args).then().catch((err: Error) => {
              console.error(`Logger Error: '${logger.moduleType}.info()`, err);
            });
            break;
          case (LogLevel.WARN):
            logger.warn(label, ...args).then().catch((err: Error) => {
              console.error(`Logger Error: '${logger.moduleType}.warn()`, err);
            });
            break;
          default:
            logger.error(label, ...args).then().catch((err: Error) => {
              console.error(`Logger Error: '${logger.moduleType}.error()`, err);
            });
        }
      }

      return true;
    } catch (err) {
      console.error('Logger Error: Failed to initialise log', context, level, ...args);
      return false;
    }
  }

  debug(context: Context | null, ...args: any[]) {
    this.log(context, LogLevel.DEBUG, ...args);
  }

  info(context: Context | null, ...args: any[]) {
    this.log(context, LogLevel.INFO, ...args);
  }

  warn(context: Context | null, ...args: any[]) {
    this.log(context, LogLevel.WARN, ...args);
  }

  error(context: Context | null, ...args: any[]) {
    this.log(context, LogLevel.ERROR, ...args);
  }

  async destroy() {
    await this.moduleManager.destroy();
  }
}

export interface Context {
  env: Environment;
  logLevel?: LogLevel;
  uid?: string;
  [key: string]: any;
}

export interface Message {
  created: Date;
  source: string;
  topic: string;
  body: any;
}