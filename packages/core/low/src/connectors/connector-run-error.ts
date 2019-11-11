import { ConnectorContext } from "./connector";

export class ConnectorRunError extends Error {
  constructor(message: string, public context: ConnectorContext<any>) {
    super(message);
    Object.setPrototypeOf(this, ConnectorRunError.prototype);
  }
}