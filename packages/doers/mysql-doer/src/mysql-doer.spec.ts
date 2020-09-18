import { MySqlDoer, MySqlTaskConfig } from './mysql-doer';
import { Environment, ConnectorContext, TaskConfig } from 'low';

test('should be able to setup doer with multiple connections', async () => {
  const [doer] = await setupEnvironment();
  expect(doer.pools.test1?.config.connectionConfig.database).toBe('test1');
  expect(doer.pools.test2?.config.connectionConfig.database).toBe('test2');
  expect(doer.pools.test2?.config.connectionConfig.password).toBe('test password');
});

test('should not be able to perform query on non-existing connection', async () => {
  const [doer, env] = await setupEnvironment();
  const context = createEmptyContext(env);

  const taskConfig: TaskConfig = {
    name: 'test',
    doer: 'MySqlDoer',
    metadata: {},
    config: {
      pool: 'test3',
      query: 'SELECT 1'
    }
  };

  await expect(doer.main(context, taskConfig, taskConfig.config)).rejects.toThrow(`Pool with name '${taskConfig.config.pool}' does not exist`);
});

test('should not be able to perform query on invalid connection', async () => {
  const [doer, env] = await setupEnvironment();
  const context = createEmptyContext(env);

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

test('should be able to handle regular results', async () => {
  const [doer] = await setupEnvironment();

  const results = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const config = {
    pool: 'test1',
    query: 'SELECT 1'
  };

  const response = doer.handleResults(config, null, results);

  expect(response.results).toEqual(results);
});

test('should be able to handle bitsToBools in a single record set', async () => {
  const [doer] = await setupEnvironment();

  const results = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const config = {
    pool: 'test1',
    query: 'SELECT 1',
    bitsToBoolsConfigs: { fields: ['bit_a', 'bit_b'] }
  };

  doer.handleResults(config, null, results);

  expect(results[0].bit_a).toEqual(true);
  expect(results[0].bit_b).toEqual(false);
  expect(results[1].bit_a).toEqual(false);
  expect(results[1].bit_b).toEqual(true);
  expect(results[2].bit_a).toEqual(null);
  expect(results[2].bit_b).toEqual(null);

  doer.handleResults(config, null, []);

  expect(results[0].bit_a).toEqual(true);
  expect(results[0].bit_b).toEqual(false);
  expect(results[1].bit_a).toEqual(false);
  expect(results[1].bit_b).toEqual(true);
  expect(results[2].bit_a).toEqual(null);
  expect(results[2].bit_b).toEqual(null);
});

test('should be able to handle bitsToBools with multiple record sets', async () => {
  const [doer] = await setupEnvironment();

  const results = [
    [
      { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
      { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
      { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
    ],
    [
      { str: 'test', bit_c: Buffer.from([1]), bit_d: Buffer.from([0]), int: 123 },
      { str: 'test 2', bit_c: Buffer.from([0]), bit_d: Buffer.from([1]), int: 456 },
      { str: 'test 3', bit_c: null, bit_d: null, int: 789 }
    ]
  ];

  const config = {
    pool: 'test1',
    query: 'SELECT 1',
    bitsToBoolsConfigs: [
      { recordSetIndex: 0, fields: ['bit_a', 'bit_b'] },
      { recordSetIndex: 1, fields: ['bit_c', 'bit_d'] }
    ]
  };

  doer.handleResults(config, null, results);

  expect((results[0][0] as any).bit_a).toEqual(true);
  expect((results[0][0] as any).bit_b).toEqual(false);
  expect((results[0][1] as any).bit_a).toEqual(false);
  expect((results[0][1] as any).bit_b).toEqual(true);
  expect((results[0][2] as any).bit_a).toEqual(null);
  expect((results[0][2] as any).bit_b).toEqual(null);

  expect((results[1][0] as any).bit_c).toEqual(true);
  expect((results[1][0] as any).bit_d).toEqual(false);
  expect((results[1][1] as any).bit_c).toEqual(false);
  expect((results[1][1] as any).bit_d).toEqual(true);
  expect((results[1][2] as any).bit_c).toEqual(null);
  expect((results[1][2] as any).bit_d).toEqual(null);
});

test('should not be able to convert bits to bools with invalid record sets and references', async () => {
  const [doer] = await setupEnvironment();

  const singleRecordSet = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const config = {
    pool: 'test1',
    query: 'SELECT 1',
    bitsToBoolsConfigs: [
      { recordSetIndex: 0, fields: ['bit_a', 'bit_b'] },
      { recordSetIndex: 1, fields: ['bit_c', 'bit_d'] }
    ]
  };

  expect(() => { doer.handleResults(config, null, singleRecordSet); }).toThrowError(/Record set does not contain results/);
});

test('should be able to handle scalar good results in a single record set', async () => {
  const [doer] = await setupEnvironment();

  const stringResults = [{ str: 'test' }];
  const numberResults = [{ number: 123 }];
  const jsonResults = [{ json: '{ "test": "It works!" }' }];
  const boolTrueResults = [{ bool:  Buffer.from([1]) }];
  const boolFalseResults = [{ bool:  Buffer.from([0]) }];
  const boolStringResults = [{ bool: 'true' }];
  const dateNumberResults = [{ date: 1473077520000 }];
  const dateStringResults = [{ date: '2016-09-05T12:12:00.000Z' }];

  const stringConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'string' }
  };
  const numberConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'number' }
  };
  const jsonConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'json' }
  };
  const boolConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'boolean' }
  };
  const dateConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'date' }
  };
  const anyConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'any' }
  };

  expect(doer.handleResults(stringConfig, null, stringResults)).toBe('test');
  expect(doer.handleResults(numberConfig, null, numberResults)).toBe(123);
  expect(doer.handleResults(jsonConfig, null, jsonResults)).toEqual({ test: 'It works!' });
  expect(doer.handleResults(boolConfig, null, boolTrueResults)).toEqual(true);
  expect(doer.handleResults(boolConfig, null, boolFalseResults)).toEqual(false);
  expect(doer.handleResults(boolConfig, null, boolStringResults)).toEqual(true);
  expect(doer.handleResults(dateConfig, null, dateNumberResults)).toEqual(new Date(1473077520000));
  expect(doer.handleResults(dateConfig, null, dateStringResults)).toEqual(new Date(1473077520000));
  expect(doer.handleResults(anyConfig, null, stringResults)).toBe('test');
});

