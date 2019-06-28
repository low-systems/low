import { TaskConfig, Environment } from '../environment';
import { BoundaryContext } from '../boundaries/boundary';

test('should be able to execute doer and have input echoed', async () => {
  const env = new Environment({}, [], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('Doer');

  const task: TaskConfig = {
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {},
    name: 'test-doer'
  };

  const context: BoundaryContext = {
    env: env,
    boundary: { config: {}, input: {} },
    data: {},
    errors: {}
  };

  await doer.execute(context, task);

  expect(context.data[task.name]).toStrictEqual(task.config);
});