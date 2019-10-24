"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
const object_compiler_1 = require("../object-compiler");
//TODO: Question: Should this Boundary be used to allow different Environment
//instances to communicate? What would that mean or involve? Probably way to
//specialised but food for thought at least
class Boundary extends module_1.Module {
    async setup() {
        for (const task of Object.values(this.env.tasks)) {
            if (task.boundaryConfigs && task.boundaryConfigs[this.moduleType]) {
                await this.setupTask(task, task.boundaryConfigs[this.moduleType]);
            }
        }
    }
    async setupTask(task, config) {
        //This is a hacky way of making a testable base Boundary module
        //that is accessible. `accessor` is not likely necessary in "real"
        //Boundary modules so I did not want it to be a real member.
        //I did not want the base modules to be abstract classes for
        //testing and usability reasons. Each base module is usable but
        //usually useless
        //TODO: Come up with a better way of doing this?
        if (!this.hasOwnProperty('accessor')) {
            this.accessor = {};
        }
        this.accessor[task.name] = async (input) => {
            const context = await this.runTask(task, input, config);
            const output = object_compiler_1.ObjectCompiler.compile(config, context);
            return output;
        };
    }
    async runTask(task, input, config) {
        const context = {
            env: this.env,
            boundary: {
                input,
                config
            },
            data: {},
            errors: {}
        };
        const doer = this.env.getDoer(task.doer);
        await doer.execute(context, task);
        return context;
    }
}
exports.Boundary = Boundary;
//# sourceMappingURL=boundary.js.map