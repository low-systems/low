import { Doer } from './doer';
import { ConnectorContext } from '../connectors/connector';
import { TaskConfig } from '../environment';
export declare class MultiDoer<C, S> extends Doer<C, S> {
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, multiDoerTasks: MultiDoerTask[]): Promise<any>;
}
export interface MultiDoerTask {
    compileTask?: boolean;
    task: TaskConfig | string;
    branch?: any;
}
export interface BranchConfig {
    taskName?: string;
    haltAfterExecution?: boolean;
}
