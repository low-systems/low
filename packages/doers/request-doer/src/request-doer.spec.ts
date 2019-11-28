import { RequestDoer } from './request-doer';
import { ConnectorContext, Environment, TaskConfig } from 'low';

test('should be able to perform a Http request', async () => {
  const environment = new Environment({ doers: [ new RequestDoer() ] }, [], {});
  await environment.init();
  const doer = environment.getDoer('RequestDoer') as RequestDoer;
  const context: ConnectorContext<any> = {
    data: {},
    errors: {},
    connector: {
      input: {},
      config: {}
    },
    env: environment
  };
  const taskConfig: TaskConfig = {
    name: 'test',
    doer: 'RequestDoer',
    metadata: {},
    config: {
      url: 'https://api.citybik.es/v2/networks/edinburgh-cycle-hire',
      json: true
    }
  };
  await expect(doer.main(context, taskConfig, taskConfig.config)).resolves.toHaveProperty('network');
});