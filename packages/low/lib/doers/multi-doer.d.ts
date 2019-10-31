import { Doer } from './doer';
import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
export declare class MultiDoer extends Doer {
    main(context: ConnectorContext, taskConfig: TaskConfig, multiDoerTasks: MultiDoerTask[]): Promise<any>;
}
export interface MultiDoerTask {
    task: TaskConfig;
    branch?: any;
}
export interface BranchConfig {
    taskName: string;
    haltAfterExecution: boolean;
}
