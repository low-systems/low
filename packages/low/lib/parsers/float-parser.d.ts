import { Parser, ParserConfig } from './parser';
export declare class FloatParser extends Parser<number> {
    parse(input: any, config: ParserConfig<number>): Promise<number>;
}
