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
const base_module_1 = require("../base-module");
const dot = require("dot-object");
class BaseRenderer extends base_module_1.BaseModule {
    render(config, job) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.buildContext(config, job);
            const template = this.getTemplate(config, job);
            const rendered = yield this.core(template, context);
            const parsed = yield this.parseRendered(rendered, config);
            return parsed;
        });
    }
    buildContext(config, job) {
        return {
            env: this.env,
            job,
            metaData: config.metaData || {}
        };
    }
    getTemplate(config, job) {
        if (!config.template || !config.templatePath) {
            throw new Error('No template or path provided');
        }
        let template = config.template || null;
        if (config.templatePath) {
            template = dot.pick(config.templatePath, this.config);
            if (!template) {
                template = dot.pick(config.templatePath, this.env);
            }
            if (!template) {
                template = dot.pick(config.templatePath, job);
            }
        }
        if (!template) {
            throw new Error('No template could be loaded');
        }
        return template;
    }
    parseRendered(rendered, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.parser) {
                const parser = this.env.getParser(config.parser);
                rendered = yield parser.parse(rendered, config.parserConfig || {});
            }
            return rendered;
        });
    }
    core(template, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return template;
        });
    }
}
exports.BaseRenderer = BaseRenderer;
//# sourceMappingURL=base-renderer.js.map