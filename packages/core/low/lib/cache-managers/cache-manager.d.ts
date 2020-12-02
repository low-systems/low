import { Module } from '../module';
import { Context } from '../environment';
export declare class CacheManager<C, S> extends Module<C, S> {
    private _CACHE;
    get CACHE(): MemoryCache;
    compilePartition(partition: string | string[], context: Context): string;
    makeKey(config: CacheConfig, context: Context): Promise<CacheKey>;
    getItem(cacheKey: CacheKey): Promise<any>;
    setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void>;
    flush(partition: string): Promise<void>;
}
export interface CacheConfig {
    cacheManager: string;
    keyProperties: string[];
    partition: string | string[];
    ttl: number;
}
export interface CacheKey {
    partition: string | number;
    key: string | number;
}
export interface MemoryCache {
    [partition: string]: {
        [key: string]: MemoryCacheItem;
    };
}
export interface MemoryCacheItem {
    data: any;
    created: Date;
    updated: Date;
    expires: Date;
    touched: Date;
}
