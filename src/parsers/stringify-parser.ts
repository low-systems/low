import { Parser, ParserConfig } from './parser';

export class StringifyParser extends Parser<string> {
  async parse(input: any, config: StringifyParserConfig): Promise<string> {
    try {
      const spaces = config.hasOwnProperty('spaces') ? config.spaces : 4;
      return JSON.stringify(input, null, spaces);
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}

export interface StringifyParserConfig extends ParserConfig<string> {
  spaces?: number;
}