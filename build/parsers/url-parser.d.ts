/// <reference types="node" />
import { Url } from 'url';
import { BaseParser, ParserConfig } from './base-parser';
export declare class UrlParser extends BaseParser<Url> {
    parse(input: any, config: ParserConfig<Url>): Promise<Url>;
}
