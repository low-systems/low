import { createHash } from 'crypto';

import { Module } from '../module';
import { Context } from '../environment';
import { ObjectCompiler } from '../object-compiler';

const CACHE: MemoryCache = {};

export class CacheManager extends Module {
  async makeKey(config: CacheConfig, context: Context): Promise<CacheKey> {
    let data = '';
    for (const path of config.keyProperties) {
      const part = ObjectCompiler.objectPath(context, path);
      data += JSON.stringify(part);
    }
    const hash = createHash('sha1')
      .update(data)
      .digest('base64');
    return {
      partition: config.partition,
      key: hash
    };
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

export interface CacheConfig {
  cacheManager: string;
  keyProperties: string[];
  partition: string;
  ttl: number;
}

export interface CacheKey {
  partition: string|number;
  key: string|number;
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