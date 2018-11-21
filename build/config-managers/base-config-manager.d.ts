import { BaseModule } from '../base-module';
import { EnvironmentConfig } from '../environment';
export declare abstract class BaseConfigManager extends BaseModule {
    constructor(...args: any[]);
    setup(): Promise<void>;
    abstract setupListener(...args: any[]): Promise<void>;
    abstract saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean): Promise<void>;
}
