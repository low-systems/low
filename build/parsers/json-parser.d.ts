import { BaseParser, ParserConfig } from './base-parser';
export declare class JsonParser extends BaseParser<object> {
    parse(input: any, config: ParserConfig<object>): Promise<object>;
}
