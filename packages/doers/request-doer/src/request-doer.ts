import * as Request from 'request-promise-native';

import { Doer, TaskConfig, ConnectorContext } from 'low';

export class RequestDoer extends Doer<any, any> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: Request.Options): Promise<any> {
    return await Request(coreConfig);
  }
}
