import * as FS from 'fs';
import * as Path from 'path';
import * as Url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { TLSSocket } from 'tls';
import { Buffer } from 'buffer';

// tslint:disable-next-line: no-implicit-dependencies
const MockRequest = require('readable-mock-req');

// tslint:disable-next-line: no-implicit-dependencies
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
  ];
  expect(connector.mergeErrorHandlers(site)).toEqual(expected);
});

test('should be able to match an appropriate error handler', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const body = '';
  const handlers = [
    { statusCodeMin: 500, statusCodeMax: 599, taskName: '500-599', output: { body } },
    { statusCodeMin: 404, statusCodeMax: 404, taskName: '404-404', output: { body } },
    { statusCodeMin: 490, statusCodeMax: 510, taskName: '490-510', output: { body } },
    { statusCodeMin: 400, statusCodeMax: 403, taskName: '400-403', output: { body } },
    { statusCodeMin: 405, statusCodeMax: 499, taskName: '405-499', output: { body } },
  ];

  expect(connector.findErrorHandler(handlers, 500).taskName).toBe('500-599');
  expect(connector.findErrorHandler(handlers, 404).taskName).toBe('404-404');
  expect(connector.findErrorHandler(handlers, 495).taskName).toBe('490-510');
  expect(connector.findErrorHandler(handlers, 489).taskName).toBe('405-499');
  expect(() => {connector.findErrorHandler(handlers, 600) }).toThrow(/No error handler/);
});

test('should send an appropriate response', () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const site = connector.sites['default'];
  const request = new MockRequest('GET', '/', {});
  const response = new ServerResponse(request);
  const output = {
    body: 'Test',
    headers: {
      'content-type': 'text/plain',
      'x-test': 'It worked'
    },
    cookies: {
      'uid': { value: '1234abcd' }
    }
  };
  connector.sendResponse(response, output, site);

  expect(response.statusCode).toBe(200);
  expect(response.statusMessage).toBe('OK');
  expect(response.getHeader('x-test')).toBe('It worked');
  expect(response.getHeader('content-type')).toBe('text/plain');
  expect(response.getHeader('set-cookie')).toBe('uid=1234abcd');
  expect(response.getHeader('x-powered-by')).toBe('low');
  expect(response.getHeader('x-global-overridden')).toBe('I have been overridden');
  expect(response.getHeader('x-site-header')).toBe('default site');

  const zippedResponse = new ServerResponse(request);
  const zippedOutput = {
    body: { test: 'It worked' },
    headers: {
      'content-type': 'text/plain; charset=utf8',
      'x-test': 'It worked'
    },
    statusCode: 202,
    statusMessage: 'Still OK',
    cookies: {
      'uid': { value: '1234abcd' }
    },
    gzip: true
  };
  connector.sendResponse(zippedResponse, zippedOutput);
  expect(zippedResponse.statusCode).toBe(202);
  expect(zippedResponse.statusMessage).toBe('Still OK');
  expect(zippedResponse.getHeader('content-type')).toBe('text/plain; charset=x-user-defined-binary');
  expect(zippedResponse.getHeader('content-encoding')).toBe('gzip');

  const bufferResponse = new ServerResponse(request);
  const bufferOutput = {
    body: Buffer.from('Test'),
    headers: {
      'content-type': 'text/plain; charset=utf8',
      'x-test': 'It worked'
    },
    cookies: {
      'uid': { value: '1234abcd' }
    },
    gzip: true
  };
  connector.sendResponse(bufferResponse, bufferOutput);
});

test('should be able to handle requests', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  const connector = environment.getConnector('ConnectorHttp') as ConnectorHttp;

  const request = new MockRequest('GET', '/', {
    headers: { host: 'localhost' }
  });
  request.socket = new Socket();
  const response = new ServerResponse(request);

  await connector.requestHandler(request, response);

  expect(response.statusCode).toBe(200);
  expect(response.statusMessage).toBe('OK');
  expect(response.getHeader('content-type')).toBe('text/plain');
  expect(response.getHeader('x-powered-by')).toBe('low');
  expect(response.getHeader('x-global-overridden')).toBe('I have been overridden');
  expect(response.getHeader('x-site-header')).toBe('default site');

  const invalidHostRequest = new MockRequest('GET', '/', {
    headers: { host: 'scvo.org' }
  });
  invalidHostRequest.socket = new Socket();
  const invalidHostResponse = new ServerResponse(invalidHostRequest);

  await connector.requestHandler(invalidHostRequest, invalidHostResponse);

  expect(invalidHostResponse.statusCode).toBe(400);
  expect(invalidHostResponse.statusMessage).toBe('Invalid hostname');

  const invalidPathRequest = new MockRequest('GET', '/nope', {
    headers: { host: 'localhost' }
  });
  invalidPathRequest.socket = new Socket();
  const invalidPathResponse = new ServerResponse(invalidPathRequest);

  await connector.requestHandler(invalidPathRequest, invalidPathResponse);

  expect(invalidPathResponse.statusCode).toBe(404);
  expect(invalidPathResponse.statusMessage).toBe('Invalid path');
});