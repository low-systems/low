export enum HttpVerbFlags {
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

export type HttpVerb = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export const ALL_HTTP_VERBS: HttpVerb[] = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];

export function HttpVerbsFromArray(verbsArray: HttpVerb[] = ALL_HTTP_VERBS): HttpVerbFlags {
  let verbs: HttpVerbFlags = 0;
  for (const verb of verbsArray) {
    if (!ALL_HTTP_VERBS.includes(verb)) {
      throw new Error(`Invalid HTTP verb '${verb}'`);
    }
    verbs = verbs | HttpVerbFlags[verb];
  }
  return verbs;
}