import { Environment } from './environment';
export declare class Module {
    private _env;
    readonly env: Environment;
    secrets: any;
    config: any;
    readonly moduleType: string;
    protected ready: boolean;
    readonly isReady: boolean;
    init(env: Environment): Promise<void>;
    setup(): Promise<void>;
    destroy(): Promise<void>;
}
