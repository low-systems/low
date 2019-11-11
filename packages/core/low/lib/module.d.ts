import { Environment } from './environment';
export declare class Module<C, S> {
    private _env;
    get env(): Environment;
    private _config;
    get config(): C;
    private _secrets;
    get secrets(): S;
    get moduleType(): string;
    private _ready;
    get isReady(): boolean;
    init(env: Environment): Promise<void>;
    setup(): Promise<void>;
    destroy(): Promise<void>;
}
