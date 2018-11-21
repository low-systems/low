import { BaseParser, ParserConfig } from './base-parser';
export declare class BooleanParser extends BaseParser<boolean> {
    parse(input: any, config: ParserConfig<boolean>): Promise<boolean>;
}
