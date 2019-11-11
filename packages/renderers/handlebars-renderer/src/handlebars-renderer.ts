import * as Handlebars from 'handlebars';

import { Renderer, RenderConfig, Context } from 'low';

export class HandlebarsRenderer extends Renderer<HandlebarsConfig, any> {
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

  async core(template: Handlebars.TemplateDelegate, context: Context): Promise<any> {
    const output = template(context);
    return output;
  }

  async getTemplate(config: RenderConfig, context: Context): Promise<any> {
    if (typeof config.__template === 'string') {
      return this.hbs.compile(config.__template);
    } else if (typeof config.__template === 'object' && config.__template !== null && typeof config.__template.name === 'string') {
      if (this.templates.hasOwnProperty(config.__template.name)) {
        return this.templates[config.__template.name];
      } else {
        throw new Error(`Pre-compiled template '${config.__template.name}' could not be found`);
      }
    } else {
      throw new Error('Invalid Handlebars template. Templates must either be a string or contain an object with a name property that points to a pre-compiled template');
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