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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSDoer = void 0;
// import Module from 'module';
// import Url from 'url';
const vm_1 = __importDefault(require("vm"));
const doer_1 = require("./doer");
class JSDoer extends doer_1.Doer {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const code = typeof this.config.code === 'string' ? this.config.code : '';
            yield this.loadCode(code);
        });
    }
    loadCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.moduleContext = vm_1.default.createContext({
                    require: (filename) => {
                        const module = require(filename);
                        return module;
                    },
                    exports: {}
                });
                this.module = new vm_1.default.SourceTextModule(code, {
                    context: this.moduleContext,
                    initializeImportMeta(meta) {
                        meta.url = __dirname;
                    }
                });
                yield this.module.link((specifier, referencingModule) => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        const module = yield Promise.resolve(`${specifier}`).then(s => __importStar(require(s)));
                        const exportNames = Object.keys(module);
                        const syntheticModule = new vm_1.default.SyntheticModule(exportNames, function () {
                            exportNames.forEach(key => {
                                this.setExport(key, module[key]);
                            });
                        }, { context: this.moduleContext });
                        resolve(syntheticModule);
                    }));
                }));
                yield this.module.evaluate();
                this.modules = this.moduleContext.exports;
            }
            catch (err) {
                console.error(`FAILED TO LOAD CODE:`, err.message);
            }
        });
    }
    main(context, taskConfig, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const module = this.modules[config.module];
                const method = module[config.method || 'main'];
                const output = yield method(this.env, context, config.parameters);
                return output;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.JSDoer = JSDoer;
//# sourceMappingURL=js-doer.js.map