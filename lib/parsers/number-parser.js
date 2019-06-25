"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class NumberParser extends parser_1.Parser {
    async parse(input, config) {
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
    }
}
exports.NumberParser = NumberParser;
//# sourceMappingURL=number-parser.js.map