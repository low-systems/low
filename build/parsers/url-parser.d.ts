/// <reference types="node" />
import { Url } from 'url';
import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';
export declare class UrlParser extends BaseParser<Url> {
    constructor(env: Environment, name: string);
    parse(input: any, config: ParserConfig<Url>): Promise<Url>;
}
