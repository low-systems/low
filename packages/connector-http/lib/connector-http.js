"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Https = require("https");
const Url = require("url");
const GetBody = require("get-body");
const CookieHelper = require("cookie");
const Pako = require("pako");
const connector_1 = require("low/src/connectors/connector");
const site_1 = require("./site");
const http_error_1 = require("./http-error");
const connector_run_error_1 = require("low/src/connectors/connector-run-error");
const object_compiler_1 = require("low/src/object-compiler");
const POSSIBLE_HTTPS_HEADERS = {
    'x-forwarded-proto': 'https',
    'front-end-https': 'on',
    'x-arr_ssl': true,
    'cloudfront-forwarded-proto': 'https',
    'x-forwarded-scheme': 'https',
    'x-forwarded-protocol': 'https',
    'x-forwarded-ssl': 'on',
    'x-url-scheme': 'https'
};
class ConnectorHttp extends connector_1.Connector {
    constructor() {
        super(...arguments);
        this.sites = {};
        this.hostnameCache = {};
    }
    async setup() {
        if (this.config.httpOptions) {
            this.httpServer = Http.createServer(this.config.httpOptions, this.requestHandler.bind(this));
        }
        if (this.config.httpsOptions) {
            this.httpsServer = Https.createServer(this.config.httpsOptions, this.requestHandler.bind(this));
        }
        for (const [siteName, siteConfig] of Object.entries(this.config.sites)) {
            const site = new site_1.Site(siteName, siteConfig);
            this.sites[siteName] = site;
        }
        await this.setupTasks();
    }
    async setupTask(task, config) {
        for (const site of config.sites) {
            this.sites[site].registerRoutes(task, config);
        }
    }
    async requestHandler(request, response) {
        const input = {
            url: this.getRequestUrl(request),
            verb: request.method || 'GET'
        };
        try {
            input.site = this.getSiteFromHostname(input.url.hostname);
            const match = input.site.matchRoute(input.url.pathname, input.verb);
            input.params = match.params;
            input.route = match.route;
            input.query = this.getQuerystringObject(input.url);
            input.cookies = CookieHelper.parse(request.headers.cookie || '');
            input.body = await GetBody.parse(request, request.headers);
            const context = await this.runTask(match.route.task, input, match.route.config);
            const output = await object_compiler_1.ObjectCompiler.compile(match.route.config.output, context);
            this.sendResponse(response, output);
        }
        catch (err) {
            await this.handleError(response, err, input);
        }
    }
    getSiteFromHostname(hostname) {
        if (this.hostnameCache.hasOwnProperty(hostname)) {
            return this.hostnameCache[hostname];
        }
        const foundSite = Object.values(this.sites).find(site => site.config.hostnames.includes(hostname));
        if (!foundSite) {
            throw new http_error_1.HttpError('Invalid hostname', 400);
        }
        this.hostnameCache[hostname] = foundSite;
        return foundSite;
    }
    getRequestProtocol(request) {
        for (const [name, value] of Object.entries(POSSIBLE_HTTPS_HEADERS)) {
            if (typeof value === 'boolean' && request.headers[name]) {
                return 'https';
            }
            else if (request.headers[name] === value) {
                return 'https';
            }
        }
        return 'http';
    }
    getRequestUrl(request) {
        const protocol = this.getRequestProtocol(request);
        const host = request.headers.host || 'localhost';
        const path = request.url || '/';
        const url = new Url.URL(path, `${protocol}://${host}`);
        return url;
    }
    getQuerystringObject(url) {
        const query = {};
        for (let key of url.searchParams.keys()) {
            key = key.replace('[]', '');
            query[key] = url.searchParams.getAll(key);
        }
        return query;
    }
    async handleError(response, error, input) {
        const statusCode = error instanceof http_error_1.HttpError ? error.statusCode : 500;
        try {
            const handlers = this.mergeErrorHandlers(input.site);
            const handler = this.findErrorHandler(handlers, statusCode);
            const task = this.env.getTask(handler.taskName);
            const config = input.route && input.route.config || {};
            let data = {};
            let errors = {};
            if (error instanceof connector_run_error_1.ConnectorRunError) {
                data = error.context.data;
                errors = error.context.errors;
            }
            const context = await this.runTask(task, input, config, data, errors);
            const output = await object_compiler_1.ObjectCompiler.compile(handler.output, context);
            this.sendResponse(response, output);
        }
        catch (err) {
            this.sendResponse(response, {
                body: error.message,
                statusCode: statusCode,
                statusMessage: error.message
            });
        }
    }
    mergeErrorHandlers(site) {
        const handlers = [
            ...(site && site.config.errorHandlers || []),
            ...(this.config.errorHandlers || [])
        ];
        return handlers;
    }
    findErrorHandler(handlers, statusCode = 500) {
        for (const handler of handlers) {
            if (statusCode >= handler.statusCodeMin && statusCode <= handler.statusCodeMax) {
                return handler;
            }
        }
        throw new Error('No error handler found');
    }
    sendResponse(response, output) {
        response.statusCode = output.statusCode || 200;
        response.statusMessage = output.statusMessage || 'OK';
        this.setResponseHeaders(response, output.headers);
        this.setResponseCookies(response, output.cookies);
        this.setResponseBody(response, output.body, output.gzip);
        response.end();
    }
    setResponseHeaders(response, headers, site) {
        if (site && this.config.responseHeaders) {
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
    setResponseCookies(response, cookies) {
        if (cookies) {
            for (const [cookieName, cookie] of Object.entries(cookies)) {
                const cookieString = cookie.value ?
                    CookieHelper.serialize(cookieName, cookie.value, cookie.options) :
                    CookieHelper.serialize(cookieName, '', { expires: new Date(0) });
                response.setHeader('Set-Cookie', cookieString);
            }
        }
    }
    getContentType(response, body) {
        const contentType = response.getHeader('content-type');
        if (Array.isArray(contentType)) {
            return contentType[0];
        }
        else if (contentType) {
            return contentType.toString();
        }
        const bodyType = typeof body;
        if (bodyType === 'undefined' || body === null) {
            return 'text/plain';
        }
        if (bodyType === 'object') {
            return 'application/json';
        }
        else {
            return 'text/html';
        }
    }
    setResponseBody(response, body, gzip = false) {
        const bodyType = typeof body;
        if (bodyType === 'undefined' || body === null) {
            return;
        }
        let contentType = this.getContentType(response, body);
        let bodyBuffer = Buffer.from([]);
        if (Buffer.isBuffer(body)) {
            bodyBuffer = body;
        }
        else if (bodyType === 'object') {
            const bodyJson = JSON.stringify(body);
            bodyBuffer = Buffer.from(bodyJson);
        }
        else {
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
}
exports.ConnectorHttp = ConnectorHttp;
//# sourceMappingURL=connector-http.js.map