"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class StringifyParser extends parser_1.Parser {
    async parse(input, config) {
        try {
            const spaces = config.hasOwnProperty('spaces') ? config.spaces : 4;
            return JSON.stringify(input, null, spaces);
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
exports.StringifyParser = StringifyParser;
//# sourceMappingURL=stringify-parser.js.map