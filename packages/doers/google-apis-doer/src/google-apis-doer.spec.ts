import { GoogleApisDoer } from './google-apis-doer';
import { ConnectorContext, Environment } from 'low';
import { StoredJwtCredential } from './stored-jwt-credential';

const ENVIRONMENT_CONFIG = require('../configuration/environment');
const SECRETS = require('../configuration/secrets');
let environment: Environment | undefined;
let doer: GoogleApisDoer | undefined;

beforeAll(async (done) => {
  process.env.SECRETS = JSON.stringify(SECRETS);

  const modules = {
    doers: [new GoogleApisDoer()]
  };
  environment = new Environment(modules, [], ENVIRONMENT_CONFIG);

  await environment.init();
  doer = environment.getDoer('GoogleApisDoer') as GoogleApisDoer;

  done();
})

afterAll(async (done) => {
  if (environment) {
    await environment.destroy();
    environment = undefined;
  }

  done();
});

function getContext(): ConnectorContext<any> {
  return {
    connector: { config: {}, input: {} },
    data: {},
    env: environment as Environment,
    errors: {}
  };
}

async function runTask(context: ConnectorContext<any>, name: string, api: string, method: string, other: any) {
  if (!doer) { fail('Could not load Doer from environment'); return; }

  const taskConfig = {
    name,
    doer: 'GoogleApisDoer',
    metadata: {},
    config: { api, method, credential: 'test', ...other }
  };

  await doer.execute(context, taskConfig);
}

test('should be able to authorise with JWT', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  if (!doer) { fail('Could not load Doer from environment'); return; }

  const credential = await (doer.credentials['test'] as StoredJwtCredential).getCredential();
  const now = +new Date();
  const expiry = credential.credentials.expiry_date;

  expect(expiry).toBeGreaterThan(now);
});

test('should be able to call an API', async () => {
  if (!environment) { fail('Environment has not been setup properly'); return; }
  if (!doer) { fail('Could not load Doer from environment'); return; }

  const context = getContext();
  await runTask(context, 'test', 'discovery', 'apis.list', {
    apiOptions: { version: 'v1' },
    arguments: []
  });

  expect(context.data.test).toHaveProperty('status');
});