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
const Handlebars = require("handlebars");
const low_1 = require("low");
class RendererHandlebars extends low_1.Renderer {
    constructor(hbs = Handlebars.create()) {
        super();
        this.hbs = hbs;
        this.templates = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerTemplates();
            this.registerPartials();
        });
    }
    registerTemplates() {
        if (this.config.templates) {
            for (const [name, contents] of Object.entries(this.config.templates)) {
                const template = this.hbs.compile(contents);
                this.templates[name] = template;
            }
        }
    }
    registerPartials() {
        if (this.config.partials) {
            for (const [name, contents] of Object.entries(this.config.partials)) {
                const template = this.hbs.compile(contents);
                this.hbs.registerPartial(name, template);
            }
        }
    }
    core(template, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = template(context);
            return output;
        });
    }
    getTemplate(config, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof config.__template === 'string') {
                return this.hbs.compile(config.__template);
            }
            else if (typeof config.__template === 'object' && config.__template !== null && typeof config.__template.name === 'string') {
                if (this.templates.hasOwnProperty(config.__template.name)) {
                    return this.templates[config.__template.name];
                }
                else {
                    throw new Error(`Pre-compiled template '${config.__template.name}' could not be found`);
                }
            }
            else {
                throw new Error('Invalid Handlebars template. Templates must either be a string or contain an object with a name property that points to a pre-compiled template');
            }
        });
    }
}
exports.RendererHandlebars = RendererHandlebars;
//# sourceMappingURL=renderer-handlebars.js.map