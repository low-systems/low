import { Environment } from './environment';
import { TaskConfig, Map } from './interfaces';
import { OneOffConfigManager } from './config-managers/one-off-config-manager';
import { InMemoryCacheManager } from './cache-managers/in-memory-cache-manager';

const tasks: Map<TaskConfig> = {
  pointee: {
    name: 'pointee',
    doer: 'basic',
    metaData: {},
    specialProperties: '*',
    config: {
      _renderer: 'mustache',
      _template: 'I have been pointed to. {{job.test}}'
    }
  },
  multiplexed: {
    name: 'multiplexed',
    doer: 'multiplexer',
    metaData: {},
    config: {
      tasks: [
        {
          name: 'basic',
          doer: 'basic',
          specialProperties: '*',
          config: {
            _renderer: 'mustache',
            _template: 'Just some output. {{job.test}}'
          },
          metaData: {},
          cacheConfig: {
            cacheManager: 'default',
            keyProperties: ['test'],
            partition: 'basic',
            ttl: 1000 * 60 * 60
          }
        },
        ">tasks.pointee",
        {
          name: 'another_basic',
          doer: 'basic',
          specialProperties: ['subfield'],
          config: {
            data: 'this should have some nested property that has been templated',
            subfield: {
              renderer: 'mustache',
              template: 'Just some output. {{job.test}}'
            }
          },
          metaData: {}
        },
        {
          name: 'multiplexed',
          doer: 'multiplexer',
          metaData: {},
          config: {
            tasks: [
              {
                name: 'basic',
                doer: 'basic',
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
              },
              ">tasks.pointee",
              {
                name: 'another_basic',
                doer: 'basic',
                specialProperties: ['subfield'],
                config: {
                  data: 'this should have some nested property that has been templated',
                  subfield: {
                    renderer: 'mustache',
                    template: 'Just some output. {{job.test}}'
                  }
                },
                metaData: {}
              }
            ]
          }
        }
      ]
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
  doers: [],
  cacheManagers: [
    new InMemoryCacheManager('default')
  ]
};

(async () => {
  const env = new Environment(modules, configManager);
  await env.init();
  const job1 = env.createJob({test: 'I test'}, 'multiplexed');
  await env.runJob(job1);
  console.log('JOB after: ', JSON.stringify(job1.data, null, 4));
})();