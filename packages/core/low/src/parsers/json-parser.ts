import { Parser, ParserConfig } from './parser';

export class JsonParser extends Parser<any> {
  async parse(input: any, config: ParserConfig<any>): Promise<any> {
    try {
      if (typeof input === 'string') {
        return JSON.parse(input);
      } else {
        return input;
      }
    } catch(err) {
      if (config.hasOwnProperty('defaultValue')) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}