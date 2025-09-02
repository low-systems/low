import { JavascriptRenderer } from '../javascript-renderer/javascript-renderer';
import { Context } from '../../index';
export declare class SyncJavascriptRenderer extends JavascriptRenderer {
    core(func: Function, context: Context, metadata: any): Promise<any>;
    makeFunction(code: string, name?: string): Function;
    wrapCode(code: string, name?: string): string;
}
