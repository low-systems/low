import { Parser, ParserConfig } from './parser';

export class NumberParser extends Parser<number> {
  async parse(input: any, config: ParserConfig<number>): Promise<number> {
    try {
      return Number(input);
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}