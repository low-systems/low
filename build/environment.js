"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const events = __importStar(require("events"));
// Built-in Modules
// Daers
const basic_daer_1 = require("./daers/basic-daer");
const multiplexer_daer_1 = require("./daers/multiplexer-daer");
// Parsers
const boolean_parser_1 = require("./parsers/boolean-parser");
const json_parser_1 = require("./parsers/json-parser");
const number_parser_1 = require("./parsers/number-parser");
const stringify_parser_1 = require("./parsers/stringify-parser");
const url_parser_1 = require("./parsers/url-parser");
// Renderers
const mustache_renderer_1 = require("./renderers/mustache-renderer");
// Cache Managers
const in_memory_cache_manager_1 = require("./cache-managers/in-memory-cache-manager");
/**
 * Class to encapsulate the entire working daer environment. It managers all task
 * configurations, modules, tests, etc.
 * @class
 */
class Environment extends events.EventEmitter {
    /**
     * @constructs Environment
     * @param {Map<TaskConfig>} - A Map of all task configurations that make up this Environment
     * @param {any} - An object containing metadata that might be needed by your system
     * @param {any} - An object containing configuration information for any registered modules
     */
    constructor(modules, configManager) {
        super();
        this.configManager = configManager;
        this.ready = false;
        /**
         * Holds the state of whether Profiling is on or off.
         * @member {boolean}
         */
        this.profiling = false;
        this.metaData = {};
        this.moduleConfigs = {};
        this.tasks = {};
        this.modules = {
            renderers: {},
            parsers: {},
            daers: {},
            cacheManagers: {}
        };
        this.builtIn = {
            daers: [
                new basic_daer_1.BasicDaer('basic'),
                new multiplexer_daer_1.MultiplexerDaer('multiplexer')
            ],
            renderers: [
                new mustache_renderer_1.MustacheRenderer('mustache')
            ],
            parsers: [
                new boolean_parser_1.BooleanParser('boolean'),
                new json_parser_1.JsonParser('json'),
                new number_parser_1.NumberParser('number'),
                new stringify_parser_1.StringifyParser('stringify'),
                new url_parser_1.UrlParser('url')
            ],
            cacheManagers: [
                new in_memory_cache_manager_1.InMemoryCacheManager('in-memory')
            ]
        };
        for (const mod of [...this.builtIn.renderers, ...modules.renderers]) {
            this.modules.renderers[mod.name] = mod;
        }
        for (const mod of [...this.builtIn.parsers, ...modules.parsers]) {
            this.modules.parsers[mod.name] = mod;
        }
        for (const mod of [...this.builtIn.daers, ...modules.daers]) {
            this.modules.daers[mod.name] = mod;
        }
        for (const mod of [...this.builtIn.cacheManagers, ...modules.cacheManagers]) {
            this.modules.cacheManagers[mod.name] = mod;
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.configManager.triggerSetup(this);
        });
    }
    loadConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tasks = config.tasks;
            this.metaData = config.metaData;
            this.moduleConfigs = config.moduleConfigs;
            this.ready = true;
            yield this.setupModules();
            this.emit('setup');
        });
    }
    setupModules() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                throw new Error('Environment is not ready');
            }
            for (const mod of Object.values(this.modules.renderers)) {
                yield mod.triggerSetup(this);
            }
            for (const mod of Object.values(this.modules.parsers)) {
                yield mod.triggerSetup(this);
            }
            for (const mod of Object.values(this.modules.daers)) {
                yield mod.triggerSetup(this);
            }
            for (const mod of Object.values(this.modules.cacheManagers)) {
                yield mod.triggerSetup(this);
            }
        });
    }
    getRenderer(name) {
        if (!this.modules.renderers.hasOwnProperty(name)) {
            throw new Error(`No Renderer called ${name} loaded`);
        }
        return this.modules.renderers[name];
    }
    getParser(name) {
        if (!this.modules.parsers.hasOwnProperty(name)) {
            throw new Error(`No Parsers called ${name} loaded`);
        }
        return this.modules.parsers[name];
    }
    getDaer(name) {
        if (!this.modules.daers.hasOwnProperty(name)) {
            throw new Error(`No Daer called ${name} loaded`);
        }
        return this.modules.daers[name];
    }
    getCacheManager(name) {
        if (!this.modules.cacheManagers.hasOwnProperty(name)) {
            throw new Error(`No Cache Manager called ${name} loaded`);
        }
        return this.modules.cacheManagers[name];
    }
    getTask(name) {
        if (!this.tasks.hasOwnProperty(name)) {
            throw new Error(`No Task called ${name} loaded`);
        }
        return this.tasks[name];
    }
    createJob(base, taskName, debug = false) {
        base.data = typeof base.data === 'object' ? base.data : {};
        base.debug = typeof base.debug === 'boolean' ? base.debug : debug;
        base.entryTask = taskName;
        return base;
    }
    runJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const task = this.getTask(job.entryTask);
                const daer = this.getDaer(task.daer);
                const output = yield daer.execute(job, task, []);
            }
            catch (err) {
                console.error('Failed to run job', err);
            }
            return job;
        });
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map