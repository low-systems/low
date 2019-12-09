//TODO: There is some hacky BS going on here because there are no built-in type definitions
//      for CloudTasks yet and the one from @types/google-cloud__tasks does some weird stuff.
//      The types that come out of importing * seems different from the actual objects. No idea...
//      Basically stay on top of releases for types and jump on them when they arrive or are fixed.
import * as CloudTasks from '@google-cloud/tasks';
// tslint:disable: no-duplicate-imports
import { CloudTasksConfig, Queue, CreateNamedRequest, NamedRequest, ListRequestObject, CallOptionsWithPagination, UpdateNamedRequest, EnhancedPick, RunTaskRequest } from '@google-cloud/tasks';

const v2beta3 = require('@google-cloud/tasks').v2beta3;

import { Doer, TaskConfig, IMap, ConnectorContext } from 'low';
import { CallOptions } from '@google-cloud/tasks/node_modules/google-gax';

export const  ALLOWED_CLOUD_TASKS_METHODS = ['createQueue', 'createTask', 'deleteQueue', 'deleteTask', 'getQueue', 'getTask', 'listQueues', 'listTasks', 'pauseQueue', 'purgeQueue', 'resumeQueue', 'runTask', 'updateQueue'];

export class CloudTasksDoer extends Doer<CloudTasksDoerConfig, CloudTasksSecrets> {
  clients: IMap<CloudTasks.default> = {};

  async setup() {
    this.setupClients();
  }

  setupClients() {
    for (const [name, config] of Object.entries(this.config.clientConfigs)) {
      if (this.secrets.clientCredentials && this.secrets.clientCredentials.hasOwnProperty(name)) {
        config.credentials = this.secrets.clientCredentials[name];
      }

      const client = new v2beta3.CloudTasksClient(config);
      this.clients[name] = client;
    }
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: CloudTasksTaskConfig) {
    if (!ALLOWED_CLOUD_TASKS_METHODS.includes(coreConfig.method)) {
      throw new Error(`Invalid Cloud Tasks method '${coreConfig.method}'`);
    }

    const client = this.clients[coreConfig.client];

    switch (coreConfig.method) {
      case ('createQueue'):
        return await client.createQueue(coreConfig.request, coreConfig.options);
      case ('createTask'):
        if (coreConfig.request.task.appEngineHttpRequest && coreConfig.request.task.appEngineHttpRequest.body) {
          const inputBody: unknown = coreConfig.request.task.appEngineHttpRequest.body;
          const body = typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody, null, 2);
          coreConfig.request.task.appEngineHttpRequest.body = Buffer.from(body).toString('base64');
        }
        if (coreConfig.request.task.httpRequest && coreConfig.request.task.httpRequest.body) {
          const inputBody: unknown = coreConfig.request.task.httpRequest.body;
          const body = typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody, null, 2);
          coreConfig.request.task.httpRequest.body = Buffer.from(body).toString('base64');
        }
        return await client.createTask(coreConfig.request, coreConfig.options);
      case ('deleteQueue'):
        return await client.deleteQueue(coreConfig.request, coreConfig.options);
      case ('deleteTask'):
        return await client.deleteTask(coreConfig.request, coreConfig.options);
      case ('getQueue'):
        return await client.getQueue(coreConfig.request, coreConfig.options);
      case ('getTask'):
        return await client.getTask(coreConfig.request, coreConfig.options);
      case ('listQueues'):
        return await client.listQueues(coreConfig.request, coreConfig.options);
      case ('listTasks'):
        return await client.listTasks(coreConfig.request, coreConfig.options);
      case ('pauseQueue'):
        return await client.pauseQueue(coreConfig.request, coreConfig.options);
      case ('purgeQueue'):
        return await client.purgeQueue(coreConfig.request, coreConfig.options);
      case ('resumeQueue'):
        return await client.resumeQueue(coreConfig.request, coreConfig.options);
      case ('runTask'):
        return await client.runTask(coreConfig.request, coreConfig.options);
      case ('updateQueue'):
        return await client.updateQueue(coreConfig.request, coreConfig.options);
    }
  }
}

