import { TaskConfig, Environment } from '../environment';
import { BoundaryContext } from '../boundaries/boundary';

test('should be able to execute doer and have input echoed', async () => {
  const env = new Environment({}, [], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('MultiDoer');

  const task1: TaskConfig = {
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {},
    name: 'test-doer-1'
  };

  const task2: TaskConfig = {
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {},
    name: 'test-doer-2'
  };

  const multiTask: TaskConfig = {
    config: [
      {
        task: task1
      },
      {
        task: task2
      }
    ],
    doer: 'MultiDoer',
    metadata: {},
    name: 'test-multi-doer'
  };

  const context: BoundaryContext = {
    env: env,
    boundary: { config: {}, input: {} },
    data: {},
    errors: {}
  };

  await doer.execute(context, multiTask);

  expect(context.data[task1.name]).toStrictEqual(task1.config);
  expect(context.data[task2.name]).toStrictEqual(task2.config);
});