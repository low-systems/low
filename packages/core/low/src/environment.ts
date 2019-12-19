import * as Crypto from 'crypto';

import { Connector } from './connectors/connector';
import { CacheManager, CacheConfig } from './cache-managers/cache-manager';
import { Doer } from './doers/doer';
import { Logger, LogLevel } from './loggers/logger';
import { Parser } from './parsers/parser';
import { BooleanParser } from './parsers/boolean-parser';
import { IntegerParser } from './parsers/integer-parser';
import { FloatParser } from './parsers/float-parser';
import { JsonParser } from './parsers/json-parser';
import { StringParser } from './parsers/string-parser';
import { UrlParser } from './parsers/url-parser';
import { QuerystringParser } from './parsers/querystring-parser';
import { Renderer } from './renderers/renderer';
import { MultiDoer } from './doers/multi-doer';

/**
 * The Environment class is the core of a `low` system.
 * If you are using `low` you should create an instance of this
 * with your Modules, Tasks, and Configurations, and initialise it.
 */
export class Environment {
  /**
   * A map of all available task configurations [[TaskConfig]]
   */
  tasks: { [taskName: string]: TaskConfig } = {};
  /**
   * Any sensitive configuration information loaded into the
   * Environment using [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable)
   */
  secrets: EnvironmentConfig = {};

  /**
   * Set to true once `Environment.init()` has completed
   */
  private ready: boolean = false;

  /**
   * Determine if the `Environment` is ready to execute tasks
   */
  get isReady(): boolean {
    return this.ready;
  }

  logLevel: LogLevel = LogLevel.ERROR;

  /**
   * A collection of [[Connector]] modules. Connectors are gateways from
   * your application or external sources to run tasks in the `low` Environment
   */
  private connectors: { [connectorName: string]: Connector<any, any, any> } = {
    Connector: new Connector()
  };

  /**
   * A collection of [[CacheManager]] modules. CacheManagers are used to
   * improve the performance of frequently executed tasks and object compilation
   */
  private cacheManagers: { [cacheManagerName: string]: CacheManager<any, any> } = {
    CacheManager: new CacheManager()
  };

  /**
   * A collection of [[Doer]] modules. Doers are used to execute tasks
   */
  private doers: { [doerName: string]: Doer<any, any> } = {
    Doer: new Doer(),
    MultiDoer: new MultiDoer()
  };

  private loggers: { [loggerName: string]: Logger<any, any> } = {
    Logger: new Logger()
  };

  /**
   * A collection of [[Parser]] modules. Parsers ensure that any compiled
   * output from the [[ObjectCompiler]] is a specified type
   */
  private parsers: { [parserName: string]: Parser<any> } = {
    BooleanParser: new BooleanParser(),
    IntegerParser: new IntegerParser(),
    FloatParser: new FloatParser(),
    JsonParser: new JsonParser(),
    StringParser: new StringParser(),
    UrlParser: new UrlParser(),
    QuerystringParser: new QuerystringParser(),
  };

  /**
   * A collection of [[Renderer]] modules. Renderers are used by the
   * [[ObjectCompiler]] to create dynamic bits of configuration to be
   * used by other modules
   */
  private renderers: { [rendererName: string]: Renderer<any, any, any> } = {
    Renderer: new Renderer()
  };

  /**
   * Create a new `Environment` instance
   * @param modules       A collection of instances of all external modules to be made available in the Environment
   * @param tasks         A list of all task configurations available in the Environment
   * @param config        Any configuration information for your modules and metadata your tasks may require
   * @param secretsName   The name of an system level environment variable that holds an `EnvironmentConfig` with information to sensitive to go into code
   */
  constructor(modules: Modules, tasks: TaskConfig[], public config: EnvironmentConfig, secretsName: string = 'SECRETS') {
    if (modules.connectors) {
      for (const mod of modules.connectors) {
        this.connectors[mod.moduleType] = mod;
      }
    }

    if (modules.cacheManagers) {
      for (const mod of modules.cacheManagers) {
        this.cacheManagers[mod.moduleType] = mod;
      }
    }

    if (modules.doers) {
      for (const mod of modules.doers) {
        this.doers[mod.moduleType] = mod;
      }
    }

    if (modules.loggers) {
      for (const mod of modules.loggers) {
        this.loggers[mod.moduleType] = mod;
      }
    }

    if (modules.parsers) {
      for (const mod of modules.parsers) {
        this.parsers[mod.moduleType] = mod;
      }
    }

    if (modules.renderers) {
      for (const mod of modules.renderers) {
        this.renderers[mod.moduleType] = mod;
      }
    }

    for (const task of tasks) {
      this.tasks[task.name] = task;
    }

    this.loadSecrets(secretsName);
  }

  loadSecrets(secretsName: string) {
    if (!process) {
      console.warn('No `process` object for environment variables. Probably in a browser');
      return;
    }

    if (!process.env.hasOwnProperty(secretsName)) {
      console.warn(`No environment variable named '${secretsName}'.`);
      return;
    }

    const secretsVar = process.env[secretsName] || '{}';

    this.secrets = JSON.parse(secretsVar);
  }

  async init(): Promise<void> {
    for (const mod of Object.values(this.connectors)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.cacheManagers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.doers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.loggers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.parsers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.renderers)) {
      await mod.init(this);
    }

