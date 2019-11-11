import { IntegerParser } from './integer-parser';

test('should parse none strings or numbers as integers correctly', async () => {
  const parser = new IntegerParser();

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

test('should parse strings as integers correctly', async () => {
  const parser = new IntegerParser();

  expect(await parser.parse('123', {})).toBe(123);
  expect(await parser.parse('123.321', {})).toBe(123);
  expect(await parser.parse('-123.321', {})).toBe(-123);
  expect(await parser.parse('2a', { radix: 16 })).toBe(42);
  expect(await parser.parse('101010', { radix: 2 })).toBe(42);
  expect(await parser.parse('52', { radix: 8 })).toBe(42);
  expect(await parser.parse('-2a', { radix: 16 })).toBe(-42);
  expect(await parser.parse('-101010', { radix: 2 })).toBe(-42);
  expect(await parser.parse('-52', { radix: 8 })).toBe(-42);
  expect(await parser.parse('', {})).toBe(NaN);
  expect(await parser.parse('0', {})).toBe(0);
  expect(await parser.parse('test', {})).toBe(NaN);
  expect(await parser.parse('test', { defaultValue: 123 })).toBe(123);
});