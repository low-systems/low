"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const module_1 = require("../module");
const object_compiler_1 = require("../object-compiler");
class CacheManager extends module_1.Module {
    constructor() {
        super(...arguments);
        this._CACHE = {};
    }
    get CACHE() {
        return this._CACHE;
    }
    async makeKey(config, context) {
        let data = '';
        for (const path of config.keyProperties) {
            const part = object_compiler_1.ObjectCompiler.objectPath(context, path);
            data += JSON.stringify(part);
        }
        const hash = crypto_1.createHash('sha1')
            .update(data)
            .digest('hex');
        return {
            partition: config.partition,
            key: hash
        };
    }
    async getItem(cacheKey) {
        if (!this.CACHE.hasOwnProperty(cacheKey.partition)) {
            this.CACHE[cacheKey.partition] = {};
            return null;
        }
        if (!this.CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
            return null;
        }
        const expires = this.CACHE[cacheKey.partition][cacheKey.key].expires;
        const now = new Date();
        if (expires < now) {
            delete this.CACHE[cacheKey.partition][cacheKey.key];
            return null;
        }
        this.CACHE[cacheKey.partition][cacheKey.key].touched = now;
        return this.CACHE[cacheKey.partition][cacheKey.key].data;
    }
    async setItem(cacheKey, item, ttl) {
        if (!this.CACHE.hasOwnProperty(cacheKey.partition)) {
            this.CACHE[cacheKey.partition] = {};
        }
        const now = new Date();
        const expires = new Date(+new Date() + ttl);
        if (!this.CACHE[cacheKey.partition].hasOwnProperty(cacheKey.key)) {
            this.CACHE[cacheKey.partition][cacheKey.key] = {
                data: item,
                created: now,
                updated: now,
                expires: expires,
                touched: new Date(0)
            };
        }
        else {
            this.CACHE[cacheKey.partition][cacheKey.key].data = item;
            this.CACHE[cacheKey.partition][cacheKey.key].updated = now;
            this.CACHE[cacheKey.partition][cacheKey.key].expires = expires;
        }
    }
    async bust(partition) {
        if (this.CACHE.hasOwnProperty(partition)) {
            delete this.CACHE[partition];
        }
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cache-manager.js.map