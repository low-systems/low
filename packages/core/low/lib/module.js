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
Object.defineProperty(exports, "__esModule", { value: true });
class Module {
    constructor() {
        this._ready = false;
    }
    get env() {
        if (!this._env) {
            throw new Error('No Environment has been set. Has this Module been setup correctly?');
        }
        return this._env;
    }
    get config() {
        if (!this._config) {
            throw new Error('No Config have been set. Has this Module been setup correctly?');
        }
        return this._config;
    }
    get secrets() {
        if (!this._secrets) {
            throw new Error('No Secrets have been set. Has this Module been setup correctly?');
        }
        return this._secrets;
    }
    get moduleType() {
        return this.constructor.name;
    }
    get isReady() {
        return this._ready;
    }
    init(env) {
        return __awaiter(this, void 0, void 0, function* () {
            env.info(null, this.moduleType, `Initialising`);
            if (this._ready) {
                env.warn(null, this.moduleType, 'Module already initialised. Destroying and re-initialising');
                yield this.destroy();
                this._ready = false;
            }
            this._env = env;
            this._config = env.config.modules && env.config.modules[this.moduleType] || {};
            env.debug(null, this.moduleType, `Set config:`, this.config);
            this._secrets = env.secrets.modules && env.secrets.modules[this.moduleType] || {};
            env.debug(null, this.moduleType, `Set secrets:`, this.secrets);
            yield this.setup();
            this._ready = true;
            env.info(null, this.moduleType, `Module ready`);
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () { return; });
    }
    ;
    destroy() {
        return __awaiter(this, void 0, void 0, function* () { return; });
    }
    ;
}
exports.Module = Module;
//# sourceMappingURL=module.js.map