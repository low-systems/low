/// <reference types="node" />
import { URL } from 'url';
import { Parser, ParserConfig } from './parser';
export declare class UrlParser extends Parser<URL> {
    parse(input: any, config: UrlParserConfig): Promise<URL>;
}
export interface UrlParserConfig extends ParserConfig<URL> {
    base?: string;
}
