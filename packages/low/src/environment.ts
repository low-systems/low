import { Boundary } from './boundaries/boundary';
import { CacheManager, CacheConfig } from './cache-managers/cache-manager';
import { Doer } from './doers/doer';
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

  /**
   * A collection of [[Boundary]] modules. Boundaries are gateways from
   * your application or external sources to run tasks in the `low` Environment
   */
  private boundaries: { [boundaryName: string]: Boundary } = {
    Boundary: new Boundary()
  };

  /**
   * A collection of [[CacheManager]] modules. CacheManagers are used to
   * improve the performance of frequently executed tasks and object compilation
   */
  private cacheManagers: { [cacheManagerName: string]: CacheManager } = {
    CacheManager: new CacheManager()
  };

  /**
   * A collection of [[Doer]] modules. Doers are used to execute tasks
   */
  private doers: { [doerName: string]: Doer } = {
    Doer: new Doer(),
    MultiDoer: new MultiDoer()
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
  private renderers: { [rendererName: string]: Renderer } = {
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
    if (modules.boundaries) {
      for (const mod of modules.boundaries) {
        this.boundaries[mod.moduleType] = mod;
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
    //TODO: What the heck actually happens when you try to access `process`
    //      in a browser. Need more checks around this
    const secretsVar = process.env[secretsName];
    if (!secretsVar) return;

    if (secretsVar.indexOf('{') > -1) {
      this.secrets = JSON.parse(secretsVar);
    } else {
      //This will obviously not work in the browser so be sure to set
      //your secretsName variable properly. Don't like doing `require`
      //but not sure how else to make `fs` conditional. Moar research!
      const fs = require('fs');
      const secretsJson = fs.readFileSync(secretsVar).toString();
      this.secrets = JSON.parse(secretsJson);
    }
  }

  async init(): Promise<void> {
    for (const mod of Object.values(this.boundaries)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.cacheManagers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.doers)) {
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

  getBoundary(name: string): Boundary {
    if (!this.boundaries.hasOwnProperty(name)) {
      throw new Error(`No Boundary called '${name}' loaded`);
    }
    const boundary = this.boundaries[name];
    if (!boundary.isReady) {
      throw new Error(`The Boundary called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return boundary;
  }

  getCacheManager(name: string): CacheManager {
    if (!this.cacheManagers.hasOwnProperty(name)) {
      throw new Error(`No Cache Manager called '${name}' loaded`);
    }
    const cacheManager = this.cacheManagers[name];
    if (!cacheManager.isReady) {
      throw new Error(`The Cache Manager called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return cacheManager;
  }

  getDoer(name: string): Doer {
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

  getRenderer(name: string): Renderer {
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
}

export interface EnvironmentConfig {
  metadata?: any;
  modules?: any;
  [key: string]: any;
}

export interface Modules {
  boundaries?: Boundary[];
  cacheManagers?: CacheManager[];
  doers?: Doer[];
  parsers?: Parser<any>[];
  renderers?: Renderer[];
}

export interface Context {
  env: Environment;
  debug?: boolean;
}

export interface TaskConfig {
  name: string;
  doer: string;
  config: any;
  metadata: any;
  cacheConfig?: CacheConfig;
  boundaryConfigs?: { [boundaryName: string]: any };
  specialProperties?: string[];
}