"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_module_1 = require("../base-module");
class BaseConfigManager extends base_module_1.BaseModule {
    constructor(...args) {
        super('config-manager', ...args);
        this.setupListener(this.env.loadConfig, ...args);
    }
}
exports.BaseConfigManager = BaseConfigManager;
//# sourceMappingURL=base-config-manager.js.map