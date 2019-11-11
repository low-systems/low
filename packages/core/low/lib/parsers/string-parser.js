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
class StringParser extends parser_1.Parser {
    parse(input, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (typeof input) {
                    case ('object'):
                        return JSON.stringify(input, null, config.spaces);
                    case ('number'):
                        switch (config.numberFunction) {
                            case ('toExponential'):
                                return input.toExponential(config.fractionDigits || undefined);
                            case ('toFixed'):
                                return input.toFixed(config.fractionDigits || undefined);
                            case ('toLocaleString'):
                                return input.toLocaleString(config.locales || undefined, config.localeOptions || undefined);
                            case ('toPrecision'):
                                return input.toPrecision(config.precision || undefined);
                            default:
                                return input.toString(config.radix || undefined);
                        }
                    case ('boolean'):
                        return input === true ? config.trueString || 'true' : config.falseString || 'false';
                    case ('undefined'):
                        return config.undefinedString || '';
                    default:
                        return input.toString();
                }
            }
            catch (err) {
                if (typeof config.defaultValue === 'string') {
                    return config.defaultValue;
                }
                else {
                    throw err;
                }
            }
        });
    }
}
exports.StringParser = StringParser;
//# sourceMappingURL=string-parser.js.map