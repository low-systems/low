/// <reference types="node" />
import * as Http from 'http';
import * as Https from 'https';
import * as Url from 'url';
import * as CookieHelper from 'cookie';
import { Connector } from 'low/src/connectors/connector';
import { TaskConfig } from 'low/src/environment';
import { Site, SiteMap, SiteConfig, Route } from './site';
import { HttpVerb } from './http-verbs';
import { HttpError } from './http-error';
import { ConnectorRunError } from 'low/src/connectors/connector-run-error';
export declare class ConnectorHttp extends Connector<ConnectorHttpConfig, any, HttpInput> {
    httpServer?: Http.Server;
    httpsServer?: Https.Server;
    sites: SiteMap;
    setup(): Promise<void>;
    setupTask(task: TaskConfig, config: HttpTaskConfig): Promise<void>;
    requestHandler(request: Http.IncomingMessage, response: Http.ServerResponse): Promise<void>;
    hostnameCache: HostnameCache;
    getSiteFromHostname(hostname: string): Site;
    getRequestProtocol(request: Http.IncomingMessage): "https" | "http";
    getRequestUrl(request: Http.IncomingMessage): Url.URL;
    getQuerystringObject(url: Url.URL): any;
    handleError(response: Http.ServerResponse, error: Error | HttpError | ConnectorRunError, input: HttpInput): Promise<void>;
    mergeErrorHandlers(site?: Site): ErrorHandler[];
    findErrorHandler(handlers: ErrorHandler[], statusCode?: number): ErrorHandler;
    sendResponse(response: Http.ServerResponse, output: HttpOutput): void;
    setResponseHeaders(response: Http.ServerResponse, headers?: HeaderMap, site?: Site): void;
    setResponseCookies(response: Http.ServerResponse, cookies?: CookieMap): void;
    getContentType(response: Http.ServerResponse, body: any): string;
    setResponseBody(response: Http.ServerResponse, body: any, gzip?: boolean): void;
}
export interface ConnectorHttpConfig {
    httpOptions?: Http.ServerOptions;
    httpsOptions?: Https.ServerOptions;
    sites: {
        [name: string]: SiteConfig;
    };
    errorHandlers?: ErrorHandler[];
    responseHeaders?: HeaderMap;
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
    [name: string]: Cookie;
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
