import { Environment } from '../environment';
import { BaseParser, ParserConfig } from './base-parser';

export class BooleanParser extends BaseParser<boolean> {
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