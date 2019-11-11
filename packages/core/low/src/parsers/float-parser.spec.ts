import { FloatParser } from './float-parser';

test('should parse none strings or numbers as floats correctly', async () => {
  const parser = new FloatParser();

  expect(await parser.parse(true, {})).toBe(NaN);
  expect(await parser.parse(true, { defaultValue: 42 })).toBe(42);
  expect(await parser.parse(false, {})).toBe(NaN);
  expect(await parser.parse(false, { defaultValue: 42 })).toBe(42);
  expect(await parser.parse({}, {})).toBe(NaN);
  expect(await parser.parse({}, { defaultValue: 42 })).toBe(42);
  expect(await parser.parse([], {})).toBe(NaN);
  expect(await parser.parse([], { defaultValue: 42 })).toBe(42);
  expect(await parser.parse(null, {})).toBe(NaN);
  expect(await parser.parse(null, { defaultValue: 42 })).toBe(42);
  expect(await parser.parse(undefined, {})).toBe(NaN);
  expect(await parser.parse(undefined, { defaultValue: 42 })).toBe(42)
});

test('should parse strings as floats correctly', async () => {
  const parser = new FloatParser();

  expect(await parser.parse('123', {})).toBe(123);
  expect(await parser.parse('123.321', {})).toBe(123.321);
  expect(await parser.parse('-123.321', {})).toBe(-123.321);
  expect(await parser.parse('', {})).toBe(NaN);
  expect(await parser.parse('0', {})).toBe(0);
  expect(await parser.parse('test', {})).toBe(NaN);
  expect(await parser.parse('test', { defaultValue: 123 })).toBe(123);
});