"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const parser_1 = require("./parser");
class UrlParser extends parser_1.Parser {
    async parse(input, config) {
        try {
            return new url_1.URL(input, config.base || undefined);
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
exports.UrlParser = UrlParser;
//# sourceMappingURL=url-parser.js.map