import { DoerRequest } from './doer-request';
import { ConnectorContext, Environment, TaskConfig } from 'low';

test('should be able to perform a Http request', async () => {
  const environment = new Environment({ doers: [ new DoerRequest() ] }, [], {});
  await environment.init();
  const doer = environment.getDoer('DoerRequest') as DoerRequest;
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
    doer: 'DoerRequest',
    metadata: {},
    config: {
      url: 'https://api.citybik.es/v2/networks/edinburgh-cycle-hire',
      json: true
    }
  };
  await expect(doer.main(context, taskConfig, taskConfig.config)).resolves.toHaveProperty('network');
});