/// <reference types="node" />
import { Map, TaskConfig } from './interfaces';
import { BaseConfigManager } from './config-managers/base-config-manager';
import { BaseRenderer } from './renderers/base-renderer';
import { BaseParser } from './parsers/base-parser';
import { BaseDaer } from './daers/base-daer';
import { BaseCacheManager } from './cache-managers/base-cache-manager';
/**
 * Class to encapsulate the entire working daer environment. It managers all task
 * configurations, modules, tests, etc.
 * @class
 */
export declare class Environment extends NodeJS.EventEmitter {
    private configManager;
    private ready;
    /**
     * Holds the state of whether Profiling is on or off.
     * @member {boolean}
     */
    private profiling;
    metaData: any;
    moduleConfigs: any;
    private tasks;
    private modules;
    private builtIn;
    /**
     * @constructs Environment
     * @param {Map<TaskConfig>} - A Map of all task configurations that make up this Environment
     * @param {any} - An object containing metadata that might be needed by your system
     * @param {any} - An object containing configuration information for any registered modules
     */
    constructor(modules: Modules, configManager: BaseConfigManager);
    loadConfig(config: EnvironmentConfig): Promise<void>;
    setupModules(): Promise<void>;
    getRenderer(name: string): BaseRenderer;
    getParser(name: string): BaseParser<any>;
    getDaer(name: string): BaseDaer;
    getCacheManager(name: string): BaseCacheManager;
    getTask(name: string): TaskConfig;
}
export interface Modules {
    renderers: BaseRenderer[];
    daers: BaseDaer[];
    parsers: BaseParser<any>[];
    cacheManagers: BaseCacheManager[];
}
export interface ModuleMaps {
    renderers: {
        [name: string]: BaseRenderer;
    };
    daers: {
        [name: string]: BaseDaer;
    };
    parsers: {
        [name: string]: BaseParser<any>;
    };
    cacheManagers: {
        [name: string]: BaseCacheManager;
    };
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
