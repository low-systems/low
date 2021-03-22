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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Http = __importStar(require("http"));
const Https = __importStar(require("https"));
const Url = __importStar(require("url"));
const GetBody = __importStar(require("get-body"));
const CookieHelper = __importStar(require("cookie"));
const Pako = __importStar(require("pako"));
const fast_safe_stringify_1 = __importDefault(require("fast-safe-stringify"));
const low_1 = require("low");
const site_1 = require("./site");
const http_error_1 = require("./http-error");
const POSSIBLE_HTTPS_HEADERS = {
    'x-forwarded-proto': 'https',
    'front-end-https': 'on',
    'x-arr-ssl': true,
    'cloudfront-forwarded-proto': 'https',
    'x-forwarded-scheme': 'https',
    'x-forwarded-protocol': 'https',
    'x-forwarded-ssl': 'on',
    'x-url-scheme': 'https'
};
class HttpConnector extends low_1.Connector {
    constructor() {
        super(...arguments);
        this.sites = {};
        this.hostnameCache = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.httpOptions) {
                try {
                    this.httpServer = Http.createServer(this.config.httpOptions.serverOptions, this.requestHandler.bind(this));
                    this.config.httpOptions.port = this.getPort(this.config.httpOptions.port);
                    yield this.startListening(this.httpServer, this.config.httpOptions.port);
                }
                catch (err) {
                    this.env.error(null, this.moduleType, `Error starting HTTP server: ${err.message}`);
                    throw err;
                }
            }
            if (this.config.httpsOptions) {
                try {
                    this.httpsServer = Https.createServer(this.config.httpsOptions.serverOptions, this.requestHandler.bind(this));
                    this.config.httpsOptions.port = this.getPort(this.config.httpsOptions.port);
                    yield this.startListening(this.httpsServer, this.config.httpsOptions.port);
                }
                catch (err) {
                    this.env.error(null, this.moduleType, `Error starting HTTPS server: ${err.message}`);
                    throw err;
                }
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
                const site = new site_1.Site(siteName, siteConfig);
                this.sites[siteName] = site;
            }
            yield this.setupTasks();
        });
    }
    startListening(server, port) {
        return new Promise((resolve, reject) => {
            server.listen(port)
                .on('error', (err) => reject(err))
                .on('listening', () => resolve());
        });
    }
    getPort(portOrVar) {
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
    setupTask(task, config) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const site of config.sites) {
                this.sites[site].registerRoutes(task, config);
            }
        });
    }
    requestHandler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = {
                url: this.getRequestUrl(request),
                verb: request.method || 'GET'
            };
            try {
                if (this.config.forceSecure && this.config.httpsOptions && input.url.protocol === 'http:') {
                    input.url.protocol = 'https';
                    input.url.port = '' + this.config.httpsOptions.port;
                    response.setHeader('location', input.url.toString());
                    response.statusCode = 301;
                    response.end();
                    return;
                }
                input.site = this.getSiteFromHostname(input.url.hostname);
                const match = input.site.matchRoute(input.url.pathname, input.verb);
                const connection = request.connection || request.socket || {};
                input.params = match.params;
                input.route = match.route;
                input.query = this.getQuerystringObject(input.url);
                input.cookies = CookieHelper.parse(request.headers.cookie || '');
                input.headers = request.headers;
                input.client = connection ? {
                    address: connection.remoteAddress,
                    port: connection.remotePort,
                    family: connection.remoteFamily
                } : undefined;
                input.body = yield this.getRequestBody(request);
                const context = yield this.runTask(match.route.task, input, match.route.config);
                const output = yield low_1.ObjectCompiler.compile(match.route.config.output, context);
                this.sendResponse(response, output, input.site);
            }
            catch (err) {
                yield this.handleError(response, err, input);
            }
        });
    }
    getSiteFromHostname(hostname) {
        if (this.hostnameCache.hasOwnProperty(hostname)) {
            return this.hostnameCache[hostname];
        }
        let foundSite = Object.values(this.sites).find(site => site.config.hostnames.includes(hostname));
        if (!foundSite && this.config.defaultSite && this.sites.hasOwnProperty(this.config.defaultSite)) {
            foundSite = this.sites[this.config.defaultSite];
        }
        if (!foundSite) {
            throw new http_error_1.HttpError('Invalid hostname', 400);
        }
        this.hostnameCache[hostname] = foundSite;
        return foundSite;
    }
    getRequestProtocol(request) {
        if (request.socket.hasOwnProperty('encrypted') && request.socket.encrypted === true) {
            return 'https';
        }
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
        try {
            const protocol = this.getRequestProtocol(request);
            const host = request.headers.host || 'localhost';
            const path = (request.url || '/').replace(/\/{2,}/g, '/');
            const url = new Url.URL(path, `${protocol}://${host}`);
            return url;
        }
        catch (err) {
            return new Url.URL('https://localhost/');
        }
    }
    getQuerystringObject(url) {
        const query = {};
        const keys = url.searchParams.keys();
        for (const key of Array.from(keys)) {
            const preparedKey = key.replace('[]', '');
            query[preparedKey] = url.searchParams.getAll(key);
        }
        return query;
    }
    getRequestBody(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (['GET', 'HEAD', 'DELETE'].includes(request.method || 'GET')) {
                    return {};
                }
                if (!request.headers.hasOwnProperty('content-type')) {
                    request.headers['content-type'] = 'text/plain';
                }
                const headers = request.headers;
                const body = yield GetBody.parse(request, headers);
                return body || {};
            }
            catch (err) {
                //TODO: Plain requests with no body cause `GetBody.parse()` to throw an error.
                //      Is it right to just return an empty object here or might there be other
                //      scenarios that would cause an exception where we'd want to handle things
                //      differently
                return {};
            }
        });
    }
    handleError(response, error, input) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`Handling error response: ${error.message}`);
            let statusCode = 500;
            try {
                statusCode = error instanceof http_error_1.HttpError ? error.statusCode : 500;
                const handlers = this.mergeErrorHandlers(input.site);
                const handler = this.findErrorHandler(handlers, statusCode);
                const task = this.env.getTask(handler.taskName);
                const config = input.route && input.route.config || {};
                let data = {};
                let errors = {};
                if (error instanceof low_1.ConnectorRunError) {
                    data = error.context.data;
                    errors = error.context.errors;
                }
                const context = yield this.runTask(task, input, config, data, errors);
                const output = yield low_1.ObjectCompiler.compile(handler.output, context);
                this.sendResponse(response, output, input.site);
            }
            catch (err) {
                console.error(`Error handling error response: ${err.message}`);
                this.sendResponse(response, {
                    body: error.message,
                    statusCode: statusCode,
                    statusMessage: error.message
                });
            }
        });
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
    sendResponse(response, output, site) {
        try {
            response.statusCode = output.statusCode || 200;
            response.statusMessage = output.statusMessage || 'OK';
            this.setResponseHeaders(response, output.headers, site);
            this.setResponseCookies(response, output.cookies);
            this.setResponseBody(response, output.body, output.gzip);
        }
        catch (err) {
            console.error(`Error sending response: ${err.message}`);
            response.setHeader('response-error', err.message);
            response.statusCode = 500;
        }
        response.end();
    }
    setResponseHeaders(response, headers, site) {
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
    setResponseCookies(response, cookies) {
        if (cookies) {
            const cookieJar = [];
            for (const [cookieName, cookie] of Object.entries(cookies)) {
                const cookieString = cookie ?
                    CookieHelper.serialize(cookieName, cookie.value || '', cookie.options) :
                    CookieHelper.serialize(cookieName, '', { expires: new Date(0) });
                cookieJar.push(cookieString);
            }
            response.setHeader('Set-Cookie', cookieJar);
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
        try {
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
                const bodyJson = fast_safe_stringify_1.default(body);
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
        catch (err) {
            console.error(`Error setting response body: ${err.message}`);
            throw err;
        }
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.httpServer) {
                yield this.closeServer(this.httpServer);
            }
            if (this.httpsServer) {
                yield this.closeServer(this.httpsServer);
            }
        });
    }
    closeServer(server) {
        return new Promise((resolve, reject) => {
            const address = server.address;
            this.env.debug(null, this.moduleType, `Closing down server on address ${address}`);
            let closed = false;
            server.on('close', () => {
                if (closed)
                    return;
                this.env.debug(null, this.moduleType, `Successfully down server on address ${address}`);
                closed = true;
                resolve();
            });
            server.close();
            setTimeout(() => {
                if (closed)
                    return;
                this.env.debug(null, this.moduleType, `Server close timeout reached for server on ${address}`);
                closed = true;
                resolve();
            }, 10000);
        });
    }
}
exports.HttpConnector = HttpConnector;
//# sourceMappingURL=http-connector.js.map