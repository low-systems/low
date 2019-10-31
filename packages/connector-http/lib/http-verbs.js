"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpVerbFlags;
(function (HttpVerbFlags) {
    HttpVerbFlags[HttpVerbFlags["GET"] = 1] = "GET";
    HttpVerbFlags[HttpVerbFlags["HEAD"] = 2] = "HEAD";
    HttpVerbFlags[HttpVerbFlags["POST"] = 4] = "POST";
    HttpVerbFlags[HttpVerbFlags["PUT"] = 8] = "PUT";
    HttpVerbFlags[HttpVerbFlags["DELETE"] = 16] = "DELETE";
    HttpVerbFlags[HttpVerbFlags["CONNECT"] = 32] = "CONNECT";
    HttpVerbFlags[HttpVerbFlags["OPTIONS"] = 64] = "OPTIONS";
    HttpVerbFlags[HttpVerbFlags["TRACE"] = 128] = "TRACE";
    HttpVerbFlags[HttpVerbFlags["PATCH"] = 256] = "PATCH";
})(HttpVerbFlags = exports.HttpVerbFlags || (exports.HttpVerbFlags = {}));
exports.ALL_HTTP_VERBS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];
function HttpVerbsFromArray(verbsArray = exports.ALL_HTTP_VERBS) {
    let verbs = 0;
    for (const verb of verbsArray) {
        if (!exports.ALL_HTTP_VERBS.includes(verb)) {
            throw new Error(`Invalid HTTP verb '${verb}'`);
        }
        verbs = verbs | HttpVerbFlags[verb];
    }
    return verbs;
}
exports.HttpVerbsFromArray = HttpVerbsFromArray;
//# sourceMappingURL=http-verbs.js.map