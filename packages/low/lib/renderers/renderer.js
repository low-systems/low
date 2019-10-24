"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
class Renderer extends module_1.Module {
    async render(config, context) {
        let cacheManager;
        let cacheKey;
        if (config.__cacheConfig) {
            cacheManager = this.env.getCacheManager(config.__cacheConfig.cacheManager);
            cacheKey = await cacheManager.makeKey(config.__cacheConfig, context);
            const cachedItem = await cacheManager.getItem(cacheKey);
            if (cachedItem !== null) {
                return cachedItem;
            }
        }
        const template = await this.getTemplate(config, context);
        const rendered = await this.core(template, context);
        const parsed = await this.parseRendered(rendered, config);
        if (cacheManager && cacheKey) {
            await cacheManager.setItem(cacheKey, parsed, config.__cacheConfig.ttl);
        }
        return parsed;
    }
    async getTemplate(config, context) {
        return config.__template;
    }
    async parseRendered(rendered, config) {
        if (config.__parser) {
            const parser = this.env.getParser(config.__parser);
            const parsed = await parser.parse(rendered, config.__parserConfig || {});
            return parsed;
        }
        else {
            return rendered;
        }
    }
    async core(template, context) {
        return template;
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map