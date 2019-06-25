import { ObjectCompiler } from './object-compiler';
import { Environment } from './environment';

const env = new Environment({}, [], {
  metadata: {
    test: 'It worked',
    testObject: {
      test: 'It worked'
    }
  }
})

test('should output exactly the same config when no special properties present', async () => {
  const input = {
    test: 'It worked'
  };
  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toStrictEqual(input);
});

test('should understand pointers', async() => {
  const input = {
    __pointer: 'env.config.metadata.testObject'
  };
  const expected = {
    test: 'It worked'
  };
  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toStrictEqual(expected);
});

test('should understand templates', async() => {
  await env.init();

  const input = {
    __renderer: 'Renderer',
    __template: {
      test: 'It worked'
    }
  };
  const expected = {
    test: 'It worked'
  };
  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toStrictEqual(expected);
});

test('should understand pointers in children', async() => {
  const input = {
    child: {
      __pointer: 'env.config.metadata.testObject'
    }
  };
  const expected = {
    child: {
      test: 'It worked'
    }
  };
  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toStrictEqual(expected);
});

test('should understand templates in children', async() => {
  await env.init();

  const input = {
    child: {
      __renderer: 'Renderer',
      __template: {
        test: 'It worked'
      }
    }
  };
  const expected = {
    child: {
      test: 'It worked'
    }
  };
  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toStrictEqual(expected);
});

test('should understand pointers in specified children', async() => {
  const input = {
    childRendered: {
      __pointer: 'env.config.metadata.testObject'
    },
    childNotRendered: {
      __pointer: 'env.config.metadata.testObject'
    }
  };
  const expected = {
    childRendered: {
      test: 'It worked'
    },
    childNotRendered: {
      __pointer: 'env.config.metadata.testObject'
    }
  };
  const output = await ObjectCompiler.compile(input, { env: env }, ['childRendered']);
  expect(output).toStrictEqual(expected);
});

test('should understand templates in children', async() => {
  await env.init();

  const input = {
    childRendered: {
      __renderer: 'Renderer',
      __template: {
        test: 'It worked'
      }
    },
    childNotRendered: {
      __renderer: 'Renderer',
      __template: {
        test: 'It worked'
      }
    }
  };
  const expected = {
    childRendered: {
      test: 'It worked'
    },
    childNotRendered: {
      __renderer: 'Renderer',
      __template: {
        test: 'It worked'
      }
    }
  }
  const output = await ObjectCompiler.compile(input, { env: env }, ['childRendered']);
  expect(output).toStrictEqual(expected);
});