import { Parser, ParserConfig } from './parser';

export class FloatParser extends Parser<number> {
  async parse(input: any, config: ParserConfig<number>): Promise<number> {
    try {
      const output = parseFloat(input);
      if (Number.isNaN(output) && config.defaultValue) {
        return config.defaultValue;
      } else {
        return output;
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