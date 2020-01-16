"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const Crypto = __importStar(require("crypto"));
const connector_1 = require("./connectors/connector");
const cache_manager_1 = require("./cache-managers/cache-manager");
const doer_1 = require("./doers/doer");
const logger_1 = require("./loggers/logger");
const boolean_parser_1 = require("./parsers/boolean-parser");
const integer_parser_1 = require("./parsers/integer-parser");
const float_parser_1 = require("./parsers/float-parser");
const json_parser_1 = require("./parsers/json-parser");
const string_parser_1 = require("./parsers/string-parser");
const url_parser_1 = require("./parsers/url-parser");
const querystring_parser_1 = require("./parsers/querystring-parser");
const renderer_1 = require("./renderers/renderer");
const multi_doer_1 = require("./doers/multi-doer");
/**
 * The Environment class is the core of a `low` system.
 * If you are using `low` you should create an instance of this
 * with your Modules, Tasks, and Configurations, and initialise it.
 */
class Environment {
    /**
     * Create a new `Environment` instance
     * @param modules       A collection of instances of all external modules to be made available in the Environment
     * @param tasks         A list of all task configurations available in the Environment
     * @param config        Any configuration information for your modules and metadata your tasks may require
     * @param secretsName   The name of an system level environment variable that holds an `EnvironmentConfig` with information to sensitive to go into code
     */
    constructor(modules, tasks, config, secretsName = 'SECRETS') {
        this.config = config;
        /**
         * A map of all available task configurations [[TaskConfig]]
         */
        this.tasks = {};
        /**
         * Any sensitive configuration information loaded into the
         * Environment using [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable)
         */
        this.secrets = {};
        /**
         * Set to true once `Environment.init()` has completed
         */
        this.ready = false;
        this.logLevel = logger_1.LogLevel.ERROR;
        /**
         * A collection of [[Connector]] modules. Connectors are gateways from
         * your application or external sources to run tasks in the `low` Environment
         */
        this.connectors = {
            Connector: new connector_1.Connector()
        };
        /**
         * A collection of [[CacheManager]] modules. CacheManagers are used to
         * improve the performance of frequently executed tasks and object compilation
         */
        this.cacheManagers = {
            CacheManager: new cache_manager_1.CacheManager()
        };
        /**
         * A collection of [[Doer]] modules. Doers are used to execute tasks
         */
        this.doers = {
            Doer: new doer_1.Doer(),
            MultiDoer: new multi_doer_1.MultiDoer()
        };
        this.loggers = {
            Logger: new logger_1.Logger()
        };
        /**
         * A collection of [[Parser]] modules. Parsers ensure that any compiled
         * output from the [[ObjectCompiler]] is a specified type
         */
        this.parsers = {
            BooleanParser: new boolean_parser_1.BooleanParser(),
            IntegerParser: new integer_parser_1.IntegerParser(),
            FloatParser: new float_parser_1.FloatParser(),
            JsonParser: new json_parser_1.JsonParser(),
            StringParser: new string_parser_1.StringParser(),
            UrlParser: new url_parser_1.UrlParser(),
            QuerystringParser: new querystring_parser_1.QuerystringParser(),
        };
        /**
         * A collection of [[Renderer]] modules. Renderers are used by the
         * [[ObjectCompiler]] to create dynamic bits of configuration to be
         * used by other modules
         */
        this.renderers = {
            Renderer: new renderer_1.Renderer()
        };
        if (modules.connectors) {
            for (const mod of modules.connectors) {
                this.connectors[mod.moduleType] = mod;
            }
        }
        if (modules.cacheManagers) {
            for (const mod of modules.cacheManagers) {
                this.cacheManagers[mod.moduleType] = mod;
            }
        }
        if (modules.doers) {
            for (const mod of modules.doers) {
                this.doers[mod.moduleType] = mod;
            }
        }
        if (modules.loggers) {
            for (const mod of modules.loggers) {
                this.loggers[mod.moduleType] = mod;
            }
        }
        if (modules.parsers) {
            for (const mod of modules.parsers) {
                this.parsers[mod.moduleType] = mod;
            }
        }
        if (modules.renderers) {
            for (const mod of modules.renderers) {
                this.renderers[mod.moduleType] = mod;
            }
        }
        for (const task of tasks) {
            this.tasks[task.name] = task;
        }
        this.loadSecrets(secretsName);
    }
    /**
     * Determine if the `Environment` is ready to execute tasks
     */
    get isReady() {
        return this.ready;
    }
    loadSecrets(secretsName) {
        if (!process) {
            console.warn('No `process` object for environment variables. Probably in a browser');
            return;
        }
        if (!process.env.hasOwnProperty(secretsName)) {
            console.warn(`No environment variable named '${secretsName}'.`);
            return;
        }
        const secretsVar = process.env[secretsName] || '{}';
        this.secrets = JSON.parse(secretsVar);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of Object.values(this.connectors)) {
                yield mod.init(this);
            }
            for (const mod of Object.values(this.cacheManagers)) {
                yield mod.init(this);
            }
            for (const mod of Object.values(this.doers)) {
                yield mod.init(this);
            }
            for (const mod of Object.values(this.loggers)) {
                yield mod.init(this);
            }
            for (const mod of Object.values(this.parsers)) {
                yield mod.init(this);
            }
            for (const mod of Object.values(this.renderers)) {
                yield mod.init(this);
            }
            const taskReport = this.checkTasks();
            if (taskReport) {
                throw new Error(`There are one or more task configuration problems\n${taskReport}`);
            }
            this.ready = true;
            if (this.config.startupTask) {
                const task = this.getTask(this.config.startupTask);
                const connector = this.getConnector('Connector');
                yield connector.runTask(task, {}, {});
            }
        });
    }
    checkTasks() {
        const problems = {};
        for (const task of Object.values(this.tasks)) {
            const taskProblems = [];
            const doer = this.doers[task.doer];
            if (!doer) {
                taskProblems.push(`No Doer called '${task.doer}' loaded`);
            }
            if (task.cacheConfig) {
                const cacheManager = this.cacheManagers[task.cacheConfig.cacheManager];
                if (!cacheManager) {
                    taskProblems.push(`No Cache Manager called '${task.cacheConfig.cacheManager}' loaded`);
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
    getConnector(name) {
        if (!this.connectors.hasOwnProperty(name)) {
            throw new Error(`No Connector called '${name}' loaded`);
        }
        const connector = this.connectors[name];
        if (!connector.isReady) {
            throw new Error(`The Connector called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return connector;
    }
    getCacheManager(name) {
        if (!this.cacheManagers.hasOwnProperty(name)) {
            throw new Error(`No Cache Manager called '${name}' loaded`);
        }
        const cacheManager = this.cacheManagers[name];
        if (!cacheManager.isReady) {
            throw new Error(`The Cache Manager called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return cacheManager;
    }
    getDoer(name) {
        if (!this.doers.hasOwnProperty(name)) {
            throw new Error(`No Doer called '${name}' loaded`);
        }
        const doer = this.doers[name];
        if (!doer.isReady) {
            throw new Error(`The Doer called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return doer;
    }
    getParser(name) {
        if (!this.parsers.hasOwnProperty(name)) {
            throw new Error(`No Parser called '${name}' loaded`);
        }
        const parser = this.parsers[name];
        if (!parser.isReady) {
            throw new Error(`The Parser called '${name}' is loaded but not ready. Has the environment been initialised?`);
        }
        return parser;
    }
    getRenderer(name) {
        if (!this.renderers.hasOwnProperty(name)) {
            throw new Error(`No Renderer called '${name}' loaded`);
        }
        const renderer = this.renderers[name];
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
    log(context, level, ...args) {
        try {
            let contextLogLevel = this.logLevel;
            if (typeof context === 'object' && context !== null && typeof context.logLevel === 'number') {
                contextLogLevel = context.logLevel;
            }
            if (level < contextLogLevel) {
                return false;
            }
            let label = 'ENVIRONMENT';
            if (typeof context === 'object' && context !== null) {
                if (typeof context.uid !== 'string') {
                    context.uid = Crypto.randomBytes(4).toString('hex');
                }
                label = context.uid;
            }
            for (const logger of Object.values(this.loggers)) {
                switch (level) {
                    case (logger_1.LogLevel.DEBUG):
                        logger.debug(label, ...args).then().catch(err => {
                            console.error(`Logger Error: '${logger.moduleType}.debug()`, err);
                        });
                        break;
                    case (logger_1.LogLevel.INFO):
                        logger.info(label, ...args).then().catch(err => {
                            console.error(`Logger Error: '${logger.moduleType}.info()`, err);
                        });
                        break;
                    case (logger_1.LogLevel.WARN):
                        logger.warn(label, ...args).then().catch(err => {
                            console.error(`Logger Error: '${logger.moduleType}.warn()`, err);
                        });
                        break;
                    default:
                        logger.error(label, ...args).then().catch(err => {
                            console.error(`Logger Error: '${logger.moduleType}.error()`, err);
                        });
                }
            }
            return true;
        }
        catch (err) {
            console.error('Logger Error: Failed to initialise log', context, level, ...args);
            return false;
        }
    }
    debug(context, ...args) {
        this.log(context, logger_1.LogLevel.DEBUG, ...args);
    }
    info(context, ...args) {
        this.log(context, logger_1.LogLevel.INFO, ...args);
    }
    warn(context, ...args) {
        this.log(context, logger_1.LogLevel.WARN, ...args);
    }
    error(context, ...args) {
        this.log(context, logger_1.LogLevel.ERROR, ...args);
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                return;
            }
            for (const mod of Object.values(this.connectors)) {
                yield mod.destroy();
            }
            for (const mod of Object.values(this.cacheManagers)) {
                yield mod.destroy();
            }
            for (const mod of Object.values(this.doers)) {
                yield mod.destroy();
            }
            for (const mod of Object.values(this.loggers)) {
                yield mod.destroy();
            }
            for (const mod of Object.values(this.parsers)) {
                yield mod.destroy();
            }
            for (const mod of Object.values(this.renderers)) {
                yield mod.destroy();
            }
        });
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map