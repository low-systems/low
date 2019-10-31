import { Module } from '../module';
import { TaskConfig } from '../environment';
import { ConnectorContext } from '../connectors/connector';
export declare class Doer<C, S> extends Module<C, S> {
    execute(context: ConnectorContext, task: TaskConfig): Promise<void>;
    main(context: ConnectorContext, taskConfig: TaskConfig, coreConfig: any): Promise<any>;
}
