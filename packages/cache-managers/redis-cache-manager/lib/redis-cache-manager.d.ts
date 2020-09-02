import { CacheManager, CacheKey } from 'low';
import * as Redis from 'redis';
export declare class RedisClient {
    options: Redis.ClientOpts;
    client: Redis.RedisClient;
    GET: (arg1: string) => Promise<string | null>;
    SETEX: (arg1: string, arg2: number, arg3: string) => Promise<string>;
    KEYS: (arg1: string) => Promise<string[]>;
    DEL: Redis.OverloadedCommand<string, number, boolean>;
    constructor(options: Redis.ClientOpts);
}
export declare class RedisCacheManager extends CacheManager<Redis.ClientOpts, Redis.ClientOpts> {
    client?: RedisClient;
    setup(): Promise<void>;
    getItem(cacheKey: CacheKey): Promise<any>;
    setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void>;
    flush(partition: string): Promise<void>;
}
export interface RedisClientOpts extends Redis.ClientOpts {
    [key: string]: any;
}
