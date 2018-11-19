import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';

export class NumberParser extends BaseParser<number> {
  constructor(env: Environment, name: string) { super(env, name); }
  
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