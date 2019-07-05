"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boundary_1 = require("./boundaries/boundary");
const cache_manager_1 = require("./cache-managers/cache-manager");
const doer_1 = require("./doers/doer");
const boolean_parser_1 = require("./parsers/boolean-parser");
const integer_parser_1 = require("./parsers/integer-parser");
const float_parser_1 = require("./parsers/float-parser");
const json_parser_1 = require("./parsers/json-parser");
const string_parser_1 = require("./parsers/string-parser");
const url_parser_1 = require("./parsers/url-parser");
const renderer_1 = require("./renderers/renderer");
const multi_doer_1 = require("./doers/multi-doer");
class Environment {
    constructor(modules, tasks, config, secretsName = 'SECRETS') {
        this.config = config;
        this.tasks = {};
        this.secrets = {};
        this.ready = false;
        this.modules = {
            boundaries: {},
            cacheManagers: {},
            doers: {},
            parsers: {},
            renderers: {}
        };
        this.builtIn = {
            boundaries: [new boundary_1.Boundary()],
            cacheManagers: [new cache_manager_1.CacheManager()],
            doers: [
                new doer_1.Doer(),
                new multi_doer_1.MultiDoer()
            ],
            parsers: [
                new boolean_parser_1.BooleanParser(),
                new integer_parser_1.IntegerParser(),
                new float_parser_1.FloatParser(),
                new json_parser_1.JsonParser(),
                new string_parser_1.StringParser(),
                new url_parser_1.UrlParser()
            ],
            renderers: [new renderer_1.Renderer()]
        };
        for (const mod of [...(this.builtIn.boundaries || []), ...(modules.boundaries || [])]) {
            this.modules.boundaries[mod.moduleType] = mod;
        }
        for (const mod of [...(this.builtIn.cacheManagers || []), ...(modules.cacheManagers || [])]) {
            this.modules.cacheManagers[mod.moduleType] = mod;
        }
        for (const mod of [...(this.builtIn.doers || []), ...(modules.doers || [])]) {
            this.modules.doers[mod.moduleType] = mod;
        }
        for (const mod of [...(this.builtIn.parsers || []), ...(modules.parsers || [])]) {
            this.modules.parsers[mod.moduleType] = mod;
        }
        for (const mod of [...(this.builtIn.renderers || []), ...(modules.renderers || [])]) {
            this.modules.renderers[mod.moduleType] = mod;
        }
        for (const task of tasks) {
            this.tasks[task.name] = task;
        }
        this.loadSecrets(secretsName);
    }
    get isReady() {
        return this.ready;
    }
    loadSecrets(secretsName) {
        if (!secretsName)
            return;
        //TODO: What the heck actually happens when you try to access `process`
        //      in a browser. Need more checks around this
        const secretsVar = process.env[secretsName];
        if (!secretsVar)
            return;
        if (secretsVar.indexOf('{') > -1) {
            this.secrets = JSON.parse(secretsVar);
        }
        else {
            //This will obviously not work in the browser so be sure to set
            //your secretsName variable properly. Don't like doing `require`
            //but not sure how else to make `fs` conditional. Moar research!
            const fs = require('fs');
            const secretsJson = fs.readFileSync(secretsVar).toString();
            this.secrets = JSON.parse(secretsJson);
        }
    }
    registerTasks(tasks) {
    }
    async init() {
        for (const mod of Object.values(this.modules.boundaries)) {
            await mod.init(this);
        }
        for (const mod of Object.values(this.modules.cacheManagers)) {
            await mod.init(this);
        }
        for (const mod of Object.values(this.modules.doers)) {
            await mod.init(this);
        }
        for (const mod of Object.values(this.modules.parsers)) {
            await mod.init(this);
        }
        for (const mod of Object.values(this.modules.renderers)) {
            await mod.init(this);
        }
        const taskReport = this.checkTasks();
        if (taskReport) {
            throw new Error(`There are one or more task configuration problems\n${taskReport}`);
        }
        this.ready = true;
    }
    checkTasks() {
        const problems = {};
        for (const task of Object.values(this.tasks)) {
            const taskProblems = [];
            const doer = this.modules.doers[task.doer];
            if (!doer) {
                taskProblems.push(`No Doer called '${task.doer}' loaded`);
            }
            else if (!doer.isReady) {
                taskProblems.push(`The Doer called '${task.doer}' is loaded but not ready. It probably failed to initialise`);
            }
            if (task.cacheConfig) {
                const cacheManager = this.modules.cacheManagers[task.cacheConfig.cacheManager];
                if (!cacheManager) {
                    taskProblems.push(`No Cache Manager called '${task.cacheConfig.cacheManager}' loaded`);
                }
                else if (!cacheManager.isReady) {
                    taskProblems.push(`The Cache Manager called '${task.cacheConfig.cacheManager}' is loaded but not ready. It probably failed to initialise`);
                }
            }
            if (taskProblems.length > 0) {
                problems[task.name] = taskProblems;
            }
        }
        if (Object.values(problems).length === 0) {
            return null;
        }
        const report = Object.entries(problems).map((entry) => {
            return `${entry[0]}:\n\t${entry[1].join('\n\t')}`;
        }).join('\n');
        return report;
    }
    getBoundary(name) {
        if (!this.modules.boundaries.hasOwnProperty(name)) {
            throw new Error(`No Boundary called '${name}' loaded`);
        }
        const boundary = this.modules.boundaries[name];
        if (!boundary.isReady) {
            throw new Error(`The Boundary called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return boundary;
    }
    getCacheManager(name) {
        if (!this.modules.cacheManagers.hasOwnProperty(name)) {
            throw new Error(`No Cache Manager called '${name}' loaded`);
        }
        const cacheManager = this.modules.cacheManagers[name];
        if (!cacheManager.isReady) {
            throw new Error(`The Cache Manager called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return cacheManager;
    }
    getDoer(name) {
        if (!this.modules.doers.hasOwnProperty(name)) {
            throw new Error(`No Doer called '${name}' loaded`);
        }
        const doer = this.modules.doers[name];
        if (!doer.isReady) {
            throw new Error(`The Doer called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return doer;
    }
    getParser(name) {
        if (!this.modules.parsers.hasOwnProperty(name)) {
            throw new Error(`No Parser called '${name}' loaded`);
        }
        const parser = this.modules.parsers[name];
        if (!parser.isReady) {
            throw new Error(`The Parser called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return parser;
    }
    getRenderer(name) {
        if (!this.modules.renderers.hasOwnProperty(name)) {
            throw new Error(`No Renderer called '${name}' loaded`);
        }
        const renderer = this.modules.renderers[name];
        if (!renderer.isReady) {
            throw new Error(`The Renderer called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return renderer;
    }
    getTask(name) {
        if (!this.tasks.hasOwnProperty(name)) {
            throw new Error(`No Task called '${name}' loaded`);
        }
        if (!this.isReady) {
            throw new Error('The environment is not ready thus no task checks have been made');
        }
        return this.tasks[name];
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map