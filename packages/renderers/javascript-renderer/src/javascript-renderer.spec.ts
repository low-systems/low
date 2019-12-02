import { JavascriptRenderer, JavascriptTemplate } from './javascript-renderer';
import { Environment, Context, RenderConfig } from 'low';

process.env.SECRETS = '{}';

test('should be able to initialise a Javascript renderer with pre-registered functions', async () => {
  const config = {
    modules: {
      JavascriptRenderer: {
        functions: { test: `resolve('It worked!')` }
      }
    }
  }

  const environment = new Environment({ renderers: [ new JavascriptRenderer() ] }, [], config);
  await environment.init();

  const renderer = environment.getRenderer('JavascriptRenderer') as JavascriptRenderer;
  expect(renderer).toHaveProperty('functions');
  expect(renderer.functions).toHaveProperty('test');
  expect(typeof renderer.functions.test).toBe('function');

  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = { __template: 'test', __parser: 'StringParser', __renderer: 'JavascriptRenderer' };
  const output = await renderer.render(template, context);

  expect(output).toBe('It worked!');
});

test('should be able to cache a Javascript function', async () => {
  const environment = new Environment({ renderers: [ new JavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('JavascriptRenderer') as JavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: 'test',
    __parser: 'StringParser',
    __renderer: 'JavascriptRenderer'
  };
  await expect(renderer.render(template, context)).rejects.toThrow(/could not be found/i);

  template.__template = {
    name: 'test',
    code: `resolve('It worked!');`
  };
  await expect(renderer.render(template, context)).resolves.toBe('It worked!');

  template.__template = 'test';
  await expect(renderer.render(template, context)).resolves.toBe('It worked!');
});

test('should be able to run async Javascript code', async () => {
  const environment = new Environment({ renderers: [ new JavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('JavascriptRenderer') as JavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: {
      code: `setTimeout(() => { resolve('It worked!'); }, 1000);`
    },
    __parser: 'StringParser',
    __renderer: 'JavascriptRenderer'
  };
  await expect(renderer.render(template, context)).resolves.toBe('It worked!');
});

test('should be able to handle bad async Javascript code', async () => {
  const environment = new Environment({ renderers: [ new JavascriptRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('JavascriptRenderer') as JavascriptRenderer;
  const context: Context = { env: environment };
  const template: RenderConfig<JavascriptTemplate> = {
    __template: {
      code: `setTimeout(() => { reject(new Error('It broke!')); }, 1000);`
    },
    __parser: 'StringParser',
    __renderer: 'JavascriptRenderer'
  };

  await expect(renderer.render(template, context)).rejects.toThrow(/it broke/i);

  template.__template = {
    code: `throw new Error('It broke again!')`
  }
  await expect(renderer.render(template, context)).rejects.toThrow(/it broke again/i);
});