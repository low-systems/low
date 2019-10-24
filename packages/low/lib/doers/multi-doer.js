"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const doer_1 = require("./doer");
const object_compiler_1 = require("../object-compiler");
class MultiDoer extends doer_1.Doer {
    async main(context, taskConfig, multiDoerTasks) {
        for (const multiDoerTask of multiDoerTasks) {
            const doer = this.env.getDoer(multiDoerTask.task.doer);
            await doer.execute(context, multiDoerTask.task);
            if (multiDoerTask.branch) {
                const branchConfig = await object_compiler_1.ObjectCompiler.compile(multiDoerTask.branch, context);
                if (!branchConfig.taskName) {
                    throw new Error(`Invalid BranchConfig for task '${multiDoerTask.task.name}'`);
                }
                const branchTask = this.env.getTask(branchConfig.taskName);
                const branchDoer = this.env.getDoer(branchTask.doer);
                await branchDoer.execute(context, branchTask);
                if (branchConfig.haltAfterExecution) {
                    break;
                }
            }
        }
    }
}
exports.MultiDoer = MultiDoer;
//# sourceMappingURL=multi-doer.js.map