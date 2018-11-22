"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
const one_off_config_manager_1 = require("./config-managers/one-off-config-manager");
const in_memory_cache_manager_1 = require("./cache-managers/in-memory-cache-manager");
const tasks = {
    pointee: {
        name: 'pointee',
        daer: 'basic',
        metaData: {},
        specialProperties: '*',
        config: {
            _renderer: 'mustache',
            _template: 'I have been pointed too. {{job.test}}'
        }
    },
    multiplexed: {
        name: 'multiplexed',
        daer: 'multiplexer',
        metaData: {},
        config: {
            tasks: [
                {
                    name: 'basic',
                    daer: 'basic',
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
                    daer: 'basic',
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
                    daer: 'multiplexer',
                    metaData: {},
                    config: {
                        tasks: [
                            {
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
                            },
                            ">tasks.pointee",
                            {
                                name: 'another_basic',
                                daer: 'basic',
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
const configManager = new one_off_config_manager_1.OneOffConfigManager({
    tasks: tasks,
    metaData: {},
    moduleConfigs: {}
});
const modules = {
    renderers: [],
    parsers: [],
    daers: [],
    cacheManagers: [
        new in_memory_cache_manager_1.InMemoryCacheManager('default')
    ]
};
(() => __awaiter(this, void 0, void 0, function* () {
    const env = new environment_1.Environment(modules, configManager);
    yield env.init();
    const job1 = env.createJob({ test: 'I test' }, 'multiplexed');
    yield env.runJob(job1);
    console.log('JOB after: ', JSON.stringify(job1.data, null, 4));
}))();
//# sourceMappingURL=test-data.js.map