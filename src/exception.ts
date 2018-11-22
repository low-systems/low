export class Exception extends Error {
  innerError: Error | null;
  metaData: any | null;
  constructor(message: string, innerError?: Error, metaData?: any) {
    super(message);
    this.innerError = innerError || null; 
    this.metaData = metaData || null;
    Object.setPrototypeOf(this, Exception.prototype);
  }
}