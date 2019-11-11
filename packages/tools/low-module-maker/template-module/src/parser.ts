import { Parser, ParserConfig } from 'low';

export class ParserMODULE_NAME extends Parser<any> {
  async parse(input: any, config: MODULE_NAMEConfig): Promise<any> {
    console.warn('NOT YET IMPLEMENTED');
  }
}

export interface MODULE_NAMEConfig extends ParserConfig<any> {
  PLACE_HOLDER: any;
}