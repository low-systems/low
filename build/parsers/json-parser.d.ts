import { BaseParser, ParserConfig } from './base-parser';
export declare class JsonParser extends BaseParser<object> {
    constructor(name: string);
    parse(input: any, config: ParserConfig<object>): Promise<object>;
}
