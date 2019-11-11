import { Parser, ParserConfig } from './parser';
export declare class QuerystringParser extends Parser<any> {
    parse(input: any, config: QuerystringParserConfig): Promise<any>;
}
export interface QuerystringParserConfig extends ParserConfig<any> {
    separator?: string;
    equals?: string;
}
