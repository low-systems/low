import { BaseDoer } from './base-doer';
import { Environment, Job } from '../environment';
import { TaskConfig, TaskResponse } from '../interfaces';

export class BasicDoer extends BaseDoer {
  async main(job: Job, taskConfig: TaskConfig, coreConfig: any): Promise<TaskResponse> {
    return {
      data: coreConfig
    };
  }
}