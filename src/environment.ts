require('source-map-support').install();

import * as events from 'events';

import { Map, TaskConfig } from './interfaces';

import { BaseConfigManager } from './config-managers/base-config-manager';

import { BaseModule } from './base-module';
import { BaseRenderer } from './renderers/base-renderer';
import { BaseParser } from './parsers/base-parser';
import { BaseDoer } from './doers/base-doer';
import { BaseCacheManager } from './cache-managers/base-cache-manager';

// Built-in Modules
// Doers
import { BasicDoer } from './doers/basic-doer';
import { MultiplexerDoer } from './doers/multiplexer-doer';
// Parsers
import { BooleanParser } from './parsers/boolean-parser';
import { JsonParser } from './parsers/json-parser';
import { NumberParser } from './parsers/number-parser';
import { StringifyParser } from './parsers/stringify-parser';
import { UrlParser } from './parsers/url-parser';
// Renderers
import { MustacheRenderer } from './renderers/mustache-renderer';
// Cache Managers
import { InMemoryCacheManager } from './cache-managers/in-memory-cache-manager';

/**
 * Class to encapsulate the entire working doer environment. It manages all task
 * configurations, modules, tests, etc.
 * @class
 */
export class Environment extends events.EventEmitter {
  private ready: boolean = false;

  /**
   * Holds the state of whether Profiling is on or off.
   * @member {boolean}
   */
  private profiling: boolean = false;

  metaData: any = {};
  moduleConfigs: any = {};

  private tasks: Map<TaskConfig> = {};
  private modules: ModuleMaps = {
    renderers: {},
    parsers: {},
    doers: {},
    cacheManagers: {}
  };

  private builtIn: Modules = {
    doers: [
      new BasicDoer('basic'),
      new MultiplexerDoer('multiplexer')
    ],
    renderers: [
      new MustacheRenderer('mustache')
    ],
    parsers: [
      new BooleanParser('boolean'),
      new JsonParser('json'),
      new NumberParser('number'),
      new StringifyParser('stringify'),
      new UrlParser('url')
    ],
    cacheManagers: [
      new InMemoryCacheManager('in-memory')
    ]
  };

  /**
   * @constructs Environment
   * @param {Map<TaskConfig>} - A Map of all task configurations that make up this Environment
   * @param {any} - An object containing metadata that might be needed by your system
   * @param {any} - An object containing configuration information for any registered modules
   */
  constructor(modules: Modules, private configManager: BaseConfigManager) {
    super();

    for (const mod of [...this.builtIn.renderers, ...modules.renderers]) {
      this.modules.renderers[mod.moduleType] = mod;
    }

    for (const mod of [...this.builtIn.parsers, ...modules.parsers]) {
      this.modules.parsers[mod.moduleType] = mod;
    }

    for (const mod of [...this.builtIn.doers, ...modules.doers]) {
      this.modules.doers[mod.moduleType] = mod;
    }

    for (const mod of [...this.builtIn.cacheManagers, ...modules.cacheManagers]) {
      this.modules.cacheManagers[mod.moduleType] = mod;
    }
  }

  async init() {
    await this.configManager.triggerSetup(this);
  }

  async loadConfig(config: EnvironmentConfig): Promise<void> {
    this.tasks = config.tasks;
    this.metaData = config.metaData;
    this.moduleConfigs = config.moduleConfigs;
    this.ready = true;
    await this.setupModules();
    this.emit('setup');
  }

  async setupModules(): Promise<void> {
    if (!this.ready) {
      throw new Error('Environment is not ready');
    }

    for (const mod of Object.values(this.modules.renderers)) {
      await mod.triggerSetup(this);
    }

    for (const mod of Object.values(this.modules.parsers)) {
      await mod.triggerSetup(this);
    }

    for (const mod of Object.values(this.modules.doers)) {
      await mod.triggerSetup(this);
    }

    for (const mod of Object.values(this.modules.cacheManagers)) {
      await mod.triggerSetup(this);
    }
  }

  getRenderer(name: string): BaseRenderer {
    if (!this.modules.renderers.hasOwnProperty(name)) {
      throw new Error(`No Renderer called ${name} loaded`);
    }
    return this.modules.renderers[name];
  }

  getParser(name: string): BaseParser<any> {
    if (!this.modules.parsers.hasOwnProperty(name)) {
      throw new Error(`No Parsers called ${name} loaded`);
    }
    return this.modules.parsers[name];
  }

  getDoer(name: string): BaseDoer {
    if (!this.modules.doers.hasOwnProperty(name)) {
      throw new Error(`No Doer called ${name} loaded`);
    }
    return this.modules.doers[name];
  }

  getCacheManager(name: string): BaseCacheManager {
    if (!this.modules.cacheManagers.hasOwnProperty(name)) {
      throw new Error(`No Cache Manager called ${name} loaded`);
    }
    return this.modules.cacheManagers[name];
  }

  getTask(name: string): TaskConfig {
    if (!this.tasks.hasOwnProperty(name)) {
      throw new Error(`No Task called ${name} loaded`);
    }

    return this.tasks[name];
  }

  createJob(base: any, taskName: string, debug: boolean = false): Job {
    base.data = typeof base.data === 'object' ? base.data : {};
    base.debug = typeof base.debug === 'boolean' ? base.debug : debug;
    base.entryTask = taskName;
    return base as Job;
  }

  async runJob(job: Job): Promise<Job> {
    try {
      const task = this.getTask(job.entryTask);
      const doer = this.getDoer(task.doer);
      const output = await doer.execute(job, task, []);
    } catch(err) {
      console.error('Failed to run job', err);
    }
    return job;
  }
}

export interface Modules {
  renderers: BaseRenderer[];
  doers: BaseDoer[];
  parsers: BaseParser<any>[];
  cacheManagers: BaseCacheManager[];
}

export interface ModuleMaps {
  renderers: Map<BaseRenderer>;
  doers: Map<BaseDoer>;
  parsers: Map<BaseParser<any>>;
  cacheManagers: Map<BaseCacheManager>;
}

export interface EnvironmentConfig {
  tasks: Map<TaskConfig>;
  metaData: any;
  moduleConfigs: any;
}

export interface Job {
  entryTask: string;
  data: any[];
  debug: boolean;
  [key: string]: any;
}