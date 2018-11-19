import { Environment } from './environment';
export declare class BaseModule {
    readonly env: Environment;
    readonly name: string;
    readonly secrets: any;
    readonly config: any;
    readonly moduleType: string;
    readonly debugPath: string;
    constructor(env: Environment, name: string, ...args: any[]);
    destroy(): void;
    resolvePointer(pointer: string, ...args: any[]): any;
}
