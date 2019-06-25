"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class StringParser extends parser_1.Parser {
    async parse(input, config) {
        try {
            return ['null', 'undefined'].indexOf(input) ? '' : input.toString();
        }
        catch (err) {
            if (config.defaultValue) {
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