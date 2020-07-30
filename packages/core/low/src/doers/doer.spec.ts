import { TaskConfig, Environment } from '../environment';
import { ConnectorContext } from '../connectors/connector';
import { CacheConfig } from '../cache-managers/cache-manager';

process.env.SECRETS = '{}';

test('should be able to execute doer and have input echoed', async () => {
  const env = new Environment({}, [], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('Doer');

  const task: TaskConfig = {
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {},
    name: 'test-doer'
  };

  const context: ConnectorContext<any> = {
    env: env,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
  };

  await doer.execute(context, task);

  expect(context.data[task.name]).toStrictEqual(task.config);
});

test('should be able to execute doer and have input cached and returned', async () => {
  const env = new Environment({}, [], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('Doer');
  const cacheManager = env.getCacheManager('CacheManager');

  const cacheConfig: CacheConfig = {
    cacheManager: 'CacheManager',
    keyProperties: ['env.config.metadata'],
    partition: 'test',
    ttl: 86400000
  };

  const task: TaskConfig = {
    config: {
      test: 'It worked'
    },
    cacheConfig: cacheConfig,
    doer: 'Doer',
    metadata: {},
    name: 'test-doer'
  };

  const context: ConnectorContext<any> = {
    env: env,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
  };

  const cacheKey = await cacheManager.makeKey(cacheConfig, context);

  await doer.execute(context, task);
  const cacheCreated = cacheManager.CACHE[cacheKey.partition][cacheKey.key].touched;

  expect(context.data[task.name]).toStrictEqual(task.config);

  await new Promise((resolve) => { setTimeout(resolve, 2000) });

  await doer.execute(context, task);
  const cacheTouched = cacheManager.CACHE[cacheKey.partition][cacheKey.key].touched;

  expect(+cacheCreated).toBeLessThan(+cacheTouched);
});
