import { Doer, TaskConfig, ConnectorContext } from 'low';

export class DoerMODULE_NAME extends Doer<MODULE_NAMEConfig, MODULE_NAMESecrets> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: any): Promise<any> {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface MODULE_NAMEConfig {
  PLACE_HOLDER: any;
}

export interface MODULE_NAMESecrets{
  PLACE_HOLDER: any;
}