import { EventAndListener } from 'eventemitter2';

import { Module } from '../module';
import { Context } from '../environment';
import { ObjectCompiler } from '../object-compiler';
import { ConnectorRunError } from './connector-run-error';
import { IMap } from '..';
import { Doer } from '../doers/doer';
import { RegisterTaskReport, TaskConfig } from '../task-manager';

//TODO: The connector will create execution contexts that listen for commands that can bubble up from
//      Sub tasks

export class Connector extends Module {


  async setup() {
    await this.setupTasks();
  }

  async setupTasks() {
    this.env.on(`TaskManager.RegisterTask`, this.registerTaskHandler.bind(this));
  }

  protected async registerTaskHandler(event: EventAndListener, report: RegisterTaskReport) {
    const task = report.task;

    if (!task.connectorConfigs || !(this.moduleType in Object.keys(task.connectorConfigs))) {
      //No matching ConnectorConfigs on TaskConfig
      return;
    }

    if (report.registered.length === 0 && report.overwritten.length === 0) {
      //No task actually registered
      return;
    }

    await this.setupTask(task, task.connectorConfigs[this.moduleType]);
  }

  async setupTask(task: TaskConfig, config: any) {
    //TODO: This is going to be the intercommunication connector! Setup event monitoring for each
    //      task (one per namespace)
    this.env.on(`Connector.Run.`, )
  }

  //TODO: This needs to be passed a namespace and an optional context (it creates an empty one if
  //      one does not exist)
  async runTask(task: TaskConfig, input: any, config: any, data: any = {}, errors: TaskErrorMap = {}): Promise<ConnectorContext<any>> {
    const context: ConnectorContext<any> = {
      data,
      errors,
      connector: { input, config },
      env: this.env
    };
    try {
      const doer = this.env.moduleManager.getModule<Doer>(task.doer);
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
}

export interface TaskErrorMap {
  [taskName: string]: Error;
}