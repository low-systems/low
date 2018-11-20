import { Map } from '../interfaces';
import { BaseRenderer, RenderContext } from './base-renderer';
export declare class MustacheRenderer extends BaseRenderer {
    private partials;
    constructor(name: string, partials?: Map<string>);
    core(template: any, context: RenderContext): Promise<string>;
}
