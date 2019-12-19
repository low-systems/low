import { Environment, TaskConfig } from '../environment';

process.env.SECRETS = '{}';

const testTasks: TaskConfig[] = [
  {
    name: 'test-task-with-connector',
    connectorConfigs: {
      Connector: {
        __pointer: 'connector.input'
      }
    },
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {}
  },
  {
    name: 'test-second-task-with-connector',
    connectorConfigs: {
      Connector: {
        __pointer: 'connector.input'
      }
    },
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {}
  },
  {
    name: 'test-task-without-connector',
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {}
  }
]

test('should set itself up for each tasks with a Connector config', async () => {
  const env = new Environment({}, testTasks, {});
  await env.init();

  const connector = env.getConnector('Connector');
  expect(connector.hasOwnProperty('accessor')).toBe(true);
  expect((connector as any).accessor.hasOwnProperty('test-task-with-connector')).toBe(true);
  expect((connector as any).accessor.hasOwnProperty('test-task-without-connector')).toBe(false);
});

test('should allow execution of tasks with a Connector config', async () => {
  const env = new Environment({}, testTasks, {});
  await env.init();

  const connector = env.getConnector('Connector');
  const input = {
    test: 'It worked'
  };
  const output = await (connector as any).accessor['test-task-with-connector'](input);
  expect(output).toStrictEqual(input);
});