import * as Http from 'http';
import * as Https from 'https';
import * as Url from 'url';
import * as Querystring from 'querystring';

import { Connector } from 'low/src/connectors/connector';
import { TaskConfig } from 'low/src/environment';

import { Site, SiteMap, SiteConfig } from './site';
import { HttpVerb } from './http-verbs';

export class ConnectorHttp extends Connector<ConnectorHttpConfig, any> {
  httpServer: Http.Server | undefined;
  httpsServer: Http.Server | undefined;
  sites: SiteMap = {};
  hostnameMap: HostnameMap = {};

  async setup() {
    if (this.config.httpOptions) {
      this.httpServer = Http.createServer(this.config.httpOptions, async (request: Http.IncomingMessage, response: Http.ServerResponse) => {
        await this.requestHandler(request, response, false);
      });
    }

    if (this.config.httpsOptions) {
      this.httpsServer = Https.createServer(this.config.httpsOptions, async (request: Http.IncomingMessage, response: Http.ServerResponse) => {
        await this.requestHandler(request, response, true);
      });
    }

    for (const [siteName, siteConfig] of Object.entries(this.config.sites)) {
      const site = new Site(siteName, siteConfig);
      this.sites[siteName] = site;
      for (const hostname of siteConfig.hostnames) {
        this.hostnameMap[hostname] = site;
      }
    }

    await this.setupTasks();
  }

  async setupTask(task: TaskConfig, config: HttpTaskConfig) {
    for (const site of config.sites) {
      this.sites[site].registerRoutes(task, config);
    }
  }

  async requestHandler(request: Http.IncomingMessage, response: Http.ServerResponse, secure: boolean) {
    const host = request.headers.host as string || 'localhost';
    const hostname = host.split(':')[0];

    if (!this.hostnameMap.hasOwnProperty(hostname)) {
      response.statusCode = 400;
      response.statusMessage = 'Invalid hostname';
      response.setHeader('Content-Type', 'plain/text');
      response.end(`Invalid hostname ${hostname}`);
      return;
    }

    const protocol = secure ? 'https://' : 'http://';
    const path = request.url || '/';
    const url = new Url.URL(path, `${protocol}${host}`);
    const site = this.hostnameMap[hostname];
    const verb: HttpVerb = request.method as HttpVerb || 'GET';

    const match = site.matchRoute(path, verb);

    if (!match) {
      response.statusCode = 400;
      response.statusMessage = 'Invalid path';
      response.setHeader('Content-Type', 'plain/text');
      response.end(`Invalid path ${path}`);
      return;
    }

    const query = this.getQuerystringObject(url.search);
    const headers = this.getHeadersObject(request.headers);
    const cookies = this.getCookiesObject(request);
    const body = this.getBodyObject(request);

    const input = {
      url,
      verb,
      headers,
      query,
      cookies,
      body,
      params: match.params,
    };

    const output = await this.runTask(match.route.task, input, match.route.config);
    console.log(output);
    //TODO: Work out what to do with response
  }

  getQuerystringObject(search: string = '') {
    const querystring = search.startsWith('?') ? search.substr(1) : search;
    return Querystring.parse(querystring);
  }

  getHeadersObject(requestHeaders: Http.IncomingHttpHeaders = {}) {
    const headers: any = {};
    for (const [header, value] of Object.entries(requestHeaders)) {
      headers[header] = value;
    }
    return headers;
  }

  getCookiesObject(request: Http.IncomingMessage) {
    //TODO: Cookie parser!
    return {};
  }

  getBodyObject(request: Http.IncomingMessage) {
    //TODO: Body parser!
    return {};
  }
}

export interface ConnectorHttpConfig {
  httpOptions?: Http.ServerOptions;
  httpsOptions?: Https.ServerOptions;
  sites: { [name: string]: SiteConfig };
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