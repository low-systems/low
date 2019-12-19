import { Environment, Context } from '../environment';
import { RenderConfig } from './renderer';

process.env.SECRETS = '{}';

test('should echo input with no parser', async () => {
  const env = new Environment({}, [], {});
  await env.init();
  const renderer = env.getRenderer('Renderer');
  const config: RenderConfig<any> = {
    __renderer: 'Renderer',
    __template: {
      test: 'It worked'
    }
  };
  const context: Context = {
    env: env
  };

  const rendered = await renderer.render(config, context);

  expect(rendered).toEqual(config.__template);
});

test('should echo parsed input', async () => {
  const env = new Environment({}, [], {});
  await env.init();
  const renderer = env.getRenderer('Renderer');
  const config: RenderConfig<any> = {
    __renderer: 'Renderer',
    __template: 42,
    __parser: 'StringParser'
  };
  const context: Context = {
    env: env
  };

  const rendered = await renderer.render(config, context);

  expect(rendered).toBe('42');
});