import { BaseCacheManager, CacheKey } from './base-cache-manager';
export declare class InMemoryCacheManager extends BaseCacheManager {
    constructor(name: string);
    getItem(cacheKey: CacheKey): Promise<any>;
    setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void>;
    bust(partition: string): Promise<void>;
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
