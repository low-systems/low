import MySql from 'mysql';
import { Doer, IMap, TaskConfig, ConnectorContext } from 'low';
export declare class MySqlDoer extends Doer<IMap<MySql.PoolConfig>, IMap<string>> {
    pools: IMap<MySql.Pool>;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: MySqlTaskConfig): Promise<MySqlResponse>;
    bitsToBools(results: any[], fieldNames: string[]): void;
}
export interface MySqlTaskConfig {
    pool: string;
    query: string | MySql.QueryOptions;
    parameters?: any[];
    stringifyObjects?: boolean;
    convertBitsToBools?: string[];
}
export interface MySqlResponse {
    results: any;
    fields?: MySql.FieldInfo[];
}
