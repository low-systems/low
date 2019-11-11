import { Renderer, Context } from 'low';

export class RendererMODULE_NAME extends Renderer<MODULE_NAMEConfig, MODULE_NAMESecrets> {
  async core(template: any, context: Context): Promise<any> {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface MODULE_NAMEConfig {
  PLACE_HOLDER: any;
}

export interface MODULE_NAMESecrets {
  PLACE_HOLDER: any;
}