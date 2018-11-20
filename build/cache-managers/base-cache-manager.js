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
const crypto_1 = require("crypto");
const base_module_1 = require("../base-module");
const dot = require("dot-object");
class BaseCacheManager extends base_module_1.BaseModule {
    constructor(name, ...args) {
        super(name, args);
    }
    getItem(cacheKey) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Cache manager ${this.moduleType} has not yet implemented getItem(CacheKey)`);
        });
    }
    setItem(cacheKey, item, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Cache manager ${this.moduleType} has not yet implemented setItem(CacheKey, any, number)`);
        });
    }
    bust(partition) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Cache manager ${this.moduleType} has not yet implemented bust(string)`);
        });
    }
    makeKey(config, job) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = '';
            for (const path of config.keyProperties) {
                const part = dot.pick(path, job);
                data += JSON.stringify(part);
            }
            const hash = crypto_1.createHash('sha1')
                .update(data)
                .digest('base64');
            return {
                partition: config.partition,
                key: hash
            };
        });
    }
}
exports.BaseCacheManager = BaseCacheManager;
//# sourceMappingURL=base-cache-manager.js.map