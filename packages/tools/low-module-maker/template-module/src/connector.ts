import { Connector, TaskConfig } from 'low';

export class ConnectorMODULE_NAME extends Connector<MODULE_NAMEConfig, MODULE_NAMESecrets, MODULE_NAMEInput> {
  async setup() {
    console.warn('NOT YET IMPLEMENTED');
    await this.setupTasks();
  }

  async setupTask(task: TaskConfig, config: MODULE_NAMETaskConfig) {
    console.warn('NOT YET IMPLEMENTED');
  }

  async destroy() {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface MODULE_NAMEConfig {
  PLACE_HOLDER: any;
}

export interface MODULE_NAMESecrets {
  PLACE_HOLDER: any;
}

export interface MODULE_NAMETaskConfig {
  PLACE_HOLDER: any;
}

export interface MODULE_NAMEInput {
  PLACE_HOLDER: any;
}