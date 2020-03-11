import * as Http from 'http';
import * as Https from 'https';
import * as Url from 'url';

import * as GetBody from 'get-body';
import * as CookieHelper from 'cookie';
import * as Pako from 'pako';
import SafeStringify from 'fast-safe-stringify';

import { Connector, TaskErrorMap, TaskConfig, ConnectorRunError, ObjectCompiler } from 'low';

import { Site, SiteMap, SiteConfig, Route } from './site';
import { HttpVerb } from './http-verbs';
import { HttpError } from './http-error';
import { TLSSocket } from 'tls';

const POSSIBLE_HTTPS_HEADERS = {
  'x-forwarded-proto': 'https',           //Recommended way for load balancers and proxies
  'front-end-https': 'on',                //Microsoft's way
  'x-arr-ssl': true,                      //Another Microsoft way
  'cloudfront-forwarded-proto': 'https',  //Amazon's CloudFront way
  'x-forwarded-scheme': 'https',          //KeyCDN's way
  'x-forwarded-protocol': 'https',        //Some other ways
  'x-forwarded-ssl': 'on',
  'x-url-scheme': 'https'
};

export class HttpConnector extends Connector<HttpConnectorConfig, any, HttpInput> {
  httpServer?: Http.Server;
  httpsServer?: Https.Server;
  sites: SiteMap = {};

