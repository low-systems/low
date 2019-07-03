import { Parser } from './parser';

test('should echo inputs or default value on `null` or `undefined`', async () => {
  const parser = new Parser();

  expect(await parser.parse(true, {})).toBe(true);
  expect(await parser.parse(false, {})).toBe(false);
  expect(await parser.parse(123, {})).toBe(123);
  expect(await parser.parse(123.321, {})).toBe(123.321);
  expect(await parser.parse(0, {})).toBe(0);
  expect(await parser.parse('test', {})).toBe('test');
  expect(await parser.parse('', {})).toBe('');
  expect(await parser.parse([], {})).toStrictEqual([]);
  expect(await parser.parse([1, 2, 3], {})).toStrictEqual([1, 2, 3]);
  expect(await parser.parse({}, {})).toStrictEqual({});
  expect(await parser.parse({ test: 'It worked' }, {})).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse(null, {})).toBeNull();
  expect(await parser.parse(undefined, {})).toBeNull();
  expect(await parser.parse(true, { defaultValue: 'test' })).toBe(true);
  expect(await parser.parse(false, { defaultValue: 'test' })).toBe(false);
  expect(await parser.parse(123, { defaultValue: 'test' })).toBe(123);
  expect(await parser.parse(123.321, { defaultValue: 'test' })).toBe(123.321);
  expect(await parser.parse(0, { defaultValue: 'test' })).toBe(0);
  expect(await parser.parse('test', { defaultValue: 'other' })).toBe('test');
  expect(await parser.parse('', { defaultValue: 'test' })).toBe('');
  expect(await parser.parse([], { defaultValue: 'test' })).toStrictEqual([]);
  expect(await parser.parse([1, 2, 3], { defaultValue: 'test' })).toStrictEqual([1, 2, 3]);
  expect(await parser.parse({}, { defaultValue: 'test' })).toStrictEqual({});
  expect(await parser.parse({ test: 'It worked' }, { defaultValue: 'test' })).toStrictEqual({ test: 'It worked' });
  expect(await parser.parse(null, { defaultValue: 'test' })).toBe('test');
  expect(await parser.parse(undefined, { defaultValue: 'test' })).toBe('test');
});