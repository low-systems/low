"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Https = require("https");
const Url = require("url");
const Querystring = require("querystring");
const connector_1 = require("low/src/connectors/connector");
const site_1 = require("./site");
class ConnectorHttp extends connector_1.Connector {
    constructor() {
        super(...arguments);
        this.sites = {};
        this.hostnameMap = {};
    }
    async setup() {
        if (this.config.httpOptions) {
            this.httpServer = Http.createServer(this.config.httpOptions, async (request, response) => {
                await this.requestHandler(request, response, false);
            });
        }
        if (this.config.httpsOptions) {
            this.httpsServer = Https.createServer(this.config.httpsOptions, async (request, response) => {
                await this.requestHandler(request, response, true);
            });
        }
        for (const [siteName, siteConfig] of Object.entries(this.config.sites)) {
            const site = new site_1.Site(siteName, siteConfig);
            this.sites[siteName] = site;
            for (const hostname of siteConfig.hostnames) {
                this.hostnameMap[hostname] = site;
            }
        }
        await this.setupTasks();
    }
    async setupTask(task, config) {
        for (const site of config.sites) {
            this.sites[site].registerRoutes(task, config);
        }
    }
    async requestHandler(request, response, secure) {
        const host = request.headers.host || 'localhost';
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
        const verb = request.method || 'GET';
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
    getQuerystringObject(search = '') {
        const querystring = search.startsWith('?') ? search.substr(1) : search;
        return Querystring.parse(querystring);
    }
    getHeadersObject(requestHeaders = {}) {
        const headers = {};
        for (const [header, value] of Object.entries(requestHeaders)) {
            headers[header] = value;
        }
        return headers;
    }
    getCookiesObject(request) {
        //TODO: Cookie parser!
        return {};
    }
    getBodyObject(request) {
        //TODO: Body parser!
        return {};
    }
}
exports.ConnectorHttp = ConnectorHttp;
//# sourceMappingURL=connector-http.js.map