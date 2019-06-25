"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
const object_compiler_1 = require("../object-compiler");
class Doer extends module_1.Module {
    async execute(context, task) {
        try {
            let cacheManager;
            let cacheKey;
            if (task.cacheConfig) {
                cacheManager = this.env.getCacheManager(task.cacheConfig.cacheManager);
                cacheKey = await cacheManager.makeKey(task.cacheConfig, context);
                const cachedItem = await cacheManager.getItem(cacheKey);
                if (cachedItem) {
                    context.data[task.name] = cachedItem;
                    return;
                }
            }
            const coreConfig = await object_compiler_1.ObjectCompiler.compile(task, context);
            const output = await this.main(context, task, coreConfig);
            context.data[task.name] = output;
            if (cacheManager && cacheKey) {
                await cacheManager.setItem(cacheKey, output, task.cacheConfig.ttl);
            }
        }
        catch (err) {
            context.errors[task.name] = err;
        }
    }
    async main(context, taskConfig, coreConfig) {
        return coreConfig;
    }
}
exports.Doer = Doer;
//# sourceMappingURL=doer.js.map