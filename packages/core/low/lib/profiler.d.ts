export declare class Profiler implements ProfilerConfig {
    enabled: boolean;
    size: number;
    private _items;
    get items(): ProfilerItem[];
    constructor(config?: ProfilerConfig);
    profile(task: string, doer: string, hasError: boolean, fromCache: boolean, start: Date, end: Date, requestId?: string): void;
}
export interface ProfilerConfig {
    enabled: boolean;
    size: number;
}
export interface ProfilerItem {
    requestId: string;
    task: string;
    doer: string;
    hasError: boolean;
    fromCache: boolean;
    start: string;
    end: string;
    executionTimeMs: number;
}
