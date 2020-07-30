import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
import { IMap } from '..';
export declare class Connector<C, S, I> extends Module<C, S> {
    /**
     * Should not really be used by any child Connector
     */
    accessor: IMap<{
        (input: any): Promise<any>;
    }>;
    setup(): Promise<void>;
    setupTasks(): Promise<void>;
    setupTask(task: TaskConfig, config: any): Promise<void>;
    runTask(task: TaskConfig, input: I, config: any, data?: any, errors?: TaskErrorMap): Promise<ConnectorContext<I>>;
}
export interface ConnectorContext<I> extends Context {
    connector: {
        input: I;
        config: any;
    };
    data: any;
    errors: TaskErrorMap;
    calls: any;
}
export interface TaskErrorMap {
    [taskName: string]: Error;
}
