import { JavascriptTemplate } from '@low-systems/javascript-renderer';
import { AsyncJavascriptRenderer } from './async-javascript-renderer';
import { Environment, Context, RenderConfig } from 'low';

process.env.SECRETS = '{}';

test('should be able to initialise a Javascript renderer with pre-registered functions', async () => {
  const config = {
    modules: {
      AsyncJavascriptRenderer: {
        functions: { test: `return 'It worked!'` }
      }
    }
  }

  const environment = new Environment({ renderers: [ new AsyncJavascriptRenderer() ] }, [], config);
  await environment.init();

  const renderer = environment.getRenderer('AsyncJavascriptRenderer') as AsyncJavascriptRenderer;
  expect(renderer).toHaveProperty('functions');
  expect(renderer.functions).toHaveProperty('test');
  expect(typeof renderer.functions.test).toBe('function');

  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = { __template: 'test', __parser: 'StringParser', __renderer: 'AsyncJavascriptRenderer' };
  const output = await renderer.render(template, context);

  expect(output).toBe('It worked!');
});

test('should be able to cache a Javascript function', async () => {
  const environment = new Environment({ renderers: [ new AsyncJavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('AsyncJavascriptRenderer') as AsyncJavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: 'test',
    __parser: 'StringParser',
    __renderer: 'AsyncJavascriptRenderer'
  };
  await expect(renderer.render(template, context)).rejects.toThrow(/could not be found/i);

  template.__template = {
    name: 'test',
    code: `return 'It worked!';`
  };
  await expect(renderer.render(template, context)).resolves.toBe('It worked!');

  template.__template = 'test';
  await expect(renderer.render(template, context)).resolves.toBe('It worked!');
});

test('should be able to run async Javascript code', async () => {
  const environment = new Environment({ renderers: [ new AsyncJavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('AsyncJavascriptRenderer') as AsyncJavascriptRenderer;
  const context: Context = { env: environment, test: 'It worked!' };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: {
      code: `
      function timeout(ms) {
        return new Promise(resolve => setTimeout(() => {
          resolve(context.test);
        }, ms));
      }
      const result = await timeout(2000);
      return result;
      `
    },
    __parser: 'StringParser',
    __renderer: 'AsyncJavascriptRenderer'
  };
  jest.setTimeout(10000);
  await expect(renderer.render(template, context)).resolves.toBe('It worked!');
});

test('should be able to handle bad async Javascript code', async () => {
  const environment = new Environment({ renderers: [ new AsyncJavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('AsyncJavascriptRenderer') as AsyncJavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: {
      code: `
        function timeout(ms) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('It broke!'));
            }, ms);
          });
        }
        const result = await timeout(2000);
        return 'It worked!';
      `
    },
    __parser: 'StringParser',
    __renderer: 'AsyncJavascriptRenderer'
  };

  await expect(renderer.render(template, context)).rejects.toThrow(/it broke/i);

  template.__template = {
    code: `throw new Error('It broke again!')`
  }
  await expect(renderer.render(template, context)).rejects.toThrow(/it broke again/i);
});

test('should report error when making function with syntax error', async() => {
  const renderer = new AsyncJavascriptRenderer();
  const func = renderer.makeFunction('if({;', 'broken_function');

  await expect(func()).rejects.toThrow(/as it is broken/i);
});