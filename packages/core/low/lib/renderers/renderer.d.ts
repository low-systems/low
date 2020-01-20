import { Module } from '../module';
import { ParserConfig } from '../parsers/parser';
import { Context } from '../environment';
import { CacheConfig } from '../cache-managers/cache-manager';
export declare class Renderer<C, S, T> extends Module<C, S> {
    render(config: RenderConfig<T>, context: Context): Promise<any>;
    getTemplate(config: RenderConfig<T>, context: Context): Promise<any>;
    parseRendered(rendered: any, config: RenderConfig<T>): Promise<any>;
    core(template: any, context: Context, metadata: any): Promise<any>;
}
export interface RenderConfig<T> {
    __renderer?: string;
    __template: T;
    __parser?: string;
    __parserConfig?: ParserConfig<any>;
    __metadata?: any;
    __cacheConfig?: CacheConfig;
    __spread?: true;
    __key?: RenderConfig<any>;
}
