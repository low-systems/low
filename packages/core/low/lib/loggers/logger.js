"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger extends module_1.Module /* implements LogMethods */ {
    debug(label, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log.apply(console, [label, ...args]);
        });
    }
    info(label, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info.apply(console, [label, ...args]);
        });
    }
    warn(label, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn.apply(console, [label, ...args]);
        });
    }
    error(label, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error.apply(console, [label, ...args]);
        });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map