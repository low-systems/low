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
const v2beta3 = require('@google-cloud/tasks').v2beta3;
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
            const client = new v2beta3.CloudTasksClient(config);
            this.clients[name] = client;
        }
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!exports.ALLOWED_CLOUD_TASKS_METHODS.includes(coreConfig.method)) {
                throw new Error(`Invalid Cloud Tasks method '${coreConfig.method}'`);
            }
            const client = this.clients[coreConfig.client];
            switch (coreConfig.method) {
                case ('createQueue'):
                    return yield client.createQueue(coreConfig.request, coreConfig.options);
                case ('createTask'):
                    if (coreConfig.request.task.appEngineHttpRequest && coreConfig.request.task.appEngineHttpRequest.body) {
                        const inputBody = coreConfig.request.task.appEngineHttpRequest.body;
                        const body = typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody, null, 2);
                        coreConfig.request.task.appEngineHttpRequest.body = Buffer.from(body).toString('base64');
                    }
                    if (coreConfig.request.task.httpRequest && coreConfig.request.task.httpRequest.body) {
                        const inputBody = coreConfig.request.task.httpRequest.body;
                        const body = typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody, null, 2);
                        coreConfig.request.task.httpRequest.body = Buffer.from(body).toString('base64');
                    }
                    return yield client.createTask(coreConfig.request, coreConfig.options);
                case ('deleteQueue'):
                    return yield client.deleteQueue(coreConfig.request, coreConfig.options);
                case ('deleteTask'):
                    return yield client.deleteTask(coreConfig.request, coreConfig.options);
                case ('getQueue'):
                    return yield client.getQueue(coreConfig.request, coreConfig.options);
                case ('getTask'):
                    return yield client.getTask(coreConfig.request, coreConfig.options);
                case ('listQueues'):
                    return yield client.listQueues(coreConfig.request, coreConfig.options);
                case ('listTasks'):
                    return yield client.listTasks(coreConfig.request, coreConfig.options);
                case ('pauseQueue'):
                    return yield client.pauseQueue(coreConfig.request, coreConfig.options);
                case ('purgeQueue'):
                    return yield client.purgeQueue(coreConfig.request, coreConfig.options);
                case ('resumeQueue'):
                    return yield client.resumeQueue(coreConfig.request, coreConfig.options);
                case ('runTask'):
                    return yield client.runTask(coreConfig.request, coreConfig.options);
                case ('updateQueue'):
                    return yield client.updateQueue(coreConfig.request, coreConfig.options);
            }
        });
    }
}
exports.CloudTasksDoer = CloudTasksDoer;
//# sourceMappingURL=cloud-tasks-doer.js.map