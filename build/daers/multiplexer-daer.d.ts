import { BaseDaer } from './base-daer';
import { Job } from '../environment';
import { TaskConfig, TaskResponse } from '../interfaces';
export declare class MultiplexerDaer extends BaseDaer {
    core(job: Job, taskConfig: TaskConfig, coreConfig: MultiplexerConfig, path: string[]): Promise<TaskResponse>;
    createResult(index: number, config?: TaskConfig, duration?: number, error?: string): MultiplexerTaskResult;
}
export interface MultiplexerConfig {
    concurrent: boolean;
    breakOnError: boolean;
    tasks: (TaskConfig | string)[];
}
export interface MultiplexerTaskResult {
    taskName?: string;
    daer?: string;
    index: number;
    success: boolean;
    duration?: number;
    error?: string;
}
