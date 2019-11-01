"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UrlPattern = require("url-pattern");
const http_verbs_1 = require("./http-verbs");
const http_error_1 = require("./http-error");
class Site {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.routes = [];
        //IDEA: Perhaps use a CacheManager here
        this.routeMatchCache = {};
    }
    registerRoutes(task, config) {
        const verbs = http_verbs_1.HttpVerbsFromArray(config.verbs);
        for (const pattern of config.patterns) {
            const route = {
                task,
                config,
                verbs,
                urlPattern: new UrlPattern(pattern)
            };
            this.routes.push(route);
        }
    }
    matchRoute(path, verb) {
        const routeCacheKey = `${verb}: ${path}`;
        if (this.routeMatchCache.hasOwnProperty(routeCacheKey)) {
            return this.routeMatchCache[routeCacheKey];
        }
        const verbFlag = http_verbs_1.HttpVerbFlags[verb];
        const routeMatches = [];
        for (const route of this.routes) {
            if ((verbFlag & route.verbs) === verbFlag) {
                const match = route.urlPattern.match(path);
                if (match) {
                    routeMatches.push({
                        route,
                        params: match
                    });
                }
            }
        }
        if (routeMatches.length === 0) {
            throw new http_error_1.HttpError('Invalid path', 404);
        }
        else if (routeMatches.length > 1) {
            routeMatches.sort((a, b) => (b.route.config.priority || 0) - (a.route.config.priority || 0));
        }
        this.routeMatchCache[routeCacheKey] = routeMatches[0];
        return routeMatches[0];
    }
}
exports.Site = Site;
//# sourceMappingURL=site.js.map