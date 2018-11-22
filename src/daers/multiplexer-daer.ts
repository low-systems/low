import { BaseDaer } from './base-daer';
import { Environment, Job } from '../environment';
import { TaskConfig, TaskResponse } from '../interfaces';
import { Exception } from '../exception';

export class MultiplexerDaer extends BaseDaer {
  async core(job: Job, taskConfig: TaskConfig, coreConfig: MultiplexerConfig, path: string[]): Promise<TaskResponse> {
    const results: MultiplexerTaskResult[] = [];

    for (let [index, subConfig] of Object.entries(coreConfig.tasks)) {
      try {
        if (typeof subConfig === 'string') {
          subConfig = this.resolvePointer(subConfig, this.env, job) as TaskConfig;  
        }
        const daer = this.env.getDaer(subConfig.daer);
        await daer.execute(job, subConfig, [...path]);
        const result = this.createResult(Number(index), subConfig, undefined, undefined);
        results.push(result);
      } catch(err) {
        const result = this.createResult(Number(index), undefined, undefined, err.message);
        results.push(result);
        if (coreConfig.breakOnError) {
          throw new Exception('An error occurred in a sub-task of a multiplexer.', err, { resultsSoFar: results });
        }
      }
    }

    return {
      data: {
        _results: results
      } 
    }
  }

  createResult(index: number, config?: TaskConfig, duration?: number, error?: string): MultiplexerTaskResult {
    return {
      error,
      taskName: config && config.name,
      daer: config && config.daer,
      index: index,
      success: !error,
      duration: duration
    }
  }
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