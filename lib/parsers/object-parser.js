"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class ObjectParser extends parser_1.Parser {
    async parse(input, config) {
        try {
            if (typeof input === 'string') {
                return JSON.parse(input);
            }
            else {
                return input;
            }
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
exports.ObjectParser = ObjectParser;
//# sourceMappingURL=object-parser.js.map