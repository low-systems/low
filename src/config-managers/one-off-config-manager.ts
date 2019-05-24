import { BaseConfigManager } from './base-config-manager';
import { Environment, EnvironmentConfig } from '../environment';

export class OneOffConfigManager extends BaseConfigManager {
  constructor(private environmentConfig: EnvironmentConfig) {
    super();
  }

  async setupListener(config: EnvironmentConfig): Promise<void> {
    await this.env.loadConfig(config || this.environmentConfig);
  }

  async saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean | undefined): Promise<void> {
    console.log("Warning: Saving is not allowed when using the One Off Config Manager");
    await this.env.loadConfig(config);
  }
}