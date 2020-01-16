import * as CloudTasks from '@google-cloud/tasks';
import { CloudTasksConfig, Queue, CreateNamedRequest, NamedRequest, ListRequestObject, CallOptionsWithPagination, UpdateNamedRequest, EnhancedPick, RunTaskRequest } from '@google-cloud/tasks';
import { Doer, TaskConfig, IMap, ConnectorContext } from 'low';
import { CallOptions } from '@google-cloud/tasks/node_modules/google-gax';
export declare const ALLOWED_CLOUD_TASKS_METHODS: string[];
export declare class CloudTasksDoer extends Doer<CloudTasksDoerConfig, CloudTasksSecrets> {
    clients: IMap<CloudTasks.default>;
    setup(): Promise<void>;
    setupClients(): void;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: CloudTasksTaskConfig): Promise<[CloudTasks.Queue] | [CloudTasks.Task] | [void] | [CloudTasks.Queue[]] | [CloudTasks.Task[]]>;
}
export interface CloudTasksDoerConfig {
    clientConfigs: IMap<CloudTasksConfig>;
}
export interface CloudTasksSecrets {
    clientCredentials: IMap<any>;
}
export declare type CloudTasksMethod = 'createQueue' | 'createTask' | 'deleteQueue' | 'deleteTask' | 'getQueue' | 'getTask' | 'listQueues' | 'listTasks' | 'pauseQueue' | 'purgeQueue' | 'resumeQueue' | 'runTask' | 'updateQueue';
export declare type CloudTasksTaskConfig = CloudTasksCreateQueueCall | CloudTasksCreateTaskCall | CloudTasksDeleteQueueCall | CloudTasksDeleteTaskCall | CloudTasksGetQueueCall | CloudTasksGetTaskCall | CloudTasksListQueuesCall | CloudTasksListTasksCall | CloudTasksPauseQueueCall | CloudTasksPurgeQueueCall | CloudTasksResumeQueueCall | CloudTasksRunTaskCall | CloudTasksUpdateQueueCall;
export interface CloudTasksMethodCall<M extends CloudTasksMethod, R, O extends CallOptions | CallOptionsWithPagination> {
    client: string;
    method: M;
    request: R;
    options?: O;
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
export interface CreateTaskRequest extends CloudTasks.CreateTaskRequest {
    task: Partial<Task> & Partial<CloudTasks.Task>;
}
export interface Task {
    httpRequest: {
        url: String;
        httpMethod?: string;
        headers?: IMap<string>;
        body?: any;
        oauthToken?: any;
        oidcToken?: any;
    };
    payloadType: 'http_request' | 'app_engine_http_request';
}
