import { Parser, ParserConfig } from './parser';

export class IntegerParser extends Parser<number> {
  async parse(input: any, config: IntegerParserConfig): Promise<number> {
    try {
      const output = parseInt(input, config.radix || 10);
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

export interface IntegerParserConfig extends ParserConfig<number> {
  radix?: number;
}