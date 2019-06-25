"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const doer_1 = require("./doer");
class MultiDoer extends doer_1.Doer {
    async main(context, taskConfig, tasks) {
        for (const task of tasks) {
            const doer = this.env.getDoer(task.doer);
            await doer.execute(context, task);
        }
    }
}
exports.MultiDoer = MultiDoer;
//# sourceMappingURL=multi-doer.js.map