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
exports.RedisCacheManager = void 0;
const cache_manager_1 = require("../cache-manager");
const redis_1 = require("redis");
class RedisCacheManager extends cache_manager_1.CacheManager {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {};
            try {
                options = Object.assign(this.config, this.secrets || {});
                Object.entries(options).forEach(([key, value]) => {
                    if (typeof value === 'string' && value.startsWith('ENV_')) {
                        const envKey = value.substring(4);
                        const envVal = process.env[envKey] || undefined;
                        options[key] = envVal;
                    }
                });
                this.client = (0, redis_1.createClient)(options);
                yield this.client.connect();
            }
            catch (err) {
                this.env.error(null, `Failed to setup Redis client: ${err.message}`, options);
            }
        });
    }
    getItem(cacheKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                return null;
            }
            const key = cacheKey.partition + ':' + cacheKey.key;
            const value = yield this.client.GET(key);
            if (value === null) {
                return null;
            }
            try {
                const output = typeof value === 'string' ? JSON.parse(value) : value;
                return output;
            }
            catch (err) {
                console.error(`CACHE MANAGER: Failed to parse cached value`, err);
                return null;
            }
        });
    }
    setItem(cacheKey, item, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                return;
            }
            const key = cacheKey.partition + ':' + cacheKey.key;
            const value = JSON.stringify(item);
            yield this.client.SETEX(key, ttl, value);
        });
    }
    flush(partition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client) {
                    return;
                }
                const keys = yield this.client.KEYS(partition + ':*');
                if (Array.isArray(keys) && keys.length > 0) {
                    yield this.client.DEL(keys);
                }
            }
            catch (err) {
                console.error(`CACHE MANAGER: Failed to flush cache for partition '${partition}': ${err.message}`);
            }
        });
    }
}
exports.RedisCacheManager = RedisCacheManager;
//# sourceMappingURL=redis-cache-manager.js.map