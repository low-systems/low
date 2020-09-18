import { MySqlDoer, MySqlTaskConfig } from './mysql-doer';
import { Environment, ConnectorContext, TaskConfig } from 'low';
import { FieldInfo } from 'mysql';

test('should be able convert bits to bools for a single result set', async () => {
  const doer = new MySqlDoer();

  const results = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const fieldInfo = getFieldInfo(results[0]);
  const config = ['bit_a', 'bit_b'];

  doer.bitsToBools(results, config, fieldInfo);

  expect(results[0].bit_a).toEqual(true);
  expect(results[0].bit_b).toEqual(false);
  expect(results[1].bit_a).toEqual(false);
  expect(results[1].bit_b).toEqual(true);
  expect(results[2].bit_a).toEqual(null);
  expect(results[2].bit_b).toEqual(null);

  doer.bitsToBools(results, [], fieldInfo);

  expect(results[0].bit_a).toEqual(true);
  expect(results[0].bit_b).toEqual(false);
  expect(results[1].bit_a).toEqual(false);
  expect(results[1].bit_b).toEqual(true);
  expect(results[2].bit_a).toEqual(null);
  expect(results[2].bit_b).toEqual(null);
});

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

test('should be able to handle bitsToBools results', async () => {
  const [doer] = await setupEnvironment();

  const results = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const fieldInfo = getFieldInfo(results[0]);
  const config = {
    pool: 'test1',
    query: 'SELECT 1',
    convertBitsToBools: ['bit_a', 'bit_b']
  };

  doer.handleResults(config, null, results, fieldInfo);

  expect(results[0].bit_a).toEqual(true);
  expect(results[0].bit_b).toEqual(false);
  expect(results[1].bit_a).toEqual(false);
  expect(results[1].bit_b).toEqual(true);
  expect(results[2].bit_a).toEqual(null);
  expect(results[2].bit_b).toEqual(null);
});

test('should not be able to handle bitsToBools with multiple or no result sets', async () => {
  const [doer] = await setupEnvironment();

  const results = [
    { str: 'test', bit_a: Buffer.from([1]), bit_b: Buffer.from([0]), int: 123 },
    { str: 'test 2', bit_a: Buffer.from([0]), bit_b: Buffer.from([1]), int: 456 },
    { str: 'test 3', bit_a: null, bit_b: null, int: 789 }
  ];

  const fieldInfos = [getFieldInfo(results[0]), getFieldInfo(results[0])];
  const config = {
    pool: 'test1',
    query: 'SELECT 1',
    convertBitsToBools: ['bit_a', 'bit_b']
  };

  expect(() => { doer.handleResults(config, null, results, fieldInfos) }).toThrowError(/Cannot convert bits to bools on multiple record/);
  expect(() => { doer.handleResults(config, null, results) }).toThrowError(/Cannot convert bits to bools as there appears to be no/);
});

test('should be able to handle scalar good results', async () => {
  const [doer] = await setupEnvironment();

  const stringResults = [{ str: 'test' }];
  const numberResults = [{ number: 123 }];
  const jsonResults = [{ json: '{ "test": "It works!" }' }];
  const boolTrueResults = [{ bool:  Buffer.from([1]) }];
  const boolFalseResults = [{ bool:  Buffer.from([0]) }];
  const boolStringResults = [{ bool: 'true' }];
  const dateNumberResults = [{ date: 1473077520000 }];
  const dateStringResults = [{ date: '2016-09-05T12:12:00.000Z' }];

  const fieldInfo = getFieldInfo(stringResults);
  const stringConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'string'
  };
  const numberConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'number'
  };
  const jsonConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'json'
  };
  const boolConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'boolean'
  };
  const dateConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'date'
  };
  const anyConfig: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'any'
  };

  expect(doer.handleResults(stringConfig, null, stringResults, fieldInfo)).toBe('test');
  expect(doer.handleResults(numberConfig, null, numberResults, fieldInfo)).toBe(123);
  expect(doer.handleResults(jsonConfig, null, jsonResults, fieldInfo)).toEqual({ test: 'It works!' });
  expect(doer.handleResults(boolConfig, null, boolTrueResults, fieldInfo)).toEqual(true);
  expect(doer.handleResults(boolConfig, null, boolFalseResults, fieldInfo)).toEqual(false);
  expect(doer.handleResults(boolConfig, null, boolStringResults, fieldInfo)).toEqual(true);
  expect(doer.handleResults(dateConfig, null, dateNumberResults, fieldInfo)).toEqual(new Date(1473077520000));
  expect(doer.handleResults(dateConfig, null, dateStringResults, fieldInfo)).toEqual(new Date(1473077520000));
  expect(doer.handleResults(anyConfig, null, stringResults, fieldInfo)).toBe('test');
});

test('should not be able to resolve scalar with wrong number of result sets or rows or columns', async () => {
  const [doer] = await setupEnvironment();

  const results = [{ str: 'test' }];
  const fieldInfos = [getFieldInfo(results), getFieldInfo(results)];
  const config: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'string'
  };

  expect(() => { doer.handleResults(config, null, results, fieldInfos) }).toThrowError(/Cannot treat multiple record sets as a scalar result/);
  expect(() => { doer.handleResults(config, null, results) }).toThrowError(/Cannot resolve scalar value as there appears to be no Field info/);

  const results2Columns = [{ str: 'test', number: 123 }];
  const results2Rows = [{ str: 'test' }, { str: 'test2' }];

  expect(() => { doer.handleResults(config, null, results2Columns, fieldInfos[0]) }).toThrowError(/Cannot treat results with more or less than 1 column as a scalar results/);
  expect(() => { doer.handleResults(config, null, results2Rows, fieldInfos[0]) }).toThrowError(/Cannot treat results with more or less than 1 row as a scalar result/);
});

test('should not be able to resolve scalar when result not castable', async () => {
  const [doer] = await setupEnvironment();

  const results = [{ str: 'test' }];
  const fieldInfo = getFieldInfo(results);
  const config: MySqlTaskConfig = {
    pool: 'test1',
    query: 'SELECT 1',
    scalarType: 'json'
  };

  expect(() => { doer.handleResults(config, null, results, fieldInfo) }).toThrowError(/Unexpected token e in JSON at position 1/);
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

function getFieldInfo(record: any): FieldInfo[] {
  const fieldInfo: FieldInfo[] = [];
  Object.keys(record).forEach((key) => {
    fieldInfo.push({
      catalog: "def",
      charsetNr: 63,
      db: "",
      decimals: 0,
      default: undefined,
      flags: 128,
      length: 16777216,
      name: key,
      orgName: "",
      orgTable: "",
      protocol41: true,
      table: "",
      type: 245,
      zeroFill: false
    });
  });
  return fieldInfo;
}