"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class IntegerParser extends parser_1.Parser {
    async parse(input, config) {
        const output = parseInt(input, config.radix || 10);
        if (Number.isNaN(output) && config.defaultValue) {
            return config.defaultValue;
        }
        else {
            return output;
        }
    }
}
exports.IntegerParser = IntegerParser;
//# sourceMappingURL=integer-parser.js.map