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
const base_parser_1 = require("./base-parser");
class NumberParser extends base_parser_1.BaseParser {
    constructor(env, name) { super(env, name); }
    parse(input, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return Number(input);
            }
            catch (err) {
                if (config.defaultValue) {
                    return config.defaultValue;
                }
                else {
                    throw err;
                }
            }
        });
    }
}
exports.NumberParser = NumberParser;
//# sourceMappingURL=number-parser.js.map