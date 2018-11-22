import { BaseDaer } from './base-daer';
import { Job } from '../environment';
import { TaskConfig, TaskResponse } from '../interfaces';
export declare class BasicDaer extends BaseDaer {
    core(job: Job, taskConfig: TaskConfig, coreConfig: any): Promise<TaskResponse>;
}