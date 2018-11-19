"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_renderer_1 = require("./renderers/base-renderer");
const base_parser_1 = require("./parsers/base-parser");
// Modules
// Task Modules
// Parsers
const boolean_parser_1 = require("./parsers/boolean-parser");
const json_parser_1 = require("./parsers/json-parser");
const number_parser_1 = require("./parsers/number-parser");
const stringify_parser_1 = require("./parsers/stringify-parser");
const url_parser_1 = require("./parsers/url-parser");
// Renderers
const mustache_renderer_1 = require("./renderers/mustache-renderer");
class Environment {
    constructor(taskConfigs, metaData, moduleConfig) {
        // Register built-in Task Modules
        //this.registerModule('basic', BasicTask);
        this.taskConfigs = taskConfigs;
        this.metaData = metaData;
        this.moduleConfig = moduleConfig;
        this.errors = [];
        this.profiling = false;
        this.daers = {};
        this.renderers = {};
        this.parsers = {};
        this.cacheManagers = {};
        // Register built-in Renderers
        this.registerModule('mustache', mustache_renderer_1.MustacheRenderer);
        // Register built-in Parsers
        this.registerModule('boolean', boolean_parser_1.BooleanParser);
        this.registerModule('json', json_parser_1.JsonParser);
        this.registerModule('number', number_parser_1.NumberParser);
        this.registerModule('stringify', stringify_parser_1.StringifyParser);
        this.registerModule('UrlParser', url_parser_1.UrlParser);
    }
    registerModule(name, mod, ...args) {
        let newMod = new mod(this, name, ...args);
        if (!newMod.moduleType) {
            const moduleType = newMod && newMod.constructor && newMod.constructor.name || '[unknown]';
            throw new Error(`Module type ${moduleType} does not inherit one of the proper base modules`);
        }
        const map = mod instanceof base_parser_1.BaseParser ? this.parsers :
            mod instanceof base_renderer_1.BaseRenderer ? this.renderers :
                null;
        if (!map) {
            const moduleType = newMod.moduleType;
            throw new Error(`Module type ${newMod.moduleType} is neither a Renderer, Parser, Task Module, or CacheManager`);
        }
        if (map.hasOwnProperty(name)) {
            throw new Error(`There already exists a ${newMod.moduleType} called "${name}"`);
        }
        map[name] = newMod;
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map