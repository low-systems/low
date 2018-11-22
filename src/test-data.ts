import { Environment } from './environment';
import { OneOffConfigManager } from './config-managers/one-off-config-manager';

const tasks = {
  basic: {
    name: 'basic',
    daer: 'basic',
    specialProperties: '*',
    config: {
      renderer: 'mustache',
      template: 'Just some output. {{job.test}}'
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
  daers: [],
  cacheManagers: []
};

(async () => {
  const env = new Environment(modules, configManager);
  await env.init();
  const job = env.createJob({test: 'I test'}, 'basic');
  console.log('JOB Before:', job);
  await env.runJob(job);
  console.log('JOB after: ', job);
})();