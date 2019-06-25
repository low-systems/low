import { Parser, ParserConfig } from './parser';

export class ObjectParser extends Parser<object> {
  async parse(input: any, config: ParserConfig<object>): Promise<object> {
    try {
      if (typeof input === 'string') {
        return JSON.parse(input);
      } else {
        return input;
      }
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}