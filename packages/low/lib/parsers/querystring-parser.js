"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Querystring = require("querystring");
const parser_1 = require("./parser");
class QuerystringParser extends parser_1.Parser {
    async parse(input, config) {
        try {
            if (typeof input !== 'string') {
                throw new Error('The Querystring parser can only be used on strings');
            }
            const start = input.indexOf('?') + 1;
            const firstEquals = input.indexOf(config.equals || '=');
            if (start === -1 && firstEquals < 1) {
                throw new Error('No querystring identified in string');
            }
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
    }
}
exports.QuerystringParser = QuerystringParser;
//# sourceMappingURL=querystring-parser.js.map