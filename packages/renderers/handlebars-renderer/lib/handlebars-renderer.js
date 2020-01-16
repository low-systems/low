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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = __importStar(require("handlebars"));
const low_1 = require("low");
class HandlebarsRenderer extends low_1.Renderer {
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
                if (this.templates.hasOwnProperty(config.__template)) {
                    return this.templates[config.__template];
                }
                throw new Error(`Pre-registered template '${config.__template}' could not be found`);
            }
            else if (typeof config.__template === 'object' && config.__template !== null) {
                if (typeof config.__template.name === 'string' && this.templates.hasOwnProperty(config.__template.name)) {
                    return this.templates[config.__template.name];
                }
                const compiledTemplate = this.hbs.compile(config.__template.code);
                if (typeof config.__template.name === 'string') {
                    this.templates[config.__template.name] = compiledTemplate;
                }
                return compiledTemplate;
            }
            else {
                throw new Error(`Invalid Handlebars template. Templates must either be the name of a pre-compiled template or contain an object with a 'code' property that`);
            }
        });
    }
}
exports.HandlebarsRenderer = HandlebarsRenderer;
//# sourceMappingURL=handlebars-renderer.js.map