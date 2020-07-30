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
const low_1 = require("low");
class JavascriptRenderer extends low_1.Renderer {
    constructor() {
        super(...arguments);
        this.functions = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerFunctions();
        });
    }
    registerFunctions() {
        if (this.config.functions) {
            for (const [name, code] of Object.entries(this.config.functions)) {
                const func = this.makeFunction(code, name);
                this.functions[name] = func;
            }
        }
    }
    core(func, context, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const output = yield func.call(context, metadata);
                return output;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getTemplate(config, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof config.__template === 'string') {
                if (this.functions.hasOwnProperty(config.__template)) {
                    return this.functions[config.__template];
                }
                throw new Error(`Pre-registered function '${config.__template}' could not be found`);
            }
            else if (typeof config.__template === 'object' && config.__template !== null) {
                if (typeof config.__template.name === 'string' && this.functions.hasOwnProperty(config.__template.name)) {
                    return this.functions[config.__template.name];
                }
                const func = this.makeFunction(config.__template.code, config.__template.name);
                if (typeof config.__template.name === 'string') {
                    this.functions[config.__template.name] = func;
                }
                return func;
            }
            else {
                throw new Error(`Invalid Javascript template. Templates must either be the name of a pre-compiled template or contain an object with a 'code' property that`);
            }
        });
    }
    makeFunction(code, name) {
        let promise = `return new Promise((resolve, reject) => {
        try {
          ${code}
        } catch (err) {
          reject(err);
        }
      });`;
        if (name) {
            promise = `//# sourceURL=${name}\n${promise}`;
        }
        const func = new Function('metadata', promise);
        return func;
    }
}
exports.JavascriptRenderer = JavascriptRenderer;
//# sourceMappingURL=javascript-renderer.js.map