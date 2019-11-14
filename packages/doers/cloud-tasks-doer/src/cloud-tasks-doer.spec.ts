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

  const queueName = 'test-queue-' + Math.floor(Math.random() * 89999) + 10000;

  const context = getContext();
  const taskConfig = getTaskConfig('test', {
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
        name: 'getQueue',
        method: 'getQueue',
        client: 'test-client',
        request: {
          name: 'projects/scvo-net/locations/europe-west2/queues/' + queueName
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

  await doer.execute(context, taskConfig);

  expect(context.data.test).toHaveProperty('createQueue');
});