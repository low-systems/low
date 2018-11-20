import { CacheConfig } from './cache-managers/base-cache-manager';
export interface Map<T> {
    [key: string]: T;
}
export interface TaskConfig {
    name: string;
    daer: string;
    config: any;
    metaData: any;
    cacheConfig?: CacheConfig;
    specialProperties?: string | string[];
    tests?: TaskTestConfig[];
    sanityCheck?: TaskPropertyTest[];
}
export interface TaskResponse {
    command: 'CONTINUE' | 'HALT' | 'REROUTE';
    data: any;
    reroute?: string;
}
export interface TaskTestResult {
    success: boolean;
    errors: Error[];
}
export interface TaskTestConfig {
    mockEnvironment: any;
    mockJob: any;
}
export interface TaskTestLiteralConfig extends TaskTestConfig {
    expectedLiteral: any;
}
export interface TaskTestPropertiesConfig extends TaskTestConfig {
    expectedProperties: TaskPropertyTest[];
}
export interface TaskPropertyTest {
    path: string;
    type?: string;
    optional?: boolean;
    expectedValue?: any;
    jsonLogic?: any;
}
