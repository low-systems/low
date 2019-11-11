import { JsonParser } from './json-parser';

test('should parse valid number strings to numbers', async () => {
  const parser = new JsonParser();

  expect(await parser.parse('123', {})).toBe(123);
  expect(await parser.parse('-123', {})).toBe(-123);
  expect(await parser.parse('123.321', {})).toBe(123.321);
  expect(await parser.parse('1e4', {})).toBe(10000);
});

test('should parse properly quoted strings to strings', async () => {
  const parser = new JsonParser();

  expect(await parser.parse('"test"', {})).toBe('test');
  expect(await parser.parse('"test \\"string\\""', {})).toBe('test "string"');
});

test('should handle or throw errors when parsing improperly quoted strings', async () => {
  const parser = new JsonParser();

  await expect(parser.parse("'test'", {})).rejects.toThrow(/Unexpected token '/);
  expect(await parser.parse("'test'", { defaultValue: 'It worked' })).toBe('It worked');
});

test('should parse boolean strings to booleans', async () => {
  const parser = new JsonParser();

  expect(await parser.parse('true', {})).toBe(true);
  expect(await parser.parse('false', {})).toBe(false);
});

test('should parse properly formed array strings to arrays', async () => {
  const parser = new JsonParser();

  expect(await parser.parse('[]', {})).toStrictEqual([]);
  expect(await parser.parse('[1, 2, 3]', {})).toStrictEqual([1, 2, 3]);
  expect(await parser.parse('["It", "worked", 123.321, null]', {})).toStrictEqual(['It', 'worked', 123.321, null]);
});

test('should handle or throw errors when parsing improperly formed array strings', async () => {
    const parser = new JsonParser();

    await expect(parser.parse('[1, 2, 3,]', {})).rejects.toThrow(/Unexpected token \]/);
    await expect(parser.parse('[1, , 2, 3]', {})).rejects.toThrow(/Unexpected token ,/);
    await expect(parser.parse('[1 2, 3]', {})).rejects.toThrow(/Unexpected number in JSON/);
    expect(await parser.parse('[1, 2, 3,]', { defaultValue: [1, 2, 3] })).toStrictEqual([1, 2, 3]);
    expect(await parser.parse('[1, , 2, 3]', { defaultValue: [1, 2, 3] })).toStrictEqual([1, 2, 3]);
    expect(await parser.parse('[1 2, 3]', { defaultValue: [1, 2, 3] })).toStrictEqual([1, 2, 3]);
});

test('should parse properly formed object strings to objects', async () => {
  const parser = new JsonParser();

  expect(await parser.parse('{ "test": "It worked" }', {})).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse('{ "test": "It worked", "arr": [1, 2, 3] }', {})).toStrictEqual({ test: 'It worked', arr: [1, 2, 3] });
});

test('should handle or throw errors when parsing improperly formed object strings', async () => {
  const parser = new JsonParser();

  await expect(parser.parse("{ 'test': 'It worked' }", {})).rejects.toThrow(/Unexpected token '/);
  await expect(parser.parse('{ "test": "It worked" "arr": [1, 2, 3] }', {})).rejects.toThrow(/Unexpected string in JSON/);
  await expect(parser.parse('{ "test" "It worked", "arr": [1, 2, 3] }', {})).rejects.toThrow(/Unexpected string in JSON/);
  await expect(parser.parse('{ "test": "It worked", "arr": [1, 2, 3], 123 }', {})).rejects.toThrow(/Unexpected number in JSON/);
  expect(await parser.parse("{ 'test': 'It worked' }", { defaultValue: { test: 'It worked' } })).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse('{ "test": "It worked" "arr": [1, 2, 3] }', { defaultValue: { test: 'It worked' } })).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse('{ "test" "It worked", "arr": [1, 2, 3] }', { defaultValue: { test: 'It worked' } })).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse('{ "test": "It worked", "arr": [1, 2, 3], 123 }', { defaultValue: { test: 'It worked' } })).toStrictEqual({ test: 'It worked' });
});

test('should parse null strings as nulls or can default to nulls', async () => {
  const parser = new JsonParser();

  expect(await parser.parse('null', {})).toBeNull();
  expect(await parser.parse('naughty json', { defaultValue: null })).toBeNull();
});

test('should handle or throw errors when parsing undefined strings', async () => {
  const parser = new JsonParser();

  await expect(parser.parse('undefined', {})).rejects.toThrow(/Unexpected token u/);
  await expect(parser.parse('', {})).rejects.toThrow(/Unexpected end of JSON/);
  expect(await parser.parse('undefined', { defaultValue: undefined })).toBeUndefined();
});

test('should echo non string inputs', async () => {
  const parser = new JsonParser();

  expect(await parser.parse(true, {})).toBe(true);
  expect(await parser.parse(false, {})).toBe(false);
  expect(await parser.parse(123, {})).toBe(123);
  expect(await parser.parse(123.321, {})).toBe(123.321);
  expect(await parser.parse(null, {})).toBeNull();
  expect(await parser.parse(undefined, {})).toBeUndefined();
  expect(await parser.parse({ test: 'It worked' }, {})).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse([1, 2, 3], {})).toStrictEqual([1, 2, 3]);
});