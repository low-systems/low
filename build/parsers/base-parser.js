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
class BaseParser extends base_module_1.BaseModule {
    constructor(env, name, ...args) {
        super(env, name, ...args);
    }
    parse(input, config) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`${this.debugPath} has not implemented parse(any, ParserConfig<any>)`);
        });
    }
}
exports.BaseParser = BaseParser;
//# sourceMappingURL=base-parser.js.map