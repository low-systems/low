import { HttpError } from './http-error'

test('should be able to create an instance of HttpError', () => {
  const errorWithStatus = new HttpError('I have a status of 404', 404);
  expect(errorWithStatus.message).toBe('I have a status of 404');
  expect(errorWithStatus.statusCode).toBe(404);

  const errorWithoutStatus = new HttpError('I have a status of 500');
  expect(errorWithoutStatus.message).toBe('I have a status of 500');
  expect(errorWithoutStatus.statusCode).toBe(500);
});