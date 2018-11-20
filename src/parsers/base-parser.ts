import { Environment } from '../environment';
import { BaseModule } from '../base-module';

export abstract class BaseParser<T> extends BaseModule {
  constructor(name: string, ...args: any[]) { 
    super(name, ...args); 
  }

  abstract async parse(input: any, config: ParserConfig<T>): Promise<T>;
}

export interface ParserConfig<T> {
  defaultValue?: T;
}