import { Environment, TaskConfig } from '../environment';

const testTasks: TaskConfig[] = [
  {
    name: 'test-task-with-boundary',
    boundaryConfigs: {
      Boundary: {
        __pointer: 'boundary.input'
      }
    },
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {}
  },
  {
    name: 'test-task-without-boundary',
    config: {
      test: 'It worked'
    },
    doer: 'Doer',
    metadata: {}
  }
]

test('should set itself up for each tasks with a Boundary config', async () => {
  const env = new Environment({}, testTasks, {});
  await env.init();

  const boundary = env.getBoundary('Boundary');
  expect(boundary.hasOwnProperty('accessor')).toBe(true);
  expect((boundary as any).accessor.hasOwnProperty('test-task-with-boundary')).toBe(true);
  expect((boundary as any).accessor.hasOwnProperty('test-task-without-boundary')).toBe(false);
});

test('should allow execution of tasks with a Boundary config', async () => {
  const env = new Environment({}, testTasks, {});
  await env.init();

  const boundary = env.getBoundary('Boundary');
  const input = {
    test: 'It worked'
  };
  const output = await (boundary as any).accessor['test-task-with-boundary'](input);
  expect(output).toStrictEqual(input);
});