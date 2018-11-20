import { Url, parse as UrlParse } from 'url';

import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';

export class UrlParser extends BaseParser<Url> {
  constructor(name: string) { super(name); }
  
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