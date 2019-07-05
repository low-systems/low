import { Parser, ParserConfig } from './parser';

export class IntegerParser extends Parser<number> {
  async parse(input: any, config: IntegerParserConfig): Promise<number> {
    const output = parseInt(input, config.radix || 10);
    if (Number.isNaN(output) && config.defaultValue) {
      return config.defaultValue;
    } else {
      return output;
    }
  }
}

export interface IntegerParserConfig extends ParserConfig<number> {
  radix?: number;
}