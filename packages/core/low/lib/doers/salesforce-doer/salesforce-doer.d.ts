import * as JsForce from 'jsforce';
import { Job, BulkOptions } from 'jsforce/api/bulk';
import { Doer, TaskConfig, ConnectorContext, IMap } from '../../index';
export declare class SalesforceDoer extends Doer<SalesforceConfig, SalesforceSecretsConfig> {
    connections: IMap<Connection>;
    setup(): Promise<void>;
    setupConnections(): Promise<void>;
    login(name: string): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: SalesforceTaskConfig): Promise<any>;
    executeQuery(connection: Connection, call: SalesforceQueryCall): Promise<JsForce.QueryResult<JsForce.Record>>;
    executeSearch(connection: Connection, call: SalesforceSearchCall): Promise<JsForce.SearchResult>;
    executeRetrieve(connection: Connection, call: SalesforceRetrieveCall): Promise<({
        [name: string]: JsForce.SObjectFieldType;
    } & JsForce.Record)[]>;
    executeCreate(connection: Connection, call: SalesforceCreateCall): Promise<JsForce.SaveResult[]>;
    executeUpdate(connection: Connection, call: SalesforceUpdateCall): Promise<JsForce.SaveResult[]>;
    executeDelete(connection: Connection, call: SalesforceDeleteCall): Promise<JsForce.SaveResult[]>;
    executeUpsert(connection: Connection, call: SalesforceUpsertCall): Promise<JsForce.UpsertResult[]>;
    executeApex(connection: Connection, call: SalesforceApexCall): Promise<unknown>;
    executeBulkCrud(connection: Connection, call: SalesforceBulkCrudCall): Promise<any[]>;
    executeAnonymous(connection: Connection, call: SalesforceExecuteAnonymousCall): Promise<import("jsforce/lib/api/tooling").ExecuteAnonymousResult>;
    runCrudBatch(job: Job<any, any>, records: any[], pollInterval?: number, pollTimeout?: number): Promise<unknown>;
    executeBulkQuery(connection: Connection, call: SalesforceBulkQueryCall): Promise<unknown>;
}
export interface SalesforceConfig {
    connections: IMap<JsForce.ConnectionConfig>;
}
export interface SalesforceSecretsConfig {
    credentials: IMap<SalesforceCredential>;
}
export interface SalesforceCredential {
    username: string;
    password: string;
}
export type SalesforceTaskConfig = SalesforceQueryCall | SalesforceSearchCall | SalesforceRetrieveCall | SalesforceCreateCall | SalesforceUpdateCall | SalesforceDeleteCall | SalesforceUpsertCall | SalesforceApexCall | SalesforceBulkCrudCall | SalesforceBulkQueryCall | SalesforceExecuteAnonymousCall;
export interface SalesforceCall {
    method: string;
    connection: string;
}
export interface SalesforceQueryCall extends SalesforceCall {
    method: 'query';
    query: string;
    locator?: string;
    all?: boolean;
    executeOptions?: JsForce.QueryOptions;
}
export interface SalesforceSearchCall extends SalesforceCall {
    method: 'search';
    search: string;
}
export interface SalesforceRetrieveCall extends SalesforceCall {
    method: 'retrieve';
    resource: string;
    ids: string[];
    restApiOptions?: JsForce.RetrieveOptions;
}
export interface SalesforceCreateCall extends SalesforceCall {
    method: 'create';
    resource: string;
    objects: any[];
    restApiOptions?: JsForce.DmlOptions;
}
export interface SalesforceUpdateCall extends SalesforceCall {
    method: 'update';
    resource: string;
    objects: any[];
    restApiOptions?: JsForce.DmlOptions;
}
export interface SalesforceDeleteCall extends SalesforceCall {
    method: 'delete';
    resource: string;
    ids: string[];
}
export interface SalesforceUpsertCall extends SalesforceCall {
    method: 'upsert';
    resource: string;
    objects: any[];
    extIdField: string;
    restApiOptions?: JsForce.DmlOptions;
}
export interface SalesforceApexCall extends SalesforceCall {
    method: 'apex';
    path: string;
    verb: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    restApiOptions?: JsForce.HttpRequestOptions;
}
export interface SalesforceBulkCrudCall extends SalesforceCall {
    method: 'bulkCrud';
    resource: string;
    batches: any[][];
    bulkOptions?: BulkOptions;
    operation: 'query' | 'queryAll' | 'hardDelete' | 'insert' | 'delete' | 'update' | 'upsert';
    pollInterval?: number;
    pollTimeout?: number;
}
export interface SalesforceBulkQueryCall extends SalesforceCall {
    method: 'bulkQuery';
    query: string;
}
export interface SalesforceExecuteAnonymousCall extends SalesforceCall {
    method: 'executeAnonymous';
    body: string;
}
export type Connection = JsForce.Connection & {
    search(sosl: string, callback?: (err: Error, result: JsForce.SearchResult[]) => void): Promise<JsForce.SearchResult[]>;
};
