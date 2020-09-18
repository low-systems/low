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
exports.MySqlDoer = exports.ScalarResolutionError = exports.ScalarCastError = exports.BitsToBoolsConversionError = void 0;
const mysql_1 = __importDefault(require("mysql"));
const low_1 = require("low");
class BitsToBoolsConversionError extends Error {
    constructor(message, config, results) {
        super(message);
        this.config = config;
        Object.setPrototypeOf(this, BitsToBoolsConversionError);
    }
}
exports.BitsToBoolsConversionError = BitsToBoolsConversionError;
class ScalarCastError extends Error {
    constructor(message, value, config) {
        super(message);
        this.value = value;
        this.config = config;
        Object.setPrototypeOf(this, ScalarCastError.prototype);
    }
}
exports.ScalarCastError = ScalarCastError;
class ScalarResolutionError extends Error {
    constructor(message, results, config) {
        super(message);
        this.results = results;
        this.config = config;
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
        if (config.scalarConfig) {
            const scalar = this.resolveScalar(results, config.scalarConfig);
            return scalar;
        }
        if (config.bitsToBoolsConfigs) {
            this.bitsToBools(results, config.bitsToBoolsConfigs);
        }
        return { results, fields };
    }
    bitsToBools(results, config) {
        const configs = Array.isArray(config) ? config : [config];
        let configIndex = 0;
        const configsLength = configs.length;
        //As these results sets may be huge, I'm using while loops for maximum performance.
        //Apologies for this not being as syntactically sweet as a for-of or forEach
        while (configIndex < configsLength) {
            const { fields, recordSetIndex } = configs[configIndex];
            //We might have one record set with all results in `results` or many record sets each with
            //their results in separate arrays within `results`
            const records = typeof recordSetIndex !== 'undefined' ? results[recordSetIndex] : results;
            if (!Array.isArray(records)) {
                throw new BitsToBoolsConversionError('Record set does not contain results ', configs[configIndex], results);
            }
            let recordIndex = 0;
            const recordsLength = records.length;
            const fieldsLength = fields.length;
            while (recordIndex < recordsLength) {
                let fieldIndex = 0;
                while (fieldIndex < fieldsLength) {
                    if (Buffer.isBuffer(records[recordIndex][fields[fieldIndex]]) && records[recordIndex][fields[fieldIndex]].length === 1) {
                        records[recordIndex][fields[fieldIndex]] = !!records[recordIndex][fields[fieldIndex]][0];
                    }
                    fieldIndex++;
                }
                recordIndex++;
            }
            configIndex++;
        }
    }
    resolveScalar(results, config) {
        //We might have one record set with all results in `results` or many record sets each with
        //their results in separate arrays within `results`
        const recordSet = typeof config.recordSetIndex !== 'undefined' ? results[config.recordSetIndex] : results;
        if (!Array.isArray(recordSet)) {
            throw new ScalarResolutionError('Record set does not contain results', results, config);
        }
        if (recordSet.length !== 1) {
            throw new ScalarResolutionError('Record set contains more or less than one row', results, config);
        }
        const columns = Object.keys(recordSet[0]);
        if (columns.length !== 1) {
            throw new ScalarResolutionError('Cannot treat results with more or less than 1 column as a scalar results', results, config);
        }
        const value = recordSet[0][columns[0]];
        try {
            switch (config.type) {
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
            throw new ScalarCastError(err.message, value, config);
        }
    }
}
exports.MySqlDoer = MySqlDoer;
//# sourceMappingURL=mysql-doer.js.map