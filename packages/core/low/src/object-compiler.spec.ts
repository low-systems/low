import { ObjectCompiler } from './object-compiler';
import { Environment } from './environment';

process.env.SECRETS = '{}';

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

test('should echo a non-object property when attempting to compile it', async () => {
  const input = 'test';
  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toBe(input);
});

test('should throw exception when passed a bad pointer', async () => {
  const input = {
    __pointer: 'env.config.metadata.noSuchProperty'
  };
  expect(() => { ObjectCompiler.resolvePointer(input, { env: env }); }).toThrow(/Could not resolve pointer/);
});

test('should be able to spread rendered arrays into containing array', async () => {
  await env.init();

  const input = {
    testArray: [
      'Item 1',
      {
        __renderer: 'Renderer',
        __template: [
          'Rendered Item 1',
          'Rendered Item 2'
        ],
        __spread: true
      },
      'Item 2'
    ]
  };
  const expected = {
    testArray: [
      'Item 1',
      'Rendered Item 1',
      'Rendered Item 2',
      'Item 2'
    ]
  };

  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toEqual(expected);
});

test('should be able to spread rendered objects into containing object', async () => {
  await env.init();

  const input = {
    testObject: {
      key1: 'Value 1',
      keySpread1: {
        __renderer: 'Renderer',
        __template: {
          renderedKey1: 'Value 1',
          renderedKey2: 'Value 2',
        },
        __spread: true
      },
      key2: 'Value 2'
    }
  };
  const expected = {
    testObject: {
      key1: 'Value 1',
      renderedKey1: 'Value 1',
      renderedKey2: 'Value 2',
      key2: 'Value 2'
    }
  };

  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toEqual(expected);
});

test('should be able to template keys', async () => {
  await env.init();

  const input = {
    testObject: {
      key1: 'Value 1',
      templatedKey: {
        __renderer: 'Renderer',
        __template: 'Value 2',
        __key: {
          __renderer: 'Renderer',
          __template: 'key2'
        }
      }
    }
  };
  const expected = {
    testObject: {
      key1: 'Value 1',
      key2: 'Value 2'
    }
  };

  const output = await ObjectCompiler.compile(input, { env: env });
  expect(output).toEqual(expected);
});