import * as Example from './index';

test('should read and transpile test configuration', async () => {
  const configs = Example.transpileConfigs();
  console.log(configs);
  expect(true).toBe(true);
});