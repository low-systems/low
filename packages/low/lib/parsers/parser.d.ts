import { Module } from '../module';
/**
 * This parser does naff all except return an optional `defaultValue`
 * when the input is `null` or `undefined`. It is here to merely to
 * act as a base Parser for all other parsers
 */
export declare class Parser<T> extends Module<any, any> {
    parse(input: any, config: ParserConfig<T>): Promise<T | null>;
}
export interface ParserConfig<T> {
    defaultValue?: T;
}
