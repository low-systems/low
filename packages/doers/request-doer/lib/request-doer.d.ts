import * as Request from 'request-promise-native';
import { Doer, TaskConfig, ConnectorContext } from 'low';
export declare class RequestDoer extends Doer<any, any> {
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: Request.Options): Promise<any>;
}
