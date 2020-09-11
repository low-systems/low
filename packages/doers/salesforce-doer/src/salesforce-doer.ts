import * as JsForce from 'jsforce';

import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';

export class SalesforceDoer extends Doer<SalesforceConfig, SalesforceSecretsConfig> {
  connections: IMap<Connection> = {}

  async setup() {
    await this.setupConnections();
  }

  async setupConnections() {
    for (const [name, config] of Object.entries(this.config.connections)) {
      this.connections[name] = new JsForce.Connection(config) as Connection;
      try {
        await this.login(name);
      } catch (err) {
        this.env.error(null, `Problem logging in to Salesforce connection '${name}': ${err.message}`)
      }
    }
  }

  async login(name: string) {
    if (!this.connections.hasOwnProperty(name)) {
      throw new Error(`Connection with the name '${name}' does not exist`);
    }

    if (!this.secrets.credentials.hasOwnProperty(name)) {
      throw new Error(`No credential for connection'${name}' have been provided`);
    }

    const connection = this.connections[name];
    const credential = this.secrets.credentials[name];

    if (connection.accessToken) {
      return;
    }

    await connection.login(credential.username, credential.password);
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: SalesforceTaskConfig): Promise<any> {
    const connection = this.connections[coreConfig.connection];
    await this.login(coreConfig.connection);

    switch (coreConfig.method) {
      case ('query'):
        return await this.executeQuery(connection, coreConfig);
      case ('search'):
        return await this.executeSearch(connection, coreConfig);
      case ('retrieve'):
        return await this.executeRetrieve(connection, coreConfig);
      case ('create'):
        return await this.executeCreate(connection, coreConfig);
      case ('update'):
        return await this.executeUpdate(connection, coreConfig);
      case ('delete'):
        return await this.executeDelete(connection, coreConfig);
      case ('upsert'):
        return await this.executeUpsert(connection, coreConfig);
      case ('apex'):
        return await this.executeApex(connection, coreConfig);
      case ('bulkCrud'):
        return await this.executeBulkCrud(connection, coreConfig);
      case ('bulkQuery'):
        return await this.executeBulkQuery(connection, coreConfig);
    }
  }

  async executeQuery(connection: Connection, call: SalesforceQueryCall) {
    if (call.locator) {
      return await connection.queryMore(call.locator, call.executeOptions);
    }

    if (call.all) {
      return await connection.queryAll(call.query, call.executeOptions);
    } else {
      return await connection.query(call.query, call.executeOptions);
    }
  }

  async executeSearch(connection: Connection, call: SalesforceSearchCall) {
    return await connection.search(call.search);
  }

  async executeRetrieve(connection: Connection, call: SalesforceRetrieveCall) {
    return await connection.sobject(call.resource).retrieve(call.ids, call.restApiOptions);
  }

  async executeCreate(connection: Connection, call: SalesforceCreateCall) {
    return await connection.sobject(call.resource).create(call.objects, call.restApiOptions);
  }

  async executeUpdate(connection: Connection, call: SalesforceUpdateCall) {
    return await connection.sobject(call.resource).update(call.objects, call.restApiOptions);
  }

  async executeDelete(connection: Connection, call: SalesforceDeleteCall) {
    return await connection.sobject(call.resource).destroy(call.ids);
  }

  async executeUpsert(connection: Connection, call: SalesforceUpsertCall) {
    return await connection.sobject(call.resource).upsert(call.objects, call.extIdField, call.restApiOptions);
  }

  async executeApex(connection: Connection, call: SalesforceApexCall) {
    const restApiOptions = call.restApiOptions || {};
    const verb = call.verb.toLowerCase();

    if (verb === 'delete' || verb === 'get') {
      return await connection.apex[verb](call.path, restApiOptions);
    } else if (verb === 'patch' || verb === 'post' || verb === 'put') {
      return await connection.apex[verb](call.path, call.body || {}, restApiOptions);
    }

    throw new Error(`Invalid verb '${call.verb}' to '${call.path}'. Was expecting 'DELETE', 'GET', 'PATCH', 'POST', or 'PUT'`);
  }

  async executeBulkCrud(connection: Connection, call: SalesforceBulkCrudCall) {
    const job = connection.bulk.createJob(call.resource, call.operation, call.bulkOptions);
    const batchesResults: any[] = [];

    for (const records of call.batches) {
      const results = await this.runCrudBatch(job, records, call.pollInterval, call.pollTimeout);
      batchesResults.push(results);
    }

    return batchesResults;
  }

  runCrudBatch(job: JsForce.Job, records: any[], pollInterval: number = 5000, pollTimeout: number = 30000) {
    return new Promise((resolve, reject) => {
      const batch = job.createBatch();
      batch.execute(records);

      batch.on('error', (batchInfo) => {
        console.error('Batch error', batchInfo);
        reject(batchInfo);
      });

      batch.on('queue', (batchInfo) => {
        console.log('Batch queued', batchInfo);
        batch.poll(pollInterval, pollTimeout);
      });

      batch.on('response', (results) => {
        resolve(results);
      });
    });
  }

  executeBulkQuery(connection: Connection, call: SalesforceBulkQueryCall) {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      const batch = connection.bulk.query(call.query);
      batch.on('record', (record: any) => {
        records.push(record);
      });
      batch.on('error', (err: any) => {
        console.error(err);
        reject(err);
      });
      batch.on('end', () => {
        resolve(records);
      });
    });
  }
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

export type SalesforceTaskConfig =
  SalesforceQueryCall |
  SalesforceSearchCall |
  SalesforceRetrieveCall |
  SalesforceCreateCall |
  SalesforceUpdateCall |
  SalesforceDeleteCall |
  SalesforceUpsertCall |
  SalesforceApexCall |
  SalesforceBulkCrudCall |
  SalesforceBulkQueryCall;

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

export interface Connection extends JsForce.Connection {
  search(sosl: string, callback?: (err: Error, result: JsForce.RecordResult[]) => void): Promise<JsForce.RecordResult[]>;
}