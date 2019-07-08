"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Module {
    constructor() {
        this.secrets = {};
        this.config = {};
        this.ready = false;
    }
    get env() {
        if (!this._env) {
            throw new Error('No Environment has been set. Has this Module been setup correctly?');
        }
        return this._env;
    }
    get moduleType() {
        return this.constructor.name;
    }
    get isReady() {
        return this.ready;
    }
    async init(env) {
        if (this.ready) {
            await this.destroy();
            this.ready = false;
        }
        this._env = env;
        this.config = env.config.modules && env.config.modules[this.moduleType] || {};
        this.secrets = env.secrets.modules && env.secrets.modules[this.moduleType] || {};
        await this.setup();
        this.ready = true;
    }
    async setup() { return; }
    ;
    async destroy() { return; }
    ;
}
exports.Module = Module;
//# sourceMappingURL=module.js.map