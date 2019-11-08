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
const doer_1 = require("./doer");
const object_compiler_1 = require("../object-compiler");
class MultiDoer extends doer_1.Doer {
    main(context, taskConfig, multiDoerTasks) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const multiDoerTask of multiDoerTasks) {
                const task = typeof multiDoerTask.task === 'string' ?
                    this.env.getTask(multiDoerTask.task) :
                    multiDoerTask.task;
                const doer = this.env.getDoer(task.doer);
                yield doer.execute(context, task);
                if (multiDoerTask.branch) {
                    const branchConfig = yield object_compiler_1.ObjectCompiler.compile(multiDoerTask.branch, context);
                    if (!branchConfig.taskName) {
                        throw new Error(`Invalid BranchConfig for task '${task.name}'`);
                    }
                    const branchTask = this.env.getTask(branchConfig.taskName);
                    const branchDoer = this.env.getDoer(branchTask.doer);
                    yield branchDoer.execute(context, branchTask);
                    if (branchConfig.haltAfterExecution) {
                        break;
                    }
                }
            }
        });
    }
}
exports.MultiDoer = MultiDoer;
//# sourceMappingURL=multi-doer.js.map