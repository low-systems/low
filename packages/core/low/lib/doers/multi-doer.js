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
            this.env.debug(context, this.moduleType, 'Executing main(), returning');
            for (const multiDoerTask of multiDoerTasks) {
                let task;
                if (typeof multiDoerTask.task === 'string') {
                    this.env.debug(context, this.moduleType, `Finding task '${multiDoerTask.task}'`);
                    task = this.env.getTask(multiDoerTask.task);
                }
                else {
                    task = multiDoerTask.task;
                }
                if (multiDoerTask.compileTask) {
                    task = yield object_compiler_1.ObjectCompiler.compile(task, context);
                }
                if (!task) {
                    this.env.debug(context, this.moduleType, `After compiling task there's nothing to do`);
                    continue;
                }
                this.env.debug(context, this.moduleType, `Finding doer '${task.doer}'`);
                const doer = this.env.getDoer(task.doer);
                yield doer.execute(context, task);
                context.lastTask = {
                    task,
                    input: context.calls[task.name] || null,
                    output: context.data[task.name] || null,
                    error: context.errors[task.name] || null
                };
                if (multiDoerTask.branch) {
                    this.env.debug(context, this.moduleType, 'Task executed with BranchConfig, compiling it');
                    const branchConfig = yield object_compiler_1.ObjectCompiler.compile(multiDoerTask.branch, context);
                    if (!branchConfig.taskName) {
                        this.env.debug(context, this.moduleType, 'No branch task given so doing nothing');
                    }
                    else {
                        this.env.debug(context, this.moduleType, `Branching to task '${branchConfig.taskName}'`);
                        const branchTask = this.env.getTask(branchConfig.taskName);
                        this.env.debug(context, this.moduleType, `Loading branch Doer '${branchTask.doer}'`);
                        const branchDoer = this.env.getDoer(branchTask.doer);
                        yield branchDoer.execute(context, branchTask);
                    }
                    if (branchConfig.haltAfterExecution) {
                        this.env.debug(context, this.moduleType, 'Halting after execution of Branch task');
                        break;
                    }
                }
                delete context.lastTask;
            }
        });
    }
}
exports.MultiDoer = MultiDoer;
//# sourceMappingURL=multi-doer.js.map