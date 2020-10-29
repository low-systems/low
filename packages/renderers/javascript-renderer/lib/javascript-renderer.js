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
const low_1 = require("low");
const Crypto = __importStar(require("crypto"));
const FS = __importStar(require("fs"));
const Path = __importStar(require("path"));
const Querystring = __importStar(require("querystring"));
const Url = __importStar(require("url"));
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
                const imports = {
                    crypto: Crypto,
                    fs: FS,
                    path: Path,
                    querystring: Querystring,
                    url: Url
                };
                if (metadata && Array.isArray(metadata.imports)) {
                    metadata.imports.forEach((importName) => {
                        imports[importName] = require(importName);
                    });
                }
                const output = yield func.call(context, metadata, this.functions, imports);
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
                if (typeof config.__template.name !== 'string') {
                    config.__template.name = Crypto.createHash('sha1').update(config.__template.code).digest('hex');
                }
                const func = this.makeFunction(config.__template.code, config.__template.name);
                this.functions[config.__template.name] = func;
                return func;
            }
            else {
                throw new Error(`Invalid Javascript template. Templates must either be the name of a pre-compiled template or contain an object with a 'code' property that`);
            }
        });
    }
    makeFunction(code, name) {
        const promiseCode = this.wrapCode(code, name);
        try {
            const func = new Function('metadata', 'functions', 'imports', promiseCode);
            return func;
        }
        catch (err) {
            console.error(`Failed to make function '${name || 'without a name'}': ${err.message}`);
            console.error(err.stack);
            console.error(promiseCode);
            const errorCode = `throw new Error("Cannot call function ${name || 'without a name'} as it is broken");`;
            const wrappedErrorCode = this.wrapCode(errorCode, name);
            const func = new Function('metadata', 'functions', 'imports', wrappedErrorCode);
            return func;
        }
    }
    wrapCode(code, name) {
        const sourceUrl = name ? `//# sourceURL=${name}\n` : '';
        const wrappedCode = `return new Promise((resolve, reject) => {
      try {
        ${sourceUrl}${code}
      } catch (err) {
        reject(err);
      }
    });`;
        return wrappedCode;
    }
}
exports.JavascriptRenderer = JavascriptRenderer;
//# sourceMappingURL=javascript-renderer.js.map