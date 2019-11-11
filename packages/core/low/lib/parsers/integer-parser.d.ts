import { Parser, ParserConfig } from './parser';
export declare class IntegerParser extends Parser<number> {
    parse(input: any, config: IntegerParserConfig): Promise<number>;
}
export interface IntegerParserConfig extends ParserConfig<number> {
    radix?: number;
}
