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
      await this.login(name);
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
    const responses: any[] = [];

    for (const call of coreConfig.calls) {
      const connection = this.connections[call.connection];
      await this.login(call.connection);
      let response: any = null;

      try {
        switch (call.method) {
          case ('query'):
            response = this.executeQuery(connection, call);
            break;
          case ('search'):
            response = this.executeSearch(connection, call);
            break;
          case ('retrieve'):
            response = this.executeRetrieve(connection, call);
            break;
          case ('create'):
            response = this.executeCreate(connection, call);
            break;
          case ('update'):
            response = this.executeUpdate(connection, call);
            break;
          case ('delete'):
            response = this.executeDelete(connection, call);
            break;
          case ('upsert'):
            response = this.executeUpsert(connection, call);
            break;
          case ('apex'):
            response = this.executeApex(connection, call);
            break;
        }
      } catch (err) {
        response = err;
      }

      responses.push(response);
    }

    return responses;
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
    switch (call.verb) {
      case ('DELETE'):
        return await connection.apex.delete(call.path, restApiOptions);
      case ('GET'):
        return await connection.apex.get(call.path, restApiOptions);
      case ('PATCH'):
        return await connection.apex.patch(call.path, call.body || {}, restApiOptions);
      case ('POST'):
        return await connection.apex.post(call.path, call.body || {}, restApiOptions);
      case ('PUT'):
        return await connection.apex.put(call.path, call.body || {}, restApiOptions);
      default:
        throw new Error(`Invalid verb '${call.verb}' to '${call.path}'. Was expecting 'DELETE', 'GET', 'PATCH', 'POST', or 'PUT'`);
    }
  }

  executeBulkCrud(connection: Connection, call: SalesforceBulkCrudCall) {
    // TODO: Does 'error' only get fired once when there is a terrible mishap or on each record that fails
    // TODO: How does adding additional batches work?
    //       Should I chunk call.objects and wait on multiple batches, or
    //       Chunk call.objects and create multiple batches,
    //       Keep it simple and just allow for single batches
    return new Promise((resolve, reject) => {
      const job = connection.bulk.createJob(call.resource, call.operation, call.bulkOptions);
      const batch = job.createBatch();

      batch.on('error', (batchInfo) => {
        console.error('Batch error', batchInfo);
      });

      batch.on('queue', (batchInfo) => {
        console.log('Batch queued', batchInfo);
      });

      batch.on('response', (results) => {
        resolve(results);
      });

      batch.execute(call.objects);
    });

    // TODO: Bulk query
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

export interface SalesforceTaskConfig {
  calls: (
    SalesforceQueryCall |
    SalesforceSearchCall |
    SalesforceRetrieveCall |
    SalesforceCreateCall |
    SalesforceUpdateCall |
    SalesforceDeleteCall |
    SalesforceUpsertCall |
    SalesforceApexCall |
    SalesforceBulkCrudCall
  )[];
}

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
  objects: any[];
  bulkOptions?: JsForce.BulkOptions;
  operation: 'retrieve' | 'create' | 'delete' | 'update' | 'upsert';
}

export interface Connection extends JsForce.Connection {
  search(sosl: string, callback?: (err: Error, result: JsForce.RecordResult[]) => void): Promise<JsForce.RecordResult[]>;
}