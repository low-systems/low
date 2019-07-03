import { Parser, ParserConfig } from './parser';

export class StringParser extends Parser<string> {
  async parse(input: any, config: ParserConfig<string>): Promise<string> {
    try {
      return ['null', 'undefined'].indexOf(input) ? '' : input.toString();
    } catch(err) {
      if (typeof config.defaultValue === 'string') {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}