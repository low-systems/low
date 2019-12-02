import * as Handlebars from 'handlebars';
import { Renderer, RenderConfig, Context } from 'low';
export declare class HandlebarsRenderer extends Renderer<HandlebarsConfig, any> {
    hbs: typeof Handlebars;
    templates: TemplateMap;
    constructor(hbs?: typeof Handlebars);
    setup(): Promise<void>;
    registerTemplates(): void;
    registerPartials(): void;
    core(template: Handlebars.TemplateDelegate, context: Context): Promise<any>;
    getTemplate(config: RenderConfig, context: Context): Promise<any>;
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
