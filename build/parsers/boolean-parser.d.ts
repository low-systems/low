import { BaseParser, ParserConfig } from './base-parser';
export declare class BooleanParser extends BaseParser<boolean> {
    constructor(name: string);
    parse(input: any, config: ParserConfig<boolean>): Promise<boolean>;
}
