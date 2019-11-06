import * as FS from 'fs';
import * as Path from 'path';

// tslint:disable-next-line: no-implicit-dependencies
import { transpile } from '@low-systems/json-i';

import { Site, SiteConfig } from './site';

//TODO: Load an environment here instead, need tasks and registered routes
//      to do our testing below...
//      Also, finish these tests
let siteConfig: SiteConfig | undefined;
beforeAll(() => {
  const testDir = Path.join(__dirname, '..', 'test-data');
  const testPath = Path.join(testDir, 'main.json5');
  const testJson = FS.readFileSync(testPath).toString();
  const testData = transpile(testJson, testDir);
  siteConfig = testData.modules.ConnectorHttp;
});

test('should be able to match routes', () => {
  if (!siteConfig) { fail('Site config has not been setup properly'); return; }

  const site = new Site('test', siteConfig);
  expect(site.matchRoute('/', 'GET'));
});