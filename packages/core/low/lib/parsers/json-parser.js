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
const parser_1 = require("./parser");
class JsonParser extends parser_1.Parser {
    parse(input, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (typeof input === 'string') {
                    return JSON.parse(input);
                }
                else {
                    return input;
                }
            }
            catch (err) {
                if (config.hasOwnProperty('defaultValue')) {
                    return config.defaultValue;
                }
                else {
                    throw err;
                }
            }
        });
    }
}
exports.JsonParser = JsonParser;
//# sourceMappingURL=json-parser.js.map