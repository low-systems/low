import { Parser, ParserConfig } from './parser';
export declare class BooleanParser extends Parser<boolean> {
    trueStrings: string[];
    parse(input: any, config: BooleanParserConfig): Promise<boolean>;
}
export interface BooleanParserConfig extends ParserConfig<boolean> {
    interperateStrings?: boolean | RegularExpression | string[];
    emptyObjectsAsFalse?: boolean;
    removeObjectNullValues?: boolean;
}
export interface RegularExpression {
    regex: string;
    options?: string;
}
