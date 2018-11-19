import { Map, CacheManager, TaskConfig } from './interfaces';

import { BaseModule } from './base-module';
import { BaseRenderer } from './renderers/base-renderer';
import { BaseParser } from './parsers/base-parser';
import { BaseDaer } from './daers/base-daer';

// Modules
// Task Modules
// Parsers
import { BooleanParser } from './parsers/boolean-parser';
import { JsonParser } from './parsers/json-parser';
import { NumberParser } from './parsers/number-parser';
import { StringifyParser } from './parsers/stringify-parser';
import { UrlParser } from './parsers/url-parser';
// Renderers
import { MustacheRenderer } from './renderers/mustache-renderer';


export class Environment {
  protected errors: Error[] = [];
  private profiling: boolean = false;

  daers: Map<BaseDaer> = {};
  renderers: Map<BaseRenderer> = {};
  parsers: Map<BaseParser<any>> = {};
  cacheManagers: Map<CacheManager> = {};

  constructor(public readonly taskConfigs: Map<TaskConfig>, public readonly metaData: any, public readonly moduleConfig: any) {
    // Register built-in Task Modules
    //this.registerModule('basic', BasicTask);

    // Register built-in Renderers
    this.registerModule('mustache', MustacheRenderer);

    // Register built-in Parsers
    this.registerModule('boolean', BooleanParser);
    this.registerModule('json', JsonParser);
    this.registerModule('number', NumberParser);
    this.registerModule('stringify', StringifyParser);
    this.registerModule('UrlParser', UrlParser);
  }

  registerModule(name: string, mod: typeof BaseModule, ...args: any[]) {
    let newMod = new mod(this, name, ...args);

    if (!newMod.moduleType) {
      const moduleType = newMod && newMod.constructor && newMod.constructor.name || '[unknown]';
      throw new Error(`Module type ${moduleType} does not inherit one of the proper base modules`);
    }

    const map: Map<BaseModule> | null = 
        mod instanceof BaseParser ? this.parsers :
        mod instanceof BaseRenderer ? this.renderers :
        null;


    if (!map) {
      const moduleType = newMod.moduleType;
      throw new Error(`Module type ${newMod.moduleType} is neither a Renderer, Parser, Task Module, or CacheManager`);
    }

    if (map.hasOwnProperty(name)) {
      throw new Error(`There already exists a ${newMod.moduleType} called "${name}"`);
    }

    map[name] = newMod;
  } 
}

export interface Job {
  data: any[];
  debug: boolean;
  [key: string]: any;
}