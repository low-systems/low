import * as FS from 'fs';

import { Environment, EnvironmentConfig, ConnectorContext, TaskConfig } from 'low';

import { CloudTasksDoer, CloudTasksTaskConfig } from './cloud-tasks-doer';

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
          "test-client": CLIENT_CONFIGS
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

function getTaskConfig(name: string, coreConfig: CloudTasksTaskConfig): TaskConfig {
  return {
    name: name,
    doer: 'CloudTasksDoer',
    metadata: {},
    config: coreConfig
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

test('should be able to initialise Doer', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('CloudTasksDoer') as CloudTasksDoer;

  expect(doer.clients).toHaveProperty('test-client');
});

test('should be able to create, get, and delete a task queue', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const doer = environment.getDoer('CloudTasksDoer') as CloudTasksDoer;

  const queueName = 'test-queue-' + (Math.floor(Math.random() * 89999) + 10000);

  jest.setTimeout(30000);

  //TODO: Work out what the hell is going wrong with my AppEngine routing.
  //      Perhaps setup a new project
  const context = getContext();
  const taskConfig1 = getTaskConfig('test1', {
    calls: [
      {
        name: 'createQueue',
        method: 'createQueue',
        client: 'test-client',
        request: {
          parent: 'projects/scvo-net/locations/europe-west2',
          queue: {
            name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName
          }
        }
      },
      {
        name: 'pauseQueue',
        method: 'pauseQueue',
        client: 'test-client',
        request: {
          name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName
        }
      },
      {
        name: 'getQueue',
        method: 'getQueue',
        client: 'test-client',
        request: {
          name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName
        }
      },
      {
        name: 'createTask',
        method: 'createTask',
        client: 'test-client',
        request: {
          parent: 'projects/scvo-net/locations/europe-west2/queues/' + queueName,
          task: {
            name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName + '/tasks/test-task',
            payloadType: 'app_engine_http_request',
            appEngineHttpRequest: {
              relativeUri: '/',
              httpMethod: 'GET',
              body: null
            }
            //payloadType: 'http_request',
            //httpRequest: {
            //  httpMethod: 'POST',
            //  headers: {
            //    'Content-Type': 'application/json'
            //  },
            //  url: 'https://example.com/test',
            //  body: '{ "test": "It worked!" }'
            //}
          }
        }
      },
      {
        name: 'getTask',
        method: 'getTask',
        client: 'test-client',
        request: {
          name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName + '/tasks/test-task'
        }
      }
    ]
  });
  const taskConfig2 = getTaskConfig('test2', {
    calls: [
      {
        name: 'runTask',
        method: 'runTask',
        client: 'test-client',
        request: {
          name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName + '/tasks/test-task'
        }
      },
      {
        name: 'deleteQueue',
        method: 'deleteQueue',
        client: 'test-client',
        request: {
          name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName
        }
      }
    ]
  });

  await doer.execute(context, taskConfig1);
  await new Promise((resolve) => { setTimeout(() => { resolve(); }, 10000); });
  await doer.execute(context, taskConfig2);

  FS.writeFileSync(__dirname + '/context-data.json', JSON.stringify(context.data, null, 2));

  expect(context.data.test1).toHaveProperty('createQueue');
});