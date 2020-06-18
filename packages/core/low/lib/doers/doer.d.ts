import { Module } from '../module';
import { TaskConfig } from '../environment';
import { ConnectorContext } from '../connectors/connector';
export declare class Doer<C, S> extends Module<C, S> {
    execute(context: ConnectorContext<any>, task: TaskConfig): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: any): Promise<any>;
    serialiseError(err: Error): any;
}
