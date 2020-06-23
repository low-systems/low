import { Module } from '../module';
import { ParserConfig } from '../parsers/parser';
import { Context } from '../environment';
import { CacheConfig, CacheManager, CacheKey } from '../cache-managers/cache-manager';
import { ObjectCompiler } from '../object-compiler';

export class Renderer<C, S, T> extends Module<C, S> {
  async render(config: RenderConfig<T>, context: Context): Promise<any> {
    let cacheManager: CacheManager<any, any> | undefined;
    let cacheKey: CacheKey | undefined;

    if (config.__cacheConfig) {
      cacheManager = this.env.getCacheManager(config.__cacheConfig.cacheManager);
      cacheKey = await cacheManager.makeKey(config.__cacheConfig, context);
      const cachedItem = await cacheManager.getItem(cacheKey);
      if (cachedItem !== null) {
        return cachedItem;
      }
    }

    const template = await this.getTemplate(config, context);
    const metadata = await ObjectCompiler.compile(config.__metadata || {}, context);
    const rendered = await this.core(template, context, metadata);
    const parsed = await this.parseRendered(rendered, config);

    if (cacheManager && cacheKey) {
      await cacheManager.setItem(cacheKey, parsed, (config.__cacheConfig as CacheConfig).ttl);
    }

    return parsed;
  }

  async getTemplate(config: RenderConfig<T>, context: Context): Promise<any> {
    return config.__template;
  }

  async parseRendered(rendered: any, config: RenderConfig<T>): Promise<any> {
    if (config.__parser) {
      const parser = this.env.getParser(config.__parser);
      const parsed = await parser.parse(rendered, config.__parserConfig || {});
      return parsed;
    } else {
      return rendered;
    }
  }

  async core(template: any, context: Context, metadata: any): Promise<any> {
    return template;
  }
}

export interface RenderConfig<T> {
  __renderer?: string;
  __template: T;
  __parser?: string;
  __parserConfig?: ParserConfig<any>;
  __metadata?: any;
  __cacheConfig?: CacheConfig;
  __spread?: true;
  __key?: RenderConfig<any>
}