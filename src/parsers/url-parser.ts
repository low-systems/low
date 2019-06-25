import { Url, parse as UrlParse } from 'url';

import { Parser, ParserConfig } from './parser';

export class UrlParser extends Parser<Url> {
  async parse(input: any, config: ParserConfig<Url>): Promise<Url> {
    try {
      return UrlParse(input);
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}