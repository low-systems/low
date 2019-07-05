import { Parser, ParserConfig } from './parser';

export class StringParser extends Parser<string> {
  async parse(input: any, config: StringParserConfig): Promise<string> {
    try {
      switch (typeof input) {
        case ('object'):
          return JSON.stringify(input, null, config.spaces);
        case ('number'):
          switch (config.numberFunction) {
            case ('toExponential'):
              return input.toExponential(config.fractionDigits || undefined);
            case ('toFixed'):
              return input.toFixed(config.fractionDigits || undefined);
            case ('toLocaleString'):
              return input.toLocaleString(config.locales || undefined, config.localeOptions || undefined);
            case ('toPrecision'):
              return input.toPrecision(config.precision || undefined);
            default:
              return input.toString(config.radix || undefined);
          }
        case ('boolean'):
          return input === true ? config.trueString || 'true' : config.falseString || 'false';
        case ('undefined'):
          return  config.undefinedString || '';
        default:
          return input.toString();
      }
    } catch(err) {
      if (typeof config.defaultValue === 'string') {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}

export interface StringParserConfig extends ParserConfig<string> {
  spaces?: number;
  numberFunction?: 'toExponential'|'toFixed'|'toLocaleString'|'toPrecision'|'toString';
  fractionDigits?: number;
  locales?: string|string[];
  localeOptions?: Intl.NumberFormatOptions;
  precision?: number;
  radix?: number;
  trueString?: string;
  falseString?: string;
  undefinedString?: string;
}