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
const base_cache_manager_1 = require("./base-cache-manager");
const CACHE = {};
class InMemoryCacheManager extends base_cache_manager_1.BaseCacheManager {
    constructor(name) {
        super(name);
    }
    getItem(cacheKey) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    setItem(cacheKey, item, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    bust(partition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (CACHE.hasOwnProperty(partition)) {
                delete CACHE[partition];
            }
        });
    }
}
exports.InMemoryCacheManager = InMemoryCacheManager;
//# sourceMappingURL=in-memory-cache-manager.js.map