import { Parser, ParserConfig } from './parser';
export declare class JsonParser extends Parser<any> {
    parse(input: any, config: ParserConfig<any>): Promise<any>;
}
