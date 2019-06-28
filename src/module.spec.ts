import { Module } from './module';
import { Environment } from './environment';

test('should be able to construct and initialise a basic Module', async () => {
  const mod = new Module();
  const env = new Environment({}, [], {});
  expect(mod.moduleType).toBe('Module');
  expect(mod.isReady).toBe(false);
  await mod.init(env);
  expect(mod.isReady).toBe(true);
});

test('should be able to initialise a basic Module with a configuration and secrets', async () => {
  const mod = new Module();
  const env = new Environment({}, [], {
    modules: {
      Module: {
        test: 'It worked'
      }
    }
  });
  await mod.init(env);
  expect(mod.config.test).toBe('It worked');
  //TODO: Work out how to set environment variables for JEST
  //running in VSCode. This test passes in CLI but not VSCode.
  //expect(mod.secrets.test).toBe('It worked');
});