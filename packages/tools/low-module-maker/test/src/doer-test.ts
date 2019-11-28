import { Doer, TaskConfig, ConnectorContext } from 'low';

export class DoerTest extends Doer<TestConfig, TestSecrets> {
  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: any): Promise<any> {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface TestConfig {
  PLACE_HOLDER: any;
}

export interface TestSecrets{
  PLACE_HOLDER: any;
}