import { BaseConfigManager } from './base-config-manager';
import { EnvironmentConfig } from '../environment';
export declare class OneOffConfigManager extends BaseConfigManager {
    constructor(config: EnvironmentConfig);
    setupListener(callback: (config: EnvironmentConfig) => Promise<void>, config: EnvironmentConfig): Promise<void>;
    saveConfiguration(config: EnvironmentConfig, updateVersion?: boolean | undefined): Promise<void>;
}
