import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
import { ObjectCompiler } from '../object-compiler';

export class Boundary extends Module {
  async setup() {
    for (const task of Object.values(this.env.tasks)) {
      if (task.boundaryConfigs && task.boundaryConfigs[this.moduleType]) {
        await this.setupTask(task, task.boundaryConfigs[this.moduleType]);
      }
    }
  }

  async setupTask(task: TaskConfig, config: any) {
    //This is a hacky way of making a testable base Boundary module
    //that is accessible. `accessor` is not likely necessary in "real"
    //Boundary modules so I did not want it to be a real member.
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

  async runTask(task: TaskConfig, input: any, config: any): Promise<BoundaryContext> {
    const context: BoundaryContext = {
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

export interface BoundaryContext extends Context {
  boundary: {
    input: any;
    config: any;
  };
  data: any;
  errors: { [taskName: string]: Error };
}