    const taskReport = this.checkTasks();
    if (taskReport) {
      throw new Error(`There are one or more task configuration problems\n${taskReport}`);
    }

    this.ready = true;

    if (this.config.startupTask) {
      const task = this.getTask(this.config.startupTask);
      const connector = this.getConnector('Connector');
      await connector.runTask(task, {}, {});
    }
  }

  checkTasks(): string|null {
    const problems: { [taskName: string]: string[] } = {};
    for (const task of Object.values(this.tasks)) {
      const taskProblems: string[] = [];

      const doer = this.doers[task.doer];
      if (!doer) {
        taskProblems.push(`No Doer called '${task.doer}' loaded`);
      }

      if (task.cacheConfig) {
        const cacheManager = this.cacheManagers[task.cacheConfig.cacheManager];
        if (!cacheManager) {
          taskProblems.push(`No Cache Manager called '${task.cacheConfig.cacheManager}' loaded`);
        }
      }

      if (taskProblems.length > 0) {
        problems[task.name] = taskProblems;
      }
    }

    if (Object.values(problems).length === 0) {
      return null;
    }

    const report = Object.entries(problems).map((entry) => {
      return `${entry[0]}:\n\t${entry[1].join('\n\t')}`;
    }).join('\n');

    return report;
  }

  getConnector(name: string): Connector<any, any, any> {
    if (!this.connectors.hasOwnProperty(name)) {
      throw new Error(`No Connector called '${name}' loaded`);
    }
    const connector = this.connectors[name];
    if (!connector.isReady) {
      throw new Error(`The Connector called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return connector;
  }

  getCacheManager(name: string): CacheManager<any, any> {
    if (!this.cacheManagers.hasOwnProperty(name)) {
      throw new Error(`No Cache Manager called '${name}' loaded`);
    }
    const cacheManager = this.cacheManagers[name];
    if (!cacheManager.isReady) {
      throw new Error(`The Cache Manager called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return cacheManager;
  }

  getDoer(name: string): Doer<any, any> {
    if (!this.doers.hasOwnProperty(name)) {
      throw new Error(`No Doer called '${name}' loaded`);
    }
    const doer = this.doers[name];
    if (!doer.isReady) {
      throw new Error(`The Doer called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return doer;
  }

  getParser(name: string): Parser<any> {
    if (!this.parsers.hasOwnProperty(name)) {
      throw new Error(`No Parser called '${name}' loaded`);
    }
    const parser = this.parsers[name];
    if (!parser.isReady) {
      throw new Error(`The Parser called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return parser;
  }

  getRenderer(name: string): Renderer<any, any, any> {
    if (!this.renderers.hasOwnProperty(name)) {
      throw new Error(`No Renderer called '${name}' loaded`);
    }
    const renderer = this.renderers[name];
    if (!renderer.isReady) {
      throw new Error(`The Renderer called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return renderer;
  }

  getTask(name: string): TaskConfig {
    if (!this.tasks.hasOwnProperty(name)) {
      throw new Error(`No Task called '${name}' loaded`);
    }
    if (!this.isReady) {
      throw new Error('The environment is not ready thus no task checks have been made');
    }
    return this.tasks[name];
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

      for (const logger of Object.values(this.loggers)) {
        switch (level) {
          case (LogLevel.DEBUG):
            logger.debug(label, ...args).then().catch(err => {
              console.error(`Logger Error: '${logger.moduleType}.debug()`, err);
            });
            break;
          case (LogLevel.INFO):
            logger.info(label, ...args).then().catch(err => {
              console.error(`Logger Error: '${logger.moduleType}.info()`, err);
            });
            break;
          case (LogLevel.WARN):
            logger.warn(label, ...args).then().catch(err => {
              console.error(`Logger Error: '${logger.moduleType}.warn()`, err);
            });
            break;
          default:
            logger.error(label, ...args).then().catch(err => {
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
    if (!this.ready) {
      return;
    }

    for (const mod of Object.values(this.connectors)) {
      await mod.destroy();
    }

    for (const mod of Object.values(this.cacheManagers)) {
      await mod.destroy();
    }

    for (const mod of Object.values(this.doers)) {
      await mod.destroy();
    }

    for (const mod of Object.values(this.loggers)) {
      await mod.destroy();
    }

    for (const mod of Object.values(this.parsers)) {
      await mod.destroy();
    }

    for (const mod of Object.values(this.renderers)) {
      await mod.destroy();
    }
  }
}

export interface EnvironmentConfig {
  metadata?: any;
  modules?: any;
  startupTask?: string;
  [key: string]: any;
}

export interface Modules {
  connectors?: Connector<any, any, any>[];
  cacheManagers?: CacheManager<any, any>[];
  doers?: Doer<any, any>[];
  loggers?: Logger<any, any>[];
  parsers?: Parser<any>[];
  renderers?: Renderer<any, any, any>[];
}

export interface Context {
  env: Environment;
  logLevel?: LogLevel;
  uid?: string;
  [key: string]: any;
}

export interface TaskConfig {
  name: string;
  doer: string;
  config: any;
  metadata: any;
  cacheConfig?: CacheConfig;
  connectorConfigs?: { [connectorName: string]: any };
  specialProperties?: string[];
  throwError?: boolean;
}