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
const module_1 = require("../module");
const object_compiler_1 = require("../object-compiler");
class Renderer extends module_1.Module {
    render(config, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheManager;
            let cacheKey;
            if (config.__cacheConfig) {
                cacheManager = this.env.getCacheManager(config.__cacheConfig.cacheManager);
                cacheKey = yield cacheManager.makeKey(config.__cacheConfig, context);
                const cachedItem = yield cacheManager.getItem(cacheKey);
                if (cachedItem !== null) {
                    return cachedItem;
                }
            }
            const template = yield this.getTemplate(config, context);
            const metadata = yield object_compiler_1.ObjectCompiler.compile(config.__metadata || {}, context);
            const rendered = yield this.core(template, context, metadata);
            const parsed = yield this.parseRendered(rendered, config);
            if (cacheManager && cacheKey) {
                yield cacheManager.setItem(cacheKey, parsed, config.__cacheConfig.ttl);
            }
            return parsed;
        });
    }
    getTemplate(config, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return config.__template;
        });
    }
    parseRendered(rendered, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.__parser) {
                const parser = this.env.getParser(config.__parser);
                const parsed = yield parser.parse(rendered, config.__parserConfig || {});
                return parsed;
            }
            else {
                return rendered;
            }
        });
    }
    core(template, context, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return template;
        });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map