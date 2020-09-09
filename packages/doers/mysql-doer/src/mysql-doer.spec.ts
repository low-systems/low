import { MySqlDoer } from './mysql-doer';
import { Environment, ConnectorContext, TaskConfig } from 'low';

test('should be able convert bits to bools for a single result set', async () => {
  const doer = new MySqlDoer();

  const results = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const config = ['bit_a', 'bit_b'];

  doer.bitsToBools(results, config);

  expect(results[0].bit_a).toEqual(true);
  expect(results[0].bit_b).toEqual(false);
  expect(results[1].bit_a).toEqual(false);
  expect(results[1].bit_b).toEqual(true);
  expect(results[2].bit_a).toEqual(null);
  expect(results[2].bit_b).toEqual(null);
});

test('should be able to setup doer with multiple connections', async () => {
  const doer = new MySqlDoer();
  process.env.SECRETS = JSON.stringify({
    modules: {
      MySqlDoer: { test2: 'test password' }
    }
  });
  const env = new Environment({ doers: [doer] }, [], {
    modules: {
      MySqlDoer: {
        test1: { host: '127.0.0.1', database: 'test1' },
        test2: { host: '127.0.0.1', database: 'test2' }
      }
    }
  });
  await env.init();

  expect(doer.pools.test1?.config.connectionConfig.database).toBe('test1');
  expect(doer.pools.test2?.config.connectionConfig.database).toBe('test2');
  expect(doer.pools.test2?.config.connectionConfig.password).toBe('test password');
});

test('should not be able to perform query on non-existing connection', async () => {
  const doer = new MySqlDoer();
  process.env.SECRETS = JSON.stringify({
    modules: {
      MySqlDoer: { test2: 'test password' }
    }
  });
  const env = new Environment({ doers: [doer] }, [], {
    modules: {
      MySqlDoer: {
        test1: { host: '127.0.0.1', database: 'test1' }
      }
    }
  });
  await env.init();

  const context: ConnectorContext<any> = {
    data: {},
    errors: {},
    calls: {},
    connector: {
      input: {},
      config: {}
    },
    env: env
  };

  const taskConfig: TaskConfig = {
    name: 'test',
    doer: 'MySqlDoer',
    metadata: {},
    config: {
      pool: 'test2',
      query: 'SELECT 1'
    }
  };

  await expect(doer.main(context, taskConfig, taskConfig.config)).rejects.toThrow(`Pool with name '${taskConfig.config.pool}' does not exist`);
});

test('should not be able to perform query on invalid connection', async () => {
  const doer = new MySqlDoer();
  process.env.SECRETS = JSON.stringify({
    modules: {
      MySqlDoer: { test2: 'test password' }
    }
  });
  const env = new Environment({ doers: [doer] }, [], {
    modules: {
      MySqlDoer: {
        test1: { host: '127.0.0.1', database: 'test1', port: '12345' }
      }
    }
  });
  await env.init();

  const context: ConnectorContext<any> = {
    data: {},
    errors: {},
    calls: {},
    connector: {
      input: {},
      config: {}
    },
    env: env
  };

  const taskConfig: TaskConfig = {
    name: 'test',
    doer: 'MySqlDoer',
    metadata: {},
    config: {
      pool: 'test1',
      query: 'SELECT 1'
    }
  };

  await expect(doer.main(context, taskConfig, taskConfig.config)).rejects.toThrow(`connect ECONNREFUSED ${doer.config.test1.host}:${doer.config.test1.port}`);
});