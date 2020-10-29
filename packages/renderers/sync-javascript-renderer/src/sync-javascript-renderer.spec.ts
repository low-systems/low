import { JavascriptTemplate } from '@low-systems/javascript-renderer';
import { SyncJavascriptRenderer } from './sync-javascript-renderer';
import { Environment, Context, RenderConfig } from 'low';

process.env.SECRETS = '{}';

test('should be able to initialise a Javascript renderer with pre-registered functions', async () => {
  const config = {
    modules: {
      SyncJavascriptRenderer: {
        functions: { test: `'It worked!'` }
      }
    }
  }

  const environment = new Environment({ renderers: [ new SyncJavascriptRenderer() ] }, [], config);
  await environment.init();

  const renderer = environment.getRenderer('SyncJavascriptRenderer') as SyncJavascriptRenderer;
  expect(renderer).toHaveProperty('functions');
  expect(renderer.functions).toHaveProperty('test');
  expect(typeof renderer.functions.test).toBe('function');

  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = { __template: 'test', __parser: 'StringParser', __renderer: 'SyncJavascriptRenderer' };
  const output = await renderer.render(template, context);

  expect(output).toBe('It worked!');
});

test('should be able to cache a Javascript function', async () => {
  const environment = new Environment({ renderers: [ new SyncJavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('SyncJavascriptRenderer') as SyncJavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: 'test',
    __parser: 'StringParser',
    __renderer: 'SyncJavascriptRenderer'
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

test('should be able to run sync Javascript code', async () => {
  const environment = new Environment({ renderers: [ new SyncJavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('SyncJavascriptRenderer') as SyncJavascriptRenderer;
  const context: Context = { env: environment, test: 'It worked!' };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: {
      code: `context.test === 'It worked!'`
    },
    __renderer: 'SyncJavascriptRenderer'
  };

  await expect(renderer.render(template, context)).resolves.toBe(true);
});

test('should be able to handle bad sync Javascript code', async () => {
  const environment = new Environment({ renderers: [ new SyncJavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('SyncJavascriptRenderer') as SyncJavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: {
      code: `throw new Error('It broke!');\nreturn 'It worked!';`
    },
    __parser: 'StringParser',
    __renderer: 'SyncJavascriptRenderer'
  };

  await expect(renderer.render(template, context)).rejects.toThrow(/it broke/i);
});

test('should report error when making function with syntax error', async() => {
  const renderer = new SyncJavascriptRenderer();
  const func = renderer.makeFunction('if({;', 'broken_function');

  expect(() => { func(); }).toThrow(/as it contains a syntax error/i);
});