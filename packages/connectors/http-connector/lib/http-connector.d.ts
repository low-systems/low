/// <reference types="node" />
import * as Http from 'http';
import * as Https from 'https';
import * as Url from 'url';
import * as CookieHelper from 'cookie';
import { Connector, TaskConfig, ConnectorRunError } from 'low';
import { Site, SiteMap, SiteConfig, Route } from './site';
import { HttpVerb } from './http-verbs';
import { HttpError } from './http-error';
export declare class HttpConnector extends Connector<HttpConnectorConfig, any, HttpInput> {
    httpServer?: Http.Server;
    httpsServer?: Https.Server;
    sites: SiteMap;
    setup(): Promise<void>;
    getPort(portOrVar: number | string): number;
    setupTask(task: TaskConfig, config: HttpTaskConfig): Promise<void>;
    requestHandler(request: Http.IncomingMessage, response: Http.ServerResponse): Promise<void>;
    hostnameCache: HostnameCache;
    getSiteFromHostname(hostname: string): Site;
    getRequestProtocol(request: Http.IncomingMessage): 'http' | 'https';
    getRequestUrl(request: Http.IncomingMessage): Url.URL;
    getQuerystringObject(url: Url.URL): any;
    getRequestBody(request: Http.IncomingMessage): Promise<any>;
    handleError(response: Http.ServerResponse, error: Error | HttpError | ConnectorRunError, input: HttpInput): Promise<void>;
    mergeErrorHandlers(site?: Site): ErrorHandler[];
    findErrorHandler(handlers: ErrorHandler[], statusCode?: number): ErrorHandler;
    sendResponse(response: Http.ServerResponse, output: HttpOutput, site?: Site): void;
    setResponseHeaders(response: Http.ServerResponse, headers?: HeaderMap, site?: Site): void;
    setResponseCookies(response: Http.ServerResponse, cookies?: CookieMap): void;
    getContentType(response: Http.ServerResponse, body: any): string;
    setResponseBody(response: Http.ServerResponse, body: any, gzip?: boolean): void;
    destroy(): Promise<void>;
}
export interface HttpConnectorConfig {
    httpOptions?: HttpOptions;
    httpsOptions?: HttpsOptions;
    sites: {
        [name: string]: SiteConfig;
    };
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
    client?: {
        address?: string;
        port?: number;
        family?: string;
    };
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
