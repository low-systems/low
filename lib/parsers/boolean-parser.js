"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class BooleanParser extends parser_1.Parser {
    async parse(input, config) {
        try {
            return Boolean(input);
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
exports.BooleanParser = BooleanParser;
//# sourceMappingURL=boolean-parser.js.map