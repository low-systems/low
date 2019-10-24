import * as Querystring from 'querystring';

import { Parser, ParserConfig } from './parser';

export class QuerystringParser extends Parser<any> {
  async parse(input: any, config: QuerystringParserConfig): Promise<any> {
    try {
      if (typeof input !== 'string') {
        throw new Error('The Querystring parser can only be used on strings');
      }

      const start = input.indexOf('?') + 1;

      const querystring = input.substr(start);
      return Querystring.parse(querystring, config.separator || '&', config.equals || '=')
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}

export interface QuerystringParserConfig extends ParserConfig<any> {
  separator?: string;
  equals?: string;
}