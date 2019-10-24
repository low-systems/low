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
  expect(await parser.parse('gobbledygook', { interperateStrings: ['yes', 'gobbledygook'] })).toBe(true);
  expect(await parser.parse('probably true yeah?', { interperateStrings: {
    regex: 'true',
    options: 'ig'
  }})).toBe(true);
  expect(await parser.parse('probably true yeah?', { interperateStrings: {
    regex: 'true'
  }})).toBe(true);
  expect(await parser.parse('probably false yeah?', { interperateStrings: {
    regex: 'true',
    options: 'ig'
  }})).toBe(false);
  expect(await parser.parse('probably not false yeah?', { interperateStrings: {
    regex: 'true|not false',
    options: 'ig'
  }})).toBe(true);
});

test('should handle invalid regular experessions properly', async () => {
  const parser = new BooleanParser();

  await expect(parser.parse('probably true yeah?', { interperateStrings: {
    regex: 'true',
    options: 'igp'
  }})).rejects.toThrow(/Invalid flags supplied to RegExp/);

  await expect(parser.parse('probably true yeah?', { interperateStrings: {
    regex: 'tr(ue',
    options: 'ig'
  }})).rejects.toThrow(/Invalid regular expression/);

  expect(await parser.parse('probably true yeah?', { interperateStrings: {
    regex: 'tr(ue',
    options: 'ig'
  }, defaultValue: true })).toBe(true);
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
  expect(await parser.parse([null, undefined], { emptyObjectsAsFalse: true })).toBe(true);
  expect(await parser.parse([null, undefined], { emptyObjectsAsFalse: true, removeObjectNullValues: true })).toBe(false);
  expect(await parser.parse({ test1: null, test2: undefined }, { emptyObjectsAsFalse: true })).toBe(true);
  expect(await parser.parse({ test1: null, test2: undefined }, { emptyObjectsAsFalse: true, removeObjectNullValues: true })).toBe(false);

  //TODO: Tests for removeObjectNullValues
});