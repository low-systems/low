import { EventEmitter } from 'events';

import { Utility } from "./utilities";
import { CacheConfig, IMap } from ".";
import { Module } from "./module";
import { Doer } from "./doers/doer";

export class TaskManager extends Module {
  /**
   * A map of all available task configurations [[TaskConfig]]
   */
  tasks: { [namespace: string]: { [name: string]: TaskConfig } } = {};

  registerTask(taskConfig: TaskConfig, force = false) {
    const report: RegisterTaskReport = {
      task: taskConfig,
      overwritten: [],
      alreadyExists: [],
      registered: []
    };

    if (Utility.isEmpty(taskConfig.namespaces)) {
      taskConfig.namespaces = ['global'];
    }

    //HACK: Cheeky hack, abusing Array.filter() as a forEach()
    const namespaces = taskConfig.namespaces.filter(namespace => {
      if (!(namespace in this.tasks)) {
        this.tasks[namespace] = {};
      }
      return typeof namespace === 'string' && namespace.trim().length === 0;
    });

    //TODO: Refactor the below. I'm trying to help the Connector out with it's event listener and
    //      namespaces. Connector's listen to TaskManager.RegisterTask and use the report.
    //      Think the report needs changed to { task: TaskConfig, errors: boolean, statuses: { namespace: string, status: Enum<Registered, Overwritten, AlreadyExists> } }

    //TODO: Need to remove namespaces in TaskConfig that a task wasn't registered to
    for (const namespace of taskConfig.namespaces) {
      if (typeof namespace !== 'string' || namespace.trim().length === 0) {
        continue;
      }

      if (!this.tasks.hasOwnProperty(namespace)) {
        this.tasks[namespace] = {};
      }

      if (this.tasks[namespace].hasOwnProperty(taskConfig.name)) {
        if (force) {
          report.overwritten.push(namespace);
        } else {
          report.alreadyExists.push(namespace);
          continue;
        }
      } else {
        report.registered.push(namespace);
      }

      this.tasks[namespace][taskConfig.name] = taskConfig;
    }

    return report;
  }

  unregisterTask(namespaces: string[], name: string) {
    const report: UnregisterTaskReport = {
      name, namespaces, unregistered: [], doesNotExist: []
    }

    for (const namespace of namespaces) {
      if (!this.tasks.hasOwnProperty(namespace) || !this.tasks[namespace].hasOwnProperty(name)) {
        report.doesNotExist.push(namespace);
      } else {
        delete this.tasks[namespace][name];
        report.unregistered.push(namespace);
      }
    }

    return report;
  }

  getTask(namespaces: string[], name: string) {
    for (const namespace of namespaces) {
      if (this.tasks.hasOwnProperty(namespace) && this.tasks[namespace].hasOwnProperty(name)) {
        return this.tasks[namespace][name];
      }
    }

    throw new Error(`Invalid task '[${namespaces.join(', ')}].${name}'`);
  }
}

export class Subroutine extends EventEmitter {
  constructor(private input: any, private doer: Doer, private events: IMap<any>) {
    super();
  }

  async run() {
    await this.doer.main(1);

  }


}

export interface TaskConfig {
  namespaces: string[];
  name: string;
  doer: string;
  config: any;
  metadata: any;
  cacheConfig?: CacheConfig;
  connectorConfigs?: { [connectorName: string]: any };
  specialProperties?: string[];
  throwError?: boolean;
}

export interface RegisterTaskReport {
  task: TaskConfig;
  overwritten: string[];
  alreadyExists: string[];
  registered: string[];
}

export interface UnregisterTaskReport {
  namespaces: string[];
  name: string;
  unregistered: string[];
  doesNotExist: string[];
}

export interface Events {
  [event: string]: any[]
}