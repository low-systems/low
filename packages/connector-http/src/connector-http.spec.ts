import { ConnectorHttp } from './connector-http';

test('should be able to construct an instance of the Connector', async () => {
  const connector = new ConnectorHttp();
  console.log(connector);
  expect(true).toBe(true);
});