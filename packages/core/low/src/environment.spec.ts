import { Environment, TaskConfig, Modules } from './environment';
import { Connector } from './connectors/connector';
import { CacheManager } from './cache-managers/cache-manager';
import { Doer } from './doers/doer';
import { Parser } from './parsers/parser';
import { Renderer } from './renderers/renderer';

process.env.SECRETS = '{}';

beforeAll(() => {
  process.env = Object.assign(process.env, {
    SECRETS_ALT: '{ "modules": { "Module": { "test": "It worked" } } }'
  });
});

test('should create new basic instance of a low environment', () => {
  const env = new Environment({}, [], {});
  expect(env.config).toStrictEqual({});
  expect(env.tasks).toStrictEqual({});
});

test('should be able to initialise built-in modules in new low environment', async () => {
  const env = new Environment({}, [], {});
  expect(env.isReady).toBe(false);

  //Expect all default built in modules to be registered but not ready
  expect(() => { env.getConnector('Connector').isReady }).toThrow(`The Connector called 'Connector' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getCacheManager('CacheManager').isReady }).toThrow(`The Cache Manager called 'CacheManager' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getDoer('Doer').isReady }).toThrow(`The Doer called 'Doer' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getDoer('MultiDoer').isReady }).toThrow(`The Doer called 'MultiDoer' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getParser('BooleanParser').isReady }).toThrow(`The Parser called 'BooleanParser' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getParser('IntegerParser').isReady }).toThrow(`The Parser called 'IntegerParser' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getParser('FloatParser').isReady }).toThrow(`The Parser called 'FloatParser' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getParser('JsonParser').isReady }).toThrow(`The Parser called 'JsonParser' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getParser('StringParser').isReady }).toThrow(`The Parser called 'StringParser' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getParser('UrlParser').isReady }).toThrow(`The Parser called 'UrlParser' is loaded but not ready. Has the environment been initialised?`);
  expect(() => { env.getRenderer('Renderer').isReady }).toThrow(`The Renderer called 'Renderer' is loaded but not ready. Has the environment been initialised?`);

  //Initialise low environment and all modules
  await env.init();
  expect(env.isReady).toBe(true);

  //Check all built in modules are now ready
  expect(env.getConnector('Connector').isReady).toBe(true);
  expect(env.getCacheManager('CacheManager').isReady).toBe(true);
  expect(env.getDoer('Doer').isReady).toBe(true);
  expect(env.getDoer('MultiDoer').isReady).toBe(true);
  expect(env.getParser('BooleanParser').isReady).toBe(true);
  expect(env.getParser('IntegerParser').isReady).toBe(true);
  expect(env.getParser('FloatParser').isReady).toBe(true);
  expect(env.getParser('JsonParser').isReady).toBe(true);
  expect(env.getParser('StringParser').isReady).toBe(true);
  expect(env.getParser('UrlParser').isReady).toBe(true);
  expect(env.getRenderer('Renderer').isReady).toBe(true);
});

test('should not be able to get a none existent Connector', () => {
  const env = new Environment({}, [], {});
  expect(() => { return env.getConnector('xyz'); }).toThrow(`No Connector called 'xyz' loaded`);
});

test('should not be able to get a none existent Cache Manager', () => {
  const env = new Environment({}, [], {});
  expect(() => { return env.getCacheManager('xyz'); }).toThrow(`No Cache Manager called 'xyz' loaded`);
});

test('should not be able to get a none existent Doer', () => {
  const env = new Environment({}, [], {});
  expect(() => { return env.getDoer('xyz'); }).toThrow(`No Doer called 'xyz' loaded`);
});

test('should not be able to get a none existent Parser', () => {
  const env = new Environment({}, [], {});
  expect(() => { return env.getParser('xyz'); }).toThrow(`No Parser called 'xyz' loaded`);
});

test('should not be able to get a none existent Renderer', () => {
  const env = new Environment({}, [], {});
  expect(() => { return env.getRenderer('xyz'); }).toThrow(`No Renderer called 'xyz' loaded`);
});

const testTask: TaskConfig = {
  name: 'test-task',
  connectorConfigs: {},
  cacheConfig: {
    cacheManager: 'CacheManager',
    keyProperties: [],
    partition: 'test',
    ttl: 3600
  },
  config: {},
  doer: 'Doer',
  metadata: {}
};

test('should be able to register basic valid Task', async () => {
  const env = new Environment({}, [testTask], {});
  await env.init();
  expect(env.getTask('test-task').name).toBe('test-task');
});

test('should not be able to get a none existent Task', () => {
  const env = new Environment({}, [], {});
  expect(() => { return env.getTask('xyz'); }).toThrow(`No Task called 'xyz' loaded`);
});

test('should only be able to get Task when low environment initialised', () => {
  const env = new Environment({}, [testTask], {});
  expect(() => { env.getTask('test-task') }).toThrow(`The environment is not ready thus no task checks have been made`);
});

test('should not be able to register Task with invalid Doer', async () => {
  const invalidTask: TaskConfig = JSON.parse(JSON.stringify(testTask));
  invalidTask.doer = 'xyz';
  const env = new Environment({}, [invalidTask], {});

  await expect(env.init()).rejects.toThrow(/No Doer called 'xyz' loaded/);
});

test('should not be able to register Task with invalid Cache Manager', async () => {
  const invalidTask: TaskConfig = JSON.parse(JSON.stringify(testTask));
  if (invalidTask.cacheConfig) {
    invalidTask.cacheConfig.cacheManager = 'xyz';
  }
  const env = new Environment({}, [invalidTask], {});

  await expect(env.init()).rejects.toThrow(/No Cache Manager called 'xyz' loaded/);
});

test('should load secrets as a serialised JSON string', async () => {
  const env = new Environment({}, [], {}, 'SECRETS_ALT');

  expect(env.secrets.modules.Module.test).toBe('It worked');
});

test('should be able to pass in external Modules when creating an Environment', async () => {
  class ExternalConnector extends Connector<any, any, any> {}
  class ExternalCacheManager extends CacheManager<any, any> {}
  class ExternalDoer extends Doer<any, any> {}
  class ExternalParser extends Parser<any> {}
  class ExternalRenderer extends Renderer<any, any, any> {}

  const externalConnector = new ExternalConnector();
  const externalCacheManager = new ExternalCacheManager();
  const externalDoer = new ExternalDoer();
  const externalParser = new ExternalParser();
  const externalRenderer = new ExternalRenderer();

  const modules: Modules = {
    connectors: [ externalConnector ],
    cacheManagers: [ externalCacheManager ],
    doers: [ externalDoer ],
    parsers: [ externalParser ],
    renderers: [ externalRenderer ]
  }

  const env = new Environment(modules, [], {});
  await env.init();

  expect(env.getConnector('ExternalConnector')).toStrictEqual(externalConnector);
  expect(env.getCacheManager('ExternalCacheManager')).toStrictEqual(externalCacheManager);
  expect(env.getDoer('ExternalDoer')).toStrictEqual(externalDoer);
  expect(env.getParser('ExternalParser')).toStrictEqual(externalParser);
  expect(env.getRenderer('ExternalRenderer')).toStrictEqual(externalRenderer);
});

test('should load no secrets when no or an invalid environmental var name is passed in', async () => {
  const env = new Environment({}, [], {}, 'SECRETS_INVALID');

  expect(env.secrets).toStrictEqual({});
});