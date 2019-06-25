import { Module } from '../module';

/**
 * This parser does naff all except return an optional `defaultValue`
 * when the input is `null` or `undefined`. It is here to merely to
 * act as a base Parser for all other parsers
 */
export class Parser<T> extends Module {
  async parse(input: any, config: ParserConfig<T>): Promise<T|null> {
    if (['null', 'undefined'].includes(typeof input)) {
      return config.defaultValue || null;
    } else {
      return input as T;
    }
  }
}

export interface ParserConfig<T> {
  defaultValue?: T;
}