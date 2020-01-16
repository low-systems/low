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
const Querystring = __importStar(require("querystring"));
const parser_1 = require("./parser");
class QuerystringParser extends parser_1.Parser {
    parse(input, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (typeof input !== 'string') {
                    throw new Error('The Querystring parser can only be used on strings');
                }
                const start = input.indexOf('?') + 1;
                const querystring = input.substr(start);
                return Querystring.parse(querystring, config.separator || '&', config.equals || '=');
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
exports.QuerystringParser = QuerystringParser;
//# sourceMappingURL=querystring-parser.js.map