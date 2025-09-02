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
exports.JavascriptRenderer = void 0;
const index_1 = require("../../index");
const Crypto = __importStar(require("crypto"));
const FS = __importStar(require("fs"));
const Path = __importStar(require("path"));
const Querystring = __importStar(require("querystring"));
const Url = __importStar(require("url"));
class JavascriptRenderer extends index_1.Renderer {
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
            const errorCode = `throw new Error("Cannot call function ${name || 'without a name'} as it contains a syntax error");`;
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