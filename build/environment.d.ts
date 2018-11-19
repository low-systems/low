import { Map, CacheManager, TaskConfig } from './interfaces';
import { BaseModule } from './base-module';
import { BaseRenderer } from './renderers/base-renderer';
import { BaseParser } from './parsers/base-parser';
import { BaseDaer } from './daers/base-daer';
export declare class Environment {
    readonly taskConfigs: Map<TaskConfig>;
    readonly metaData: any;
    readonly moduleConfig: any;
    protected errors: Error[];
    private profiling;
    daers: Map<BaseDaer>;
    renderers: Map<BaseRenderer>;
    parsers: Map<BaseParser<any>>;
    cacheManagers: Map<CacheManager>;
    constructor(taskConfigs: Map<TaskConfig>, metaData: any, moduleConfig: any);
    registerModule(name: string, mod: typeof BaseModule, ...args: any[]): void;
}
export interface Job {
    data: any[];
    debug: boolean;
    [key: string]: any;
}
