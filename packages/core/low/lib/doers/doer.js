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
const object_compiler_1 = require("../object-compiler");
class Doer extends module_1.Module {
    execute(context, task) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const env = context.env;
                env.info(context, this.moduleType, `Executing task ${task.name}`);
                let cacheManager;
                let cacheKey;
                context.calls[task.name] = { started: new Date(), config: task.config, finished: Number.MAX_VALUE };
                if (task.cacheConfig) {
                    context.calls[task.name].cacheConfig = task.cacheConfig;
                    env.info(context, this.moduleType, `Loading cache manager '${task.cacheConfig.cacheManager}`);
                    cacheManager = this.env.getCacheManager(task.cacheConfig.cacheManager);
                    cacheKey = yield cacheManager.makeKey(task.cacheConfig, context);
                    context.calls[task.name].cacheKey = cacheKey;
                    const cachedItem = yield cacheManager.getItem(cacheKey);
                    context.calls[task.name].cacheHit = !!cachedItem;
                    if (cachedItem) {
                        env.info(context, 'Found cached item');
                        env.debug(context, 'Found cached item', cachedItem);
                        context.data[task.name] = cachedItem;
                        context.calls[task.name].finished = new Date();
                        env.profiler.profile(task.name, task.doer, false, true, context.calls[task.name].started, context.calls[task.name].finished, context.uid);
                        return;
                    }
                }
                const coreConfig = yield object_compiler_1.ObjectCompiler.compile(task.config, context);
                context.calls[task.name].config = coreConfig;
                const output = yield this.main(context, task, coreConfig);
                context.data[task.name] = output;
                if (cacheManager && cacheKey) {
                    context.calls[task.name].cacheSet = `${cacheKey.partition}:${cacheKey.key} - TTL: ${task.cacheConfig.ttl}`;
                    yield cacheManager.setItem(cacheKey, output, task.cacheConfig.ttl);
                }
                context.calls[task.name].finished = new Date();
                env.profiler.profile(task.name, task.doer, false, false, context.calls[task.name].started, context.calls[task.name].finished, context.uid);
            }
            catch (err) {
                context.errors[task.name] = this.serialiseError(err);
                context.calls[task.name].finished = new Date();
                context.env.profiler.profile(task.name, task.doer, true, false, context.calls[task.name].started, context.calls[task.name].finished, context.uid);
                if (task.throwError) {
                    throw err;
                }
            }
        });
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            this.env.debug(context, this.moduleType, 'Executing main(), returning', coreConfig);
            return coreConfig;
        });
    }
    serialiseError(err) {
        const jsonErr = {};
        Object.getOwnPropertyNames(err).forEach((key) => { jsonErr[key] = err[key]; });
        return jsonErr;
    }
}
exports.Doer = Doer;
//# sourceMappingURL=doer.js.map