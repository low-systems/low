import { Map, TaskConfig } from './interfaces';

import { BaseConfigManager } from './config-managers/base-config-manager';

import { BaseModule } from './base-module';
import { BaseRenderer } from './renderers/base-renderer';
import { BaseParser } from './parsers/base-parser';
import { BaseDaer } from './daers/base-daer';
import { BaseCacheManager } from './cache-managers/base-cache-manager';

// Built-in Modules
// Daers
import { BasicDaer } from './daers/basic-daer';
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
 * Class to encapsulate the entire working daer environment. It managers all task 
 * configurations, modules, tests, etc. 
 * @class
 */
export class Environment extends NodeJS.EventEmitter {
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
    daers: {},
    cacheManagers: {}
  };
  
  private builtIn: Modules = {
    daers: [
      new BasicDaer('basic')
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
      this.modules.renderers[mod.name] = mod;
    }

    for (const mod of [...this.builtIn.parsers, ...modules.parsers]) {
      this.modules.parsers[mod.name] = mod;
    }

    for (const mod of [...this.builtIn.daers, ...modules.daers]) {
      this.modules.daers[mod.name] = mod;
    }

    for (const mod of [...this.builtIn.cacheManagers, ...modules.cacheManagers]) {
      this.modules.cacheManagers[mod.name] = mod;
    }

    configManager.setup();
  }

  async loadConfig(config: EnvironmentConfig): Promise<void> {
    this.tasks = config.tasks; 
    this.metaData = config.metaData;
    this.moduleConfigs = config.moduleConfigs;
    await this.setupModules();
    this.ready = true;
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

    for (const mod of Object.values(this.modules.daers)) {
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

  getDaer(name: string): BaseDaer {
    if (!this.modules.daers.hasOwnProperty(name)) {
      throw new Error(`No Daer called ${name} loaded`);
    }
    return this.modules.daers[name];
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
}

export interface Modules {
  renderers: BaseRenderer[];
  daers: BaseDaer[];
  parsers: BaseParser<any>[];
  cacheManagers: BaseCacheManager[];
}

export interface ModuleMaps {
  renderers: { [name: string]: BaseRenderer };
  daers: { [name: string]: BaseDaer };
  parsers: { [name: string]: BaseParser<any> };
  cacheManagers: { [name: string]: BaseCacheManager };
}

export interface EnvironmentConfig {
  tasks: Map<TaskConfig>;
  metaData: any;
  moduleConfigs: any;
}

export interface Job {
  data: any[];
  debug: boolean;
  [key: string]: any;
}