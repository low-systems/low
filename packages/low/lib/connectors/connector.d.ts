import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
export declare class Connector<C, S> extends Module<C, S> {
    setup(): Promise<void>;
    setupTasks(): Promise<void>;
    setupTask(task: TaskConfig, config: any): Promise<void>;
    runTask(task: TaskConfig, input: any, config: any): Promise<ConnectorContext>;
}
export interface ConnectorContext extends Context {
    connector: {
        input: any;
        config: any;
    };
    data: any;
    errors: {
        [taskName: string]: Error;
    };
}
