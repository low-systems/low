import { CacheManager, CacheKey } from 'low';
import {promisify as Promisify} from 'util';
import * as Redis from 'redis';

export class RedisClient {
  client: Redis.RedisClient = new Redis.RedisClient(this.options);
  GET = Promisify(this.client.GET).bind(this.client);
  SETEX = Promisify(this.client.SETEX).bind(this.client);
  KEYS = Promisify(this.client.KEYS).bind(this.client);
  DEL = this.client.DEL.bind(this.client);

  constructor(public options: Redis.ClientOpts) { }
}

export class RedisCacheManager extends CacheManager<Redis.ClientOpts, Redis.ClientOpts> {
  client?: RedisClient;

  async setup() {
    let options: RedisClientOpts = {};
    try {
      options = Object.assign(this.config, this.secrets || {});

      Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('ENV_')) {
          const envKey = value.substring(4);
          const envVal = process.env[envKey] || undefined;
          options[key] = envVal;
        }
      });

      this.client = new RedisClient(options);
    } catch(err) {
      this.env.error(null, `Failed to setup Redis client: ${err.message}`, options);
    }
  }

  async getItem(cacheKey: CacheKey): Promise<any> {
    if (!this.client) {
      return null;
    }

    const key = cacheKey.partition + ':' + cacheKey.key;
    const value: string|null = await this.client.GET(key);

    if (value === null) {
      return null;
    }

    try {
      const output = JSON.parse(value);
      return output;
    } catch (err) {
      console.error(`CACHE MANAGER: Failed to parse cached value`, err);
      return null;
    }
  }

  async setItem(cacheKey: CacheKey, item: any, ttl: number): Promise<void> {
    if (!this.client) {
      return;
    }

    const key = cacheKey.partition + ':' + cacheKey.key;
    const value = JSON.stringify(item);
    await this.client.SETEX(key, ttl, value);
  }

  async flush(partition: string): Promise<void> {
    if (!this.client) {
      return;
    }

    const keys = await this.client.KEYS(partition + ':*');
    await this.client.DEL(keys);
  }
}

export interface RedisClientOpts extends Redis.ClientOpts {
  [key: string]: any;
}