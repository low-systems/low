import { Environment } from './environment';
export declare abstract class BaseModule {
    readonly name: string;
    private _env;
    readonly env: Environment;
    protected secrets: any;
    protected config: any;
    protected ready: boolean;
    readonly moduleType: string;
    readonly debugPath: string;
    constructor(name: string, ...args: any[]);
    private loadGlobalSecrets;
    triggerSetup(env: Environment): Promise<void>;
    setup(): Promise<void>;
    destroy(): Promise<void>;
    resolvePointer(pointer: string, ...args: any[]): any;
}
