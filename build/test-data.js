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
const configManager = new one_off_config_manager_1.OneOffConfigManager({
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
(() => __awaiter(this, void 0, void 0, function* () {
    const env = new environment_1.Environment(modules, configManager);
    yield env.init();
    const job = env.createJob({ test: 'I test' }, 'basic');
    console.log('JOB Before:', job);
    yield env.runJob(job);
    console.log('JOB after: ', job);
}))();
//# sourceMappingURL=test-data.js.map