"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../module");
const object_compiler_1 = require("../object-compiler");
const connector_run_error_1 = require("./connector-run-error");
//TODO: Question: Should this Connector be used to allow different Environment
//instances to communicate? What would that mean or involve? Probably way to
//specialised but food for thought at least
class Connector extends module_1.Module {
    async setup() {
        await this.setupTasks();
    }
    async setupTasks() {
        for (const task of Object.values(this.env.tasks)) {
            if (task.connectorConfigs && task.connectorConfigs[this.moduleType]) {
                await this.setupTask(task, task.connectorConfigs[this.moduleType]);
            }
        }
    }
    async setupTask(task, config) {
        //This is a hacky way of making a testable base Connector module
        //that is accessible. `accessor` is not likely necessary in "real"
        //Connector modules so I did not want it to be a real member.
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
    async runTask(task, input, config, data = {}, errors = {}) {
        const context = {
            data,
            errors,
            connector: { input, config },
            env: this.env
        };
        try {
            const doer = this.env.getDoer(task.doer);
            await doer.execute(context, task);
        }
        catch (err) {
            throw new connector_run_error_1.ConnectorRunError(err.message, context);
        }
        return context;
    }
}
exports.Connector = Connector;
//# sourceMappingURL=connector.js.map