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
const base_config_manager_1 = require("./base-config-manager");
class OneOffConfigManager extends base_config_manager_1.BaseConfigManager {
    constructor(environmentConfig) {
        super();
        this.environmentConfig = environmentConfig;
    }
    setupListener(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.env.loadConfig(this.environmentConfig);
        });
    }
    saveConfiguration(config, updateVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Warning: Saving is not allowed when using the One Off Config Manager");
            yield this.env.loadConfig(config);
        });
    }
}
exports.OneOffConfigManager = OneOffConfigManager;
//# sourceMappingURL=one-off-config-manager.js.map