import { BaseConfigManager } from './base-config-manager'; 
import { Environment, EnvironmentConfig } from '../environment';

export class OneOffConfigManager extends BaseConfigManager {
  constructor(config: EnvironmentConfig) {
    super();
  }

  async setupListener(callback: (config: EnvironmentConfig) => Promise<void>, config: EnvironmentConfig): Promise<void> {
    await callback(config);
  }
  
  async saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean | undefined): Promise<void> {
    throw new Error("Saving is not allowed when using the One Off Config Manager");
  }
}