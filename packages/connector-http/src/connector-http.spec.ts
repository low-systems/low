import * as FS from 'fs';
import * as Path from 'path';

import { transpile } from '@low-systems/json-i';

import { ConnectorHttp } from './connector-http';
import { Environment, TaskConfig } from 'low';

interface EnvironmentData {
  tasks: TaskConfig[];
  config: any;
}
let environmentData: EnvironmentData = { tasks: [], config: {} };

beforeAll(() => {
  const testDir = Path.join(__dirname, '..', 'test-data');
  const testPath = Path.join(testDir, 'main.json5');
  const testJson = FS.readFileSync(testPath).toString();
  const testData = transpile(testJson, testDir);

  process.env.SECRETS = JSON.stringify(testData.secrets);
  environmentData = {
    tasks: testData.tasks,
    config: testData.environment
  };
});

test('should be able to construct an instance of the Connector', async () => {
  const environment = new Environment({
    connectors: [new ConnectorHttp()]
  }, environmentData.tasks, environmentData.config);

  await environment.init();
  //await environment.destroy();

  expect(true).toBe(true);
});