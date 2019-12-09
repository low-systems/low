import { Environment, EnvironmentConfig, ConnectorContext } from 'low';

import { CloudTasksDoer } from './cloud-tasks-doer';

const CLIENT_CONFIGS = require('../configuration/client.secrets.json');
const SECRETS = require('../configuration/secrets');

let environment: Environment | undefined;
let doer: CloudTasksDoer | undefined;
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
  doer = environment.getDoer('CloudTasksDoer') as CloudTasksDoer;

  done();
});

afterAll(async (done) => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }

  done();
});

function getContext(): ConnectorContext<any> {
  return {
    connector: { config: {}, input: {} },
    data: {},
    env: environment as Environment,
    errors: {}
  };
}

async function runTask(context: ConnectorContext<any>, name: string, method: string, request: any) {
  if (!doer) { fail('Could not load Doer from environment'); return; }

  const taskConfig = {
    name,
    doer: 'CloudTasksDoer',
    metadata: {},
    config: {
      method,
      request,
      client: 'test-client',
    }
  };

  await doer.execute(context, taskConfig);
}

test('should be able to initialise Doer', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  if (!doer) { fail('Could not load Doer from environment'); return; }

  expect(doer.clients).toHaveProperty('test-client');
});

test('should be able to create, get, and delete a task queue', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  if (!doer) { fail('Could not load Doer from environment'); return; }

  const client = doer.clients['test-client'];

  const queueName = 'test-queue-' + (Math.floor(Math.random() * 89999) + 10000);

  //We need a big delay after creating a queue before executing tasks in it
  jest.setTimeout(60000);

  const locationPath = client.locationPath(CLIENT_CONFIGS.projectId, CLIENT_CONFIGS.locationId);
  const queuePath = client.queuePath(CLIENT_CONFIGS.projectId, CLIENT_CONFIGS.locationId, queueName);
  const taskPath = client.taskPath(CLIENT_CONFIGS.projectId, CLIENT_CONFIGS.locationId, queueName, 'test-task');

  const context = getContext();

  await runTask(context, 'createQueue', 'createQueue', {
    parent: locationPath,
    queue: {
      name: queuePath
    }
  });
  expect(context.data.createQueue[0].name).toBe(queuePath);
  expect(context.data.createQueue[0].state).toBe('RUNNING');
  expect(context.data.createQueue[1]).toBeUndefined();
  expect(context.data.createQueue[2]).toBeUndefined();


  await runTask(context, 'pauseQueue', 'pauseQueue', {
    name: queuePath
  });
  expect(context.data.pauseQueue[0].name).toBe(queuePath);
  expect(context.data.pauseQueue[0].state).toBe('PAUSED');
  expect(context.data.pauseQueue[1]).toBeUndefined();
  expect(context.data.pauseQueue[2]).toBeUndefined();

  await runTask(context, 'getQueue', 'getQueue', {
    name: queuePath
  });
  expect(context.data.getQueue[0].name).toBe(queuePath);
  expect(context.data.getQueue[0].state).toBe('PAUSED');
  expect(context.data.getQueue[1]).toBeUndefined();
  expect(context.data.getQueue[2]).toBeUndefined();

  await runTask(context, 'createTask', 'createTask', {
    parent: queuePath,
    task: {
      name: taskPath,
      payloadType: CLIENT_CONFIGS.payloadType,
      appEngineHttpRequest: CLIENT_CONFIGS.payloadType === 'http_request' ? undefined : CLIENT_CONFIGS.payload,
      httpRequest: CLIENT_CONFIGS.payloadType === 'app_engine_http_request' ? undefined : CLIENT_CONFIGS.payload
    }
  });
  expect(context.data.createTask[0].name).toBe(taskPath);
  if (CLIENT_CONFIGS.payloadType === 'http_request') {
    expect(context.data.createTask[0].payloadType).toBe('httpRequest');
    expect(context.data.createTask[0].httpRequest.url).toBe(CLIENT_CONFIGS.payload.url);
  } else if (CLIENT_CONFIGS.payloadType === 'app_engine_http_request') {
    expect(context.data.createTask[0].payloadType).toBe('appEngineHttpRequest');
    expect(context.data.createTask[0].appEngineHttpRequest.relativeUri).toBe(CLIENT_CONFIGS.payload.relativeUri);
  }
  expect(context.data.createTask[1]).toBeUndefined();
  expect(context.data.createTask[2]).toBeUndefined();

  await runTask(context, 'getTask', 'getTask', {
    name: taskPath
  });
  expect(context.data.getTask[0].name).toBe(taskPath);
  if (CLIENT_CONFIGS.payloadType === 'http_request') {
    expect(context.data.getTask[0].payloadType).toBe('httpRequest');
    expect(context.data.getTask[0].httpRequest.url).toBe(CLIENT_CONFIGS.payload.url);
  } else if (CLIENT_CONFIGS.payloadType === 'app_engine_http_request') {
    expect(context.data.getTask[0].payloadType).toBe('appEngineHttpRequest');
    expect(context.data.getTask[0].appEngineHttpRequest.relativeUri).toBe(CLIENT_CONFIGS.payload.relativeUri);
  }
  expect(context.data.getTask[1]).toBeUndefined();
  expect(context.data.getTask[2]).toBeUndefined();

  //Delay before executing task because sometimes it takes a wee while for a queue to be ready to run
  await new Promise((resolve) => { setTimeout(() => { resolve(); }, 20000); });

  await runTask(context, 'runTask', 'runTask', {
    name: taskPath
  });
  expect(context.data.runTask[0].name).toBe(taskPath);
  if (CLIENT_CONFIGS.payloadType === 'http_request') {
    expect(context.data.runTask[0].payloadType).toBe('httpRequest');
    expect(context.data.runTask[0].httpRequest.url).toBe(CLIENT_CONFIGS.payload.url);
  } else if (CLIENT_CONFIGS.payloadType === 'app_engine_http_request') {
    expect(context.data.runTask[0].payloadType).toBe('appEngineHttpRequest');
    expect(context.data.runTask[0].appEngineHttpRequest.relativeUri).toBe(CLIENT_CONFIGS.payload.relativeUri);
  }
  expect(context.data.runTask[1]).toBeUndefined();
  expect(context.data.runTask[2]).toBeUndefined();

  await runTask(context, 'deleteQueue', 'deleteQueue', {
    name: queuePath
  });
  expect(context.data.deleteQueue[0]).toEqual({})
  expect(context.data.deleteQueue[1]).toBeUndefined();
  expect(context.data.deleteQueue[2]).toBeUndefined();
});