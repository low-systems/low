import { BaseModule } from '../base-module';
import { TaskConfig } from '../interfaces';
import { Environment, EnvironmentConfig } from '../environment';

export abstract class BaseConfigManager extends BaseModule {
  constructor(...args: any[]) {
    super('config-manager', ...args);
    this.setupListener(this.env.loadConfig, ...args);
  }
  abstract async setupListener(callback: (config: EnvironmentConfig) => Promise<void>, ...args: any[]): Promise<void>; 
  abstract async saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean): Promise<void>;
}