import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';
export declare class StringifyParser extends BaseParser<string> {
    constructor(env: Environment, name: string);
    parse(input: any, config: StringifyParserConfig): Promise<string>;
}
export interface StringifyParserConfig extends ParserConfig<string> {
    spaces?: number;
}
