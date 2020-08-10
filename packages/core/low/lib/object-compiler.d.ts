import { Context } from './environment';
export declare class ObjectCompiler {
    static isTemplate(property: any): boolean;
    static compile(config: any, context: Context, specialProperties?: string[]): Promise<any>;
    static compileProperty(property: any, context: Context): Promise<any>;
    static resolvePointer(property: any, context: Context): any;
    static objectPathCache: {
        [path: string]: Function;
    };
    static objectPath(obj: any, path: string): any;
    static isObject(obj: any): boolean;
}
