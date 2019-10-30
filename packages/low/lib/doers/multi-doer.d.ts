import { Doer } from './doer';
import { BoundaryContext } from '../boundaries/boundary';
import { TaskConfig } from '../environment';
export declare class MultiDoer extends Doer {
    main(context: BoundaryContext, taskConfig: TaskConfig, multiDoerTasks: MultiDoerTask[]): Promise<any>;
}
export interface MultiDoerTask {
    task: TaskConfig;
    branch?: any;
}
export interface BranchConfig {
    taskName: string;
    haltAfterExecution: boolean;
}
