import { BaseModule } from '../base-module';
import { TaskConfig } from '../interfaces';
import { Environment, EnvironmentConfig } from '../environment';

export abstract class BaseConfigManager extends BaseModule {
  async setup(): Promise<void> {
    await this.setupListener();
  }
  abstract async setupListener(...args: any[]): Promise<void>; 
  abstract async saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean): Promise<void>;
}