import { expect, test, beforeAll, afterAll } from '@jest/globals';

import { Environment } from '../../environment';
import { RedisCacheManager } from './redis-cache-manager';

import { fail } from 'assert';

let environment: Environment | undefined;
beforeAll(async () => {
  process.env.SECRETS = JSON.stringify({});

  environment = new Environment({
    cacheManagers: [new RedisCacheManager()],
  }, [], {});

  await environment.init();
});

afterAll(async () => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }
});

test('should be able to cache something', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const cacheManager = environment.getCacheManager('RedisCacheManager') as RedisCacheManager;

  const cacheKey = await cacheManager.makeKey({
    cacheManager: 'RedisCacheManager',
    keyProperties: [
      'env.config.metadata.test'
    ],
    partition: 'test',
    ttl: 86400000
  }, {
    env: environment
  });

  console.log('CACHE KEY', JSON.stringify(cacheKey, null, 2));

  await cacheManager.setItem(cacheKey, { test: 'It worked' }, 86400000);

  const cachedItem = await cacheManager.getItem(cacheKey);

  console.log('CACHED ITEM', JSON.stringify(cachedItem, null, 2));

  expect(cachedItem).toStrictEqual({ test: 'It worked' });
});