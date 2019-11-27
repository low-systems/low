import { Environment, EnvironmentConfig, ConnectorContext, TaskConfig } from 'low';

import { CloudTasksDoer } from './cloud-tasks-doer';

const CLIENT_CONFIGS = require('../configuration/client.secrets.json');
const SECRETS = require('../configuration/secrets');

let environment: Environment | undefined;
beforeAll(async (done) => {
  process.env.SECRETS = JSON.stringify(SECRETS);

  const modules = {
    doers: [new CloudTasksDoer()]
  };
  const config: EnvironmentConfig = {
    modules: {
      CloudTasksDoer: {
        clientConfigs: {
          "test-client": CLIENT_CONFIGS.testClient
        }
      }
    }
  };
  environment = new Environment(modules, [], config);
  await environment.init();

  done();
});

afterAll(async (done) => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }

  done();
});

function getTaskConfig(name: string, calls: any[]): TaskConfig {
  const taskConfig = {
    name: name,
    doer: 'CloudTasksDoer',
    metadata: {},
    config: { calls }
  };

  return taskConfig;
}

function getCall(name: string, method: string, request: any) {
  return { name, method, client: 'test-client', request };
}

function getContext(): ConnectorContext<any> {
  return {
    connector: { config: {}, input: {} },
    data: {},
    env: environment as Environment,
    errors: {}
  };
}

test('should be able to initialise Doer', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('CloudTasksDoer') as CloudTasksDoer;

  expect(doer.clients).toHaveProperty('test-client');
});

test('should be able to create, get, and delete a task queue', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('CloudTasksDoer') as CloudTasksDoer;
  const client = doer.clients['test-client'];

  const queueName = 'test-queue-' + (Math.floor(Math.random() * 89999) + 10000);

  //We need a big delay after creating a queue before executing tasks in it
  jest.setTimeout(60000);

  const locationPath = client.locationPath(CLIENT_CONFIGS.projectId, CLIENT_CONFIGS.locationId);
  const queuePath = client.queuePath(CLIENT_CONFIGS.projectId, CLIENT_CONFIGS.locationId, queueName);
  const taskPath = client.taskPath(CLIENT_CONFIGS.projectId, CLIENT_CONFIGS.locationId, queueName, 'test-task');

  const context = getContext();
  const task1 = getTaskConfig('task1', [
    getCall('createQueue', 'createQueue', {
      parent: locationPath,
      queue: {
        name: queuePath
      }
    }),
    getCall('pauseQueue', 'pauseQueue', {
      name: queuePath
    }),
    getCall('getQueue', 'getQueue', {
      name: queuePath
    }),
    getCall('createTask', 'createTask', {
      parent: queuePath,
      task: {
        name: taskPath,
        payloadType: CLIENT_CONFIGS.payloadType,
        appEngineHttpRequest: CLIENT_CONFIGS.payloadType === 'http_request' ? undefined : CLIENT_CONFIGS.payload,
        httpRequest: CLIENT_CONFIGS.payloadType === 'app_engine_http_request' ? undefined : CLIENT_CONFIGS.payload
      }
    }),
    getCall('getTask', 'getTask', {
      name: taskPath
    })
  ]);
  const task2 = getTaskConfig('task2', [
    getCall('runTask', 'runTask', {
      name: taskPath
    }),
    getCall('deleteQueue', 'deleteQueue', {
      name: queuePath
    })
  ]);

  await doer.execute(context, task1);
  const task1Data = context.data.task1;

  expect(task1Data).toHaveProperty('createQueue');
  expect(task1Data.createQueue[0].name).toBe(queuePath);
  expect(task1Data.createQueue[0].state).toBe('RUNNING');
  expect(task1Data.createQueue[1]).toBeUndefined();
  expect(task1Data.createQueue[2]).toBeUndefined();

  expect(task1Data).toHaveProperty('pauseQueue');
  expect(task1Data.pauseQueue[0].name).toBe(queuePath);
  expect(task1Data.pauseQueue[0].state).toBe('PAUSED');
  expect(task1Data.pauseQueue[1]).toBeUndefined();
  expect(task1Data.pauseQueue[2]).toBeUndefined();

  expect(task1Data).toHaveProperty('getQueue');
  expect(task1Data.getQueue[0].name).toBe(queuePath);
  expect(task1Data.getQueue[0].state).toBe('PAUSED');
  expect(task1Data.getQueue[1]).toBeUndefined();
  expect(task1Data.getQueue[2]).toBeUndefined();

  expect(task1Data).toHaveProperty('createTask');
  expect(task1Data.createTask[0].name).toBe(taskPath);
  if (CLIENT_CONFIGS.payloadType === 'http_request') {
    expect(task1Data.createTask[0].payloadType).toBe('httpRequest');
    expect(task1Data.createTask[0].httpRequest.url).toBe(CLIENT_CONFIGS.payload.url);
  } else if (CLIENT_CONFIGS.payloadType === 'app_engine_http_request') {
    expect(task1Data.createTask[0].payloadType).toBe('appEngineHttpRequest');
    expect(task1Data.createTask[0].appEngineHttpRequest.relativeUri).toBe(CLIENT_CONFIGS.payload.relativeUri);
  }
  expect(task1Data.createTask[1]).toBeUndefined();
  expect(task1Data.createTask[2]).toBeUndefined();

  expect(task1Data).toHaveProperty('getTask');
  expect(task1Data.getTask[0].name).toBe(taskPath);
  if (CLIENT_CONFIGS.payloadType === 'http_request') {
    expect(task1Data.getTask[0].payloadType).toBe('httpRequest');
    expect(task1Data.getTask[0].httpRequest.url).toBe(CLIENT_CONFIGS.payload.url);
  } else if (CLIENT_CONFIGS.payloadType === 'app_engine_http_request') {
    expect(task1Data.getTask[0].payloadType).toBe('appEngineHttpRequest');
    expect(task1Data.getTask[0].appEngineHttpRequest.relativeUri).toBe(CLIENT_CONFIGS.payload.relativeUri);
  }
  expect(task1Data.getTask[1]).toBeUndefined();
  expect(task1Data.getTask[2]).toBeUndefined();

  //Delay before executing task because sometimes it takes a wee while for a queue to be ready to run
  await new Promise((resolve) => { setTimeout(() => { resolve(); }, 20000); });
  await doer.execute(context, task2);
  const task2Data = context.data.task2;

  expect(task2Data).toHaveProperty('runTask');
  expect(task2Data.runTask[0].name).toBe(taskPath);
  if (CLIENT_CONFIGS.payloadType === 'http_request') {
    expect(task2Data.runTask[0].payloadType).toBe('httpRequest');
    expect(task2Data.runTask[0].httpRequest.url).toBe(CLIENT_CONFIGS.payload.url);
  } else if (CLIENT_CONFIGS.payloadType === 'app_engine_http_request') {
    expect(task2Data.runTask[0].payloadType).toBe('appEngineHttpRequest');
    expect(task2Data.runTask[0].appEngineHttpRequest.relativeUri).toBe(CLIENT_CONFIGS.payload.relativeUri);
  }
  expect(task2Data.runTask[1]).toBeUndefined();
  expect(task2Data.runTask[2]).toBeUndefined();

  expect(task2Data).toHaveProperty('deleteQueue');
  expect(task2Data.deleteQueue[0]).toEqual({})
  expect(task2Data.deleteQueue[1]).toBeUndefined();
  expect(task2Data.deleteQueue[2]).toBeUndefined();
});