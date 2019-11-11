import { HttpVerbsFromArray, HttpVerb, HttpVerbFlags } from './http-verbs';

test('should be able to create a HTTP Verb enum from an array', () => {
  const validVerbsArray = ['GET', 'POST'];
  const invalidVerbsArray = ['GET', 'BALONEY'];

  const validVerbs = HttpVerbsFromArray(validVerbsArray as HttpVerb[]);
  expect(HttpVerbFlags.GET & validVerbs).toBeTruthy();
  expect(HttpVerbFlags.POST & validVerbs).toBeTruthy();
  expect(HttpVerbFlags.DELETE & validVerbs).toBeFalsy();

  expect(() => { HttpVerbsFromArray(invalidVerbsArray as HttpVerb[]) }).toThrow(/invalid http verb/i)
});