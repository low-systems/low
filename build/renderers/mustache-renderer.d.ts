import { Map } from '../interfaces';
import { BaseRenderer, RenderContext } from './base-renderer';
import { Environment } from '../environment';
export declare class MustacheRenderer extends BaseRenderer {
    private partials;
    constructor(env: Environment, name: string, partials?: Map<string>);
    core(template: any, context: RenderContext): Promise<string>;
}
