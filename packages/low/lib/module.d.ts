import { Environment } from './environment';
export declare class Module<C, S> {
    private _env;
    readonly env: Environment;
    private _config;
    readonly config: C;
    private _secrets;
    readonly secrets: S;
    readonly moduleType: string;
    protected ready: boolean;
    readonly isReady: boolean;
    init(env: Environment): Promise<void>;
    setup(): Promise<void>;
    destroy(): Promise<void>;
}
