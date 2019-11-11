import * as Example from './index';

test('should read and transpile test configuration', async () => {
  await Example.main();

  expect(true).toBe(true);
});