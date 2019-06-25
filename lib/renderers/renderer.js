"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
class Renderer extends module_1.Module {
    async render(config, context) {
        const template = await this.getTemplate(config, context);
        const rendered = await this.core(template, context);
        const parsed = await this.parseRendered(rendered, config);
        return parsed;
    }
    async getTemplate(config, context) {
        return config.__template;
    }
    async parseRendered(rendered, config) {
        if (config.__parser) {
            const parser = this.env.getParser(config.__parser);
            rendered = await parser.parse(rendered, config.__parserConfig || {});
        }
        return rendered;
    }
    async core(template, context) {
        return template;
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map