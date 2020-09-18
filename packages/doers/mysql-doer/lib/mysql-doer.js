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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlDoer = exports.ScalarResolutionError = exports.ScalarCastError = void 0;
const mysql_1 = __importDefault(require("mysql"));
const low_1 = require("low");
class ScalarCastError extends Error {
    constructor(message, value, type) {
        super(message);
        this.value = value;
        this.type = type;
        Object.setPrototypeOf(this, ScalarCastError.prototype);
    }
}
exports.ScalarCastError = ScalarCastError;
class ScalarResolutionError extends Error {
    constructor(message, results, type) {
        super(message);
        this.results = results;
        this.type = type;
        Object.setPrototypeOf(this, ScalarResolutionError.prototype);
    }
}
exports.ScalarResolutionError = ScalarResolutionError;
class MySqlDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.pools = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            Object.entries(this.config).forEach(([name, options]) => {
                if (name in this.secrets && this.secrets[name]) {
                    options.password = this.secrets[name];
                }
                this.pools[name] = mysql_1.default.createPool(options);
            });
        });
    }
    main(context, taskConfig, config) {
        return new Promise((resolve, reject) => {
            const pool = this.pools[config.pool];
            if (!pool) {
                reject(new Error(`Pool with name '${config.pool}' does not exist`));
            }
            pool.query(config.query, config.parameters || [], (error, results, fields) => {
                try {
                    resolve(this.handleResults(config, error, results, fields));
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    handleResults(config, error, results, fields) {
        if (error)
            throw error;
        if (config.convertBitsToBools) {
            this.bitsToBools(results, config.convertBitsToBools, fields);
        }
        if (config.scalarType) {
            const scalar = this.resolveScalar(results, config.scalarType, fields);
            return scalar;
        }
        else {
            return { results, fields };
        }
    }
    bitsToBools(results, fieldNames, fields) {
        if (!fields) {
            throw new Error('Cannot convert bits to bools as there appears to be no Field info');
        }
        if (Array.isArray(fields[0])) {
            throw new Error('Cannot convert bits to bools on multiple record sets yet, sorry!');
        }
        //As these results sets may be huge, I'm using while loops for maximum performance.
        //Apologies for this not being as syntactically sweet as a for-of or forEach
        if (fieldNames.length) {
            let r = 0;
            const resultsLength = results.length;
            const fieldNamesLength = fieldNames.length;
            while (r < resultsLength) {
                let f = 0;
                while (f < fieldNamesLength) {
                    if (Buffer.isBuffer(results[r][fieldNames[f]])) {
                        results[r][fieldNames[f]] = !!results[r][fieldNames[f]][0];
                    }
                    f++;
                }
                r++;
            }
        }
    }
    resolveScalar(results, type, fields) {
        if (!fields) {
            throw new ScalarResolutionError('Cannot resolve scalar value as there appears to be no Field info', results, type);
        }
        if (Array.isArray(fields[0])) {
            throw new ScalarResolutionError('Cannot treat multiple record sets as a scalar result', results, type);
        }
        if (results.length !== 1) {
            throw new ScalarResolutionError('Cannot treat results with more or less than 1 row as a scalar result', results, type);
        }
        const columns = Object.keys(results[0]);
        if (columns.length !== 1) {
            throw new ScalarResolutionError('Cannot treat results with more or less than 1 column as a scalar results', results, type);
        }
        const value = results[0][columns[0]];
        try {
            switch (type) {
                case ('boolean'):
                    if (Buffer.isBuffer(value)) {
                        return !!value[0];
                    }
                    else {
                        return Boolean(value);
                    }
                case ('date'):
                    return new Date(value);
                case ('json'):
                    return JSON.parse(value);
                case ('number'):
                    return Number(value);
                case ('string'):
                    return '' + value;
                default:
                    return value;
            }
        }
        catch (err) {
            throw new ScalarCastError(err.message, value, type);
        }
    }
}
exports.MySqlDoer = MySqlDoer;
//# sourceMappingURL=mysql-doer.js.map