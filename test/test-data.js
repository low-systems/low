const {Environment} = require('../build/environment');
const {OneOffConfigManager} = require('../build/config-managers/one-off-config-manager');

const tasks = {
  basic: {
    name: 'basic',
    doer: 'basic',
    config: {
      output: 'just some output'
    },
    metaData: {}
  }
};

const configManager = new OneOffConfigManager({
  tasks: tasks,
  metaData: {},
  moduleConfigs: {}
});

const modules = {
  renderers: [],
  parsers: [],
  doers: [],
  cacheManagers: []
};

(async () => {
  const env = new Environment(modules, configManager);
  await env.init();
  const job = env.createJob({}, 'basic');
  console.log('JOB:', job);
  const response = await env.runJob(job);
  console.log('RESPONSE:', response, '\nJOB:', job);
})();