import UrlPattern = require("url-pattern");
import { TaskConfig } from "low/src/environment";
import { HttpVerbFlags, HttpVerb } from "./http-verbs";
import { HttpTaskConfig } from "./connector-http";
export declare class Site {
    name: string;
    config: SiteConfig;
    routes: Route[];
    constructor(name: string, config: SiteConfig);
    registerRoutes(task: TaskConfig, config: HttpTaskConfig): void;
    private routeMatchCache;
    matchRoute(path: string, verb: HttpVerb): RouteMatch | void;
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
