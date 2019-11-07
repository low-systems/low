import { Renderer, Context } from 'low';

export class RendererHandlebars extends Renderer<HandlebarsConfig, HandlebarsSecrets> {
  async core(template: any, context: Context): Promise<any> {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface HandlebarsConfig {
  PLACE_HOLDER: any;
}

export interface HandlebarsSecrets {
  PLACE_HOLDER: any;
}