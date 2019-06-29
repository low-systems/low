import { BooleanParser } from './boolean-parser';

test('should parse numbers as booleans correctly', async () => {
  const parser = new BooleanParser();

  expect(await parser.parse(1, {})).toBe(true);
  expect(await parser.parse(0, {})).toBe(false);
  expect(await parser.parse(-1, {})).toBe(true);
  expect(await parser.parse(123, {})).toBe(true);
  expect(await parser.parse(-123, {})).toBe(true);
  expect(await parser.parse(999999999999999999999999999999, {})).toBe(true);
});

test('should parse strings as booleans correctly', async () => {
  const parser = new BooleanParser();

  expect(await parser.parse('', {})).toBe(false);
  expect(await parser.parse('test', {})).toBe(true);
  expect(await parser.parse('true', {})).toBe(true);
  expect(await parser.parse('false', {})).toBe(true);
  expect(await parser.parse('YES', {})).toBe(true);
  expect(await parser.parse('YES', { interperateStrings: true })).toBe(true);
  expect(await parser.parse('false', { interperateStrings: true })).toBe(false);
  expect(await parser.parse('gobbledygook', { interperateStrings: true })).toBe(false);
});

test('should parse booleans as booleans correctly', async () => {
  const parser = new BooleanParser();

  expect(await parser.parse(true, {})).toBe(true);
  expect(await parser.parse(false, {})).toBe(false);
});

test('should null and undefined as false', async() => {
  const parser = new BooleanParser();

  expect(await parser.parse(null, {})).toBe(false);
  expect(await parser.parse(undefined, {})).toBe(false);
});

test('should parse objects as booleans correctly', async() => {
  const parser = new BooleanParser();

  expect(await parser.parse({}, {})).toBe(true);
  expect(await parser.parse({ test: false }, {})).toBe(true);
  expect(await parser.parse([], {})).toBe(true);
  expect(await parser.parse([1, 2, 3], {})).toBe(true);
  expect(await parser.parse({}, { emptyObjectsAsFalse: true })).toBe(false);
  expect(await parser.parse({ test: false }, { emptyObjectsAsFalse: true })).toBe(true);
  expect(await parser.parse([], { emptyObjectsAsFalse: true })).toBe(false);
  expect(await parser.parse([1, 2, 3], { emptyObjectsAsFalse: true })).toBe(true);

  //TODO: Tests for removeObjectNullValues
});