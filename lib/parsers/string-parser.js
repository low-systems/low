"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class StringParser extends parser_1.Parser {
    async parse(input, config) {
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
    }
}
exports.StringParser = StringParser;
//# sourceMappingURL=string-parser.js.map