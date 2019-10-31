import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
import { ObjectCompiler } from '../object-compiler';

//TODO: Question: Should this Connector be used to allow different Environment
//instances to communicate? What would that mean or involve? Probably way to
//specialised but food for thought at least

export class Connector<C, S> extends Module<C, S> {
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

  async setupTask(task: TaskConfig, config: any) {
    //This is a hacky way of making a testable base Connector module
    //that is accessible. `accessor` is not likely necessary in "real"
    //Connector modules so I did not want it to be a real member.
    //I did not want the base modules to be abstract classes for
    //testing and usability reasons. Each base module is usable but
    //usually useless
    //TODO: Come up with a better way of doing this?
    if (!this.hasOwnProperty('accessor')) {
      (this as any).accessor = {};
    }
    (this as any).accessor[task.name] = async (input: any) => {
      const context = await this.runTask(task, input, config);
      const output = ObjectCompiler.compile(config, context);
      return output;
    };
  }

  async runTask(task: TaskConfig, input: any, config: any): Promise<ConnectorContext> {
    const context: ConnectorContext = {
      env: this.env,
      connector: {
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

export interface ConnectorContext extends Context {
  connector: {
    input: any;
    config: any;
  };
  data: any;
  errors: { [taskName: string]: Error };
}