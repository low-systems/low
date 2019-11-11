export declare function createModule(config: ModuleConfig): void;
export declare function dasherise(input: string): string;
export interface ModuleConfig {
    type: ModuleType;
    name: string;
    outputDir: string;
    organisation?: string;
    description?: string;
    author?: string;
    authorUrl?: string;
    homepage?: string;
    repository?: string;
}
export declare type ModuleType = 'CacheManager' | 'Connector' | 'Doer' | 'Parser' | 'Renderer';
