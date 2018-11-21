import { BaseModule } from '../base-module';
export declare abstract class BaseParser<T> extends BaseModule {
    abstract parse(input: any, config: ParserConfig<T>): Promise<T>;
}
export interface ParserConfig<T> {
    defaultValue?: T;
}
