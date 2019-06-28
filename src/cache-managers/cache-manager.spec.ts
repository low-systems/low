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

test('should be able to set an item', async () => {
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

test('should be able to get an item', async () => {
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

  const cachedItem = await cacheManager.getItem(cacheKey);
  expect(cachedItem).toStrictEqual(item);
});

test('should have items expire', async () => {
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
    ttl: 1000
  };
  const context: Context = {
    env: env
  };
  const item = {
    test: 'It worked'
  };

  const cacheKey = await cacheManager.makeKey(config, context);
  await cacheManager.setItem(cacheKey, item, config.ttl);

  const cachedItem1 = await cacheManager.getItem(cacheKey);
  expect(cachedItem1).toStrictEqual(item);

  await new Promise((resolve, reject) => { setTimeout(resolve, 2000) });

  const cachedItem2 = await cacheManager.getItem(cacheKey);
  expect(cachedItem2).toBeNull();
});

test('should be able to bust partition', async () => {
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

  expect(cacheManager.CACHE).toHaveProperty(config.partition);
  await cacheManager.bust(config.partition);
  expect(cacheManager.CACHE).not.toHaveProperty(config.partition);
});