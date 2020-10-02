"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.RedisCacheManager = exports.RedisClient = void 0;
const low_1 = require("low");
const util_1 = require("util");
const Redis = __importStar(require("redis"));
class RedisClient {
    constructor(options) {
        this.options = options;
        this.client = new Redis.RedisClient(this.options);
        this.GET = util_1.promisify(this.client.GET).bind(this.client);
        this.SETEX = util_1.promisify(this.client.SETEX).bind(this.client);
        this.KEYS = util_1.promisify(this.client.KEYS).bind(this.client);
        this.DEL = this.client.DEL.bind(this.client);
    }
}
exports.RedisClient = RedisClient;
class RedisCacheManager extends low_1.CacheManager {
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
                this.client = new RedisClient(options);
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
                const output = JSON.parse(value);
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