export interface CloudTasksDoerConfig {
  clientConfigs: IMap<CloudTasksConfig>;
}

export interface CloudTasksSecrets {
  clientCredentials: IMap<any>;
}

export type CloudTasksMethod = 'createQueue' | 'createTask' | 'deleteQueue' | 'deleteTask' | 'getQueue' | 'getTask' | 'listQueues' | 'listTasks' | 'pauseQueue' | 'purgeQueue' | 'resumeQueue' | 'runTask' | 'updateQueue';

export type CloudTasksTaskConfig =
  CloudTasksCreateQueueCall |
  CloudTasksCreateTaskCall |
  CloudTasksDeleteQueueCall |
  CloudTasksDeleteTaskCall |
  CloudTasksGetQueueCall |
  CloudTasksGetTaskCall |
  CloudTasksListQueuesCall |
  CloudTasksListTasksCall |
  CloudTasksPauseQueueCall |
  CloudTasksPurgeQueueCall |
  CloudTasksResumeQueueCall |
  CloudTasksRunTaskCall |
  CloudTasksUpdateQueueCall;
export interface CloudTasksMethodCall<M extends CloudTasksMethod, R, O extends CallOptions | CallOptionsWithPagination> {
  client: string;
  method: M;
  request: R;
  options?: O;
}

export interface CloudTasksCreateQueueCall extends CloudTasksMethodCall<'createQueue', CreateNamedRequest<'queue', Partial<Queue>>, CallOptions> { }
export interface CloudTasksCreateTaskCall extends CloudTasksMethodCall<'createTask', CreateTaskRequest, CallOptions> { }
export interface CloudTasksDeleteQueueCall extends CloudTasksMethodCall<'deleteQueue', NamedRequest, CallOptions> { }
export interface CloudTasksDeleteTaskCall extends CloudTasksMethodCall<'deleteTask', NamedRequest, CallOptions> { }
export interface CloudTasksGetQueueCall extends CloudTasksMethodCall<'getQueue', NamedRequest, CallOptions> { }
export interface CloudTasksGetTaskCall extends CloudTasksMethodCall<'getTask', NamedRequest & RunTaskRequest, CallOptions> { }
export interface CloudTasksListQueuesCall extends CloudTasksMethodCall<'listQueues', ListRequestObject, CallOptionsWithPagination> { }
export interface CloudTasksListTasksCall extends CloudTasksMethodCall<'listTasks', ListRequestObject, CallOptionsWithPagination> { }
export interface CloudTasksPauseQueueCall extends CloudTasksMethodCall<'pauseQueue', NamedRequest, CallOptions> { }
export interface CloudTasksPurgeQueueCall extends CloudTasksMethodCall<'purgeQueue', NamedRequest, CallOptions> { }
export interface CloudTasksResumeQueueCall extends CloudTasksMethodCall<'resumeQueue', NamedRequest, CallOptions> { }
export interface CloudTasksRunTaskCall extends CloudTasksMethodCall<'runTask', NamedRequest & RunTaskRequest, CallOptions> { }
export interface CloudTasksUpdateQueueCall extends CloudTasksMethodCall<'updateQueue', UpdateNamedRequest<"queue", EnhancedPick<Queue, 'name', 'appEngineHttpQueue' | 'rateLimits' | 'retryConfig'>>, CallOptions> { }

// Some more hacky type definition BS.
export interface CreateTaskRequest extends CloudTasks.CreateTaskRequest {
  task: Partial<Task> & Partial<CloudTasks.Task>
}

export interface Task {
  httpRequest: {
    url: String;
    httpMethod?: string;
    headers?: IMap<string>;
    body?: any;
    oauthToken?: any;
    oidcToken?: any;
  },
  payloadType: 'http_request' | 'app_engine_http_request';
}