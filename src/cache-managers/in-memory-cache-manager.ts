import { Environment, Job } from '../environment';
import { BaseCacheManager, CacheKey } from './base-cache-manager';

const CACHE: MemoryCache = {};

export class InMemoryCacheManager extends BaseCacheManager {
  constructor(env: Environment, name: string) {
    super(env, name);
  }

  async getItem(cacheKey: CacheKey): Promise<any> {
    if (!CACHE.hasOwnProperty(cacheKey.partition)) {
      CACHE[cacheKey.partition] = {};
      return null;
    }
    if (!CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
      return null;
    }
    const expires = CACHE[cacheKey.partition][cacheKey.key].expires;
    const now = new Date();
    if (expires < now) {
      delete CACHE[cacheKey.partition][cacheKey.key];
      return null;
    }
    CACHE[cacheKey.partition][cacheKey.key].touched = now;
    return CACHE[cacheKey.partition][cacheKey.key].data;
  }
  
  async setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void> {
    if (!CACHE.hasOwnProperty(cacheKey.partition)) {
      CACHE[cacheKey.partition] = {};
    }
    const now = new Date();
    const expires = new Date(+new Date() + ttl);
    if (!CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
      CACHE[cacheKey.partition][cacheKey.key] = {
        data: item,
        created: now,
        updated: now,
        expires: expires,
        touched: new Date(0)
      };
    } else {
      CACHE[cacheKey.partition][cacheKey.key].data = item;
      CACHE[cacheKey.partition][cacheKey.key].updated = now;
      CACHE[cacheKey.partition][cacheKey.key].expires = expires;
    }
  }

  async bust(partition: string): Promise<void> {
    if (CACHE.hasOwnProperty(partition)) {
      delete CACHE[partition];
    }
  }
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