import { ConnectorContext } from "./connector";
export declare class ConnectorRunError extends Error {
    context: ConnectorContext<any>;
    constructor(message: string, context: ConnectorContext<any>);
}
