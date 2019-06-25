"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
/**
 * This parser does naff all except return an optional `defaultValue`
 * when the input is `null` or `undefined`. It is here to merely to
 * act as a base Parser for all other parsers
 */
class Parser extends module_1.Module {
    async parse(input, config) {
        if (['null', 'undefined'].includes(typeof input)) {
            return config.defaultValue || null;
        }
        else {
            return input;
        }
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map