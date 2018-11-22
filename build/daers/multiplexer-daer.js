"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_daer_1 = require("./base-daer");
const exception_1 = require("../exception");
class MultiplexerDaer extends base_daer_1.BaseDaer {
    core(job, taskConfig, coreConfig, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let [index, subConfig] of Object.entries(coreConfig.tasks)) {
                try {
                    if (typeof subConfig === 'string') {
                        subConfig = this.resolvePointer(subConfig, this.env, job);
                    }
                    const daer = this.env.getDaer(subConfig.daer);
                    yield daer.execute(job, subConfig, [...path]);
                    const result = this.createResult(Number(index), subConfig, undefined, undefined);
                    results.push(result);
                }
                catch (err) {
                    const result = this.createResult(Number(index), undefined, undefined, err.message);
                    results.push(result);
                    if (coreConfig.breakOnError) {
                        throw new exception_1.Exception('An error occurred in a sub-task of a multiplexer.', err, { resultsSoFar: results });
                    }
                }
            }
            return {
                data: {
                    _results: results
                }
            };
        });
    }
    createResult(index, config, duration, error) {
        return {
            error,
            taskName: config && config.name,
            daer: config && config.daer,
            index: index,
            success: !error,
            duration: duration
        };
    }
}
exports.MultiplexerDaer = MultiplexerDaer;
//# sourceMappingURL=multiplexer-daer.js.map