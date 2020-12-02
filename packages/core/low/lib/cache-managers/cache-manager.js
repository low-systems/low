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
    compilePartition(partition, context) {
        if (!Array.isArray(partition))
            return partition;
        const compiledPartition = [];
        for (const part of partition) {
            compiledPartition.push(part.startsWith('$$') ? part.substring(2) : '' + object_compiler_1.ObjectCompiler.objectPath(context, part));
        }
        return compiledPartition.join(':');
    }
    makeKey(config, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = '';
            for (const path of config.keyProperties) {
                const part = path.startsWith('$$') ? path.substring(2) : object_compiler_1.ObjectCompiler.objectPath(context, path);
                data += JSON.stringify(part);
            }
            const hash = crypto_1.createHash('sha1')
                .update(data)
                .digest('hex');
            return {
                partition: this.compilePartition(config.partition, context),
                key: hash
            };
        });
    }
    getItem(cacheKey) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    setItem(cacheKey, item, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    flush(partition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.CACHE.hasOwnProperty(partition)) {
                delete this.CACHE[partition];
            }
        });
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cache-manager.js.map