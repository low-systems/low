import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';

export class StringifyParser extends BaseParser<string> {
  constructor(env: Environment, name: string) { super(env, name); }
  
  async parse(input: any, config: StringifyParserConfig): Promise<string> {
    try {
      if (config.spaces) {
        return JSON.stringify(input, null, config.spaces);
      } else {
        return JSON.stringify(input);
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

export interface StringifyParserConfig extends ParserConfig<string> {
  spaces?: number;
}