import { TaskConfig, Environment } from '../environment';
import { ConnectorContext } from '../connectors/connector';
import { LogLevel } from '../loggers/logger';

process.env.SECRETS = '{}';

function taskFactory(name?: string, doer?: string): TaskConfig {
  return {
    config: {
      test: 'It worked'
    },
    doer: doer || 'Doer',
    metadata: {},
    name: name || 'test-task'
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

  const context: ConnectorContext<any> = {
    env: env,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
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

  const context: ConnectorContext<any> = {
    env: env,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
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

  const context: ConnectorContext<any> = {
    env: env,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
  };

  await doer.execute(context, multiTask);

  expect(context.data[task1.name]).toStrictEqual(task1.config);
  expect(context.data[task2.name]).toStrictEqual(task2.config);
  expect(context.data[task3.name]).toBeUndefined();
});

test('should throw an exception when given an invalid BranchConfig to branch to', async () => {
  const task1 = taskFactory('test-task-1');

  const multiTask: TaskConfig = {
    config: [
      {
        task: task1,
        branch: {
          haltAfterExecution: false,
          taskName: 'no-such-task'
        }
      }
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

  const context: ConnectorContext<any> = {
    env: env,
    logLevel: LogLevel.DEBUG,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
  };

  await doer.execute(context, multiTask);
  expect(context.errors['test-multi-doer'].message).toMatch(/No Task called/);
});

test('should throw an exception when given an invalid task name to branch to', async () => {
  const task1 = taskFactory('test-task-1');

  const multiTask: TaskConfig = {
    config: [
      {
        task: task1,
        branch: {
          haltAfterExecution: false,
          taskName: 'no-such-task'
        }
      }
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

  const context: ConnectorContext<any> = {
    env: env,
    connector: { config: {}, input: {} },
    data: {},
    errors: {},
    calls: {}
  };

  await doer.execute(context, multiTask);
  expect(context.errors['test-multi-doer'].message).toBe(`No Task called 'no-such-task' loaded`);
});