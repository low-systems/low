import { createHash } from 'crypto';

import { Module } from '../module';
import { Context } from '../environment';
import { ObjectCompiler } from '../object-compiler';

export class CacheManager<C, S> extends Module<C, S> {
  private _CACHE: MemoryCache = {};
  get CACHE(): MemoryCache {
    return this._CACHE;
  }

  compilePartition(partition: string | string[], context: Context) {
    if (!Array.isArray(partition)) return partition;
    const compiledPartition: string[] = [];
    for (const part of partition) {
      compiledPartition.push(part.startsWith('$$') ? part.substring(2) : ''+ObjectCompiler.objectPath(context, part));
    }
    return compiledPartition.join(':');
  }

  async makeKey(config: CacheConfig, context: Context): Promise<CacheKey> {
    let data = '';
    for (const path of config.keyProperties) {
      const part = path.startsWith('$$') ? path.substring(2) : ObjectCompiler.objectPath(context, path);
      data += JSON.stringify(part);
    }
    const hash = createHash('sha1')
      .update(data)
      .digest('hex');
    return {
      partition: this.compilePartition(config.partition, context),
      key: hash
    };
  }

  async getItem(cacheKey: CacheKey): Promise<any> {
    if (!this.CACHE.hasOwnProperty(cacheKey.partition)) {
      this.CACHE[cacheKey.partition] = {};
      return null;
    }
    if (!this.CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
      return null;
    }
    const expires = this.CACHE[cacheKey.partition][cacheKey.key].expires;
    const now = new Date();
    if (expires < now) {
      delete this.CACHE[cacheKey.partition][cacheKey.key];
      return null;
    }
    this.CACHE[cacheKey.partition][cacheKey.key].touched = now;
    return this.CACHE[cacheKey.partition][cacheKey.key].data;
  }

  async setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void> {
    if (!this.CACHE.hasOwnProperty(cacheKey.partition)) {
      this.CACHE[cacheKey.partition] = {};
    }
    const now = new Date();
    const expires = new Date(+new Date() + ttl);
    if (!this.CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
      this.CACHE[cacheKey.partition][cacheKey.key] = {
        data: item,
        created: now,
        updated: now,
        expires: expires,
        touched: new Date(0)
      };
    } else {
      this.CACHE[cacheKey.partition][cacheKey.key].data = item;
      this.CACHE[cacheKey.partition][cacheKey.key].updated = now;
      this.CACHE[cacheKey.partition][cacheKey.key].expires = expires;
    }
  }

  async flush(partition: string): Promise<void> {
    if (this.CACHE.hasOwnProperty(partition)) {
      delete this.CACHE[partition];
    }
  }
}

//TODO: Perhaps move all but `cacheManager` into a `config` property
export interface CacheConfig {
  cacheManager: string;
  keyProperties: string[];
  partition: string | string[];
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