import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
import { ObjectCompiler } from '../object-compiler';
import { ConnectorRunError } from './connector-run-error';
import { IMap } from '..';

//TODO: Question: Should this Connector be used to allow different Environment
//instances to communicate? What would that mean or involve? Probably way to
//specialised but food for thought at least

export class Connector<C, S, I> extends Module<C, S> {
  /**
   * Should not really be used by any child Connector
   */
  accessor: IMap<{ (input: any): Promise<any> }> = {}

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
    this.accessor[task.name] = async (input: any) => {
      const context = await this.runTask(task, input, config);
      const output = ObjectCompiler.compile(config, context);
      return output;
    };
  }

  async runTask(task: TaskConfig, input: I, config: any, data: any = {}, errors: TaskErrorMap = {}): Promise<ConnectorContext<I>> {
    const context: ConnectorContext<I> = {
      data,
      errors,
      connector: { input, config },
      env: this.env,
      calls: {}
    };
    try {
      const doer = this.env.getDoer(task.doer);
      await doer.execute(context, task);
    } catch(err) {
      throw new ConnectorRunError(err.message, context);
    }
    return context;
  }
}

export interface ConnectorContext<I> extends Context {
  connector: {
    input: I;
    config: any;
  };
  data: any;
  errors: TaskErrorMap;
  calls: any;
}

export interface TaskErrorMap {
  [taskName: string]: Error;
}