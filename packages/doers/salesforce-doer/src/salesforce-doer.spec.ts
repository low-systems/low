import { SalesforceDoer } from './salesforce-doer';
import { Environment, TaskConfig, ConnectorContext } from 'low';

const ENVIRONMENT_CONFIG = require('../configuration/environment');
const SECRETS = require('../configuration/secrets');
let environment: Environment | undefined;

beforeAll(async (done) => {
  process.env.SECRETS = JSON.stringify(SECRETS);

  const modules = {
    doers: [new SalesforceDoer()]
  };
  environment = new Environment(modules, [], ENVIRONMENT_CONFIG);

  await environment.init();

  done();
})

afterAll(async (done) => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }

  done();
});

function getTaskConfig(name: string, method: string, other: any): TaskConfig {
  return {
    name: name,
    doer: 'SalesforceDoer',
    metadata: {},
    config: {
      method,
      connection: 'test',
      ...other
    }
  };
}

function getContext(): ConnectorContext<any> {
  return {
    connector: { config: {}, input: {} },
    data: {},
    env: environment as Environment,
    errors: {}
  };
}

function chunk(arr: any[], size: number) {
  const chunked: any[][] = [];
  let index = 0;
  while (index < arr.length) {
    chunked.push(arr.slice(index, size + index));
    index += size;
  }
  return chunked;
}

test('should be able to connect to Salesforce', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('SalesforceDoer') as SalesforceDoer;

  expect(doer.connections).toHaveProperty('test');
  expect(doer.connections.test.accessToken).not.toBeFalsy();
});

test('should be able to query objects', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('SalesforceDoer') as SalesforceDoer;

  const context = getContext();
  const queryTask = getTaskConfig('queryTask', 'query', {
    all: true,
    query: 'SELECT Id, Name FROM Account'
  });

  await doer.execute(context, queryTask);

  expect(context.data.queryTask).toHaveProperty('totalSize');
});

test('should be able to perform crud operations', async () => {
  jest.setTimeout(60000);

  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('SalesforceDoer') as SalesforceDoer;

  const context = getContext();
  const queryTask1 = getTaskConfig('queryTask1', 'query', {
    query: `SELECT Id, Name FROM Account WHERE Name = 'Another test'`
  });

  await doer.execute(context, queryTask1);
  const accountCountBefore = context.data.queryTask1.totalSize;
  const accountIdsBefore = context.data.queryTask1.records.map((record: any) => record.Id);

  const createTask = getTaskConfig('createTask', 'create', {
    resource: 'Account',
    objects: [
      { name: 'Another test'}
    ]
  });

  await doer.execute(context, createTask);
  const newAccountId = context.data.createTask[0].id;
  expect(accountIdsBefore).not.toContain(newAccountId);
  expect(context.data.createTask[0].success).toBeTruthy();

  const queryTask2 = getTaskConfig('queryTask2', 'query', {
    query: `SELECT Id, Name FROM Account WHERE Name = 'Another test'`
  });

  await doer.execute(context, queryTask2);
  const accountCountAfter = context.data.queryTask2.totalSize;
  const accountIdsAfter = context.data.queryTask2.records.map((record: any) => record.Id);
  expect(accountCountAfter).toBeGreaterThan(accountCountBefore);
  expect(accountIdsAfter).toContain(newAccountId);

  const deleteTask = getTaskConfig('deleteTask', 'delete', {
    resource: 'Account',
    ids: accountIdsAfter
  });

  await doer.execute(context, deleteTask);
  expect(context.data.deleteTask[0].success).toBeTruthy();

  const queryTask3 = getTaskConfig('queryTask3', 'query', {
    query: `SELECT Id, Name FROM Account WHERE Name = 'Another test'`
  });

  await doer.execute(context, queryTask3);
  expect(context.data.queryTask3.totalSize).toBe(0);
});

test('should be able to bulk insert objects', async () => {
  jest.setTimeout(60000);

  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('SalesforceDoer') as SalesforceDoer;

  const accounts = [...Array(100).keys()].map((i: number) => {
    return {
      Name: `Test Account ${i}`,
      Website: 'https://example.com'
    };
  });
  const accountChunks = chunk(accounts, 100);

  const context = getContext();
  const insertTask = getTaskConfig('insertTask', 'bulkCrud', {
    resource: 'Account',
    operation: 'insert',
    batches: accountChunks,
  });

  await doer.execute(context, insertTask);
  expect(context.data.insertTask[0].length).toBe(100);

  const queryTask1 = getTaskConfig('queryTask1', 'bulkQuery', {
    query: `SELECT Id, Name FROM Account WHERE Website = 'https://example.com'`
  });

  await doer.execute(context, queryTask1);
  const accountIds = context.data.queryTask1.map((record: any) => { return { Id: record.Id }; });
  const accountIdChunks = chunk(accountIds, 100);
  expect(context.data.queryTask1.length).toBeGreaterThanOrEqual(100);

  const deleteTask = getTaskConfig('deleteTask', 'bulkCrud', {
    resource: 'Account',
    operation: 'delete',
    batches: accountIdChunks
  });

  await doer.execute(context, deleteTask);

  const queryTask2 = getTaskConfig('queryTask2', 'bulkQuery', {
    query: `SELECT Id, Name FROM Account WHERE Website = 'https://example.com'`
  });

  await doer.execute(context, queryTask2);

  expect(context.data.queryTask2.length).toBe(0);
});