import { CacheManager, CacheKey } from '../cache-manager';
import { RedisClientOptions, createClient } from 'redis';
export declare class RedisCacheManager extends CacheManager<RedisClientOptions, RedisClientOptions> {
    client?: ReturnType<typeof createClient>;
    setup(): Promise<void>;
    getItem(cacheKey: CacheKey): Promise<any>;
    setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void>;
    flush(partition: string): Promise<void>;
}
