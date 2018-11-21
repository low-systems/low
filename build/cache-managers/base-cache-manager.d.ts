import { BaseModule } from '../base-module';
import { Job } from '../environment';
export declare class BaseCacheManager extends BaseModule {
    getItem(cacheKey: CacheKey): Promise<any>;
    setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<any>;
    bust(partition: string): Promise<void>;
    makeKey(config: CacheConfig, job: Job): Promise<CacheKey>;
}
export interface CacheConfig {
    cacheManager: string;
    keyProperties: string[];
    partition: string;
    ttl: number;
}
export interface CacheKey {
    partition: string | number;
    key: string | number;
}
