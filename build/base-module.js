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
const dot = require("dot-object");
class BaseModule {
    constructor(name, ...args) {
        this.name = name;
        this.secrets = {};
        this.config = {};
        this.ready = false;
        this.loadGlobalSecrets();
    }
    get env() {
        if (!this._env) {
            throw new Error('No Environment has been set. Has this Module been setup correctly');
        }
        return this._env;
    }
    get moduleType() {
        return this.constructor.name;
    }
    get debugPath() {
        return this.moduleType + '.' + this.name;
    }
    loadGlobalSecrets() {
        const globalSecrets = process.env.SECRETS && JSON.parse(process.env.SECRETS) || {};
        this.secrets = globalSecrets && globalSecrets[this.moduleType] && globalSecrets[this.moduleType][this.name] || {};
    }
    triggerSetup(env) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ready) {
                this.destroy();
                this.ready = false;
            }
            this.loadGlobalSecrets();
            this._env = env;
            this.config = env.moduleConfigs && env.moduleConfigs[this.moduleType] && env.moduleConfigs[this.moduleType][this.name] || {};
            yield this.setup();
            this.ready = true;
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    ;
    destroy() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    ;
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