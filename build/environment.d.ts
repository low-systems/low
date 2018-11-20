import { Map, TaskConfig } from './interfaces';
import { BaseModule } from './base-module';
import { BaseRenderer } from './renderers/base-renderer';
import { BaseParser } from './parsers/base-parser';
import { BaseDaer } from './daers/base-daer';
import { BaseCacheManager } from './cache-managers/base-cache-manager';
/**
 * Class to encapsulate the entire working daer environment. It managers all task
 * configurations, modules, tests, etc.
 * @class
 */
export declare class Environment {
    readonly taskConfigs: Map<TaskConfig>;
    readonly metaData: any;
    readonly moduleConfig: any;
    /**
     * Holds the state of whether Profiling is on or off.
     * @member {boolean}
     */
    private profiling;
    /**
     * A Map that stores all instances of registered Daer Modules
     * @member {BaseDaer}
     */
    daers: Map<BaseDaer>;
    /**
     * A Map that stores all instances of registered Renderer Modules
     * @member {BaseRenderer}
     */
    renderers: Map<BaseRenderer>;
    /**
     * A Map that stores all instances of registered Parser Modules
     * @member {BaseParser}
     */
    parsers: Map<BaseParser<any>>;
    /**
     * A Map that stores all instances of registered Cache Manager Modules
     * @member {BaseCacheManager}
     */
    cacheManagers: Map<BaseCacheManager>;
    /**
     * @constructs Environment
     * @param {Map<TaskConfig>} - A Map of all task configurations that make up this Environment
     * @param {any} - An object containing metadata that might be needed by your system
     * @param {any} - An object containing configuration information for any registered modules
     */
    constructor(taskConfigs: Map<TaskConfig>, metaData: any, moduleConfig: any);
    /**
     * Register all built-in modules into this Environment. These modules will help you get started
     * @function registerBuiltInModules
     * @private
     */
    private registerBuiltInModules;
    registerModule(name: string, moduleType: typeof BaseModule, ...args: any[]): BaseModule;
}
export interface Job {
    data: any[];
    debug: boolean;
    [key: string]: any;
}
