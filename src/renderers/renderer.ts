import { Module } from '../module';
import { ParserConfig } from '../parsers/parser';
import { Context, } from '../environment';

export class Renderer extends Module {
  async render(config: RenderConfig, context: Context): Promise<any> {
    const template = await this.getTemplate(config, context);
    const rendered = await this.core(template, context);
    const parsed = await this.parseRendered(rendered, config);

    return parsed;
  }

  async getTemplate(config: RenderConfig, context: Context): Promise<any> {
    return config.__template;
  }

  async parseRendered(rendered: any, config: RenderConfig): Promise<any> {
    if (config.__parser) {
      const parser = this.env.getParser(config.__parser);
      rendered = await parser.parse(rendered, config.__parserConfig || {});
    }
    return rendered;
  }

  async core(template: any, context: Context): Promise<any> {
    return template;
  }
}

export interface RenderConfig {
  __renderer: string;
  __template: any;
  __parser?: string;
  __parserConfig?: ParserConfig<any>;
  __metaData?: any;
}