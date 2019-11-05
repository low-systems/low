import * as FS from 'fs';
import * as Path from 'path';
import * as Url from 'url';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { TLSSocket } from 'tls';

const MockRequest = require('readable-mock-req');

import { transpile } from '@low-systems/json-i';
import { Environment } from 'low';

import { ConnectorHttp } from './connector-http';

let environment: Environment | undefined;
beforeAll(async (done) => {
  const testDir = Path.join(__dirname, '..', 'test-data');
  const testPath = Path.join(testDir, 'main.json5');
  const testJson = FS.readFileSync(testPath).toString();
  const testData = transpile(testJson, testDir);

  process.env.SECRETS = JSON.stringify(testData.secrets);

  environment = new Environment({
    connectors: [new ConnectorHttp()]
  }, testData.tasks, testData.environment);

  await environment.init();

  done();
});

afterAll(async (done) => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }

  done();
});

test('should be able to handle valid and invalid a port numbers', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  process.env.NAN = '12AB';
  process.env.PORT = '1234';

  expect(connector.getPort(1234)).toBe(1234);
  expect(connector.getPort('PORT')).toBe(1234);
  expect(() => { connector.getPort('NAN') }).toThrow(/is not a number/);
  expect(() => { connector.getPort('UNDEFINED') }).toThrow(/Cannot load port/);
});

test('should be able to get and cache a site from a hostname', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  expect(connector.hostnameCache['localhost']).toBeUndefined();
  expect(connector.getSiteFromHostname('localhost').name).toBe('default');
  expect(connector.hostnameCache['localhost'].name).toBe('default');
  expect(() => { connector.getSiteFromHostname('baloney') }).toThrow(/Invalid hostname/);
});

test('should be able to identify protocol from a request', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const unencryptedSocket = new Socket({});
  const encryptedSocket = new TLSSocket(unencryptedSocket, {});
  const unencryptedRequest = new IncomingMessage(unencryptedSocket);
  const encryptedRequest = new IncomingMessage(encryptedSocket);

  expect(connector.getRequestProtocol(unencryptedRequest)).toBe('http');
  expect(connector.getRequestProtocol(encryptedRequest)).toBe('https');

  unencryptedRequest.headers = { 'x-forwarded-proto': 'https' };
  expect(connector.getRequestProtocol(unencryptedRequest)).toBe('https');

  unencryptedRequest.headers = { 'x-forwarded-proto': 'http' };
  expect(connector.getRequestProtocol(unencryptedRequest)).toBe('http');

  unencryptedRequest.headers = { 'x-arr-ssl': 'baloney' };
  expect(connector.getRequestProtocol(unencryptedRequest)).toBe('https');
});

test('should be able to construct a url from a request', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const unencryptedSocket = new Socket({});
  const encryptedSocket = new TLSSocket(unencryptedSocket, {});
  const unencryptedRequest = new IncomingMessage(unencryptedSocket);
  const encryptedRequest = new IncomingMessage(encryptedSocket);

  expect(connector.getRequestUrl(unencryptedRequest).toString()).toBe('http://localhost/');
  expect(connector.getRequestUrl(encryptedRequest).toString()).toBe('https://localhost/');

  unencryptedRequest.url = '/test?query=string';
  encryptedRequest.url = '/test?query=string';

  expect(connector.getRequestUrl(unencryptedRequest).toString()).toBe('http://localhost/test?query=string');
  expect(connector.getRequestUrl(encryptedRequest).toString()).toBe('https://localhost/test?query=string');

  unencryptedRequest.headers.host = 'scvo.org';
  encryptedRequest.headers.host = 'scvo.org';

  expect(connector.getRequestUrl(unencryptedRequest).toString()).toBe('http://scvo.org/test?query=string');
  expect(connector.getRequestUrl(encryptedRequest).toString()).toBe('https://scvo.org/test?query=string');
});

test('should be able to convert a querystring to an object', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  let url = new Url.URL('https://scvo.org/test?query=string');
  expect(connector.getQuerystringObject(url)).toEqual({
    query: ['string']
  });

  url = new Url.URL('https://scvo.org/test?query[]=string&query[]=params&another=test');
  expect(connector.getQuerystringObject(url)).toEqual({
    query: ['string', 'params'],
    another: ['test']
  });
});

test('should be able to get a request\'s body as an object', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const textRequest = new MockRequest('POST', '/test', {
    headers: { 'content-type': 'text/plain' },
    source: 'BODY'
  });
  expect(await connector.getRequestBody(textRequest)).toEqual('BODY');

  const jsonRequest = new MockRequest('POST', '/test', {
    headers: { 'content-type': 'application/json' },
    source: '{ "test": "It worked!" }'
  });
  expect(await connector.getRequestBody(jsonRequest)).toEqual({ test: 'It worked!' });

  const getRequest = new MockRequest('GET', '/test', { });
  expect(await connector.getRequestBody(getRequest)).toEqual({});
});

test('should be able to merge error handlers', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const site = connector.sites.default;
  const expected = [
    ...environment.config.modules.ConnectorHttp.sites.default.errorHandlers,
    ...environment.config.modules.ConnectorHttp.errorHandlers
  ]
  expect(connector.mergeErrorHandlers(site)).toEqual(expected);
});