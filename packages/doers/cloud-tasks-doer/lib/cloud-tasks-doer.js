"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = require("@google-cloud/tasks");
const low_1 = require("low");
exports.ALLOWED_CLOUD_TASKS_METHODS = ['createQueue', 'createTask', 'deleteQueue', 'deleteTask', 'getQueue', 'getTask', 'listQueues', 'listTasks', 'pauseQueue', 'purgeQueue', 'resumeQueue', 'runTask', 'updateQueue'];
class CloudTasksDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.clients = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setupClients();
        });
    }
    setupClients() {
        for (const [name, config] of Object.entries(this.config.clientConfigs)) {
            if (this.secrets.clientCredentials && this.secrets.clientCredentials.hasOwnProperty(name)) {
                config.credentials = this.secrets.clientCredentials[name];
            }
            const client = new tasks_1.default(config);
            this.clients[name] = client;
        }
    }
    createQueue(tasksQueueConfig, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let queue = yield client.getQueue({ name: tasksQueueConfig.name });
            if (!Array.isArray(queue)) {
                const parent = tasksQueueConfig.name.split('/').splice(0, 4).join('/');
                queue = yield client.createQueue({
                    parent: parent,
                    queue: tasksQueueConfig
                });
            }
            return queue[0];
        });
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const responses = {};
            for (const call of coreConfig.calls) {
                try {
                    if (!exports.ALLOWED_CLOUD_TASKS_METHODS.includes(call.method)) {
                        throw new Error(`Invalid Cloud Tasks method '${call.method}'`);
                    }
                    const client = this.clients[call.client];
                    switch (call.method) {
                        case ('createQueue'):
                            responses[call.name] = yield client.createQueue(call.request, call.options);
                            break;
                        case ('createTask'):
                            responses[call.name] = yield client.createTask(call.request, call.options);
                            break;
                        case ('deleteQueue'):
                            responses[call.name] = yield client.deleteQueue(call.request, call.options);
                            break;
                        case ('deleteTask'):
                            responses[call.name] = yield client.deleteTask(call.request, call.options);
                            break;
                        case ('getQueue'):
                            responses[call.name] = yield client.getQueue(call.request, call.options);
                            break;
                        case ('getTask'):
                            responses[call.name] = yield client.getTask(call.request, call.options);
                            break;
                        case ('listQueues'):
                            responses[call.name] = yield client.listQueues(call.request, call.options);
                            break;
                        case ('listTasks'):
                            responses[call.name] = yield client.listTasks(call.request, call.options);
                            break;
                        case ('pauseQueue'):
                            responses[call.name] = yield client.pauseQueue(call.request, call.options);
                            break;
                        case ('purgeQueue'):
                            responses[call.name] = yield client.purgeQueue(call.request, call.options);
                            break;
                        case ('resumeQueue'):
                            responses[call.name] = yield client.resumeQueue(call.request, call.options);
                            break;
                        case ('runTask'):
                            responses[call.name] = yield client.runTask(call.request, call.options);
                            break;
                        case ('updateQueue'):
                            responses[call.name] = yield client.updateQueue(call.request, call.options);
                            break;
                    }
                }
                catch (err) {
                    if (call.haltOnError) {
                        break;
                    }
                }
                return responses;
            }
        });
    }
}
exports.CloudTasksDoer = CloudTasksDoer;
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
//# sourceMappingURL=cloud-tasks-doer.js.map