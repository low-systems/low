/// <reference types="node" />
import * as Http from 'http';
import * as Https from 'https';
import * as Querystring from 'querystring';
import { Connector } from 'low/src/connectors/connector';
import { TaskConfig } from 'low/src/environment';
import { Site, SiteMap, SiteConfig } from './site';
import { HttpVerb } from './http-verbs';
export declare class ConnectorHttp extends Connector<ConnectorHttpConfig, any> {
    httpServer: Http.Server | undefined;
    httpsServer: Http.Server | undefined;
    sites: SiteMap;
    hostnameMap: HostnameMap;
    setup(): Promise<void>;
    setupTask(task: TaskConfig, config: HttpTaskConfig): Promise<void>;
    requestHandler(request: Http.IncomingMessage, response: Http.ServerResponse, secure: boolean): Promise<void>;
    getQuerystringObject(search?: string): Querystring.ParsedUrlQuery;
    getHeadersObject(requestHeaders?: Http.IncomingHttpHeaders): any;
    getCookiesObject(request: Http.IncomingMessage): {};
    getBodyObject(request: Http.IncomingMessage): {};
}
export interface ConnectorHttpConfig {
    httpOptions?: Http.ServerOptions;
    httpsOptions?: Https.ServerOptions;
    sites: {
        [name: string]: SiteConfig;
    };
}
export interface HostnameMap {
    [hostname: string]: Site;
}
export interface HttpTaskConfig {
    patterns: string[];
    sites: string[];
    verbs?: HttpVerb[];
    priority?: number;
}
