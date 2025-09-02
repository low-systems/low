import { CacheManager, CacheKey } from '../cache-manager';
import { RedisClientOptions, createClient } from 'redis';

export class RedisCacheManager extends CacheManager<RedisClientOptions, RedisClientOptions> {
  client?: ReturnType<typeof createClient>;

  async setup() {
    let options: RedisClientOptions = {};
    try {
      options = Object.assign(this.config, this.secrets || {});

      Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('ENV_')) {
          const envKey = value.substring(4);
          const envVal = process.env[envKey] || undefined;
          options[key] = envVal;
        }
      });

      this.client = createClient(options);
      await this.client.connect();
    } catch(err) {
      this.env.error(null, `Failed to setup Redis client: ${err.message}`, options);
    }
  }

  async getItem(cacheKey: CacheKey): Promise<any> {
    if (!this.client) {
      return null;
    }

    const key = cacheKey.partition + ':' + cacheKey.key;
    const value = await this.client.GET(key);

    if (value === null) {
      return null;
    }

    try {
      const output = typeof value === 'string' ? JSON.parse(value) : value;
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
    try {
      if (!this.client) {
        return;
      }

      const keys = await this.client.KEYS(partition + ':*');
      if (Array.isArray(keys) && keys.length > 0) {
        await this.client.DEL(keys);
      }
    } catch (err) {
      console.error(`CACHE MANAGER: Failed to flush cache for partition '${partition}': ${err.message}`);
    }
  }
}