import { BaseDaer } from './base-daer';
import { Environment, Job } from '../environment';
import { TaskConfig, TaskResponse } from '../interfaces';

export class BasicDaer extends BaseDaer {
  constructor(env: Environment, name: string, ...args: any[]) {
    super(env, name, ...args);
  }

  async core(job: Job, taskConfig: TaskConfig, coreConfig: any): Promise<TaskResponse> {
    return {
      command: 'CONTINUE',
      data: coreConfig
    };
  }
}