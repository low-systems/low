"use strict";
/**
 * TODO:
 * Turn this into a `Module` and have a `log` method in `Environment` that calls all registered Log
 * modules. These modules will each have their own `log` method
*/
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("crypto");
const environment_1 = require("./environment");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["LOG"] = 0] = "LOG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Log {
    static getContextLabel(logContext) {
        if (typeof logContext !== 'object' || logContext === null) {
            return 'GLOBAL';
        }
        if (logContext instanceof environment_1.Environment) {
            return 'ENVIRONMENT';
        }
        if (!logContext.hasOwnProperty('uid')) {
            logContext.uid = Crypto.randomBytes(4).toString('hex');
        }
        return logContext.uid;
    }
    static getContextLogLevel(logContext) {
        if (typeof logContext !== 'object' || logContext === null) {
            return LogLevel.ERROR;
        }
        if (typeof logContext.logLevel === 'number') {
            //HACK: TSC thinks that it's possible for `logContext` to be `undefined` here?!
            return logContext.logLevel;
        }
        if (logContext.hasOwnProperty('env') && logContext.env instanceof environment_1.Environment) {
            return logContext.env.logLevel;
        }
        return LogLevel.ERROR;
    }
    static when(context, when, message, ...args) {
        const contextLogLevel = Log.getContextLogLevel(context);
        const contextLabel = Log.getContextLabel(context);
        if (when & contextLogLevel) {
            console.log.apply(console, [contextLabel, message, ...args]);
            return true;
        }
        return false;
    }
    static log(context, message, ...args) {
        const contextLogLevel = Log.getContextLogLevel(context);
        if (LogLevel.LOG < contextLogLevel) {
            return false;
        }
        const contextLabel = Log.getContextLabel(context);
        console.log.apply(console, [contextLabel, message, ...args]);
        return true;
    }
    static info(context, message, ...args) {
        const contextLogLevel = Log.getContextLogLevel(context);
        if (LogLevel.INFO < contextLogLevel) {
            return false;
        }
        const contextLabel = Log.getContextLabel(context);
        console.info.apply(console, [contextLabel, message, ...args]);
        return true;
    }
    static warn(context, message, ...args) {
        const contextLogLevel = Log.getContextLogLevel(context);
        if (LogLevel.WARN < contextLogLevel) {
            return false;
        }
        const contextLabel = Log.getContextLabel(context);
        console.warn.apply(console, [contextLabel, message, ...args]);
        return true;
    }
    static error(context, message, ...args) {
        const contextLogLevel = Log.getContextLogLevel(context);
        if (LogLevel.ERROR < contextLogLevel) {
            return false;
        }
        const contextLabel = Log.getContextLabel(context);
        console.error.apply(console, [contextLabel, message, ...args]);
        return true;
    }
}
exports.Log = Log;
//# sourceMappingURL=log.js.map