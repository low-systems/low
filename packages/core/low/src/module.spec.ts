import { Module } from './module';
import { Environment } from './environment';

beforeAll(() => {
  process.env = Object.assign(process.env, {
    SECRETS_ALT: '{ "modules": { "Module": { "test": "It worked" } } }'
  });
});

test('should be able to construct and initialise a basic Module', async () => {
  const mod = new Module();
  const env = new Environment({}, [], {}, 'SECRETS_ALT');
  expect(mod.moduleType).toBe('Module');
  expect(mod.isReady).toBe(false);
  await mod.init(env);
  expect(mod.isReady).toBe(true);
});

test('should be able to initialise a basic Module with a configuration and secrets', async () => {
  const mod = new Module();
  const modulesConfig = {
    modules: {
      Module: {
        test: 'It worked'
      }
    }
  };
  const env = new Environment({}, [], modulesConfig, 'SECRETS_ALT');
  await mod.init(env);
  expect((mod.config as any).test).toBe('It worked');
  expect((mod.secrets as any).test).toBe('It worked');
});

test('should throw an exception when code tries to access Module.env on an uninitialised Module', async () => {
  const mod = new Module();

  expect(() => { return mod.env }).toThrow(/No Environment has been set/);
});