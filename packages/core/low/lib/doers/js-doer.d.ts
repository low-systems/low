import { Doer } from './doer';
import { ConnectorContext, Environment } from '..';
export declare class JSDoer extends Doer<JSDoerConfig, any> {
    moduleContext: any;
    module: any;
    modules: any;
    setup(): Promise<void>;
    loadCode(code: any): Promise<void>;
    main(context: any, taskConfig: any, config: any): Promise<any>;
}
export type JSModuleFunction = (env: Environment, context: ConnectorContext<any>, parameters: any) => Promise<any>;
export interface JSDoerConfig {
    code: string;
}
