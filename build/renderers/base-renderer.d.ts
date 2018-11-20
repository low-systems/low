import { ParserConfig } from '../parsers/base-parser';
import { BaseModule } from '../base-module';
import { Environment, Job } from '../environment';
export declare abstract class BaseRenderer extends BaseModule {
    constructor(name: string, ...args: any[]);
    render(config: RenderConfig, job: Job): Promise<any>;
    buildContext(config: RenderConfig, job: Job): RenderContext;
    getTemplate(config: RenderConfig, job: Job): any;
    parseRendered(rendered: any, config: RenderConfig): Promise<any>;
    core(template: any, context: RenderContext): Promise<any>;
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
