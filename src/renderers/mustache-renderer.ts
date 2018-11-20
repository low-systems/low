import { Map } from '../interfaces';
import { BaseRenderer, RenderContext } from './base-renderer';
import { Environment } from '../environment';

import * as mustache from 'mustache';

export class MustacheRenderer extends BaseRenderer {
  constructor(name: string, private partials: Map<string> = {}) {
    super(name);
  }

  async core(template: any, context: RenderContext): Promise<string> {
    if (typeof template !== 'string') {
      throw new Error('Mustache templates must be strings');
    }

    const output = mustache.render(template, context, this.partials);
    return output;
  }
}