"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Exception extends Error {
    constructor(message, innerError, metaData) {
        super(message);
        this.innerError = innerError || null;
        this.metaData = metaData || null;
        Object.setPrototypeOf(this, Exception.prototype);
    }
}
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map