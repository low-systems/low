import * as Handlebars from 'handlebars';

import { HandlebarsRenderer } from './handlebars-renderer';
import { Environment, Context, RenderConfig } from 'low';

process.env.SECRETS = '{}';

test('should be able to initialise a Handlebars renderer with existing Handlebars instance', () => {
  const hbs = Handlebars.create();
  hbs.registerPartial('test', 'I am a test partial');
  hbs.registerHelper('test', () => { return 'I am a test helper'; });
  const renderer = new HandlebarsRenderer(hbs);

  expect(renderer.hbs.partials).toEqual(hbs.partials);
  expect(renderer.hbs.helpers).toEqual(hbs.helpers);
});


test('should be able to initialise a Handlebars renderer without existing Handlebars instance', () => {
  const renderer = new HandlebarsRenderer();
  expect(renderer.hbs.partials).toEqual({});
});

test('should be able to load partials and templates from module config', async () => {
  const modules = { renderers: [new HandlebarsRenderer()] };
  const config = {
    modules: {
      HandlebarsRenderer: {
        templates: { test: 'I am a test template {{>test}}' },
        partials: { test: 'I am a test partial' }
      }
    }
  };
  const environment = new Environment(modules, [], config);
  await environment.init();

  const renderer = environment.getRenderer('HandlebarsRenderer') as HandlebarsRenderer;

  expect(renderer.templates).toHaveProperty('test');
  expect(renderer.hbs.partials).toHaveProperty('test');
});

test('should be able to not load partials and templates from module config', async () => {
  const modules = { renderers: [new HandlebarsRenderer()] };
  const config = {
    modules: {
      HandlebarsRenderer: { }
    }
  };
  const environment = new Environment(modules, [], config);
  await environment.init();

  const renderer = environment.getRenderer('HandlebarsRenderer') as HandlebarsRenderer;

  expect(renderer.templates).toEqual({});
  expect(renderer.hbs.partials).toEqual({});
});

test('should be able to render templates', async () => {
  const modules = { renderers: [new HandlebarsRenderer()] };
  const config = {
    modules: {
      HandlebarsRenderer: {
        templates: { test: 'I am a test template {{>test}}' },
        partials: { test: 'I am a test partial' }
      }
    }
  };
  const environment = new Environment(modules, [], config);
  await environment.init();

  const renderer = environment.getRenderer('HandlebarsRenderer') as HandlebarsRenderer;

  const context: Context = {
    env: environment
  };
  const rendererConfig: RenderConfig = {
    __template: { name: 'test' },
    __renderer: 'HandlebarsRenderer',
    __parser: 'StringParser'
  };
  const pointerOutput = await renderer.render(rendererConfig, context);
  expect(pointerOutput).toBe('I am a test template I am a test partial');

  rendererConfig.__template = 'I am another test template {{>test}}';
  const stringOutput = await renderer.render(rendererConfig, context);
  expect(stringOutput).toBe('I am another test template I am a test partial');

  rendererConfig.__template = { name: 'baloney' };
  await expect(renderer.render(rendererConfig, context)).rejects.toThrow(/pre-compiled template/i)

  rendererConfig.__template = 1234;
  await expect(renderer.render(rendererConfig, context)).rejects.toThrow(/invalid handlebars template/i)
});