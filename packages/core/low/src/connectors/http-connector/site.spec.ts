import { expect, test, beforeAll, afterAll } from '@jest/globals';

import * as FS from 'fs';
import * as Path from 'path';

// tslint:disable-next-line: no-implicit-dependencies
import { transpile } from '../../../../../tools/json-i';
import { Environment } from '../../environment';

import { HttpConnector } from './http-connector';
import { fail } from 'assert';

let environment: Environment | undefined;
beforeAll(async () => {
  const testDir = Path.join(__dirname, 'test-data');
  const testPath = Path.join(testDir, 'main.json5');
  const testJson = FS.readFileSync(testPath).toString();
  const testData = transpile(testJson, testDir);

  process.env.SECRETS = JSON.stringify(testData.secrets);

  environment = new Environment({
    connectors: [new HttpConnector()]
  }, testData.tasks, testData.environment);

  await environment.init();
});

afterAll(async () => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }
});

test('should be able to match routes', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('HttpConnector') as HttpConnector;
  const site = connector.sites.default;

  expect(site.matchRoute('/', 'GET').route.task.name).toBe('index');
  expect(site.matchRoute('/index', 'GET').route.task.name).toBe('index');
  expect(site.matchRoute('/index/', 'GET').route.task.name).toBe('index');

  expect(site.matchRoute('/post/test-slug', 'GET').route.task.name).toBe('post');
  expect(site.matchRoute('/post/test-slug', 'GET').params.slug).toBe('test-slug');
  expect(() => { site.matchRoute('/post/test-slug', 'POST') }).toThrow(/invalid path/i);
  expect(site.matchRoute('/post/fixed', 'GET').route.task.name).toBe('post-fixed');

  site.config.stripTrailingSlash = false;

  expect(() => { site.matchRoute('/index/', 'GET') }).toThrow(/invalid path/i);
});