export declare enum HttpVerbFlags {
    GET = 1,
    HEAD = 2,
    POST = 4,
    PUT = 8,
    DELETE = 16,
    CONNECT = 32,
    OPTIONS = 64,
    TRACE = 128,
    PATCH = 256
}
export declare type HttpVerb = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
export declare const ALL_HTTP_VERBS: HttpVerb[];
export declare function HttpVerbsFromArray(verbsArray?: HttpVerb[]): HttpVerbFlags;
