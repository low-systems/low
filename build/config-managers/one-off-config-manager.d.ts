import { BaseConfigManager } from './base-config-manager';
import { EnvironmentConfig } from '../environment';
export declare class OneOffConfigManager extends BaseConfigManager {
    private environmentConfig;
    constructor(environmentConfig: EnvironmentConfig);
    setupListener(config: EnvironmentConfig): Promise<void>;
    saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean | undefined): Promise<void>;
}
