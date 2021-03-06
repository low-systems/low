import * as Handlebars from 'handlebars';

import { HandlebarsRenderer, HandlebarsTemplate } from './handlebars-renderer';
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

test('should be able to specify Handlebars render options', async () => {
  const renderer = new HandlebarsRenderer();
  const template = renderer.hbs.compile(`{{#if data.url.search}}{{{data.url.search}}}{{else}}Cannot access property{{/if}}`);
  const context: Context = {
    env: new Environment({}, [], {}),
    data: {
      url: new URL('https://example.com/some/path?test=querystring&hope=this+works')
    }
  };
  const output1 = await renderer.core(template, context, {});
  expect(output1).toBe('Cannot access property');
  const metadata = {
    handlebarsOptions: {
      allowProtoPropertiesByDefault: true
    }
  };
  const output2 = await renderer.core(template, context, metadata);
  expect(output2).toBe('?test=querystring&hope=this+works');
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
  const rendererConfig: RenderConfig<HandlebarsTemplate> = {
    __template: 'test',
    __renderer: 'HandlebarsRenderer',
    __parser: 'StringParser'
  };
  const pointerOutput = await renderer.render(rendererConfig, context);
  expect(pointerOutput).toBe('I am a test template I am a test partial');

  rendererConfig.__template = { code: 'I am another test template {{>test}}' };
  const stringOutput = await renderer.render(rendererConfig, context);
  expect(stringOutput).toBe('I am another test template I am a test partial');

  rendererConfig.__template = 'baloney';
  await expect(renderer.render(rendererConfig, context)).rejects.toThrow(/pre-registered template/i)
});

test('should be faster to cache functions', async () => {
  jest.setTimeout(60000);

  const environment = new Environment({ renderers: [ new HandlebarsRenderer() ] }, [], {});
  await environment.init();

  const renderer = environment.getRenderer('HandlebarsRenderer') as HandlebarsRenderer;
  const context: Context = { env: environment };
  const templateNamed: RenderConfig<HandlebarsTemplate> = {
    __template: {
      name: 'test',
      code: `resolve('It worked!');`
    },
    __parser: 'StringParser',
    __renderer: 'JavascriptRenderer'
  };

  const namedStart = +new Date();
  console.time('Named Template');

  for (let x = 0; x < 9999; x++) {
    await renderer.render(templateNamed, context)
  }

  console.timeEnd('Named Template');
  const namedEnd = +new Date();

  const templateUnnamed: RenderConfig<HandlebarsTemplate> = {
    __template: {
      code: `resolve('It worked!');`
    },
    __parser: 'StringParser',
    __renderer: 'JavascriptRenderer'
  };

  const unnamedStart = +new Date();
  console.time('Unnamed Template');

  for (let x = 0; x < 9999; x++) {
    await renderer.render(templateUnnamed, context)
  }

  console.timeEnd('Unnamed Template');
  const unnamedEnd = +new Date();

  const namedDiff = namedEnd - namedStart;
  const unnamedDiff = unnamedEnd - unnamedStart;

  expect(namedDiff).toBeLessThan(unnamedDiff);
});