test('should be able to handle scalar good results in a single record set', async () => {
  const [doer] = await setupEnvironment();

  const stringResults = [[], [{ str: 'test' }]];
  const numberResults = [[], [{ number: 123 }]];
  const jsonResults = [[], [{ json: '{ "test": "It works!" }' }]];
  const boolTrueResults = [[], [{ bool:  Buffer.from([1]) }]];
  const boolFalseResults = [[], [{ bool:  Buffer.from([0]) }]];
  const boolStringResults = [[], [{ bool: 'true' }]];
  const dateNumberResults = [[], [{ date: 1473077520000 }]];
  const dateStringResults = [[], [{ date: '2016-09-05T12:12:00.000Z' }]];

  const stringConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'string', recordSetIndex: 1 }
  };
  const numberConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'number', recordSetIndex: 1 }
  };
  const jsonConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'json', recordSetIndex: 1 }
  };
  const boolConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'boolean', recordSetIndex: 1 }
  };
  const dateConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'date', recordSetIndex: 1 }
  };
  const anyConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'any', recordSetIndex: 1 }
  };

  expect(doer.handleResults(stringConfig, null, stringResults)).toBe('test');
  expect(doer.handleResults(numberConfig, null, numberResults)).toBe(123);
  expect(doer.handleResults(jsonConfig, null, jsonResults)).toEqual({ test: 'It works!' });
  expect(doer.handleResults(boolConfig, null, boolTrueResults)).toEqual(true);
  expect(doer.handleResults(boolConfig, null, boolFalseResults)).toEqual(false);
  expect(doer.handleResults(boolConfig, null, boolStringResults)).toEqual(true);
  expect(doer.handleResults(dateConfig, null, dateNumberResults)).toEqual(new Date(1473077520000));
  expect(doer.handleResults(dateConfig, null, dateStringResults)).toEqual(new Date(1473077520000));
  expect(doer.handleResults(anyConfig, null, stringResults)).toBe('test');
});

test('should not be able to resolve scalar with wrong number of result sets or rows or columns', async () => {
  const [doer] = await setupEnvironment();

  const results = [{ str: 'test' }];
  const config: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: {
      recordSetIndex: 1,
      type: 'string'
    }
  };

  expect(() => { doer.handleResults(config, null, results) }).toThrowError(/Record set does not contain results/);
  expect(() => { doer.handleResults(config, null, []) }).toThrowError(/Record set does not contain results/);
  expect(() => { doer.handleResults(config, null, [[]]) }).toThrowError(/Record set does not contain results/);

  config.scalarConfig = {
    type: 'string'
  }

  const results2Columns = [{ str: 'test', number: 123 }];
  const results2Rows = [{ str: 'test' }, { str: 'test2' }];

  expect(() => { doer.handleResults(config, null, results2Columns) }).toThrowError(/Cannot treat results with more or less than 1 column as a scalar results/);
  expect(() => { doer.handleResults(config, null, results2Rows) }).toThrowError(/Record set contains more or less than one row/);

  const multipleRecordSets = [[{ str: 'test' }], [{ str: 'test' }]];
  expect(() => { doer.handleResults(config, null, multipleRecordSets) }).toThrowError(/Record set contains more or less than one row/);
});

test('should not be able to resolve scalar when result not castable', async () => {
  const [doer] = await setupEnvironment();

  const results = [{ str: 'test' }];
  const config: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarConfig: { type: 'json' }
  };

  expect(() => { doer.handleResults(config, null, results) }).toThrowError(/Unexpected token e in JSON at position 1/);
});

async function setupEnvironment(): Promise<[MySqlDoer, Environment]> {
  const doer = new MySqlDoer();
  process.env.SECRETS = JSON.stringify({
    modules: {
      MySqlDoer: { test2: 'test password' }
    }
  });
  const env = new Environment({ doers: [doer] }, [], {
    modules: {
      MySqlDoer: {
        test1: { host: '127.0.0.1', database: 'test1', port: 3306, password: 't35t' },
        test2: { host: '127.0.0.1', database: 'test2', port: 3306 }
      }
    }
  });
  await env.init();

  return [doer, env];
}


function createEmptyContext(env: Environment): ConnectorContext<any> {
  return {
    data: {},
    errors: {},
    calls: {},
    connector: {
      input: {},
      config: {}
    },
    env: env
  };
}