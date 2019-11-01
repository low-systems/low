"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConnectorRunError extends Error {
    constructor(message, context) {
        super(message);
        this.context = context;
        Object.setPrototypeOf(this, ConnectorRunError.prototype);
    }
}
exports.ConnectorRunError = ConnectorRunError;
//# sourceMappingURL=connector-run-error.js.map