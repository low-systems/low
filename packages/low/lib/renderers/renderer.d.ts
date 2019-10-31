import { Module } from '../module';
import { ParserConfig } from '../parsers/parser';
import { Context } from '../environment';
import { CacheConfig } from '../cache-managers/cache-manager';
export declare class Renderer<C, S> extends Module<C, S> {
    render(config: RenderConfig, context: Context): Promise<any>;
    getTemplate(config: RenderConfig, context: Context): Promise<any>;
    parseRendered(rendered: any, config: RenderConfig): Promise<any>;
    core(template: any, context: Context): Promise<any>;
}
export interface RenderConfig {
    __renderer: string;
    __template: any;
    __parser?: string;
    __parserConfig?: ParserConfig<any>;
    __metaData?: any;
    __cacheConfig?: CacheConfig;
}
