import { BaseParser, ParserConfig } from './base-parser';
export declare class StringifyParser extends BaseParser<string> {
    parse(input: any, config: StringifyParserConfig): Promise<string>;
}
export interface StringifyParserConfig extends ParserConfig<string> {
    spaces?: number;
}
