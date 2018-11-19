import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';
export declare class BooleanParser extends BaseParser<boolean> {
    constructor(env: Environment, name: string);
    parse(input: any, config: ParserConfig<boolean>): Promise<boolean>;
}
