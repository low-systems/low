import { Map, TaskConfig } from './interfaces';

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
export class Environment {
  /**
   * Holds the state of whether Profiling is on or off. 
   * @member {boolean} 
   */
  private profiling: boolean = false;

  /**
   * A Map that stores all instances of registered Daer Modules
   * @member {BaseDaer}
   */
  daers: Map<BaseDaer> = {};

  /**
   * A Map that stores all instances of registered Renderer Modules
   * @member {BaseRenderer}
   */
  renderers: Map<BaseRenderer> = {};

  /**
   * A Map that stores all instances of registered Parser Modules
   * @member {BaseParser}
   */
  parsers: Map<BaseParser<any>> = {};

  /**
   * A Map that stores all instances of registered Cache Manager Modules
   * @member {BaseCacheManager}
   */
  cacheManagers: Map<BaseCacheManager> = {};

  /**
   * @constructs Environment
   * @param {Map<TaskConfig>} - A Map of all task configurations that make up this Environment
   * @param {any} - An object containing metadata that might be needed by your system
   * @param {any} - An object containing configuration information for any registered modules
   */
  constructor(public readonly taskConfigs: Map<TaskConfig>, public readonly metaData: any, public readonly moduleConfig: any) {
    this.registerBuiltInModules();
  }

  /**
   * Register all built-in modules into this Environment. These modules will help you get started
   * @function registerBuiltInModules
   * @private
   */
  private registerBuiltInModules(): void {
    // Register built-in Daers
    this.registerModule('basic', BasicDaer);

    // Register built-in Renderers
    this.registerModule('mustache', MustacheRenderer);

    // Register built-in Parsers
    this.registerModule('boolean', BooleanParser);
    this.registerModule('json', JsonParser);
    this.registerModule('number', NumberParser);
    this.registerModule('stringify', StringifyParser);
    this.registerModule('url', UrlParser);

    // Register built-in Cache Managers
    this.registerModule('in-memory', InMemoryCacheManager);
  }

  registerModule(name: string, moduleType: typeof BaseModule, ...args: any[]): BaseModule {
    let newModule = new moduleType(this, name, ...args);

    if (!newModule.moduleType) {
      const moduleType = newModule && newModule.constructor && newModule.constructor.name || '[unknown]';
      throw new Error(`Module type ${moduleType} does not inherit one of the proper base modules`);
    }

    const map: Map<BaseModule> | null = 
        moduleType instanceof BaseParser ? this.parsers :
        moduleType instanceof BaseRenderer ? this.renderers :
        moduleType instanceof BaseDaer ? this.daers :
        moduleType instanceof BaseCacheManager ? this.cacheManagers :
        null;

    if (!map) {
      throw new Error(`Module type ${newModule.moduleType} is neither a Renderer, Parser, Task Module, or CacheManager`);
    }

    if (map.hasOwnProperty(name)) {
      throw new Error(`There already exists a ${newModule.moduleType} called "${name}"`);
    }

    map[name] = newModule;

    return newModule;
  } 
}

export interface Job {
  data: any[];
  debug: boolean;
  [key: string]: any;
}