export declare class Exception extends Error {
    innerError: Error | null;
    metaData: any | null;
    constructor(message: string, innerError?: Error, metaData?: any);
}
