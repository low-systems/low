import { Module } from '../module';
import { Context, TaskConfig } from '../environment';
export declare class Connector extends Module {
    setup(): Promise<void>;
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
