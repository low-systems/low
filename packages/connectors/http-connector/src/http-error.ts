export class HttpError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}