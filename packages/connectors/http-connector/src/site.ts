import UrlPattern = require("url-pattern");

import { TaskConfig } from "low";

import { HttpVerbFlags, HttpVerb, HttpVerbsFromArray } from "./http-verbs";
import { HttpTaskConfig, ErrorHandler, HeaderMap } from "./http-connector";
import { HttpError } from "./http-error";

export class Site {
  routes: Route[] = [];

  constructor(public name: string, public config: SiteConfig) { }

  registerRoutes(task: TaskConfig, config: HttpTaskConfig) {
    const verbs = HttpVerbsFromArray(config.verbs);
    for (const pattern of config.patterns) {
      const route: Route = {
        task,
        config,
        verbs,
        urlPattern: new UrlPattern(pattern, {
          segmentNameCharset: 'a-zA-Z0-9_-\\.',
          segmentValueCharset: 'a-zA-Z0-9-_~%\\.'
        })
      };
      this.routes.push(route);
    }
  }

  //IDEA: Perhaps use a CacheManager here
  private routeMatchCache: RouteMatchCache = {};
  matchRoute(path: string, verb: HttpVerb): RouteMatch {
    let preparedPath = path;

    if (path.length > 1 && this.config.stripTrailingSlash && path.endsWith('/')) {
      preparedPath = path.slice(0, -1);
    }

    const routeCacheKey = `${verb}: ${preparedPath}`;
    if (this.routeMatchCache.hasOwnProperty(routeCacheKey)) {
      return this.routeMatchCache[routeCacheKey];
    }

    const verbFlag = HttpVerbFlags[verb];

    const routeMatches: RouteMatch[] = [];
    for (const route of this.routes) {
      if ((verbFlag & route.verbs) === verbFlag) {
        const match = route.urlPattern.match(preparedPath);
        if (match) {
          routeMatches.push({
            route,
            params: match
          });
        }
      }
    }

    if (routeMatches.length === 0) {
      throw new HttpError('Invalid path', 404);
    } else if (routeMatches.length > 1) {
      routeMatches.sort((a, b) => (b.route.config.priority || 0) - (a.route.config.priority || 0));
    }

    this.routeMatchCache[routeCacheKey] = routeMatches[0];
    return routeMatches[0];
  }
}

export interface SiteConfig {
  hostnames: string[];
  errorHandlers?: ErrorHandler[];
  responseHeaders?: HeaderMap;
  stripTrailingSlash?: Boolean;
}

export interface Route {
  urlPattern: UrlPattern;
  verbs: HttpVerbFlags;
  task: TaskConfig;
  config: HttpTaskConfig;
}

export interface SiteMap {
  [name: string]: Site;
}

export interface RouteMatchCache {
  [key: string]: RouteMatch;
}

export interface RouteMatch {
  route: Route;
  params: any;
}