import { CacheConfig } from './cache-manager';
import { Context, Environment } from '../environment';

process.env.SECRETS = '{}';

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

test('should be able to flush partition', async () => {
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
  await cacheManager.flush(''+config.partition);
  expect(cacheManager.CACHE).not.toHaveProperty(config.partition);
});

test('should do nothing when flushing a non-existent partition', async () => {
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
  await cacheManager.flush(config.partition + '-nah');
  expect(cacheManager.CACHE).toHaveProperty(config.partition);
});

test(`should return null when getting an item that doesn't exist in an existing partition`, async () => {
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

  cacheKey.key = 'No such key';

  const cachedItem = await cacheManager.getItem(cacheKey);
  expect(cachedItem).toBeNull();
});

test('should be able to update an existing item', async () => {
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
  const itemV1 = {
    test: 'It worked'
  };
  const itemV2 = {
    test: 'It changed'
  };

  const cacheKey = await cacheManager.makeKey(config, context);
  await cacheManager.setItem(cacheKey, itemV1, config.ttl);
  const cachedItemV1 = JSON.parse(JSON.stringify(cacheManager.CACHE[cacheKey.partition][cacheKey.key]));
  expect(cachedItemV1.data).toStrictEqual(itemV1);

  await new Promise(resolve => { setTimeout(resolve, 2000) });

  await cacheManager.setItem(cacheKey, itemV2, config.ttl);
  const cachedItemV2 = cacheManager.CACHE[cacheKey.partition][cacheKey.key];
  expect(cachedItemV2.data).toStrictEqual(itemV2);
  expect(+cachedItemV2.created).toEqual(+new Date(cachedItemV1.created));
  expect(+cachedItemV2.updated).toBeGreaterThan(+new Date(cachedItemV1.updated));
});