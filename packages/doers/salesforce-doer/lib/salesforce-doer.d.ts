import * as JsForce from 'jsforce';
import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
export declare class SalesforceDoer extends Doer<SalesforceConfig, SalesforceSecretsConfig> {
    connections: IMap<Connection>;
    setup(): Promise<void>;
    setupConnections(): Promise<void>;
    login(name: string): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: SalesforceTaskConfig): Promise<any>;
    executeQuery(connection: Connection, call: SalesforceQueryCall): Promise<JsForce.QueryResult<unknown>>;
    executeSearch(connection: Connection, call: SalesforceSearchCall): Promise<JsForce.RecordResult[]>;
    executeRetrieve(connection: Connection, call: SalesforceRetrieveCall): Promise<JsForce.Record<object>[]>;
    executeCreate(connection: Connection, call: SalesforceCreateCall): Promise<JsForce.RecordResult>;
    executeUpdate(connection: Connection, call: SalesforceUpdateCall): Promise<JsForce.RecordResult>;
    executeDelete(connection: Connection, call: SalesforceDeleteCall): Promise<JsForce.RecordResult[]>;
    executeUpsert(connection: Connection, call: SalesforceUpsertCall): Promise<JsForce.RecordResult>;
    executeApex(connection: Connection, call: SalesforceApexCall): Promise<unknown>;
    executeBulkCrud(connection: Connection, call: SalesforceBulkCrudCall): Promise<any[]>;
    executeAnonymous(connection: Connection, call: SalesforceExecuteAnonymousCall): Promise<JsForce.ExecuteAnonymousResult>;
    runCrudBatch(job: JsForce.Job, records: any[], pollInterval?: number, pollTimeout?: number): Promise<unknown>;
    executeBulkQuery(connection: Connection, call: SalesforceBulkQueryCall): Promise<unknown>;
}
export interface SalesforceConfig {
    connections: IMap<JsForce.ConnectionOptions>;
}
export interface SalesforceSecretsConfig {
    credentials: IMap<SalesforceCredential>;
}
export interface SalesforceCredential {
    username: string;
    password: string;
}
export declare type SalesforceTaskConfig = SalesforceQueryCall | SalesforceSearchCall | SalesforceRetrieveCall | SalesforceCreateCall | SalesforceUpdateCall | SalesforceDeleteCall | SalesforceUpsertCall | SalesforceApexCall | SalesforceBulkCrudCall | SalesforceBulkQueryCall | SalesforceExecuteAnonymousCall;
export interface SalesforceCall {
    method: string;
    connection: string;
}
export interface SalesforceQueryCall extends SalesforceCall {
    method: 'query';
    query: string;
    locator?: string;
    all?: boolean;
    executeOptions?: JsForce.ExecuteOptions;
}
export interface SalesforceSearchCall extends SalesforceCall {
    method: 'search';
    search: string;
}
export interface SalesforceRetrieveCall extends SalesforceCall {
    method: 'retrieve';
    resource: string;
    ids: string[];
    restApiOptions?: JsForce.RestApiOptions;
}
export interface SalesforceCreateCall extends SalesforceCall {
    method: 'create';
    resource: string;
    objects: any[];
    restApiOptions?: JsForce.RestApiOptions;
}
export interface SalesforceUpdateCall extends SalesforceCall {
    method: 'update';
    resource: string;
    objects: any[];
    restApiOptions?: JsForce.RestApiOptions;
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
    restApiOptions?: JsForce.RestApiOptions;
}
export interface SalesforceApexCall extends SalesforceCall {
    method: 'apex';
    path: string;
    verb: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    restApiOptions?: JsForce.RestApiOptions;
}
export interface SalesforceBulkCrudCall extends SalesforceCall {
    method: 'bulkCrud';
    resource: string;
    batches: any[][];
    bulkOptions?: JsForce.BulkOptions;
    operation: 'retrieve' | 'create' | 'delete' | 'update' | 'upsert';
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
export interface Connection extends JsForce.Connection {
    search(sosl: string, callback?: (err: Error, result: JsForce.RecordResult[]) => void): Promise<JsForce.RecordResult[]>;
}
