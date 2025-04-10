"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = exports.isObject = void 0;
const isObject = (input) => (input && typeof input === 'object' && !Array.isArray(input));
exports.isObject = isObject;
const clone = (input) => (input && typeof input === 'object' ?
    JSON.parse(JSON.stringify(input)) :
    input);
exports.clone = clone;
//# sourceMappingURL=utilities.js.map