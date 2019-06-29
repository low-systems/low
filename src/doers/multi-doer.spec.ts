import { TaskConfig, Environment } from '../environment';
import { BoundaryContext } from '../boundaries/boundary';

function taskFactory(name: string): TaskConfig {
  return {
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {},
    name: name
  };
}

test('should be able to execute MultiDoer and have inputs echoed', async () => {
  const task1 = taskFactory('test-task-1');
  const task2 = taskFactory('test-task-2');

  const multiTask: TaskConfig = {
    config: [
      { task: task1 },
      { task: task2 }
    ],
    doer: 'MultiDoer',
    metadata: {},
    name: 'test-multi-doer'
  };

  const env = new Environment({}, [multiTask], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('MultiDoer');

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

test('should execute branched task and continue running', async () => {
  const task1 = taskFactory('test-task-1');
  const task2 = taskFactory('test-task-2');
  const task3 = taskFactory('test-task-3');

  const multiTask: TaskConfig = {
    config: [
      {
        task: task1,
        branch: {
          haltAfterExecution: false,
          taskName: task2.name
        }
      },
      { task: task3 }
    ],
    doer: 'MultiDoer',
    metadata: {},
    name: 'test-multi-doer'
  };

  const env = new Environment({}, [multiTask, task2], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('MultiDoer');

  const context: BoundaryContext = {
    env: env,
    boundary: { config: {}, input: {} },
    data: {},
    errors: {}
  };

  await doer.execute(context, multiTask);

  expect(context.data[task1.name]).toStrictEqual(task1.config);
  expect(context.data[task2.name]).toStrictEqual(task2.config);
  expect(context.data[task3.name]).toStrictEqual(task3.config);
});

test('should execute branched task and not continue running', async () => {
  const task1 = taskFactory('test-task-1');
  const task2 = taskFactory('test-task-2');
  const task3 = taskFactory('test-task-3');

  const multiTask: TaskConfig = {
    config: [
      {
        task: task1,
        branch: {
          haltAfterExecution: true,
          taskName: task2.name
        }
      },
      { task: task3 }
    ],
    doer: 'MultiDoer',
    metadata: {},
    name: 'test-multi-doer'
  };

  const env = new Environment({}, [multiTask, task2], {
    metadata: {
      test: 'It worked'
    }
  });
  await env.init();

  const doer = env.getDoer('MultiDoer');

  const context: BoundaryContext = {
    env: env,
    boundary: { config: {}, input: {} },
    data: {},
    errors: {}
  };

  await doer.execute(context, multiTask);

  expect(context.data[task1.name]).toStrictEqual(task1.config);
  expect(context.data[task2.name]).toStrictEqual(task2.config);
  expect(context.data[task3.name]).toBeUndefined();
});