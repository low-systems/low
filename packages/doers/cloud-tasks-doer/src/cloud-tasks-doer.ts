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
    const responses: any = {};

    for (const call of coreConfig.calls) {
      try {
        if (!ALLOWED_CLOUD_TASKS_METHODS.includes(call.method)) {
          throw new Error(`Invalid Cloud Tasks method '${call.method}'`);
        }

        const client = this.clients[call.client];

        switch (call.method) {
          case ('createQueue'):
            responses[call.name] = await client.createQueue(call.request, call.options);
            break;
          case ('createTask'):
            if (call.request.task.appEngineHttpRequest && call.request.task.appEngineHttpRequest.body) {
              const inputBody: unknown = call.request.task.appEngineHttpRequest.body;
              const body = typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody, null, 2);
              call.request.task.appEngineHttpRequest.body = Buffer.from(body).toString('base64');
            }
            if (call.request.task.httpRequest && call.request.task.httpRequest.body) {
              const inputBody: unknown = call.request.task.httpRequest.body;
              const body = typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody, null, 2);
              call.request.task.httpRequest.body = Buffer.from(body).toString('base64');
            }
            responses[call.name] = await client.createTask(call.request, call.options);
            break;
          case ('deleteQueue'):
            responses[call.name] = await client.deleteQueue(call.request, call.options);
            break;
          case ('deleteTask'):
            responses[call.name] = await client.deleteTask(call.request, call.options);
            break;
          case ('getQueue'):
            responses[call.name] = await client.getQueue(call.request, call.options);
            break;
          case ('getTask'):
            responses[call.name] = await client.getTask(call.request, call.options);
            break;
          case ('listQueues'):
            responses[call.name] = await client.listQueues(call.request, call.options);
            break;
          case ('listTasks'):
            responses[call.name] = await client.listTasks(call.request, call.options);
            break;
          case ('pauseQueue'):
            responses[call.name] = await client.pauseQueue(call.request, call.options);
            break;
          case ('purgeQueue'):
            responses[call.name] = await client.purgeQueue(call.request, call.options);
            break;
          case ('resumeQueue'):
            responses[call.name] = await client.resumeQueue(call.request, call.options);
            break;
          case ('runTask'):
            responses[call.name] = await client.runTask(call.request, call.options);
            break;
          case ('updateQueue'):
            responses[call.name] = await client.updateQueue(call.request, call.options);
            break;
        }
      } catch(err) {
        const errorJson = JSON.stringify(err, Object.getOwnPropertyNames(err));
        const error = JSON.parse(errorJson);
        responses[call.name] = { error };
        if (call.errorHandling === 'halt') {
          break;
        } else if (call.errorHandling === 'throw') {
          throw err;
        }
      }
    }

    return responses;
  }
}

export interface CloudTasksDoerConfig {
  clientConfigs: IMap<CloudTasksConfig>;
}

export interface CloudTasksSecrets {
  clientCredentials: IMap<any>;
}

export type CloudTasksMethod = 'createQueue' | 'createTask' | 'deleteQueue' | 'deleteTask' | 'getQueue' | 'getTask' | 'listQueues' | 'listTasks' | 'pauseQueue' | 'purgeQueue' | 'resumeQueue' | 'runTask' | 'updateQueue';

export interface CloudTasksTaskConfig {
  calls: (
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
    CloudTasksUpdateQueueCall
  )[];
}

export interface CloudTasksMethodCall<M extends CloudTasksMethod, R, O extends CallOptions | CallOptionsWithPagination> {
  name: string;
  client: string;
  method: M;
  request: R;
  options?: O;
  errorHandling?: 'throw' | 'halt';
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

/**
 * The old way
export interface CloudTasksCreateQueueCall extends CloudTasksMethodCall {
  method: 'createQueue';
  request: CreateNamedRequest<'queue', Partial<Queue>>;
}

export interface CloudTasksCreateTaskCall extends CloudTasksMethodCall {
  method: 'createTask';
  request: CreateTaskRequest;
}

export interface CloudTasksDeleteQueueCall extends CloudTasksMethodCall {
  method: 'deleteQueue';
  request: NamedRequest;
}

export interface CloudTasksDeleteTaskCall extends CloudTasksMethodCall {
  method: 'deleteTask';
  request: NamedRequest;
}

export interface CloudTasksGetQueueCall extends CloudTasksMethodCall {
  method: 'getQueue';
  request: NamedRequest;
}

export interface CloudTasksGetTaskCall extends CloudTasksMethodCall {
  method: 'getTask';
  request: NamedRequest & RunTaskRequest;
}

export interface CloudTasksListQueuesCall extends CloudTasksMethodCall {
  method: 'listQueues';
  request: ListRequestObject;
  options: CallOptionsWithPagination;
}

export interface CloudTasksListTasksCall extends CloudTasksMethodCall {
  method: 'listTasks';
  request: ListRequestObject;
  options: CallOptionsWithPagination;
}

export interface CloudTasksPauseQueueCall extends CloudTasksMethodCall {
  method: 'pauseQueue';
  request: NamedRequest;
}

export interface CloudTasksPurgeQueueCall extends CloudTasksMethodCall {
  method: 'purgeQueue';
  request: NamedRequest;
}

export interface CloudTasksResumeQueueCall extends CloudTasksMethodCall {
  method: 'resumeQueue';
  request: NamedRequest;
}

export interface CloudTasksRunTaskCall extends CloudTasksMethodCall {
  method: 'runTask';
  request: NamedRequest & RunTaskRequest;
}

export interface CloudTasksUpdateQueueCall extends CloudTasksMethodCall {
  method: 'updateQueue';
  request: UpdateNamedRequest<"queue", EnhancedPick<Queue, 'name', 'appEngineHttpQueue' | 'rateLimits' | 'retryConfig'>>;
}
 */