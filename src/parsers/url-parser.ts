import { URL } from 'url';

import { Parser, ParserConfig } from './parser';

export class UrlParser extends Parser<URL> {
  async parse(input: any, config: UrlParserConfig): Promise<URL> {
    try {
      return new URL(input, config.base || undefined);
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}

export interface UrlParserConfig extends ParserConfig<URL> {
  base?: string;
}