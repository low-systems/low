import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';
export declare class NumberParser extends BaseParser<number> {
    constructor(env: Environment, name: string);
    parse(input: any, config: ParserConfig<number>): Promise<number>;
}
