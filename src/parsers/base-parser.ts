import { Environment } from '../environment';
import { BaseModule } from '../base-module';

export class BaseParser<T> extends BaseModule {
  constructor(env: Environment, name: string, ...args: any[]) { 
    super(env, name, ...args); 
  }
  
  async parse(input: any, config: ParserConfig<T>): Promise<T> {
    throw new Error(`${this.debugPath} has not implemented parse(any, ParserConfig<any>)`);  
  }  
}

export interface ParserConfig<T> {
  defaultValue?: T;
}