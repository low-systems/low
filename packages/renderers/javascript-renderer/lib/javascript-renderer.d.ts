import { Renderer, RenderConfig, Context, IMap } from 'low';
export declare class JavascriptRenderer extends Renderer<JavascriptConfig, any, JavascriptTemplate> {
    functions: IMap<Function>;
    setup(): Promise<void>;
    registerFunctions(): void;
    core(func: Function, context: Context, metadata: any): Promise<any>;
    getTemplate(config: RenderConfig<JavascriptTemplate>, context: Context): Promise<any>;
    makeFunction(code: string): Function;
}
export interface JavascriptConfig {
    functions?: IMap<string>;
}
export declare type JavascriptTemplate = string | {
    name?: string;
    code: string;
};
