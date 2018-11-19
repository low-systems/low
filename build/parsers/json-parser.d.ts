import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';
export declare class JsonParser extends BaseParser<object> {
    constructor(env: Environment, name: string);
    parse(input: any, config: ParserConfig<object>): Promise<object>;
}
