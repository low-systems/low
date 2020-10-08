import { Connector } from './connectors/connector';
import { CacheManager, CacheConfig } from './cache-managers/cache-manager';
import { Doer } from './doers/doer';
import { Logger, LogLevel } from './loggers/logger';
import { Parser } from './parsers/parser';
import { Renderer } from './renderers/renderer';
import { Profiler } from './profiler';
/**
 * The Environment class is the core of a `low` system.
 * If you are using `low` you should create an instance of this
 * with your Modules, Tasks, and Configurations, and initialise it.
 */
export declare class Environment {
    config: EnvironmentConfig;
    /**
     * A map of all available task configurations [[TaskConfig]]
     */
    tasks: {
        [taskName: string]: TaskConfig;
    };
    /**
     * Any sensitive configuration information loaded into the
     * Environment using [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable)
     */
    secrets: EnvironmentConfig;
    /**
     * Set to true once `Environment.init()` has completed
     */
    private ready;
    /**
     * Determine if the `Environment` is ready to execute tasks
     */
    get isReady(): boolean;
    logLevel: LogLevel;
    /**
     * A collection of [[Connector]] modules. Connectors are gateways from
     * your application or external sources to run tasks in the `low` Environment
     */
    private connectors;
    /**
     * A collection of [[CacheManager]] modules. CacheManagers are used to
     * improve the performance of frequently executed tasks and object compilation
     */
    private cacheManagers;
    /**
     * A collection of [[Doer]] modules. Doers are used to execute tasks
     */
    private doers;
    private loggers;
    /**
     * A collection of [[Parser]] modules. Parsers ensure that any compiled
     * output from the [[ObjectCompiler]] is a specified type
     */
    private parsers;
    /**
     * A collection of [[Renderer]] modules. Renderers are used by the
     * [[ObjectCompiler]] to create dynamic bits of configuration to be
     * used by other modules
     */
    private renderers;
    profiler: Profiler;
    /**
     * Create a new `Environment` instance
     * @param modules       A collection of instances of all external modules to be made available in the Environment
     * @param tasks         A list of all task configurations available in the Environment
     * @param config        Any configuration information for your modules and metadata your tasks may require
     * @param secretsName   The name of an system level environment variable that holds an `EnvironmentConfig` with information to sensitive to go into code
     */
    constructor(modules: Modules, tasks: TaskConfig[], config: EnvironmentConfig, secretsName?: string);
    loadSecrets(secretsName: string): void;
    init(): Promise<void>;
    checkTasks(): string | null;
    getConnector(name: string): Connector<any, any, any>;
    getCacheManager(name: string): CacheManager<any, any>;
    getDoer(name: string): Doer<any, any>;
    getParser(name: string): Parser<any>;
    getRenderer(name: string): Renderer<any, any, any>;
    getTask(name: string): TaskConfig;
    log(context: Context | null, level: LogLevel, ...args: any[]): boolean;
    debug(context: Context | null, ...args: any[]): void;
    info(context: Context | null, ...args: any[]): void;
    warn(context: Context | null, ...args: any[]): void;
    error(context: Context | null, ...args: any[]): void;
    destroy(): Promise<void>;
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
    connectorConfigs?: {
        [connectorName: string]: any;
    };
    specialProperties?: string[];
    throwError?: boolean;
}
