import { Parser, ParserConfig } from './parser';

export class BooleanParser extends Parser<boolean> {
  async parse(input: any, config: ParserConfig<boolean>): Promise<boolean> {
    try {
      return Boolean(input);
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}