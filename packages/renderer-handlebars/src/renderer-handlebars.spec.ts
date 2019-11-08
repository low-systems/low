import * as Handlebars from 'handlebars';

//import { Environment } from 'low';

import { RendererHandlebars } from './renderer-handlebars';
import { Environment, Context, RenderConfig } from 'low';

process.env.SECRETS = '{}';

test('should be able to initialise a Handlebars renderer with existing Handlebars instance', () => {
  const hbs = Handlebars.create();
  hbs.registerPartial('test', 'I am a test partial');
  hbs.registerHelper('test', () => { return 'I am a test helper'; });
  const renderer = new RendererHandlebars(hbs);

  expect(renderer.hbs.partials).toEqual(hbs.partials);
  expect(renderer.hbs.helpers).toEqual(hbs.helpers);
});


test('should be able to initialise a Handlebars renderer without existing Handlebars instance', () => {
  const renderer = new RendererHandlebars();
  expect(renderer.hbs.partials).toEqual({});
});

test('should be able to load partials and templates from module config', async () => {
  const modules = { renderers: [new RendererHandlebars()] };
  const config = {
    modules: {
      RendererHandlebars: {
        templates: { test: 'I am a test template {{>test}}' },
        partials: { test: 'I am a test partial' }
      }
    }
  };
  const environment = new Environment(modules, [], config);
  await environment.init();

  const renderer = environment.getRenderer('RendererHandlebars') as RendererHandlebars;

  expect(renderer.templates).toHaveProperty('test');
  expect(renderer.hbs.partials).toHaveProperty('test');
});

test('should be able to not load partials and templates from module config', async () => {
  const modules = { renderers: [new RendererHandlebars()] };
  const config = {
    modules: {
      RendererHandlebars: { }
    }
  };
  const environment = new Environment(modules, [], config);
  await environment.init();

  const renderer = environment.getRenderer('RendererHandlebars') as RendererHandlebars;

  expect(renderer.templates).toEqual({});
  expect(renderer.hbs.partials).toEqual({});
});

test('should be able to render templates', async () => {
  const modules = { renderers: [new RendererHandlebars()] };
  const config = {
    modules: {
      RendererHandlebars: {
        templates: { test: 'I am a test template {{>test}}' },
        partials: { test: 'I am a test partial' }
      }
    }
  };
  const environment = new Environment(modules, [], config);
  await environment.init();

  const renderer = environment.getRenderer('RendererHandlebars') as RendererHandlebars;

  const context: Context = {
    env: environment
  };
  const rendererConfig: RenderConfig = {
    __template: { name: 'test' },
    __renderer: 'RendererHandlebars',
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