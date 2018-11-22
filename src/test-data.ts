import { Environment } from './environment';
import { TaskConfig, Map } from './interfaces';
import { OneOffConfigManager } from './config-managers/one-off-config-manager';
import { InMemoryCacheManager } from './cache-managers/in-memory-cache-manager';

const tasks: Map<TaskConfig> = {
  basic: {
    name: 'basic',
    daer: 'basic',
    specialProperties: '*',
    config: {
      renderer: 'mustache',
      template: 'Just some output. {{job.test}}'
    },
    metaData: {},
    cacheConfig: {
      cacheManager: 'default',
      keyProperties: ['test'],
      partition: 'basic',
      ttl: 1000 * 60 * 60
    }
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
  cacheManagers: [
    new InMemoryCacheManager('default')
  ]
};

(async () => {
  const env = new Environment(modules, configManager);
  await env.init();
  const job1 = env.createJob({test: 'I test'}, 'basic');
  await env.runJob(job1);
  console.log('JOB after: ', job1);
  const job2 = env.createJob({test: 'I test'}, 'basic');
  await env.runJob(job2);
  console.log('JOB after: ', job2);
  const job3 = env.createJob({test: 'I tested'}, 'basic');
  await env.runJob(job3);
  console.log('JOB after: ', job3);
})();