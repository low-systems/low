import { Environment } from '../environment';
import { BaseModule } from '../base-module';
export declare class BaseParser<T> extends BaseModule {
    constructor(env: Environment, name: string, ...args: any[]);
    parse(input: any, config: ParserConfig<T>): Promise<T>;
}
export interface ParserConfig<T> {
    defaultValue?: T;
}
