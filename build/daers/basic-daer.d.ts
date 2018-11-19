import { BaseDaer } from './base-daer';
import { Environment, Job } from '../environment';
import { TaskConfig, TaskResponse } from '../interfaces';
export declare class BasicDaer extends BaseDaer {
    constructor(env: Environment, name: string, ...args: any[]);
    core(job: Job, taskConfig: TaskConfig, coreConfig: any): Promise<TaskResponse>;
}
