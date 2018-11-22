import { ParserConfig } from '../parsers/base-parser';
import { BaseModule } from '../base-module';
import { Environment, Job } from '../environment';
import dot = require('dot-object');

export abstract class BaseRenderer extends BaseModule {
  async render(config: RenderConfig, job: Job): Promise<any> {
    const context = this.buildContext(config, job);
    const template = this.getTemplate(config, job);
    const rendered = await this.core(template, context);
    const parsed = await this.parseRendered(rendered, config);

    return parsed;
  }

  buildContext(config: RenderConfig, job: Job): RenderContext {
    return {
      env: this.env,
      job, 
      metaData: config.metaData || {}
    };
  }

  getTemplate(config: RenderConfig, job: Job): any {
    if (!config.template && !config.templatePath) {
      throw new Error('No template or path provided');
    }

    let template: any = config.template || null;
    if (config.templatePath) {
      template = dot.pick(config.templatePath, this.config);
      if (!template) {
        template = dot.pick(config.templatePath, this.env);
      }
      if (!template) {
        template = dot.pick(config.templatePath, job);
      }
    }

    if (!template) {
      throw new Error('No template could be loaded');
    }

    return template;
  }

  async parseRendered(rendered: any, config: RenderConfig): Promise<any> {
    if (config.parser) {
      const parser = this.env.getParser(config.parser);
      rendered = await parser.parse(rendered, config.parserConfig || {});
    }
    return rendered;
  }

  async core(template: any, context: RenderContext): Promise<any> {
    return template;
  }
}

export interface RenderConfig {
  renderer: string;
  template?: any;
  templatePath?: string;
  parser?: string;
  parserConfig?: ParserConfig<any>;
  metaData?: any;
}

export interface RenderContext {
  env: Environment;
  job: Job;
  metaData: any;
}