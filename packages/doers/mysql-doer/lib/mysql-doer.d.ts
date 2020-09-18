import MySql from 'mysql';
import { Doer, IMap, TaskConfig, ConnectorContext } from 'low';
export declare class ScalarCastError extends Error {
    value: any;
    type: ScalarType;
    constructor(message: string, value: any, type: ScalarType);
}
export declare class ScalarResolutionError extends Error {
    results: any[];
    type: ScalarType;
    constructor(message: string, results: any[], type: ScalarType);
}
export declare class MySqlDoer extends Doer<IMap<MySql.PoolConfig>, IMap<string>> {
    pools: IMap<MySql.Pool>;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: MySqlTaskConfig): Promise<MySqlResponse>;
    handleResults(config: MySqlTaskConfig, error: MySql.MysqlError | null, results: any[], fields?: MySql.FieldInfo[] | MySql.FieldInfo[][]): any;
    bitsToBools(results: any[], fieldNames: string[], fields?: MySql.FieldInfo[] | MySql.FieldInfo[][]): void;
    resolveScalar(results: any[], type: ScalarType, fields?: MySql.FieldInfo[] | MySql.FieldInfo[][]): any;
}
export interface MySqlTaskConfig {
    pool: string;
    query: string | MySql.QueryOptions;
    parameters?: any[];
    stringifyObjects?: boolean;
    convertBitsToBools?: string[];
    scalarType?: ScalarType;
}
export declare type ScalarType = 'boolean' | 'date' | 'json' | 'number' | 'string' | 'any';
export interface MySqlResponse {
    results: any;
    fields?: MySql.FieldInfo[];
}
