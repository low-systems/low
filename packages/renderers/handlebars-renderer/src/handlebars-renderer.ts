import * as Handlebars from 'handlebars';

import { Renderer, RenderConfig, Context } from 'low';

export class HandlebarsRenderer extends Renderer<HandlebarsConfig, any, HandlebarsTemplate> {
  templates: TemplateMap = {};

  constructor(public hbs: typeof Handlebars = Handlebars.create()) { super(); }

  async setup() {
    this.registerTemplates();
    this.registerPartials();
  }

  registerTemplates() {
    if (this.config.templates) {
      for (const [name, contents] of Object.entries(this.config.templates)) {
        const template = this.hbs.compile(contents);
        this.templates[name] = template;
      }
    }
  }

  registerPartials() {
    if (this.config.partials) {
      for (const [name, contents] of Object.entries(this.config.partials)) {
        const template = this.hbs.compile(contents);
        this.hbs.registerPartial(name, template);
      }
    }
  }

  async core(template: Handlebars.TemplateDelegate, context: Context, metadata: any): Promise<any> {
    context.templateMetadata = metadata;
    const output = template(context, { allowProtoPropertiesByDefault: true });
    delete context.templateMetadata;

    return output;
  }

  async getTemplate(config: RenderConfig<HandlebarsTemplate>, context: Context): Promise<any> {
    if (typeof config.__template === 'string') {
      if (this.templates.hasOwnProperty(config.__template)) {
        return this.templates[config.__template];
      }
      throw new Error(`Pre-registered template '${config.__template}' could not be found`);
    } else if (typeof config.__template === 'object' && config.__template !== null) {
      if (typeof config.__template.name === 'string' && this.templates.hasOwnProperty(config.__template.name)) {
        return this.templates[config.__template.name];
      }

      const compiledTemplate = this.hbs.compile(config.__template.code);

      if (typeof config.__template.name === 'string') {
        this.templates[config.__template.name] = compiledTemplate;
      }

      return compiledTemplate;
    } else {
      throw new Error(`Invalid Handlebars template. Templates must either be the name of a pre-compiled template or contain an object with a 'code' property that`);
    }
  }
}

export interface HandlebarsConfig {
  templates?: HandlebarsMap;
  partials?: HandlebarsMap;
}

export interface HandlebarsMap {
  [name: string]: string;
}

export interface TemplateMap {
  [name: string]: Handlebars.TemplateDelegate;
}

export type HandlebarsTemplate = string | {
  name?: string;
  code: string;
};