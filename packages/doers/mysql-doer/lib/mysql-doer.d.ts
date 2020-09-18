import MySql from 'mysql';
import { Doer, IMap, TaskConfig, ConnectorContext } from 'low';
export declare class BitsToBoolsConversionError extends Error {
    config: BitsToBoolsConfig;
    constructor(message: string, config: BitsToBoolsConfig, results: any[]);
}
export declare class ScalarCastError extends Error {
    value: any;
    config: ScalarConfig;
    constructor(message: string, value: any, config: ScalarConfig);
}
export declare class ScalarResolutionError extends Error {
    results: any[];
    config: ScalarConfig;
    constructor(message: string, results: any[], config: ScalarConfig);
}
export declare class MySqlDoer extends Doer<IMap<MySql.PoolConfig>, IMap<string>> {
    pools: IMap<MySql.Pool>;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, config: MySqlTaskConfig): Promise<MySqlResponse>;
    handleResults(config: MySqlTaskConfig, error: MySql.MysqlError | null, results: any[], fields?: MySql.FieldInfo[]): any;
    bitsToBools(results: any[], config: BitsToBoolsConfig | BitsToBoolsConfig[]): void;
    resolveScalar(results: any[], config: ScalarConfig): any;
}
export interface MySqlTaskConfig {
    pool: string;
    query: string | MySql.QueryOptions;
    parameters?: any[];
    stringifyObjects?: boolean;
    bitsToBoolsConfigs?: BitsToBoolsConfig | BitsToBoolsConfig[];
    scalarConfig?: ScalarConfig;
}
export interface BitsToBoolsConfig {
    recordSetIndex?: number;
    fields: string[];
}
export interface ScalarConfig {
    recordSetIndex?: number;
    type: ScalarType;
}
export declare type ScalarType = 'boolean' | 'date' | 'json' | 'number' | 'string' | 'any';
export interface MySqlResponse {
    results: any;
    fields?: MySql.FieldInfo[];
}
