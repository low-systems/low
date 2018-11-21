import { BaseParser, ParserConfig } from './base-parser';
export declare class NumberParser extends BaseParser<number> {
    parse(input: any, config: ParserConfig<number>): Promise<number>;
}
