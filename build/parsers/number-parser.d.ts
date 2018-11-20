import { BaseParser, ParserConfig } from './base-parser';
export declare class NumberParser extends BaseParser<number> {
    constructor(name: string);
    parse(input: any, config: ParserConfig<number>): Promise<number>;
}
