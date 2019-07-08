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
import { Renderer } from './renderers/renderer';
import { MultiDoer } from './doers/multi-doer';

export class Environment {
  tasks: { [taskName: string]: TaskConfig } = {};
  secrets: EnvironmentConfig = {};

  private ready: boolean = false;

  get isReady(): boolean {
    return this.ready;
  }

  private modules: ModuleMaps = {
    boundaries: {
      Boundary: new Boundary()
    },
    cacheManagers: {
      CacheManager: new CacheManager()
    },
    doers: {
      Doer: new Doer(),
      MultiDoer: new MultiDoer()
    },
    parsers: {
      BooleanParser: new BooleanParser(),
      IntegerParser: new IntegerParser(),
      FloatParser: new FloatParser(),
      JsonParser: new JsonParser(),
      StringParser: new StringParser(),
      UrlParser: new UrlParser()
    },
    renderers: {
      Renderer: new Renderer()
    }
  };

  constructor(modules: Modules, tasks: TaskConfig[], public config: EnvironmentConfig, secretsName: string = 'SECRETS') {
    if (modules.boundaries) {
      for (const mod of modules.boundaries) {
        this.modules.boundaries[mod.moduleType] = mod;
      }
    }

    if (modules.cacheManagers) {
      for (const mod of modules.cacheManagers) {
        this.modules.cacheManagers[mod.moduleType] = mod;
      }
    }

    if (modules.doers) {
      for (const mod of modules.doers) {
        this.modules.doers[mod.moduleType] = mod;
      }
    }

    if (modules.parsers) {
      for (const mod of modules.parsers) {
        this.modules.parsers[mod.moduleType] = mod;
      }
    }

    if (modules.renderers) {
      for (const mod of modules.renderers) {
        this.modules.renderers[mod.moduleType] = mod;
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
    for (const mod of Object.values(this.modules.boundaries)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.modules.cacheManagers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.modules.doers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.modules.parsers)) {
      await mod.init(this);
    }

    for (const mod of Object.values(this.modules.renderers)) {
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

      const doer = this.modules.doers[task.doer];
      if (!doer) {
        taskProblems.push(`No Doer called '${task.doer}' loaded`);
      }

      if (task.cacheConfig) {
        const cacheManager = this.modules.cacheManagers[task.cacheConfig.cacheManager];
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
    if (!this.modules.boundaries.hasOwnProperty(name)) {
      throw new Error(`No Boundary called '${name}' loaded`);
    }
    const boundary = this.modules.boundaries[name];
    if (!boundary.isReady) {
      throw new Error(`The Boundary called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return boundary;
  }

  getCacheManager(name: string): CacheManager {
    if (!this.modules.cacheManagers.hasOwnProperty(name)) {
      throw new Error(`No Cache Manager called '${name}' loaded`);
    }
    const cacheManager = this.modules.cacheManagers[name];
    if (!cacheManager.isReady) {
      throw new Error(`The Cache Manager called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return cacheManager;
  }

  getDoer(name: string): Doer {
    if (!this.modules.doers.hasOwnProperty(name)) {
      throw new Error(`No Doer called '${name}' loaded`);
    }
    const doer = this.modules.doers[name];
    if (!doer.isReady) {
      throw new Error(`The Doer called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return doer;
  }

  getParser(name: string): Parser<any> {
    if (!this.modules.parsers.hasOwnProperty(name)) {
      throw new Error(`No Parser called '${name}' loaded`);
    }
    const parser = this.modules.parsers[name];
    if (!parser.isReady) {
      throw new Error(`The Parser called '${name}' is loaded but not ready. Has the environment been initialised?`);
    }
    return parser;
  }

  getRenderer(name: string): Renderer {
    if (!this.modules.renderers.hasOwnProperty(name)) {
      throw new Error(`No Renderer called '${name}' loaded`);
    }
    const renderer = this.modules.renderers[name];
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

export interface ModuleMaps {
  boundaries: { [boundaryName: string]: Boundary };
  cacheManagers: { [CacheManagerName: string]: CacheManager };
  renderers: { [rendererName: string]: Renderer };
  doers: { [doerName: string]: Doer };
  parsers: { [parserName: string]: Parser<any> };
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