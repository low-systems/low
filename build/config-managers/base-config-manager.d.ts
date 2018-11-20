import { BaseModule } from '../base-module';
import { EnvironmentConfig } from '../environment';
export declare abstract class BaseConfigManager extends BaseModule {
    constructor(...args: any[]);
    abstract setupListener(callback: (config: EnvironmentConfig) => Promise<void>, ...args: any[]): Promise<void>;
    abstract saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean): Promise<void>;
}
