import { JavascriptRenderer } from '@low-systems/javascript-renderer';
import { Context } from 'low';
export declare class AsyncJavascriptRenderer extends JavascriptRenderer {
    core(func: Function, context: Context, metadata: any): Promise<any>;
    makeFunction(code: string, name?: string): Function;
}
