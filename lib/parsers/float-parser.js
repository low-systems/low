"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class FloatParser extends parser_1.Parser {
    async parse(input, config) {
        const output = parseFloat(input);
        if (Number.isNaN(output) && config.defaultValue) {
            return config.defaultValue;
        }
        else {
            return output;
        }
    }
}
exports.FloatParser = FloatParser;
//# sourceMappingURL=float-parser.js.map