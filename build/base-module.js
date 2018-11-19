"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dot = require("dot-object");
class BaseModule {
    constructor(env, name, ...args) {
        this.env = env;
        this.name = name;
        this.secrets = {};
        this.config = {};
        const globalSecrets = process.env.SECRETS && JSON.parse(process.env.SECRETS) || {};
        this.secrets = globalSecrets && globalSecrets[this.moduleType] && globalSecrets[this.moduleType][this.name] || {};
        this.config = env.moduleConfig && env.moduleConfig[this.moduleType] && env.moduleConfig[this.moduleType][this.name] || {};
    }
    get moduleType() {
        return this.constructor.name;
    }
    get debugPath() {
        return this.moduleType + '.' + this.name;
    }
    destroy() { }
    resolvePointer(pointer, ...args) {
        const path = pointer.substr(1);
        for (const arg of args) {
            const value = dot.pick(path, arg);
            if (typeof value !== 'undefined') {
                return value;
            }
        }
        throw new Error(`Pointer "${pointer}" could not be resolved`);
    }
}
exports.BaseModule = BaseModule;
//# sourceMappingURL=base-module.js.map