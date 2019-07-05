import { Parser, ParserConfig } from './parser';

export class FloatParser extends Parser<number> {
  async parse(input: any, config: ParserConfig<number>): Promise<number> {
    const output = parseFloat(input);
    if (Number.isNaN(output) && config.defaultValue) {
      return config.defaultValue;
    } else {
      return output;
    }
  }
}