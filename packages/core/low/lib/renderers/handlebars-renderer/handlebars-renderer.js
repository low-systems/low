"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.HandlebarsRenderer = void 0;
const Handlebars = __importStar(require("handlebars"));
const index_1 = require("../../index");
class HandlebarsRenderer extends index_1.Renderer {
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
    core(template, context, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            context.templateMetadata = metadata;
            const handlebarsOptions = (metadata === null || metadata === void 0 ? void 0 : metadata.handlebarsOptions) || {};
            const output = template(context, handlebarsOptions);
            delete context.templateMetadata;
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