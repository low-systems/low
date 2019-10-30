import { Parser, ParserConfig } from './parser';
export declare class StringParser extends Parser<string> {
    parse(input: any, config: StringParserConfig): Promise<string>;
}
export interface StringParserConfig extends ParserConfig<string> {
    spaces?: number;
    numberFunction?: 'toExponential' | 'toFixed' | 'toLocaleString' | 'toPrecision' | 'toString';
    fractionDigits?: number;
    locales?: string | string[];
    localeOptions?: Intl.NumberFormatOptions;
    precision?: number;
    radix?: number;
    trueString?: string;
    falseString?: string;
    undefinedString?: string;
}
