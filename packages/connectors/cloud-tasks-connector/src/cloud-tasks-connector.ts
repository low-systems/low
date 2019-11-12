import * as Http from 'http';
import * as Https from 'https';

import CloudTasksClient, { CloudTasksConfig, Queue } from '@google-cloud/tasks';

import { Connector, TaskConfig, IMap } from 'low';
import { CallOptions } from 'grpc';

export class CloudTasksConnector extends Connector<CloudTasksConnectorConfig, CloudTasksSecrets, CloudTasksInput> {
  httpServer?: Http.Server;
  httpsServer?: Https.Server;
  queueTaskMap: IMap<{ task: TaskConfig, config: CloudTasksTaskConfig}> = {};

  _client?: CloudTasksClient;

  get client(): CloudTasksClient {
    if (!this._client) {
      throw new Error('No client setup for the CloudTasksConnector. Have you initialised your environment?')
    }
    return this._client;
  }

  async setup() {
    this.setupServers();
    this.setupClients();
    await this.setupTasks();
  }

  setupServers() {
    if (this.config.httpOptions) {
      this.httpServer = Http.createServer(this.config.httpOptions.serverOptions, this.requestHandler.bind(this));
      const port = this.getPort(this.config.httpOptions.port);
      this.httpServer.listen(port);
    }

    if (this.config.httpsOptions) {
      this.httpsServer = Https.createServer(this.config.httpsOptions.serverOptions, this.requestHandler.bind(this));
      const port = this.getPort(this.config.httpsOptions.port);
      this.httpsServer.listen(port);
    }
  }

  getPort(portOrVar: number | string) {
    if (typeof portOrVar === 'number') {
      return portOrVar;
    }

    const envPort = process.env[portOrVar];
    if (typeof envPort === 'undefined') {
      throw new Error(`Cannot load port number from environment variable '${portOrVar}' as it has not been set`);
    }

    const port = +envPort;
    if (Number.isNaN(port)) {
      throw new Error(`Port number '${envPort}' loaded from '${portOrVar}' is not a number.`);
    }

    return port;
  }

  setupClients() {
    const config = this.config.clientConfig;
    if (this.secrets.clientCredentials) {
      config.credentials = this.secrets.clientCredentials;
    }
    this._client = new CloudTasksClient(config);
  }

  async setupTask(task: TaskConfig, config: CloudTasksTaskConfig) {
    const queue = await this.createQueue(config.queue);
    this.queueTaskMap[queue.name] = { task, config };
  }

  async createQueue(tasksQueueConfig: Queue) {
    let queue = await this.client.getQueue({ name: tasksQueueConfig.name });

    if (!Array.isArray(queue)) {
      const parent = tasksQueueConfig.name.split('/').splice(0, 4).join('/');
      queue = await this.client.createQueue({
        parent: parent,
        queue: tasksQueueConfig
      });
    }

    return queue[0];
  }

  async requestHandler(request: Http.IncomingMessage, response: Http.ServerResponse) {
    // App Engine Tasks use appEngineHttpRequest configs
    // see: https://googleapis.dev/nodejs/tasks/latest/google.cloud.tasks.v2beta2.html#.AppEngineHttpRequest
    // and: https://cloud.google.com/tasks/docs/creating-appengine-tasks
    // Handling these requests be like
    // see: https://cloud.google.com/tasks/docs/creating-appengine-handlers
    // Check out these headers though for routing Cloud Tasks to low tasks
    // QUESTION: Why are paths set in Cloud Task App Engine request configs? The sample given does use them but are they necessary
    // What about Creating HTTP Target tasks? That just looks like calling arbitrary HTTP endpoints?
    // QUESTION: Should this be restricted to just AppEngine stuff and renamed?
  }
}

export interface CloudTasksConnectorConfig {
  httpOptions?: HttpOptions;
  httpsOptions?: HttpsOptions;
  clientConfig: CloudTasksConfig;
}

export interface HttpOptions {
  serverOptions: Http.ServerOptions;
  port: number | string;
}

export interface HttpsOptions {
  serverOptions: Https.ServerOptions;
  port: number | string;
}

export interface CloudTasksSecrets {
  clientCredentials: any;
}

export interface CloudTasksTaskConfig {
  queue: Queue;
  callOptions: CallOptions;
}

export interface CloudTasksInput {
  PLACE_HOLDER: any;
}