  async setup() {
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

    if (this.config.contentTypeHandlers) {
      if (this.config.contentTypeHandlers.formTypes) {
        for (const type of this.config.contentTypeHandlers.formTypes) {
          GetBody.formTypes.push(type);
        }
      }

      if (this.config.contentTypeHandlers.jsonTypes) {
        for (const type of this.config.contentTypeHandlers.jsonTypes) {
          GetBody.jsonTypes.push(type);
        }
      }

      if (this.config.contentTypeHandlers.textTypes) {
        for (const type of this.config.contentTypeHandlers.textTypes) {
          GetBody.textTypes.push(type);
        }
      }
    }

    for (const [siteName, siteConfig] of Object.entries(this.config.sites)) {
      const site = new Site(siteName, siteConfig);
      this.sites[siteName] = site;
    }

    await this.setupTasks();
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

  async setupTask(task: TaskConfig, config: HttpTaskConfig) {
    for (const site of config.sites) {
      this.sites[site].registerRoutes(task, config);
    }
  }

  async requestHandler(request: Http.IncomingMessage, response: Http.ServerResponse) {
    const input: HttpInput = {
      url: this.getRequestUrl(request),
      verb: request.method as HttpVerb || 'GET'
    };

    try {
      input.site = this.getSiteFromHostname(input.url.hostname);

      const match = input.site.matchRoute(input.url.pathname, input.verb);

      input.params = match.params;
      input.route = match.route;
      input.query = this.getQuerystringObject(input.url);
      input.cookies = CookieHelper.parse(request.headers.cookie || '');
      input.headers = request.headers;
      input.body = await this.getRequestBody(request);

      const context = await this.runTask(match.route.task, input, match.route.config);
      const output = await ObjectCompiler.compile(match.route.config.output, context);

      this.sendResponse(response, output, input.site);
    } catch(err) {
      await this.handleError(response, err, input);
    }
  }

  hostnameCache: HostnameCache = {};
  getSiteFromHostname(hostname: string) {
    if (this.hostnameCache.hasOwnProperty(hostname)) {
      return this.hostnameCache[hostname];
    }

    let foundSite = Object.values(this.sites).find(site => site.config.hostnames.includes(hostname));

    if (!foundSite && this.config.defaultSite && this.sites.hasOwnProperty(this.config.defaultSite)) {
      foundSite = this.sites[this.config.defaultSite];
    }

    if (!foundSite) {
      throw new HttpError('Invalid hostname', 400);
    }

    this.hostnameCache[hostname] = foundSite;
    return foundSite;
  }

  getRequestProtocol(request: Http.IncomingMessage): 'http' | 'https' {
    if (request.socket.hasOwnProperty('encrypted') && (request.socket as TLSSocket).encrypted === true) {
      return 'https';
    }

    for (const [name, value] of Object.entries(POSSIBLE_HTTPS_HEADERS)) {
      if (typeof value === 'boolean' && request.headers[name]) {
        return 'https';
      } else if (request.headers[name] === value) {
        return 'https';
      }
    }

    return 'http';
  }

  getRequestUrl(request: Http.IncomingMessage) {
    const protocol = this.getRequestProtocol(request);
    const host = request.headers.host || 'localhost';
    const path = request.url || '/';
    const url = new Url.URL(path, `${protocol}://${host}`);
    return url;
  }

  getQuerystringObject(url: Url.URL) {
    const query: any = {};

    const keys = url.searchParams.keys();
    for (const key of Array.from(keys)) {
      const preparedKey = key.replace('[]', '');
      query[preparedKey] = url.searchParams.getAll(key);
    }

    return query;
  }

  async getRequestBody(request: Http.IncomingMessage) {
    try {
      if (['GET', 'HEAD', 'DELETE'].includes(request.method || 'GET')) {
        return {};
      }

      if (!request.headers.hasOwnProperty('content-type')) {
        request.headers['content-type'] = 'text/plain';
      }

      const headers = request.headers as GetBody.Headers;
      const body = await GetBody.parse(request, headers);
      return body || {};
    } catch(err) {
      //TODO: Plain requests with no body cause `GetBody.parse()` to throw an error.
      //      Is it right to just return an empty object here or might there be other
      //      scenarios that would cause an exception where we'd want to handle things
      //      differently
      return {};
    }
  }

  async handleError(response: Http.ServerResponse, error: Error | HttpError | ConnectorRunError, input: HttpInput) {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    try {
      const handlers = this.mergeErrorHandlers(input.site);
      const handler = this.findErrorHandler(handlers, statusCode);

      const task = this.env.getTask(handler.taskName);
      const config = input.route && input.route.config || {};
      let data: any = {};
      let errors: TaskErrorMap = {};

      if (error instanceof ConnectorRunError) {
        data = error.context.data;
        errors = error.context.errors;
      }

      const context = await this.runTask(task, input, config, data, errors);
      const output = await ObjectCompiler.compile(handler.output, context);

      this.sendResponse(response, output, input.site);
    } catch (err) {
      this.sendResponse(response, {
        body: error.message,
        statusCode: statusCode,
        statusMessage: error.message
      });
    }
  }

  mergeErrorHandlers(site?: Site) {
    const handlers: ErrorHandler[] = [
      ...(site && site.config.errorHandlers || []),
      ...(this.config.errorHandlers || [])
    ];

    return handlers;
  }

  findErrorHandler(handlers: ErrorHandler[], statusCode: number = 500) {
    for (const handler of handlers) {
      if (statusCode >= handler.statusCodeMin && statusCode <= handler.statusCodeMax) {
        return handler;
      }
    }

    throw new Error('No error handler found');
  }

  sendResponse(response: Http.ServerResponse, output: HttpOutput, site?: Site) {
    response.statusCode = output.statusCode || 200;
    response.statusMessage = output.statusMessage || 'OK';
    this.setResponseHeaders(response, output.headers, site);
    this.setResponseCookies(response, output.cookies);
    this.setResponseBody(response, output.body, output.gzip);
    response.end();
  }

  setResponseHeaders(response: Http.ServerResponse, headers?: HeaderMap, site?: Site) {
    if (this.config.responseHeaders) {
      for (const [name, value] of Object.entries(this.config.responseHeaders)) {
        response.setHeader(name.toLowerCase(), value);
      }
    }

    if (site && site.config.responseHeaders) {
      for (const [name, value] of Object.entries(site.config.responseHeaders)) {
        response.setHeader(name.toLowerCase(), value);
      }
    }

    if (headers) {
      for (const [name, value] of Object.entries(headers)) {
        response.setHeader(name.toLowerCase(), value);
      }
    }
  }

  setResponseCookies(response: Http.ServerResponse, cookies?: CookieMap) {
    if (cookies) {
      const cookieJar: string[] = [];
      for (const [cookieName, cookie] of Object.entries(cookies)) {
        const cookieString = cookie ?
          CookieHelper.serialize(cookieName, cookie.value || '', cookie.options) :
          CookieHelper.serialize(cookieName, '', { expires: new Date(0) });
          cookieJar.push(cookieString);
      }
      response.setHeader('Set-Cookie', cookieJar);
    }
  }

  getContentType(response: Http.ServerResponse, body: any) {
    const contentType = response.getHeader('content-type');

    if (Array.isArray(contentType)) {
      return contentType[0];
    } else if (contentType) {
      return contentType.toString();
    }

    const bodyType = typeof body;
    if (bodyType === 'undefined' || body === null) {
      return 'text/plain';
    }

    if (bodyType === 'object') {
      return 'application/json';
    } else {
      return 'text/html';
    }
  }

  setResponseBody(response: Http.ServerResponse, body: any, gzip: boolean = false) {
    const bodyType = typeof body;
    if (bodyType === 'undefined' || body === null) {
      return;
    }

    let contentType = this.getContentType(response, body);
    let bodyBuffer = Buffer.from([]);

    if (Buffer.isBuffer(body)) {
      bodyBuffer = body;
    } else if (bodyType === 'object') {
      const bodyJson = SafeStringify(body);
      bodyBuffer = Buffer.from(bodyJson);
    } else {
      const bodyString = body.toString();
      bodyBuffer = Buffer.from(bodyString);
    }

    if (gzip) {
      const zipped = Pako.gzip(bodyBuffer);
      bodyBuffer = Buffer.from(zipped);

      response.setHeader('content-encoding', 'gzip');
      response.setHeader('content-length', bodyBuffer.length);

      // Clean up unnecessary stuff from the content type
      if (contentType.indexOf('charset') > -1) {
        contentType = contentType.substr(0, contentType.indexOf(';'));
      }
      contentType += '; charset=x-user-defined-binary';
    }

    response.removeHeader('content-type');
    response.setHeader('content-type', contentType);

    response.write(bodyBuffer);
  }

  async destroy() {
    if (this.httpServer) {
      this.httpServer.close();
    }

    if (this.httpsServer) {
      this.httpsServer.close();
    }
  }
}

export interface HttpConnectorConfig {
  httpOptions?: HttpOptions;
  httpsOptions?: HttpsOptions;
  sites: { [name: string]: SiteConfig };
  defaultSite?: string;
  errorHandlers?: ErrorHandler[];
  responseHeaders?: HeaderMap;
  contentTypeHandlers?: {
    formTypes?: string[];
    jsonTypes?: string[];
    textTypes?: string[];
  };
}

export interface HttpOptions {
  serverOptions: Http.ServerOptions;
  port: number | string;
}

export interface HttpsOptions {
  serverOptions: Https.ServerOptions;
  port: number | string;
}

export interface HostnameCache {
  [hostname: string]: Site;
}

export interface HttpTaskConfig {
  patterns: string[];
  sites: string[];
  output: HttpOutput;
  verbs?: HttpVerb[];
  priority?: number;
}

export interface HttpInput {
  url: Url.URL;
  verb: HttpVerb;
  query?: any;
  cookies?: any;
  body?: any;
  site?: Site;
  headers?: any;
  params?: any;
  route?: Route;
}

export interface HttpOutput {
  body: any;
  statusCode?: number;
  statusMessage?: string;
  headers?: HeaderMap;
  cookies?: CookieMap;
  gzip?: boolean;
}

export interface HeaderMap {
  [name: string]: string | number | string[];
}

export interface CookieMap {
  [name: string]: Cookie | null;
}

export interface Cookie {
  value?: string;
  options?: CookieHelper.CookieSerializeOptions;
}

export interface ErrorHandler {
  statusCodeMin: number;
  statusCodeMax: number;
  taskName: string;
  output: HttpOutput;
}