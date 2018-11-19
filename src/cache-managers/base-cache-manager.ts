import { createHash } from 'crypto';

import { BaseModule } from '../base-module';
import { Environment, Job } from '../environment';

import dot = require('dot-object');

export class BaseCacheManager extends BaseModule {
  constructor(env: Environment, name: string, ...args: any[]) {
    super(env, name, args);
  }

  async getItem(cacheKey: CacheKey): Promise<any> {
    throw new Error(`Cache manager ${this.moduleType} has not yet implemented getItem(CacheKey)`);
  }

  async setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<any> {
    throw new Error(`Cache manager ${this.moduleType} has not yet implemented setItem(CacheKey, any, number)`);
  }
  
  async bust(partition: string): Promise<void> {
    throw new Error(`Cache manager ${this.moduleType} has not yet implemented bust(string)`);
  }

  async makeKey(config: CacheConfig, job: Job): Promise<CacheKey> {
    let data = '';
    for (const path of config.keyProperties) {
      const part = dot.pick(path, job);
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