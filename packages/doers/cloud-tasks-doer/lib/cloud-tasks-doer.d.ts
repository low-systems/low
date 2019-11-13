import CloudTasksClient, { CloudTasksConfig, Queue, CreateNamedRequest, NamedRequest, CreateTaskRequest, ListRequestObject, CallOptionsWithPagination, UpdateNamedRequest, EnhancedPick, RunTaskRequest } from '@google-cloud/tasks';
import { Doer, TaskConfig, IMap, ConnectorContext } from 'low';
import { CallOptions } from '@google-cloud/tasks/node_modules/google-gax';
export declare const ALLOWED_CLOUD_TASKS_METHODS: string[];
export declare class CloudTasksDoer extends Doer<CloudTasksDoerConfig, CloudTasksSecrets> {
    clients: IMap<CloudTasksClient>;
    setup(): Promise<void>;
    setupClients(): void;
    createQueue(tasksQueueConfig: Queue, client: CloudTasksClient): Promise<Queue>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: CloudTasksTaskConfig): Promise<any>;
}
export interface CloudTasksDoerConfig {
    clientConfigs: IMap<CloudTasksConfig>;
}
export interface CloudTasksSecrets {
    clientCredentials: IMap<any>;
}
export declare type CloudTasksMethod = 'createQueue' | 'createTask' | 'deleteQueue' | 'deleteTask' | 'getQueue' | 'getTask' | 'listQueues' | 'listTasks' | 'pauseQueue' | 'purgeQueue' | 'resumeQueue' | 'runTask' | 'updateQueue';
export interface CloudTasksTaskConfig {
    calls: (CloudTasksCreateQueueCall | CloudTasksCreateTaskCall | CloudTasksDeleteQueueCall | CloudTasksDeleteTaskCall | CloudTasksGetQueueCall | CloudTasksGetTaskCall | CloudTasksListQueuesCall | CloudTasksListTasksCall | CloudTasksPauseQueueCall | CloudTasksPurgeQueueCall | CloudTasksResumeQueueCall | CloudTasksRunTaskCall | CloudTasksUpdateQueueCall)[];
}
export interface CloudTasksMethodCall<M extends CloudTasksMethod, R, O extends CallOptions | CallOptionsWithPagination> {
    name: string;
    client: string;
    method: M;
    request: R;
    options?: O;
    haltOnError?: boolean;
}
export interface CloudTasksCreateQueueCall extends CloudTasksMethodCall<'createQueue', CreateNamedRequest<'queue', Partial<Queue>>, CallOptions> {
}
export interface CloudTasksCreateTaskCall extends CloudTasksMethodCall<'createTask', CreateTaskRequest, CallOptions> {
}
export interface CloudTasksDeleteQueueCall extends CloudTasksMethodCall<'deleteQueue', NamedRequest, CallOptions> {
}
export interface CloudTasksDeleteTaskCall extends CloudTasksMethodCall<'deleteTask', NamedRequest, CallOptions> {
}
export interface CloudTasksGetQueueCall extends CloudTasksMethodCall<'getQueue', NamedRequest, CallOptions> {
}
export interface CloudTasksGetTaskCall extends CloudTasksMethodCall<'getTask', NamedRequest & RunTaskRequest, CallOptions> {
}
export interface CloudTasksListQueuesCall extends CloudTasksMethodCall<'listQueues', ListRequestObject, CallOptionsWithPagination> {
}
export interface CloudTasksListTasksCall extends CloudTasksMethodCall<'listTasks', ListRequestObject, CallOptionsWithPagination> {
}
export interface CloudTasksPauseQueueCall extends CloudTasksMethodCall<'pauseQueue', NamedRequest, CallOptions> {
}
export interface CloudTasksPurgeQueueCall extends CloudTasksMethodCall<'purgeQueue', NamedRequest, CallOptions> {
}
export interface CloudTasksResumeQueueCall extends CloudTasksMethodCall<'resumeQueue', NamedRequest, CallOptions> {
}
export interface CloudTasksRunTaskCall extends CloudTasksMethodCall<'runTask', NamedRequest & RunTaskRequest, CallOptions> {
}
export interface CloudTasksUpdateQueueCall extends CloudTasksMethodCall<'updateQueue', UpdateNamedRequest<"queue", EnhancedPick<Queue, 'name', 'appEngineHttpQueue' | 'rateLimits' | 'retryConfig'>>, CallOptions> {
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
