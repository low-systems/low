import { expect, test } from '@jest/globals';

import { RequestDoer } from './request-doer';
import { ConnectorContext, Environment, TaskConfig } from '../../index';

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
    env: environment as Environment,
    calls: {},
  };
  const taskConfig: TaskConfig = {
    name: 'test',
    doer: 'RequestDoer',
    metadata: {},
    config: {
      url: 'https://www.schemastore.org/schema-org-thing.json',
      json: true
    }
  };
  await expect(doer.main(context, taskConfig, taskConfig.config)).resolves.toHaveProperty('$schema');
});