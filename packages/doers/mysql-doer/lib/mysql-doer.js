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
exports.MySqlDoer = void 0;
const mysql_1 = __importDefault(require("mysql"));
const low_1 = require("low");
class MySqlDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.pools = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            Object.entries(this.config).forEach(([name, options]) => {
                if (name in this.secrets) {
                    options.password = this.secrets[name] || options.password || undefined;
                }
                this.pools[name] = mysql_1.default.createPool(options);
            });
        });
    }
    main(context, taskConfig, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = this.pools[config.pool];
            if (!pool) {
                throw new Error(`Pool with name '${config.pool}' does not exist`);
            }
            const response = yield new Promise((resolve, reject) => {
                try {
                    pool.query(config.query, config.parameters || [], (error, results, fields) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            if (config.convertBitsToBools) {
                                const fieldNames = Array.isArray(config.convertBitsToBools) ? config.convertBitsToBools :
                                    typeof config.convertBitsToBools === 'string' ? [config.convertBitsToBools] :
                                        fields && fields.map((field) => field.name) || []; //TODO: Check that this will never be field.orgName
                                this.convertBitsToBools(results, fieldNames);
                            }
                            resolve({ results, fields });
                        }
                    });
                }
                catch (err) {
                    reject(err);
                }
            });
            return response;
        });
    }
    //TODO: Make this work for multiple record sets
    convertBitsToBools(results, fieldNames) {
        //As these results sets may be huge, I'm using while loops for maximum performance.
        //Apologies for this not being as syntactically sweet as a for-of or forEach
        let r = 0;
        const resultsLength = results.length;
        const fieldNamesLength = fieldNames.length;
        while (r < resultsLength) {
            let f = 0;
            while (f < fieldNamesLength) {
                if (Buffer.isBuffer(results[r][fieldNames[f]])) {
                    results[r][f] = !!results[r][fieldNames[f]][0];
                }
                f++;
            }
            r++;
        }
    }
}
exports.MySqlDoer = MySqlDoer;
//# sourceMappingURL=mysql-doer.js.map