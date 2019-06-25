"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const module_1 = require("../module");
const object_compiler_1 = require("../object-compiler");
const CACHE = {};
class CacheManager extends module_1.Module {
    async makeKey(config, context) {
        let data = '';
        for (const path of config.keyProperties) {
            const part = object_compiler_1.ObjectCompiler.objectPath(context, path);
            data += JSON.stringify(part);
        }
        const hash = crypto_1.createHash('sha1')
            .update(data)
            .digest('base64');
        return {
            partition: config.partition,
            key: hash
        };
    }
    async getItem(cacheKey) {
        if (!CACHE.hasOwnProperty(cacheKey.partition)) {
            CACHE[cacheKey.partition] = {};
            return null;
        }
        if (!CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
            return null;
        }
        const expires = CACHE[cacheKey.partition][cacheKey.key].expires;
        const now = new Date();
        if (expires < now) {
            delete CACHE[cacheKey.partition][cacheKey.key];
            return null;
        }
        CACHE[cacheKey.partition][cacheKey.key].touched = now;
        return CACHE[cacheKey.partition][cacheKey.key].data;
    }
    async setItem(cacheKey, item, ttl) {
        if (!CACHE.hasOwnProperty(cacheKey.partition)) {
            CACHE[cacheKey.partition] = {};
        }
        const now = new Date();
        const expires = new Date(+new Date() + ttl);
        if (!CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
            CACHE[cacheKey.partition][cacheKey.key] = {
                data: item,
                created: now,
                updated: now,
                expires: expires,
                touched: new Date(0)
            };
        }
        else {
            CACHE[cacheKey.partition][cacheKey.key].data = item;
            CACHE[cacheKey.partition][cacheKey.key].updated = now;
            CACHE[cacheKey.partition][cacheKey.key].expires = expires;
        }
    }
    async bust(partition) {
        if (CACHE.hasOwnProperty(partition)) {
            delete CACHE[partition];
        }
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cache-manager.js.map