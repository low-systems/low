import UrlPattern = require("url-pattern");

import { TaskConfig } from "low/src/environment";

import { HttpVerbFlags, HttpVerb, ALL_HTTP_VERBS, HttpVerbsFromArray } from "./http-verbs";
import { HttpTaskConfig } from "./connector-http";

export class Site {
  routes: Route[] = [];

  constructor(public name: string, public config: SiteConfig) { }

  registerRoutes(task: TaskConfig, patterns: string[], verbs: HttpVerb[] = ALL_HTTP_VERBS, config: HttpTaskConfig) {
    for (const pattern of patterns) {
      const route: Route = {
        task,
        config,
        verbs: HttpVerbsFromArray(verbs),
        urlPattern: new UrlPattern(pattern)
      };
      this.routes.push(route);
    }
  }

  //IDEA: Perhaps use a CacheManager here
  private routeMatchCache: RouteMatchCache = {};
  matchRoute(path: string, verb: HttpVerb): RouteMatch | void {
    const routeCacheKey = `${verb}: ${path}`;
    if (this.routeMatchCache.hasOwnProperty(routeCacheKey)) {
      return this.routeMatchCache[routeCacheKey];
    }

    const verbFlag = HttpVerbFlags[verb];

    const routeMatches: RouteMatch[] = [];
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
      return;
    } else if (routeMatches.length > 1) {
      routeMatches.sort((a, b) => (b.route.config.priority || 0) - (a.route.config.priority || 0));
    }

    this.routeMatchCache[routeCacheKey] = routeMatches[0];
    return routeMatches[0];
  }
}

export interface SiteConfig {
  hostnames: string[];
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