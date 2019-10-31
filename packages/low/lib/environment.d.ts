import { Connector } from './connectors/connector';
import { CacheManager, CacheConfig } from './cache-managers/cache-manager';
import { Doer } from './doers/doer';
import { Parser } from './parsers/parser';
import { Renderer } from './renderers/renderer';
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
    readonly isReady: boolean;
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
    getConnector(name: string): Connector;
    getCacheManager(name: string): CacheManager;
    getDoer(name: string): Doer;
    getParser(name: string): Parser<any>;
    getRenderer(name: string): Renderer;
    getTask(name: string): TaskConfig;
}
export interface EnvironmentConfig {
    metadata?: any;
    modules?: any;
    [key: string]: any;
}
export interface Modules {
    connectors?: Connector[];
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
    connectorConfigs?: {
        [connectorName: string]: any;
    };
    specialProperties?: string[];
}
