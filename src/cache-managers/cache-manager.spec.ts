import { CacheConfig } from './cache-manager';
import { Context, Environment } from '../environment';

//TODO: Complete cache tests for getItem, items expiring, etc

test('should be able to create a valid key', async () => {
  const env = new Environment({}, [], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const cacheManager = env.getCacheManager('CacheManager');
  const config: CacheConfig = {
    cacheManager: 'CacheManager',
    keyProperties: [
      'env.config.metadata.test'
    ],
    partition: 'test',
    ttl: 86400000
  };
  const context: Context = {
    env: env
  };

  const cacheKey = await cacheManager.makeKey(config, context);
  expect(cacheKey.key).toBe('0b447db81d53032b3691326008a32fa49d04a57a');
});

test('should be able to create item', async () => {
  const env = new Environment({}, [], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const cacheManager = env.getCacheManager('CacheManager');
  const config: CacheConfig = {
    cacheManager: 'CacheManager',
    keyProperties: [
      'env.config.metadata.test'
    ],
    partition: 'test',
    ttl: 86400000
  };
  const context: Context = {
    env: env
  };
  const item = {
    test: 'It worked'
  };

  const cacheKey = await cacheManager.makeKey(config, context);
  await cacheManager.setItem(cacheKey, item, config.ttl);
  const cachedItem = cacheManager.CACHE[cacheKey.partition][cacheKey.key];

  expect(cachedItem.data).toStrictEqual(item);
});